/**
 * Proxy Service for API Gateway
 * Handles service routing and load balancing
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const { logger } = require("../utils/logger");
const axios = require('axios');
const CircuitBreaker = require('./CircuitBreaker');
const { getApiGatewayDB } = require('../config/database');
const config = require('../config');

class ProxyService {
  constructor() {
    this.db = null; // Will be initialized later
    this.serviceRoutes = new Map();
    this.circuitBreakers = new Map();
    this.healthCheckers = new Map();
    this.loadBalancers = new Map();
    this.initialized = false;
  }

  // Initialize the service after database is ready
  async initialize() {
    if (this.initialized) return;

    this.db = getApiGatewayDB();
    if (this.db) {
      await this.initializeRoutes();
      this.startHealthChecks();
      this.initialized = true;
    }
  }

  /**
   * Initialize service routes from database
   */
  async initializeRoutes() {
    try {
      if (!this.db) {
        logger.warn('Database not initialized, skipping route initialization');
        return;
      }

      const routes = await this.db('service_routes')
        .where({ is_active: true })
        .orderBy('priority', 'desc');

      for (const route of routes) {
        await this.registerRoute(route);
      }

      logger.info(`✅ Initialized ${routes.length} service routes`);
    } catch (error) {
      logger.error('❌ Failed to initialize routes:', error);
    }
  }

  /**
   * Register a service route
   */
  async registerRoute(routeConfig) {
    const {
      route_id,
      path_pattern,
      http_method,
      service_name,
      upstream_url,
      upstream_servers,
      load_balancer_type,
      circuit_breaker_enabled,
      failure_threshold,
      recovery_timeout,
      timeout_seconds,
      retry_attempts,
      cache_enabled,
      cache_ttl_seconds
    } = routeConfig;

    try {
      // Parse upstream servers
      const servers = JSON.parse(upstream_servers || '[]');

      // Create load balancer
      const loadBalancer = new LoadBalancer(
        servers.length > 0 ? servers : [{ url: upstream_url, weight: 1 }],
        load_balancer_type
      );
      this.loadBalancers.set(route_id, loadBalancer);

      // Create circuit breaker if enabled
      if (circuit_breaker_enabled) {
        const circuitBreaker = new CircuitBreaker({
          failureThreshold: failure_threshold || 5,
          recoveryTimeout: recovery_timeout || 60000,
          monitoringPeriod: 60000
        });
        this.circuitBreakers.set(route_id, circuitBreaker);
      }

      // Create proxy middleware
      const proxyOptions = {
        target: upstream_url,
        changeOrigin: true,
        timeout: (timeout_seconds || 30) * 1000,
        retries: retry_attempts || 3,
        pathRewrite: this.createPathRewriter(path_pattern),

        onProxyReq: (proxyReq, req, res) => {
          this.onProxyRequest(proxyReq, req, res, routeConfig);
        },

        onProxyRes: (proxyRes, req, res) => {
          this.onProxyResponse(proxyRes, req, res, routeConfig);
        },

        onError: (err, req, res) => {
          this.onProxyError(err, req, res, routeConfig);
        },

        router: (req) => {
          return this.routeRequest(req, route_id);
        }
      };

      const proxy = createProxyMiddleware(proxyOptions);

      // Store route configuration
      this.serviceRoutes.set(route_id, {
        ...routeConfig,
        proxy,
        loadBalancer,
        servers: servers.length > 0 ? servers : [{ url: upstream_url, weight: 1, healthy: true }]
      });

      logger.info(`✅ Registered route: ${http_method} ${path_pattern} -> ${service_name}`);

    } catch (error) {
      logger.error(`❌ Failed to register route ${route_id}:`, error);
    }
  }

  /**
   * Create Express middleware for service routing
   */
  createRoutingMiddleware() {
    return async (req, res, next) => {
      try {
        const route = await this.findMatchingRoute(req);

        if (!route) {
          return next(); // No matching route, continue to next middleware
        }

        // Check circuit breaker
        const circuitBreaker = this.circuitBreakers.get(route.route_id);
        if (circuitBreaker && circuitBreaker.isOpen()) {
          return res.status(503).json({
            success: false,
            error: 'Service temporarily unavailable',
            code: 'CIRCUIT_BREAKER_OPEN',
            service: route.service_name
          });
        }

        // Check cache if enabled
        if (route.cache_enabled && req.method === 'GET') {
          const cachedResponse = await this.getCachedResponse(req, route);
          if (cachedResponse) {
            res.set('X-Cache', 'HIT');
            return res.json(cachedResponse);
          }
        }

        // Set route information on request
        req.route = route;
        req.routeId = route.route_id;
        req.serviceName = route.service_name;

        // Apply the proxy middleware
        route.proxy(req, res, next);

      } catch (error) {
        logger.error('Routing middleware error:', error);
        res.status(500).json({
          success: false,
          error: 'Service routing error',
          code: 'ROUTING_ERROR'
        });
      }
    };
  }

  /**
   * Find matching route for request
   */
  async findMatchingRoute(req) {
    const { method, path } = req;

    for (const [routeId, route] of this.serviceRoutes) {
      if (route.http_method.toLowerCase() !== method.toLowerCase()) {
        continue;
      }

      if (this.matchPath(path, route.path_pattern)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Match request path against route pattern
   */
  matchPath(requestPath, routePattern) {
    // Convert route pattern to regex
    // e.g., '/api/v1/customers/{id}' -> '/api/v1/customers/([^/]+)'
    const regexPattern = routePattern
      .replace(/\{[^}]+\}/g, '([^/]+)')
      .replace(/\*/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(requestPath);
  }

  /**
   * Route request to appropriate server
   */
  routeRequest(req, routeId) {
    const loadBalancer = this.loadBalancers.get(routeId);
    if (!loadBalancer) {
      return null;
    }

    const server = loadBalancer.getNextServer();
    return server ? server.url : null;
  }

  /**
   * Create path rewriter function
   */
  createPathRewriter(pathPattern) {
    return (path, req) => {
      // Extract parameters from path pattern
      const params = this.extractPathParams(path, pathPattern);

      // Rewrite path based on upstream requirements
      // This can be customized per service
      return path.replace('/api/v1', ''); // Remove API version prefix
    };
  }

  /**
   * Extract path parameters
   */
  extractPathParams(requestPath, routePattern) {
    const patternParts = routePattern.split('/');
    const pathParts = requestPath.split('/');
    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      if (patternPart.startsWith('{') && patternPart.endsWith('}')) {
        const paramName = patternPart.slice(1, -1);
        params[paramName] = pathParts[i];
      }
    }

    return params;
  }

  /**
   * Handle proxy request
   */
  onProxyRequest(proxyReq, req, res, routeConfig) {
    // Add authentication headers for upstream services
    this.addUpstreamAuth(proxyReq, routeConfig.service_name);

    // Add request tracking headers
    proxyReq.setHeader('X-Request-ID', req.requestId);
    proxyReq.setHeader('X-Original-Host', req.headers.host);
    proxyReq.setHeader('X-Forwarded-For', req.ip);
    proxyReq.setHeader('X-Gateway-Service', 'harsha-delights-api-gateway');

    // Add user context if available
    if (req.user) {
      proxyReq.setHeader('X-User-ID', req.user.userId);
      proxyReq.setHeader('X-User-Role', req.user.role);
      proxyReq.setHeader('X-User-Type', req.user.userType);
    }

    logger.info(`🔄 Proxying request: ${req.method} ${req.path} -> ${routeConfig.service_name}`);
  }

  /**
   * Handle proxy response
   */
  async onProxyResponse(proxyRes, req, res, routeConfig) {
    const route = this.serviceRoutes.get(routeConfig.route_id);

    // Update circuit breaker
    const circuitBreaker = this.circuitBreakers.get(routeConfig.route_id);
    if (circuitBreaker) {
      if (proxyRes.statusCode >= 500) {
        circuitBreaker.recordFailure();
      } else {
        circuitBreaker.recordSuccess();
      }
    }

    // Update load balancer health
    if (route && route.loadBalancer) {
      const server = route.loadBalancer.getCurrentServer();
      if (server) {
        server.healthy = proxyRes.statusCode < 500;
        if (!server.healthy) {
          route.loadBalancer.markServerUnhealthy(server);
        }
      }
    }

    // Cache response if enabled
    if (routeConfig.cache_enabled && req.method === 'GET' && proxyRes.statusCode === 200) {
      await this.cacheResponse(req, proxyRes, routeConfig);
    }

    // Add response headers
    res.set('X-Service', routeConfig.service_name);
    res.set('X-Route-ID', routeConfig.route_id);

    logger.info(`✅ Proxy response: ${proxyRes.statusCode} from ${routeConfig.service_name}`);
  }

  /**
   * Handle proxy errors
   */
  onProxyError(error, req, res, routeConfig) {
    logger.error(`❌ Proxy error for ${routeConfig.service_name}:`, error.message);

    // Update circuit breaker
    const circuitBreaker = this.circuitBreakers.get(routeConfig.route_id);
    if (circuitBreaker) {
      circuitBreaker.recordFailure();
    }

    // Update load balancer
    const route = this.serviceRoutes.get(routeConfig.route_id);
    if (route && route.loadBalancer) {
      const server = route.loadBalancer.getCurrentServer();
      if (server) {
        route.loadBalancer.markServerUnhealthy(server);
      }
    }

    // Return appropriate error response
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        error: 'Bad Gateway',
        code: 'PROXY_ERROR',
        service: routeConfig.service_name,
        message: 'The upstream service is currently unavailable'
      });
    }
  }

  /**
   * Add upstream authentication
   */
  addUpstreamAuth(proxyReq, serviceName) {
    switch (serviceName) {
      case 'erpnext':
        if (config.services.erpNext.apiKey) {
          proxyReq.setHeader('Authorization', `token ${config.services.erpNext.apiKey}:${config.services.erpNext.apiSecret}`);
        }
        break;

      case 'medusa':
        if (config.services.medusa.apiKey) {
          proxyReq.setHeader('Authorization', `Bearer ${config.services.medusa.apiKey}`);
        }
        break;

      case 'espocrm':
        if (config.services.espoCrm.apiKey) {
          proxyReq.setHeader('X-Api-Key', config.services.espoCrm.apiKey);
        }
        break;
    }
  }

  /**
   * Get cached response
   */
  async getCachedResponse(req, route) {
    try {
      const cacheKey = this.generateCacheKey(req, route);
      const redisManager = require('../config/redis');
      return await redisManager.get(cacheKey);
    } catch (error) {
      logger.error('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Cache response
   */
  async cacheResponse(req, proxyRes, route) {
    try {
      const cacheKey = this.generateCacheKey(req, route);
      const ttl = route.cache_ttl_seconds || 300; // 5 minutes default

      let responseData = '';
      proxyRes.on('data', (chunk) => {
        responseData += chunk;
      });

      proxyRes.on('end', async () => {
        try {
          const parsedData = JSON.parse(responseData);
          const redisManager = require('../config/redis');
          await redisManager.set(cacheKey, parsedData, ttl);
        } catch (error) {
          logger.error('Cache storage error:', error);
        }
      });
    } catch (error) {
      logger.error('Cache response error:', error);
    }
  }

  /**
   * Generate cache key
   */
  generateCacheKey(req, route) {
    const baseKey = `cache:${route.service_name}:${req.method}:${req.path}`;
    const queryString = new URLSearchParams(req.query).toString();
    return queryString ? `${baseKey}:${queryString}` : baseKey;
  }

  /**
   * Start health checks for all services
   */
  startHealthChecks() {
    const interval = config.healthCheck.interval || 30000;

    setInterval(async () => {
      for (const [routeId, route] of this.serviceRoutes) {
        await this.performHealthCheck(routeId, route);
      }
    }, interval);

    logger.info(`✅ Started health checks with ${interval}ms interval`);
  }

  /**
   * Perform health check for a service
   */
  async performHealthCheck(routeId, route) {
    const healthCheckUrl = route.health_check_url || `${route.upstream_url}/health`;
    const timeout = config.healthCheck.timeout || 5000;

    for (const server of route.servers) {
      try {
        const response = await axios.get(`${server.url}/health`, {
          timeout,
          validateStatus: (status) => status < 500
        });

        const isHealthy = response.status >= 200 && response.status < 300;
        const responseTime = response.headers['x-response-time'] || 0;

        // Update server health status
        server.healthy = isHealthy;
        server.lastHealthCheck = new Date();
        server.responseTime = responseTime;

        // Log health check result
        await this.logHealthCheck(route.service_name, server.url, {
          status: isHealthy ? 'healthy' : 'unhealthy',
          responseTime: parseInt(responseTime),
          statusCode: response.status
        });

      } catch (error) {
        server.healthy = false;
        server.lastHealthCheck = new Date();
        server.responseTime = timeout;

        await this.logHealthCheck(route.service_name, server.url, {
          status: 'unhealthy',
          responseTime: timeout,
          error: error.message
        });

        logger.warn(`❌ Health check failed for ${route.service_name} (${server.url}): ${error.message}`);
      }
    }
  }

  /**
   * Log health check results
   */
  async logHealthCheck(serviceName, serverUrl, result) {
    try {
      await this.db('service_health').insert({
        service_name: serviceName,
        server_url: serverUrl,
        status: result.status,
        response_time_ms: result.responseTime,
        error_message: result.error || null,
        check_timestamp: new Date(),
        check_type: 'automatic'
      });
    } catch (error) {
      logger.error('Health check logging error:', error);
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(serviceName = null) {
    let query = this.db('service_health')
      .select([
        'service_name',
        'server_url',
        'status',
        'response_time_ms',
        'error_message',
        'check_timestamp'
      ])
      .orderBy('check_timestamp', 'desc');

    if (serviceName) {
      query = query.where('service_name', serviceName);
    }

    const healthChecks = await query.limit(100);

    // Group by service and server
    const serviceHealth = {};
    for (const check of healthChecks) {
      if (!serviceHealth[check.service_name]) {
        serviceHealth[check.service_name] = {};
      }
      if (!serviceHealth[check.service_name][check.server_url]) {
        serviceHealth[check.service_name][check.server_url] = check;
      }
    }

    return serviceHealth;
  }

  /**
   * Reload routes from database
   */
  async reloadRoutes() {
    this.serviceRoutes.clear();
    this.circuitBreakers.clear();
    this.loadBalancers.clear();

    await this.initializeRoutes();
    logger.info('✅ Routes reloaded from database');
  }

  /**
   * Get route statistics
   */
  getRouteStats() {
    const stats = {
      totalRoutes: this.serviceRoutes.size,
      activeCircuitBreakers: 0,
      openCircuitBreakers: 0,
      healthyServices: 0,
      unhealthyServices: 0
    };

    for (const [routeId, circuitBreaker] of this.circuitBreakers) {
      stats.activeCircuitBreakers++;
      if (circuitBreaker.isOpen()) {
        stats.openCircuitBreakers++;
      }
    }

    for (const [routeId, route] of this.serviceRoutes) {
      const healthyServers = route.servers.filter(s => s.healthy).length;
      if (healthyServers > 0) {
        stats.healthyServices++;
      } else {
        stats.unhealthyServices++;
      }
    }

    return stats;
  }
}

/**
 * Load Balancer Class
 * Implements different load balancing strategies
 */
class LoadBalancer {
  constructor(servers, strategy = 'round_robin') {
    this.servers = servers.map(server => ({
      ...server,
      healthy: true,
      currentConnections: 0,
      totalRequests: 0
    }));
    this.strategy = strategy;
    this.currentIndex = 0;
  }

  getNextServer() {
    const healthyServers = this.servers.filter(s => s.healthy);

    if (healthyServers.length === 0) {
      return null;
    }

    let server;

    switch (this.strategy) {
      case 'weighted':
        server = this.getWeightedServer(healthyServers);
        break;
      case 'least_connections':
        server = this.getLeastConnectionsServer(healthyServers);
        break;
      case 'round_robin':
      default:
        server = this.getRoundRobinServer(healthyServers);
        break;
    }

    if (server) {
      server.currentConnections++;
      server.totalRequests++;
    }

    return server;
  }

  getRoundRobinServer(servers) {
    const server = servers[this.currentIndex % servers.length];
    this.currentIndex++;
    return server;
  }

  getWeightedServer(servers) {
    const totalWeight = servers.reduce((sum, server) => sum + (server.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const server of servers) {
      random -= (server.weight || 1);
      if (random <= 0) {
        return server;
      }
    }

    return servers[0];
  }

  getLeastConnectionsServer(servers) {
    return servers.reduce((min, server) =>
      server.currentConnections < min.currentConnections ? server : min
    );
  }

  getCurrentServer() {
    return this.servers[this.currentIndex % this.servers.length];
  }

  markServerUnhealthy(server) {
    server.healthy = false;
    setTimeout(() => {
      server.healthy = true; // Auto-recovery after timeout
    }, 60000); // 1 minute
  }

  releaseConnection(server) {
    if (server && server.currentConnections > 0) {
      server.currentConnections--;
    }
  }
}

module.exports = ProxyService;

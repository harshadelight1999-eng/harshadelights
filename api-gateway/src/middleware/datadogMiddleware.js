/**
 * DataDog APM Integration
 * Provides comprehensive application performance monitoring
 */

const tracer = require('dd-trace').init({
  service: 'harsha-delights-api-gateway',
  env: process.env.NODE_ENV || 'development',
  version: process.env.APP_VERSION || '1.0.0',

  // Distributed tracing configuration
  analytics: true,
  runtimeMetrics: true,
  profiling: true,

  // Sampling configuration
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Integration configuration
  plugins: {
    http: {
      blocklist: ['/health', '/metrics', '/favicon.ico'],
      headers: ['user-agent', 'x-forwarded-for']
    },
    express: {
      hooks: {
        request: (span, req) => {
          // Add custom tags
          span.setTag('user.id', req.user?.id);
          span.setTag('user.role', req.user?.role);
          span.setTag('request.id', req.requestId);
          span.setTag('api.version', 'v1');

          if (req.apiKey) {
            span.setTag('api.key.id', req.apiKey.keyId);
          }

          if (req.serviceName) {
            span.setTag('target.service', req.serviceName);
          }
        }
      }
    },
    postgres: {
      service: 'harsha-postgres',
      analytics: true
    },
    redis: {
      service: 'harsha-redis',
      analytics: true
    },
    http2: false // Disable if not using HTTP/2
  },

  // Log injection
  logInjection: true,

  // Tags to apply to all spans
  tags: {
    'service.type': 'api-gateway',
    'service.tier': 'backend',
    'deployment.environment': process.env.NODE_ENV || 'development'
  }
});

const { logger } = require('../utils/logger');
const client = require('prom-client');

/**
 * Custom metrics registry
 */
const register = new client.Registry();

// Default Node.js metrics
client.collectDefaultMetrics({ register });

// Custom business metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'user_role'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'user_role']
});

const authenticationAttempts = new client.Counter({
  name: 'authentication_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['result', 'method']
});

const proxyRequests = new client.Counter({
  name: 'proxy_requests_total',
  help: 'Total proxy requests to backend services',
  labelNames: ['service', 'status_code', 'result']
});

const circuitBreakerState = new client.Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=open, 0.5=half-open)',
  labelNames: ['service']
});

const rateLimitHits = new client.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total rate limit violations',
  labelNames: ['identifier_type', 'endpoint']
});

const databaseConnections = new client.Gauge({
  name: 'database_connections_active',
  help: 'Active database connections',
  labelNames: ['database_type']
});

const businessMetrics = new client.Counter({
  name: 'business_events_total',
  help: 'Total business events',
  labelNames: ['event_type', 'application']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(authenticationAttempts);
register.registerMetric(proxyRequests);
register.registerMetric(circuitBreakerState);
register.registerMetric(rateLimitHits);
register.registerMetric(databaseConnections);
register.registerMetric(businessMetrics);

/**
 * DataDog middleware for request tracking
 */
function datadogMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    const span = tracer.scope().active();

    // Add request context to span
    if (span) {
      span.setTag('http.method', req.method);
      span.setTag('http.url', req.originalUrl);
      span.setTag('http.route', req.route?.path || req.path);
      span.setTag('request.id', req.requestId);

      if (req.user) {
        span.setTag('user.id', req.user.id);
        span.setTag('user.role', req.user.role);
        span.setTag('user.organization', req.user.organization_id);
      }

      if (req.apiKey) {
        span.setTag('api.key.id', req.apiKey.keyId);
        span.setTag('api.key.name', req.apiKey.name);
      }
    }

    // Track response
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const route = req.route?.path || req.path;
      const userRole = req.user?.role || 'anonymous';

      // Update Prometheus metrics
      httpRequestDuration
        .labels(req.method, route, res.statusCode.toString(), userRole)
        .observe(duration);

      httpRequestTotal
        .labels(req.method, route, res.statusCode.toString(), userRole)
        .inc();

      // Update DataDog span
      if (span) {
        span.setTag('http.status_code', res.statusCode);
        span.setTag('http.response_time', duration);

        if (res.statusCode >= 400) {
          span.setTag('error', true);
          span.setTag('error.type', 'http_error');
        }
      }

      // Log performance metrics
      logger.logPerformance('http_request_duration', duration, 'seconds', {
        method: req.method,
        route,
        statusCode: res.statusCode,
        userRole
      });
    });

    next();
  };
}

/**
 * Track authentication attempts
 */
function trackAuthentication(result, method = 'password') {
  authenticationAttempts.labels(result, method).inc();

  tracer.scope().activate(tracer.startSpan('authentication'), () => {
    const span = tracer.scope().active();
    span.setTag('auth.result', result);
    span.setTag('auth.method', method);
    span.finish();
  });
}

/**
 * Track proxy requests
 */
function trackProxyRequest(serviceName, statusCode, result = 'success') {
  proxyRequests.labels(serviceName, statusCode.toString(), result).inc();

  const span = tracer.startSpan('proxy.request');
  span.setTag('proxy.service', serviceName);
  span.setTag('proxy.status_code', statusCode);
  span.setTag('proxy.result', result);
  span.finish();
}

/**
 * Track circuit breaker state
 */
function trackCircuitBreakerState(serviceName, state) {
  const stateValue = state === 'open' ? 1 : state === 'half-open' ? 0.5 : 0;
  circuitBreakerState.labels(serviceName).set(stateValue);

  const span = tracer.startSpan('circuit_breaker.state_change');
  span.setTag('circuit_breaker.service', serviceName);
  span.setTag('circuit_breaker.state', state);
  span.finish();
}

/**
 * Track rate limit violations
 */
function trackRateLimit(identifierType, endpoint) {
  rateLimitHits.labels(identifierType, endpoint).inc();

  const span = tracer.startSpan('rate_limit.violation');
  span.setTag('rate_limit.identifier_type', identifierType);
  span.setTag('rate_limit.endpoint', endpoint);
  span.finish();
}

/**
 * Track database connections
 */
function trackDatabaseConnections(databaseType, activeConnections) {
  databaseConnections.labels(databaseType).set(activeConnections);
}

/**
 * Track business events
 */
function trackBusinessEvent(eventType, application = 'api-gateway', metadata = {}) {
  businessMetrics.labels(eventType, application).inc();

  const span = tracer.startSpan('business.event');
  span.setTag('business.event_type', eventType);
  span.setTag('business.application', application);

  Object.keys(metadata).forEach(key => {
    span.setTag(`business.${key}`, metadata[key]);
  });

  span.finish();
}

/**
 * Create custom span for operations
 */
function createCustomSpan(operationName, tags = {}) {
  const span = tracer.startSpan(operationName);

  Object.keys(tags).forEach(key => {
    span.setTag(key, tags[key]);
  });

  return {
    span,
    finish: (additionalTags = {}) => {
      Object.keys(additionalTags).forEach(key => {
        span.setTag(key, additionalTags[key]);
      });
      span.finish();
    },
    setError: (error) => {
      span.setTag('error', true);
      span.setTag('error.message', error.message);
      span.setTag('error.type', error.constructor.name);
      if (error.stack) {
        span.setTag('error.stack', error.stack);
      }
    }
  };
}

/**
 * Middleware to inject trace ID into requests
 */
function injectTraceId() {
  return (req, res, next) => {
    const span = tracer.scope().active();
    if (span) {
      const traceId = span.context().toTraceId();
      const spanId = span.context().toSpanId();

      req.traceId = traceId;
      req.spanId = spanId;

      // Add to response headers for client correlation
      res.set('X-Trace-Id', traceId);
    }

    next();
  };
}

/**
 * Get metrics endpoint handler
 */
function getMetrics() {
  return async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate metrics' });
    }
  };
}

/**
 * Health check for DataDog integration
 */
function healthCheck() {
  try {
    const activeSpan = tracer.scope().active();
    return {
      status: 'healthy',
      tracer: {
        enabled: true,
        activeSpan: !!activeSpan,
        service: tracer._service
      },
      metrics: {
        registered: register.getMetricsAsArray().length
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Custom business metrics helpers
 */
const BusinessMetrics = {
  // User registration metrics
  trackUserRegistration: (applicationContext, userRole) => {
    trackBusinessEvent('user_registration', applicationContext, { userRole });
  },

  // Order metrics
  trackOrder: (orderId, amount, currency, customerId) => {
    trackBusinessEvent('order_created', 'ecommerce', {
      orderId,
      amount,
      currency,
      customerId
    });
  },

  // Product view metrics
  trackProductView: (productId, categoryId, userId) => {
    trackBusinessEvent('product_viewed', 'frontend', {
      productId,
      categoryId,
      userId
    });
  },

  // Payment metrics
  trackPayment: (paymentId, method, status, amount) => {
    trackBusinessEvent('payment_processed', 'payment', {
      paymentId,
      method,
      status,
      amount
    });
  },

  // API usage metrics
  trackApiUsage: (endpoint, apiKeyId, responseTime) => {
    trackBusinessEvent('api_usage', 'api-gateway', {
      endpoint,
      apiKeyId,
      responseTime
    });
  }
};

module.exports = {
  tracer,
  datadogMiddleware,
  injectTraceId,
  trackAuthentication,
  trackProxyRequest,
  trackCircuitBreakerState,
  trackRateLimit,
  trackDatabaseConnections,
  trackBusinessEvent,
  createCustomSpan,
  getMetrics,
  healthCheck,
  BusinessMetrics,
  register
};
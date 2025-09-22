/**
 * Main Routes Index for API Gateway
 * Centralizes all route definitions and middleware
 */

const express = require('express');
const { logger } = require("../utils/logger");
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const proxyRoutes = require('./proxy');

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const securityMiddleware = require('../middleware/securityMiddleware');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: X-API-Key
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication information is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *               code:
 *                 type: string
 *
 *     ForbiddenError:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *               code:
 *                 type: string
 *
 *     RateLimitError:
 *       description: Rate limit exceeded
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *               code:
 *                 type: string
 *               retryAfter:
 *                 type: integer
 *
 *     ValidationError:
 *       description: Request validation failed
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: string
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Gateway root endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API Gateway information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 service:
 *                   type: string
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     authentication:
 *                       type: string
 *                     admin:
 *                       type: string
 *                     documentation:
 *                       type: string
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Harsha Delights API Gateway',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      authentication: '/api/v1/auth',
      admin: '/api/v1/admin',
      documentation: '/api/docs',
      health: '/health'
    },
    features: [
      'JWT Authentication',
      'API Key Management',
      'Rate Limiting',
      'Service Proxy',
      'Circuit Breaker',
      'Health Monitoring',
      'Audit Logging'
    ]
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Gateway health check
 *     tags: [Health Check]
 *     responses:
 *       200:
 *         description: Gateway is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                     redis:
 *                       type: string
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                     total:
 *                       type: number
 *                     percentage:
 *                       type: number
 *       503:
 *         description: Gateway is unhealthy
 */
router.get('/health', async (req, res) => {
  try {
    const { getApiGatewayDB } = require('../config/database');
    const redisManager = require('../config/redis');

    // Check database connectivity
    let dbStatus = 'healthy';
    try {
      await getApiGatewayDB().raw('SELECT 1');
    } catch (error) {
      dbStatus = 'unhealthy';
      logger.error('Database health check failed:', error.message);
    }

    // Check Redis connectivity
    let redisStatus = 'healthy';
    try {
      const pingResult = await redisManager.ping();
      if (!pingResult) {
        redisStatus = 'degraded'; // Redis is not available but gateway can work without it
      }
    } catch (error) {
      redisStatus = 'degraded';
      logger.error('Redis health check failed:', error.message);
    }

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryMB = {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
    };

    const health = {
      success: true,
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        redis: redisStatus
      },
      memory: memoryMB,
      nodeVersion: process.version
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Gateway metrics
 *     tags: [Monitoring]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Gateway metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 metrics:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/metrics',
  authMiddleware.authenticate(),
  authMiddleware.requireRoles('administrator', 'manager'),
  async (req, res) => {
    try {
      const ProxyService = require('../services/ProxyService');
      const proxyService = new ProxyService();

      // Get basic metrics
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        routes: proxyService.getRouteStats(),
        // Add more metrics as needed
        requests: {
          total: 0, // This would come from audit logs
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        }
      };

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        metrics
      });

    } catch (error) {
      logger.error('Metrics endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics'
      });
    }
  }
);

// API versioned routes
const v1Router = express.Router();

// Apply common middleware to all v1 routes
v1Router.use(authMiddleware.setAuthContext());

// Authentication routes (public)
v1Router.use('/auth', authRoutes);

// Admin routes (protected)
v1Router.use('/admin',
  authMiddleware.authenticate(),
  authMiddleware.requireRoles('administrator'),
  adminRoutes
);

// Service proxy routes (protected, comes last to catch all other routes)
v1Router.use('/',
  authMiddleware.authenticate(), // Require authentication for all proxied requests
  rateLimitMiddleware.authenticatedRateLimit(),
  rateLimitMiddleware.apiKeyRateLimit(),
  proxyRoutes
);

// Mount v1 routes
router.use('/api/v1', v1Router);

// Error handling for unmatched routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path,
    method: req.method,
    availableEndpoints: {
      root: '/',
      health: '/health',
      metrics: '/metrics',
      authentication: '/api/v1/auth',
      admin: '/api/v1/admin',
      documentation: '/api/docs'
    }
  });
});

// Global error handler
router.use((error, req, res, next) => {
  logger.error('Global error handler:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.details || error.message
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      code: 'UNAUTHORIZED_ERROR'
    });
  }

  if (error.code === 'CIRCUIT_BREAKER_OPEN') {
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'CIRCUIT_BREAKER_OPEN',
      retryAfter: 60
    });
  }

  // Default internal server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    requestId: req.requestId
  });
});

module.exports = router;

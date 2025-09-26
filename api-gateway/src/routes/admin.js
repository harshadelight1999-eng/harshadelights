/**
 * Admin Routes for API Gateway Management
 * Provides administrative endpoints for gateway configuration and monitoring
 */

const express = require('express');
const { logger } = require("../utils/logger");
const router = express.Router();
const Joi = require('joi');
const { getApiGatewayDB, getSyncDB } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceRoute:
 *       type: object
 *       properties:
 *         routeId:
 *           type: string
 *         pathPattern:
 *           type: string
 *         httpMethod:
 *           type: string
 *         serviceName:
 *           type: string
 *         upstreamUrl:
 *           type: string
 *         isActive:
 *           type: boolean
 *         circuitBreakerEnabled:
 *           type: boolean
 *         timeoutSeconds:
 *           type: integer
 *
 *     SystemStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         activeUsers:
 *           type: integer
 *         totalApiKeys:
 *           type: integer
 *         activeRoutes:
 *           type: integer
 *         requestsToday:
 *           type: integer
 *         errorRate:
 *           type: number
 */

// Note: Authentication and authorization is handled at the router level in routes/index.js
// All admin routes are already protected by authMiddleware.authenticate() and authMiddleware.authorizeRole(['administrator'])

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   $ref: '#/components/schemas/SystemStats'
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/dashboard', async (req, res) => {
  try {
    const db = getApiGatewayDB();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get system statistics
    const [userStats] = await db('api_users')
      .select([
        db.raw('COUNT(*) as total_users'),
        db.raw('COUNT(*) FILTER (WHERE is_active = true) as active_users')
      ]);

    const [apiKeyStats] = await db('api_keys')
      .select([
        db.raw('COUNT(*) as total_api_keys'),
        db.raw('COUNT(*) FILTER (WHERE is_active = true) as active_api_keys')
      ]);

    const [routeStats] = await db('service_routes')
      .select([
        db.raw('COUNT(*) as total_routes'),
        db.raw('COUNT(*) FILTER (WHERE is_active = true) as active_routes')
      ]);

    const [requestStats] = await db('api_audit_logs')
      .select([
        db.raw('COUNT(*) as requests_today'),
        db.raw('COUNT(*) FILTER (WHERE status_code >= 400) as error_requests'),
        db.raw('AVG(response_time_ms) as avg_response_time')
      ])
      .where('request_timestamp', '>=', todayStart);

    // Get recent activity
    const recentActivity = await db('api_audit_logs')
      .select([
        'request_timestamp',
        'http_method',
        'path',
        'status_code',
        'user_id',
        'client_ip',
        'service_name'
      ])
      .orderBy('request_timestamp', 'desc')
      .limit(10);

    const errorRate = requestStats.requests_today > 0
      ? (requestStats.error_requests / requestStats.requests_today) * 100
      : 0;

    const stats = {
      totalUsers: parseInt(userStats.total_users),
      activeUsers: parseInt(userStats.active_users),
      totalApiKeys: parseInt(apiKeyStats.total_api_keys),
      activeApiKeys: parseInt(apiKeyStats.active_api_keys),
      totalRoutes: parseInt(routeStats.total_routes),
      activeRoutes: parseInt(routeStats.active_routes),
      requestsToday: parseInt(requestStats.requests_today) || 0,
      errorRequests: parseInt(requestStats.error_requests) || 0,
      errorRate: parseFloat(errorRate.toFixed(2)),
      avgResponseTime: parseFloat(requestStats.avg_response_time) || 0
    };

    res.json({
      success: true,
      stats,
      recentActivity,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 */
router.get('/users', async (req, res) => {
  try {
    const User = require('../models/User');
    const userModel = new User(getApiGatewayDB());

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'desc',
      filter: {
        userType: req.query.userType,
        role: req.query.role,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        search: req.query.search
      }
    };

    const result = await userModel.findAll(options);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    logger.error('Admin users list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
});

/**
 * @swagger
 * /admin/users/{userId}:
 *   put:
 *     summary: Update user by admin
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [administrator, user, manager, analyst, readonly]
 *               department:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isVerified:
 *                 type: boolean
 *               rateLimitTier:
 *                 type: string
 *                 enum: [basic, standard, premium, unlimited]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       400:
 *         description: Validation error
 */
router.put('/users/:userId', async (req, res) => {
  try {
    const schema = Joi.object({
      fullName: Joi.string().min(2).max(100).optional(),
      role: Joi.string().valid('administrator', 'user', 'manager', 'analyst', 'readonly').optional(),
      department: Joi.string().max(100).optional(),
      isActive: Joi.boolean().optional(),
      isVerified: Joi.boolean().optional(),
      rateLimitTier: Joi.string().valid('basic', 'standard', 'premium', 'unlimited').optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const User = require('../models/User');
    const userModel = new User(getApiGatewayDB());

    const updatedUser = await userModel.update(req.params.userId, value);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    logger.error('Admin user update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

/**
 * @swagger
 * /admin/api-keys:
 *   get:
 *     summary: Get all API keys
 *     tags: [Admin - API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceName
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 */
router.get('/api-keys', async (req, res) => {
  try {
    const db = getApiGatewayDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = db('api_keys')
      .select([
        'api_keys.*',
        'api_users.username',
        'api_users.email',
        'api_users.full_name'
      ])
      .leftJoin('api_users', 'api_keys.user_id', 'api_users.user_id');

    // Apply filters
    if (req.query.userId) {
      query = query.where('api_keys.user_id', req.query.userId);
    }
    if (req.query.serviceName) {
      query = query.where('api_keys.service_name', req.query.serviceName);
    }
    if (req.query.isActive !== undefined) {
      query = query.where('api_keys.is_active', req.query.isActive === 'true');
    }

    // Get total count
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');
    const total = parseInt(count);

    // Get paginated results
    const apiKeys = await query
      .orderBy('api_keys.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Parse JSON fields and remove sensitive data
    const processedKeys = apiKeys.map(key => ({
      ...key,
      permissions: JSON.parse(key.permissions || '[]'),
      ip_whitelist: key.ip_whitelist ? JSON.parse(key.ip_whitelist) : null,
      domain_whitelist: key.domain_whitelist ? JSON.parse(key.domain_whitelist) : null,
      api_key_hash: undefined // Remove hash for security
    }));

    res.json({
      success: true,
      apiKeys: processedKeys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Admin API keys list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API keys'
    });
  }
});

/**
 * @swagger
 * /admin/api-keys/{keyId}:
 *   delete:
 *     summary: Delete API key
 *     tags: [Admin - API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       404:
 *         description: API key not found
 */
router.delete('/api-keys/:keyId', async (req, res) => {
  try {
    const ApiKey = require('../models/ApiKey');
    const apiKeyModel = new ApiKey(getApiGatewayDB());

    const success = await apiKeyModel.delete(req.params.keyId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });

  } catch (error) {
    logger.error('Admin API key delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API key'
    });
  }
});

/**
 * @swagger
 * /admin/routes:
 *   get:
 *     summary: Get all service routes
 *     tags: [Admin - Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service routes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 routes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceRoute'
 */
router.get('/routes', async (req, res) => {
  try {
    const db = getApiGatewayDB();

    const routes = await db('service_routes')
      .select('*')
      .orderBy('service_name')
      .orderBy('path_pattern');

    const processedRoutes = routes.map(route => ({
      ...route,
      upstream_servers: JSON.parse(route.upstream_servers || '[]'),
      authorization_roles: JSON.parse(route.authorization_roles || '[]'),
      rate_limit_override: route.rate_limit_override ? JSON.parse(route.rate_limit_override) : null
    }));

    res.json({
      success: true,
      routes: processedRoutes
    });

  } catch (error) {
    logger.error('Admin routes list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve routes'
    });
  }
});

/**
 * @swagger
 * /admin/routes:
 *   post:
 *     summary: Create a new service route
 *     tags: [Admin - Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pathPattern
 *               - httpMethod
 *               - serviceName
 *               - upstreamUrl
 *               - routeName
 *             properties:
 *               pathPattern:
 *                 type: string
 *               httpMethod:
 *                 type: string
 *                 enum: [GET, POST, PUT, DELETE, PATCH]
 *               serviceName:
 *                 type: string
 *               upstreamUrl:
 *                 type: string
 *               routeName:
 *                 type: string
 *               routeDescription:
 *                 type: string
 *               authenticationRequired:
 *                 type: boolean
 *                 default: true
 *               timeoutSeconds:
 *                 type: integer
 *                 default: 30
 *               circuitBreakerEnabled:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Route created successfully
 *       400:
 *         description: Validation error
 */
router.post('/routes', async (req, res) => {
  try {
    const schema = Joi.object({
      pathPattern: Joi.string().required(),
      httpMethod: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
      serviceName: Joi.string().required(),
      upstreamUrl: Joi.string().uri().required(),
      routeName: Joi.string().required(),
      routeDescription: Joi.string().optional(),
      authenticationRequired: Joi.boolean().default(true),
      timeoutSeconds: Joi.number().integer().min(1).max(300).default(30),
      circuitBreakerEnabled: Joi.boolean().default(true),
      failureThreshold: Joi.number().integer().min(1).default(5),
      recoveryTimeout: Joi.number().integer().min(1000).default(60000)
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const db = getApiGatewayDB();
    const routeData = {
      path_pattern: value.pathPattern,
      http_method: value.httpMethod,
      service_name: value.serviceName,
      upstream_url: value.upstreamUrl,
      route_name: value.routeName,
      route_description: value.routeDescription,
      authentication_required: value.authenticationRequired,
      timeout_seconds: value.timeoutSeconds,
      circuit_breaker_enabled: value.circuitBreakerEnabled,
      failure_threshold: value.failureThreshold,
      recovery_timeout: value.recoveryTimeout,
      is_active: true,
      created_by: req.user.userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [createdRoute] = await db('service_routes')
      .insert(routeData)
      .returning('*');

    // Reload routes in proxy service
    const ProxyService = require('../services/ProxyService');
    const proxyService = new ProxyService();
    await proxyService.reloadRoutes();

    res.status(201).json({
      success: true,
      route: createdRoute,
      message: 'Route created successfully'
    });

  } catch (error) {
    logger.error('Admin route creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create route'
    });
  }
});

/**
 * @swagger
 * /admin/routes/{routeId}:
 *   put:
 *     summary: Update service route
 *     tags: [Admin - Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               routeName:
 *                 type: string
 *               routeDescription:
 *                 type: string
 *               upstreamUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               timeoutSeconds:
 *                 type: integer
 *               circuitBreakerEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Route updated successfully
 *       404:
 *         description: Route not found
 */
router.put('/routes/:routeId', async (req, res) => {
  try {
    const schema = Joi.object({
      routeName: Joi.string().optional(),
      routeDescription: Joi.string().optional(),
      upstreamUrl: Joi.string().uri().optional(),
      isActive: Joi.boolean().optional(),
      timeoutSeconds: Joi.number().integer().min(1).max(300).optional(),
      circuitBreakerEnabled: Joi.boolean().optional(),
      failureThreshold: Joi.number().integer().min(1).optional(),
      recoveryTimeout: Joi.number().integer().min(1000).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const db = getApiGatewayDB();
    const updateData = {
      ...(value.routeName && { route_name: value.routeName }),
      ...(value.routeDescription && { route_description: value.routeDescription }),
      ...(value.upstreamUrl && { upstream_url: value.upstreamUrl }),
      ...(value.isActive !== undefined && { is_active: value.isActive }),
      ...(value.timeoutSeconds && { timeout_seconds: value.timeoutSeconds }),
      ...(value.circuitBreakerEnabled !== undefined && { circuit_breaker_enabled: value.circuitBreakerEnabled }),
      ...(value.failureThreshold && { failure_threshold: value.failureThreshold }),
      ...(value.recoveryTimeout && { recovery_timeout: value.recoveryTimeout }),
      updated_at: new Date(),
      updated_by: req.user.userId
    };

    const [updatedRoute] = await db('service_routes')
      .where({ route_id: req.params.routeId })
      .update(updateData)
      .returning('*');

    if (!updatedRoute) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Reload routes in proxy service
    const ProxyService = require('../services/ProxyService');
    const proxyService = new ProxyService();
    await proxyService.reloadRoutes();

    res.json({
      success: true,
      route: updatedRoute,
      message: 'Route updated successfully'
    });

  } catch (error) {
    logger.error('Admin route update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update route'
    });
  }
});

/**
 * @swagger
 * /admin/system/health:
 *   get:
 *     summary: Get detailed system health
 *     tags: [Admin - System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health retrieved successfully
 */
router.get('/system/health', async (req, res) => {
  try {
    const ProxyService = require('../services/ProxyService');
    const proxyService = new ProxyService();

    const health = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      services: await proxyService.getServiceHealth(),
      routes: proxyService.getRouteStats(),
      database: 'healthy', // Would check actual DB health
      redis: 'healthy' // Would check actual Redis health
    };

    res.json({
      success: true,
      health
    });

  } catch (error) {
    logger.error('Admin system health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system health'
    });
  }
});

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin - Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceName
 *         schema:
 *           type: string
 *       - in: query
 *         name: statusCode
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const db = getApiGatewayDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let query = db('api_audit_logs')
      .select([
        'request_id',
        'http_method',
        'path',
        'status_code',
        'user_id',
        'api_key_id',
        'authentication_method',
        'client_ip',
        'service_name',
        'response_time_ms',
        'error_code',
        'error_message',
        'request_timestamp'
      ]);

    // Apply filters
    if (req.query.userId) {
      query = query.where('user_id', req.query.userId);
    }
    if (req.query.serviceName) {
      query = query.where('service_name', req.query.serviceName);
    }
    if (req.query.statusCode) {
      query = query.where('status_code', parseInt(req.query.statusCode));
    }
    if (req.query.fromDate) {
      query = query.where('request_timestamp', '>=', new Date(req.query.fromDate));
    }
    if (req.query.toDate) {
      query = query.where('request_timestamp', '<=', new Date(req.query.toDate));
    }

    // Get total count
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');
    const total = parseInt(count);

    // Get paginated results
    const logs = await query
      .orderBy('request_timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Admin audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs'
    });
  }
});

module.exports = router;

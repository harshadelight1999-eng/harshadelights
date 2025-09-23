/**
 * Proxy Routes for Service Integration
 * Handles routing requests to upstream services
 */

const express = require('express');
const { logger } = require("../utils/logger");
const router = express.Router();
const ProxyService = require('../services/ProxyService');
const authMiddleware = require('../middleware/auth');

// Initialize proxy service
const proxyService = new ProxyService();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProxyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *         service:
 *           type: string
 *         responseTime:
 *           type: number
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *         code:
 *           type: string
 *         service:
 *           type: string
 */

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get customers from ERPNext
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON string of filters
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProxyResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       502:
 *         description: Bad Gateway - Upstream service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get specific customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *       404:
 *         description: Customer not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get items from ERPNext
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: item_group
 *         schema:
 *           type: string
 *         description: Filter by item group
 *       - in: query
 *         name: has_batch_no
 *         schema:
 *           type: boolean
 *         description: Filter items with batch tracking
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProxyResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /inventory/stock-levels:
 *   get:
 *     summary: Get real-time stock levels
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: Warehouse filter
 *       - in: query
 *         name: item_code
 *         schema:
 *           type: string
 *         description: Specific item filter
 *     responses:
 *       200:
 *         description: Stock levels retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /inventory/batch-info:
 *   get:
 *     summary: Get batch information for confectionery items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: item_code
 *         schema:
 *           type: string
 *         description: Item code to get batches for
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: Warehouse filter
 *       - in: query
 *         name: expiry_days
 *         schema:
 *           type: integer
 *         description: Filter batches expiring within X days
 *     responses:
 *       200:
 *         description: Batch information retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /pricing/calculate:
 *   post:
 *     summary: Calculate dynamic pricing for items
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - items
 *             properties:
 *               customer:
 *                 type: string
 *                 description: Customer ID
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_code:
 *                       type: string
 *                     qty:
 *                       type: number
 *                     warehouse:
 *                       type: string
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Pricing date (defaults to today)
 *     responses:
 *       200:
 *         description: Pricing calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pricing:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_code:
 *                         type: string
 *                       base_rate:
 *                         type: number
 *                       discount_percentage:
 *                         type: number
 *                       final_rate:
 *                         type: number
 *                       pricing_rules_applied:
 *                         type: array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get sales orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, To Deliver and Bill, To Bill, To Deliver, Completed, Cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new sales order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - items
 *             properties:
 *               customer:
 *                 type: string
 *               delivery_date:
 *                 type: string
 *                 format: date
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_code:
 *                       type: string
 *                     qty:
 *                       type: number
 *                     rate:
 *                       type: number
 *                     warehouse:
 *                       type: string
 *               taxes_and_charges:
 *                 type: string
 *                 description: Tax template to apply
 *               payment_terms_template:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Apply the proxy service middleware to handle all routes
router.use(proxyService.createRoutingMiddleware());

// Specific route handlers for enhanced functionality

// Customer segment-aware pricing
router.get('/customers/:customerId/pricing',
  authMiddleware.requirePermissions('customers:read', 'pricing:read'),
  async (req, res, next) => {
    try {
      // Add customer segment information to the request
      req.headers['X-Customer-Segment'] = await getCustomerSegment(req.params.customerId);
      next();
    } catch (error) {
      logger.error('Customer pricing middleware error:', error);
      next();
    }
  }
);

// Inventory with batch tracking
router.get('/inventory/batches/expiring',
  authMiddleware.requirePermissions('inventory:read'),
  async (req, res, next) => {
    try {
      // Add expiry filter logic
      const days = req.query.days || 30;
      req.query.filters = JSON.stringify({
        expiry_date: ['between', [
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ]]
      });
      next();
    } catch (error) {
      logger.error('Batch expiry middleware error:', error);
      next();
    }
  }
);

// Order processing with business logic
router.post('/orders/process',
  authMiddleware.requirePermissions('orders:write'),
  async (req, res, next) => {
    try {
      // Add business logic validations
      await validateOrderBusinessRules(req.body);
      next();
    } catch (error) {
      logger.error('Order processing validation error:', error);
      return res.status(400).json({
        success: false,
        error: 'Order validation failed',
        code: 'ORDER_VALIDATION_ERROR',
        details: error.message
      });
    }
  }
);

// Real-time inventory updates
router.get('/inventory/realtime/:itemCode',
  authMiddleware.requirePermissions('inventory:read'),
  async (req, res, next) => {
    try {
      // Add real-time cache headers
      res.set('Cache-Control', 'no-cache, must-revalidate');
      res.set('X-Real-Time', 'true');
      next();
    } catch (error) {
      logger.error('Real-time inventory middleware error:', error);
      next();
    }
  }
);

// Business logic helper functions
async function getCustomerSegment(customerId) {
  try {
    const { getApiGatewayDB } = require('../config/database');
    const db = getApiGatewayDB();

    // This would typically query the ERPNext database or cache
    // For now, return a default segment
    return 'standard';
  } catch (error) {
    logger.error('Error getting customer segment:', error);
    return 'standard';
  }
}

async function validateOrderBusinessRules(orderData) {
  // Implement business rule validations
  const { customer, items } = orderData;

  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Customer and items are required');
  }

  // Validate minimum order quantities
  for (const item of items) {
    if (item.qty <= 0) {
      throw new Error(`Invalid quantity for item ${item.item_code}`);
    }
  }

  // Add more business rule validations as needed
  // - Credit limit checks
  // - Inventory availability
  // - Customer segment restrictions
  // - Seasonal availability
  // - Batch expiry validations
}

// Service-specific error handling
router.use((error, req, res, next) => {
  logger.error('Proxy route error:', error);

  // Handle circuit breaker errors
  if (error.code === 'CIRCUIT_BREAKER_OPEN') {
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'CIRCUIT_BREAKER_OPEN',
      service: req.serviceName,
      retryAfter: 60
    });
  }

  // Handle upstream service errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return res.status(502).json({
      success: false,
      error: 'Upstream service unavailable',
      code: 'UPSTREAM_UNAVAILABLE',
      service: req.serviceName
    });
  }

  // Default error handling
  next(error);
});

module.exports = router;

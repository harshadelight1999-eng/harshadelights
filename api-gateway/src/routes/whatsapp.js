/**
 * WhatsApp Business API Routes for Harsha Delights
 * Handles order collection via WhatsApp without payment gateway
 */

const express = require('express');
const { logger } = require('../utils/logger');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { body, query } = require('express-validator');
const router = express.Router();

// Import database
const { getApiGatewayDB } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     WhatsAppOrder:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         customer_name:
 *           type: string
 *         customer_phone:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *         total_amount:
 *           type: number
 *         delivery_address:
 *           type: string
 *         status:
 *           type: string
 *           enum: [inquiry, confirmed, preparing, ready, delivered]
 */

/**
 * @swagger
 * /api/v1/whatsapp/generate-order-link:
 *   post:
 *     summary: Generate WhatsApp order link with pre-filled message
 *     tags: [WhatsApp Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, customer_details]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     variant_id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *               customer_details:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   address:
 *                     type: string
 *               special_instructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: WhatsApp order link generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 whatsapp_link:
 *                   type: string
 *                 order_id:
 *                   type: string
 *                 message_preview:
 *                   type: string
 */
router.post('/generate-order-link',
  rateLimitMiddleware.basicRateLimit(),
  [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.product_id').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    body('customer_details.name').notEmpty().withMessage('Customer name is required'),
    body('customer_details.phone').notEmpty().withMessage('Customer phone is required')
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const { items, customer_details, special_instructions = '' } = req.body;
      const db = getApiGatewayDB();

      // Generate order ID
      const orderId = `HD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        // Get product and variant details
        const product = await db('products')
          .select(
            'products.title',
            'variants.price',
            'variants.title as variant_title'
          )
          .leftJoin('product_variants as variants', 'products.id', 'variants.product_id')
          .where('products.id', item.product_id)
          .where('variants.id', item.variant_id)
          .first();

        if (product) {
          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;
          
          orderItems.push({
            product_title: product.title,
            variant_title: product.variant_title || 'Default',
            quantity: item.quantity,
            price: product.price,
            total: itemTotal
          });
        }
      }

      // Create order record in database for tracking
      const [order] = await db('whatsapp_orders').insert({
        id: orderId,
        customer_name: customer_details.name,
        customer_phone: customer_details.phone,
        customer_email: customer_details.email || null,
        customer_address: customer_details.address || '',
        items: JSON.stringify(orderItems),
        total_amount: totalAmount,
        special_instructions,
        status: 'inquiry',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      // Generate WhatsApp message
      const businessPhone = process.env.WHATSAPP_BUSINESS_PHONE || '919876543210'; // Replace with actual business number
      
      let message = `🍯 *Harsha Delights - Order Inquiry*\n\n`;
      message += `📋 *Order ID:* ${orderId}\n`;
      message += `👤 *Customer:* ${customer_details.name}\n`;
      message += `📱 *Phone:* ${customer_details.phone}\n\n`;
      
      message += `🛒 *Order Details:*\n`;
      orderItems.forEach((item, index) => {
        message += `${index + 1}. ${item.product_title}`;
        if (item.variant_title !== 'Default') {
          message += ` (${item.variant_title})`;
        }
        message += `\n   Qty: ${item.quantity} × ₹${item.price} = ₹${item.total}\n\n`;
      });
      
      message += `💰 *Total Amount:* ₹${totalAmount}\n\n`;
      
      if (customer_details.address) {
        message += `📍 *Delivery Address:*\n${customer_details.address}\n\n`;
      }
      
      if (special_instructions) {
        message += `📝 *Special Instructions:*\n${special_instructions}\n\n`;
      }
      
      message += `🕐 *Ordered at:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n`;
      message += `Please confirm this order and let us know your preferred delivery time.\n\n`;
      message += `🙏 Thank you for choosing Harsha Delights!`;

      // Generate WhatsApp link
      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/${businessPhone}?text=${encodedMessage}`;

      res.json({
        success: true,
        order_id: orderId,
        whatsapp_link: whatsappLink,
        message_preview: message,
        total_amount: totalAmount,
        customer_details: {
          name: customer_details.name,
          phone: customer_details.phone
        }
      });

    } catch (error) {
      logger.error('Generate WhatsApp order link error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate WhatsApp order link'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/whatsapp/orders:
 *   get:
 *     summary: Get WhatsApp orders with filtering
 *     tags: [WhatsApp Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [inquiry, confirmed, preparing, ready, delivered]
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: WhatsApp orders list
 */
router.get('/orders',
  rateLimitMiddleware.basicRateLimit(),
  [
    query('status').optional().isIn(['inquiry', 'confirmed', 'preparing', 'ready', 'delivered']),
    query('date_from').optional().isDate(),
    query('date_to').optional().isDate(),
    query('phone').optional().isString()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const { status, date_from, date_to, phone } = req.query;
      const db = getApiGatewayDB();

      let query = db('whatsapp_orders').select('*');

      // Apply filters
      if (status) {
        query = query.where('status', status);
      }

      if (date_from) {
        query = query.where('created_at', '>=', new Date(date_from));
      }

      if (date_to) {
        query = query.where('created_at', '<=', new Date(date_to + ' 23:59:59'));
      }

      if (phone) {
        query = query.where('customer_phone', 'like', `%${phone}%`);
      }

      const orders = await query.orderBy('created_at', 'desc');

      // Parse items JSON for each order
      const formattedOrders = orders.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));

      res.json({
        success: true,
        orders: formattedOrders
      });

    } catch (error) {
      logger.error('Get WhatsApp orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch WhatsApp orders'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/whatsapp/orders/{order_id}/status:
 *   put:
 *     summary: Update WhatsApp order status
 *     tags: [WhatsApp Orders]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [inquiry, confirmed, preparing, ready, delivered]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put('/orders/:order_id/status',
  rateLimitMiddleware.basicRateLimit(),
  [
    body('status').isIn(['inquiry', 'confirmed', 'preparing', 'ready', 'delivered']).withMessage('Invalid status'),
    body('notes').optional().isString()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const { order_id } = req.params;
      const { status, notes } = req.body;
      const db = getApiGatewayDB();

      // Check if order exists
      const order = await db('whatsapp_orders')
        .where('id', order_id)
        .first();

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Update order status
      await db('whatsapp_orders')
        .where('id', order_id)
        .update({
          status,
          notes: notes || order.notes,
          updated_at: new Date()
        });

      // Log status change
      await db('whatsapp_order_status_log').insert({
        id: db.raw('gen_random_uuid()'),
        order_id,
        from_status: order.status,
        to_status: status,
        notes,
        created_at: new Date()
      });

      res.json({
        success: true,
        message: `Order ${order_id} status updated to ${status}`
      });

    } catch (error) {
      logger.error('Update WhatsApp order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/whatsapp/generate-quick-order:
 *   post:
 *     summary: Generate quick WhatsApp order for single product
 *     tags: [WhatsApp Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, quantity]
 *             properties:
 *               product_id:
 *                 type: string
 *               variant_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               customer_name:
 *                 type: string
 *               customer_phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quick WhatsApp order link generated
 */
router.post('/generate-quick-order',
  rateLimitMiddleware.basicRateLimit(),
  [
    body('product_id').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive')
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const { product_id, variant_id, quantity, customer_name, customer_phone } = req.body;
      const db = getApiGatewayDB();

      // Get product details
      const product = await db('products')
        .select(
          'products.title',
          'products.description',
          'variants.id as variant_id',
          'variants.title as variant_title',
          'variants.price'
        )
        .leftJoin('product_variants as variants', 'products.id', 'variants.product_id')
        .where('products.id', product_id)
        .where(function() {
          if (variant_id) {
            this.where('variants.id', variant_id);
          } else {
            this.orderBy('variants.created_at', 'asc').limit(1);
          }
        })
        .first();

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      const totalAmount = product.price * quantity;
      const businessPhone = process.env.WHATSAPP_BUSINESS_PHONE || '919876543210';

      let message = `🍯 *Harsha Delights - Quick Order*\n\n`;
      message += `🛒 *Product:* ${product.title}\n`;
      if (product.variant_title && product.variant_title !== 'Default') {
        message += `📦 *Variant:* ${product.variant_title}\n`;
      }
      message += `🔢 *Quantity:* ${quantity}\n`;
      message += `💰 *Price:* ₹${product.price} each\n`;
      message += `💵 *Total:* ₹${totalAmount}\n\n`;
      
      if (customer_name && customer_phone) {
        message += `👤 *Customer:* ${customer_name}\n`;
        message += `📱 *Phone:* ${customer_phone}\n\n`;
      }
      
      message += `📝 *Product Description:*\n${product.description}\n\n`;
      message += `I would like to order this product. Please confirm availability and delivery details.\n\n`;
      message += `🙏 Thank you!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/${businessPhone}?text=${encodedMessage}`;

      res.json({
        success: true,
        whatsapp_link: whatsappLink,
        message_preview: message,
        product_details: {
          title: product.title,
          variant: product.variant_title,
          price: product.price,
          quantity,
          total: totalAmount
        }
      });

    } catch (error) {
      logger.error('Generate quick WhatsApp order error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate quick order link'
      });
    }
  }
);

module.exports = router;
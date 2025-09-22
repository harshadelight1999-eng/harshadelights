/**
 * EspoCRM Integration Routes for Harsha Delights API Gateway
 * Provides unified API endpoints for CRM operations
 */

const express = require('express');
const router = express.Router();
const EspoCRMMiddleware = require('../../../espocrm/middleware/espocrm-middleware');
const authMiddleware = require('../middleware/auth');
const rateLimitMiddleware = require('../middleware/rateLimit');
const logger = require('../utils/logger');

// Initialize EspoCRM middleware
const crmMiddleware = new EspoCRMMiddleware();

// Apply common middleware
router.use(authMiddleware.authenticate);
router.use(rateLimitMiddleware.createRateLimit('crm', 100, 15)); // 100 requests per 15 minutes
router.use(crmMiddleware.ensureConnection());
router.use(crmMiddleware.addTracking());
router.use(crmMiddleware.logOperations());

// ===== CUSTOMER MANAGEMENT ROUTES =====

/**
 * @route   GET /api/v1/crm/customers
 * @desc    Get all customers with pagination and filtering
 * @access  Private
 */
router.get('/customers', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, customerType, status, search } = req.query;

        const where = [];

        if (customerType) {
            where.push({
                type: 'equals',
                attribute: 'customerTypeId',
                value: customerType
            });
        }

        if (status) {
            where.push({
                type: 'equals',
                attribute: 'isActive',
                value: status === 'active'
            });
        }

        if (search) {
            where.push({
                type: 'or',
                value: [
                    {
                        type: 'contains',
                        attribute: 'name',
                        value: search
                    },
                    {
                        type: 'contains',
                        attribute: 'emailAddress',
                        value: search
                    }
                ]
            });
        }

        const params = {
            offset: (page - 1) * limit,
            maxSize: parseInt(limit),
            where: where.length > 0 ? where : undefined
        };

        const customers = await req.espocrm.getRecords('Account', params);

        res.json({
            success: true,
            data: customers.list,
            pagination: {
                total: customers.total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(customers.total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/v1/crm/customers
 * @desc    Create new customer
 * @access  Private
 */
router.post('/customers',
    crmMiddleware.validateCustomerData(),
    async (req, res, next) => {
        try {
            const customerData = {
                ...req.body,
                createdAt: new Date().toISOString(),
                createdById: req.user.id
            };

            const customer = await req.espocrm.syncCustomer(customerData);

            res.status(201).json({
                success: true,
                data: customer,
                message: 'Customer created successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/v1/crm/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get('/customers/:id', async (req, res, next) => {
    try {
        const customer = await req.espocrm.getRecord('Account', req.params.id);

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/v1/crm/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put('/customers/:id',
    crmMiddleware.validateCustomerData(),
    async (req, res, next) => {
        try {
            const updateData = {
                ...req.body,
                modifiedAt: new Date().toISOString(),
                modifiedById: req.user.id
            };

            const customer = await req.espocrm.updateRecord('Account', req.params.id, updateData);

            res.json({
                success: true,
                data: customer,
                message: 'Customer updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/v1/crm/customer-types
 * @desc    Get all customer types
 * @access  Private
 */
router.get('/customer-types', async (req, res, next) => {
    try {
        const customerTypes = await req.espocrm.getCustomerTypes();

        res.json({
            success: true,
            data: customerTypes.list
        });
    } catch (error) {
        next(error);
    }
});

// ===== PRODUCT MANAGEMENT ROUTES =====

/**
 * @route   GET /api/v1/crm/products
 * @desc    Get all products with filtering
 * @access  Private
 */
router.get('/products', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, category, status, search } = req.query;

        const where = [];

        if (category) {
            where.push({
                type: 'equals',
                attribute: 'category',
                value: category
            });
        }

        if (status) {
            where.push({
                type: 'equals',
                attribute: 'isActive',
                value: status === 'active'
            });
        }

        if (search) {
            where.push({
                type: 'or',
                value: [
                    {
                        type: 'contains',
                        attribute: 'name',
                        value: search
                    },
                    {
                        type: 'equals',
                        attribute: 'sku',
                        value: search
                    }
                ]
            });
        }

        const params = {
            offset: (page - 1) * limit,
            maxSize: parseInt(limit),
            where: where.length > 0 ? where : undefined
        };

        const products = await req.espocrm.getRecords('ConfectioneryProduct', params);

        res.json({
            success: true,
            data: products.list,
            pagination: {
                total: products.total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(products.total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/v1/crm/products
 * @desc    Create new product
 * @access  Private
 */
router.post('/products',
    crmMiddleware.validateProductData(),
    async (req, res, next) => {
        try {
            const productData = {
                ...req.body,
                createdAt: new Date().toISOString(),
                createdById: req.user.id
            };

            const product = await req.espocrm.syncProduct(productData);

            res.status(201).json({
                success: true,
                data: product,
                message: 'Product created successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/v1/crm/products/:id/pricing
 * @desc    Get pricing for product and customer
 * @access  Private
 */
router.get('/products/:id/pricing', async (req, res, next) => {
    try {
        const { customerId, quantity = 1 } = req.query;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID is required'
            });
        }

        const pricing = await req.espocrm.getCustomerPricing(
            customerId,
            req.params.id,
            parseInt(quantity)
        );

        res.json({
            success: true,
            data: pricing
        });
    } catch (error) {
        next(error);
    }
});

// ===== ORDER MANAGEMENT ROUTES =====

/**
 * @route   GET /api/v1/crm/orders
 * @desc    Get all orders with filtering
 * @access  Private
 */
router.get('/orders', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, customerId, startDate, endDate } = req.query;

        const where = [];

        if (status) {
            where.push({
                type: 'equals',
                attribute: 'status',
                value: status
            });
        }

        if (customerId) {
            where.push({
                type: 'equals',
                attribute: 'customerId',
                value: customerId
            });
        }

        if (startDate && endDate) {
            where.push({
                type: 'between',
                attribute: 'orderDate',
                value: [startDate, endDate]
            });
        }

        const params = {
            offset: (page - 1) * limit,
            maxSize: parseInt(limit),
            where: where.length > 0 ? where : undefined,
            orderBy: 'createdAt',
            order: 'desc'
        };

        const orders = await req.espocrm.getRecords('SalesOrder', params);

        res.json({
            success: true,
            data: orders.list,
            pagination: {
                total: orders.total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(orders.total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/v1/crm/orders
 * @desc    Create new sales order
 * @access  Private
 */
router.post('/orders',
    crmMiddleware.validateOrderData(),
    async (req, res, next) => {
        try {
            const orderData = {
                ...req.body,
                createdAt: new Date().toISOString(),
                createdById: req.user.id,
                salesRepId: req.user.id
            };

            const order = await req.espocrm.createSalesOrder(orderData);

            res.status(201).json({
                success: true,
                data: order,
                message: 'Order created successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   PUT /api/v1/crm/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.put('/orders/:id/status', async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }

        const order = await req.espocrm.updateOrderStatus(req.params.id, status, notes);

        res.json({
            success: true,
            data: order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

// ===== INVENTORY MANAGEMENT ROUTES =====

/**
 * @route   GET /api/v1/crm/inventory
 * @desc    Get inventory levels
 * @access  Private
 */
router.get('/inventory', async (req, res, next) => {
    try {
        const { productId, warehouseId } = req.query;

        const inventory = await req.espocrm.getInventoryLevels(productId, warehouseId);

        res.json({
            success: true,
            data: inventory.list
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/v1/crm/inventory/update
 * @desc    Update inventory levels
 * @access  Private
 */
router.post('/inventory/update',
    crmMiddleware.validateInventoryData(),
    async (req, res, next) => {
        try {
            const { productId, warehouseId, quantity, type = 'adjustment' } = req.body;

            const inventory = await req.espocrm.updateInventory(
                productId,
                warehouseId,
                quantity,
                type
            );

            res.json({
                success: true,
                data: inventory,
                message: 'Inventory updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/v1/crm/inventory/alerts
 * @desc    Get inventory alerts (low stock, expiring items)
 * @access  Private
 */
router.get('/inventory/alerts', async (req, res, next) => {
    try {
        const alerts = await req.espocrm.getInventoryAlerts();

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        next(error);
    }
});

// ===== QUALITY MANAGEMENT ROUTES =====

/**
 * @route   GET /api/v1/crm/quality-checks
 * @desc    Get quality checks
 * @access  Private
 */
router.get('/quality-checks', async (req, res, next) => {
    try {
        const { status = 'pending' } = req.query;

        let qualityChecks;
        if (status === 'pending') {
            qualityChecks = await req.espocrm.getPendingQualityChecks();
        } else {
            qualityChecks = await req.espocrm.getRecords('QualityCheck', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'status',
                        value: status
                    }
                ]
            });
        }

        res.json({
            success: true,
            data: qualityChecks.list
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/v1/crm/quality-checks
 * @desc    Create quality check
 * @access  Private
 */
router.post('/quality-checks', async (req, res, next) => {
    try {
        const qcData = {
            ...req.body,
            inspectorId: req.user.id,
            createdAt: new Date().toISOString(),
            createdById: req.user.id
        };

        const qualityCheck = await req.espocrm.createQualityCheck(qcData);

        res.status(201).json({
            success: true,
            data: qualityCheck,
            message: 'Quality check created successfully'
        });
    } catch (error) {
        next(error);
    }
});

// ===== REPORTING ROUTES =====

/**
 * @route   GET /api/v1/crm/reports/sales-summary
 * @desc    Get sales summary report
 * @access  Private
 */
router.get('/reports/sales-summary', async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Start date and end date are required'
            });
        }

        const salesData = await req.espocrm.getSalesSummary(startDate, endDate);

        // Calculate summary statistics
        const summary = salesData.list.reduce((acc, order) => {
            acc.totalOrders += 1;
            acc.totalAmount += order.totalAmount || 0;
            acc.totalQuantity += order.orderItems?.length || 0;

            if (order.status === 'completed') {
                acc.completedOrders += 1;
                acc.completedAmount += order.totalAmount || 0;
            }

            return acc;
        }, {
            totalOrders: 0,
            totalAmount: 0,
            totalQuantity: 0,
            completedOrders: 0,
            completedAmount: 0
        });

        res.json({
            success: true,
            data: {
                summary,
                orders: salesData.list,
                period: { startDate, endDate }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
router.use(crmMiddleware.handleErrors());

module.exports = router;
/**
 * Express Middleware for EspoCRM Integration
 * Handles authentication, data validation, and error handling for EspoCRM operations
 */

const EspoCRMClient = require('./espocrm-client');
const logger = require('../../../api-gateway/src/utils/logger');

class EspoCRMMiddleware {
    constructor() {
        this.client = new EspoCRMClient();
        this.initialized = false;
    }

    /**
     * Initialize EspoCRM connection
     */
    async initialize() {
        try {
            await this.client.authenticate();
            this.initialized = true;
            logger.info('EspoCRM middleware initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize EspoCRM middleware:', error.message);
            throw error;
        }
    }

    /**
     * Middleware to ensure EspoCRM is connected
     */
    ensureConnection() {
        return async (req, res, next) => {
            try {
                if (!this.initialized) {
                    await this.initialize();
                }

                // Add EspoCRM client to request object
                req.espocrm = this.client;
                next();
            } catch (error) {
                logger.error('EspoCRM connection failed:', error.message);
                return res.status(503).json({
                    success: false,
                    error: 'CRM service unavailable',
                    message: 'Unable to connect to CRM system'
                });
            }
        };
    }

    /**
     * Validate customer data before CRM operations
     */
    validateCustomerData() {
        return (req, res, next) => {
            const { body } = req;
            const errors = [];

            // Required fields validation
            if (!body.name || body.name.trim().length === 0) {
                errors.push('Customer name is required');
            }

            if (!body.emailAddress || !this.isValidEmail(body.emailAddress)) {
                errors.push('Valid email address is required');
            }

            if (!body.phoneNumber || body.phoneNumber.trim().length === 0) {
                errors.push('Phone number is required');
            }

            if (!body.customerTypeId) {
                errors.push('Customer type is required');
            }

            // Business specific validations
            if (body.gstNumber && !this.isValidGSTNumber(body.gstNumber)) {
                errors.push('Invalid GST number format');
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors: errors
                });
            }

            next();
        };
    }

    /**
     * Validate product data
     */
    validateProductData() {
        return (req, res, next) => {
            const { body } = req;
            const errors = [];

            // Required fields validation
            if (!body.name || body.name.trim().length === 0) {
                errors.push('Product name is required');
            }

            if (!body.sku || body.sku.trim().length === 0) {
                errors.push('Product SKU is required');
            }

            if (!body.category) {
                errors.push('Product category is required');
            }

            if (!body.basePrice || body.basePrice <= 0) {
                errors.push('Valid base price is required');
            }

            if (!body.unitOfMeasure) {
                errors.push('Unit of measure is required');
            }

            // Business specific validations
            if (body.hsnCode && !this.isValidHSNCode(body.hsnCode)) {
                errors.push('Invalid HSN code format');
            }

            if (body.gstRate && (body.gstRate < 0 || body.gstRate > 100)) {
                errors.push('GST rate must be between 0 and 100');
            }

            if (body.shelfLife && body.shelfLife < 0) {
                errors.push('Shelf life cannot be negative');
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors: errors
                });
            }

            next();
        };
    }

    /**
     * Validate sales order data
     */
    validateOrderData() {
        return (req, res, next) => {
            const { body } = req;
            const errors = [];

            // Required fields validation
            if (!body.customerId) {
                errors.push('Customer ID is required');
            }

            if (!body.customerTypeId) {
                errors.push('Customer type ID is required');
            }

            if (!body.orderDate) {
                errors.push('Order date is required');
            }

            if (!body.requiredDate) {
                errors.push('Required date is required');
            }

            if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
                errors.push('Order items are required');
            }

            // Validate order items
            if (body.items && Array.isArray(body.items)) {
                body.items.forEach((item, index) => {
                    if (!item.productId) {
                        errors.push(`Item ${index + 1}: Product ID is required`);
                    }

                    if (!item.quantity || item.quantity <= 0) {
                        errors.push(`Item ${index + 1}: Valid quantity is required`);
                    }

                    if (!item.unitPrice || item.unitPrice <= 0) {
                        errors.push(`Item ${index + 1}: Valid unit price is required`);
                    }
                });
            }

            // Date validations
            if (body.orderDate && body.requiredDate) {
                const orderDate = new Date(body.orderDate);
                const requiredDate = new Date(body.requiredDate);

                if (requiredDate < orderDate) {
                    errors.push('Required date cannot be before order date');
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors: errors
                });
            }

            next();
        };
    }

    /**
     * Validate inventory transaction data
     */
    validateInventoryData() {
        return (req, res, next) => {
            const { body } = req;
            const errors = [];

            if (!body.productId) {
                errors.push('Product ID is required');
            }

            if (!body.warehouseId) {
                errors.push('Warehouse ID is required');
            }

            if (body.quantity === undefined || body.quantity === null) {
                errors.push('Quantity is required');
            }

            if (!body.type) {
                errors.push('Transaction type is required');
            }

            const validTypes = ['purchase', 'production', 'sales', 'adjustment', 'transfer', 'return'];
            if (body.type && !validTypes.includes(body.type)) {
                errors.push('Invalid transaction type');
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors: errors
                });
            }

            next();
        };
    }

    /**
     * Error handling middleware for EspoCRM operations
     */
    handleErrors() {
        return (error, req, res, next) => {
            logger.error('EspoCRM operation failed:', error);

            // Handle specific EspoCRM errors
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 400:
                        return res.status(400).json({
                            success: false,
                            error: 'Bad Request',
                            message: data.message || 'Invalid data provided',
                            details: data
                        });

                    case 401:
                        return res.status(401).json({
                            success: false,
                            error: 'Unauthorized',
                            message: 'Authentication failed with CRM system'
                        });

                    case 403:
                        return res.status(403).json({
                            success: false,
                            error: 'Forbidden',
                            message: 'Insufficient permissions for CRM operation'
                        });

                    case 404:
                        return res.status(404).json({
                            success: false,
                            error: 'Not Found',
                            message: data.message || 'Resource not found in CRM'
                        });

                    case 422:
                        return res.status(422).json({
                            success: false,
                            error: 'Validation Error',
                            message: data.message || 'Data validation failed',
                            details: data
                        });

                    case 429:
                        return res.status(429).json({
                            success: false,
                            error: 'Rate Limited',
                            message: 'Too many requests to CRM system'
                        });

                    default:
                        return res.status(500).json({
                            success: false,
                            error: 'CRM Error',
                            message: data.message || 'CRM operation failed'
                        });
                }
            }

            // Handle network errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                return res.status(503).json({
                    success: false,
                    error: 'Service Unavailable',
                    message: 'CRM system is not accessible'
                });
            }

            // Handle timeout errors
            if (error.code === 'ECONNABORTED') {
                return res.status(504).json({
                    success: false,
                    error: 'Gateway Timeout',
                    message: 'CRM operation timed out'
                });
            }

            // Generic error handling
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message || 'An unexpected error occurred'
            });
        };
    }

    /**
     * Add tracking information to requests
     */
    addTracking() {
        return (req, res, next) => {
            req.tracking = {
                requestId: req.headers['x-request-id'] || this.generateRequestId(),
                timestamp: new Date().toISOString(),
                userAgent: req.headers['user-agent'],
                ip: req.ip || req.connection.remoteAddress
            };

            // Add tracking to response headers
            res.set('X-Request-ID', req.tracking.requestId);
            res.set('X-Timestamp', req.tracking.timestamp);

            next();
        };
    }

    /**
     * Log CRM operations
     */
    logOperations() {
        return (req, res, next) => {
            const startTime = Date.now();

            // Log request
            logger.info(`CRM Operation Started: ${req.method} ${req.path}`, {
                requestId: req.tracking?.requestId,
                method: req.method,
                path: req.path,
                query: req.query,
                body: this.sanitizeLogData(req.body)
            });

            // Override res.json to log response
            const originalJson = res.json.bind(res);
            res.json = (data) => {
                const duration = Date.now() - startTime;

                logger.info(`CRM Operation Completed: ${req.method} ${req.path}`, {
                    requestId: req.tracking?.requestId,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                    success: data.success !== false
                });

                return originalJson(data);
            };

            next();
        };
    }

    // ===== UTILITY METHODS =====

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate Indian GST number format
     */
    isValidGSTNumber(gstNumber) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gstNumber);
    }

    /**
     * Validate HSN code format
     */
    isValidHSNCode(hsnCode) {
        const hsnRegex = /^[0-9]{4,8}$/;
        return hsnRegex.test(hsnCode);
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sanitize sensitive data for logging
     */
    sanitizeLogData(data) {
        if (!data || typeof data !== 'object') return data;

        const sanitized = { ...data };
        const sensitiveFields = ['password', 'apiKey', 'secretKey', 'token'];

        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '***REDACTED***';
            }
        });

        return sanitized;
    }
}

module.exports = EspoCRMMiddleware;
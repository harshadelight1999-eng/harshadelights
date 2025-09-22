/**
 * EspoCRM API Client for Harsha Delights Integration
 * Provides seamless integration between API Gateway and EspoCRM
 */

const axios = require('axios');
const logger = require('../../../api-gateway/src/utils/logger');

class EspoCRMClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || process.env.ESPOCRM_URL || 'http://localhost:8080';
        this.apiKey = config.apiKey || process.env.ESPOCRM_API_KEY;
        this.secretKey = config.secretKey || process.env.ESPOCRM_SECRET_KEY;
        this.timeout = config.timeout || 30000;

        this.client = axios.create({
            baseURL: `${this.baseURL}/api/v1`,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.apiKey
            }
        });

        // Request interceptor for authentication
        this.client.interceptors.request.use(
            (config) => {
                if (this.authToken) {
                    config.headers['Authorization'] = `Bearer ${this.authToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    await this.authenticate();
                    return this.client.request(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Authenticate with EspoCRM using API Key
     */
    async authenticate() {
        try {
            const response = await axios.post(`${this.baseURL}/api/v1/App/user`, {}, {
                headers: {
                    'X-Api-Key': this.apiKey,
                    'X-Secret-Key': this.secretKey
                }
            });

            this.authToken = response.data.token;
            logger.info('Successfully authenticated with EspoCRM');
            return this.authToken;
        } catch (error) {
            logger.error('Failed to authenticate with EspoCRM:', error.message);
            throw new Error('EspoCRM authentication failed');
        }
    }

    /**
     * Generic method to get records from any entity
     */
    async getRecords(entityType, params = {}) {
        try {
            const response = await this.client.get(`/${entityType}`, { params });
            return response.data;
        } catch (error) {
            logger.error(`Failed to get ${entityType} records:`, error.message);
            throw error;
        }
    }

    /**
     * Get a specific record by ID
     */
    async getRecord(entityType, id) {
        try {
            const response = await this.client.get(`/${entityType}/${id}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get ${entityType} record ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Create a new record
     */
    async createRecord(entityType, data) {
        try {
            const response = await this.client.post(`/${entityType}`, data);
            logger.info(`Created ${entityType} record:`, response.data.id);
            return response.data;
        } catch (error) {
            logger.error(`Failed to create ${entityType} record:`, error.message);
            throw error;
        }
    }

    /**
     * Update an existing record
     */
    async updateRecord(entityType, id, data) {
        try {
            const response = await this.client.put(`/${entityType}/${id}`, data);
            logger.info(`Updated ${entityType} record:`, id);
            return response.data;
        } catch (error) {
            logger.error(`Failed to update ${entityType} record ${id}:`, error.message);
            throw error;
        }
    }

    /**
     * Delete a record
     */
    async deleteRecord(entityType, id) {
        try {
            await this.client.delete(`/${entityType}/${id}`);
            logger.info(`Deleted ${entityType} record:`, id);
            return true;
        } catch (error) {
            logger.error(`Failed to delete ${entityType} record ${id}:`, error.message);
            throw error;
        }
    }

    // ===== CUSTOMER MANAGEMENT METHODS =====

    /**
     * Create or update customer (Account)
     */
    async syncCustomer(customerData) {
        try {
            const existingCustomer = await this.findCustomerByEmail(customerData.emailAddress);

            if (existingCustomer) {
                return await this.updateRecord('Account', existingCustomer.id, customerData);
            } else {
                return await this.createRecord('Account', customerData);
            }
        } catch (error) {
            logger.error('Failed to sync customer:', error.message);
            throw error;
        }
    }

    /**
     * Find customer by email
     */
    async findCustomerByEmail(email) {
        try {
            const response = await this.getRecords('Account', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'emailAddress',
                        value: email
                    }
                ],
                maxSize: 1
            });

            return response.list.length > 0 ? response.list[0] : null;
        } catch (error) {
            logger.error('Failed to find customer by email:', error.message);
            throw error;
        }
    }

    /**
     * Get customer types for B2B/B2C segmentation
     */
    async getCustomerTypes() {
        try {
            return await this.getRecords('CustomerType', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'isActive',
                        value: true
                    }
                ]
            });
        } catch (error) {
            logger.error('Failed to get customer types:', error.message);
            throw error;
        }
    }

    // ===== PRODUCT MANAGEMENT METHODS =====

    /**
     * Sync product data
     */
    async syncProduct(productData) {
        try {
            const existingProduct = await this.findProductBySku(productData.sku);

            if (existingProduct) {
                return await this.updateRecord('ConfectioneryProduct', existingProduct.id, productData);
            } else {
                return await this.createRecord('ConfectioneryProduct', productData);
            }
        } catch (error) {
            logger.error('Failed to sync product:', error.message);
            throw error;
        }
    }

    /**
     * Find product by SKU
     */
    async findProductBySku(sku) {
        try {
            const response = await this.getRecords('ConfectioneryProduct', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'sku',
                        value: sku
                    }
                ],
                maxSize: 1
            });

            return response.list.length > 0 ? response.list[0] : null;
        } catch (error) {
            logger.error('Failed to find product by SKU:', error.message);
            throw error;
        }
    }

    /**
     * Get active products by category
     */
    async getProductsByCategory(category) {
        try {
            return await this.getRecords('ConfectioneryProduct', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'category',
                        value: category
                    },
                    {
                        type: 'equals',
                        attribute: 'isActive',
                        value: true
                    }
                ]
            });
        } catch (error) {
            logger.error(`Failed to get products for category ${category}:`, error.message);
            throw error;
        }
    }

    // ===== ORDER MANAGEMENT METHODS =====

    /**
     * Create sales order
     */
    async createSalesOrder(orderData) {
        try {
            const order = await this.createRecord('SalesOrder', orderData);

            // Create order items if provided
            if (orderData.items && orderData.items.length > 0) {
                for (let i = 0; i < orderData.items.length; i++) {
                    const itemData = {
                        ...orderData.items[i],
                        salesOrderId: order.id,
                        lineNumber: i + 1
                    };
                    await this.createRecord('SalesOrderItem', itemData);
                }
            }

            return order;
        } catch (error) {
            logger.error('Failed to create sales order:', error.message);
            throw error;
        }
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status, notes = null) {
        try {
            const updateData = { status };
            if (notes) {
                updateData.internalNotes = notes;
            }

            return await this.updateRecord('SalesOrder', orderId, updateData);
        } catch (error) {
            logger.error(`Failed to update order ${orderId} status:`, error.message);
            throw error;
        }
    }

    /**
     * Get orders by status
     */
    async getOrdersByStatus(status) {
        try {
            return await this.getRecords('SalesOrder', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'status',
                        value: status
                    }
                ]
            });
        } catch (error) {
            logger.error(`Failed to get orders with status ${status}:`, error.message);
            throw error;
        }
    }

    // ===== INVENTORY MANAGEMENT METHODS =====

    /**
     * Update inventory levels
     */
    async updateInventory(productId, warehouseId, quantity, type = 'adjustment') {
        try {
            // Find existing inventory item
            const inventoryResponse = await this.getRecords('InventoryItem', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'productId',
                        value: productId
                    },
                    {
                        type: 'equals',
                        attribute: 'warehouseId',
                        value: warehouseId
                    }
                ],
                maxSize: 1
            });

            let inventoryItem;
            if (inventoryResponse.list.length > 0) {
                inventoryItem = inventoryResponse.list[0];
                const newStock = inventoryItem.currentStock + quantity;

                await this.updateRecord('InventoryItem', inventoryItem.id, {
                    currentStock: Math.max(0, newStock),
                    lastMovementDate: new Date().toISOString()
                });
            } else {
                // Create new inventory item
                inventoryItem = await this.createRecord('InventoryItem', {
                    productId,
                    warehouseId,
                    currentStock: Math.max(0, quantity),
                    lastMovementDate: new Date().toISOString()
                });
            }

            // Create inventory transaction record
            await this.createRecord('InventoryTransaction', {
                inventoryItemId: inventoryItem.id,
                type,
                quantity,
                transactionDate: new Date().toISOString()
            });

            return inventoryItem;
        } catch (error) {
            logger.error('Failed to update inventory:', error.message);
            throw error;
        }
    }

    /**
     * Get current inventory levels
     */
    async getInventoryLevels(productId = null, warehouseId = null) {
        try {
            const where = [];

            if (productId) {
                where.push({
                    type: 'equals',
                    attribute: 'productId',
                    value: productId
                });
            }

            if (warehouseId) {
                where.push({
                    type: 'equals',
                    attribute: 'warehouseId',
                    value: warehouseId
                });
            }

            return await this.getRecords('InventoryItem', { where });
        } catch (error) {
            logger.error('Failed to get inventory levels:', error.message);
            throw error;
        }
    }

    // ===== QUALITY MANAGEMENT METHODS =====

    /**
     * Create quality check
     */
    async createQualityCheck(qcData) {
        try {
            return await this.createRecord('QualityCheck', qcData);
        } catch (error) {
            logger.error('Failed to create quality check:', error.message);
            throw error;
        }
    }

    /**
     * Update quality check results
     */
    async updateQualityCheckResults(qcId, results) {
        try {
            return await this.updateRecord('QualityCheck', qcId, results);
        } catch (error) {
            logger.error('Failed to update quality check results:', error.message);
            throw error;
        }
    }

    /**
     * Get pending quality checks
     */
    async getPendingQualityChecks() {
        try {
            return await this.getRecords('QualityCheck', {
                where: [
                    {
                        type: 'in',
                        attribute: 'status',
                        value: ['pending', 'in_progress']
                    }
                ]
            });
        } catch (error) {
            logger.error('Failed to get pending quality checks:', error.message);
            throw error;
        }
    }

    // ===== PRICING METHODS =====

    /**
     * Get pricing for customer type and product
     */
    async getCustomerPricing(customerId, productId, quantity = 1) {
        try {
            // Get customer type
            const customer = await this.getRecord('Account', customerId);
            if (!customer || !customer.customerTypeId) {
                throw new Error('Customer type not found');
            }

            const customerType = await this.getRecord('CustomerType', customer.customerTypeId);
            const product = await this.getRecord('ConfectioneryProduct', productId);

            // Calculate pricing based on customer type and quantity
            let price = product.basePrice;

            // Apply customer type multiplier
            if (customerType.pricingMultiplier) {
                price *= customerType.pricingMultiplier;
            }

            // Apply customer type discount
            if (customerType.discountPercentage) {
                price *= (1 - customerType.discountPercentage / 100);
            }

            // TODO: Apply quantity breaks, seasonal adjustments, etc.

            return {
                basePrice: product.basePrice,
                finalPrice: price,
                currency: 'INR',
                customerType: customerType.name,
                discountApplied: customerType.discountPercentage || 0
            };
        } catch (error) {
            logger.error('Failed to get customer pricing:', error.message);
            throw error;
        }
    }

    // ===== REPORTING METHODS =====

    /**
     * Get sales summary
     */
    async getSalesSummary(startDate, endDate) {
        try {
            return await this.getRecords('SalesOrder', {
                where: [
                    {
                        type: 'between',
                        attribute: 'orderDate',
                        value: [startDate, endDate]
                    },
                    {
                        type: 'notEquals',
                        attribute: 'status',
                        value: 'cancelled'
                    }
                ]
            });
        } catch (error) {
            logger.error('Failed to get sales summary:', error.message);
            throw error;
        }
    }

    /**
     * Get inventory alerts (low stock, expiring items)
     */
    async getInventoryAlerts() {
        try {
            const lowStockItems = await this.getRecords('InventoryItem', {
                where: [
                    {
                        type: 'lessThan',
                        attribute: 'currentStock',
                        value: 'minimumLevel'
                    }
                ]
            });

            const expiringItems = await this.getRecords('InventoryItem', {
                where: [
                    {
                        type: 'between',
                        attribute: 'expiryDate',
                        value: [new Date().toISOString().split('T')[0],
                               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
                    }
                ]
            });

            return {
                lowStock: lowStockItems.list,
                expiring: expiringItems.list
            };
        } catch (error) {
            logger.error('Failed to get inventory alerts:', error.message);
            throw error;
        }
    }
}

module.exports = EspoCRMClient;
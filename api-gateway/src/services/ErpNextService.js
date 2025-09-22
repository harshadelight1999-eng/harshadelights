/**
 * ERPNext Integration Service
 * Handles communication with ERPNext system for Harsha Delights
 */

const axios = require('axios');
const { logger } = require("../utils/logger");
const config = require('../config');
const { getErpNextPool } = require('../config/database');
const { CircuitBreaker } = require('./CircuitBreaker');

class ErpNextService {
  constructor() {
    this.baseUrl = config.services.erpNext.baseUrl;
    this.apiKey = config.services.erpNext.apiKey;
    this.apiSecret = config.services.erpNext.apiSecret;
    this.timeout = config.services.erpNext.timeout;
    this.dbPool = getErpNextPool();

    // Create HTTP client with default configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add authentication interceptor
    this.client.interceptors.request.use((config) => {
      if (this.apiKey && this.apiSecret) {
        config.headers.Authorization = `token ${this.apiKey}:${this.apiSecret}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('ERPNext API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );

    // Create circuit breaker for ERPNext API
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 60000
    });

    logger.info('✅ ERPNext Service initialized');
  }

  /**
   * Generic API call method with circuit breaker protection
   */
  async apiCall(method, endpoint, data = null, params = {}) {
    return this.circuitBreaker.execute(async () => {
      const config = {
        method,
        url: endpoint,
        params,
        ...(data && { data })
      };

      const response = await this.client.request(config);
      return response.data;
    });
  }

  // ===================================================================================
  // CUSTOMER MANAGEMENT
  // ===================================================================================

  /**
   * Get customers with pagination and filters
   */
  async getCustomers(options = {}) {
    const {
      limit = 20,
      offset = 0,
      filters = {},
      fields = ['name', 'customer_name', 'customer_type', 'territory', 'customer_group'],
      orderBy = 'modified desc'
    } = options;

    try {
      const params = {
        limit_start: offset,
        limit_page_length: limit,
        fields: JSON.stringify(fields),
        order_by: orderBy
      };

      if (Object.keys(filters).length > 0) {
        params.filters = JSON.stringify(filters);
      }

      const result = await this.apiCall('GET', '/api/resource/Customer', null, params);

      // Enhance with segment information from our custom tables
      if (result.data && Array.isArray(result.data)) {
        for (const customer of result.data) {
          customer.segments = await this.getCustomerSegments(customer.name);
        }
      }

      return {
        success: true,
        customers: result.data || [],
        total: result.total || 0,
        hasMore: result.data && result.data.length === limit
      };

    } catch (error) {
      logger.error('Get customers error:', error);
      return {
        success: false,
        error: error.message,
        customers: []
      };
    }
  }

  /**
   * Get specific customer by ID
   */
  async getCustomer(customerId) {
    try {
      const result = await this.apiCall('GET', `/api/resource/Customer/${customerId}`);

      if (result.data) {
        // Add segment information
        result.data.segments = await this.getCustomerSegments(customerId);

        // Add recent orders
        result.data.recentOrders = await this.getCustomerOrders(customerId, { limit: 5 });
      }

      return {
        success: true,
        customer: result.data
      };

    } catch (error) {
      logger.error('Get customer error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get customer segments from our custom tables
   */
  async getCustomerSegments(customerId) {
    try {
      const connection = await this.dbPool.getConnection();

      const [segments] = await connection.execute(`
        SELECT
          cs.segment_code,
          cs.segment_name,
          cs.segment_type,
          cs.discount_percentage,
          csa.is_primary,
          csa.assignment_date
        FROM \`tabHD Customer Segment Assignment\` csa
        JOIN \`tabHD Customer Segment\` cs ON csa.customer_segment = cs.name
        WHERE csa.customer = ?
          AND csa.status = 'Active'
          AND (csa.effective_to IS NULL OR csa.effective_to >= CURDATE())
        ORDER BY csa.is_primary DESC, csa.assignment_date DESC
      `, [customerId]);

      connection.release();

      return segments;

    } catch (error) {
      logger.error('Get customer segments error:', error);
      return [];
    }
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId, options = {}) {
    const {
      limit = 10,
      status = null,
      fromDate = null,
      toDate = null
    } = options;

    try {
      const filters = { customer: customerId };
      if (status) filters.status = status;
      if (fromDate) filters.transaction_date = ['>=', fromDate];
      if (toDate) filters.transaction_date = ['<=', toDate];

      const params = {
        limit_page_length: limit,
        fields: JSON.stringify([
          'name', 'transaction_date', 'status', 'grand_total',
          'delivery_date', 'currency'
        ]),
        filters: JSON.stringify(filters),
        order_by: 'transaction_date desc'
      };

      const result = await this.apiCall('GET', '/api/resource/Sales Order', null, params);

      return result.data || [];

    } catch (error) {
      logger.error('Get customer orders error:', error);
      return [];
    }
  }

  // ===================================================================================
  // ITEM MANAGEMENT
  // ===================================================================================

  /**
   * Get items with confectionery-specific information
   */
  async getItems(options = {}) {
    const {
      limit = 20,
      offset = 0,
      itemGroup = null,
      hasBatchNo = null,
      isStockItem = true,
      filters = {}
    } = options;

    try {
      const baseFilters = { is_stock_item: isStockItem };
      if (itemGroup) baseFilters.item_group = itemGroup;
      if (hasBatchNo !== null) baseFilters.has_batch_no = hasBatchNo;

      const combinedFilters = { ...baseFilters, ...filters };

      const params = {
        limit_start: offset,
        limit_page_length: limit,
        fields: JSON.stringify([
          'name', 'item_name', 'item_group', 'stock_uom',
          'has_batch_no', 'shelf_life_in_days', 'brand',
          'standard_rate', 'valuation_rate', 'is_stock_item'
        ]),
        filters: JSON.stringify(combinedFilters),
        order_by: 'modified desc'
      };

      const result = await this.apiCall('GET', '/api/resource/Item', null, params);

      // Enhance with batch information for items with batch tracking
      if (result.data && Array.isArray(result.data)) {
        for (const item of result.data) {
          if (item.has_batch_no) {
            item.batches = await this.getItemBatches(item.name, { limit: 5 });
          }
        }
      }

      return {
        success: true,
        items: result.data || [],
        total: result.total || 0,
        hasMore: result.data && result.data.length === limit
      };

    } catch (error) {
      logger.error('Get items error:', error);
      return {
        success: false,
        error: error.message,
        items: []
      };
    }
  }

  /**
   * Get item batches with confectionery-specific information
   */
  async getItemBatches(itemCode, options = {}) {
    const {
      warehouse = null,
      expiryDays = null,
      limit = 10
    } = options;

    try {
      const connection = await this.dbPool.getConnection();

      let query = `
        SELECT
          bm.batch_id,
          bm.warehouse,
          bm.manufacturing_date,
          bm.expiry_date,
          bm.available_qty,
          bm.quality_grade,
          bm.sugar_content_percentage,
          bm.fat_content_percentage,
          bm.moisture_content_percentage,
          bm.status,
          DATEDIFF(bm.expiry_date, CURDATE()) as days_to_expiry
        FROM \`tabHD Batch Master\` bm
        WHERE bm.item = ?
          AND bm.status = 'Active'
          AND bm.available_qty > 0
      `;

      const params = [itemCode];

      if (warehouse) {
        query += ' AND bm.warehouse = ?';
        params.push(warehouse);
      }

      if (expiryDays !== null) {
        query += ' AND DATEDIFF(bm.expiry_date, CURDATE()) <= ?';
        params.push(expiryDays);
      }

      query += ' ORDER BY bm.expiry_date ASC LIMIT ?';
      params.push(limit);

      const [batches] = await connection.execute(query, params);
      connection.release();

      return batches;

    } catch (error) {
      logger.error('Get item batches error:', error);
      return [];
    }
  }

  // ===================================================================================
  // INVENTORY MANAGEMENT
  // ===================================================================================

  /**
   * Get real-time stock levels
   */
  async getStockLevels(options = {}) {
    const {
      warehouse = null,
      itemCode = null,
      limit = 50
    } = options;

    try {
      const filters = {};
      if (warehouse) filters.warehouse = warehouse;
      if (itemCode) filters.item_code = itemCode;

      const params = {
        limit_page_length: limit,
        fields: JSON.stringify([
          'item_code', 'warehouse', 'actual_qty', 'reserved_qty',
          'ordered_qty', 'projected_qty', 'valuation_rate'
        ]),
        filters: JSON.stringify(filters),
        order_by: 'item_code'
      };

      const result = await this.apiCall('GET', '/api/resource/Bin', null, params);

      // Enhance with batch details for batch-tracked items
      if (result.data && Array.isArray(result.data)) {
        for (const stock of result.data) {
          // Check if item has batch tracking
          const itemDetails = await this.getItem(stock.item_code);
          if (itemDetails.success && itemDetails.item.has_batch_no) {
            stock.batches = await this.getItemBatches(stock.item_code, { warehouse: stock.warehouse });
          }
        }
      }

      return {
        success: true,
        stockLevels: result.data || []
      };

    } catch (error) {
      logger.error('Get stock levels error:', error);
      return {
        success: false,
        error: error.message,
        stockLevels: []
      };
    }
  }

  /**
   * Get batches expiring soon
   */
  async getExpiringBatches(days = 30, warehouse = null) {
    try {
      const connection = await this.dbPool.getConnection();

      let query = `
        SELECT
          bm.batch_id,
          bm.item,
          bm.item_name,
          bm.warehouse,
          bm.manufacturing_date,
          bm.expiry_date,
          bm.available_qty,
          bm.unit_cost,
          (bm.available_qty * bm.unit_cost) as potential_loss_value,
          DATEDIFF(bm.expiry_date, CURDATE()) as days_to_expiry,
          CASE
            WHEN DATEDIFF(bm.expiry_date, CURDATE()) <= 0 THEN 'Expired'
            WHEN DATEDIFF(bm.expiry_date, CURDATE()) <= 7 THEN 'Critical'
            WHEN DATEDIFF(bm.expiry_date, CURDATE()) <= 30 THEN 'Warning'
            ELSE 'Normal'
          END as alert_level
        FROM \`tabHD Batch Master\` bm
        WHERE bm.status = 'Active'
          AND bm.available_qty > 0
          AND DATEDIFF(bm.expiry_date, CURDATE()) <= ?
      `;

      const params = [days];

      if (warehouse) {
        query += ' AND bm.warehouse = ?';
        params.push(warehouse);
      }

      query += ' ORDER BY days_to_expiry ASC, potential_loss_value DESC';

      const [batches] = await connection.execute(query, params);
      connection.release();

      return {
        success: true,
        expiringBatches: batches
      };

    } catch (error) {
      logger.error('Get expiring batches error:', error);
      return {
        success: false,
        error: error.message,
        expiringBatches: []
      };
    }
  }

  // ===================================================================================
  // PRICING ENGINE
  // ===================================================================================

  /**
   * Calculate dynamic pricing for items
   */
  async calculatePricing(pricingRequest) {
    const { customer, items, date = new Date().toISOString().split('T')[0] } = pricingRequest;

    try {
      // Get customer segments for pricing rules
      const customerSegments = await this.getCustomerSegments(customer);

      const pricingResults = [];

      for (const item of items) {
        const itemPricing = await this.calculateItemPricing(
          customer,
          customerSegments,
          item,
          date
        );
        pricingResults.push(itemPricing);
      }

      return {
        success: true,
        customer,
        date,
        pricing: pricingResults,
        totalBeforeDiscount: pricingResults.reduce((sum, p) => sum + (p.base_rate * p.qty), 0),
        totalDiscount: pricingResults.reduce((sum, p) => sum + (p.discount_amount || 0), 0),
        totalAfterDiscount: pricingResults.reduce((sum, p) => sum + (p.final_amount || 0), 0)
      };

    } catch (error) {
      logger.error('Calculate pricing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate pricing for individual item
   */
  async calculateItemPricing(customer, customerSegments, item, date) {
    const { item_code, qty, warehouse } = item;

    try {
      // Get base rate from item price list
      const baseRate = await this.getItemBaseRate(item_code, customer);

      // Get applicable pricing rules
      const pricingRules = await this.getApplicablePricingRules(
        customer,
        customerSegments,
        item_code,
        qty,
        date
      );

      let finalRate = baseRate;
      let discountPercentage = 0;
      let discountAmount = 0;
      const appliedRules = [];

      // Apply pricing rules in priority order
      for (const rule of pricingRules) {
        if (rule.rate_or_discount === 'Discount Percentage') {
          discountPercentage += rule.discount_percentage;
          appliedRules.push({
            rule_code: rule.rule_code,
            rule_name: rule.rule_name,
            discount_percentage: rule.discount_percentage
          });
        } else if (rule.rate_or_discount === 'Discount Amount') {
          discountAmount += rule.discount_amount;
          appliedRules.push({
            rule_code: rule.rule_code,
            rule_name: rule.rule_name,
            discount_amount: rule.discount_amount
          });
        } else if (rule.rate_or_discount === 'Rate') {
          finalRate = rule.rate;
          appliedRules.push({
            rule_code: rule.rule_code,
            rule_name: rule.rule_name,
            fixed_rate: rule.rate
          });
        }
      }

      // Calculate final pricing
      if (discountPercentage > 0) {
        finalRate = baseRate * (1 - discountPercentage / 100);
      }

      if (discountAmount > 0) {
        finalRate = Math.max(0, finalRate - discountAmount);
      }

      const finalAmount = finalRate * qty;
      const totalDiscountAmount = (baseRate * qty) - finalAmount;

      return {
        item_code,
        qty,
        warehouse,
        base_rate: baseRate,
        discount_percentage: discountPercentage,
        discount_amount: totalDiscountAmount,
        final_rate: finalRate,
        final_amount: finalAmount,
        pricing_rules_applied: appliedRules
      };

    } catch (error) {
      logger.error('Calculate item pricing error:', error);
      return {
        item_code,
        qty,
        base_rate: 0,
        final_rate: 0,
        final_amount: 0,
        error: error.message
      };
    }
  }

  /**
   * Get item base rate from price list
   */
  async getItemBaseRate(itemCode, customer) {
    try {
      // Get customer's default price list
      const customerData = await this.getCustomer(customer);
      const priceList = customerData.customer?.default_price_list || 'Standard Selling';

      const params = {
        fields: JSON.stringify(['price_list_rate']),
        filters: JSON.stringify({
          item_code: itemCode,
          price_list: priceList,
          valid_from: ['<=', new Date().toISOString().split('T')[0]]
        }),
        order_by: 'valid_from desc',
        limit_page_length: 1
      };

      const result = await this.apiCall('GET', '/api/resource/Item Price', null, params);

      if (result.data && result.data.length > 0) {
        return result.data[0].price_list_rate;
      }

      // Fallback to item standard rate
      const itemResult = await this.apiCall('GET', `/api/resource/Item/${itemCode}`, null, {
        fields: JSON.stringify(['standard_rate'])
      });

      return itemResult.data?.standard_rate || 0;

    } catch (error) {
      logger.error('Get item base rate error:', error);
      return 0;
    }
  }

  /**
   * Get applicable pricing rules
   */
  async getApplicablePricingRules(customer, customerSegments, itemCode, qty, date) {
    try {
      const connection = await this.dbPool.getConnection();

      let query = `
        SELECT
          dpr.*
        FROM \`tabHD Dynamic Pricing Rule\` dpr
        WHERE dpr.is_active = 1
          AND dpr.valid_from <= ?
          AND (dpr.valid_to IS NULL OR dpr.valid_to >= ?)
          AND (dpr.min_qty IS NULL OR dpr.min_qty <= ?)
          AND (dpr.max_qty IS NULL OR dpr.max_qty >= ?)
        ORDER BY dpr.priority DESC
      `;

      const [rules] = await connection.execute(query, [date, date, qty, qty]);
      connection.release();

      // Filter rules based on customer, segments, and items
      const applicableRules = [];

      for (const rule of rules) {
        let isApplicable = false;

        // Check customer/segment applicability
        if (rule.applicable_for === 'Customer' && rule.apply_on === customer) {
          isApplicable = true;
        } else if (rule.applicable_for === 'Customer Group') {
          // Check if customer belongs to the group
          isApplicable = await this.checkCustomerGroup(customer, rule.apply_on);
        } else if (customerSegments.some(seg => seg.segment_code === rule.apply_on)) {
          isApplicable = true;
        }

        if (isApplicable) {
          // Check item applicability
          const itemApplicable = await this.checkItemApplicability(rule, itemCode);
          if (itemApplicable) {
            applicableRules.push(rule);
          }
        }
      }

      return applicableRules;

    } catch (error) {
      logger.error('Get applicable pricing rules error:', error);
      return [];
    }
  }

  /**
   * Check if customer belongs to specified group
   */
  async checkCustomerGroup(customer, customerGroup) {
    try {
      const customerData = await this.getCustomer(customer);
      return customerData.customer?.customer_group === customerGroup;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if item is applicable for pricing rule
   */
  async checkItemApplicability(rule, itemCode) {
    if (rule.apply_on === 'Item Code') {
      // Check in rule items table
      return true; // Simplified - would check against tabHD Pricing Rule Item
    }

    if (rule.apply_on === 'Item Group') {
      // Get item group and check
      const itemData = await this.getItem(itemCode);
      return itemData.item?.item_group === rule.apply_on;
    }

    return false;
  }

  /**
   * Get specific item details
   */
  async getItem(itemCode) {
    try {
      const result = await this.apiCall('GET', `/api/resource/Item/${itemCode}`);
      return {
        success: true,
        item: result.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===================================================================================
  // ORDER MANAGEMENT
  // ===================================================================================

  /**
   * Create sales order
   */
  async createSalesOrder(orderData) {
    try {
      const result = await this.apiCall('POST', '/api/resource/Sales Order', orderData);

      // Log order creation
      logger.info(`✅ Sales Order created: ${result.data.name}`);

      return {
        success: true,
        salesOrder: result.data
      };

    } catch (error) {
      logger.error('Create sales order error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get sales orders with filters
   */
  async getSalesOrders(options = {}) {
    const {
      limit = 20,
      offset = 0,
      customer = null,
      status = null,
      fromDate = null,
      toDate = null
    } = options;

    try {
      const filters = {};
      if (customer) filters.customer = customer;
      if (status) filters.status = status;
      if (fromDate) filters.transaction_date = ['>=', fromDate];
      if (toDate) filters.transaction_date = ['<=', toDate];

      const params = {
        limit_start: offset,
        limit_page_length: limit,
        fields: JSON.stringify([
          'name', 'customer', 'transaction_date', 'delivery_date',
          'status', 'grand_total', 'currency', 'territory'
        ]),
        filters: JSON.stringify(filters),
        order_by: 'transaction_date desc'
      };

      const result = await this.apiCall('GET', '/api/resource/Sales Order', null, params);

      return {
        success: true,
        orders: result.data || [],
        total: result.total || 0
      };

    } catch (error) {
      logger.error('Get sales orders error:', error);
      return {
        success: false,
        error: error.message,
        orders: []
      };
    }
  }

  // ===================================================================================
  // UTILITY METHODS
  // ===================================================================================

  /**
   * Test ERPNext connectivity
   */
  async testConnection() {
    try {
      const result = await this.apiCall('GET', '/api/method/frappe.utils.get_datetime');
      return {
        success: true,
        timestamp: result.message,
        message: 'ERPNext connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'ERPNext connection failed'
      };
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo() {
    try {
      const result = await this.apiCall('GET', '/api/method/frappe.utils.get_system_info');
      return {
        success: true,
        systemInfo: result.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (this.dbPool) {
        await this.dbPool.end();
        logger.info('✅ ERPNext database pool closed');
      }
    } catch (error) {
      logger.error('ERPNext service cleanup error:', error);
    }
  }
}

module.exports = ErpNextService;

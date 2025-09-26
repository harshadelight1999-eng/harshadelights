/**
 * End-to-End Workflow Integration Tests
 * Tests complete business workflows from order creation to fulfillment
 */

const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');
const WebSocket = require('ws');

describe('End-to-End Business Workflow Tests', function() {
  let apiGatewayApp;
  let publicWebsiteApp;
  let erpnextConnection;
  let websocketClient;
  let testWorkflowData;
  let workflowMessages = [];

  before(async function() {
    this.timeout(15000);
    
    // Initialize applications
    apiGatewayApp = require('../../api-gateway/src/app');
    publicWebsiteApp = require('../../frontend-applications/01-public-website/server');
    
    // Setup database connection
    erpnextConnection = await mysql.createConnection({
      host: process.env.ERPNEXT_DB_HOST || 'localhost',
      port: process.env.ERPNEXT_DB_PORT || 3306,
      user: process.env.ERPNEXT_DB_USER || 'root',
      password: process.env.ERPNEXT_DB_PASSWORD || '',
      database: process.env.ERPNEXT_DB_NAME || 'erpnext_test'
    });
    
    // Setup WebSocket for real-time updates
    await setupWebSocketClient();
    
    // Initialize test workflow data
    await setupWorkflowTestData();
  });

  after(async function() {
    await cleanupWorkflowTestData();
    
    if (websocketClient) {
      websocketClient.close();
    }
    
    if (erpnextConnection) {
      await erpnextConnection.end();
    }
  });

  async function setupWebSocketClient() {
    return new Promise((resolve, reject) => {
      const wsUrl = process.env.SYNC_WS_URL || 'ws://localhost:3001';
      websocketClient = new WebSocket(wsUrl);

      websocketClient.on('open', () => {
        websocketClient.send(JSON.stringify({
          type: 'subscribe',
          channels: ['orders:updates', 'inventory:updates', 'customers:updates', 'sync:status']
        }));
        resolve();
      });

      websocketClient.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          workflowMessages.push({ ...message, timestamp: new Date() });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      websocketClient.on('error', reject);
      setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
    });
  }

  async function setupWorkflowTestData() {
    testWorkflowData = {
      customer: {
        id: 'E2E-CUSTOMER-001',
        name: 'E2E Test Customer',
        email: 'e2e.test@harshadelights.com',
        phone: '+91-9876543210',
        address: {
          street: 'Test Street 123',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          postalCode: '400001'
        }
      },
      items: [
        {
          item_code: 'E2E-KAJU-KATLI',
          item_name: 'Premium Kaju Katli',
          item_group: 'Traditional Sweets',
          standard_rate: 800.00,
          has_batch_no: 1,
          shelf_life_in_days: 15
        },
        {
          item_code: 'E2E-GULAB-JAMUN',
          item_name: 'Fresh Gulab Jamun',
          item_group: 'Traditional Sweets',
          standard_rate: 400.00,
          has_batch_no: 1,
          shelf_life_in_days: 7
        }
      ],
      batches: [
        {
          batch_id: 'E2E-BATCH-001',
          item: 'E2E-KAJU-KATLI',
          warehouse: 'Main Store',
          batch_size: 50,
          available_qty: 45,
          manufacturing_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          quality_grade: 'A'
        },
        {
          batch_id: 'E2E-BATCH-002',
          item: 'E2E-GULAB-JAMUN',
          warehouse: 'Main Store',
          batch_size: 30,
          available_qty: 25,
          manufacturing_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          quality_grade: 'A+'
        }
      ],
      pricingRule: {
        rule_code: 'E2E-BULK-DISCOUNT',
        rule_name: 'E2E Bulk Order Discount',
        rule_type: 'Volume Discount',
        applicable_for: 'All Customers',
        apply_on: 'All Items',
        min_qty: 10,
        rate_or_discount: 'Discount Percentage',
        discount_percentage: 12.00,
        is_active: 1,
        valid_from: new Date().toISOString().split('T')[0]
      }
    };

    // Create test data in database
    await createTestCustomer();
    await createTestItems();
    await createTestBatches();
    await createTestPricingRule();
  }

  async function createTestCustomer() {
    await erpnextConnection.execute(`
      INSERT INTO \`tabCustomer\` (name, customer_name, customer_type, customer_group, territory, email_id, mobile_no, creation, modified, owner, modified_by)
      VALUES (?, ?, 'Individual', 'Retail', 'Mumbai', ?, ?, NOW(), NOW(), 'Administrator', 'Administrator')
      ON DUPLICATE KEY UPDATE modified = NOW()
    `, [
      testWorkflowData.customer.id,
      testWorkflowData.customer.name,
      testWorkflowData.customer.email,
      testWorkflowData.customer.phone
    ]);
  }

  async function createTestItems() {
    for (const item of testWorkflowData.items) {
      await erpnextConnection.execute(`
        INSERT INTO \`tabItem\` (name, item_code, item_name, item_group, stock_uom, is_stock_item, has_batch_no, standard_rate, shelf_life_in_days, creation, modified, owner, modified_by)
        VALUES (?, ?, ?, ?, 'Kg', 1, ?, ?, ?, NOW(), NOW(), 'Administrator', 'Administrator')
        ON DUPLICATE KEY UPDATE modified = NOW()
      `, [
        item.item_code, item.item_code, item.item_name, item.item_group,
        item.has_batch_no, item.standard_rate, item.shelf_life_in_days
      ]);
    }
  }

  async function createTestBatches() {
    for (const batch of testWorkflowData.batches) {
      await erpnextConnection.execute(`
        INSERT INTO \`tabHD Batch Master\` (name, batch_id, item, warehouse, batch_size, available_qty, manufacturing_date, expiry_date, quality_grade, status, creation, modified, owner, modified_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', NOW(), NOW(), 'Administrator', 'Administrator')
        ON DUPLICATE KEY UPDATE modified = NOW()
      `, [
        batch.batch_id, batch.batch_id, batch.item, batch.warehouse,
        batch.batch_size, batch.available_qty, batch.manufacturing_date,
        batch.expiry_date, batch.quality_grade
      ]);
    }
  }

  async function createTestPricingRule() {
    const rule = testWorkflowData.pricingRule;
    await erpnextConnection.execute(`
      INSERT INTO \`tabHD Dynamic Pricing Rule\` (
        name, rule_code, rule_name, rule_type, applicable_for, apply_on,
        min_qty, rate_or_discount, discount_percentage, is_active, valid_from,
        status, priority, creation, modified, owner, modified_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 1, NOW(), NOW(), 'Administrator', 'Administrator')
      ON DUPLICATE KEY UPDATE modified = NOW()
    `, [
      rule.rule_code, rule.rule_code, rule.rule_name, rule.rule_type,
      rule.applicable_for, rule.apply_on, rule.min_qty, rule.rate_or_discount,
      rule.discount_percentage, rule.is_active, rule.valid_from
    ]);
  }

  async function cleanupWorkflowTestData() {
    try {
      // Clean up in reverse dependency order
      await erpnextConnection.execute('DELETE FROM `tabSales Order Item` WHERE parent IN (SELECT name FROM `tabSales Order` WHERE customer = ?)', [testWorkflowData.customer.id]);
      await erpnextConnection.execute('DELETE FROM `tabSales Order` WHERE customer = ?', [testWorkflowData.customer.id]);
      await erpnextConnection.execute('DELETE FROM `tabHD Batch Consumption Log` WHERE batch_id IN (?, ?)', ['E2E-BATCH-001', 'E2E-BATCH-002']);
      await erpnextConnection.execute('DELETE FROM `tabHD Dynamic Pricing Rule` WHERE name = ?', [testWorkflowData.pricingRule.rule_code]);
      await erpnextConnection.execute('DELETE FROM `tabHD Batch Master` WHERE batch_id IN (?, ?)', ['E2E-BATCH-001', 'E2E-BATCH-002']);
      
      for (const item of testWorkflowData.items) {
        await erpnextConnection.execute('DELETE FROM `tabItem` WHERE name = ?', [item.item_code]);
      }
      
      await erpnextConnection.execute('DELETE FROM `tabAddress` WHERE address_title LIKE ?', [`${testWorkflowData.customer.name}%`]);
      await erpnextConnection.execute('DELETE FROM `tabCustomer` WHERE name = ?', [testWorkflowData.customer.id]);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  describe('Complete Order Lifecycle Workflow', function() {
    let orderId;
    let orderTotal;

    it('should browse products on public website', async function() {
      this.timeout(5000);
      
      const response = await request(publicWebsiteApp)
        .get('/api/products')
        .query({ category: 'Traditional Sweets' })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.products).to.be.an('array');
      
      // Should include our test items
      const testItems = response.body.products.filter(p => 
        testWorkflowData.items.some(ti => ti.item_code === p.item_code)
      );
      
      expect(testItems.length).to.be.greaterThan(0);
    });

    it('should calculate dynamic pricing for cart items', async function() {
      const cartItems = [
        { item_code: 'E2E-KAJU-KATLI', qty: 15 }, // Should trigger bulk discount
        { item_code: 'E2E-GULAB-JAMUN', qty: 8 }
      ];

      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testWorkflowData.customer.id,
          items: cartItems
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.pricing).to.have.lengthOf(2);
      
      // Kaju Katli should have bulk discount applied
      const kajuPricing = response.body.pricing.find(p => p.item_code === 'E2E-KAJU-KATLI');
      expect(kajuPricing.final_rate).to.be.lessThan(kajuPricing.base_rate);
      expect(kajuPricing.discount_percentage).to.equal(12); // From pricing rule
      
      orderTotal = response.body.totalAfterDiscount;
      expect(orderTotal).to.be.greaterThan(0);
    });

    it('should check inventory availability with batch details', async function() {
      const response = await request(apiGatewayApp)
        .get('/api/inventory/stock-levels')
        .query({ 
          item_code: 'E2E-KAJU-KATLI',
          warehouse: 'Main Store'
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.stockLevels).to.have.lengthOf.greaterThan(0);
      
      const stock = response.body.stockLevels[0];
      expect(stock.batches).to.be.an('array');
      expect(stock.batches).to.have.lengthOf.greaterThan(0);
      
      // Should have our test batch
      const testBatch = stock.batches.find(b => b.batch_id === 'E2E-BATCH-001');
      expect(testBatch).to.exist;
      expect(testBatch.available_qty).to.be.greaterThan(0);
    });

    it('should create sales order with proper batch allocation', async function() {
      this.timeout(8000);
      
      workflowMessages = []; // Clear previous messages
      
      const orderData = {
        customer: testWorkflowData.customer.id,
        transaction_date: new Date().toISOString().split('T')[0],
        delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [
          {
            item_code: 'E2E-KAJU-KATLI',
            qty: 15,
            rate: 704, // After 12% discount: 800 * 0.88
            warehouse: 'Main Store',
            batch_no: 'E2E-BATCH-001'
          },
          {
            item_code: 'E2E-GULAB-JAMUN',
            qty: 8,
            rate: 400, // No bulk discount for this qty
            warehouse: 'Main Store',
            batch_no: 'E2E-BATCH-002'
          }
        ]
      };

      const response = await request(apiGatewayApp)
        .post('/api/orders/create')
        .send(orderData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.salesOrder).to.have.property('name');
      
      orderId = response.body.salesOrder.name;
      
      // Wait for real-time sync updates
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Should receive order creation updates via WebSocket
      const orderMessages = workflowMessages.filter(msg => 
        msg.type === 'order-update' || 
        (msg.event && msg.event.entityType === 'order')
      );
      
      expect(orderMessages).to.have.lengthOf.greaterThan(0);
    });

    it('should update batch quantities after order creation', async function() {
      // Check that batch quantities were reduced
      const [batchRows] = await erpnextConnection.execute(
        'SELECT batch_id, available_qty FROM `tabHD Batch Master` WHERE batch_id IN (?, ?)',
        ['E2E-BATCH-001', 'E2E-BATCH-002']
      );

      const kajuBatch = batchRows.find(b => b.batch_id === 'E2E-BATCH-001');
      const gulabBatch = batchRows.find(b => b.batch_id === 'E2E-BATCH-002');

      expect(parseFloat(kajuBatch.available_qty)).to.equal(30); // 45 - 15
      expect(parseFloat(gulabBatch.available_qty)).to.equal(17); // 25 - 8
    });

    it('should log batch consumption for traceability', async function() {
      const [consumptionLogs] = await erpnextConnection.execute(
        'SELECT * FROM `tabHD Batch Consumption Log` WHERE batch_id IN (?, ?) AND reference_name = ?',
        ['E2E-BATCH-001', 'E2E-BATCH-002', orderId]
      );

      expect(consumptionLogs).to.have.lengthOf(2);
      
      const kajuLog = consumptionLogs.find(l => l.batch_id === 'E2E-BATCH-001');
      const gulabLog = consumptionLogs.find(l => l.batch_id === 'E2E-BATCH-002');

      expect(parseFloat(kajuLog.consumed_qty)).to.equal(15);
      expect(parseFloat(gulabLog.consumed_qty)).to.equal(8);
      expect(kajuLog.consumption_type).to.equal('Sale');
      expect(kajuLog.reference_doctype).to.equal('Sales Order');
    });

    it('should sync order data to external systems', async function() {
      this.timeout(10000);
      
      // Wait for sync operations to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Should have received sync completion messages
      const syncMessages = workflowMessages.filter(msg => 
        msg.type === 'sync-event' || msg.type === 'operation-completed'
      );
      
      expect(syncMessages).to.have.lengthOf.greaterThan(0);
      console.log(`Received ${syncMessages.length} sync-related messages`);
      
      // Check sync status
      const response = await request(apiGatewayApp)
        .get(`/api/sync/status/${orderId}`)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it('should handle order status updates', async function() {
      this.timeout(6000);
      
      workflowMessages = [];
      
      // Update order status to 'To Deliver'
      const response = await request(apiGatewayApp)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'To Deliver' })
        .expect(200);

      expect(response.body.success).to.be.true;
      
      // Wait for real-time updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusUpdateMessages = workflowMessages.filter(msg => 
        msg.type === 'order-update' && 
        msg.data && msg.data.status === 'To Deliver'
      );
      
      expect(statusUpdateMessages.length).to.be.greaterThan(0);
    });

    it('should generate quality inspection for delivered order', async function() {
      const inspectionData = {
        item: 'E2E-KAJU-KATLI',
        batch_id: 'E2E-BATCH-001',
        inspection_type: 'Outgoing Inspection',
        inspection_stage: 'Before Delivery',
        inspector: 'QC-001',
        sample_size: 1.0,
        quality_parameters: [
          {
            parameter_name: 'Taste',
            target_value: 'Excellent',
            actual_value: 'Excellent',
            result: 'Pass'
          },
          {
            parameter_name: 'Texture',
            target_value: 'Soft',
            actual_value: 'Soft',
            result: 'Pass'
          }
        ]
      };

      const response = await request(apiGatewayApp)
        .post('/api/quality/inspection/create')
        .send(inspectionData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.inspection).to.have.property('inspection_id');
      
      const inspectionId = response.body.inspection.inspection_id;
      
      // Verify inspection was created
      const [inspectionRows] = await erpnextConnection.execute(
        'SELECT * FROM `tabHD Quality Inspection` WHERE inspection_id = ?',
        [inspectionId]
      );
      
      expect(inspectionRows).to.have.lengthOf(1);
      expect(inspectionRows[0].overall_result).to.equal('Pass');
    });
  });

  describe('Inventory Management Workflow', function() {
    it('should detect and alert for expiring batches', async function() {
      this.timeout(6000);
      
      // Create a batch that expires soon
      const expiringBatchId = 'E2E-EXPIRING-BATCH';
      const expiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      
      await erpnextConnection.execute(`
        INSERT INTO \`tabHD Batch Master\` (name, batch_id, item, warehouse, batch_size, available_qty, manufacturing_date, expiry_date, quality_grade, status, creation, modified, owner, modified_by)
        VALUES (?, ?, 'E2E-KAJU-KATLI', 'Main Store', 20, 18, CURDATE(), ?, 'A', 'Active', NOW(), NOW(), 'Administrator', 'Administrator')
      `, [expiringBatchId, expiringBatchId, expiryDate.toISOString().split('T')[0]]);

      // Check for expiring batches
      const response = await request(apiGatewayApp)
        .get('/api/inventory/expiring-batches')
        .query({ days: 7 })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.expiringBatches).to.be.an('array');
      
      const expiringBatch = response.body.expiringBatches.find(b => b.batch_id === expiringBatchId);
      expect(expiringBatch).to.exist;
      expect(expiringBatch.alert_level).to.equal('Warning');
      
      // Cleanup
      await erpnextConnection.execute('DELETE FROM `tabHD Batch Master` WHERE batch_id = ?', [expiringBatchId]);
    });

    it('should track stock movements across warehouses', async function() {
      // Test stock transfer functionality
      const transferData = {
        from_warehouse: 'Main Store',
        to_warehouse: 'Packaging Area',
        items: [{
          item_code: 'E2E-KAJU-KATLI',
          batch_no: 'E2E-BATCH-001',
          qty: 5
        }]
      };

      const response = await request(apiGatewayApp)
        .post('/api/inventory/transfer')
        .send(transferData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.stockEntry).to.have.property('name');
    });
  });

  describe('Customer Experience Workflow', function() {
    it('should provide order tracking information', async function() {
      const response = await request(apiGatewayApp)
        .get(`/api/orders/${orderId}/tracking`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.tracking).to.have.property('current_status');
      expect(response.body.tracking).to.have.property('status_history');
      expect(response.body.tracking.status_history).to.be.an('array');
    });

    it('should handle customer service inquiries', async function() {
      const inquiryData = {
        customer: testWorkflowData.customer.id,
        order_reference: orderId,
        inquiry_type: 'Delivery Status',
        message: 'When will my order be delivered?',
        priority: 'Medium'
      };

      const response = await request(apiGatewayApp)
        .post('/api/customer-service/inquiry')
        .send(inquiryData)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.inquiry).to.have.property('ticket_id');
    });

    it('should provide personalized product recommendations', async function() {
      const response = await request(apiGatewayApp)
        .get('/api/recommendations')
        .query({ customer: testWorkflowData.customer.id })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.recommendations).to.be.an('array');
      
      if (response.body.recommendations.length > 0) {
        const recommendation = response.body.recommendations[0];
        expect(recommendation).to.have.property('item_code');
        expect(recommendation).to.have.property('reason');
      }
    });
  });

  describe('Business Intelligence and Reporting', function() {
    it('should generate sales analytics', async function() {
      const response = await request(apiGatewayApp)
        .get('/api/analytics/sales')
        .query({ 
          from_date: new Date().toISOString().split('T')[0],
          to_date: new Date().toISOString().split('T')[0]
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.analytics).to.have.property('total_orders');
      expect(response.body.analytics).to.have.property('total_revenue');
    });

    it('should track pricing rule effectiveness', async function() {
      const response = await request(apiGatewayApp)
        .get(`/api/pricing/rule/${testWorkflowData.pricingRule.rule_code}/analytics`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.analytics).to.have.property('basic_info');
      
      if (response.body.analytics.usage_stats) {
        expect(response.body.analytics.usage_stats).to.have.property('total_uses');
        expect(response.body.analytics.usage_stats).to.have.property('total_savings_given');
      }
    });

    it('should provide inventory turnover metrics', async function() {
      const response = await request(apiGatewayApp)
        .get('/api/analytics/inventory')
        .query({ 
          warehouse: 'Main Store',
          period: 'daily'
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.analytics).to.have.property('turnover_rate');
      expect(response.body.analytics).to.have.property('slow_moving_items');
    });
  });

  describe('System Performance and Monitoring', function() {
    it('should provide system health metrics', async function() {
      const response = await request(apiGatewayApp)
        .get('/api/system/health')
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.health).to.have.property('erpnext');
      expect(response.body.health).to.have.property('database');
      expect(response.body.health).to.have.property('redis');
      expect(response.body.health).to.have.property('response_times');
    });

    it('should monitor real-time sync performance', async function() {
      // Trigger some sync operations
      await request(apiGatewayApp)
        .post('/api/sync/trigger')
        .send({ 
          type: 'incremental',
          entities: ['customer', 'order']
        })
        .expect(200);

      // Wait for sync to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await request(apiGatewayApp)
        .get('/api/sync/metrics')
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.metrics).to.have.property('total_operations');
      expect(response.body.metrics).to.have.property('avg_processing_time');
      expect(response.body.metrics).to.have.property('system_health');
    });

    it('should handle concurrent workflow operations', async function() {
      this.timeout(15000);
      
      // Simulate multiple concurrent orders
      const concurrentOrders = [];
      for (let i = 0; i < 5; i++) {
        concurrentOrders.push(
          request(apiGatewayApp)
            .post('/api/orders/create')
            .send({
              customer: testWorkflowData.customer.id,
              transaction_date: new Date().toISOString().split('T')[0],
              items: [{
                item_code: 'E2E-GULAB-JAMUN',
                qty: 2,
                rate: 400,
                warehouse: 'Main Store',
                batch_no: 'E2E-BATCH-002'
              }]
            })
        );
      }

      const responses = await Promise.allSettled(concurrentOrders);
      
      // At least some orders should succeed
      const successfulOrders = responses.filter(r => 
        r.status === 'fulfilled' && r.value.body.success
      );
      
      expect(successfulOrders.length).to.be.greaterThan(0);
      console.log(`${successfulOrders.length}/5 concurrent orders processed successfully`);
      
      // Cleanup concurrent test orders
      for (const response of successfulOrders) {
        const orderName = response.value.body.salesOrder.name;
        await erpnextConnection.execute('DELETE FROM `tabSales Order Item` WHERE parent = ?', [orderName]);
        await erpnextConnection.execute('DELETE FROM `tabSales Order` WHERE name = ?', [orderName]);
      }
    });
  });
});
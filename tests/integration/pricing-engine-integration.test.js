/**
 * Integration tests for Pricing Engine with ERPNext Dynamic Pricing Rules
 * Tests the complete flow from rule creation to price calculation
 */

const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

describe('Pricing Engine Integration Tests', function() {
  let apiGatewayApp;
  let erpnextConnection;
  let testCustomerId;
  let testItemCode;
  let testPricingRuleId;

  before(async function() {
    this.timeout(10000);
    
    // Initialize API Gateway app
    const app = require('../../api-gateway/src/app');
    apiGatewayApp = app;
    
    // Setup test database connection
    erpnextConnection = await mysql.createConnection({
      host: process.env.ERPNEXT_DB_HOST || 'localhost',
      port: process.env.ERPNEXT_DB_PORT || 3306,
      user: process.env.ERPNEXT_DB_USER || 'root',
      password: process.env.ERPNEXT_DB_PASSWORD || '',
      database: process.env.ERPNEXT_DB_NAME || 'erpnext_test'
    });
    
    // Setup test data
    await setupTestData();
  });

  after(async function() {
    // Cleanup test data
    await cleanupTestData();
    
    if (erpnextConnection) {
      await erpnextConnection.end();
    }
  });

  async function setupTestData() {
    // Create test customer
    testCustomerId = 'CUST-TEST-001';
    await erpnextConnection.execute(`
      INSERT INTO \`tabCustomer\` (name, customer_name, customer_type, customer_group, territory, creation, modified, owner, modified_by)
      VALUES (?, 'Test Customer', 'Individual', 'Premium', 'All Territories', NOW(), NOW(), 'Administrator', 'Administrator')
      ON DUPLICATE KEY UPDATE modified = NOW()
    `, [testCustomerId]);

    // Create test item
    testItemCode = 'ITEM-TEST-001';
    await erpnextConnection.execute(`
      INSERT INTO \`tabItem\` (name, item_code, item_name, item_group, stock_uom, is_stock_item, standard_rate, creation, modified, owner, modified_by)
      VALUES (?, ?, 'Test Sweet Item', 'Traditional Sweets', 'Kg', 1, 100.00, NOW(), NOW(), 'Administrator', 'Administrator')
      ON DUPLICATE KEY UPDATE modified = NOW()
    `, [testItemCode, testItemCode]);

    // Create test customer segment
    await erpnextConnection.execute(`
      INSERT INTO \`tabHD Customer Segment\` (name, segment_code, segment_name, segment_type, discount_percentage, is_active, creation, modified, owner, modified_by)
      VALUES ('SEGMENT-PREMIUM', 'PREMIUM', 'Premium Customers', 'Discount Based', 10.00, 1, NOW(), NOW(), 'Administrator', 'Administrator')
      ON DUPLICATE KEY UPDATE modified = NOW()
    `);

    // Assign customer to segment
    await erpnextConnection.execute(`
      INSERT INTO \`tabHD Customer Segment Assignment\` (name, customer, customer_segment, assignment_date, is_primary, status, creation, modified, owner, modified_by)
      VALUES ('ASSIGN-001', ?, 'SEGMENT-PREMIUM', CURDATE(), 1, 'Active', NOW(), NOW(), 'Administrator', 'Administrator')
      ON DUPLICATE KEY UPDATE modified = NOW()
    `, [testCustomerId]);
  }

  async function cleanupTestData() {
    // Clean up in reverse order of dependencies
    if (testPricingRuleId) {
      await erpnextConnection.execute('DELETE FROM `tabHD Volume Discount Slab` WHERE parent = ?', [testPricingRuleId]);
      await erpnextConnection.execute('DELETE FROM `tabHD Dynamic Pricing Rule` WHERE name = ?', [testPricingRuleId]);
    }
    
    await erpnextConnection.execute('DELETE FROM `tabHD Customer Segment Assignment` WHERE customer = ?', [testCustomerId]);
    await erpnextConnection.execute('DELETE FROM `tabHD Customer Segment` WHERE name = ?', ['SEGMENT-PREMIUM']);
    await erpnextConnection.execute('DELETE FROM `tabCustomer` WHERE name = ?', [testCustomerId]);
    await erpnextConnection.execute('DELETE FROM `tabItem` WHERE name = ?', [testItemCode]);
  }

  describe('Dynamic Pricing Rule Creation', function() {
    it('should create a percentage discount pricing rule', async function() {
      testPricingRuleId = 'RULE-TEST-001';
      
      const ruleData = {
        name: testPricingRuleId,
        rule_code: testPricingRuleId,
        rule_name: 'Test Premium Customer Discount',
        rule_type: 'Customer Segment',
        priority: 1,
        is_active: 1,
        valid_from: new Date().toISOString().split('T')[0],
        status: 'Active',
        applicable_for: 'Customer Segment',
        apply_on: 'All Items',
        customer_segment: 'SEGMENT-PREMIUM',
        min_qty: 1,
        rate_or_discount: 'Discount Percentage',
        discount_percentage: 15.00,
        track_usage: 1
      };

      await erpnextConnection.execute(`
        INSERT INTO \`tabHD Dynamic Pricing Rule\` (
          name, rule_code, rule_name, rule_type, priority, is_active, valid_from, status,
          applicable_for, apply_on, customer_segment, min_qty, rate_or_discount,
          discount_percentage, track_usage, creation, modified, owner, modified_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 'Administrator', 'Administrator')
      `, [
        ruleData.name, ruleData.rule_code, ruleData.rule_name, ruleData.rule_type,
        ruleData.priority, ruleData.is_active, ruleData.valid_from, ruleData.status,
        ruleData.applicable_for, ruleData.apply_on, ruleData.customer_segment,
        ruleData.min_qty, ruleData.rate_or_discount, ruleData.discount_percentage,
        ruleData.track_usage
      ]);

      // Verify rule was created
      const [rows] = await erpnextConnection.execute(
        'SELECT * FROM `tabHD Dynamic Pricing Rule` WHERE name = ?',
        [testPricingRuleId]
      );
      
      expect(rows).to.have.lengthOf(1);
      expect(rows[0].rule_code).to.equal(testPricingRuleId);
      expect(rows[0].discount_percentage).to.equal(15.00);
    });

    it('should create volume discount slabs for the pricing rule', async function() {
      const slabs = [
        {
          slab_name: '1-10 units (5% discount)',
          min_quantity: 1,
          max_quantity: 10,
          discount_type: 'Percentage',
          discount_percentage: 5.00,
          is_active: 1,
          sort_order: 1
        },
        {
          slab_name: '11-50 units (10% discount)',
          min_quantity: 11,
          max_quantity: 50,
          discount_type: 'Percentage',
          discount_percentage: 10.00,
          is_active: 1,
          sort_order: 2
        },
        {
          slab_name: '51+ units (15% discount)',
          min_quantity: 51,
          max_quantity: null,
          discount_type: 'Percentage',
          discount_percentage: 15.00,
          is_active: 1,
          sort_order: 3
        }
      ];

      // Enable volume discounts on the rule
      await erpnextConnection.execute(
        'UPDATE `tabHD Dynamic Pricing Rule` SET volume_discount_enabled = 1 WHERE name = ?',
        [testPricingRuleId]
      );

      for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];
        const slabId = `${testPricingRuleId}-SLAB-${i + 1}`;
        
        await erpnextConnection.execute(`
          INSERT INTO \`tabHD Volume Discount Slab\` (
            name, slab_name, min_quantity, max_quantity, discount_type,
            discount_percentage, is_active, sort_order, parent, parenttype, parentfield,
            creation, modified, owner, modified_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'HD Dynamic Pricing Rule', 'volume_slabs', NOW(), NOW(), 'Administrator', 'Administrator')
        `, [
          slabId, slab.slab_name, slab.min_quantity, slab.max_quantity,
          slab.discount_type, slab.discount_percentage, slab.is_active,
          slab.sort_order, testPricingRuleId
        ]);
      }

      // Verify slabs were created
      const [slabRows] = await erpnextConnection.execute(
        'SELECT * FROM `tabHD Volume Discount Slab` WHERE parent = ? ORDER BY sort_order',
        [testPricingRuleId]
      );
      
      expect(slabRows).to.have.lengthOf(3);
      expect(slabRows[0].min_quantity).to.equal(1);
      expect(slabRows[2].max_quantity).to.be.null;
    });
  });

  describe('Price Calculation API Tests', function() {
    it('should calculate base pricing without discounts', async function() {
      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testCustomerId,
          items: [{
            item_code: testItemCode,
            qty: 1
          }]
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.pricing).to.have.lengthOf(1);
      expect(response.body.pricing[0].item_code).to.equal(testItemCode);
      expect(response.body.pricing[0].base_rate).to.equal(100);
    });

    it('should apply customer segment discount for small quantities', async function() {
      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testCustomerId,
          items: [{
            item_code: testItemCode,
            qty: 5
          }]
        })
        .expect(200);

      const pricing = response.body.pricing[0];
      expect(pricing.final_rate).to.be.lessThan(pricing.base_rate);
      expect(pricing.pricing_rules_applied).to.have.lengthOf.greaterThan(0);
      
      // Should apply volume discount (5%) instead of segment discount (15%)
      const expectedFinalRate = 100 * 0.95; // 5% discount
      expect(pricing.final_rate).to.equal(expectedFinalRate);
    });

    it('should apply higher volume discount for medium quantities', async function() {
      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testCustomerId,
          items: [{
            item_code: testItemCode,
            qty: 25
          }]
        })
        .expect(200);

      const pricing = response.body.pricing[0];
      const expectedFinalRate = 100 * 0.90; // 10% discount for 11-50 range
      expect(pricing.final_rate).to.equal(expectedFinalRate);
      expect(pricing.volume_discount_applied).to.be.true;
    });

    it('should apply maximum volume discount for large quantities', async function() {
      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testCustomerId,
          items: [{
            item_code: testItemCode,
            qty: 100
          }]
        })
        .expect(200);

      const pricing = response.body.pricing[0];
      const expectedFinalRate = 100 * 0.85; // 15% discount for 51+ range
      expect(pricing.final_rate).to.equal(expectedFinalRate);
      
      const totalSavings = (100 - expectedFinalRate) * 100; // qty * savings per unit
      expect(pricing.total_savings).to.equal(totalSavings);
    });

    it('should calculate total order pricing correctly', async function() {
      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testCustomerId,
          items: [
            { item_code: testItemCode, qty: 30 },
            { item_code: testItemCode, qty: 20 }
          ]
        })
        .expect(200);

      expect(response.body.pricing).to.have.lengthOf(2);
      expect(response.body.totalBeforeDiscount).to.equal(5000); // (30 + 20) * 100
      expect(response.body.totalDiscount).to.be.greaterThan(0);
      expect(response.body.totalAfterDiscount).to.be.lessThan(response.body.totalBeforeDiscount);
    });
  });

  describe('Pricing Rule Analytics', function() {
    it('should track rule usage when enabled', async function() {
      // Make pricing request to generate usage data
      await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testCustomerId,
          items: [{
            item_code: testItemCode,
            qty: 25
          }]
        })
        .expect(200);

      // Check if usage analytics were updated
      const [analyticsRows] = await erpnextConnection.execute(
        'SELECT usage_analytics, revenue_impact FROM `tabHD Dynamic Pricing Rule` WHERE name = ?',
        [testPricingRuleId]
      );

      expect(analyticsRows).to.have.lengthOf(1);
      // Analytics should be populated after usage
      if (analyticsRows[0].usage_analytics) {
        const analytics = JSON.parse(analyticsRows[0].usage_analytics);
        expect(analytics).to.be.an('array');
        expect(analytics.length).to.be.greaterThan(0);
      }
    });

    it('should provide rule analytics via API', async function() {
      const response = await request(apiGatewayApp)
        .get(`/api/pricing/rule/${testPricingRuleId}/analytics`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.analytics).to.have.property('basic_info');
      expect(response.body.analytics.basic_info.rule_code).to.equal(testPricingRuleId);
    });
  });

  describe('Error Handling', function() {
    it('should handle invalid customer gracefully', async function() {
      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: 'INVALID-CUSTOMER',
          items: [{
            item_code: testItemCode,
            qty: 5
          }]
        })
        .expect(200);

      // Should still return pricing but without customer-specific discounts
      expect(response.body.success).to.be.true;
      expect(response.body.pricing[0].base_rate).to.be.greaterThan(0);
    });

    it('should handle invalid item code gracefully', async function() {
      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testCustomerId,
          items: [{
            item_code: 'INVALID-ITEM',
            qty: 5
          }]
        })
        .expect(200);

      // Should return error for invalid item but not crash
      expect(response.body.success).to.be.true;
      expect(response.body.pricing[0].base_rate).to.equal(0);
    });

    it('should validate required pricing parameters', async function() {
      const response = await request(apiGatewayApp)
        .post('/api/pricing/calculate')
        .send({
          customer: testCustomerId
          // Missing items array
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('required');
    });
  });

  describe('Concurrent Pricing Requests', function() {
    it('should handle multiple concurrent pricing requests', async function() {
      this.timeout(5000);
      
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(apiGatewayApp)
            .post('/api/pricing/calculate')
            .send({
              customer: testCustomerId,
              items: [{
                item_code: testItemCode,
                qty: Math.floor(Math.random() * 100) + 1
              }]
            })
        );
      }

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).to.equal(200);
        expect(response.body.success).to.be.true;
        expect(response.body.pricing).to.have.lengthOf(1);
      });
    });
  });
});
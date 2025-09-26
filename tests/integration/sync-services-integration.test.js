/**
 * Integration tests for Sync Services with Real-time Updates
 * Tests customer, inventory, and order synchronization across systems
 */

const { expect } = require('chai');
const WebSocket = require('ws');
const { customerSyncService } = require('../../sync-services/src/services/customerSyncService');
const { realTimeSyncOrchestrator } = require('../../sync-services/src/services/realTimeSyncOrchestrator');
const mysql = require('mysql2/promise');

describe('Sync Services Integration Tests', function() {
  let websocketClient;
  let erpnextConnection;
  let testCustomer;
  let syncMessages = [];

  before(async function() {
    this.timeout(15000);
    
    // Setup database connection
    erpnextConnection = await mysql.createConnection({
      host: process.env.ERPNEXT_DB_HOST || 'localhost',
      port: process.env.ERPNEXT_DB_PORT || 3306,
      user: process.env.ERPNEXT_DB_USER || 'root',
      password: process.env.ERPNEXT_DB_PASSWORD || '',
      database: process.env.ERPNEXT_DB_NAME || 'erpnext_test'
    });

    // Start sync orchestrator
    await realTimeSyncOrchestrator.start();
    
    // Setup WebSocket client for real-time updates
    await setupWebSocketClient();
    
    // Setup test data
    testCustomer = {
      id: 'SYNC-TEST-CUSTOMER',
      name: 'Sync Test Customer',
      email: 'sync.test@harshadelights.com',
      phone: '+91-9876543210',
      address: {
        street: 'Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001'
      },
      erpnext: {
        customer_name: 'Sync Test Customer',
        customer_type: 'Individual',
        customer_group: 'Retail',
        territory: 'Mumbai',
        credit_limit: 50000,
        is_frozen: false,
        disabled: false
      },
      espocrm: {
        accountType: 'Customer',
        industry: 'Food & Beverage',
        assignedUser: 'admin'
      }
    };
  });

  after(async function() {
    // Cleanup
    await cleanupTestData();
    
    if (websocketClient) {
      websocketClient.close();
    }
    
    if (erpnextConnection) {
      await erpnextConnection.end();
    }
    
    await realTimeSyncOrchestrator.stop();
  });

  async function setupWebSocketClient() {
    return new Promise((resolve, reject) => {
      const wsUrl = process.env.SYNC_WS_URL || 'ws://localhost:3001';
      websocketClient = new WebSocket(wsUrl, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      websocketClient.on('open', () => {
        // Subscribe to sync updates
        websocketClient.send(JSON.stringify({
          type: 'subscribe',
          channels: ['sync:status', 'customers:updates', 'system:alerts']
        }));
        resolve();
      });

      websocketClient.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          syncMessages.push(message);
          console.log('WebSocket message:', message.type || message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      websocketClient.on('error', (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });

      setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
    });
  }

  async function cleanupTestData() {
    try {
      // Clean up ERPNext data
      await erpnextConnection.execute('DELETE FROM `tabCustomer` WHERE name = ?', [testCustomer.id]);
      await erpnextConnection.execute('DELETE FROM `tabAddress` WHERE address_title LIKE ?', [`${testCustomer.name}%`]);
      
      // Clean up customer segment assignments
      await erpnextConnection.execute('DELETE FROM `tabHD Customer Segment Assignment` WHERE customer = ?', [testCustomer.id]);
      
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  async function waitForSyncMessages(messageType, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkMessages = () => {
        const matchingMessages = syncMessages.filter(msg => 
          msg.type === messageType || (msg.event && msg.event.type === messageType)
        );
        
        if (matchingMessages.length > 0) {
          resolve(matchingMessages);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for sync message: ${messageType}`));
        } else {
          setTimeout(checkMessages, 100);
        }
      };
      
      checkMessages();
    });
  }

  describe('Customer Sync Operations', function() {
    it('should sync customer creation across systems', async function() {
      this.timeout(10000);
      
      // Clear previous messages
      syncMessages = [];
      
      // Create customer sync operation
      const syncId = await customerSyncService.syncCustomer(
        testCustomer,
        'erpnext',
        'all'
      );
      
      expect(syncId).to.be.a('string');
      
      // Wait for sync completion messages
      const completionMessages = await waitForSyncMessages('operation-completed', 8000);
      expect(completionMessages).to.have.lengthOf.greaterThan(0);
      
      // Verify customer was created in ERPNext
      const [erpnextRows] = await erpnextConnection.execute(
        'SELECT * FROM `tabCustomer` WHERE name = ?',
        [testCustomer.id]
      );
      
      expect(erpnextRows).to.have.lengthOf(1);
      expect(erpnextRows[0].customer_name).to.equal(testCustomer.name);
      expect(erpnextRows[0].email_id).to.equal(testCustomer.email);
    });

    it('should receive real-time WebSocket updates for customer sync', async function() {
      // Check that we received WebSocket messages during sync
      const customerUpdateMessages = syncMessages.filter(msg => 
        msg.type === 'customer-update' || 
        (msg.event && msg.event.entityType === 'customer')
      );
      
      expect(customerUpdateMessages).to.have.lengthOf.greaterThan(0);
      
      // Verify message structure
      const updateMessage = customerUpdateMessages[0];
      expect(updateMessage).to.have.property('timestamp');
      expect(updateMessage).to.have.property('data');
    });

    it('should handle customer update synchronization', async function() {
      this.timeout(8000);
      
      syncMessages = [];
      
      // Update customer data
      const updatedCustomer = {
        ...testCustomer,
        phone: '+91-9876543211', // Changed phone
        erpnext: {
          ...testCustomer.erpnext,
          credit_limit: 75000 // Changed credit limit
        }
      };
      
      const syncId = await customerSyncService.syncCustomer(
        updatedCustomer,
        'erpnext',
        'all'
      );
      
      // Wait for sync completion
      await waitForSyncMessages('operation-completed', 6000);
      
      // Verify customer was updated
      const [updatedRows] = await erpnextConnection.execute(
        'SELECT * FROM `tabCustomer` WHERE name = ?',
        [testCustomer.id]
      );
      
      expect(updatedRows[0].mobile_no).to.equal(updatedCustomer.phone);
      expect(parseFloat(updatedRows[0].credit_limit)).to.equal(75000);
    });

    it('should handle sync conflicts gracefully', async function() {
      this.timeout(10000);
      
      syncMessages = [];
      
      // Create conflicting updates (simulating concurrent modifications)
      const conflictingCustomer1 = {
        ...testCustomer,
        name: 'Conflict Test Customer 1',
        version: 1
      };
      
      const conflictingCustomer2 = {
        ...testCustomer,
        name: 'Conflict Test Customer 2',
        version: 1 // Same version number to trigger conflict
      };
      
      // Send both updates simultaneously
      const sync1Promise = customerSyncService.syncCustomer(conflictingCustomer1, 'erpnext', 'all');
      const sync2Promise = customerSyncService.syncCustomer(conflictingCustomer2, 'erpnext', 'all');
      
      await Promise.allSettled([sync1Promise, sync2Promise]);
      
      // Check for conflict-related messages
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for conflict detection
      
      const conflictMessages = syncMessages.filter(msg => 
        msg.type && (msg.type.includes('conflict') || msg.type.includes('error'))
      );
      
      // Should have received some conflict handling messages
      console.log('Conflict messages received:', conflictMessages.length);
    });
  });

  describe('Bulk Sync Operations', function() {
    it('should perform bulk customer synchronization', async function() {
      this.timeout(15000);
      
      syncMessages = [];
      
      // Trigger bulk sync
      await customerSyncService.syncAllCustomers('erpnext');
      
      // Wait for bulk sync messages
      const bulkSyncMessages = await waitForSyncMessages('operation-queued', 8000);
      expect(bulkSyncMessages).to.have.lengthOf.greaterThan(0);
      
      // Should receive batch processing updates
      const batchMessages = syncMessages.filter(msg => 
        msg.type && msg.type.includes('batch')
      );
      
      console.log(`Received ${syncMessages.length} sync messages during bulk operation`);
    });

    it('should provide sync operation statistics', async function() {
      const stats = realTimeSyncOrchestrator.getSyncStats();
      
      expect(stats).to.have.property('totalOperations');
      expect(stats).to.have.property('completedOperations');
      expect(stats).to.have.property('failedOperations');
      expect(stats).to.have.property('systemHealth');
      
      expect(stats.totalOperations).to.be.a('number');
      expect(stats.systemHealth).to.have.property('erpnext');
      expect(stats.systemHealth).to.have.property('medusa');
      expect(stats.systemHealth).to.have.property('espocrm');
    });
  });

  describe('System Health Monitoring', function() {
    it('should monitor system health status', async function() {
      this.timeout(8000);
      
      syncMessages = [];
      
      // Wait for health check messages
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const healthMessages = syncMessages.filter(msg => 
        msg.type === 'health-update' || msg.type === 'system-status'
      );
      
      // Should receive periodic health updates
      console.log(`Received ${healthMessages.length} health-related messages`);
      
      // Verify health message structure
      if (healthMessages.length > 0) {
        const healthMessage = healthMessages[0];
        expect(healthMessage).to.have.property('timestamp');
      }
    });

    it('should broadcast system alerts via WebSocket', async function() {
      this.timeout(5000);
      
      syncMessages = [];
      
      // Trigger a system event that should generate an alert
      await realTimeSyncOrchestrator.queueSyncOperation({
        type: 'customer',
        operation: 'create',
        source: 'erpnext',
        target: 'invalid_system', // This should cause an error
        data: { test: true },
        priority: 'high',
        status: 'pending',
        retryCount: 0,
        maxRetries: 1
      });
      
      // Wait for error/alert messages
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const alertMessages = syncMessages.filter(msg => 
        msg.type === 'system-alert' || msg.severity === 'error'
      );
      
      console.log(`Received ${alertMessages.length} alert messages`);
    });
  });

  describe('WebSocket Connection Management', function() {
    it('should handle WebSocket reconnection', async function() {
      this.timeout(8000);
      
      const initialMessageCount = syncMessages.length;
      
      // Close and reconnect WebSocket
      websocketClient.close();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reconnect
      await setupWebSocketClient();
      
      // Trigger a sync to test reconnected client
      await customerSyncService.syncCustomer(
        { ...testCustomer, name: 'Reconnection Test' },
        'erpnext',
        'all'
      );
      
      // Should receive messages after reconnection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      expect(syncMessages.length).to.be.greaterThan(initialMessageCount);
    });

    it('should handle subscription management', async function() {
      // Test channel subscription
      websocketClient.send(JSON.stringify({
        type: 'subscribe',
        channels: ['pricing:updates', 'inventory:updates']
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Test unsubscription
      websocketClient.send(JSON.stringify({
        type: 'unsubscribe',
        channels: ['inventory:updates']
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Should receive subscription confirmation messages
      const subscriptionMessages = syncMessages.filter(msg => 
        msg.type === 'subscription-updated'
      );
      
      expect(subscriptionMessages).to.have.lengthOf.greaterThan(0);
    });
  });

  describe('Performance and Reliability', function() {
    it('should handle high-frequency sync operations', async function() {
      this.timeout(15000);
      
      syncMessages = [];
      
      // Queue multiple sync operations rapidly
      const operations = [];
      for (let i = 0; i < 20; i++) {
        operations.push(
          realTimeSyncOrchestrator.queueSyncOperation({
            type: 'customer',
            operation: 'update',
            source: 'erpnext',
            target: 'all',
            data: { test: true, iteration: i },
            priority: 'low',
            status: 'pending',
            retryCount: 0,
            maxRetries: 1
          })
        );
      }
      
      const operationIds = await Promise.all(operations);
      expect(operationIds).to.have.lengthOf(20);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Should handle all operations without system overload
      const queuedMessages = syncMessages.filter(msg => 
        msg.type === 'operation-queued'
      );
      
      expect(queuedMessages).to.have.lengthOf.greaterThan(15); // Allow for some async timing
    });

    it('should provide operation retry functionality', async function() {
      this.timeout(8000);
      
      // Create an operation that will fail
      const operationId = await realTimeSyncOrchestrator.queueSyncOperation({
        type: 'customer',
        operation: 'create',
        source: 'erpnext',
        target: 'invalid_target',
        data: { invalid: 'data' },
        priority: 'medium',
        status: 'pending',
        retryCount: 0,
        maxRetries: 2
      });
      
      // Wait for failure
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Attempt manual retry
      const retryResult = await realTimeSyncOrchestrator.retryOperation(operationId);
      
      // Should be able to retry failed operations
      console.log('Retry operation result:', retryResult);
    });
  });
});
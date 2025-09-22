import { EventEmitter } from 'events';
import { Server } from 'http';
import { B2BIntegrationService } from './b2b-integration-service';
import { B2CIntegrationService } from './b2c-integration-service';
import { ERPIntegrationService } from './erp-integration-service';
import { RealTimeSyncService } from './real-time-sync-service';
import { AnalyticsService } from './analytics-service';
import { AuthService } from './auth-service';
import { integrationConfig } from '../config/integration-config';
import { Logger } from '../utils/logger';

export class IntegrationOrchestrator extends EventEmitter {
  private logger: Logger;
  private b2bService: B2BIntegrationService;
  private b2cService: B2CIntegrationService;
  private erpService: ERPIntegrationService;
  private syncService: RealTimeSyncService;
  private analyticsService: AnalyticsService;
  private authService: AuthService;
  private isInitialized = false;

  constructor() {
    super();
    this.logger = new Logger('IntegrationOrchestrator');
    
    // Initialize services
    this.b2bService = new B2BIntegrationService();
    this.b2cService = new B2CIntegrationService();
    this.erpService = new ERPIntegrationService();
    this.syncService = new RealTimeSyncService();
    this.analyticsService = new AnalyticsService(this.b2bService, this.b2cService, this.erpService);
    this.authService = new AuthService();

    this.setupServiceEventHandlers();
  }

  async initialize(httpServer?: Server): Promise<void> {
    try {
      this.logger.info('Initializing integration orchestrator...');

      // Initialize WebSocket server if HTTP server provided
      if (httpServer) {
        this.syncService.initializeWebSocketServer(httpServer);
      }

      // Initialize all services
      await Promise.all([
        // Services will be initialized in their constructors
        Promise.resolve(),
        Promise.resolve(),
      ]);

      // Start periodic sync processes
      this.startPeriodicSync();

      this.isInitialized = true;
      this.logger.info('Integration orchestrator initialized successfully');
      this.emit('initialized');

    } catch (error) {
      this.logger.error('Failed to initialize integration orchestrator:', error);
      throw error;
    }
  }

  private setupServiceEventHandlers(): void {
    // B2B Service Events
    this.b2bService.on('customer-updated', (data) => {
      this.handleCustomerUpdate(data, 'b2b-portal');
    });

    this.b2bService.on('order-created', (data) => {
      this.handleOrderCreated(data, 'b2b-portal');
    });

    this.b2bService.on('order-updated', (data) => {
      this.handleOrderUpdate(data, 'b2b-portal');
    });

    // B2C Service Events
    this.b2cService.on('customer-updated', (data) => {
      this.handleCustomerUpdate(data, 'b2c-ecommerce');
    });

    this.b2cService.on('order-created', (data) => {
      this.handleOrderCreated(data, 'b2c-ecommerce');
    });

    this.b2cService.on('order-updated', (data) => {
      this.handleOrderUpdate(data, 'b2c-ecommerce');
    });

    this.b2cService.on('cart-updated', (data) => {
      this.handleCartUpdate(data, 'b2c-ecommerce');
    });

    // ERP Service Events
    this.erpService.on('customer-synced', (data) => {
      this.handleCustomerUpdate(data, 'erp-system');
    });

    this.erpService.on('inventory-updated', (data) => {
      this.handleInventoryUpdate(data, 'erp-system');
    });

    this.erpService.on('price-updated', (data) => {
      this.handlePriceUpdate(data, 'erp-system');
    });

    this.erpService.on('territory-updated', (data) => {
      this.handleTerritoryUpdate(data, 'erp-system');
    });

    // Real-time Sync Events
    this.syncService.on('sync-event-processed', (event) => {
      this.logger.debug(`Sync event processed: ${event.type} from ${event.source}`);
    });

    this.syncService.on('sync-event-failed', (event) => {
      this.logger.error(`Sync event failed: ${event.type} from ${event.source}`);
      this.handleSyncFailure(event);
    });
  }

  private async handleCartUpdate(data: any, source: string): Promise<void> {
    try {
      // Broadcast cart updates to Flutter app for sales team visibility
      await this.syncService.broadcastToClients(['flutter-app'], 'cart.updated', {
        ...data,
        source,
        timestamp: new Date().toISOString(),
      });

      // Log cart activity for analytics
      this.logger.info(`Cart updated: ${data.sessionId} - ${data.items?.length || 0} items`);

    } catch (error) {
      this.logger.error('Error handling cart update:', error);
    }
  }

  private async handleCustomerUpdate(data: any, source: string): Promise<void> {
    try {
      // Broadcast to all other systems
      await this.syncService.broadcastToAll('customer.updated', {
        ...data,
        source,
        timestamp: new Date().toISOString(),
      });

      // Sync to ERP if source is not ERP
      if (source !== 'erp-system') {
        // Sync individual customer - will implement method or use existing syncCustomers
      }

      // Sync to B2B if source is not B2B
      if (source !== 'b2b-portal') {
        await this.b2bService.syncCustomers();
      }

      // Sync to B2C if source is not B2C
      if (source !== 'b2c-ecommerce') {
        await this.b2cService.syncCustomers();
      }

    } catch (error) {
      this.logger.error('Error handling customer update:', error);
    }
  }

  private async handleOrderCreated(data: any, source: string): Promise<void> {
    try {
      // Broadcast to all systems
      await this.syncService.broadcastToAll('order.created', {
        ...data,
        source,
        timestamp: new Date().toISOString(),
      });

      // Sync to ERP for order processing
      if (source !== 'erp-system') {
        // Use available syncSalesOrders method
        await this.erpService.syncSalesOrders();
      }

      // Update inventory if items are reserved
      if (data.items && data.status === 'confirmed') {
        for (const item of data.items) {
          await this.handleInventoryUpdate({
            productId: item.productId,
            quantity: -item.quantity,
            type: 'reservation',
            orderId: data.id,
          }, source);
        }
      }

    } catch (error) {
      this.logger.error('Error handling order creation:', error);
    }
  }

  private async handleOrderUpdate(data: any, source: string): Promise<void> {
    try {
      // Broadcast to all systems
      await this.syncService.broadcastToAll('order.updated', {
        ...data,
        source,
        timestamp: new Date().toISOString(),
      });

      // Sync to ERP
      if (source !== 'erp-system') {
        // Use available syncSalesOrders method
        await this.erpService.syncSalesOrders();
      }

      // Handle status-specific logic
      if (data.status === 'cancelled') {
        // Release reserved inventory
        if (data.items) {
          for (const item of data.items) {
            await this.handleInventoryUpdate({
              productId: item.productId,
              quantity: item.quantity,
              type: 'release',
              orderId: data.id,
            }, source);
          }
        }
      }

    } catch (error) {
      this.logger.error('Error handling order update:', error);
    }
  }

  private async handleInventoryUpdate(data: any, source: string): Promise<void> {
    try {
      // Broadcast to all systems
      await this.syncService.broadcastToAll('inventory.updated', {
        ...data,
        source,
        timestamp: new Date().toISOString(),
      });

      // Sync to ERP if source is not ERP
      if (source !== 'erp-system') {
        await this.erpService.updateInventory(data.productId, data.warehouse || 'Main Store', data.quantity);
      }

    } catch (error) {
      this.logger.error('Error handling inventory update:', error);
    }
  }

  private async handlePriceUpdate(data: any, source: string): Promise<void> {
    try {
      // Broadcast to all systems
      await this.syncService.broadcastToAll('price.changed', {
        ...data,
        source,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error('Error handling price update:', error);
    }
  }

  private async handleTerritoryUpdate(data: any, source: string): Promise<void> {
    try {
      // Broadcast to Flutter sales app specifically
      await this.syncService.broadcastToClients(['flutter-app'], 'territory.updated', {
        ...data,
        source,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error('Error handling territory update:', error);
    }
  }

  private async handleSyncFailure(event: any): Promise<void> {
    // Implement failure handling logic
    this.logger.error(`Sync failure for event ${event.id}: ${event.type}`);
    
    // Could implement:
    // - Dead letter queue
    // - Alert notifications
    // - Fallback mechanisms
  }

  private startPeriodicSync(): void {
    // Full sync every hour
    setInterval(async () => {
      try {
        await this.performFullSync();
      } catch (error) {
        this.logger.error('Error during periodic full sync:', error);
      }
    }, integrationConfig.realTimeSync.syncInterval);

    // Health checks every 5 minutes
    setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        this.logger.error('Error during health checks:', error);
      }
    }, 5 * 60 * 1000);
  }

  private async performFullSync(): Promise<void> {
    this.logger.info('Starting periodic full sync...');

    try {
      // Sync customers
      await this.erpService.syncCustomers();
      
      // Sync products and inventory
      await this.erpService.syncProducts();
      
      // Sync orders
      await this.erpService.syncSalesOrders();

      this.logger.info('Periodic full sync completed successfully');
    } catch (error) {
      this.logger.error('Periodic full sync failed:', error);
    }
  }

  private async performHealthChecks(): Promise<void> {
    const healthResults = await Promise.allSettled([
      this.b2bService.healthCheck(),
      this.b2cService.healthCheck(),
      this.erpService.healthCheck(),
      this.syncService.healthCheck(),
    ]);

    healthResults.forEach((result, index) => {
      const serviceName = ['B2B', 'B2C', 'ERP', 'Sync'][index];
      
      if (result.status === 'fulfilled') {
        if (result.value.status !== 'healthy') {
          this.logger.warn(`${serviceName} service health check failed:`, result.value.details);
        }
      } else {
        this.logger.error(`${serviceName} service health check error:`, result.reason);
      }
    });
  }

  // Public API methods
  async syncCustomerToAll(customerId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Integration orchestrator not initialized');
    }

    try {
      // Get customer from ERP
      // Get customer from sync data - implement if needed
      const customers = await this.erpService.syncCustomers();
      const customer = customers.find(c => c.id === customerId);
      
      if (customer) {
        await this.handleCustomerUpdate(customer, 'system');
      }
    } catch (error) {
      this.logger.error(`Error syncing customer ${customerId}:`, error);
      throw error;
    }
  }

  async syncOrderToAll(orderId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Integration orchestrator not initialized');
    }

    try {
      // Get order from ERP
      // Get order from sync data - implement if needed
      const orders = await this.erpService.syncSalesOrders();
      const order = orders.find(o => o.id === orderId);
      
      if (order) {
        await this.handleOrderUpdate(order, 'system');
      }
    } catch (error) {
      this.logger.error(`Error syncing order ${orderId}:`, error);
      throw error;
    }
  }

  async getIntegrationStatus(): Promise<any> {
    const [b2bHealth, b2cHealth, erpHealth, syncHealth, queueStatus] = await Promise.allSettled([
      this.b2bService.healthCheck(),
      this.b2cService.healthCheck(),
      this.erpService.healthCheck(),
      this.syncService.healthCheck(),
      this.syncService.getQueueStatus(),
    ]);

    return {
      initialized: this.isInitialized,
      services: {
        b2b: b2bHealth.status === 'fulfilled' ? b2bHealth.value : { status: 'error', error: b2bHealth.reason },
        b2c: b2cHealth.status === 'fulfilled' ? b2cHealth.value : { status: 'error', error: b2cHealth.reason },
        erp: erpHealth.status === 'fulfilled' ? erpHealth.value : { status: 'error', error: erpHealth.reason },
        sync: syncHealth.status === 'fulfilled' ? syncHealth.value : { status: 'error', error: syncHealth.reason },
      },
      queue: queueStatus.status === 'fulfilled' ? queueStatus.value : { error: queueStatus.reason },
      connectedClients: this.syncService.getConnectedClients(),
    };
  }

  // Service getters for external access
  getAnalyticsService(): AnalyticsService {
    return this.analyticsService;
  }

  getAuthService(): AuthService {
    return this.authService;
  }

  getB2BService(): B2BIntegrationService {
    return this.b2bService;
  }

  getB2CService(): B2CIntegrationService {
    return this.b2cService;
  }

  getERPService(): ERPIntegrationService {
    return this.erpService;
  }

  getSyncService(): RealTimeSyncService {
    return this.syncService;
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down integration orchestrator...');

    try {
      // Shutdown all services
      await Promise.all([
        this.b2bService.destroy?.(),
        this.b2cService.destroy?.(),
        this.erpService.destroy?.(),
        this.syncService.destroy(),
        this.authService.destroy(),
      ]);

      this.removeAllListeners();
      this.isInitialized = false;
      
      this.logger.info('Integration orchestrator shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }
}

export default IntegrationOrchestrator;

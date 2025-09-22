import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { integrationConfig } from '../config/integration-config';
import { Customer, Product, Order, Territory, PriceList } from '../types/business-entities';
import { DataMapper } from '../utils/data-mapper';
import { Logger } from '../utils/logger';
import { RetryManager } from '../utils/retry-manager';

export class ERPIntegrationService extends EventEmitter {
  private apiClient: AxiosInstance;
  private syncInterval: NodeJS.Timeout | null = null;
  private logger: Logger;
  // DataMapper is used as static class
  private retryManager: RetryManager;
  private lastSyncTimestamp: Date | null = null;

  constructor() {
    super();
    this.logger = new Logger('ERPIntegrationService');
    // DataMapper methods are static
    this.retryManager = new RetryManager();
    
    this.apiClient = axios.create({
      baseURL: integrationConfig.erpNext.baseUrl,
      timeout: integrationConfig.apiGateway.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${integrationConfig.erpNext.authentication.apiKey}:${integrationConfig.erpNext.authentication.apiSecret}`,
      },
    });

    this.setupInterceptors();
    this.startSyncScheduler();
  }

  private setupInterceptors(): void {
    this.apiClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`ERP API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('ERP API request error:', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`ERP API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('ERP API response error:', error);
        return Promise.reject(error);
      }
    );
  }

  private startSyncScheduler(): void {
    const interval = integrationConfig.erpNext.syncInterval;
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.performIncrementalSync();
      } catch (error) {
        this.logger.error('ERP sync scheduler error:', error);
      }
    }, interval);
  }

  // Customer Synchronization
  async syncCustomers(): Promise<Customer[]> {
    try {
      this.logger.info('Starting ERP customer synchronization');
      
      const filters = this.lastSyncTimestamp 
        ? [['modified', '>', this.lastSyncTimestamp.toISOString()]]
        : [];

      const response = await this.apiClient.get(
        integrationConfig.erpNext.endpoints.customers,
        {
          params: {
            fields: JSON.stringify([
              'name', 'customer_name', 'email_id', 'mobile_no', 
              'territory', 'customer_group', 'customer_type',
              'credit_limit', 'outstanding_amount', 'creation',
              'modified', 'disabled'
            ]),
            filters: JSON.stringify(filters),
            limit_page_length: integrationConfig.erpNext.batchSize,
          },
        }
      );

      const erpCustomers = response.data.data;
      const mappedCustomers = erpCustomers.map((customer: any) => 
        DataMapper.mapERPCustomerToUnified(customer)
      );

      // Emit event for other services
      this.emit('customers-synced', mappedCustomers);
      
      this.logger.info(`Synchronized ${mappedCustomers.length} customers from ERP`);
      return mappedCustomers;
    } catch (error) {
      this.logger.error('ERP customer sync failed:', error);
      throw error;
    }
  }

  async createCustomer(customer: Customer): Promise<Customer> {
    try {
      const erpCustomer = DataMapper.mapUnifiedCustomerToERP(customer);
      
      const response = await this.apiClient.post(
        integrationConfig.erpNext.endpoints.customers,
        { data: erpCustomer }
      );
      
      const createdCustomer = DataMapper.mapERPCustomerToUnified(response.data.data);
      
      this.emit('customer-created', createdCustomer);
      this.logger.info(`Created customer in ERP: ${createdCustomer.id}`);
      
      return createdCustomer;
    } catch (error) {
      this.logger.error('Failed to create customer in ERP:', error);
      throw error;
    }
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    try {
      const erpCustomer = DataMapper.mapUnifiedCustomerToERP(customer);
      
      const response = await this.apiClient.put(
        `${integrationConfig.erpNext.endpoints.customers}/${customer.id}`,
        { data: erpCustomer }
      );
      
      const updatedCustomer = DataMapper.mapERPCustomerToUnified(response.data.data);
      
      this.emit('customer-updated', updatedCustomer);
      
      return updatedCustomer;
    } catch (error) {
      this.logger.error('Failed to update customer in ERP:', error);
      throw error;
    }
  }

  // Product and Inventory Synchronization
  async syncProducts(): Promise<Product[]> {
    try {
      this.logger.info('Starting ERP product synchronization');
      
      const filters = this.lastSyncTimestamp 
        ? [['modified', '>', this.lastSyncTimestamp.toISOString()]]
        : [];

      const response = await this.apiClient.get(
        integrationConfig.erpNext.endpoints.items,
        {
          params: {
            fields: JSON.stringify([
              'name', 'item_name', 'description', 'item_group',
              'standard_rate', 'stock_uom', 'is_sales_item',
              'creation', 'modified', 'disabled', 'image'
            ]),
            filters: JSON.stringify([
              ...filters,
              ['is_sales_item', '=', 1],
              ['disabled', '=', 0]
            ]),
            limit_page_length: integrationConfig.erpNext.batchSize,
          },
        }
      );

      const erpItems = response.data.data;
      
      // Get inventory levels for each item
      const productsWithInventory = await Promise.all(
        erpItems.map(async (item: any) => {
          const inventory = await this.getItemInventory(item.name);
          return DataMapper.mapERPProduct({ ...item, ...inventory });
        })
      );

      this.emit('products-synced', productsWithInventory);
      
      this.logger.info(`Synchronized ${productsWithInventory.length} products from ERP`);
      return productsWithInventory;
    } catch (error) {
      this.logger.error('ERP product sync failed:', error);
      throw error;
    }
  }

  async getItemInventory(itemCode: string): Promise<any> {
    try {
      const response = await this.apiClient.get(
        integrationConfig.erpNext.endpoints.inventory,
        {
          params: {
            fields: JSON.stringify(['item_code', 'warehouse', 'actual_qty', 'valuation_rate']),
            filters: JSON.stringify([
              ['item_code', '=', itemCode],
              ['is_cancelled', '=', 0]
            ]),
            group_by: 'item_code',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get inventory for item ${itemCode}:`, error);
      return [];
    }
  }

  async updateInventory(itemCode: string, warehouse: string, quantity: number): Promise<void> {
    try {
      // Create stock entry for inventory adjustment
      const stockEntry = {
        doctype: 'Stock Entry',
        stock_entry_type: 'Material Receipt',
        items: [{
          item_code: itemCode,
          qty: quantity,
          t_warehouse: warehouse,
        }],
      };

      await this.apiClient.post('/api/resource/Stock Entry', {
        data: stockEntry
      });

      this.emit('inventory-updated', { itemCode, warehouse, quantity });
      this.logger.info(`Updated inventory for ${itemCode}: ${quantity}`);
    } catch (error) {
      this.logger.error('Failed to update inventory in ERP:', error);
      throw error;
    }
  }

  // Pricing Synchronization
  async syncPricing(): Promise<PriceList[]> {
    try {
      this.logger.info('Starting ERP pricing synchronization');
      
      const response = await this.apiClient.get(
        integrationConfig.erpNext.endpoints.pricing,
        {
          params: {
            fields: JSON.stringify([
              'name', 'item_code', 'price_list', 'price_list_rate',
              'valid_from', 'valid_upto', 'currency', 'modified'
            ]),
            filters: JSON.stringify([
              ['valid_upto', '>=', new Date().toISOString().split('T')[0]],
            ]),
            limit_page_length: integrationConfig.erpNext.batchSize,
          },
        }
      );

      const erpPrices = response.data.data;
      const mappedPrices = erpPrices.map((price: any) => 
        DataMapper.mapERPPriceToUnified(price)
      );

      this.emit('pricing-synced', mappedPrices);
      
      this.logger.info(`Synchronized ${mappedPrices.length} price entries from ERP`);
      return mappedPrices;
    } catch (error) {
      this.logger.error('ERP pricing sync failed:', error);
      throw error;
    }
  }

  // Sales Order Synchronization
  async syncSalesOrders(): Promise<Order[]> {
    try {
      this.logger.info('Starting ERP sales order synchronization');
      
      const filters = this.lastSyncTimestamp 
        ? [['modified', '>', this.lastSyncTimestamp.toISOString()]]
        : [];

      const response = await this.apiClient.get(
        integrationConfig.erpNext.endpoints.salesOrders,
        {
          params: {
            fields: JSON.stringify([
              'name', 'customer', 'transaction_date', 'delivery_date',
              'status', 'grand_total', 'currency', 'items',
              'creation', 'modified', 'docstatus'
            ]),
            filters: JSON.stringify(filters),
            limit_page_length: integrationConfig.erpNext.batchSize,
          },
        }
      );

      const erpOrders = response.data.data;
      const mappedOrders = erpOrders.map((order: any) => 
        DataMapper.mapERPOrderToUnified(order)
      );

      this.emit('orders-synced', mappedOrders);
      
      this.logger.info(`Synchronized ${mappedOrders.length} sales orders from ERP`);
      return mappedOrders;
    } catch (error) {
      this.logger.error('ERP sales order sync failed:', error);
      throw error;
    }
  }

  async createSalesOrder(order: Order): Promise<Order> {
    try {
      const erpOrder = DataMapper.mapUnifiedOrderToERP(order);
      
      const response = await this.apiClient.post(
        integrationConfig.erpNext.endpoints.salesOrders,
        { data: erpOrder }
      );
      
      const createdOrder = DataMapper.mapERPOrderToUnified(response.data.data);
      
      this.emit('order-created', createdOrder);
      this.logger.info(`Created sales order in ERP: ${createdOrder.id}`);
      
      return createdOrder;
    } catch (error) {
      this.logger.error('Failed to create sales order in ERP:', error);
      throw error;
    }
  }

  async updateSalesOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const response = await this.apiClient.put(
        `${integrationConfig.erpNext.endpoints.salesOrders}/${orderId}`,
        {
          data: { status }
        }
      );
      
      const updatedOrder = DataMapper.mapERPOrderToUnified(response.data.data);
      
      this.emit('order-updated', updatedOrder);
      
      return updatedOrder;
    } catch (error) {
      this.logger.error('Failed to update sales order status in ERP:', error);
      throw error;
    }
  }

  // Territory Management
  async syncTerritories(): Promise<Territory[]> {
    try {
      this.logger.info('Starting ERP territory synchronization');
      
      const response = await this.apiClient.get(
        integrationConfig.erpNext.endpoints.territories,
        {
          params: {
            fields: JSON.stringify([
              'name', 'territory_name', 'parent_territory',
              'territory_manager', 'is_group', 'creation', 'modified'
            ]),
            limit_page_length: integrationConfig.erpNext.batchSize,
          },
        }
      );

      const erpTerritories = response.data.data;
      const mappedTerritories = erpTerritories.map((territory: any) => 
        DataMapper.mapERPTerritoryToUnified(territory)
      );

      this.emit('territories-synced', mappedTerritories);
      
      this.logger.info(`Synchronized ${mappedTerritories.length} territories from ERP`);
      return mappedTerritories;
    } catch (error) {
      this.logger.error('ERP territory sync failed:', error);
      throw error;
    }
  }

  // Batch Operations
  async batchUpdateCustomers(customers: Customer[]): Promise<void> {
    try {
      const batchSize = integrationConfig.erpNext.batchSize;
      const batches = this.chunkArray(customers, batchSize);

      for (const batch of batches) {
        await Promise.all(
          batch.map(customer => this.updateCustomer(customer))
        );
        
        // Small delay between batches to avoid overwhelming the ERP system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logger.info(`Batch updated ${customers.length} customers in ERP`);
    } catch (error) {
      this.logger.error('Batch customer update failed:', error);
      throw error;
    }
  }

  async batchCreateOrders(orders: Order[]): Promise<Order[]> {
    try {
      const batchSize = integrationConfig.erpNext.batchSize;
      const batches = this.chunkArray(orders, batchSize);
      const createdOrders: Order[] = [];

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(order => this.createSalesOrder(order))
        );
        
        createdOrders.push(...batchResults);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logger.info(`Batch created ${createdOrders.length} orders in ERP`);
      return createdOrders;
    } catch (error) {
      this.logger.error('Batch order creation failed:', error);
      throw error;
    }
  }

  // Incremental Sync
  private async performIncrementalSync(): Promise<void> {
    try {
      this.logger.info('Starting incremental ERP synchronization');
      
      const syncPromises = [
        this.syncCustomers(),
        this.syncProducts(),
        this.syncSalesOrders(),
        this.syncPricing(),
      ];

      await Promise.allSettled(syncPromises);
      
      this.lastSyncTimestamp = new Date();
      this.emit('incremental-sync-completed', this.lastSyncTimestamp);
      
      this.logger.info('Incremental ERP synchronization completed');
    } catch (error) {
      this.logger.error('Incremental sync failed:', error);
      this.emit('incremental-sync-failed', error);
    }
  }

  // Utility Methods
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const response = await this.apiClient.get('/api/method/ping');
      
      return {
        status: 'healthy',
        details: {
          erpNext: response.data,
          lastSync: this.lastSyncTimestamp?.toISOString() || 'never',
          syncInterval: integrationConfig.erpNext.syncInterval,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          lastSync: this.lastSyncTimestamp?.toISOString() || 'never',
        },
      };
    }
  }

  // Data Export for Analytics
  async exportCustomerData(filters?: any): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        integrationConfig.erpNext.endpoints.customers,
        {
          params: {
            fields: JSON.stringify(['*']),
            filters: JSON.stringify(filters || []),
            limit_page_length: 0, // Get all records
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to export customer data:', error);
      throw error;
    }
  }

  async exportSalesData(dateFrom: string, dateTo: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        integrationConfig.erpNext.endpoints.salesOrders,
        {
          params: {
            fields: JSON.stringify(['*']),
            filters: JSON.stringify([
              ['transaction_date', '>=', dateFrom],
              ['transaction_date', '<=', dateTo],
            ]),
            limit_page_length: 0,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to export sales data:', error);
      throw error;
    }
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.removeAllListeners();
    this.logger.info('ERP Integration Service destroyed');
  }
}

export default ERPIntegrationService;

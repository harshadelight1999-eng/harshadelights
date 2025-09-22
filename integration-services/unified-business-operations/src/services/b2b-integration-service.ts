import axios, { AxiosInstance } from 'axios';
import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { integrationConfig } from '../config/integration-config';
import { Customer, Order, Product, SalesMetrics } from '../types/business-entities';
import { DataMapper } from '../utils/data-mapper';
import { Logger } from '../utils/logger';

export class B2BIntegrationService extends EventEmitter {
  private apiClient: AxiosInstance;
  private websocket: WebSocket | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private logger: Logger;
  // DataMapper is used as static class

  constructor() {
    super();
    this.logger = new Logger('B2BIntegrationService');
    // DataMapper methods are static
    
    this.apiClient = axios.create({
      baseURL: integrationConfig.b2bPortal.baseUrl,
      timeout: integrationConfig.apiGateway.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.initializeWebSocket();
    this.startSyncScheduler();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshAuthToken();
          return this.apiClient.request(error.config);
        }
        this.logger.error('API response error:', error);
        return Promise.reject(error);
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const response = await axios.post(
        `${integrationConfig.b2bPortal.baseUrl}/api/auth/token`,
        {
          clientId: integrationConfig.b2bPortal.authentication.credentials.clientId,
          clientSecret: integrationConfig.b2bPortal.authentication.credentials.clientSecret,
        }
      );
      return response.data.accessToken;
    } catch (error) {
      this.logger.error('Failed to get auth token:', error);
      return null;
    }
  }

  private async refreshAuthToken(): Promise<void> {
    // Implementation for token refresh
    this.logger.info('Refreshing authentication token');
  }

  private initializeWebSocket(): void {
    const wsUrl = integrationConfig.flutterSalesApp.realTimeUpdates.websocketUrl;
    
    try {
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.on('open', () => {
        this.logger.info('WebSocket connection established');
        this.subscribeToChannels();
      });

      this.websocket.on('message', (data) => {
        this.handleWebSocketMessage(data);
      });

      this.websocket.on('close', () => {
        this.logger.warn('WebSocket connection closed, attempting to reconnect');
        setTimeout(() => this.initializeWebSocket(), 5000);
      });

      this.websocket.on('error', (error) => {
        this.logger.error('WebSocket error:', error);
      });
    } catch (error) {
      this.logger.error('Failed to initialize WebSocket:', error);
    }
  }

  private subscribeToChannels(): void {
    const channels = integrationConfig.flutterSalesApp.realTimeUpdates.channels;
    
    channels.forEach(channel => {
      this.websocket?.send(JSON.stringify({
        type: 'subscribe',
        channel: channel,
      }));
    });
  }

  private handleWebSocketMessage(data: any): void {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'customer-update':
          this.handleCustomerUpdate(message.data);
          break;
        case 'order-update':
          this.handleOrderUpdate(message.data);
          break;
        case 'inventory-update':
          this.handleInventoryUpdate(message.data);
          break;
        default:
          this.logger.debug('Unknown message type:', message.type);
      }
    } catch (error) {
      this.logger.error('Error handling WebSocket message:', error);
    }
  }

  private startSyncScheduler(): void {
    const interval = integrationConfig.b2bPortal.syncInterval;
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.performFullSync();
      } catch (error) {
        this.logger.error('Sync scheduler error:', error);
      }
    }, interval);
  }

  // Customer Management Integration
  async syncCustomers(): Promise<Customer[]> {
    try {
      this.logger.info('Starting customer synchronization');
      
      const response = await this.apiClient.get(
        integrationConfig.b2bPortal.endpoints.customers
      );
      
      const b2bCustomers = response.data.customers;
      const mappedCustomers = b2bCustomers.map((customer: any) => 
        DataMapper.mapB2BCustomerToUnified(customer)
      );

      // Emit event for other services to consume
      this.emit('customers-synced', mappedCustomers);
      
      this.logger.info(`Synchronized ${mappedCustomers.length} customers`);
      return mappedCustomers;
    } catch (error) {
      this.logger.error('Customer sync failed:', error);
      throw error;
    }
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const response = await this.apiClient.get(
        `${integrationConfig.b2bPortal.endpoints.customers}/${customerId}`
      );
      
      return DataMapper.mapB2BCustomerToUnified(response.data.customer);
    } catch (error) {
      this.logger.error(`Failed to get customer ${customerId}:`, error);
      return null;
    }
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    try {
      const b2bCustomer = DataMapper.mapUnifiedCustomerToB2B(customer);
      
      const response = await this.apiClient.put(
        `${integrationConfig.b2bPortal.endpoints.customers}/${customer.id}`,
        b2bCustomer
      );
      
      const updatedCustomer = DataMapper.mapB2BCustomerToUnified(response.data.customer);
      
      // Notify Flutter app of customer update
      this.notifyFlutterApp('customer-updated', updatedCustomer);
      
      return updatedCustomer;
    } catch (error) {
      this.logger.error('Failed to update customer:', error);
      throw error;
    }
  }

  // Order Management Integration
  async syncOrders(): Promise<Order[]> {
    try {
      this.logger.info('Starting order synchronization');
      
      const response = await this.apiClient.get(
        integrationConfig.b2bPortal.endpoints.orders,
        {
          params: {
            limit: 100,
            status: 'active',
          },
        }
      );
      
      const b2bOrders = response.data.orders;
      const mappedOrders = b2bOrders.map((order: any) => 
        DataMapper.mapB2BOrderToUnified(order)
      );

      this.emit('orders-synced', mappedOrders);
      
      this.logger.info(`Synchronized ${mappedOrders.length} orders`);
      return mappedOrders;
    } catch (error) {
      this.logger.error('Order sync failed:', error);
      throw error;
    }
  }

  async createOrder(order: Order): Promise<Order> {
    try {
      const b2bOrder = DataMapper.mapUnifiedOrderToB2B(order);
      
      const response = await this.apiClient.post(
        integrationConfig.b2bPortal.endpoints.orders,
        b2bOrder
      );
      
      const createdOrder = DataMapper.mapB2BOrderToUnified(response.data.order);
      
      // Notify all connected systems
      this.notifyFlutterApp('order-created', createdOrder);
      this.emit('order-created', createdOrder);
      
      return createdOrder;
    } catch (error) {
      this.logger.error('Failed to create order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const response = await this.apiClient.patch(
        `${integrationConfig.b2bPortal.endpoints.orders}/${orderId}/status`,
        { status }
      );
      
      const updatedOrder = DataMapper.mapB2BOrderToUnified(response.data.order);
      
      this.notifyFlutterApp('order-updated', updatedOrder);
      
      return updatedOrder;
    } catch (error) {
      this.logger.error('Failed to update order status:', error);
      throw error;
    }
  }

  // Product and Inventory Integration
  async syncProducts(): Promise<Product[]> {
    try {
      this.logger.info('Starting product synchronization');
      
      const response = await this.apiClient.get(
        integrationConfig.b2bPortal.endpoints.products,
        {
          params: {
            includeInventory: true,
            includePricing: true,
          },
        }
      );
      
      const b2bProducts = response.data.products;
      const mappedProducts = b2bProducts.map((product: any) => 
        DataMapper.mapB2BProductToUnified(product)
      );

      this.emit('products-synced', mappedProducts);
      
      this.logger.info(`Synchronized ${mappedProducts.length} products`);
      return mappedProducts;
    } catch (error) {
      this.logger.error('Product sync failed:', error);
      throw error;
    }
  }

  async updateProductInventory(productId: string, quantity: number): Promise<void> {
    try {
      await this.apiClient.patch(
        `${integrationConfig.b2bPortal.endpoints.products}/${productId}/inventory`,
        { quantity }
      );
      
      this.notifyFlutterApp('inventory-updated', { productId, quantity });
    } catch (error) {
      this.logger.error('Failed to update product inventory:', error);
      throw error;
    }
  }

  // Analytics Integration
  async getSalesMetrics(period: string): Promise<SalesMetrics> {
    try {
      const response = await this.apiClient.get(
        integrationConfig.b2bPortal.endpoints.analytics,
        {
          params: { period },
        }
      );
      
      return DataMapper.mapB2BMetricsToUnified(response.data.metrics);
    } catch (error) {
      this.logger.error('Failed to get sales metrics:', error);
      throw error;
    }
  }

  async getCustomerAnalytics(customerId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `${integrationConfig.b2bPortal.endpoints.analytics}/customers/${customerId}`
      );
      
      return response.data.analytics;
    } catch (error) {
      this.logger.error('Failed to get customer analytics:', error);
      throw error;
    }
  }

  // Flutter App Integration Methods
  private notifyFlutterApp(eventType: string, data: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: eventType,
        data: data,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  async getFlutterAppData(endpoint: string, params?: any): Promise<any> {
    try {
      const response = await this.apiClient.get(
        integrationConfig.flutterSalesApp.apiEndpoints[endpoint as keyof typeof integrationConfig.flutterSalesApp.apiEndpoints],
        { params }
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Flutter app data from ${endpoint}:`, error);
      throw error;
    }
  }

  // Event Handlers
  private handleCustomerUpdate(customerData: any): void {
    this.logger.info('Handling customer update from Flutter app');
    this.emit('flutter-customer-update', customerData);
  }

  private handleOrderUpdate(orderData: any): void {
    this.logger.info('Handling order update from Flutter app');
    this.emit('flutter-order-update', orderData);
  }

  private handleInventoryUpdate(inventoryData: any): void {
    this.logger.info('Handling inventory update');
    this.emit('flutter-inventory-update', inventoryData);
  }

  // Full Synchronization
  private async performFullSync(): Promise<void> {
    try {
      this.logger.info('Starting full synchronization');
      
      await Promise.all([
        this.syncCustomers(),
        this.syncOrders(),
        this.syncProducts(),
      ]);
      
      this.logger.info('Full synchronization completed');
      this.emit('sync-completed');
    } catch (error) {
      this.logger.error('Full sync failed:', error);
      this.emit('sync-failed', error);
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const response = await this.apiClient.get('/health');
      
      return {
        status: 'healthy',
        details: {
          b2bPortal: response.data,
          websocket: this.websocket?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected',
          lastSync: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          websocket: this.websocket?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected',
        },
      };
    }
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.websocket) {
      this.websocket.close();
    }
    
    this.removeAllListeners();
    this.logger.info('B2B Integration Service destroyed');
  }
}

export default B2BIntegrationService;

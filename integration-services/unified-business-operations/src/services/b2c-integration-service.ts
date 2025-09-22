import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import { integrationConfig } from '../config/integration-config';
import { Customer, Order, Product } from '../types/business-entities';
import { DataMapper } from '../utils/data-mapper';
import { Logger } from '../utils/logger';

export class B2CIntegrationService extends EventEmitter {
  private apiClient: AxiosInstance;
  private logger: Logger;

  constructor() {
    super();
    this.logger = new Logger('B2CIntegrationService');
    
    this.apiClient = axios.create({
      baseURL: 'http://localhost:3002/api',
      timeout: integrationConfig.apiGateway.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.apiClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`B2C API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('B2C API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`B2C API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('B2C API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Customer Management
  async syncCustomers(): Promise<Customer[]> {
    try {
      this.logger.info('Starting B2C customer synchronization');
      
      const response = await this.apiClient.get('/customers');
      const b2cCustomers = response.data.customers || [];
      
      const mappedCustomers = b2cCustomers.map((customer: any) => 
        DataMapper.mapB2CCustomerToUnified(customer)
      );

      this.emit('customers-synced', mappedCustomers);
      
      this.logger.info(`Synchronized ${mappedCustomers.length} B2C customers`);
      return mappedCustomers;
    } catch (error) {
      this.logger.error('B2C customer sync failed:', error);
      throw error;
    }
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const response = await this.apiClient.get(`/customers/${customerId}`);
      return DataMapper.mapB2CCustomerToUnified(response.data.customer);
    } catch (error) {
      this.logger.error(`Failed to get B2C customer ${customerId}:`, error);
      return null;
    }
  }

  async createCustomer(customer: Customer): Promise<Customer> {
    try {
      const b2cCustomer = DataMapper.mapUnifiedCustomerToB2C(customer);
      
      const response = await this.apiClient.post('/customers', b2cCustomer);
      const createdCustomer = DataMapper.mapB2CCustomerToUnified(response.data.customer);
      
      this.emit('customer-created', createdCustomer);
      
      return createdCustomer;
    } catch (error) {
      this.logger.error('Failed to create B2C customer:', error);
      throw error;
    }
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    try {
      const b2cCustomer = DataMapper.mapUnifiedCustomerToB2C(customer);
      
      const response = await this.apiClient.put(`/customers/${customer.id}`, b2cCustomer);
      const updatedCustomer = DataMapper.mapB2CCustomerToUnified(response.data.customer);
      
      this.emit('customer-updated', updatedCustomer);
      
      return updatedCustomer;
    } catch (error) {
      this.logger.error('Failed to update B2C customer:', error);
      throw error;
    }
  }

  // Order Management
  async syncOrders(): Promise<Order[]> {
    try {
      this.logger.info('Starting B2C order synchronization');
      
      const response = await this.apiClient.get('/orders', {
        params: {
          limit: 100,
          status: 'active',
        },
      });
      
      const b2cOrders = response.data.orders || [];
      const mappedOrders = b2cOrders.map((order: any) => 
        DataMapper.mapB2COrderToUnified(order)
      );

      this.emit('orders-synced', mappedOrders);
      
      this.logger.info(`Synchronized ${mappedOrders.length} B2C orders`);
      return mappedOrders;
    } catch (error) {
      this.logger.error('B2C order sync failed:', error);
      throw error;
    }
  }

  async createOrder(order: Order): Promise<Order> {
    try {
      const b2cOrder = DataMapper.mapUnifiedOrderToB2C(order);
      
      const response = await this.apiClient.post('/orders', b2cOrder);
      const createdOrder = DataMapper.mapB2COrderToUnified(response.data.order);
      
      this.emit('order-created', createdOrder);
      
      return createdOrder;
    } catch (error) {
      this.logger.error('Failed to create B2C order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const response = await this.apiClient.patch(`/orders/${orderId}/status`, { status });
      const updatedOrder = DataMapper.mapB2COrderToUnified(response.data.order);
      
      this.emit('order-updated', updatedOrder);
      
      return updatedOrder;
    } catch (error) {
      this.logger.error('Failed to update B2C order status:', error);
      throw error;
    }
  }

  // Product Management
  async syncProducts(): Promise<Product[]> {
    try {
      this.logger.info('Starting B2C product synchronization');
      
      const response = await this.apiClient.get('/products', {
        params: {
          includeInventory: true,
          includePricing: true,
        },
      });
      
      const b2cProducts = response.data.products || [];
      const mappedProducts = b2cProducts.map((product: any) => 
        DataMapper.mapB2CProductToUnified(product)
      );

      this.emit('products-synced', mappedProducts);
      
      this.logger.info(`Synchronized ${mappedProducts.length} B2C products`);
      return mappedProducts;
    } catch (error) {
      this.logger.error('B2C product sync failed:', error);
      throw error;
    }
  }

  // Cart Management
  async getCart(sessionId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/cart/${sessionId}`);
      return response.data.cart;
    } catch (error) {
      this.logger.error(`Failed to get cart for session ${sessionId}:`, error);
      return null;
    }
  }

  async updateCartItem(sessionId: string, productId: string, quantity: number): Promise<any> {
    try {
      const response = await this.apiClient.put(`/cart/${sessionId}/items/${productId}`, {
        quantity,
      });
      
      this.emit('cart-updated', {
        sessionId,
        productId,
        quantity,
        cart: response.data.cart,
      });
      
      return response.data.cart;
    } catch (error) {
      this.logger.error('Failed to update cart item:', error);
      throw error;
    }
  }

  // Analytics Integration
  async getAnalytics(period: string): Promise<any> {
    try {
      const response = await this.apiClient.get('/analytics', {
        params: { period },
      });
      
      return DataMapper.mapB2CAnalyticsToUnified(response.data.analytics);
    } catch (error) {
      this.logger.error('Failed to get B2C analytics:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<any> {
    try {
      const response = await this.apiClient.get('/health');
      
      return {
        status: 'healthy',
        details: {
          b2cEcommerce: response.data,
          lastSync: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Notification Methods
  private notifyFlutterApp(eventType: string, data: any): void {
    // This will be handled by the real-time sync service
    this.emit('notify-flutter', {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async destroy(): Promise<void> {
    this.removeAllListeners();
    this.logger.info('B2C Integration Service destroyed');
  }
}

export default B2CIntegrationService;

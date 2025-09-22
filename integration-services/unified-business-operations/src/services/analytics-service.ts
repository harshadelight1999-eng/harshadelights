import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { B2BIntegrationService } from './b2b-integration-service';
import { B2CIntegrationService } from './b2c-integration-service';
import { ERPIntegrationService } from './erp-integration-service';

export interface ConsolidatedSalesMetrics {
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  period: string;
}

export interface ProductAnalytics {
  productId: string;
  name: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  category: string;
}

export interface CustomerAnalytics {
  customerId: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  tier: string;
}

export interface ChannelMetrics {
  channel: 'b2b' | 'b2c' | 'erp';
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

export class AnalyticsService extends EventEmitter {
  private logger: Logger;
  private b2bService: B2BIntegrationService;
  private b2cService: B2CIntegrationService;
  private erpService: ERPIntegrationService;

  constructor(
    b2bService: B2BIntegrationService,
    b2cService: B2CIntegrationService,
    erpService: ERPIntegrationService
  ) {
    super();
    this.logger = new Logger('AnalyticsService');
    this.b2bService = b2bService;
    this.b2cService = b2cService;
    this.erpService = erpService;
  }

  async getConsolidatedSalesMetrics(period: string): Promise<ConsolidatedSalesMetrics> {
    try {
      this.logger.info(`Generating consolidated sales metrics for period: ${period}`);

      const [b2bMetrics, b2cMetrics] = await Promise.allSettled([
        this.b2bService.getSalesMetrics(period),
        this.b2cService.getAnalytics(period),
      ]);

      let consolidatedMetrics: ConsolidatedSalesMetrics = {
        revenue: 0,
        orders: 0,
        customers: 0,
        averageOrderValue: 0,
        period,
      };

      if (b2bMetrics.status === 'fulfilled') {
        consolidatedMetrics.revenue += b2bMetrics.value.totalRevenue || 0;
        consolidatedMetrics.orders += b2bMetrics.value.totalOrders || 0;
        consolidatedMetrics.customers += b2bMetrics.value.topCustomers?.length || 0;
      }

      if (b2cMetrics.status === 'fulfilled') {
        consolidatedMetrics.revenue += b2cMetrics.value.revenue || 0;
        consolidatedMetrics.orders += b2cMetrics.value.orders || 0;
        consolidatedMetrics.customers += b2cMetrics.value.customers || 0;
      }

      consolidatedMetrics.averageOrderValue = consolidatedMetrics.orders > 0 
        ? consolidatedMetrics.revenue / consolidatedMetrics.orders 
        : 0;

      this.emit('metrics-generated', consolidatedMetrics);
      
      return consolidatedMetrics;

    } catch (error) {
      this.logger.error('Failed to generate consolidated sales metrics:', error);
      throw error;
    }
  }

  async getChannelBreakdown(period: string): Promise<ChannelMetrics[]> {
    try {
      const [b2bMetrics, b2cMetrics] = await Promise.allSettled([
        this.b2bService.getSalesMetrics(period),
        this.b2cService.getAnalytics(period),
      ]);

      const channels: ChannelMetrics[] = [];

      if (b2bMetrics.status === 'fulfilled') {
        channels.push({
          channel: 'b2b',
          revenue: b2bMetrics.value.totalRevenue || 0,
          orders: b2bMetrics.value.totalOrders || 0,
          customers: b2bMetrics.value.topCustomers?.length || 0,
          averageOrderValue: b2bMetrics.value.averageOrderValue || 0,
        });
      }

      if (b2cMetrics.status === 'fulfilled') {
        channels.push({
          channel: 'b2c',
          revenue: b2cMetrics.value.revenue || 0,
          orders: b2cMetrics.value.orders || 0,
          customers: b2cMetrics.value.customers || 0,
          averageOrderValue: b2cMetrics.value.averageOrderValue || 0,
        });
      }

      return channels;

    } catch (error) {
      this.logger.error('Failed to generate channel breakdown:', error);
      throw error;
    }
  }

  async getTopProducts(period: string, limit = 10): Promise<ProductAnalytics[]> {
    try {
      const [b2bProducts, b2cProducts] = await Promise.allSettled([
        this.b2bService.syncProducts(),
        this.b2cService.syncProducts(),
      ]);

      const productMap = new Map<string, ProductAnalytics>();

      // Process B2B products
      if (b2bProducts.status === 'fulfilled') {
        for (const product of b2bProducts.value) {
          const analytics: ProductAnalytics = {
            productId: product.id,
            name: product.name,
            totalSales: 0, // Would need order data to calculate
            totalRevenue: 0,
            averagePrice: product.price || 0,
            category: product.category || 'Unknown',
          };
          productMap.set(product.id, analytics);
        }
      }

      // Process B2C products
      if (b2cProducts.status === 'fulfilled') {
        for (const product of b2cProducts.value) {
          const existing = productMap.get(product.id);
          if (existing) {
            // Update with B2C data
            existing.averagePrice = (existing.averagePrice + (product.price || 0)) / 2;
          } else {
            const analytics: ProductAnalytics = {
              productId: product.id,
              name: product.name,
              totalSales: 0,
              totalRevenue: 0,
              averagePrice: product.price || 0,
              category: product.category || 'Unknown',
            };
            productMap.set(product.id, analytics);
          }
        }
      }

      return Array.from(productMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);

    } catch (error) {
      this.logger.error('Failed to get top products:', error);
      throw error;
    }
  }

  async getCustomerInsights(period: string, limit = 10): Promise<CustomerAnalytics[]> {
    try {
      const [b2bCustomers, b2cCustomers] = await Promise.allSettled([
        this.b2bService.syncCustomers(),
        this.b2cService.syncCustomers(),
      ]);

      const customerMap = new Map<string, CustomerAnalytics>();

      // Process B2B customers
      if (b2bCustomers.status === 'fulfilled') {
        for (const customer of b2bCustomers.value) {
          const analytics: CustomerAnalytics = {
            customerId: customer.id,
            name: customer.name,
            totalOrders: 0, // Would need order data
            totalSpent: 0,
            averageOrderValue: 0,
            lastOrderDate: new Date(),
            tier: customer.tier || 'standard',
          };
          customerMap.set(customer.id, analytics);
        }
      }

      // Process B2C customers
      if (b2cCustomers.status === 'fulfilled') {
        for (const customer of b2cCustomers.value) {
          const existing = customerMap.get(customer.id);
          if (!existing) {
            const analytics: CustomerAnalytics = {
              customerId: customer.id,
              name: customer.name,
              totalOrders: 0,
              totalSpent: 0,
              averageOrderValue: 0,
              lastOrderDate: new Date(),
              tier: customer.tier || 'retail',
            };
            customerMap.set(customer.id, analytics);
          }
        }
      }

      return Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);

    } catch (error) {
      this.logger.error('Failed to get customer insights:', error);
      throw error;
    }
  }

  async getRealtimeMetrics(): Promise<{
    activeUsers: number;
    currentOrders: number;
    todayRevenue: number;
    conversionRate: number;
  }> {
    try {
      // This would integrate with real-time tracking systems
      return {
        activeUsers: Math.floor(Math.random() * 50) + 10, // Mock data
        currentOrders: Math.floor(Math.random() * 20) + 5,
        todayRevenue: Math.floor(Math.random() * 50000) + 10000,
        conversionRate: Math.random() * 5 + 2, // 2-7%
      };

    } catch (error) {
      this.logger.error('Failed to get realtime metrics:', error);
      throw error;
    }
  }

  async getInventoryAnalytics(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
  }> {
    try {
      const products = await this.erpService.syncProducts();
      
      let totalProducts = products.length;
      let lowStockItems = 0;
      let outOfStockItems = 0;
      let totalValue = 0;

      for (const product of products) {
        const available = product.stockQuantity;
        
        if (available === 0) {
          outOfStockItems++;
        } else if (available <= 10) { // Assuming reorder level of 10
          lowStockItems++;
        }
        
        totalValue += (product.price || 0) * available;
      }

      return {
        totalProducts,
        lowStockItems,
        outOfStockItems,
        totalValue,
      };

    } catch (error) {
      this.logger.error('Failed to get inventory analytics:', error);
      throw error;
    }
  }

  async generateDashboardData(period: string): Promise<{
    salesMetrics: ConsolidatedSalesMetrics;
    channelBreakdown: ChannelMetrics[];
    topProducts: ProductAnalytics[];
    customerInsights: CustomerAnalytics[];
    realtimeMetrics: any;
    inventoryAnalytics: any;
  }> {
    try {
      this.logger.info(`Generating dashboard data for period: ${period}`);

      const [
        salesMetrics,
        channelBreakdown,
        topProducts,
        customerInsights,
        realtimeMetrics,
        inventoryAnalytics,
      ] = await Promise.allSettled([
        this.getConsolidatedSalesMetrics(period),
        this.getChannelBreakdown(period),
        this.getTopProducts(period, 5),
        this.getCustomerInsights(period, 5),
        this.getRealtimeMetrics(),
        this.getInventoryAnalytics(),
      ]);

      return {
        salesMetrics: salesMetrics.status === 'fulfilled' ? salesMetrics.value : {
          revenue: 0, orders: 0, customers: 0, averageOrderValue: 0, period
        },
        channelBreakdown: channelBreakdown.status === 'fulfilled' ? channelBreakdown.value : [],
        topProducts: topProducts.status === 'fulfilled' ? topProducts.value : [],
        customerInsights: customerInsights.status === 'fulfilled' ? customerInsights.value : [],
        realtimeMetrics: realtimeMetrics.status === 'fulfilled' ? realtimeMetrics.value : {},
        inventoryAnalytics: inventoryAnalytics.status === 'fulfilled' ? inventoryAnalytics.value : {},
      };

    } catch (error) {
      this.logger.error('Failed to generate dashboard data:', error);
      throw error;
    }
  }

  async exportReport(period: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const dashboardData = await this.generateDashboardData(period);
      
      if (format === 'json') {
        return JSON.stringify(dashboardData, null, 2);
      }
      
      // CSV export would be implemented here
      return 'CSV export not implemented yet';

    } catch (error) {
      this.logger.error('Failed to export report:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; details?: any }> {
    try {
      const testMetrics = await this.getRealtimeMetrics();
      
      return {
        status: 'healthy',
        details: {
          analyticsService: 'operational',
          lastGenerated: new Date().toISOString(),
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
}

export default AnalyticsService;

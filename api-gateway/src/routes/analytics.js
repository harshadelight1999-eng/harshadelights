const express = require('express');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Mock analytics data (in production, this would come from your data warehouse/analytics engine)
const analyticsData = {
  // Sales metrics
  salesMetrics: {
    totalRevenue: 2485000,
    totalOrders: 2587,
    totalCustomers: 208,
    averageOrderValue: 9612,
    conversionRate: 3.45,
    cartAbandonmentRate: 23.4,
    customerLifetimeValue: 42300,
    revenueGrowth: 12.5,
    orderGrowth: 8.2,
    customerGrowth: 15.3
  },

  // Monthly sales data
  monthlySales: [
    { month: 'Jan', revenue: 125000, orders: 145, customers: 89, newCustomers: 23 },
    { month: 'Feb', revenue: 138000, orders: 162, customers: 96, newCustomers: 18 },
    { month: 'Mar', revenue: 165000, orders: 189, customers: 112, newCustomers: 29 },
    { month: 'Apr', revenue: 142000, orders: 156, customers: 98, newCustomers: 15 },
    { month: 'May', revenue: 189000, orders: 215, customers: 134, newCustomers: 34 },
    { month: 'Jun', revenue: 198000, orders: 234, customers: 145, newCustomers: 28 },
    { month: 'Jul', revenue: 205000, orders: 245, customers: 152, newCustomers: 22 },
    { month: 'Aug', revenue: 225000, orders: 267, customers: 168, newCustomers: 31 },
    { month: 'Sep', revenue: 212000, orders: 251, customers: 159, newCustomers: 19 },
    { month: 'Oct', revenue: 238000, orders: 289, customers: 178, newCustomers: 35 },
    { month: 'Nov', revenue: 265000, orders: 312, customers: 195, newCustomers: 42 },
    { month: 'Dec', revenue: 285000, orders: 342, customers: 208, newCustomers: 38 }
  ],

  // Product performance
  topProducts: [
    { id: '1', name: 'Premium Kaju Katli', orders: 234, revenue: 125400, margin: 42, category: 'Traditional Sweets' },
    { id: '2', name: 'Royal Gulab Jamun', orders: 189, revenue: 98200, margin: 38, category: 'Traditional Sweets' },
    { id: '3', name: 'Chocolate Truffle Box', orders: 156, revenue: 156000, margin: 35, category: 'Premium Chocolates' },
    { id: '4', name: 'Mixed Dry Fruits', orders: 145, revenue: 87000, margin: 48, category: 'Dry Fruits' },
    { id: '5', name: 'Festival Gift Hamper', orders: 98, revenue: 147000, margin: 32, category: 'Gift Boxes' }
  ],

  // Category performance
  categoryPerformance: [
    { name: 'Traditional Sweets', revenue: 1285000, orders: 892, margin: 40, growth: 15.2 },
    { name: 'Premium Chocolates', revenue: 865000, orders: 456, margin: 35, growth: 22.8 },
    { name: 'Dry Fruits', revenue: 520000, orders: 298, margin: 45, growth: 8.7 },
    { name: 'Gift Boxes', revenue: 425000, orders: 189, margin: 30, growth: 28.4 },
    { name: 'Beverages', revenue: 185000, orders: 134, margin: 25, growth: 12.3 }
  ],

  // Customer segments
  customerSegments: [
    { segment: 'Premium', minSpend: 50000, customers: 45, revenue: 1850000, avgOrderValue: 15200, retention: 92 },
    { segment: 'Regular', minSpend: 20000, customers: 128, revenue: 2140000, avgOrderValue: 8500, retention: 78 },
    { segment: 'New', minSpend: 0, customers: 267, revenue: 1890000, avgOrderValue: 4200, retention: 45 }
  ],

  // Geographic performance
  geographicData: [
    { region: 'Mumbai', revenue: 685000, orders: 456, customers: 89 },
    { region: 'Delhi', revenue: 542000, orders: 378, customers: 72 },
    { region: 'Bangalore', revenue: 432000, orders: 298, customers: 58 },
    { region: 'Chennai', revenue: 398000, orders: 267, customers: 51 },
    { region: 'Pune', revenue: 285000, orders: 189, customers: 38 }
  ],

  // Recent orders
  recentOrders: [
    { id: 'ORD-2024-001', customer: 'Sweet Solutions Ltd', amount: 12500, status: 'delivered', date: '2024-01-15', items: 8 },
    { id: 'ORD-2024-002', customer: 'Celebration Caterers', amount: 8200, status: 'shipped', date: '2024-01-14', items: 5 },
    { id: 'ORD-2024-003', customer: 'Royal Events Co', amount: 15600, status: 'processing', date: '2024-01-14', items: 12 },
    { id: 'ORD-2024-004', customer: 'Mumbai Sweets Chain', amount: 25000, status: 'delivered', date: '2024-01-13', items: 18 },
    { id: 'ORD-2024-005', customer: 'Delhi Confectionery', amount: 9800, status: 'pending', date: '2024-01-13', items: 6 }
  ],

  // Inventory insights
  inventoryInsights: [
    { product: 'Premium Kaju Katli', stock: 45, reorderLevel: 20, daysToStockout: 8, trending: 'up' },
    { product: 'Royal Gulab Jamun', stock: 12, reorderLevel: 15, daysToStockout: 3, trending: 'critical' },
    { product: 'Chocolate Truffle Box', stock: 67, reorderLevel: 25, daysToStockout: 12, trending: 'stable' },
    { product: 'Mixed Dry Fruits', stock: 89, reorderLevel: 30, daysToStockout: 18, trending: 'up' },
    { product: 'Festival Gift Hamper', stock: 23, reorderLevel: 10, daysToStockout: 15, trending: 'stable' }
  ]
};

// Get overall business metrics
router.get('/overview',
  authMiddleware.authenticate({ applications: ['b2b', 'admin'] }),
  (req, res) => {
    try {
      const { dateRange, compareWith } = req.query;

      // In production, filter data based on dateRange
      const overview = {
        metrics: analyticsData.salesMetrics,
        trends: {
          revenue: analyticsData.monthlySales.slice(-6),
          orders: analyticsData.monthlySales.slice(-6),
          customers: analyticsData.monthlySales.slice(-6)
        },
        alerts: [
          { type: 'warning', message: 'Royal Gulab Jamun stock is running low', priority: 'high' },
          { type: 'success', message: 'Premium Chocolates sales up 22.8% this month', priority: 'medium' },
          { type: 'info', message: 'New customer acquisition target exceeded', priority: 'low' }
        ]
      };

      logger.info('Analytics overview requested', {
        userId: req.user.id,
        dateRange,
        compareWith
      });

      res.json({
        success: true,
        data: overview,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Analytics overview error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics overview',
        message: error.message
      });
    }
  }
);

// Get sales analytics
router.get('/sales',
  authMiddleware.authenticate({ applications: ['b2b', 'admin'] }),
  (req, res) => {
    try {
      const { period = 'monthly', metric = 'revenue', category } = req.query;

      let salesData = analyticsData.monthlySales;

      // Filter by category if specified
      if (category) {
        // In production, filter by category
        salesData = salesData.map(item => ({
          ...item,
          // Mock category filtering
          revenue: Math.round(item.revenue * 0.8),
          orders: Math.round(item.orders * 0.8)
        }));
      }

      const sales = {
        timeSeries: salesData,
        summary: {
          totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
          totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0),
          averageOrderValue: Math.round(
            salesData.reduce((sum, item) => sum + item.revenue, 0) /
            salesData.reduce((sum, item) => sum + item.orders, 0)
          ),
          growth: {
            revenue: 12.5,
            orders: 8.2,
            customers: 15.3
          }
        },
        forecasting: {
          nextMonth: {
            predictedRevenue: 295000,
            confidence: 87,
            factors: ['seasonal trends', 'historical growth', 'market conditions']
          }
        }
      };

      logger.info('Sales analytics requested', {
        userId: req.user.id,
        period,
        metric,
        category
      });

      res.json({
        success: true,
        data: sales,
        parameters: { period, metric, category },
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Sales analytics error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sales analytics',
        message: error.message
      });
    }
  }
);

// Get product performance analytics
router.get('/products',
  authMiddleware.authenticate({ applications: ['b2b', 'admin'] }),
  (req, res) => {
    try {
      const { sortBy = 'revenue', limit = 10, category } = req.query;

      let products = [...analyticsData.topProducts];

      // Filter by category if specified
      if (category) {
        products = products.filter(product =>
          product.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Sort products
      products.sort((a, b) => {
        switch (sortBy) {
          case 'orders': return b.orders - a.orders;
          case 'margin': return b.margin - a.margin;
          case 'revenue':
          default: return b.revenue - a.revenue;
        }
      });

      const productAnalytics = {
        topProducts: products.slice(0, parseInt(limit)),
        categoryPerformance: analyticsData.categoryPerformance,
        insights: {
          bestPerformer: products[0],
          highestMargin: products.reduce((max, p) => p.margin > max.margin ? p : max),
          fastestGrowing: 'Premium Chocolates', // Mock data
          recommendations: [
            'Increase inventory for Royal Gulab Jamun due to high demand',
            'Consider premium pricing for Chocolate Truffle Box',
            'Expand Gift Boxes category for upcoming festivals'
          ]
        },
        inventory: analyticsData.inventoryInsights
      };

      logger.info('Product analytics requested', {
        userId: req.user.id,
        sortBy,
        limit,
        category
      });

      res.json({
        success: true,
        data: productAnalytics,
        parameters: { sortBy, limit, category },
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product analytics error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product analytics',
        message: error.message
      });
    }
  }
);

// Get customer analytics
router.get('/customers',
  authMiddleware.authenticate({ applications: ['b2b', 'admin'] }),
  (req, res) => {
    try {
      const { segment, region } = req.query;

      let customerData = {
        segments: analyticsData.customerSegments,
        geographic: analyticsData.geographicData,
        lifecycle: {
          acquisition: {
            thisMonth: 38,
            lastMonth: 42,
            growth: -9.5,
            channels: [
              { name: 'Organic Search', customers: 15, cost: 2500 },
              { name: 'Referrals', customers: 12, cost: 0 },
              { name: 'Social Media', customers: 8, cost: 1800 },
              { name: 'Direct', customers: 3, cost: 0 }
            ]
          },
          retention: {
            overall: 72,
            by_segment: {
              premium: 92,
              regular: 78,
              new: 45
            }
          },
          churn: {
            rate: 28,
            reasons: [
              { reason: 'Price sensitivity', percentage: 35 },
              { reason: 'Product availability', percentage: 25 },
              { reason: 'Service issues', percentage: 20 },
              { reason: 'Competition', percentage: 20 }
            ]
          }
        },
        behavior: {
          averageSessionTime: '8m 34s',
          pagesPerSession: 4.2,
          bounceRate: 42.3,
          repeatPurchaseRate: 68.7
        }
      };

      // Filter by segment if specified
      if (segment) {
        customerData.segments = customerData.segments.filter(s =>
          s.segment.toLowerCase() === segment.toLowerCase()
        );
      }

      // Filter by region if specified
      if (region) {
        customerData.geographic = customerData.geographic.filter(g =>
          g.region.toLowerCase().includes(region.toLowerCase())
        );
      }

      logger.info('Customer analytics requested', {
        userId: req.user.id,
        segment,
        region
      });

      res.json({
        success: true,
        data: customerData,
        parameters: { segment, region },
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer analytics error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer analytics',
        message: error.message
      });
    }
  }
);

// Get real-time dashboard data
router.get('/dashboard',
  authMiddleware.authenticate({ applications: ['b2b', 'admin'] }),
  (req, res) => {
    try {
      const dashboardData = {
        realTime: {
          activeUsers: 23,
          currentOrders: 7,
          todayRevenue: 28500,
          averageOrderValue: 4071,
          lastUpdated: new Date().toISOString()
        },
        recent: {
          orders: analyticsData.recentOrders.slice(0, 5),
          customers: [
            { name: 'Sweet Solutions Ltd', action: 'placed order', amount: 12500, time: '5 minutes ago' },
            { name: 'Celebration Caterers', action: 'registered', amount: null, time: '12 minutes ago' },
            { name: 'Royal Events Co', action: 'updated profile', amount: null, time: '18 minutes ago' }
          ]
        },
        alerts: [
          { type: 'critical', message: 'Royal Gulab Jamun stock critical (12 units remaining)', timestamp: new Date().toISOString() },
          { type: 'warning', message: 'Premium Kaju Katli below reorder level', timestamp: new Date().toISOString() },
          { type: 'info', message: 'Monthly revenue target 95% achieved', timestamp: new Date().toISOString() }
        ],
        performance: {
          pageLoadTime: '1.2s',
          apiResponseTime: '245ms',
          uptime: '99.97%',
          errors: 0
        }
      };

      logger.info('Dashboard data requested', {
        userId: req.user.id
      });

      res.json({
        success: true,
        data: dashboardData,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Dashboard data error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard data',
        message: error.message
      });
    }
  }
);

// Export analytics data
router.get('/export',
  authMiddleware.authenticate({ applications: ['b2b', 'admin'], permissions: ['export_data'] }),
  (req, res) => {
    try {
      const { format = 'json', type = 'overview', dateRange } = req.query;

      let exportData;

      switch (type) {
        case 'sales':
          exportData = analyticsData.monthlySales;
          break;
        case 'products':
          exportData = analyticsData.topProducts;
          break;
        case 'customers':
          exportData = analyticsData.customerSegments;
          break;
        case 'overview':
        default:
          exportData = {
            overview: analyticsData.salesMetrics,
            sales: analyticsData.monthlySales,
            products: analyticsData.topProducts,
            customers: analyticsData.customerSegments
          };
      }

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${new Date().toISOString().split('T')[0]}.csv"`);

        // Convert to CSV (simplified)
        if (Array.isArray(exportData)) {
          const csv = [
            Object.keys(exportData[0]).join(','),
            ...exportData.map(row => Object.values(row).join(','))
          ].join('\n');
          res.send(csv);
        } else {
          res.status(400).json({ error: 'CSV export not available for this data type' });
        }
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${new Date().toISOString().split('T')[0]}.json"`);
        res.json({
          exportedAt: new Date().toISOString(),
          type,
          dateRange,
          data: exportData
        });
      }

      logger.info('Analytics data exported', {
        userId: req.user.id,
        type,
        format,
        dateRange
      });

    } catch (error) {
      logger.error('Analytics export error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics data',
        message: error.message
      });
    }
  }
);

module.exports = router;
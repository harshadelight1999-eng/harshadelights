import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics-service';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('AnalyticsRoutes');

export function createAnalyticsRoutes(analyticsService: AnalyticsService): Router {
  
  // Get consolidated sales metrics
  router.get('/metrics/sales/:period', async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      const metrics = await analyticsService.getConsolidatedSalesMetrics(period);
      
      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Failed to get sales metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sales metrics',
      });
    }
  });

  // Get channel breakdown
  router.get('/metrics/channels/:period', async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      const channels = await analyticsService.getChannelBreakdown(period);
      
      res.json({
        success: true,
        data: channels,
      });
    } catch (error) {
      logger.error('Failed to get channel breakdown:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve channel breakdown',
      });
    }
  });

  // Get top products
  router.get('/products/top/:period', async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      const { limit = '10' } = req.query;
      
      const products = await analyticsService.getTopProducts(period, parseInt(limit as string));
      
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Failed to get top products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve top products',
      });
    }
  });

  // Get customer insights
  router.get('/customers/insights/:period', async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      const { limit = '10' } = req.query;
      
      const customers = await analyticsService.getCustomerInsights(period, parseInt(limit as string));
      
      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      logger.error('Failed to get customer insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve customer insights',
      });
    }
  });

  // Get realtime metrics
  router.get('/metrics/realtime', async (req: Request, res: Response) => {
    try {
      const metrics = await analyticsService.getRealtimeMetrics();
      
      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Failed to get realtime metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve realtime metrics',
      });
    }
  });

  // Get inventory analytics
  router.get('/inventory/analytics', async (req: Request, res: Response) => {
    try {
      const analytics = await analyticsService.getInventoryAnalytics();
      
      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      logger.error('Failed to get inventory analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve inventory analytics',
      });
    }
  });

  // Get complete dashboard data
  router.get('/dashboard/:period', async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      const dashboardData = await analyticsService.generateDashboardData(period);
      
      res.json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      logger.error('Failed to get dashboard data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve dashboard data',
      });
    }
  });

  // Export analytics report
  router.get('/export/:period', async (req: Request, res: Response) => {
    try {
      const { period } = req.params;
      const { format = 'json' } = req.query;
      
      const report = await analyticsService.exportReport(period, format as 'json' | 'csv');
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}.csv"`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}.json"`);
      }
      
      res.send(report);
    } catch (error) {
      logger.error('Failed to export report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics report',
      });
    }
  });

  // Analytics service health check
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const health = await analyticsService.healthCheck();
      
      res.status(health.status === 'healthy' ? 200 : 503).json({
        success: health.status === 'healthy',
        data: health,
      });
    } catch (error) {
      logger.error('Analytics health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'Analytics service health check failed',
      });
    }
  });

  return router;
}

export default createAnalyticsRoutes;

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { logger } from './utils/logger';
import { config } from './config';
import { messageBroker } from './services/MessageBroker';
import { customerSyncService } from './services/CustomerSyncService';
import { inventorySyncService } from './services/InventorySyncService';
import { orderSyncService } from './services/OrderSyncService';
import { WebSocketServer, webSocketServer } from './services/WebSocketServer';
import { webhookHandler } from './services/WebhookHandler';

class SyncServicesApp {
  private app: express.Express;
  private server: any;
  private webSocketServer: WebSocketServer;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupServer();
  }

  private setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    }));

    // Compression
    this.app.use(compression());

    // JSON parsing (for non-webhook routes)
    this.app.use((req, res, next) => {
      if (req.path.startsWith('/webhooks')) {
        next(); // Skip JSON parsing for webhooks
      } else {
        express.json({ limit: '10mb' })(req, res, next);
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path}`, {
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent'),
        });
      });
      next();
    });
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        services: {
          messageBroker: 'running',
          webSocket: 'running',
          webhooks: 'running',
        },
      });
    });

    // Webhook routes
    this.app.use(webhookHandler.getWebhookApp());

    // API routes
    this.app.use('/api', this.createApiRoutes());

    // Default route
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Harsha Delights Sync Services',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          webhooks: '/webhooks',
          api: '/api',
          websocket: '/socket.io',
        },
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
      });
    });

    // Error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private createApiRoutes(): express.Router {
    const router = express.Router();

    // Sync status endpoints
    router.get('/sync/status', async (req, res) => {
      try {
        const queueStats = await Promise.all([
          messageBroker.getQueueStats('customer-sync'),
          messageBroker.getQueueStats('inventory-sync'),
          messageBroker.getQueueStats('order-sync'),
          messageBroker.getQueueStats('pricing-sync'),
        ]);

        const connectionStats = this.webSocketServer?.getConnectionStats() || {};

        res.json({
          queues: {
            'customer-sync': queueStats[0],
            'inventory-sync': queueStats[1],
            'order-sync': queueStats[2],
            'pricing-sync': queueStats[3],
          },
          websocket: connectionStats,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to get sync status:', error);
        res.status(500).json({
          error: 'Failed to get sync status',
          message: error.message,
        });
      }
    });

    // Manual sync triggers
    router.post('/sync/customers', async (req, res) => {
      try {
        const { source } = req.body;
        await customerSyncService.syncAllCustomers(source);
        res.json({
          success: true,
          message: `Customer sync initiated from ${source}`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to trigger customer sync:', error);
        res.status(500).json({
          error: 'Failed to trigger customer sync',
          message: error.message,
        });
      }
    });

    router.post('/sync/inventory', async (req, res) => {
      try {
        const { warehouse } = req.body;
        await inventorySyncService.syncAllInventory(warehouse);
        res.json({
          success: true,
          message: `Inventory sync initiated${warehouse ? ` for warehouse ${warehouse}` : ''}`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to trigger inventory sync:', error);
        res.status(500).json({
          error: 'Failed to trigger inventory sync',
          message: error.message,
        });
      }
    });

    router.post('/sync/low-stock', async (req, res) => {
      try {
        await inventorySyncService.syncLowStockItems();
        res.json({
          success: true,
          message: 'Low stock sync initiated',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to trigger low stock sync:', error);
        res.status(500).json({
          error: 'Failed to trigger low stock sync',
          message: error.message,
        });
      }
    });

    return router;
  }

  private setupServer() {
    const port = config.port || 3001;

    this.server = createServer(this.app);
    this.webSocketServer = new WebSocketServer(this.server);

    this.server.listen(port, () => {
      logger.info(`🚀 Sync Services server started on port ${port}`);
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      logger.info(`🔗 WebSocket: ws://localhost:${port}/socket.io`);
      logger.info(`🪝 Webhooks: http://localhost:${port}/webhooks`);
      logger.info(`🔌 API: http://localhost:${port}/api`);
    });
  }

  public async start() {
    try {
      logger.info('🔄 Starting Harsha Delights Sync Services...');
      logger.info('✅ All sync services started successfully');
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('❌ Failed to start sync services:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown() {
    const shutdown = async (signal: string) => {
      logger.info(`📡 Received ${signal}, starting graceful shutdown...`);
      try {
        if (this.webSocketServer) {
          await this.webSocketServer.shutdown();
        }
        await messageBroker.close();
        this.server.close(() => {
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        });
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

const app = new SyncServicesApp();
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default app;
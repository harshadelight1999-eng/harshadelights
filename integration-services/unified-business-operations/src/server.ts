import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { IntegrationOrchestrator } from './services/integration-orchestrator';
import { integrationConfig } from './config/integration-config';
import { Logger } from './utils/logger';
import authRoutes from './routes/auth-routes';
import { createAnalyticsRoutes } from './routes/analytics-routes';
import AuthMiddleware from './middleware/auth-middleware';

const app = express();
const server = createServer(app);
const logger = new Logger('IntegrationServer');
const orchestrator = new IntegrationOrchestrator();
const authMiddleware = new AuthMiddleware();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:4000',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use('/api/auth', authRoutes);

// Analytics routes (protected)
app.use('/api/analytics', 
  authMiddleware.authenticate,
  authMiddleware.requirePermission('analytics.read'),
  createAnalyticsRoutes(orchestrator.getAnalyticsService())
);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const status = await orchestrator.getIntegrationStatus();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      integration: status,
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Integration status endpoint (protected)
app.get('/api/integration/status', 
  authMiddleware.authenticate,
  authMiddleware.requirePermission('integration.read'),
  async (req, res) => {
    try {
      const status = await orchestrator.getIntegrationStatus();
      res.json(status);
    } catch (error) {
      logger.error('Error getting integration status:', error);
      res.status(500).json({ error: 'Failed to get integration status' });
    }
  }
);

// Manual sync endpoints (protected)
app.post('/api/integration/sync/customer/:id',
  authMiddleware.authenticate,
  authMiddleware.requirePermission('integration.sync'),
  async (req, res) => {
    try {
      const { id } = req.params;
      await orchestrator.syncCustomerToAll(id);
      res.json({ success: true, message: `Customer ${id} synced successfully` });
    } catch (error) {
      logger.error(`Error syncing customer ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to sync customer' });
    }
  }
);

app.post('/api/integration/sync/order/:id',
  authMiddleware.authenticate,
  authMiddleware.requirePermission('integration.sync'),
  async (req, res) => {
    try {
      const { id } = req.params;
      await orchestrator.syncOrderToAll(id);
      res.json({ success: true, message: `Order ${id} synced successfully` });
    } catch (error) {
      logger.error(`Error syncing order ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to sync order' });
    }
  }
);

// WebSocket connection info
app.get('/api/integration/websocket', (req, res) => {
  res.json({
    url: `ws://localhost:${integrationConfig.apiGateway.port}/ws`,
    channels: [
      'customer-updates',
      'order-updates',
      'inventory-updates',
      'pricing-updates',
      'territory-updates',
      'product-updates',
      'general-updates',
    ],
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  try {
    await orchestrator.shutdown();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  try {
    await orchestrator.shutdown();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
async function startServer() {
  try {
    // Initialize integration orchestrator
    await orchestrator.initialize(server);
    
    const port = integrationConfig.apiGateway.port || 4000;
    
    server.listen(port, () => {
      logger.info(`Integration server running on port ${port}`);
      logger.info(`WebSocket server available at ws://localhost:${port}/ws`);
      logger.info(`Health check: http://localhost:${port}/health`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

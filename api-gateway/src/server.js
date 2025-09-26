/**
 * Main Server Entry Point for Harsha Delights API Gateway
 * Initializes and starts the Express server with all middleware and routes
 */

// Initialize DataDog tracing FIRST - must be imported before any other modules
require('./middleware/datadogMiddleware');

require('dotenv').config();

// Add global error handlers to catch startup issues
process.on('uncaughtException', (error) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🚀 Initializing Harsha Delights API Gateway...');

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Import configuration and services
console.log('📊 Loading configuration...');
const config = require('./config');
console.log('✅ Configuration loaded successfully');

console.log('🗄️ Loading database modules...');
const { initializeDatabases, getApiGatewayDB } = require('./config/database');
console.log('✅ Database modules loaded');

console.log('🔄 Loading Redis manager...');
const redisManager = require('./config/redis');
console.log('✅ Redis manager loaded');

console.log('💾 Loading database connection pool...');
const dbConnectionManager = require('./shared/database/connection-pool');
console.log('✅ Database connection pool loaded');

console.log('📝 Loading logger...');
const { logger } = require('./utils/logger');
console.log('✅ Logger loaded successfully');

console.log('👤 Loading User model...');
const User = require('./models/User');
console.log('✅ User model loaded');

console.log('🔐 Loading auth middleware...');
const createAuthMiddleware = require('./middleware/auth');
console.log('✅ Auth middleware loaded');

console.log('🛡️ Loading security middleware...');
const securityMiddleware = require('./middleware/securityMiddleware');
console.log('✅ Security middleware loaded');

// Import monitoring and security middleware
console.log('📊 Initializing monitoring systems...');
const {
  initializeSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  addSentryContext
} = require('./middleware/sentryMiddleware');
const {
  datadogMiddleware,
  injectTraceId,
  getMetrics
} = require('./middleware/datadogMiddleware');
const {
  registerHealthChecks,
  createHealthEndpoint,
  performStartupHealthCheck,
  startPeriodicHealthChecks
} = require('./middleware/healthMiddleware');
const {
  initializeSecurityMiddleware,
  createCorsConfiguration
} = require('./middleware/securityEnhancementMiddleware');
const {
  sanitizeInput,
  contentSecurityPolicy
} = require('./middleware/validationMiddleware');

// Import legacy middleware (will be enhanced)
const legacySecurityMiddleware = require('./middleware/securityMiddleware');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');

// Import routes
const routes = require('./routes');

// Import unified service modules
// const serviceModules = require('./modules'); // TODO: Create modules directory

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Harsha Delights API Gateway',
      version: config.app.version,
      description: `
        API Gateway for Harsha Delights confectionery system integration.

        This gateway provides centralized access to:
        - ERPNext business operations
        - Real-time inventory management
        - Dynamic pricing engine
        - Customer segmentation
        - Order processing

        ## Authentication

        The API supports two authentication methods:

        ### JWT Bearer Token
        Include in the Authorization header:
        \`\`\`
        Authorization: Bearer <your-jwt-token>
        \`\`\`

        ### API Key
        Include in the X-API-Key header:
        \`\`\`
        X-API-Key: <your-api-key>
        \`\`\`

        ## Rate Limiting

        Different rate limits apply based on your authentication tier:
        - Basic: 30 requests/minute
        - Standard: 100 requests/minute
        - Premium: 500 requests/minute
        - Unlimited: No limits

        ## Error Codes

        Common error codes you may encounter:
        - \`AUTHENTICATION_REQUIRED\`: Missing or invalid authentication
        - \`RATE_LIMIT_EXCEEDED\`: Too many requests
        - \`CIRCUIT_BREAKER_OPEN\`: Upstream service unavailable
        - \`VALIDATION_ERROR\`: Request validation failed
      `,
      contact: {
        name: 'Harsha Delights Development Team',
        email: 'dev@harshadelights.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}`,
        description: 'Development server'
      },
      {
        url: 'https://api.harshadelights.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and session management' },
      { name: 'Two-Factor Authentication', description: 'TOTP-based 2FA setup and management' },
      { name: 'API Keys', description: 'API key creation and management' },
      { name: 'Session Management', description: 'User session monitoring and control' },
      { name: 'Customers', description: 'Customer data from ERPNext with segmentation' },
      { name: 'Items', description: 'Product catalog and inventory items' },
      { name: 'Inventory', description: 'Real-time stock levels and batch tracking' },
      { name: 'Pricing', description: 'Dynamic pricing engine' },
      { name: 'Orders', description: 'Sales order management' },
      { name: 'Admin', description: 'Administrative functions (admin only)' },
      { name: 'Admin - Users', description: 'User management (admin only)' },
      { name: 'Admin - API Keys', description: 'API key administration (admin only)' },
      { name: 'Admin - Routes', description: 'Service route management (admin only)' },
      { name: 'Admin - System', description: 'System monitoring (admin only)' },
      { name: 'Admin - Audit', description: 'Audit log access (admin only)' },
      { name: 'Health Check', description: 'Service health and status endpoints' },
      { name: 'Monitoring', description: 'System metrics and monitoring' },
      { name: 'System', description: 'General system information' }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

class ApiGatewayServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.isShuttingDown = false;
    this.db = null;
    this.authMiddleware = null;
    this.userModel = null;
  }

  async initialize() {
    try {
      logger.info('🚀 Initializing Harsha Delights API Gateway...');

      // Initialize monitoring systems FIRST
      logger.info('📊 Initializing monitoring systems...');

      // Initialize Sentry for error tracking
      if (process.env.SENTRY_DSN) {
        initializeSentry();
        logger.info('✅ Sentry error monitoring initialized');
      } else {
        logger.warn('⚠️  Sentry DSN not configured - error monitoring disabled');
      }

      // Register health checks
      registerHealthChecks();
      logger.info('✅ Health checks registered');

      // Initialize database connections with retry logic
      logger.info('🗄️  Initializing database connections with retry logic...');

      let dbInitialized = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!dbInitialized && attempts < maxAttempts) {
        try {
          attempts++;
          logger.info(`Database initialization attempt ${attempts}/${maxAttempts}...`);

          // Initialize unified database connection pools
          await dbConnectionManager.initialize();

          // Get database connection (getApiGatewayDB should be safe to call even if initialization failed)
          this.db = getApiGatewayDB();

          if (this.db) {
            logger.info('✅ Database connections established successfully');
            
            // Run database migrations
            logger.info('🔄 Running database migrations...');
            try {
              const { runMigrations } = require('./scripts/run-migrations');
              const migrationResults = await runMigrations(this.db);
              logger.info('✅ Database migrations completed', migrationResults);
            } catch (error) {
              logger.error('❌ Database migrations failed:', error);
              // Continue startup even if migrations fail to allow manual intervention
              logger.warn('⚠️  Server starting with potentially incomplete database schema');
            }
            
            dbInitialized = true;
          } else {
            throw new Error('Database connection returned null');
          }

        } catch (error) {
          logger.error(`Database initialization attempt ${attempts} failed:`, error);

          if (attempts < maxAttempts) {
            const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
            logger.info(`Retrying database initialization in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            logger.error('All database initialization attempts failed. Starting in API-only mode.');
            this.db = null; // Ensure db is null for graceful degradation
          }
        }
      }

      // Initialize user model and authentication
      logger.info('🔐 Initializing authentication system...');

      if (this.db) {
        try {
          this.userModel = new User(this.db);
          this.authMiddleware = createAuthMiddleware(this.db);

          // Create database tables if they don't exist
          await User.createSchema(this.db);
          logger.info('✅ User authentication tables verified');
        } catch (error) {
          logger.error('Authentication system initialization failed:', error);
          logger.warn('🚨 Authentication will be disabled - API running in limited mode');
          this.userModel = null;
          this.authMiddleware = createAuthMiddleware(); // Use fallback auth middleware
        }
      } else {
        logger.warn('🚨 Database not available - Authentication disabled, API running in limited mode');
        this.userModel = null;
        this.authMiddleware = createAuthMiddleware(); // Use fallback auth middleware
      }

      // Initialize legacy Redis (for backward compatibility)
      logger.info('🔴 Initializing Redis...');
      try {
        await redisManager.initialize();
        logger.info('✅ Redis initialized successfully');
      } catch (error) {
        logger.error('❌ Redis initialization failed:', error);
        logger.warn('🚨 Continuing without Redis - API will run in limited mode');
      }

      // Perform startup health check (non-blocking in production)
      logger.info('🏥 Performing startup health check...');
      if (process.env.NODE_ENV === 'production') {
        // Run health check asynchronously in production to avoid blocking server start
        performStartupHealthCheck().catch(error => {
          logger.warn('⚠️  Startup health check failed, but continuing server startup:', error.message);
        });
      } else {
        await performStartupHealthCheck();
      }

      // Setup Express middleware
      logger.info('⚙️  Setting up middleware...');
      this.setupMiddleware();

      // Initialize service modules
      logger.info('🔧 Initializing service modules...');
      // await serviceModules.initialize(this.app); // TODO: Implement when modules exist

      // Setup routes
      logger.info('🛣️  Setting up routes...');
      this.setupRoutes();

      // Setup error handling
      logger.info('🚨 Setting up error handling...');
      this.setupErrorHandling();

      // Setup graceful shutdown
      logger.info('🔄 Setting up graceful shutdown...');
      this.setupGracefulShutdown();

      logger.info('✅ API Gateway initialization complete');

    } catch (error) {
      logger.error('❌ Failed to initialize API Gateway', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // Trust proxy (for load balancers, reverse proxies)
    this.app.set('trust proxy', 1);

    // Make database and auth middleware available to routes
    this.app.locals.db = this.db;
    this.app.locals.authMiddleware = this.authMiddleware;
    this.app.locals.userModel = this.userModel;

    // Initialize comprehensive security middleware
    const securityStack = securityMiddleware.createSecurityStack();
    securityStack.forEach(middleware => this.app.use(middleware));

    // Initialize legacy security middleware for backward compatibility
    const { rateLimiters } = initializeSecurityMiddleware(this.app);
    this.rateLimiters = rateLimiters;

    // Sentry request handling (must be first)
    if (process.env.SENTRY_DSN) {
      this.app.use(sentryRequestHandler());
      this.app.use(sentryTracingHandler());
      this.app.use(addSentryContext());
    }

    // DataDog tracing and metrics
    this.app.use(injectTraceId());
    this.app.use(datadogMiddleware());

    // CORS configuration
    this.app.use(cors(createCorsConfiguration()));

    // Compression middleware
    this.app.use(compression());

    // Content Security Policy
    this.app.use(contentSecurityPolicy());

    // Request logging with structured format
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim())
      },
      skip: (req) => {
        // Skip logging for health checks and metrics in production
        return process.env.NODE_ENV === 'production' &&
               (req.path === '/health' || req.path === '/metrics');
      }
    }));

    // Input sanitization
    this.app.use(sanitizeInput());

    // Body parsing middleware with size limits
    this.app.use(express.json({
      limit: '1mb', // Reduced for security
      type: 'application/json',
      verify: (req, res, buf, encoding) => {
        // Store raw body for webhook signature verification if needed
        req.rawBody = buf;
      }
    }));

    this.app.use(express.urlencoded({
      extended: true,
      limit: '1mb',
      parameterLimit: 100 // Limit number of parameters
    }));

    // Additional authentication rate limiters
    this.app.use('/api/auth/login', rateLimitMiddleware.authenticatedRateLimit());
    this.app.use('/api/auth/register', rateLimitMiddleware.authenticatedRateLimit());
    this.app.use('/api/auth/refresh', rateLimitMiddleware.authenticatedRateLimit());

    logger.info('✅ Enhanced middleware setup complete');
  }

  setupRoutes() {
    // Health check endpoint (high priority, no rate limiting)
    this.app.get('/health', createHealthEndpoint());
    this.app.get('/health/:check', createHealthEndpoint());

    // Metrics endpoint for Prometheus/DataDog
    this.app.get('/metrics', getMetrics());

    // Readiness and liveness probes for Kubernetes
    this.app.get('/ready', (req, res) => {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        version: config.app.version
      });
    });

    this.app.get('/live', (req, res) => {
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // API Documentation with authentication rate limiting
    if (config.swagger.enabled) {
      this.app.use('/api/docs', this.rateLimiters.api, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Harsha Delights API Gateway Documentation',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true
        }
      }));

      // Serve swagger spec as JSON
      this.app.get('/api/docs.json', this.rateLimiters.api, (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(swaggerSpec);
      });

      logger.info('✅ API Documentation available at /api/docs');
    }

    // Serve uploaded files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Apply appropriate rate limiting to different route groups
    this.app.use('/api/auth', this.rateLimiters.auth);
    this.app.use('/api/admin', this.rateLimiters.admin);
    this.app.use('/api/upload', this.rateLimiters.upload);
    this.app.use('/api', this.rateLimiters.api);

    // Main routes
    this.app.use('/', routes);

    logger.info('✅ Enhanced routes setup complete');
  }

  setupErrorHandling() {
    // 404 handler (should be after all routes)
    this.app.use('*', (req, res) => {
      logger.security('404 Not Found', {
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        severity: 'low'
      });

      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'ENDPOINT_NOT_FOUND',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        requestId: req.requestId || req.traceId
      });
    });

    // Sentry error handler (must be before other error handlers)
    if (process.env.SENTRY_DSN) {
      this.app.use(sentryErrorHandler());
    }

    // Global error handler with comprehensive logging
    this.app.use((error, req, res, next) => {
      // Skip if response already sent
      if (res.headersSent) {
        return next(error);
      }

      const errorId = req.requestId || req.traceId || 'unknown';
      const statusCode = error.statusCode || error.status || 500;

      logger.error('Unhandled application error', error, {
        errorId,
        statusCode,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        userRole: req.user?.role,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestBody: req.body,
        requestQuery: req.query
      });

      // Don't send sensitive information in production
      const response = {
        success: false,
        error: statusCode >= 500 ? 'Internal server error' : error.message,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        requestId: errorId,
        timestamp: new Date().toISOString()
      };

      // Add detailed error information in development
      if (config.app.env === 'development') {
        response.details = {
          message: error.message,
          stack: error.stack,
          name: error.name
        };
      }

      res.status(statusCode).json(response);
    });

    logger.info('✅ Enhanced error handling setup complete');
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      if (this.isShuttingDown) {
        logger.warn('⚠️  Shutdown already in progress...');
        return;
      }

      this.isShuttingDown = true;
      logger.info(`\n📴 Received ${signal}. Starting graceful shutdown...`);

      // Set a timeout for forceful shutdown
      const forceShutdownTimeout = setTimeout(() => {
        logger.error('❌ Forceful shutdown after timeout');
        process.exit(1);
      }, 30000); // 30 seconds

      try {
        // Stop accepting new connections
        if (this.server) {
          await new Promise((resolve) => {
            this.server.close(resolve);
          });
          logger.info('✅ HTTP server closed');
        }

        // Close database connections
        const { closeDatabases } = require('./config/database');
        await closeDatabases();

        // Close Redis connection
        await redisManager.disconnect();

        // Cleanup other resources
        const ErpNextService = require('./services/ErpNextService');
        const erpNextService = new ErpNextService();
        await erpNextService.cleanup();

        clearTimeout(forceShutdownTimeout);
        logger.info('✅ Graceful shutdown complete');
        process.exit(0);

      } catch (error) {
        logger.error('❌ Error during shutdown', error);
        clearTimeout(forceShutdownTimeout);
        process.exit(1);
      }
    };

    // Handle various shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // nodemon restart

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('UNHANDLED_REJECTION');
    });

    logger.info('✅ Graceful shutdown handlers setup complete');
  }

  async start() {
    const port = config.app.port;
    const host = config.app.host;

    this.server = this.app.listen(port, host, () => {
      logger.info(`
🎉 Harsha Delights API Gateway is running!

📍 Server: http://${host}:${port}
📚 Docs: http://${host}:${port}/api/docs
🏥 Health: http://${host}:${port}/health
📊 Metrics: http://${host}:${port}/metrics
⚡ Ready: http://${host}:${port}/ready
💓 Live: http://${host}:${port}/live
🔒 Auth: http://${host}:${port}/api/auth
🎯 API: http://${host}:${port}/api/v1

Environment: ${config.app.env}
Version: ${config.app.version}
Node.js: ${process.version}

🛡️  Security Features Active:
  ✅ Sentry Error Monitoring
  ✅ DataDog APM & Metrics
  ✅ Comprehensive Rate Limiting
  ✅ Input Validation & Sanitization
  ✅ Security Headers
  ✅ Health Monitoring

Press Ctrl+C to stop the server
      `);

      // Log comprehensive startup metrics
      logger.info('API Gateway started successfully', {
        port,
        host,
        environment: config.app.env,
        version: config.app.version,
        nodeVersion: process.version,
        uptime: process.uptime(),
        monitoring: {
          sentry: !!process.env.SENTRY_DSN,
          datadog: !!process.env.DD_API_KEY,
          healthChecks: true
        },
        security: {
          rateLimiting: true,
          inputValidation: true,
          securityHeaders: true,
          cors: true
        }
      });

      // Start periodic health checks now that server is running
      logger.info('⏰ Starting periodic health checks...');
      startPeriodicHealthChecks(30000); // Every 30 seconds
    });

    this.server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${port} is already in use`);
      } else {
        logger.error('❌ Server error', error);
      }
      process.exit(1);
    });

    return this.server;
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
      logger.info('✅ Server stopped');
    }
  }
}

// Create and start the server
const server = new ApiGatewayServer();

// Initialize and start if this file is run directly
if (require.main === module) {
  server.initialize()
    .then(() => server.start())
    .catch((error) => {
      logger.error('❌ Failed to start server', error);
      process.exit(1);
    });
}

module.exports = server;
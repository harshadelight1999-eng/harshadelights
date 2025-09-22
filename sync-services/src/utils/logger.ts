import winston from 'winston';
import config from '../config';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'sync-services' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: config.logging.filePath.replace('.log', '-error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // Write all logs to combined log file
    new winston.transports.File({
      filename: config.logging.filePath,
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (config.server.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Enhanced logging methods for sync operations
export const syncLogger = {
  info: (message: string, meta?: Record<string, any>) => {
    logger.info(message, { ...meta, category: 'sync' });
  },

  error: (message: string, error?: Error, meta?: Record<string, any>) => {
    logger.error(message, {
      ...meta,
      category: 'sync',
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  },

  warn: (message: string, meta?: Record<string, any>) => {
    logger.warn(message, { ...meta, category: 'sync' });
  },

  debug: (message: string, meta?: Record<string, any>) => {
    logger.debug(message, { ...meta, category: 'sync' });
  },

  // Specific sync operation loggers
  customerSync: (operation: string, customerId: string, source: string, target: string, meta?: Record<string, any>) => {
    logger.info(`Customer ${operation}`, {
      ...meta,
      category: 'customer-sync',
      customerId,
      source,
      target,
      operation
    });
  },

  inventorySync: (operation: string, itemCode: string, source: string, target: string, meta?: Record<string, any>) => {
    logger.info(`Inventory ${operation}`, {
      ...meta,
      category: 'inventory-sync',
      itemCode,
      source,
      target,
      operation
    });
  },

  orderSync: (operation: string, orderId: string, source: string, target: string, meta?: Record<string, any>) => {
    logger.info(`Order ${operation}`, {
      ...meta,
      category: 'order-sync',
      orderId,
      source,
      target,
      operation
    });
  },

  priceSync: (operation: string, itemCode: string, source: string, target: string, meta?: Record<string, any>) => {
    logger.info(`Price ${operation}`, {
      ...meta,
      category: 'price-sync',
      itemCode,
      source,
      target,
      operation
    });
  },

  // Performance logging
  performance: (operation: string, duration: number, meta?: Record<string, any>) => {
    logger.info(`Performance: ${operation}`, {
      ...meta,
      category: 'performance',
      operation,
      duration,
      durationMs: `${duration}ms`
    });
  },

  // API call logging
  apiCall: (system: string, method: string, endpoint: string, responseTime: number, statusCode: number, meta?: Record<string, any>) => {
    logger.info(`API Call: ${system}`, {
      ...meta,
      category: 'api',
      system,
      method,
      endpoint,
      responseTime,
      statusCode
    });
  },

  // Queue job logging
  queueJob: (jobType: string, jobId: string, status: string, meta?: Record<string, any>) => {
    logger.info(`Queue Job: ${status}`, {
      ...meta,
      category: 'queue',
      jobType,
      jobId,
      status
    });
  }
};

export default logger;
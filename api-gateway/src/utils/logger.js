/**
 * Advanced Logging Utility for API Gateway
 * Provides structured logging with multiple transports and formatters
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure logs directory exists
const logFilePath = config.logging?.filePath || './logs/api-gateway.log';
const logsDir = path.dirname(logFilePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log levels for API Gateway
const logLevels = {
  error: 0,
  warn: 1,
  security: 2,
  audit: 3,
  info: 4,
  http: 5,
  debug: 6
};

// Custom colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  security: 'magenta',
  audit: 'cyan',
  info: 'green',
  http: 'blue',
  debug: 'gray'
};

winston.addColors(logColors);

// Custom formats
const timestampFormat = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS'
});

const errorFormat = winston.format.errors({ stack: true });

const jsonFormat = winston.format.json();

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, ...meta }) => {
    let log = `${timestamp} [${level}]`;

    if (service) log += ` [${service}]`;
    if (requestId) log += ` [${requestId}]`;
    if (userId) log += ` [user:${userId}]`;

    log += `: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

const fileFormat = winston.format.combine(
  timestampFormat,
  errorFormat,
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp']
  }),
  jsonFormat
);

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: config.logging?.level || 'info',
  defaultMeta: {
    service: 'api-gateway',
    environment: config.app.env,
    version: config.app.version
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
      silent: config.app.env === 'test'
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: logFilePath,
      format: fileFormat,
      maxsize: config.logging?.maxFileSize || '10m',
      maxFiles: config.logging?.maxFiles || 5,
      tailable: true
    }),

    // Separate file for errors
    new winston.transports.File({
      filename: logFilePath.replace('.log', '-error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: config.logging?.maxFileSize || '10m',
      maxFiles: config.logging?.maxFiles || 5
    }),

    // Separate file for security events
    new winston.transports.File({
      filename: logFilePath.replace('.log', '-security.log'),
      level: 'security',
      format: fileFormat,
      maxsize: config.logging?.maxFileSize || '10m',
      maxFiles: config.logging?.maxFiles || 5
    }),

    // Separate file for audit events
    new winston.transports.File({
      filename: logFilePath.replace('.log', '-audit.log'),
      level: 'audit',
      format: fileFormat,
      maxsize: config.logging?.maxFileSize || '10m',
      maxFiles: config.logging?.maxFiles || 5
    })
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: logFilePath.replace('.log', '-exceptions.log')
    })
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: logFilePath.replace('.log', '-rejections.log')
    })
  ]
});

/**
 * Enhanced Logger Class with Context Support
 */
class ApiGatewayLogger {
  constructor() {
    this.logger = logger;
  }

  /**
   * Create child logger with persistent context
   */
  child(context = {}) {
    return this.logger.child(context);
  }

  /**
   * Log error with enhanced context
   */
  error(message, error = null, context = {}) {
    const logData = {
      message,
      ...context
    };

    if (error) {
      if (error instanceof Error) {
        logData.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        };
      } else {
        logData.error = error;
      }
    }

    this.logger.error(logData);
  }

  /**
   * Log warning
   */
  warn(message, context = {}) {
    this.logger.warn({ message, ...context });
  }

  /**
   * Log security event
   */
  security(message, context = {}) {
    this.logger.log('security', {
      message,
      ...context,
      eventType: 'security',
      severity: context.severity || 'medium'
    });
  }

  /**
   * Log audit event
   */
  audit(event, context = {}) {
    this.logger.log('audit', {
      message: event,
      ...context,
      eventType: 'audit',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log info message
   */
  info(message, context = {}) {
    this.logger.info({ message, ...context });
  }

  /**
   * Log HTTP request/response
   */
  http(message, context = {}) {
    this.logger.log('http', { message, ...context });
  }

  /**
   * Log debug information
   */
  debug(message, context = {}) {
    this.logger.debug({ message, ...context });
  }

  /**
   * Log authentication event
   */
  logAuth(event, userId, context = {}) {
    this.audit(`Authentication: ${event}`, {
      userId,
      authEvent: event,
      ...context
    });
  }

  /**
   * Log API request
   */
  logApiRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      clientIp: req.ip,
      requestId: req.requestId
    };

    if (req.user) {
      logData.userId = req.user.userId;
      logData.userRole = req.user.role;
    }

    if (req.apiKey) {
      logData.apiKeyId = req.apiKey.keyId;
    }

    if (req.serviceName) {
      logData.serviceName = req.serviceName;
    }

    const level = res.statusCode >= 400 ? 'warn' : 'http';
    this.logger.log(level, {
      message: `${req.method} ${req.path} ${res.statusCode} ${responseTime}ms`,
      ...logData
    });
  }

  /**
   * Log rate limiting event
   */
  logRateLimit(identifier, limit, remaining, windowMs, context = {}) {
    this.security('Rate limit applied', {
      identifier,
      limit,
      remaining,
      windowMs,
      ...context
    });
  }

  /**
   * Log circuit breaker event
   */
  logCircuitBreaker(serviceName, state, context = {}) {
    this.warn(`Circuit breaker ${state}`, {
      serviceName,
      circuitBreakerState: state,
      ...context
    });
  }

  /**
   * Log proxy error
   */
  logProxyError(serviceName, error, context = {}) {
    this.error(`Proxy error for ${serviceName}`, error, {
      serviceName,
      errorType: 'proxy',
      ...context
    });
  }

  /**
   * Log database operation
   */
  logDatabase(operation, table, context = {}) {
    this.debug(`Database ${operation}`, {
      operation,
      table,
      ...context
    });
  }

  /**
   * Log cache operation
   */
  logCache(operation, key, hit = null, context = {}) {
    this.debug(`Cache ${operation}`, {
      operation,
      key,
      hit,
      ...context
    });
  }

  /**
   * Log performance metric
   */
  logPerformance(metric, value, unit, context = {}) {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      unit,
      performanceMetric: true,
      ...context
    });
  }

  /**
   * Log business event
   */
  logBusiness(event, data, context = {}) {
    this.audit(`Business: ${event}`, {
      businessEvent: event,
      businessData: data,
      ...context
    });
  }

  /**
   * Log system event
   */
  logSystem(event, context = {}) {
    this.info(`System: ${event}`, {
      systemEvent: event,
      ...context
    });
  }

  /**
   * Create express middleware for request logging
   */
  requestLoggerMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Store original res.end to capture response data
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const responseTime = Date.now() - startTime;

        // Log the request/response
        logger.logApiRequest(req, res, responseTime);

        // Call original res.end
        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  /**
   * Get log statistics
   */
  async getLogStats(hours = 24) {
    try {
      // In a real implementation, this would query log files or a log aggregation service
      // For now, return basic stats
      return {
        totalLogs: 0,
        errorLogs: 0,
        warnLogs: 0,
        securityLogs: 0,
        auditLogs: 0,
        timeframe: `Last ${hours} hours`
      };
    } catch (error) {
      this.error('Failed to get log statistics', error);
      return null;
    }
  }

  /**
   * Cleanup old log files
   */
  async cleanupLogs(retentionDays = 30) {
    try {
      const fs = require('fs').promises;
      const logDir = path.dirname(logFilePath);
      const files = await fs.readdir(logDir);

      const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }

      this.info('Log cleanup completed', {
        deletedFiles: deletedCount,
        retentionDays
      });

      return deletedCount;

    } catch (error) {
      this.error('Log cleanup failed', error);
      return 0;
    }
  }
}

// Create singleton instance
const apiLogger = new ApiGatewayLogger();

// Export both the instance and the winston logger for direct access
module.exports = {
  logger: apiLogger,
  winston: logger,
  logLevels,
  logColors
};
/**
 * Sentry Error Monitoring Integration
 * Provides comprehensive error tracking and performance monitoring
 */

const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Initialize Sentry with environment-specific configuration
 */
function initializeSentry() {
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: config.app.env,
      release: config.app.version,

      // Performance monitoring
      tracesSampleRate: config.app.env === 'production' ? 0.1 : 1.0,

      // Profiling integration for performance insights
      integrations: [
        nodeProfilingIntegration(),

        // HTTP integration for tracking HTTP requests
        new Sentry.Integrations.Http({
          tracing: true,
          breadcrumbs: true
        }),

        // Express integration for request context
        new Sentry.Integrations.Express({
          app: null // Will be set when app is available
        }),

        // Console integration for capturing console.error
        new Sentry.Integrations.Console({
          levels: ['error', 'warn']
        }),

        // Context integration for additional context
        new Sentry.Integrations.Context({
          app: true,
          device: true,
          os: true,
          runtime: true
        })
      ],

      // Enhanced profiling configuration
      profilesSampleRate: config.app.env === 'production' ? 0.1 : 1.0,

      // Tag configuration
      initialScope: {
        tags: {
          service: 'api-gateway',
          version: config.app.version,
          environment: config.app.env,
          component: 'backend'
        }
      },

      // Data filtering and sanitization
      beforeSend(event, hint) {
        // Filter out sensitive information
        if (event.request && event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }

        // Filter out PII from form data
        if (event.request && event.request.data) {
          const sensitiveFields = ['password', 'ssn', 'credit_card', 'token', 'secret'];
          sensitiveFields.forEach(field => {
            if (event.request.data[field]) {
              event.request.data[field] = '[Filtered]';
            }
          });
        }

        return event;
      },

      // Error filtering
      beforeSendTransaction(event) {
        // Filter out health check transactions in production
        if (config.app.env === 'production' &&
            event.transaction &&
            event.transaction.includes('/health')) {
          return null;
        }

        return event;
      }
    });

    logger.info('Sentry initialization successful', {
      environment: config.app.env,
      version: config.app.version
    });

    return true;
  } catch (error) {
    logger.error('Sentry initialization failed', error);
    return false;
  }
}

/**
 * Sentry request handler middleware
 */
function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler({
    user: ['id', 'email', 'role'],
    request: ['method', 'url', 'headers', 'query_string'],
    transaction: 'methodPath'
  });
}

/**
 * Sentry tracing handler middleware
 */
function sentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

/**
 * Enhanced error handler middleware with Sentry integration
 */
function sentryErrorHandler() {
  return (error, req, res, next) => {
    // Add additional context to Sentry
    Sentry.withScope((scope) => {
      // Set user context if available
      if (req.user) {
        scope.setUser({
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          organization_id: req.user.organization_id
        });
      }

      // Set request context
      scope.setTag('method', req.method);
      scope.setTag('url', req.originalUrl);
      scope.setTag('statusCode', error.statusCode || 500);

      // Set additional context
      scope.setContext('request', {
        method: req.method,
        url: req.originalUrl,
        headers: {
          'user-agent': req.get('user-agent'),
          'x-forwarded-for': req.get('x-forwarded-for'),
          'accept': req.get('accept')
        },
        query: req.query,
        params: req.params,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId
      });

      // Set error context
      scope.setContext('error', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode
      });

      // Set service context
      if (req.serviceName) {
        scope.setTag('service', req.serviceName);
        scope.setContext('service', {
          name: req.serviceName,
          url: req.serviceUrl
        });
      }

      // Set API key context if available
      if (req.apiKey) {
        scope.setTag('apiKey', req.apiKey.keyId);
        scope.setContext('apiKey', {
          keyId: req.apiKey.keyId,
          name: req.apiKey.name,
          permissions: req.apiKey.permissions
        });
      }

      // Set fingerprint for error grouping
      if (error.code) {
        scope.setFingerprint([error.code, req.method, req.route?.path || req.path]);
      }

      // Set severity level
      const severity = error.statusCode >= 500 ? 'error' : 'warning';
      scope.setLevel(severity);

      // Capture the error
      Sentry.captureException(error);
    });

    // Log error using Winston logger
    logger.error('Unhandled error', error, {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: error.statusCode || 500,
      userId: req.user?.id,
      serviceName: req.serviceName
    });

    // Send error response
    const statusCode = error.statusCode || 500;
    const errorResponse = {
      error: true,
      message: config.app.env === 'production'
        ? 'Internal server error'
        : error.message,
      code: error.code || 'INTERNAL_ERROR',
      requestId: req.requestId
    };

    // Include stack trace in development
    if (config.app.env === 'development') {
      errorResponse.stack = error.stack;
    }

    res.status(statusCode).json(errorResponse);
  };
}

/**
 * Capture custom business events
 */
function captureBusinessEvent(eventName, data, user = null) {
  Sentry.withScope((scope) => {
    if (user) {
      scope.setUser(user);
    }

    scope.setTag('eventType', 'business');
    scope.setContext('businessEvent', {
      name: eventName,
      data: data,
      timestamp: new Date().toISOString()
    });

    Sentry.captureMessage(`Business Event: ${eventName}`, 'info');
  });
}

/**
 * Capture performance metrics
 */
function capturePerformanceMetric(metricName, value, unit, tags = {}) {
  Sentry.withScope((scope) => {
    Object.keys(tags).forEach(key => {
      scope.setTag(key, tags[key]);
    });

    scope.setTag('metricType', 'performance');
    scope.setContext('performanceMetric', {
      name: metricName,
      value: value,
      unit: unit,
      timestamp: new Date().toISOString()
    });

    Sentry.captureMessage(`Performance Metric: ${metricName} = ${value} ${unit}`, 'info');
  });
}

/**
 * Capture security events
 */
function captureSecurityEvent(eventName, severity, details, user = null) {
  Sentry.withScope((scope) => {
    if (user) {
      scope.setUser(user);
    }

    scope.setTag('eventType', 'security');
    scope.setTag('securityEvent', eventName);
    scope.setLevel(severity === 'high' ? 'error' : 'warning');

    scope.setContext('securityEvent', {
      name: eventName,
      severity: severity,
      details: details,
      timestamp: new Date().toISOString()
    });

    Sentry.captureMessage(`Security Event: ${eventName}`, severity);
  });
}

/**
 * Middleware to add Sentry transaction and span context
 */
function addSentryContext() {
  return (req, res, next) => {
    // Start transaction
    const transaction = Sentry.startTransaction({
      op: 'http.server',
      name: `${req.method} ${req.route?.path || req.path}`,
      tags: {
        method: req.method,
        url: req.originalUrl
      }
    });

    // Set transaction on request for access in other middleware
    req.sentryTransaction = transaction;

    // Set transaction context
    Sentry.getCurrentHub().configureScope(scope => {
      scope.setSpan(transaction);
    });

    // Finish transaction when response ends
    res.on('finish', () => {
      transaction.setHttpStatus(res.statusCode);
      transaction.setTag('statusCode', res.statusCode);
      transaction.finish();
    });

    next();
  };
}

/**
 * Create child span for async operations
 */
function createSpan(name, operation, data = {}) {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

  if (transaction) {
    return transaction.startChild({
      op: operation,
      description: name,
      data: data
    });
  }

  return null;
}

/**
 * Health check for Sentry integration
 */
function healthCheck() {
  try {
    const hub = Sentry.getCurrentHub();
    const client = hub.getClient();

    return {
      status: 'healthy',
      connected: !!client,
      dsn: !!process.env.SENTRY_DSN,
      environment: config.app.env
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

module.exports = {
  initializeSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  addSentryContext,
  captureBusinessEvent,
  capturePerformanceMetric,
  captureSecurityEvent,
  createSpan,
  healthCheck,
  Sentry
};
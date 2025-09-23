/**
 * Security Middleware for API Gateway
 * Implements various security measures and protections
 */

const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const config = require('../config');
const { getApiGatewayDB } = require('../config/database');
const { logger } = require('../utils/logger');

class SecurityMiddleware {
  constructor() {
    this.db = null;
  }

  getDB() {
    if (!this.db) {
      this.db = getApiGatewayDB();
    }
    return this.db;
  }

  /**
   * CORS Configuration
   * Cross-Origin Resource Sharing setup
   */
  corsMiddleware() {
    const corsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (config.cors.origin.includes(origin)) {
          return callback(null, true);
        }

        // Dynamic origin validation for subdomains
        const allowedDomains = ['harshadelights.com', 'localhost'];
        const originDomain = new URL(origin).hostname;

        for (const domain of allowedDomains) {
          if (originDomain === domain || originDomain.endsWith(`.${domain}`)) {
            return callback(null, true);
          }
        }

        return callback(new Error('Not allowed by CORS policy'), false);
      },
      credentials: config.cors.credentials,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders,
      exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Request-ID',
        'X-Response-Time'
      ],
      optionsSuccessStatus: 200,
      preflightContinue: false
    };

    return cors(corsOptions);
  }

  /**
   * Helmet Security Headers
   * Sets various HTTP security headers
   */
  helmetMiddleware() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'wss:', 'ws:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false, // Disable for API compatibility
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  /**
   * Compression Middleware
   * Gzip compression for responses
   */
  compressionMiddleware() {
    return compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
      chunkSize: 16384
    });
  }

  /**
   * Request ID Middleware
   * Adds unique request ID for tracing
   */
  requestIdMiddleware() {
    return (req, res, next) => {
      const requestId = req.get('X-Request-ID') || this.generateRequestId();
      req.requestId = requestId;
      res.set('X-Request-ID', requestId);
      next();
    };
  }

  /**
   * Request Sanitization Middleware
   * Sanitizes request data to prevent injection attacks
   */
  sanitizeMiddleware() {
    return (req, res, next) => {
      try {
        // Sanitize query parameters
        if (req.query) {
          req.query = this.sanitizeObject(req.query);
        }

        // Sanitize request body
        if (req.body) {
          req.body = this.sanitizeObject(req.body);
        }

        // Sanitize URL parameters
        if (req.params) {
          req.params = this.sanitizeObject(req.params);
        }

        next();
      } catch (error) {
        logger.error('Request sanitization error', error);
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          code: 'REQUEST_SANITIZATION_ERROR'
        });
      }
    };
  }

  /**
   * IP Whitelist Middleware
   * Restricts access to whitelisted IPs for sensitive endpoints
   */
  ipWhitelistMiddleware(whitelist = []) {
    return (req, res, next) => {
      const clientIp = req.ip || req.connection.remoteAddress;

      // Convert IPv6 mapped IPv4 addresses
      const normalizedIp = clientIp.replace(/^::ffff:/, '');

      // Allow localhost in development
      if (config.app.env === 'development' &&
          (normalizedIp === '127.0.0.1' || normalizedIp === '::1')) {
        return next();
      }

      // Check if IP is in whitelist
      if (whitelist.length > 0 && !whitelist.includes(normalizedIp)) {
        logger.security(`Blocked request from non-whitelisted IP: ${normalizedIp}`);
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          code: 'IP_NOT_WHITELISTED'
        });
      }

      next();
    };
  }

  /**
   * Request Size Limit Middleware
   * Prevents large request attacks
   */
  requestSizeLimitMiddleware(maxSize = '10mb') {
    return (req, res, next) => {
      const contentLength = parseInt(req.get('Content-Length') || '0');
      const maxSizeBytes = this.parseSize(maxSize);

      if (contentLength > maxSizeBytes) {
        return res.status(413).json({
          success: false,
          error: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize: maxSize
        });
      }

      next();
    };
  }

  /**
   * Security Headers Middleware
   * Additional custom security headers
   */
  securityHeadersMiddleware() {
    return (req, res, next) => {
      // API-specific security headers
      res.set({
        'X-API-Version': config.app.version,
        'X-Content-Type-Options': 'nosniff',
        'X-Download-Options': 'noopen',
        'X-Permitted-Cross-Domain-Policies': 'none',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });

      // Remove server information
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');

      next();
    };
  }

  /**
   * SQL Injection Protection Middleware
   * Detects and blocks potential SQL injection attempts
   */
  sqlInjectionProtection() {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(;|--|\/\*|\*\/|xp_|sp_)/gi,
      /('|(\\')|(;)|(,)|\[|\]|\{|\})/gi
    ];

    return (req, res, next) => {
      try {
        const checkSqlInjection = (obj, path = '') => {
          for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;

            if (typeof value === 'string') {
              for (const pattern of sqlPatterns) {
                if (pattern.test(value)) {
                  throw new Error(`Potential SQL injection detected in ${currentPath}`);
                }
              }
            } else if (typeof value === 'object' && value !== null) {
              checkSqlInjection(value, currentPath);
            }
          }
        };

        // Check query parameters
        if (req.query && Object.keys(req.query).length > 0) {
          checkSqlInjection(req.query);
        }

        // Check request body
        if (req.body && Object.keys(req.body).length > 0) {
          checkSqlInjection(req.body);
        }

        next();

      } catch (error) {
        logger.security('SQL injection attempt detected', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          error: error.message
        });

        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          code: 'SECURITY_VIOLATION'
        });
      }
    };
  }

  /**
   * XSS Protection Middleware
   * Protects against Cross-Site Scripting attacks
   */
  xssProtection() {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*src[^>]*=.*?onerror.*?>/gi
    ];

    return (req, res, next) => {
      try {
        const checkXss = (obj, path = '') => {
          for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;

            if (typeof value === 'string') {
              for (const pattern of xssPatterns) {
                if (pattern.test(value)) {
                  throw new Error(`Potential XSS detected in ${currentPath}`);
                }
              }
            } else if (typeof value === 'object' && value !== null) {
              checkXss(value, currentPath);
            }
          }
        };

        // Check query parameters
        if (req.query && Object.keys(req.query).length > 0) {
          checkXss(req.query);
        }

        // Check request body
        if (req.body && Object.keys(req.body).length > 0) {
          checkXss(req.body);
        }

        next();

      } catch (error) {
        logger.security('XSS attempt detected', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          error: error.message
        });

        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          code: 'SECURITY_VIOLATION'
        });
      }
    };
  }

  /**
   * Audit Logging Middleware
   * Logs security-related events
   */
  auditLoggingMiddleware() {
    return async (req, res, next) => {
      const startTime = Date.now();

      // Store original res.json to capture response data
      const originalJson = res.json;
      let responseData = null;

      res.json = function(data) {
        responseData = data;
        return originalJson.call(this, data);
      };

      res.on('finish', async () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        try {
          await this.logAuditEvent({
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            query: req.query,
            headers: this.sanitizeHeaders(req.headers),
            userId: req.user?.userId || null,
            apiKeyId: req.apiKey?.keyId || null,
            authMethod: req.authMethod || null,
            clientIp: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            responseTime: responseTime,
            errorCode: responseData?.code || null,
            errorMessage: responseData?.error || null
          });
        } catch (error) {
          logger.error('Audit logging error', error);
        }
      });

      next();
    };
  }

  /**
   * Log Audit Event to Database
   */
  async logAuditEvent(eventData) {
    try {
      const db = this.getDB();
      if (!db) {
        logger.debug('Database not available for audit logging');
        return;
      }
      
      await db('api_audit_logs').insert({
        request_id: eventData.requestId,
        http_method: eventData.method,
        path: eventData.path,
        query_params: JSON.stringify(eventData.query || {}),
        headers: JSON.stringify(eventData.headers || {}),
        user_id: eventData.userId,
        api_key_id: eventData.apiKeyId,
        authentication_method: eventData.authMethod,
        client_ip: eventData.clientIp,
        user_agent: eventData.userAgent,
        status_code: eventData.statusCode,
        response_time_ms: eventData.responseTime,
        error_code: eventData.errorCode,
        error_message: eventData.errorMessage,
        request_timestamp: new Date(),
        response_timestamp: new Date()
      });
    } catch (error) {
      logger.error('Database audit logging error', error);
    }
  }

  /**
   * Content Type Validation Middleware
   * Validates request content types
   */
  contentTypeValidation(allowedTypes = ['application/json']) {
    return (req, res, next) => {
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');

        if (!contentType) {
          return res.status(400).json({
            success: false,
            error: 'Content-Type header required',
            code: 'MISSING_CONTENT_TYPE'
          });
        }

        const isAllowed = allowedTypes.some(type =>
          contentType.toLowerCase().includes(type.toLowerCase())
        );

        if (!isAllowed) {
          return res.status(415).json({
            success: false,
            error: 'Unsupported media type',
            code: 'UNSUPPORTED_MEDIA_TYPE',
            allowed: allowedTypes
          });
        }
      }

      next();
    };
  }

  /**
   * Utility Methods
   */

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeString(obj);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => this.sanitizeObject(item));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = this.sanitizeString(value);
      }
    }
    return sanitized;
  }

  sanitizeString(str) {
    if (typeof str !== 'string') {
      return str;
    }

    return str
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  sanitizeHeaders(headers) {
    const sanitizedHeaders = {};
    const allowedHeaders = [
      'content-type',
      'user-agent',
      'accept',
      'accept-language',
      'accept-encoding',
      'referer',
      'x-forwarded-for',
      'x-real-ip'
    ];

    for (const [key, value] of Object.entries(headers)) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        sanitizedHeaders[key] = value;
      }
    }

    return sanitizedHeaders;
  }

  parseSize(size) {
    const units = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024
    };

    const match = size.toString().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) {
      throw new Error('Invalid size format');
    }

    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';

    return Math.floor(value * units[unit]);
  }

  /**
   * Create Combined Security Middleware Stack
   */
  createSecurityStack(options = {}) {
    const {
      enableCors = true,
      enableHelmet = true,
      enableCompression = true,
      enableSqlProtection = true,
      enableXssProtection = true,
      enableAuditLogging = true,
      enableContentTypeValidation = true
    } = options;

    const middlewares = [];

    if (enableCors) middlewares.push(this.corsMiddleware());
    if (enableHelmet) middlewares.push(this.helmetMiddleware());
    if (enableCompression) middlewares.push(this.compressionMiddleware());

    middlewares.push(this.requestIdMiddleware());
    middlewares.push(this.securityHeadersMiddleware());
    middlewares.push(this.sanitizeMiddleware());

    if (enableSqlProtection) middlewares.push(this.sqlInjectionProtection());
    if (enableXssProtection) middlewares.push(this.xssProtection());
    if (enableContentTypeValidation) middlewares.push(this.contentTypeValidation());
    if (enableAuditLogging) middlewares.push(this.auditLoggingMiddleware());

    return middlewares;
  }
}

module.exports = new SecurityMiddleware();
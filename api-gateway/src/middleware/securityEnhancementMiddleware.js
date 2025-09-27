/**
 * Enhanced Security Middleware
 * Comprehensive security hardening for production deployment
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const { logger } = require('../utils/logger');
const { captureSecurityEvent } = require('./sentryMiddleware');
const { trackRateLimit } = require('./datadogMiddleware');

/**
 * Advanced Rate Limiting Configuration
 */
function createAdvancedRateLimiter() {
  // Different rate limits for different endpoint types
  const rateLimiters = {
    // Authentication endpoints - stricter limits
    auth: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: {
        error: 'Too many authentication attempts',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.security('Authentication rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          severity: 'high'
        });

        captureSecurityEvent(
          'auth_rate_limit_exceeded',
          'high',
          {
            ip: req.ip,
            endpoint: req.originalUrl,
            userAgent: req.get('User-Agent')
          }
        );

        trackRateLimit('auth', req.originalUrl);

        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many authentication attempts. Please try again later.',
          retryAfter: 900 // 15 minutes in seconds
        });
      }
    }),

    // API endpoints - moderate limits
    api: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: {
        error: 'Too many API requests',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks and metrics
        return req.path === '/health' || req.path === '/metrics';
      },
      handler: (req, res) => {
        logger.security('API rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          userId: req.user?.id,
          severity: 'medium'
        });

        trackRateLimit('api', req.originalUrl);

        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please slow down.',
          retryAfter: 900
        });
      }
    }),

    // Admin endpoints - very strict limits
    admin: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 requests per window
      message: {
        error: 'Too many admin requests',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.security('Admin rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          userId: req.user?.id,
          severity: 'high'
        });

        captureSecurityEvent(
          'admin_rate_limit_exceeded',
          'high',
          {
            ip: req.ip,
            endpoint: req.originalUrl,
            userId: req.user?.id
          }
        );

        trackRateLimit('admin', req.originalUrl);

        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many admin requests. Access temporarily restricted.',
          retryAfter: 900
        });
      }
    }),

    // File upload endpoints - strict limits
    upload: rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 uploads per hour
      message: {
        error: 'Too many file uploads',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.security('Upload rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          userId: req.user?.id,
          severity: 'medium'
        });

        trackRateLimit('upload', req.originalUrl);

        res.status(429).json({
          error: 'Upload limit exceeded',
          message: 'Too many file uploads. Please try again later.',
          retryAfter: 3600
        });
      }
    })
  };

  return rateLimiters;
}

/**
 * Progressive Delay Middleware
 */
function createProgressiveDelay() {
  return slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 10, // Allow 10 requests per window without delay
    delayMs: 500, // Add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // Maximum delay of 20 seconds
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    onLimitReached: (req, res, options) => {
      logger.security('Progressive delay activated', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        delay: options.delay,
        severity: 'low'
      });
    }
  });
}

/**
 * Advanced Security Headers Configuration
 */
function createSecurityHeaders() {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Minimal unsafe-inline for development
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        childSrc: ["'none'"],
        workerSrc: ["'none'"],
        manifestSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },

    // Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },

    // X-Frame-Options
    frameguard: {
      action: 'deny'
    },

    // X-Content-Type-Options
    noSniff: true,

    // X-XSS-Protection
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },

    // Permissions Policy
    permissionsPolicy: {
      features: {
        geolocation: [],
        microphone: [],
        camera: [],
        payment: [],
        usb: [],
        magnetometer: [],
        gyroscope: [],
        speaker: [],
        notifications: [],
        push: []
      }
    },

    // Cross-Origin policies
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });
}

/**
 * IP Whitelist/Blacklist Middleware
 */
function createIpFilter() {
  const blockedIps = new Set(process.env.BLOCKED_IPS?.split(',') || []);
  const allowedIps = new Set(process.env.ALLOWED_IPS?.split(',') || []);

  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;

    // Check if IP is blocked
    if (blockedIps.has(clientIp)) {
      logger.security('Blocked IP attempted access', {
        ip: clientIp,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        severity: 'high'
      });

      captureSecurityEvent(
        'blocked_ip_access_attempt',
        'high',
        {
          ip: clientIp,
          endpoint: req.originalUrl,
          userAgent: req.get('User-Agent')
        }
      );

      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not allowed to access this resource'
      });
    }

    // If whitelist is configured, check if IP is allowed
    if (allowedIps.size > 0 && !allowedIps.has(clientIp)) {
      logger.security('Non-whitelisted IP attempted access', {
        ip: clientIp,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        severity: 'medium'
      });

      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not whitelisted'
      });
    }

    next();
  };
}

/**
 * Suspicious Activity Detection
 */
function createSuspiciousActivityDetector() {
  const suspiciousPatterns = {
    // Common attack patterns
    sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    xssAttempt: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    pathTraversal: /\.\.\//g,
    commandInjection: /[;&|`$(){}[\]]/,

    // Bot detection patterns
    commonBots: /(bot|crawler|spider|scraper)/i,

    // Suspicious user agents
    suspiciousAgents: /(curl|wget|python|perl|ruby|powershell)/i
  };

  return (req, res, next) => {
    const userAgent = req.get('User-Agent') || '';
    const fullUrl = req.originalUrl;
    const bodyContent = JSON.stringify(req.body || {});

    let suspiciousActivity = false;
    const detectedPatterns = [];

    // Check for suspicious patterns in URL and body
    for (const [patternName, pattern] of Object.entries(suspiciousPatterns)) {
      if (pattern.test(fullUrl) || pattern.test(bodyContent) || pattern.test(userAgent)) {
        suspiciousActivity = true;
        detectedPatterns.push(patternName);
      }
    }

    if (suspiciousActivity) {
      logger.security('Suspicious activity detected', {
        ip: req.ip,
        userAgent,
        endpoint: req.originalUrl,
        patterns: detectedPatterns,
        severity: 'high'
      });

      captureSecurityEvent(
        'suspicious_activity_detected',
        'high',
        {
          ip: req.ip,
          endpoint: req.originalUrl,
          userAgent,
          patterns: detectedPatterns
        }
      );

      // Don't block immediately, but log for analysis
      // In production, you might want to block or challenge the request
    }

    next();
  };
}

/**
 * Request Size Limiting
 */
function createRequestSizeLimiter() {
  return (req, res, next) => {
    const maxSizes = {
      '/api/auth': 1024, // 1KB for auth requests
      '/api/upload': 10 * 1024 * 1024, // 10MB for uploads
      '/api/admin': 5 * 1024, // 5KB for admin requests
      default: 100 * 1024 // 100KB default
    };

    const path = req.path;
    let maxSize = maxSizes.default;

    // Find matching path
    for (const [pathPattern, size] of Object.entries(maxSizes)) {
      if (pathPattern !== 'default' && path.startsWith(pathPattern)) {
        maxSize = size;
        break;
      }
    }

    const contentLength = parseInt(req.get('Content-Length') || '0');

    if (contentLength > maxSize) {
      logger.security('Request size limit exceeded', {
        ip: req.ip,
        endpoint: req.originalUrl,
        contentLength,
        maxSize,
        severity: 'medium'
      });

      return res.status(413).json({
        error: 'Request too large',
        message: `Request size exceeds the limit of ${maxSize} bytes`
      });
    }

    next();
  };
}

/**
 * API Key Validation Middleware
 */
function createApiKeyValidator() {
  return (req, res, next) => {
    const apiKey = req.get('X-API-Key');
    
    // Define specific public endpoints (not entire resource trees)
    const publicEndpoints = [
      '/health', 
      '/metrics', 
      '/api/auth/login', 
      '/api/auth/register',
      '/api/v1/health',
      '/api/v1/ready', 
      '/api/v1/live'
    ];

    // Define public read-only endpoints with specific method restrictions
    const publicReadOnlyPatterns = [
      { method: 'GET', pattern: /^\/api\/v1\/products$/ },
      { method: 'GET', pattern: /^\/api\/v1\/products\/featured$/ },
      { method: 'GET', pattern: /^\/api\/v1\/products\/[a-f0-9-]{36}$/ },
      { method: 'GET', pattern: /^\/api\/v1\/categories$/ },
      { method: 'GET', pattern: /^\/api\/v1\/categories\/[a-f0-9-]{36}$/ },
      { method: 'POST', pattern: /^\/api\/v1\/whatsapp\/generate-order-link$/ },
      { method: 'POST', pattern: /^\/api\/v1\/whatsapp\/generate-quick-order$/ },
      { method: 'GET', pattern: /^\/api\/v1\/whatsapp\/orders$/ },
      { method: 'PUT', pattern: /^\/api\/v1\/whatsapp\/orders\/[A-Z0-9-]+\/status$/ }
    ];

    // Check for exact public endpoints
    if (publicEndpoints.includes(req.path)) {
      return next();
    }

    // Check for public read-only endpoints with method restrictions
    const isPublicReadOnly = publicReadOnlyPatterns.some(({ method, pattern }) => 
      req.method === method && pattern.test(req.path)
    );

    if (isPublicReadOnly) {
      return next();
    }

    if (!apiKey) {
      logger.security('Missing API key', {
        ip: req.ip,
        endpoint: req.originalUrl,
        userAgent: req.get('User-Agent'),
        severity: 'low'
      });

      return res.status(401).json({
        error: 'API key required',
        message: 'Please provide a valid API key in the X-API-Key header'
      });
    }

    // Validate API key format
    if (!/^[a-zA-Z0-9_-]{20,100}$/.test(apiKey)) {
      logger.security('Invalid API key format', {
        ip: req.ip,
        endpoint: req.originalUrl,
        apiKeyFormat: 'invalid',
        severity: 'medium'
      });

      return res.status(401).json({
        error: 'Invalid API key',
        message: 'API key format is invalid'
      });
    }

    // Store API key for further validation by auth middleware
    req.providedApiKey = apiKey;
    next();
  };
}

/**
 * CORS Configuration for Production
 */
function createCorsConfiguration() {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.security('CORS violation', {
          origin,
          allowedOrigins,
          severity: 'medium'
        });

        callback(new Error('Not allowed by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Requested-With',
      'X-Request-ID'
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Rate-Limit-Limit',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
      'X-Trace-Id'
    ],
    maxAge: 86400 // 24 hours
  };
}

/**
 * Initialize all security middleware
 */
function initializeSecurityMiddleware(app) {
  const rateLimiters = createAdvancedRateLimiter();

  // Order matters - apply middleware in the correct sequence

  // 1. Basic security headers
  app.use(createSecurityHeaders());

  // 2. IP filtering
  app.use(createIpFilter());

  // 3. Request size limiting
  app.use(createRequestSizeLimiter());

  // 4. Input sanitization
  app.use(mongoSanitize({
    replaceWith: '_'
  }));

  // 5. HPP protection
  app.use(hpp({
    whitelist: ['sort', 'fields', 'page', 'limit']
  }));

  // 6. Suspicious activity detection
  app.use(createSuspiciousActivityDetector());

  // 7. Progressive delay
  app.use(createProgressiveDelay());

  // 8. API key validation
  app.use(createApiKeyValidator());

  logger.info('Security middleware initialized successfully');

  return { rateLimiters };
}

module.exports = {
  initializeSecurityMiddleware,
  createAdvancedRateLimiter,
  createProgressiveDelay,
  createSecurityHeaders,
  createIpFilter,
  createSuspiciousActivityDetector,
  createRequestSizeLimiter,
  createApiKeyValidator,
  createCorsConfiguration
};
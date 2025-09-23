/**
 * Comprehensive Input Validation Middleware
 * Uses Zod schemas for type-safe validation with security hardening
 */

const { z } = require('zod');
const { logger } = require('../utils/logger');
const { captureSecurityEvent } = require('./sentryMiddleware');
const { trackBusinessEvent } = require('./datadogMiddleware');

/**
 * Custom Zod refinements for enhanced security
 */
const securityRefinements = {
  // SQL injection prevention
  noSqlInjection: (value) => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
      /(\b(UNION|OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(--|\/\*|\*\/|;)/,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR)\b)/i
    ];
    return !sqlPatterns.some(pattern => pattern.test(value));
  },

  // XSS prevention
  noXss: (value) => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    return !xssPatterns.some(pattern => pattern.test(value));
  },

  // Path traversal prevention
  noPathTraversal: (value) => {
    const pathTraversalPatterns = [
      /\.\.\//g,
      /\.\.\\\\/g,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi
    ];
    return !pathTraversalPatterns.some(pattern => pattern.test(value));
  },

  // Command injection prevention
  noCommandInjection: (value) => {
    const commandPatterns = [
      /[;&|`$(){}[\]]/,
      /\b(cat|ls|pwd|whoami|id|uname|ps|kill|rm|mv|cp|chmod|chown)\b/i
    ];
    return !commandPatterns.some(pattern => pattern.test(value));
  }
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  // User identification
  userId: z.string()
    .min(1, 'User ID is required')
    .max(50, 'User ID too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid user ID format')
    .refine(securityRefinements.noSqlInjection, 'Invalid characters detected'),

  // Email validation with security checks
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase()
    .refine(securityRefinements.noXss, 'Invalid email content')
    .refine(securityRefinements.noSqlInjection, 'Invalid email content'),

  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),

  // Phone number validation
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .refine(securityRefinements.noSqlInjection, 'Invalid phone number'),

  // Name validation
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .refine(securityRefinements.noXss, 'Invalid name content')
    .refine(securityRefinements.noSqlInjection, 'Invalid name content'),

  // API key validation
  apiKey: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid API key format')
    .min(20, 'API key too short')
    .max(100, 'API key too long'),

  // Organization ID
  organizationId: z.string()
    .regex(/^org_[a-zA-Z0-9_-]+$/, 'Invalid organization ID format')
    .max(50, 'Organization ID too long'),

  // Application context
  applicationContext: z.enum(['b2c', 'b2b', 'admin'], {
    errorMap: () => ({ message: 'Invalid application context' })
  }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().max(50).optional(),
    order: z.enum(['asc', 'desc']).default('asc')
  }),

  // Search query
  searchQuery: z.string()
    .max(200, 'Search query too long')
    .refine(securityRefinements.noXss, 'Invalid search query')
    .refine(securityRefinements.noSqlInjection, 'Invalid search query')
    .optional(),

  // File upload validation
  fileName: z.string()
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename format')
    .refine(securityRefinements.noPathTraversal, 'Invalid filename'),

  // URL validation
  url: z.string()
    .url('Invalid URL format')
    .max(2048, 'URL too long')
    .refine(securityRefinements.noXss, 'Invalid URL content'),

  // Date validation
  dateString: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),

  // Currency amount
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999.99, 'Amount too large')
    .multipleOf(0.01, 'Amount must have maximum 2 decimal places'),

  // Product/Order ID
  resourceId: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid resource ID format')
    .min(1, 'Resource ID is required')
    .max(50, 'Resource ID too long')
};

/**
 * Request validation schemas
 */
const requestSchemas = {
  // Authentication requests
  login: z.object({
    body: z.object({
      email: commonSchemas.email,
      password: z.string().min(1, 'Password is required'),
      application: commonSchemas.applicationContext.optional(),
      rememberMe: z.boolean().optional()
    })
  }),

  register: z.object({
    body: z.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      firstName: commonSchemas.name,
      lastName: commonSchemas.name,
      phone: commonSchemas.phoneNumber.optional(),
      company: z.string().max(200).optional(),
      application: commonSchemas.applicationContext.optional(),
      organizationType: z.enum(['individual', 'business']).optional()
    })
  }),

  // Profile updates
  updateProfile: z.object({
    body: z.object({
      firstName: commonSchemas.name.optional(),
      lastName: commonSchemas.name.optional(),
      phone: commonSchemas.phoneNumber.optional(),
      company: z.string().max(200).optional()
    })
  }),

  // API key management
  createApiKey: z.object({
    body: z.object({
      name: z.string().min(1).max(100),
      permissions: z.array(z.string()).min(1),
      expiresAt: commonSchemas.dateString.optional()
    })
  }),

  // Product queries
  productQuery: z.object({
    query: commonSchemas.pagination.extend({
      category: z.string().max(50).optional(),
      search: commonSchemas.searchQuery,
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      inStock: z.coerce.boolean().optional()
    })
  }),

  // Order creation
  createOrder: z.object({
    body: z.object({
      items: z.array(z.object({
        productId: commonSchemas.resourceId,
        quantity: z.number().int().min(1).max(1000),
        price: commonSchemas.amount.optional()
      })).min(1, 'At least one item required'),
      shippingAddress: z.object({
        street: z.string().min(1).max(200),
        city: z.string().min(1).max(100),
        state: z.string().min(1).max(100),
        zipCode: z.string().regex(/^\d{5,10}$/, 'Invalid zip code'),
        country: z.string().length(2, 'Country code must be 2 characters')
      }),
      paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer']),
      notes: z.string().max(500).optional()
    })
  }),

  // File upload
  fileUpload: z.object({
    params: z.object({
      type: z.enum(['avatar', 'document', 'product_image'])
    })
  }),

  // Admin actions
  adminUserUpdate: z.object({
    params: z.object({
      userId: commonSchemas.userId
    }),
    body: z.object({
      role: z.enum(['customer', 'business_user', 'business_admin', 'admin']).optional(),
      permissions: z.array(z.string()).optional(),
      active: z.boolean().optional()
    })
  })
};

/**
 * Create validation middleware
 */
function createValidationMiddleware(schema, options = {}) {
  return (req, res, next) => {
    const startTime = Date.now();

    try {
      // Validate request data
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
      });

      // Replace request data with validated data
      if (validatedData.body) req.body = validatedData.body;
      if (validatedData.query) req.query = validatedData.query;
      if (validatedData.params) req.params = validatedData.params;

      // Log validation success
      const validationTime = Date.now() - startTime;
      logger.debug('Request validation successful', {
        method: req.method,
        path: req.path,
        validationTime,
        requestId: req.requestId
      });

      next();

    } catch (error) {
      const validationTime = Date.now() - startTime;

      // Log validation failure
      logger.security('Request validation failed', {
        method: req.method,
        path: req.path,
        validationTime,
        error: error.message,
        requestId: req.requestId,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        severity: 'medium'
      });

      // Track validation failures for security monitoring
      trackBusinessEvent('validation_failure', 'api-gateway', {
        endpoint: req.path,
        method: req.method,
        errorType: 'validation',
        ip: req.ip
      });

      // Capture security event for potential attack patterns
      if (error.issues) {
        const suspiciousPatterns = error.issues.filter(issue =>
          issue.message.includes('Invalid characters detected') ||
          issue.message.includes('Invalid content')
        );

        if (suspiciousPatterns.length > 0) {
          captureSecurityEvent(
            'suspicious_input_validation_failure',
            'medium',
            {
              patterns: suspiciousPatterns,
              endpoint: req.path,
              method: req.method,
              userAgent: req.get('User-Agent')
            },
            req.user
          );
        }
      }

      // Format validation errors
      let errorDetails = [];
      if (error.issues) {
        errorDetails = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        }));
      }

      res.status(400).json({
        error: 'Validation failed',
        message: options.customMessage || 'Invalid request data',
        details: errorDetails,
        requestId: req.requestId
      });
    }
  };
}

/**
 * Sanitization middleware
 */
function sanitizeInput() {
  return (req, res, next) => {
    // Remove HTML tags from string inputs
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>?/gm, '')
        .trim();
    };

    // Recursively sanitize object
    const sanitizeObject = (obj) => {
      if (obj === null || typeof obj !== 'object') {
        return typeof obj === 'string' ? sanitizeString(obj) : obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    };

    // Sanitize request data
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);

    next();
  };
}

/**
 * Rate limit validation
 */
function validateRateLimit(identifier, limit = 100, windowMs = 15 * 60 * 1000) {
  const requests = new Map();

  return (req, res, next) => {
    const key = req[identifier] || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [requestKey, timestamps] of requests) {
      const validTimestamps = timestamps.filter(ts => ts > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(requestKey);
      } else {
        requests.set(requestKey, validTimestamps);
      }
    }

    // Check current requests
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(ts => ts > windowStart);

    if (recentRequests.length >= limit) {
      logger.security('Rate limit exceeded', {
        identifier: key,
        limit,
        current: recentRequests.length,
        windowMs,
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent')
      });

      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);

    // Add rate limit headers
    res.set('X-RateLimit-Limit', limit.toString());
    res.set('X-RateLimit-Remaining', (limit - recentRequests.length).toString());
    res.set('X-RateLimit-Reset', new Date(windowStart + windowMs).toISOString());

    next();
  };
}

/**
 * Content Security Policy middleware
 */
function contentSecurityPolicy() {
  return (req, res, next) => {
    res.set({
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    });
    next();
  };
}

module.exports = {
  commonSchemas,
  requestSchemas,
  createValidationMiddleware,
  sanitizeInput,
  validateRateLimit,
  contentSecurityPolicy,
  securityRefinements
};
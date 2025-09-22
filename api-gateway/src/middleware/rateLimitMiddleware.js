/**
 * Rate Limiting Middleware for API Gateway
 * Implements sophisticated rate limiting with Redis backend
 */

const rateLimit = require('express-rate-limit');
const { logger } = require("../utils/logger");
const slowDown = require('express-slow-down');
const redisManager = require('../config/redis');
const config = require('../config');
const { getApiGatewayDB } = require('../config/database');

class RateLimitMiddleware {
  constructor() {
    this.db = getApiGatewayDB();
    this.rateLimitStore = new RedisRateLimitStore();
  }

  /**
   * Basic Rate Limiting Middleware
   * General rate limiting for all requests
   */
  basicRateLimit() {
    return rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.rateLimitStore
    });
  }

  /**
   * Authenticated User Rate Limiting
   * Different limits based on user's rate limit tier
   */
  authenticatedRateLimit() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return next();
        }

        const userTier = req.user.rateLimitTier || 'standard';
        const limits = this.getTierLimits(userTier);

        // Skip rate limiting for unlimited tier
        if (userTier === 'unlimited') {
          return next();
        }

        const identifier = req.user.userId;
        const windowMs = 60 * 1000; // 1 minute

        const result = await this.checkRateLimit(identifier, limits.perMinute, windowMs);

        if (result.exceeded) {
          return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded for authenticated user',
            code: 'USER_RATE_LIMIT_EXCEEDED',
            tier: userTier,
            limit: limits.perMinute,
            remaining: result.remaining,
            resetTime: result.resetTime
          });
        }

        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': limits.perMinute,
          'X-RateLimit-Remaining': result.remaining,
          'X-RateLimit-Reset': result.resetTime
        });

        next();

      } catch (error) {
        logger.error('Authenticated rate limit error:', error);
        next(); // Continue on error to avoid blocking requests
      }
    };
  }

  /**
   * API Key Rate Limiting
   * Uses rate limits defined for specific API keys
   */
  apiKeyRateLimit() {
    return async (req, res, next) => {
      try {
        if (!req.apiKey || req.apiKey.rateLimitTier === 'unlimited') {
          return next();
        }

        const identifier = req.apiKey.keyId;
        const limits = {
          perMinute: req.apiKey.requestsPerMinute,
          perHour: req.apiKey.requestsPerHour,
          perDay: req.apiKey.requestsPerDay
        };

        // Check minute limit
        const minuteResult = await this.checkRateLimit(
          `${identifier}:minute`,
          limits.perMinute,
          60 * 1000
        );

        if (minuteResult.exceeded) {
          return res.status(429).json({
            success: false,
            error: 'API key rate limit exceeded (per minute)',
            code: 'API_KEY_MINUTE_LIMIT_EXCEEDED',
            limit: limits.perMinute,
            remaining: minuteResult.remaining,
            resetTime: minuteResult.resetTime
          });
        }

        // Check hour limit
        const hourResult = await this.checkRateLimit(
          `${identifier}:hour`,
          limits.perHour,
          60 * 60 * 1000
        );

        if (hourResult.exceeded) {
          return res.status(429).json({
            success: false,
            error: 'API key rate limit exceeded (per hour)',
            code: 'API_KEY_HOUR_LIMIT_EXCEEDED',
            limit: limits.perHour,
            remaining: hourResult.remaining,
            resetTime: hourResult.resetTime
          });
        }

        // Check day limit
        const dayResult = await this.checkRateLimit(
          `${identifier}:day`,
          limits.perDay,
          24 * 60 * 60 * 1000
        );

        if (dayResult.exceeded) {
          return res.status(429).json({
            success: false,
            error: 'API key rate limit exceeded (per day)',
            code: 'API_KEY_DAY_LIMIT_EXCEEDED',
            limit: limits.perDay,
            remaining: dayResult.remaining,
            resetTime: dayResult.resetTime
          });
        }

        // Set comprehensive rate limit headers
        res.set({
          'X-RateLimit-Limit-Minute': limits.perMinute,
          'X-RateLimit-Remaining-Minute': minuteResult.remaining,
          'X-RateLimit-Reset-Minute': minuteResult.resetTime,
          'X-RateLimit-Limit-Hour': limits.perHour,
          'X-RateLimit-Remaining-Hour': hourResult.remaining,
          'X-RateLimit-Reset-Hour': hourResult.resetTime,
          'X-RateLimit-Limit-Day': limits.perDay,
          'X-RateLimit-Remaining-Day': dayResult.remaining,
          'X-RateLimit-Reset-Day': dayResult.resetTime
        });

        next();

      } catch (error) {
        logger.error('API key rate limit error:', error);
        next(); // Continue on error
      }
    };
  }

  /**
   * IP-based Rate Limiting
   * Rate limiting based on client IP address
   */
  ipRateLimit(maxRequests = 1000, windowMs = 15 * 60 * 1000) {
    return async (req, res, next) => {
      try {
        const clientIp = req.ip || req.connection.remoteAddress;
        const identifier = `ip:${clientIp}`;

        const result = await this.checkRateLimit(identifier, maxRequests, windowMs);

        if (result.exceeded) {
          return res.status(429).json({
            success: false,
            error: 'IP rate limit exceeded',
            code: 'IP_RATE_LIMIT_EXCEEDED',
            clientIp: clientIp,
            limit: maxRequests,
            remaining: result.remaining,
            resetTime: result.resetTime
          });
        }

        // Set rate limit headers
        res.set({
          'X-RateLimit-IP-Limit': maxRequests,
          'X-RateLimit-IP-Remaining': result.remaining,
          'X-RateLimit-IP-Reset': result.resetTime
        });

        next();

      } catch (error) {
        logger.error('IP rate limit error:', error);
        next(); // Continue on error
      }
    };
  }

  /**
   * Endpoint-specific Rate Limiting
   * Different limits for different endpoints
   */
  endpointRateLimit(limits) {
    return async (req, res, next) => {
      try {
        const endpoint = `${req.method}:${req.route?.path || req.path}`;
        const endpointLimit = limits[endpoint];

        if (!endpointLimit) {
          return next();
        }

        const identifier = req.user?.userId || req.apiKey?.keyId || req.ip;
        const rateLimitKey = `endpoint:${endpoint}:${identifier}`;

        const result = await this.checkRateLimit(
          rateLimitKey,
          endpointLimit.max,
          endpointLimit.windowMs
        );

        if (result.exceeded) {
          return res.status(429).json({
            success: false,
            error: 'Endpoint rate limit exceeded',
            code: 'ENDPOINT_RATE_LIMIT_EXCEEDED',
            endpoint: endpoint,
            limit: endpointLimit.max,
            remaining: result.remaining,
            resetTime: result.resetTime
          });
        }

        res.set({
          'X-RateLimit-Endpoint-Limit': endpointLimit.max,
          'X-RateLimit-Endpoint-Remaining': result.remaining,
          'X-RateLimit-Endpoint-Reset': result.resetTime
        });

        next();

      } catch (error) {
        logger.error('Endpoint rate limit error:', error);
        next();
      }
    };
  }

  /**
   * Slow Down Middleware
   * Progressively delays responses instead of blocking
   */
  slowDownMiddleware() {
    return slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 10, // Allow 10 requests per window without delay
      delayMs: 500, // Add 500ms delay after delayAfter is reached
      maxDelayMs: 20000, // Maximum delay of 20 seconds
      store: this.rateLimitStore
    });
  }

  /**
   * Burst Protection Middleware
   * Protects against sudden bursts of requests
   */
  burstProtection() {
    return async (req, res, next) => {
      try {
        const identifier = req.user?.userId || req.apiKey?.keyId || req.ip;
        const burstKey = `burst:${identifier}`;

        // Allow 50 requests in 10 seconds
        const result = await this.checkRateLimit(burstKey, 50, 10 * 1000);

        if (result.exceeded) {
          return res.status(429).json({
            success: false,
            error: 'Burst protection triggered',
            code: 'BURST_PROTECTION_TRIGGERED',
            message: 'Too many requests in a short time period',
            retryAfter: Math.ceil(10)
          });
        }

        next();

      } catch (error) {
        logger.error('Burst protection error:', error);
        next();
      }
    };
  }

  /**
   * Check Rate Limit
   * Core rate limiting logic using Redis
   */
  async checkRateLimit(identifier, maxRequests, windowMs) {
    try {
      const window = Math.floor(Date.now() / windowMs);
      const key = `rate_limit:${identifier}:${window}`;

      // Increment counter
      const current = await redisManager.incrementKey(key, Math.ceil(windowMs / 1000));

      const exceeded = current > maxRequests;
      const remaining = Math.max(0, maxRequests - current);
      const resetTime = (window + 1) * windowMs;

      // Track in database for analytics
      await this.trackRateLimit(identifier, current, maxRequests, exceeded);

      return {
        exceeded,
        current,
        remaining,
        resetTime: Math.ceil(resetTime / 1000), // Convert to seconds
        limit: maxRequests
      };

    } catch (error) {
      logger.error('Rate limit check error:', error);
      // On error, allow the request
      return {
        exceeded: false,
        current: 0,
        remaining: maxRequests,
        resetTime: Math.ceil((Date.now() + windowMs) / 1000),
        limit: maxRequests
      };
    }
  }

  /**
   * Track Rate Limit in Database
   * Store rate limiting data for analytics
   */
  async trackRateLimit(identifier, current, limit, exceeded) {
    try {
      const [identifierType, identifierValue] = identifier.includes(':')
        ? identifier.split(':', 2)
        : ['unknown', identifier];

      const windowStart = new Date(Math.floor(Date.now() / 60000) * 60000); // 1-minute windows

      await this.db('rate_limit_tracking')
        .insert({
          identifier_type: identifierType,
          identifier_value: identifierValue,
          window_start: windowStart,
          window_type: 'minute',
          request_count: current,
          limit_threshold: limit,
          last_request_at: new Date()
        })
        .onConflict(['identifier_type', 'identifier_value', 'window_start', 'window_type'])
        .merge({
          request_count: current,
          last_request_at: new Date(),
          ...(exceeded && { blocked_count: this.db.raw('blocked_count + 1') })
        });

    } catch (error) {
      logger.error('Rate limit tracking error:', error);
      // Don't throw error to avoid breaking the request
    }
  }

  /**
   * Get Rate Limit Tiers Configuration
   */
  getTierLimits(tier) {
    const tierLimits = {
      basic: {
        perMinute: config.rateLimit.tiers.basic,
        perHour: config.rateLimit.tiers.basic * 60,
        perDay: config.rateLimit.tiers.basic * 60 * 24
      },
      standard: {
        perMinute: config.rateLimit.tiers.standard,
        perHour: config.rateLimit.tiers.standard * 60,
        perDay: config.rateLimit.tiers.standard * 60 * 24
      },
      premium: {
        perMinute: config.rateLimit.tiers.premium,
        perHour: config.rateLimit.tiers.premium * 60,
        perDay: config.rateLimit.tiers.premium * 60 * 24
      },
      unlimited: {
        perMinute: 0,
        perHour: 0,
        perDay: 0
      }
    };

    return tierLimits[tier] || tierLimits.standard;
  }

  /**
   * Create Combined Rate Limiting Middleware
   * Applies multiple rate limiting strategies
   */
  createCombinedLimiter(options = {}) {
    const {
      enableIP = true,
      enableAuth = true,
      enableApiKey = true,
      enableBurst = true
    } = options;

    return [
      ...(enableBurst ? [this.burstProtection()] : []),
      ...(enableIP ? [this.ipRateLimit()] : []),
      ...(enableAuth ? [this.authenticatedRateLimit()] : []),
      ...(enableApiKey ? [this.apiKeyRateLimit()] : [])
    ];
  }
}

/**
 * Redis-based Rate Limit Store
 * Custom store implementation for express-rate-limit
 */
class RedisRateLimitStore {
  constructor() {
    this.prefix = 'rl:';
  }

  async increment(key) {
    try {
      const redisKey = this.prefix + key;
      const current = await redisManager.incrementKey(redisKey, 900); // 15 minutes TTL
      return {
        totalHits: current,
        resetTime: new Date(Date.now() + 900000)
      };
    } catch (error) {
      logger.error('Redis rate limit store error:', error);
      return {
        totalHits: 1,
        resetTime: new Date(Date.now() + 900000)
      };
    }
  }

  async decrement(key) {
    try {
      const redisKey = this.prefix + key;
      // Redis doesn't have a native decrement with TTL, so we get and set
      const current = await redisManager.get(redisKey) || 0;
      if (current > 0) {
        await redisManager.set(redisKey, current - 1, 900);
      }
    } catch (error) {
      logger.error('Redis rate limit store decrement error:', error);
    }
  }

  async resetKey(key) {
    try {
      const redisKey = this.prefix + key;
      await redisManager.del(redisKey);
    } catch (error) {
      logger.error('Redis rate limit store reset error:', error);
    }
  }
}

module.exports = new RateLimitMiddleware();

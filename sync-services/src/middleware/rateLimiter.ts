import { Request, Response, NextFunction } from 'express';
import redisManager from '../utils/redis';
import { syncLogger } from '../utils/logger';
import { SystemType } from '../types';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
}

interface RateLimitData {
  count: number;
  resetTime: number;
  firstRequest: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private prefix: string;

  constructor(config: RateLimitConfig, prefix: string = 'rate_limit') {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: this.defaultKeyGenerator,
      ...config
    };
    this.prefix = prefix;
  }

  /**
   * Create rate limiter middleware
   */
  middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = this.generateKey(req);
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      // Get current rate limit data
      const rateLimitData = await this.getRateLimitData(key);

      // Reset window if expired
      if (rateLimitData.resetTime <= now) {
        await this.resetWindow(key, now);
        rateLimitData.count = 0;
        rateLimitData.resetTime = now + this.config.windowMs;
        rateLimitData.firstRequest = now;
      }

      // Check if limit exceeded
      if (rateLimitData.count >= this.config.maxRequests) {
        await this.handleLimitExceeded(req, res, rateLimitData);
        return;
      }

      // Track the request
      await this.trackRequest(key, rateLimitData);

      // Add rate limit headers
      this.addRateLimitHeaders(res, rateLimitData);

      // Track response to decide if we should count this request
      const originalSend = res.send;
      res.send = (body: any) => {
        const shouldCount = this.shouldCountRequest(req, res);
        if (!shouldCount) {
          this.removeRequestFromCount(key);
        }
        return originalSend.call(res, body);
      };

      next();
    } catch (error) {
      syncLogger.error('Rate limiter error', error as Error, {
        url: req.url,
        method: req.method
      });
      next(); // Continue on rate limiter error
    }
  };

  /**
   * Default key generator
   */
  private defaultKeyGenerator = (req: Request): string => {
    return req.ip || 'unknown';
  };

  /**
   * Generate rate limit key
   */
  private generateKey(req: Request): string {
    const baseKey = this.config.keyGenerator!(req);
    return `${this.prefix}:${baseKey}`;
  };

  /**
   * Get rate limit data from Redis
   */
  private async getRateLimitData(key: string): Promise<RateLimitData> {
    try {
      const data = await redisManager.get(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      syncLogger.error('Failed to get rate limit data', error as Error, { key });
    }

    // Return default data if not found or error
    const now = Date.now();
    return {
      count: 0,
      resetTime: now + this.config.windowMs,
      firstRequest: now
    };
  }

  /**
   * Reset rate limit window
   */
  private async resetWindow(key: string, now: number): Promise<void> {
    const data: RateLimitData = {
      count: 0,
      resetTime: now + this.config.windowMs,
      firstRequest: now
    };

    await redisManager.set(
      key,
      JSON.stringify(data),
      Math.ceil(this.config.windowMs / 1000)
    );
  }

  /**
   * Track a request
   */
  private async trackRequest(key: string, rateLimitData: RateLimitData): Promise<void> {
    rateLimitData.count++;

    await redisManager.set(
      key,
      JSON.stringify(rateLimitData),
      Math.ceil(this.config.windowMs / 1000)
    );
  }

  /**
   * Remove request from count (for conditional counting)
   */
  private async removeRequestFromCount(key: string): Promise<void> {
    try {
      const data = await this.getRateLimitData(key);
      if (data.count > 0) {
        data.count--;
        await redisManager.set(
          key,
          JSON.stringify(data),
          Math.ceil(this.config.windowMs / 1000)
        );
      }
    } catch (error) {
      syncLogger.error('Failed to remove request from count', error as Error, { key });
    }
  }

  /**
   * Handle limit exceeded
   */
  private async handleLimitExceeded(
    req: Request,
    res: Response,
    rateLimitData: RateLimitData
  ): Promise<void> {
    const retryAfter = Math.ceil((rateLimitData.resetTime - Date.now()) / 1000);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
      'Retry-After': retryAfter.toString()
    });

    // Log rate limit exceeded
    syncLogger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      limit: this.config.maxRequests,
      windowMs: this.config.windowMs,
      retryAfter
    });

    // Call custom handler if provided
    if (this.config.onLimitReached) {
      this.config.onLimitReached(req, res);
      return;
    }

    // Default response
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests',
        retryAfter,
        limit: this.config.maxRequests,
        windowMs: this.config.windowMs
      }
    });
  }

  /**
   * Add rate limit headers
   */
  private addRateLimitHeaders(res: Response, rateLimitData: RateLimitData): void {
    const remaining = Math.max(0, this.config.maxRequests - rateLimitData.count);

    res.set({
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString()
    });
  }

  /**
   * Determine if request should be counted
   */
  private shouldCountRequest(req: Request, res: Response): boolean {
    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
    const isFailed = res.statusCode >= 400;

    if (this.config.skipSuccessfulRequests && isSuccess) {
      return false;
    }

    if (this.config.skipFailedRequests && isFailed) {
      return false;
    }

    return true;
  }
}

/**
 * Create system-specific rate limiters
 */
export class SystemRateLimiters {
  private static limiters: Map<string, RateLimiter> = new Map();

  /**
   * Get ERPNext API rate limiter
   */
  static getERPNextLimiter(): RateLimiter {
    if (!this.limiters.has('erpnext')) {
      this.limiters.set('erpnext', new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 120, // 120 requests per minute
        keyGenerator: (req) => `erpnext:${req.ip}:${req.get('User-Agent') || 'unknown'}`
      }, 'erpnext_api'));
    }
    return this.limiters.get('erpnext')!;
  }

  /**
   * Get EspoCRM API rate limiter
   */
  static getEspoCRMLimiter(): RateLimiter {
    if (!this.limiters.has('espocrm')) {
      this.limiters.set('espocrm', new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // 100 requests per minute
        keyGenerator: (req) => `espocrm:${req.ip}:${req.get('User-Agent') || 'unknown'}`
      }, 'espocrm_api'));
    }
    return this.limiters.get('espocrm')!;
  }

  /**
   * Get Medusa API rate limiter
   */
  static getMedusaLimiter(): RateLimiter {
    if (!this.limiters.has('medusa')) {
      this.limiters.set('medusa', new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 200, // 200 requests per minute
        keyGenerator: (req) => `medusa:${req.ip}:${req.get('User-Agent') || 'unknown'}`
      }, 'medusa_api'));
    }
    return this.limiters.get('medusa')!;
  }

  /**
   * Get webhook rate limiter
   */
  static getWebhookLimiter(): RateLimiter {
    if (!this.limiters.has('webhook')) {
      this.limiters.set('webhook', new RateLimiter({
        windowMs: 10 * 1000, // 10 seconds
        maxRequests: 50, // 50 webhooks per 10 seconds
        keyGenerator: (req) => {
          // Use source IP and webhook source system
          const sourceSystem = req.body?.source || req.headers['x-source-system'] || 'unknown';
          return `webhook:${sourceSystem}:${req.ip}`;
        },
        skipFailedRequests: true // Don't count failed webhook processing
      }, 'webhook'));
    }
    return this.limiters.get('webhook')!;
  }

  /**
   * Get sync operation rate limiter
   */
  static getSyncOperationLimiter(): RateLimiter {
    if (!this.limiters.has('sync_operation')) {
      this.limiters.set('sync_operation', new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 500, // 500 sync operations per minute
        keyGenerator: (req) => {
          // Use operation type and source system
          const operation = req.body?.operation || req.params?.operation || 'unknown';
          const system = req.body?.system || req.params?.system || 'unknown';
          return `sync:${system}:${operation}:${req.ip}`;
        }
      }, 'sync_operation'));
    }
    return this.limiters.get('sync_operation')!;
  }

  /**
   * Get admin API rate limiter (more permissive)
   */
  static getAdminLimiter(): RateLimiter {
    if (!this.limiters.has('admin')) {
      this.limiters.set('admin', new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1000, // 1000 requests per minute for admin
        keyGenerator: (req) => {
          // Use user ID if available, otherwise IP
          const userId = req.headers['x-user-id'] || req.ip;
          return `admin:${userId}`;
        }
      }, 'admin_api'));
    }
    return this.limiters.get('admin')!;
  }
}

/**
 * Adaptive rate limiter that adjusts based on system load
 */
export class AdaptiveRateLimiter extends RateLimiter {
  private baseMaxRequests: number;
  private systemLoadThreshold: number = 0.8;

  constructor(config: RateLimitConfig, prefix: string = 'adaptive_rate_limit') {
    super(config, prefix);
    this.baseMaxRequests = config.maxRequests;
  }

  /**
   * Adjust rate limit based on system load
   */
  private async adjustRateLimit(): Promise<number> {
    try {
      // Get system metrics from Redis
      const metricsKey = 'sync:system:metrics';
      const metricsData = await redisManager.get(metricsKey);

      if (metricsData) {
        const metrics = JSON.parse(metricsData);
        const systemLoad = metrics.systemLoad || 0;
        const errorRate = metrics.errorRate || 0;

        // Reduce rate limit if system is under stress
        if (systemLoad > this.systemLoadThreshold || errorRate > 0.1) {
          const reductionFactor = Math.min(0.5, (systemLoad - this.systemLoadThreshold) * 2);
          return Math.floor(this.baseMaxRequests * (1 - reductionFactor));
        }
      }

      return this.baseMaxRequests;
    } catch (error) {
      syncLogger.error('Failed to adjust rate limit', error as Error);
      return this.baseMaxRequests;
    }
  }

  /**
   * Override middleware to include adaptive behavior
   */
  middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Adjust max requests based on current system load
    this.config.maxRequests = await this.adjustRateLimit();

    // Call parent middleware
    return super.middleware(req, res, next);
  };
}

/**
 * Circuit breaker rate limiter that temporarily blocks requests after repeated failures
 */
export class CircuitBreakerRateLimiter extends RateLimiter {
  private failureThreshold: number;
  private circuitOpenDuration: number;

  constructor(
    config: RateLimitConfig,
    failureThreshold: number = 10,
    circuitOpenDuration: number = 60000, // 1 minute
    prefix: string = 'circuit_breaker'
  ) {
    super(config, prefix);
    this.failureThreshold = failureThreshold;
    this.circuitOpenDuration = circuitOpenDuration;
  }

  /**
   * Check if circuit is open
   */
  private async isCircuitOpen(key: string): Promise<boolean> {
    try {
      const circuitKey = `${key}:circuit`;
      const circuitData = await redisManager.get(circuitKey);

      if (circuitData) {
        const circuit = JSON.parse(circuitData);
        return Date.now() < circuit.openUntil;
      }

      return false;
    } catch (error) {
      syncLogger.error('Failed to check circuit state', error as Error, { key });
      return false;
    }
  }

  /**
   * Track failures and open circuit if threshold exceeded
   */
  private async trackFailure(key: string): Promise<void> {
    try {
      const failureKey = `${key}:failures`;
      const count = await redisManager.get(failureKey);
      const failureCount = count ? parseInt(count) + 1 : 1;

      await redisManager.set(failureKey, failureCount.toString(), 300); // 5 minute window

      if (failureCount >= this.failureThreshold) {
        // Open circuit
        const circuitKey = `${key}:circuit`;
        const circuitData = {
          openUntil: Date.now() + this.circuitOpenDuration,
          failureCount
        };

        await redisManager.set(
          circuitKey,
          JSON.stringify(circuitData),
          Math.ceil(this.circuitOpenDuration / 1000)
        );

        syncLogger.warn('Circuit breaker opened', {
          key,
          failureCount,
          openDuration: this.circuitOpenDuration
        });
      }
    } catch (error) {
      syncLogger.error('Failed to track failure', error as Error, { key });
    }
  }

  /**
   * Override middleware to include circuit breaker logic
   */
  middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = this.generateKey(req);

    // Check if circuit is open
    const circuitOpen = await this.isCircuitOpen(key);
    if (circuitOpen) {
      res.status(503).json({
        success: false,
        error: {
          message: 'Service temporarily unavailable - circuit breaker open',
          retryAfter: Math.ceil(this.circuitOpenDuration / 1000)
        }
      });
      return;
    }

    // Track response to detect failures
    const originalSend = res.send;
    res.send = (body: any) => {
      if (res.statusCode >= 500) {
        this.trackFailure(key);
      }
      return originalSend.call(res, body);
    };

    // Call parent middleware
    return super.middleware(req, res, next);
  };

  private generateKey(req: Request): string {
    const baseKey = this.config.keyGenerator!(req);
    return `${this.prefix}:${baseKey}`;
  }
}
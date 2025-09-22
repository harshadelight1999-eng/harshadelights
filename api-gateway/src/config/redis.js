/**
 * Redis Configuration for Caching and Rate Limiting
 * Harsha Delights API Gateway
 */

const redis = require('redis');
const { logger } = require("../utils/logger");

class RedisManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      const config = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000
      };

      if (process.env.REDIS_PASSWORD) {
        config.password = process.env.REDIS_PASSWORD;
      }

      // Create Redis client
      this.client = redis.createClient(config);

      // Error handling
      this.client.on('error', (error) => {
        logger.error('❌ Redis connection error:', error);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('🔄 Connecting to Redis...');
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis connection established');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.info('📴 Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('🔄 Reconnecting to Redis...');
      });

      // Connect to Redis
      await this.client.connect();

      // Test connection
      await this.client.ping();
      logger.info('✅ Redis ping successful');

    } catch (error) {
      logger.error('❌ Redis initialization failed:', error.message);

      // Continue without Redis for development
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️  Continuing without Redis in development mode');
        this.client = new MockRedisClient();
        this.isConnected = false;
      } else {
        throw error;
      }
    }
  }

  // Cache operations
  async get(key) {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, expirationInSeconds = null) {
    if (!this.isConnected) return false;

    try {
      const stringValue = JSON.stringify(value);

      if (expirationInSeconds) {
        await this.client.setEx(key, expirationInSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }

      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Rate limiting operations
  async incrementKey(key, window = 60) {
    if (!this.isConnected) return 1;

    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.expire(key, window);
      const results = await multi.exec();
      return results[0];
    } catch (error) {
      logger.error('Redis INCREMENT error:', error);
      return 1;
    }
  }

  async getKeyTTL(key) {
    if (!this.isConnected) return -1;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', error);
      return -1;
    }
  }

  // Hash operations for user sessions
  async hset(key, field, value) {
    if (!this.isConnected) return false;

    try {
      await this.client.hSet(key, field, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis HSET error:', error);
      return false;
    }
  }

  async hget(key, field) {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis HGET error:', error);
      return null;
    }
  }

  async hdel(key, field) {
    if (!this.isConnected) return false;

    try {
      await this.client.hDel(key, field);
      return true;
    } catch (error) {
      logger.error('Redis HDEL error:', error);
      return false;
    }
  }

  // List operations for queues
  async lpush(key, value) {
    if (!this.isConnected) return false;

    try {
      await this.client.lPush(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis LPUSH error:', error);
      return false;
    }
  }

  async rpop(key) {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.rPop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis RPOP error:', error);
      return null;
    }
  }

  // Pub/Sub operations
  async publish(channel, message) {
    if (!this.isConnected) return false;

    try {
      await this.client.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error('Redis PUBLISH error:', error);
      return false;
    }
  }

  // Health check
  async ping() {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error:', error);
      return false;
    }
  }

  // Cleanup
  async disconnect() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        logger.info('✅ Redis disconnected gracefully');
      } catch (error) {
        logger.error('Redis disconnect error:', error);
      }
    }
  }
}

// Mock Redis client for development without Redis
class MockRedisClient {
  constructor() {
    this.store = new Map();
    logger.info('⚠️  Using mock Redis client (development mode)');
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key, value, expirationInSeconds = null) {
    const item = { value };
    if (expirationInSeconds) {
      item.expiry = Date.now() + (expirationInSeconds * 1000);
    }
    this.store.set(key, item);
    return true;
  }

  async del(key) {
    return this.store.delete(key);
  }

  async exists(key) {
    return this.store.has(key);
  }

  async ping() {
    return false; // Always return false for mock
  }

  // Add other methods as needed
  async incr(key) { return 1; }
  async expire(key, seconds) { return true; }
  async ttl(key) { return -1; }
  async hSet(key, field, value) { return true; }
  async hGet(key, field) { return null; }
  async hDel(key, field) { return true; }
  async lPush(key, value) { return true; }
  async rPop(key) { return null; }
  async publish(channel, message) { return true; }
}

// Create singleton instance
const redisManager = new RedisManager();

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisManager.disconnect();
});

process.on('SIGTERM', async () => {
  await redisManager.disconnect();
});

module.exports = redisManager;

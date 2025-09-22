import Redis from 'redis';
import config from '../config';
import { syncLogger } from './logger';

class RedisManager {
  private client: Redis.RedisClientType;
  private subscriber: Redis.RedisClientType;
  private publisher: Redis.RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    const redisConfig = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      commandTimeout: 5000
    };

    this.client = Redis.createClient(redisConfig);
    this.subscriber = Redis.createClient(redisConfig);
    this.publisher = Redis.createClient(redisConfig);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Main client events
    this.client.on('connect', () => {
      syncLogger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      syncLogger.error('Redis client error', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      syncLogger.warn('Redis client connection closed');
      this.isConnected = false;
    });

    // Subscriber events
    this.subscriber.on('connect', () => {
      syncLogger.info('Redis subscriber connected');
    });

    this.subscriber.on('error', (err) => {
      syncLogger.error('Redis subscriber error', err);
    });

    // Publisher events
    this.publisher.on('connect', () => {
      syncLogger.info('Redis publisher connected');
    });

    this.publisher.on('error', (err) => {
      syncLogger.error('Redis publisher error', err);
    });
  }

  async connect(): Promise<void> {
    try {
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect()
      ]);
      syncLogger.info('All Redis connections established');
    } catch (error) {
      syncLogger.error('Failed to connect to Redis', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.client.quit(),
        this.subscriber.quit(),
        this.publisher.quit()
      ]);
      syncLogger.info('All Redis connections closed');
    } catch (error) {
      syncLogger.error('Error disconnecting from Redis', error as Error);
      throw error;
    }
  }

  // Basic Redis operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      syncLogger.error(`Failed to get key: ${key}`, error as Error);
      throw error;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      syncLogger.error(`Failed to set key: ${key}`, error as Error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      syncLogger.error(`Failed to delete key: ${key}`, error as Error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      syncLogger.error(`Failed to check existence of key: ${key}`, error as Error);
      throw error;
    }
  }

  // Hash operations for structured data
  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hSet(key, field, value);
    } catch (error) {
      syncLogger.error(`Failed to set hash field: ${key}.${field}`, error as Error);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | undefined> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      syncLogger.error(`Failed to get hash field: ${key}.${field}`, error as Error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      syncLogger.error(`Failed to get all hash fields: ${key}`, error as Error);
      throw error;
    }
  }

  // List operations for queues
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lPush(key, values);
    } catch (error) {
      syncLogger.error(`Failed to push to list: ${key}`, error as Error);
      throw error;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      syncLogger.error(`Failed to pop from list: ${key}`, error as Error);
      throw error;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.lLen(key);
    } catch (error) {
      syncLogger.error(`Failed to get list length: ${key}`, error as Error);
      throw error;
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.publisher.publish(channel, message);
    } catch (error) {
      syncLogger.error(`Failed to publish to channel: ${channel}`, error as Error);
      throw error;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel, callback);
      syncLogger.info(`Subscribed to channel: ${channel}`);
    } catch (error) {
      syncLogger.error(`Failed to subscribe to channel: ${channel}`, error as Error);
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
      syncLogger.info(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
      syncLogger.error(`Failed to unsubscribe from channel: ${channel}`, error as Error);
      throw error;
    }
  }

  // Sync-specific operations
  async setSyncEvent(eventId: string, eventData: Record<string, any>, ttl: number = 3600): Promise<void> {
    const key = `sync:event:${eventId}`;
    await this.set(key, JSON.stringify(eventData), ttl);
  }

  async getSyncEvent(eventId: string): Promise<Record<string, any> | null> {
    const key = `sync:event:${eventId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setSyncLock(resource: string, lockId: string, ttl: number = 300): Promise<boolean> {
    const key = `sync:lock:${resource}`;
    try {
      const result = await this.client.set(key, lockId, {
        NX: true, // Only set if key doesn't exist
        EX: ttl   // Expire after ttl seconds
      });
      return result === 'OK';
    } catch (error) {
      syncLogger.error(`Failed to acquire sync lock for: ${resource}`, error as Error);
      return false;
    }
  }

  async releaseSyncLock(resource: string, lockId: string): Promise<boolean> {
    const key = `sync:lock:${resource}`;
    try {
      // Lua script to atomically check and delete if lockId matches
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      const result = await this.client.eval(script, {
        keys: [key],
        arguments: [lockId]
      });
      return result === 1;
    } catch (error) {
      syncLogger.error(`Failed to release sync lock for: ${resource}`, error as Error);
      return false;
    }
  }

  // Cache operations for system data
  async cacheCustomer(customerId: string, customerData: Record<string, any>, ttl: number = 1800): Promise<void> {
    const key = `cache:customer:${customerId}`;
    await this.set(key, JSON.stringify(customerData), ttl);
  }

  async getCachedCustomer(customerId: string): Promise<Record<string, any> | null> {
    const key = `cache:customer:${customerId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async cacheProduct(productId: string, productData: Record<string, any>, ttl: number = 900): Promise<void> {
    const key = `cache:product:${productId}`;
    await this.set(key, JSON.stringify(productData), ttl);
  }

  async getCachedProduct(productId: string): Promise<Record<string, any> | null> {
    const key = `cache:product:${productId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return this.isConnected;
    } catch (error) {
      syncLogger.error('Redis health check failed', error as Error);
      return false;
    }
  }

  // Get client instances for external use
  getClient(): Redis.RedisClientType {
    return this.client;
  }

  getSubscriber(): Redis.RedisClientType {
    return this.subscriber;
  }

  getPublisher(): Redis.RedisClientType {
    return this.publisher;
  }
}

// Singleton instance
export const redisManager = new RedisManager();
export default redisManager;
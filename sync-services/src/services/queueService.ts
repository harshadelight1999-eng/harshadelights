import Bull, { Queue, Job, JobOptions } from 'bull';
import config from '../config';
import { syncLogger } from '../utils/logger';
import redisManager from '../utils/redis';
import {
  SyncJob,
  SyncEventType,
  SystemType,
  SyncStatus
} from '../types';

// Import sync services
import { CustomerSyncService } from './customerSyncService';
import { InventorySyncService } from './inventorySyncService';
import { OrderSyncService } from './orderSyncService';
import { PricingSyncService } from './pricingSyncService';

export class QueueService {
  private queues: Map<string, Queue> = new Map();
  private customerSyncService: CustomerSyncService;
  private inventorySyncService: InventorySyncService;
  private orderSyncService: OrderSyncService;
  private pricingSyncService: PricingSyncService;

  // Queue priorities
  private readonly QUEUE_PRIORITIES = {
    HIGH: 10,
    MEDIUM: 5,
    LOW: 1
  };

  constructor() {
    this.customerSyncService = new CustomerSyncService();
    this.inventorySyncService = new InventorySyncService();
    this.orderSyncService = new OrderSyncService();
    this.pricingSyncService = new PricingSyncService();

    this.initializeQueues();
  }

  /**
   * Initialize all sync queues
   */
  private initializeQueues(): void {
    const redisConfig = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db
    };

    // Create queues for different sync operations
    const queueConfigs = [
      { name: 'customer-sync', concurrency: 5 },
      { name: 'inventory-sync', concurrency: 10 },
      { name: 'order-sync', concurrency: 3 },
      { name: 'pricing-sync', concurrency: 8 },
      { name: 'webhook-events', concurrency: 15 },
      { name: 'notifications', concurrency: 20 },
      { name: 'retry-failed', concurrency: 2 }
    ];

    queueConfigs.forEach(({ name, concurrency }) => {
      const queue = new Bull(name, {
        redis: redisConfig,
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 50,      // Keep last 50 failed jobs
          attempts: config.sync.retryAttempts,
          backoff: {
            type: 'exponential',
            delay: config.sync.retryDelay
          }
        }
      });

      // Set up job processors
      this.setupJobProcessor(queue, name, concurrency);

      // Set up event handlers
      this.setupQueueEventHandlers(queue, name);

      this.queues.set(name, queue);
    });

    syncLogger.info('All sync queues initialized', { queueCount: this.queues.size });
  }

  /**
   * Setup job processor for each queue
   */
  private setupJobProcessor(queue: Queue, queueName: string, concurrency: number): void {
    queue.process(concurrency, async (job: Job) => {
      const startTime = Date.now();
      syncLogger.queueJob(queueName, job.id!.toString(), 'started', {
        data: job.data,
        attempt: job.attemptsMade + 1,
        maxAttempts: job.opts.attempts
      });

      try {
        const result = await this.processJob(queueName, job);

        const duration = Date.now() - startTime;
        syncLogger.queueJob(queueName, job.id!.toString(), 'completed', {
          duration,
          result
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        syncLogger.queueJob(queueName, job.id!.toString(), 'failed', {
          duration,
          error: (error as Error).message,
          attempt: job.attemptsMade + 1
        });

        throw error;
      }
    });
  }

  /**
   * Process individual job based on queue type
   */
  private async processJob(queueName: string, job: Job): Promise<any> {
    const { type, data } = job.data;

    switch (queueName) {
      case 'customer-sync':
        return this.processCustomerSyncJob(type, data);

      case 'inventory-sync':
        return this.processInventorySyncJob(type, data);

      case 'order-sync':
        return this.processOrderSyncJob(type, data);

      case 'pricing-sync':
        return this.processPricingSyncJob(type, data);

      case 'webhook-events':
        return this.processWebhookEventJob(type, data);

      case 'notifications':
        return this.processNotificationJob(type, data);

      case 'retry-failed':
        return this.processRetryJob(type, data);

      default:
        throw new Error(`Unknown queue type: ${queueName}`);
    }
  }

  /**
   * Process customer sync jobs
   */
  private async processCustomerSyncJob(type: SyncEventType, data: any): Promise<any> {
    switch (type) {
      case SyncEventType.CUSTOMER_CREATE:
      case SyncEventType.CUSTOMER_UPDATE:
        if (data.source === SystemType.ERPNEXT) {
          return this.customerSyncService.syncCustomerFromERPNextToEspoCRM(data.customerId);
        } else if (data.source === SystemType.ESPOCRM) {
          return this.customerSyncService.syncCustomerFromEspoCRMToERPNext(data.customerId);
        }
        break;

      default:
        throw new Error(`Unsupported customer sync type: ${type}`);
    }
  }

  /**
   * Process inventory sync jobs
   */
  private async processInventorySyncJob(type: SyncEventType, data: any): Promise<any> {
    switch (type) {
      case SyncEventType.INVENTORY_UPDATE:
        if (data.stockQuantity !== undefined) {
          return this.inventorySyncService.syncInventoryLevels(data.itemCode, data.stockQuantity);
        } else {
          return this.inventorySyncService.syncInventoryFromERPNextToMedusa(data.itemCode);
        }

      case SyncEventType.PRODUCT_CREATE:
      case SyncEventType.PRODUCT_UPDATE:
        return this.inventorySyncService.syncInventoryFromERPNextToMedusa(data.itemCode);

      default:
        throw new Error(`Unsupported inventory sync type: ${type}`);
    }
  }

  /**
   * Process order sync jobs
   */
  private async processOrderSyncJob(type: SyncEventType, data: any): Promise<any> {
    switch (type) {
      case SyncEventType.ORDER_CREATE:
        return this.orderSyncService.syncOrderFromMedusaToERPNext(data.orderId);

      case SyncEventType.ORDER_UPDATE:
        if (data.updateType === 'status') {
          return this.orderSyncService.syncOrderStatusUpdate(data.orderId, data.status);
        } else {
          return this.orderSyncService.syncOrderFromMedusaToERPNext(data.orderId);
        }

      case SyncEventType.ORDER_CANCEL:
        return this.orderSyncService.syncOrderStatusUpdate(data.orderId, 'canceled');

      default:
        throw new Error(`Unsupported order sync type: ${type}`);
    }
  }

  /**
   * Process pricing sync jobs
   */
  private async processPricingSyncJob(type: SyncEventType, data: any): Promise<any> {
    switch (type) {
      case SyncEventType.PRICE_UPDATE:
        if (data.priceList) {
          return this.pricingSyncService.syncPricingFromERPNext(data.itemCode, data.priceList);
        } else {
          return this.pricingSyncService.syncPricingFromERPNext(data.itemCode);
        }

      default:
        throw new Error(`Unsupported pricing sync type: ${type}`);
    }
  }

  /**
   * Process webhook event jobs
   */
  private async processWebhookEventJob(type: SyncEventType, data: any): Promise<any> {
    // Route webhook events to appropriate sync queues
    const priority = this.getPriorityForEventType(type);

    switch (type) {
      case SyncEventType.CUSTOMER_CREATE:
      case SyncEventType.CUSTOMER_UPDATE:
        return this.addJob('customer-sync', type, data, { priority });

      case SyncEventType.INVENTORY_UPDATE:
      case SyncEventType.PRODUCT_CREATE:
      case SyncEventType.PRODUCT_UPDATE:
        return this.addJob('inventory-sync', type, data, { priority });

      case SyncEventType.ORDER_CREATE:
      case SyncEventType.ORDER_UPDATE:
      case SyncEventType.ORDER_CANCEL:
        return this.addJob('order-sync', type, data, { priority });

      case SyncEventType.PRICE_UPDATE:
        return this.addJob('pricing-sync', type, data, { priority });

      default:
        syncLogger.warn(`Unhandled webhook event type: ${type}`, { data });
        return null;
    }
  }

  /**
   * Process notification jobs
   */
  private async processNotificationJob(type: string, data: any): Promise<any> {
    // Handle real-time notifications via WebSocket
    await this.publishNotification(type, data);
    return { status: 'notification_sent', type, data };
  }

  /**
   * Process retry jobs
   */
  private async processRetryJob(type: string, data: any): Promise<any> {
    // Retry failed jobs with exponential backoff
    const { originalQueue, originalJobData, failureCount } = data;

    if (failureCount >= config.sync.retryAttempts) {
      syncLogger.error('Job exceeded maximum retry attempts', new Error('Max retries exceeded'), {
        originalQueue,
        originalJobData,
        failureCount
      });
      throw new Error('Job exceeded maximum retry attempts');
    }

    // Re-queue the original job with increased delay
    const delay = Math.pow(2, failureCount) * config.sync.retryDelay;
    return this.addJob(originalQueue, originalJobData.type, originalJobData.data, {
      delay,
      priority: this.QUEUE_PRIORITIES.LOW
    });
  }

  /**
   * Setup queue event handlers
   */
  private setupQueueEventHandlers(queue: Queue, queueName: string): void {
    queue.on('completed', (job, result) => {
      syncLogger.queueJob(queueName, job.id!.toString(), 'completed-event', { result });
    });

    queue.on('failed', (job, err) => {
      syncLogger.queueJob(queueName, job.id!.toString(), 'failed-event', {
        error: err.message,
        attempt: job.attemptsMade
      });

      // Add to retry queue if not exceeded max attempts
      if (job.attemptsMade < config.sync.retryAttempts) {
        this.addJob('retry-failed', 'retry', {
          originalQueue: queueName,
          originalJobData: job.data,
          failureCount: job.attemptsMade,
          error: err.message
        }, {
          delay: config.sync.retryDelay * job.attemptsMade,
          priority: this.QUEUE_PRIORITIES.LOW
        });
      }
    });

    queue.on('stalled', (job) => {
      syncLogger.warn(`Job stalled in queue: ${queueName}`, {
        jobId: job.id,
        data: job.data
      });
    });

    queue.on('error', (error) => {
      syncLogger.error(`Queue error in ${queueName}`, error);
    });
  }

  /**
   * Add job to queue
   */
  async addJob(queueName: string, type: SyncEventType | string, data: any, options: JobOptions = {}): Promise<Job | null> {
    try {
      const queue = this.queues.get(queueName);
      if (!queue) {
        throw new Error(`Queue not found: ${queueName}`);
      }

      const jobData = { type, data, timestamp: new Date() };
      const jobOptions: JobOptions = {
        priority: this.QUEUE_PRIORITIES.MEDIUM,
        ...options
      };

      const job = await queue.add(jobData, jobOptions);

      syncLogger.queueJob(queueName, job.id!.toString(), 'added', {
        type,
        priority: jobOptions.priority,
        delay: jobOptions.delay
      });

      return job;
    } catch (error) {
      syncLogger.error(`Failed to add job to queue: ${queueName}`, error as Error, { type, data });
      return null;
    }
  }

  /**
   * Add customer sync job
   */
  async addCustomerSyncJob(type: SyncEventType, data: any, priority: number = this.QUEUE_PRIORITIES.MEDIUM): Promise<Job | null> {
    return this.addJob('customer-sync', type, data, { priority });
  }

  /**
   * Add inventory sync job
   */
  async addInventorySyncJob(type: SyncEventType, data: any, priority: number = this.QUEUE_PRIORITIES.HIGH): Promise<Job | null> {
    return this.addJob('inventory-sync', type, data, { priority });
  }

  /**
   * Add order sync job
   */
  async addOrderSyncJob(type: SyncEventType, data: any, priority: number = this.QUEUE_PRIORITIES.HIGH): Promise<Job | null> {
    return this.addJob('order-sync', type, data, { priority });
  }

  /**
   * Add pricing sync job
   */
  async addPricingSyncJob(type: SyncEventType, data: any, priority: number = this.QUEUE_PRIORITIES.MEDIUM): Promise<Job | null> {
    return this.addJob('pricing-sync', type, data, { priority });
  }

  /**
   * Add webhook event job
   */
  async addWebhookEventJob(type: SyncEventType, data: any): Promise<Job | null> {
    const priority = this.getPriorityForEventType(type);
    return this.addJob('webhook-events', type, data, { priority });
  }

  /**
   * Add notification job
   */
  async addNotificationJob(type: string, data: any): Promise<Job | null> {
    return this.addJob('notifications', type, data, { priority: this.QUEUE_PRIORITIES.HIGH });
  }

  /**
   * Get priority for event type
   */
  private getPriorityForEventType(type: SyncEventType): number {
    const highPriorityEvents = [
      SyncEventType.ORDER_CREATE,
      SyncEventType.ORDER_UPDATE,
      SyncEventType.INVENTORY_LOW_STOCK
    ];

    const mediumPriorityEvents = [
      SyncEventType.CUSTOMER_CREATE,
      SyncEventType.CUSTOMER_UPDATE,
      SyncEventType.INVENTORY_UPDATE,
      SyncEventType.PRICE_UPDATE
    ];

    if (highPriorityEvents.includes(type)) {
      return this.QUEUE_PRIORITIES.HIGH;
    } else if (mediumPriorityEvents.includes(type)) {
      return this.QUEUE_PRIORITIES.MEDIUM;
    }

    return this.QUEUE_PRIORITIES.LOW;
  }

  /**
   * Publish notification via WebSocket
   */
  private async publishNotification(type: string, data: any): Promise<void> {
    try {
      const notification = {
        type,
        data,
        timestamp: new Date().toISOString()
      };

      await redisManager.publish('sync:notifications', JSON.stringify(notification));
    } catch (error) {
      syncLogger.error('Failed to publish notification', error as Error, { type, data });
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [name, queue] of this.queues) {
      try {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaiting(),
          queue.getActive(),
          queue.getCompleted(),
          queue.getFailed(),
          queue.getDelayed()
        ]);

        stats[name] = {
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length,
          delayed: delayed.length,
          total: waiting.length + active.length + completed.length + failed.length + delayed.length
        };
      } catch (error) {
        syncLogger.error(`Failed to get stats for queue: ${name}`, error as Error);
        stats[name] = { error: 'Failed to fetch stats' };
      }
    }

    return stats;
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
      syncLogger.info(`Queue paused: ${queueName}`);
    } else {
      throw new Error(`Queue not found: ${queueName}`);
    }
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
      syncLogger.info(`Queue resumed: ${queueName}`);
    } else {
      throw new Error(`Queue not found: ${queueName}`);
    }
  }

  /**
   * Clear queue
   */
  async clearQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.empty();
      syncLogger.info(`Queue cleared: ${queueName}`);
    } else {
      throw new Error(`Queue not found: ${queueName}`);
    }
  }

  /**
   * Retry failed jobs in a queue
   */
  async retryFailedJobs(queueName: string): Promise<number> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    const failedJobs = await queue.getFailed();
    let retriedCount = 0;

    for (const job of failedJobs) {
      try {
        await job.retry();
        retriedCount++;
      } catch (error) {
        syncLogger.error(`Failed to retry job: ${job.id}`, error as Error);
      }
    }

    syncLogger.info(`Retried ${retriedCount} failed jobs in queue: ${queueName}`);
    return retriedCount;
  }

  /**
   * Health check for all queues
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [name, queue] of this.queues) {
      try {
        // Check if queue is responsive
        await queue.getWaiting();
        health[name] = true;
      } catch (error) {
        health[name] = false;
        syncLogger.error(`Queue health check failed: ${name}`, error as Error);
      }
    }

    return health;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    syncLogger.info('Shutting down queue service...');

    const shutdownPromises = Array.from(this.queues.entries()).map(async ([name, queue]) => {
      try {
        await queue.close();
        syncLogger.info(`Queue closed: ${name}`);
      } catch (error) {
        syncLogger.error(`Failed to close queue: ${name}`, error as Error);
      }
    });

    await Promise.allSettled(shutdownPromises);
    syncLogger.info('Queue service shutdown completed');
  }
}
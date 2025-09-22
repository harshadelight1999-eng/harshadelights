import Bull from 'bull';
import Redis from 'ioredis';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface QueueMessage {
  id: string;
  type: string;
  source: string;
  target: string;
  payload: any;
  timestamp: Date;
  retryCount?: number;
  priority?: number;
}

export interface SyncEvent {
  entityType: 'customer' | 'product' | 'order' | 'price' | 'inventory';
  operation: 'create' | 'update' | 'delete';
  source: 'erpnext' | 'espocrm' | 'medusa';
  target: 'erpnext' | 'espocrm' | 'medusa' | 'all';
  data: any;
  metadata?: {
    userId?: string;
    timestamp: string;
    correlationId: string;
    version?: number;
  };
}

export class MessageBroker extends EventEmitter {
  private redis: Redis;
  private queues: Map<string, Bull.Queue> = new Map();
  private processors: Map<string, Function> = new Map();

  constructor() {
    super();
    this.redis = new Redis(config.redis.url, {
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    });

    this.initializeQueues();
    this.setupErrorHandling();
  }

  private initializeQueues() {
    // Customer synchronization queue
    this.createQueue('customer-sync', {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    });

    // Inventory synchronization queue
    this.createQueue('inventory-sync', {
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 200,
        removeOnFail: 100,
      }
    });

    // Order synchronization queue (high priority)
    this.createQueue('order-sync', {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1500 },
        removeOnComplete: 500,
        removeOnFail: 200,
        priority: 10,
      }
    });

    // Pricing synchronization queue
    this.createQueue('pricing-sync', {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    });

    // Dead letter queue for failed messages
    this.createQueue('dead-letter', {
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 1000,
        removeOnFail: 1000,
      }
    });
  }

  private createQueue(name: string, options: Bull.QueueOptions = {}) {
    const queue = new Bull(name, config.redis.url, {
      redis: {
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
      },
      ...options
    });

    this.queues.set(name, queue);
    logger.info(`Queue '${name}' initialized`);

    return queue;
  }

  private setupErrorHandling() {
    this.queues.forEach((queue, name) => {
      queue.on('error', (error) => {
        logger.error(`Queue '${name}' error:`, error);
        this.emit('queue-error', { queue: name, error });
      });

      queue.on('waiting', (jobId) => {
        logger.debug(`Job ${jobId} waiting in queue '${name}'`);
      });

      queue.on('active', (job) => {
        logger.debug(`Job ${job.id} started processing in queue '${name}'`);
      });

      queue.on('completed', (job, result) => {
        logger.debug(`Job ${job.id} completed in queue '${name}'`);
        this.emit('job-completed', { queue: name, job, result });
      });

      queue.on('failed', (job, err) => {
        logger.error(`Job ${job.id} failed in queue '${name}':`, err);
        this.emit('job-failed', { queue: name, job, error: err });

        // Move to dead letter queue after all retries exhausted
        if (job.attemptsMade >= job.opts.attempts) {
          this.moveToDeadLetter(job, err);
        }
      });

      queue.on('stalled', (job) => {
        logger.warn(`Job ${job.id} stalled in queue '${name}'`);
        this.emit('job-stalled', { queue: name, job });
      });
    });
  }

  public async publishSyncEvent(event: SyncEvent): Promise<string> {
    try {
      const queueName = this.getQueueName(event.entityType);
      const queue = this.queues.get(queueName);

      if (!queue) {
        throw new Error(`Queue '${queueName}' not found`);
      }

      const message: QueueMessage = {
        id: this.generateMessageId(),
        type: `${event.entityType}_${event.operation}`,
        source: event.source,
        target: event.target,
        payload: {
          event,
          correlationId: event.metadata?.correlationId || this.generateCorrelationId(),
        },
        timestamp: new Date(),
        priority: this.getPriority(event.entityType),
      };

      const job = await queue.add(message.type, message, {
        priority: message.priority,
        delay: this.getDelay(event.entityType),
      });

      logger.info(`Sync event published: ${message.type}`, {
        jobId: job.id,
        queue: queueName,
        correlationId: message.payload.correlationId,
      });

      // Emit real-time event for WebSocket clients
      this.emit('sync-event', event);

      return job.id as string;
    } catch (error) {
      logger.error('Failed to publish sync event:', error);
      throw error;
    }
  }

  public async subscribeTo(queueName: string, processor: Function): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue '${queueName}' not found`);
    }

    this.processors.set(queueName, processor);

    queue.process(async (job) => {
      try {
        const result = await processor(job.data);

        // Update sync status in Redis
        await this.updateSyncStatus(job.data.payload.correlationId, 'completed', result);

        return result;
      } catch (error) {
        // Update sync status in Redis
        await this.updateSyncStatus(job.data.payload.correlationId, 'failed', { error: error.message });
        throw error;
      }
    });

    logger.info(`Processor registered for queue '${queueName}'`);
  }

  public async getQueueStats(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue '${queueName}' not found`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    };
  }

  public async retryFailedJobs(queueName: string): Promise<number> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue '${queueName}' not found`);
    }

    const failedJobs = await queue.getFailed();
    let retryCount = 0;

    for (const job of failedJobs) {
      try {
        await job.retry();
        retryCount++;
      } catch (error) {
        logger.error(`Failed to retry job ${job.id}:`, error);
      }
    }

    logger.info(`Retried ${retryCount} failed jobs in queue '${queueName}'`);
    return retryCount;
  }

  private async moveToDeadLetter(job: Bull.Job, error: Error): Promise<void> {
    const deadLetterQueue = this.queues.get('dead-letter');
    if (!deadLetterQueue) return;

    const deadLetterMessage = {
      originalJob: job.data,
      error: error.message,
      failedAt: new Date(),
      attempts: job.attemptsMade,
    };

    await deadLetterQueue.add('dead-letter-job', deadLetterMessage);
    logger.info(`Job ${job.id} moved to dead letter queue`);
  }

  private async updateSyncStatus(correlationId: string, status: string, data: any): Promise<void> {
    const key = `sync:status:${correlationId}`;
    const statusData = {
      status,
      timestamp: new Date().toISOString(),
      data,
    };

    await this.redis.setex(key, 3600, JSON.stringify(statusData)); // 1 hour TTL
  }

  public async getSyncStatus(correlationId: string): Promise<any> {
    const key = `sync:status:${correlationId}`;
    const status = await this.redis.get(key);
    return status ? JSON.parse(status) : null;
  }

  private getQueueName(entityType: string): string {
    switch (entityType) {
      case 'customer': return 'customer-sync';
      case 'product':
      case 'inventory': return 'inventory-sync';
      case 'order': return 'order-sync';
      case 'price': return 'pricing-sync';
      default: return 'customer-sync';
    }
  }

  private getPriority(entityType: string): number {
    switch (entityType) {
      case 'order': return 10; // Highest priority
      case 'inventory': return 8;
      case 'customer': return 5;
      case 'price': return 3;
      default: return 1;
    }
  }

  private getDelay(entityType: string): number {
    switch (entityType) {
      case 'order': return 0; // No delay for orders
      case 'inventory': return 1000; // 1 second delay
      case 'customer': return 2000; // 2 second delay
      case 'price': return 5000; // 5 second delay
      default: return 1000;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async publishBatch(events: SyncEvent[]): Promise<string[]> {
    const jobIds: string[] = [];

    for (const event of events) {
      try {
        const jobId = await this.publishSyncEvent(event);
        jobIds.push(jobId);
      } catch (error) {
        logger.error(`Failed to publish batch event:`, error);
      }
    }

    return jobIds;
  }

  public async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
      logger.info(`Queue '${queueName}' paused`);
    }
  }

  public async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
      logger.info(`Queue '${queueName}' resumed`);
    }
  }

  public async close(): Promise<void> {
    for (const [name, queue] of this.queues) {
      await queue.close();
      logger.info(`Queue '${name}' closed`);
    }

    await this.redis.disconnect();
    logger.info('Message broker closed');
  }
}

export const messageBroker = new MessageBroker();
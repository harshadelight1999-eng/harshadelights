import { Request, Response, NextFunction } from 'express';
import { syncLogger } from '../utils/logger';
import redisManager from '../utils/redis';
import {
  SyncEvent,
  SyncEventType,
  SystemType,
  SyncStatus
} from '../types';

export interface SyncError extends Error {
  statusCode?: number;
  retryable?: boolean;
  system?: SystemType;
  eventType?: SyncEventType;
  data?: any;
  originalError?: Error;
}

export class SyncErrorHandler {
  private static instance: SyncErrorHandler;
  private maxRetryAttempts: number = 3;
  private retryDelayBase: number = 1000; // 1 second

  private constructor() {}

  static getInstance(): SyncErrorHandler {
    if (!SyncErrorHandler.instance) {
      SyncErrorHandler.instance = new SyncErrorHandler();
    }
    return SyncErrorHandler.instance;
  }

  /**
   * Express error handler middleware
   */
  handleExpressError = (error: SyncError, req: Request, res: Response, next: NextFunction): void => {
    const errorId = this.generateErrorId();

    // Log the error
    syncLogger.error('Express error occurred', error, {
      errorId,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      body: req.body
    });

    // Store error for analysis
    this.storeError(errorId, error, {
      type: 'express',
      url: req.url,
      method: req.method,
      timestamp: new Date()
    });

    // Prepare error response
    const statusCode = error.statusCode || 500;
    const response = {
      success: false,
      error: {
        id: errorId,
        message: this.sanitizeErrorMessage(error.message),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }
    };

    res.status(statusCode).json(response);
  };

  /**
   * Handle sync operation errors with retry logic
   */
  async handleSyncError(
    error: SyncError,
    eventType: SyncEventType,
    data: any,
    attemptNumber: number = 1
  ): Promise<boolean> {
    const errorId = this.generateErrorId();

    syncLogger.error('Sync operation error', error, {
      errorId,
      eventType,
      data,
      attemptNumber,
      retryable: error.retryable
    });

    // Store error details
    await this.storeError(errorId, error, {
      type: 'sync',
      eventType,
      data,
      attemptNumber,
      timestamp: new Date()
    });

    // Check if error is retryable and we haven't exceeded max attempts
    if (this.isRetryable(error) && attemptNumber < this.maxRetryAttempts) {
      return this.scheduleRetry(error, eventType, data, attemptNumber);
    }

    // Handle non-retryable errors or exhausted retries
    await this.handleFinalFailure(error, eventType, data, attemptNumber);
    return false;
  }

  /**
   * Handle customer sync errors
   */
  async handleCustomerSyncError(
    error: SyncError,
    customerId: string,
    source: SystemType,
    target: SystemType,
    attemptNumber: number = 1
  ): Promise<boolean> {
    const contextError: SyncError = {
      ...error,
      system: source,
      eventType: SyncEventType.CUSTOMER_UPDATE,
      data: { customerId, source, target }
    };

    return this.handleSyncError(
      contextError,
      SyncEventType.CUSTOMER_UPDATE,
      { customerId, source, target },
      attemptNumber
    );
  }

  /**
   * Handle inventory sync errors
   */
  async handleInventorySyncError(
    error: SyncError,
    itemCode: string,
    source: SystemType,
    target: SystemType,
    attemptNumber: number = 1
  ): Promise<boolean> {
    const contextError: SyncError = {
      ...error,
      system: source,
      eventType: SyncEventType.INVENTORY_UPDATE,
      data: { itemCode, source, target }
    };

    return this.handleSyncError(
      contextError,
      SyncEventType.INVENTORY_UPDATE,
      { itemCode, source, target },
      attemptNumber
    );
  }

  /**
   * Handle order sync errors
   */
  async handleOrderSyncError(
    error: SyncError,
    orderId: string,
    source: SystemType,
    target: SystemType,
    attemptNumber: number = 1
  ): Promise<boolean> {
    const contextError: SyncError = {
      ...error,
      system: source,
      eventType: SyncEventType.ORDER_CREATE,
      data: { orderId, source, target }
    };

    return this.handleSyncError(
      contextError,
      SyncEventType.ORDER_CREATE,
      { orderId, source, target },
      attemptNumber
    );
  }

  /**
   * Handle pricing sync errors
   */
  async handlePricingSyncError(
    error: SyncError,
    itemCode: string,
    priceList: string,
    source: SystemType,
    target: SystemType[],
    attemptNumber: number = 1
  ): Promise<boolean> {
    const contextError: SyncError = {
      ...error,
      system: source,
      eventType: SyncEventType.PRICE_UPDATE,
      data: { itemCode, priceList, source, target }
    };

    return this.handleSyncError(
      contextError,
      SyncEventType.PRICE_UPDATE,
      { itemCode, priceList, source, target },
      attemptNumber
    );
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: SyncError): boolean {
    // Explicitly marked as retryable
    if (error.retryable === true) {
      return true;
    }

    // Explicitly marked as non-retryable
    if (error.retryable === false) {
      return false;
    }

    // Network/timeout errors are generally retryable
    if (this.isNetworkError(error)) {
      return true;
    }

    // Rate limiting errors are retryable with delay
    if (this.isRateLimitError(error)) {
      return true;
    }

    // Temporary server errors are retryable
    if (this.isTemporaryServerError(error)) {
      return true;
    }

    // Authentication errors are generally not retryable
    if (this.isAuthenticationError(error)) {
      return false;
    }

    // Validation errors are generally not retryable
    if (this.isValidationError(error)) {
      return false;
    }

    // Data conflict errors need manual intervention
    if (this.isDataConflictError(error)) {
      return false;
    }

    // Default to non-retryable for unknown errors
    return false;
  }

  /**
   * Schedule retry with exponential backoff
   */
  private async scheduleRetry(
    error: SyncError,
    eventType: SyncEventType,
    data: any,
    attemptNumber: number
  ): Promise<boolean> {
    const delay = this.calculateRetryDelay(attemptNumber, error);

    syncLogger.info('Scheduling sync retry', {
      eventType,
      data,
      attemptNumber: attemptNumber + 1,
      delay
    });

    // Store retry schedule in Redis
    const retryKey = `sync:retry:${this.generateErrorId()}`;
    const retryData = {
      error: this.serializeError(error),
      eventType,
      data,
      attemptNumber: attemptNumber + 1,
      scheduledFor: new Date(Date.now() + delay).toISOString()
    };

    await redisManager.set(retryKey, JSON.stringify(retryData), Math.ceil(delay / 1000) + 300);

    // In a real implementation, you would use a job queue to schedule the retry
    // For now, we'll just return true to indicate retry was scheduled
    return true;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attemptNumber: number, error?: SyncError): number {
    let baseDelay = this.retryDelayBase * Math.pow(2, attemptNumber - 1);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * baseDelay;
    baseDelay += jitter;

    // Special handling for rate limit errors
    if (error && this.isRateLimitError(error)) {
      baseDelay = Math.max(baseDelay, 60000); // At least 1 minute for rate limits
    }

    // Cap maximum delay at 5 minutes
    return Math.min(baseDelay, 300000);
  }

  /**
   * Handle final failure after all retries exhausted
   */
  private async handleFinalFailure(
    error: SyncError,
    eventType: SyncEventType,
    data: any,
    attemptNumber: number
  ): Promise<void> {
    const failureId = this.generateErrorId();

    syncLogger.error('Sync operation permanently failed', error, {
      failureId,
      eventType,
      data,
      totalAttempts: attemptNumber
    });

    // Store permanent failure
    await this.storePermanentFailure(failureId, error, eventType, data, attemptNumber);

    // Create alert for operations team
    await this.createFailureAlert(failureId, error, eventType, data);

    // Publish failure event for monitoring
    await this.publishFailureEvent(failureId, error, eventType, data);
  }

  /**
   * Store error details for analysis
   */
  private async storeError(errorId: string, error: SyncError, context: any): Promise<void> {
    try {
      const errorData = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        retryable: error.retryable,
        system: error.system,
        eventType: error.eventType,
        context,
        timestamp: new Date().toISOString()
      };

      const errorKey = `error:${errorId}`;
      await redisManager.set(errorKey, JSON.stringify(errorData), 86400); // Store for 24 hours

      // Add to error index for analysis
      await redisManager.lpush('errors:index', errorId);

      // Trim error index to keep last 1000 errors
      await redisManager.getClient().ltrim('errors:index', 0, 999);

    } catch (storeError) {
      syncLogger.error('Failed to store error details', storeError as Error, { originalErrorId: errorId });
    }
  }

  /**
   * Store permanent failure
   */
  private async storePermanentFailure(
    failureId: string,
    error: SyncError,
    eventType: SyncEventType,
    data: any,
    attempts: number
  ): Promise<void> {
    try {
      const failureData = {
        id: failureId,
        error: this.serializeError(error),
        eventType,
        data,
        attempts,
        timestamp: new Date().toISOString(),
        requiresManualIntervention: true
      };

      const failureKey = `failure:${failureId}`;
      await redisManager.set(failureKey, JSON.stringify(failureData), 604800); // Store for 7 days

      // Add to failure index
      await redisManager.lpush('failures:index', failureId);

      // Trim failure index
      await redisManager.getClient().ltrim('failures:index', 0, 499);

    } catch (storeError) {
      syncLogger.error('Failed to store permanent failure', storeError as Error, { failureId });
    }
  }

  /**
   * Create failure alert
   */
  private async createFailureAlert(
    failureId: string,
    error: SyncError,
    eventType: SyncEventType,
    data: any
  ): Promise<void> {
    try {
      const alert = {
        id: failureId,
        type: 'sync_failure',
        severity: this.calculateSeverity(error, eventType),
        title: `Sync Failure: ${eventType}`,
        description: `Permanent failure after all retry attempts: ${error.message}`,
        eventType,
        system: error.system,
        data,
        timestamp: new Date().toISOString(),
        actionRequired: true
      };

      await redisManager.publish('sync:alerts', JSON.stringify(alert));

    } catch (alertError) {
      syncLogger.error('Failed to create failure alert', alertError as Error, { failureId });
    }
  }

  /**
   * Publish failure event for monitoring
   */
  private async publishFailureEvent(
    failureId: string,
    error: SyncError,
    eventType: SyncEventType,
    data: any
  ): Promise<void> {
    try {
      const failureEvent: SyncEvent = {
        id: failureId,
        type: eventType,
        source: error.system || SystemType.ERPNEXT,
        target: [],
        data: {
          ...data,
          error: this.serializeError(error),
          permanentFailure: true
        },
        timestamp: new Date(),
        retry_count: this.maxRetryAttempts,
        status: SyncStatus.FAILED,
        error_message: error.message
      };

      await redisManager.publish('sync:events', JSON.stringify(failureEvent));

    } catch (publishError) {
      syncLogger.error('Failed to publish failure event', publishError as Error, { failureId });
    }
  }

  /**
   * Error classification methods
   */
  private isNetworkError(error: SyncError): boolean {
    const networkErrorMessages = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'Network Error',
      'timeout'
    ];

    return networkErrorMessages.some(msg =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    ) || (error.statusCode && error.statusCode >= 500 && error.statusCode < 600);
  }

  private isRateLimitError(error: SyncError): boolean {
    return error.statusCode === 429 ||
           error.message.toLowerCase().includes('rate limit') ||
           error.message.toLowerCase().includes('too many requests');
  }

  private isTemporaryServerError(error: SyncError): boolean {
    return error.statusCode === 503 ||
           error.statusCode === 504 ||
           error.message.toLowerCase().includes('service unavailable') ||
           error.message.toLowerCase().includes('temporarily unavailable');
  }

  private isAuthenticationError(error: SyncError): boolean {
    return error.statusCode === 401 ||
           error.statusCode === 403 ||
           error.message.toLowerCase().includes('unauthorized') ||
           error.message.toLowerCase().includes('authentication') ||
           error.message.toLowerCase().includes('forbidden');
  }

  private isValidationError(error: SyncError): boolean {
    return error.statusCode === 400 ||
           error.statusCode === 422 ||
           error.message.toLowerCase().includes('validation') ||
           error.message.toLowerCase().includes('invalid') ||
           error.message.toLowerCase().includes('bad request');
  }

  private isDataConflictError(error: SyncError): boolean {
    return error.statusCode === 409 ||
           error.message.toLowerCase().includes('conflict') ||
           error.message.toLowerCase().includes('duplicate') ||
           error.message.toLowerCase().includes('already exists');
  }

  /**
   * Calculate alert severity
   */
  private calculateSeverity(error: SyncError, eventType: SyncEventType): 'low' | 'medium' | 'high' | 'critical' {
    // Critical events that affect business operations
    const criticalEvents = [
      SyncEventType.ORDER_CREATE,
      SyncEventType.ORDER_UPDATE,
      SyncEventType.INVENTORY_LOW_STOCK
    ];

    // High priority events
    const highPriorityEvents = [
      SyncEventType.INVENTORY_UPDATE,
      SyncEventType.CUSTOMER_CREATE,
      SyncEventType.PRICE_UPDATE
    ];

    if (criticalEvents.includes(eventType)) {
      return 'critical';
    }

    if (highPriorityEvents.includes(eventType)) {
      return 'high';
    }

    if (this.isDataConflictError(error)) {
      return 'high';
    }

    if (this.isAuthenticationError(error)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Utility methods
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    return message
      .replace(/password[=:]\s*[^\s&]+/gi, 'password=***')
      .replace(/token[=:]\s*[^\s&]+/gi, 'token=***')
      .replace(/key[=:]\s*[^\s&]+/gi, 'key=***')
      .replace(/secret[=:]\s*[^\s&]+/gi, 'secret=***');
  }

  private serializeError(error: SyncError): any {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      retryable: error.retryable,
      system: error.system,
      eventType: error.eventType
    };
  }

  /**
   * Get error statistics
   */
  async getErrorStatistics(): Promise<any> {
    try {
      const errorIds = await redisManager.getClient().lrange('errors:index', 0, 99); // Last 100 errors
      const failureIds = await redisManager.getClient().lrange('failures:index', 0, 49); // Last 50 failures

      const stats = {
        recentErrors: errorIds.length,
        permanentFailures: failureIds.length,
        errorsByType: {},
        errorsBySystem: {},
        retryableErrors: 0,
        nonRetryableErrors: 0
      };

      // Analyze recent errors
      for (const errorId of errorIds.slice(0, 50)) { // Analyze last 50 errors
        try {
          const errorData = await redisManager.get(`error:${errorId}`);
          if (errorData) {
            const error = JSON.parse(errorData);

            // Count by event type
            if (error.eventType) {
              stats.errorsByType[error.eventType] = (stats.errorsByType[error.eventType] || 0) + 1;
            }

            // Count by system
            if (error.system) {
              stats.errorsBySystem[error.system] = (stats.errorsBySystem[error.system] || 0) + 1;
            }

            // Count retryable vs non-retryable
            if (error.retryable) {
              stats.retryableErrors++;
            } else {
              stats.nonRetryableErrors++;
            }
          }
        } catch (parseError) {
          // Skip invalid error records
        }
      }

      return stats;
    } catch (error) {
      syncLogger.error('Failed to get error statistics', error as Error);
      throw error;
    }
  }

  /**
   * Clear old errors and failures
   */
  async cleanupOldErrors(): Promise<{ clearedErrors: number; clearedFailures: number }> {
    try {
      let clearedErrors = 0;
      let clearedFailures = 0;

      // Clear errors older than 24 hours
      const errorIds = await redisManager.getClient().lrange('errors:index', 0, -1);
      for (const errorId of errorIds) {
        const errorData = await redisManager.get(`error:${errorId}`);
        if (errorData) {
          const error = JSON.parse(errorData);
          const errorAge = Date.now() - new Date(error.timestamp).getTime();

          if (errorAge > 86400000) { // 24 hours
            await redisManager.del(`error:${errorId}`);
            await redisManager.getClient().lrem('errors:index', 1, errorId);
            clearedErrors++;
          }
        }
      }

      // Clear failures older than 7 days
      const failureIds = await redisManager.getClient().lrange('failures:index', 0, -1);
      for (const failureId of failureIds) {
        const failureData = await redisManager.get(`failure:${failureId}`);
        if (failureData) {
          const failure = JSON.parse(failureData);
          const failureAge = Date.now() - new Date(failure.timestamp).getTime();

          if (failureAge > 604800000) { // 7 days
            await redisManager.del(`failure:${failureId}`);
            await redisManager.getClient().lrem('failures:index', 1, failureId);
            clearedFailures++;
          }
        }
      }

      syncLogger.info('Cleaned up old errors and failures', { clearedErrors, clearedFailures });
      return { clearedErrors, clearedFailures };

    } catch (error) {
      syncLogger.error('Failed to cleanup old errors', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const errorHandler = SyncErrorHandler.getInstance();
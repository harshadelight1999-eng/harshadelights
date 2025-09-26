/**
 * Real-time Sync Orchestrator
 * Coordinates real-time synchronization across all systems with WebSocket integration
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { messageBroker, SyncEvent } from './MessageBroker';
import { webSocketServer } from './WebSocketServer';
import { customerSyncService } from './customerSyncService';
import { queueService } from './queueService';
import { ConflictResolver } from './ConflictResolver';
import cron from 'node-cron';

interface SyncOperation {
  id: string;
  type: 'customer' | 'inventory' | 'order' | 'pricing' | 'quality' | 'production';
  operation: 'create' | 'update' | 'delete' | 'bulk_sync';
  source: 'erpnext' | 'medusa' | 'espocrm';
  target: 'erpnext' | 'medusa' | 'espocrm' | 'all';
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflicted';
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

interface SyncStats {
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  pendingOperations: number;
  conflictedOperations: number;
  avgProcessingTime: number;
  lastSyncTime: Date;
  systemHealth: {
    erpnext: 'healthy' | 'degraded' | 'down';
    medusa: 'healthy' | 'degraded' | 'down';
    espocrm: 'healthy' | 'degraded' | 'down';
  };
}

export class RealTimeSyncOrchestrator extends EventEmitter {
  private operations: Map<string, SyncOperation> = new Map();
  private conflictResolver: ConflictResolver;
  private isRunning: boolean = false;
  private syncStats: SyncStats;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    super();
    this.conflictResolver = new ConflictResolver();
    this.syncStats = this.initializeSyncStats();
    this.setupEventListeners();
    this.setupScheduledTasks();
  }

  private initializeSyncStats(): SyncStats {
    return {
      totalOperations: 0,
      completedOperations: 0,
      failedOperations: 0,
      pendingOperations: 0,
      conflictedOperations: 0,
      avgProcessingTime: 0,
      lastSyncTime: new Date(),
      systemHealth: {
        erpnext: 'healthy',
        medusa: 'healthy',
        espocrm: 'healthy'
      }
    };
  }

  private setupEventListeners() {
    // Listen to message broker events
    messageBroker.on('sync-event', this.handleSyncEvent.bind(this));
    messageBroker.on('job-completed', this.handleJobCompleted.bind(this));
    messageBroker.on('job-failed', this.handleJobFailed.bind(this));
    
    // Listen to system health changes
    this.on('health-change', this.broadcastHealthStatus.bind(this));
    this.on('operation-completed', this.updateStats.bind(this));
    this.on('operation-failed', this.updateStats.bind(this));
    this.on('conflict-detected', this.handleConflict.bind(this));
  }

  private setupScheduledTasks() {
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Metrics update every 60 seconds  
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, 60000);

    // Daily full sync at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.performDailyFullSync();
    });

    // Hourly incremental sync
    cron.schedule('0 * * * *', () => {
      this.performIncrementalSync();
    });

    // Cleanup completed operations every 4 hours
    cron.schedule('0 */4 * * *', () => {
      this.cleanupCompletedOperations();
    });
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Real-time sync orchestrator is already running');
      return;
    }

    try {
      this.isRunning = true;
      
      // Initialize components
      await this.initializeServices();
      
      // Start processing queues
      await queueService.startProcessing();
      
      // Perform initial health check
      await this.performHealthCheck();
      
      // Broadcast startup status
      this.broadcastSystemEvent({
        type: 'orchestrator-started',
        message: 'Real-time sync orchestrator started successfully',
        timestamp: new Date().toISOString()
      });

      logger.info('✅ Real-time sync orchestrator started successfully');
    } catch (error) {
      this.isRunning = false;
      logger.error('Failed to start real-time sync orchestrator:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      this.isRunning = false;

      // Clear intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = null;
      }

      // Stop queue processing
      await queueService.stopProcessing();
      
      // Broadcast shutdown status
      this.broadcastSystemEvent({
        type: 'orchestrator-stopped',
        message: 'Real-time sync orchestrator stopped',
        timestamp: new Date().toISOString()
      });

      logger.info('Real-time sync orchestrator stopped');
    } catch (error) {
      logger.error('Error stopping real-time sync orchestrator:', error);
      throw error;
    }
  }

  public async queueSyncOperation(operation: Omit<SyncOperation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const syncOperation: SyncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.operations.set(syncOperation.id, syncOperation);
    
    // Queue the operation based on priority
    const queueName = `sync-${syncOperation.type}`;
    const jobData = {
      operationId: syncOperation.id,
      ...syncOperation
    };

    const jobOptions = {
      priority: this.getPriorityScore(syncOperation.priority),
      attempts: syncOperation.maxRetries + 1,
      delay: syncOperation.priority === 'critical' ? 0 : 1000,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    };

    await queueService.addJob(queueName, jobData, jobOptions);
    
    // Update stats
    this.syncStats.totalOperations++;
    this.syncStats.pendingOperations++;
    
    // Broadcast operation queued
    this.broadcastSyncUpdate({
      type: 'operation-queued',
      operationId: syncOperation.id,
      operation: syncOperation,
      timestamp: new Date().toISOString()
    });

    logger.info(`Queued sync operation: ${syncOperation.id}`, {
      type: syncOperation.type,
      operation: syncOperation.operation,
      priority: syncOperation.priority
    });

    return syncOperation.id;
  }

  private async handleSyncEvent(event: SyncEvent): Promise<void> {
    try {
      const operationId = await this.queueSyncOperation({
        type: event.entityType as any,
        operation: event.operation,
        source: event.source as any,
        target: event.target as any,
        data: event.data,
        priority: this.determinePriority(event),
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
        metadata: event.metadata
      });

      logger.info(`Created sync operation from event: ${operationId}`);
    } catch (error) {
      logger.error('Failed to handle sync event:', error);
      this.broadcastSystemEvent({
        type: 'sync-error',
        error: error.message,
        event,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async handleJobCompleted(data: any): Promise<void> {
    const { job, result } = data;
    const operationId = job.data.operationId;
    const operation = this.operations.get(operationId);

    if (operation) {
      operation.status = 'completed';
      operation.updatedAt = new Date();
      
      this.emit('operation-completed', { operation, result });
      
      this.broadcastSyncUpdate({
        type: 'operation-completed',
        operationId,
        operation,
        result,
        timestamp: new Date().toISOString()
      });

      logger.info(`Sync operation completed: ${operationId}`);
    }
  }

  private async handleJobFailed(data: any): Promise<void> {
    const { job, error } = data;
    const operationId = job.data.operationId;
    const operation = this.operations.get(operationId);

    if (operation) {
      operation.retryCount++;
      
      if (operation.retryCount >= operation.maxRetries) {
        operation.status = 'failed';
        this.emit('operation-failed', { operation, error });
      }
      
      operation.updatedAt = new Date();
      
      this.broadcastSyncUpdate({
        type: 'operation-failed',
        operationId,
        operation,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      logger.error(`Sync operation failed: ${operationId}`, error);
    }
  }

  private async handleConflict(data: any): Promise<void> {
    const { operationId, conflicts } = data;
    const operation = this.operations.get(operationId);

    if (operation) {
      operation.status = 'conflicted';
      operation.updatedAt = new Date();
      
      // Try to resolve conflicts automatically
      const resolution = await this.conflictResolver.resolveConflicts(conflicts);
      
      if (resolution.resolved) {
        // Re-queue with resolved data
        operation.data = resolution.resolvedData;
        operation.status = 'pending';
        operation.retryCount = 0;
        
        await this.queueSyncOperation(operation);
        
        this.broadcastSyncUpdate({
          type: 'conflict-resolved',
          operationId,
          operation,
          resolution,
          timestamp: new Date().toISOString()
        });
      } else {
        // Manual intervention required
        this.broadcastSyncUpdate({
          type: 'conflict-manual-required',
          operationId,
          operation,
          conflicts,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private async performHealthCheck(): Promise<void> {
    const previousHealth = { ...this.syncStats.systemHealth };
    
    try {
      // Check ERPNext
      this.syncStats.systemHealth.erpnext = await this.checkSystemHealth('erpnext');
      
      // Check Medusa
      this.syncStats.systemHealth.medusa = await this.checkSystemHealth('medusa');
      
      // Check EspoCRM  
      this.syncStats.systemHealth.espocrm = await this.checkSystemHealth('espocrm');
      
      // Broadcast health changes
      if (JSON.stringify(previousHealth) !== JSON.stringify(this.syncStats.systemHealth)) {
        this.emit('health-change', {
          previous: previousHealth,
          current: this.syncStats.systemHealth
        });
      }
    } catch (error) {
      logger.error('Health check failed:', error);
    }
  }

  private async checkSystemHealth(system: string): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      // Implementation would check actual system endpoints
      // For now, returning healthy
      return 'healthy';
    } catch (error) {
      logger.error(`Health check failed for ${system}:`, error);
      return 'down';
    }
  }

  private async performDailyFullSync(): Promise<void> {
    logger.info('Starting daily full sync...');
    
    try {
      // Queue full sync operations for each entity type
      const entityTypes = ['customer', 'inventory', 'order', 'pricing'];
      
      for (const entityType of entityTypes) {
        await this.queueSyncOperation({
          type: entityType as any,
          operation: 'bulk_sync',
          source: 'erpnext',
          target: 'all',
          data: { syncType: 'full', scheduledSync: true },
          priority: 'medium',
          status: 'pending',
          retryCount: 0,
          maxRetries: 2
        });
      }
      
      this.broadcastSystemEvent({
        type: 'daily-sync-started',
        message: 'Daily full sync initiated',
        timestamp: new Date().toISOString()
      });
      
      logger.info('Daily full sync queued successfully');
    } catch (error) {
      logger.error('Failed to start daily full sync:', error);
    }
  }

  private async performIncrementalSync(): Promise<void> {
    logger.info('Starting incremental sync...');
    
    try {
      const lastSyncTime = this.syncStats.lastSyncTime;
      
      // Queue incremental sync for recent changes
      await this.queueSyncOperation({
        type: 'customer',
        operation: 'bulk_sync',
        source: 'erpnext',
        target: 'all',
        data: { 
          syncType: 'incremental', 
          since: lastSyncTime.toISOString(),
          scheduledSync: true
        },
        priority: 'low',
        status: 'pending',
        retryCount: 0,
        maxRetries: 1
      });
      
      this.syncStats.lastSyncTime = new Date();
      
    } catch (error) {
      logger.error('Failed to start incremental sync:', error);
    }
  }

  private cleanupCompletedOperations(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    let cleanedCount = 0;
    
    for (const [id, operation] of this.operations.entries()) {
      if (operation.status === 'completed' && operation.updatedAt < cutoffTime) {
        this.operations.delete(id);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} completed operations`);
    }
  }

  private updateStats(data: any): void {
    const { operation } = data;
    
    if (operation.status === 'completed') {
      this.syncStats.completedOperations++;
      this.syncStats.pendingOperations = Math.max(0, this.syncStats.pendingOperations - 1);
    } else if (operation.status === 'failed') {
      this.syncStats.failedOperations++;
      this.syncStats.pendingOperations = Math.max(0, this.syncStats.pendingOperations - 1);
    } else if (operation.status === 'conflicted') {
      this.syncStats.conflictedOperations++;
    }
  }

  private updateMetrics(): void {
    const stats = {
      ...this.syncStats,
      activeOperations: this.operations.size,
      timestamp: new Date().toISOString()
    };
    
    this.broadcastSystemEvent({
      type: 'metrics-update',
      stats,
      timestamp: new Date().toISOString()
    });
  }

  private broadcastSyncUpdate(update: any): void {
    if (webSocketServer) {
      webSocketServer.broadcastSyncEvent(update);
    }
  }

  private broadcastSystemEvent(event: any): void {
    if (webSocketServer) {
      webSocketServer.broadcastSystemAlert({
        severity: 'info',
        ...event
      });
    }
  }

  private broadcastHealthStatus(data: any): void {
    if (webSocketServer) {
      webSocketServer.broadcastSystemAlert({
        type: 'health-update',
        severity: 'info',
        healthStatus: data.current,
        previousHealth: data.previous,
        timestamp: new Date().toISOString()
      });
    }
  }

  private determinePriority(event: SyncEvent): 'low' | 'medium' | 'high' | 'critical' {
    // Critical operations
    if (event.operation === 'delete' || event.entityType === 'order') {
      return 'critical';
    }
    
    // High priority for customer and pricing updates
    if (event.entityType === 'customer' || event.entityType === 'price') {
      return 'high';
    }
    
    // Medium priority for inventory
    if (event.entityType === 'inventory') {
      return 'medium';
    }
    
    return 'low';
  }

  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'medium': return 3;
      case 'low': return 4;
      default: return 5;
    }
  }

  private async initializeServices(): Promise<void> {
    // Initialize any required services
    logger.info('Initializing sync services...');
  }

  // Public API methods
  public getSyncStats(): SyncStats {
    return { ...this.syncStats };
  }

  public getOperations(): SyncOperation[] {
    return Array.from(this.operations.values());
  }

  public async retryOperation(operationId: string): Promise<boolean> {
    const operation = this.operations.get(operationId);
    
    if (!operation || operation.status !== 'failed') {
      return false;
    }
    
    operation.status = 'pending';
    operation.retryCount = 0;
    operation.updatedAt = new Date();
    
    await this.queueSyncOperation(operation);
    return true;
  }

  public async resolveConflict(operationId: string, resolution: any): Promise<boolean> {
    const operation = this.operations.get(operationId);
    
    if (!operation || operation.status !== 'conflicted') {
      return false;
    }
    
    operation.data = resolution.resolvedData;
    operation.status = 'pending';
    operation.retryCount = 0;
    operation.updatedAt = new Date();
    
    await this.queueSyncOperation(operation);
    return true;
  }
}

export const realTimeSyncOrchestrator = new RealTimeSyncOrchestrator();
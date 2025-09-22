import { EventEmitter } from 'events';
import config from '../config';
import { syncLogger } from '../utils/logger';
import redisManager from '../utils/redis';
import {
  SyncMetrics,
  SystemHealth,
  SystemType,
  SyncEventType,
  SyncStatus
} from '../types';

interface MetricValue {
  value: number;
  timestamp: Date;
}

interface SystemMetrics {
  responseTime: MetricValue[];
  errorRate: MetricValue[];
  throughput: MetricValue[];
  availability: MetricValue[];
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // Duration in milliseconds before alert triggers
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggered?: Date;
  description: string;
}

interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export class MonitoringService extends EventEmitter {
  private metrics: Map<string, SystemMetrics> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsCollectionInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    super();
    this.initializeDefaultAlertRules();
  }

  /**
   * Start monitoring service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      syncLogger.warn('Monitoring service is already running');
      return;
    }

    try {
      // Initialize metrics for all systems
      for (const system of Object.values(SystemType)) {
        this.metrics.set(system, {
          responseTime: [],
          errorRate: [],
          throughput: [],
          availability: []
        });
      }

      // Start periodic health checks
      this.healthCheckInterval = setInterval(
        () => this.performHealthChecks(),
        30000 // Every 30 seconds
      );

      // Start metrics collection
      this.metricsCollectionInterval = setInterval(
        () => this.collectMetrics(),
        60000 // Every minute
      );

      // Subscribe to sync events for real-time monitoring
      await this.subscribeToSyncEvents();

      this.isRunning = true;
      syncLogger.info('Monitoring service started');

      // Perform initial health check
      await this.performHealthChecks();

    } catch (error) {
      syncLogger.error('Failed to start monitoring service', error as Error);
      throw error;
    }
  }

  /**
   * Stop monitoring service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = null;
    }

    this.isRunning = false;
    syncLogger.info('Monitoring service stopped');
  }

  /**
   * Subscribe to sync events for real-time monitoring
   */
  private async subscribeToSyncEvents(): Promise<void> {
    try {
      await redisManager.subscribe('sync:events', (message: string) => {
        try {
          const event = JSON.parse(message);
          this.processSyncEvent(event);
        } catch (error) {
          syncLogger.error('Failed to process sync event for monitoring', error as Error);
        }
      });

      syncLogger.info('Subscribed to sync events for monitoring');
    } catch (error) {
      syncLogger.error('Failed to subscribe to sync events', error as Error);
      throw error;
    }
  }

  /**
   * Process sync event for metrics collection
   */
  private processSyncEvent(event: any): void {
    try {
      const system = event.source as SystemType;
      const eventType = event.type as SyncEventType;
      const status = event.status as SyncStatus;

      // Update throughput metrics
      this.recordThroughput(system);

      // Update error rate if failed
      if (status === SyncStatus.FAILED) {
        this.recordError(system);
      }

      // Record operation timing if available
      if (event.data?.duration) {
        this.recordResponseTime(system, event.data.duration);
      }

      // Emit event for real-time monitoring
      this.emit('sync_event_processed', {
        system,
        eventType,
        status,
        timestamp: new Date()
      });

    } catch (error) {
      syncLogger.error('Failed to process sync event for monitoring', error as Error, { event });
    }
  }

  /**
   * Perform health checks for all systems
   */
  private async performHealthChecks(): Promise<void> {
    try {
      const healthChecks = await Promise.allSettled([
        this.checkERPNextHealth(),
        this.checkEspoCRMHealth(),
        this.checkMedusaHealth(),
        this.checkRedisHealth()
      ]);

      const results = {
        [SystemType.ERPNEXT]: healthChecks[0].status === 'fulfilled' && healthChecks[0].value,
        [SystemType.ESPOCRM]: healthChecks[1].status === 'fulfilled' && healthChecks[1].value,
        [SystemType.MEDUSA]: healthChecks[2].status === 'fulfilled' && healthChecks[2].value,
        redis: healthChecks[3].status === 'fulfilled' && healthChecks[3].value
      };

      // Record availability metrics
      for (const [system, isHealthy] of Object.entries(results)) {
        if (Object.values(SystemType).includes(system as SystemType)) {
          this.recordAvailability(system as SystemType, isHealthy ? 1 : 0);
        }
      }

      // Store health status in Redis
      await redisManager.set('sync:system:health', JSON.stringify(results), 300);

      // Publish health update
      await redisManager.publish('sync:health', JSON.stringify({
        systems: results,
        timestamp: new Date().toISOString()
      }));

      // Check for health-based alerts
      await this.checkHealthAlerts(results);

    } catch (error) {
      syncLogger.error('Failed to perform health checks', error as Error);
    }
  }

  /**
   * Individual system health checks
   */
  private async checkERPNextHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      // Simulate health check - replace with actual health check
      const isHealthy = true; // Replace with actual ERPNext health check
      const responseTime = Date.now() - startTime;

      this.recordResponseTime(SystemType.ERPNEXT, responseTime);
      return isHealthy;
    } catch (error) {
      this.recordError(SystemType.ERPNEXT);
      return false;
    }
  }

  private async checkEspoCRMHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      // Simulate health check - replace with actual health check
      const isHealthy = true; // Replace with actual EspoCRM health check
      const responseTime = Date.now() - startTime;

      this.recordResponseTime(SystemType.ESPOCRM, responseTime);
      return isHealthy;
    } catch (error) {
      this.recordError(SystemType.ESPOCRM);
      return false;
    }
  }

  private async checkMedusaHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      // Simulate health check - replace with actual health check
      const isHealthy = true; // Replace with actual Medusa health check
      const responseTime = Date.now() - startTime;

      this.recordResponseTime(SystemType.MEDUSA, responseTime);
      return isHealthy;
    } catch (error) {
      this.recordError(SystemType.MEDUSA);
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      return await redisManager.healthCheck();
    } catch (error) {
      return false;
    }
  }

  /**
   * Collect and aggregate metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const aggregatedMetrics: Record<string, any> = {};

      for (const [system, metrics] of this.metrics) {
        const systemMetrics = {
          avgResponseTime: this.calculateAverage(metrics.responseTime),
          errorRate: this.calculateErrorRate(metrics.errorRate),
          throughput: this.calculateThroughput(metrics.throughput),
          availability: this.calculateAvailability(metrics.availability)
        };

        aggregatedMetrics[system] = systemMetrics;

        // Check alert rules for this system
        await this.checkAlerts(system, systemMetrics);
      }

      // Store aggregated metrics
      await redisManager.set('sync:metrics', JSON.stringify({
        systems: aggregatedMetrics,
        timestamp: new Date().toISOString(),
        collectedAt: new Date()
      }), 3600);

      // Clean up old metrics (keep last hour)
      this.cleanupOldMetrics();

      // Emit metrics collected event
      this.emit('metrics_collected', aggregatedMetrics);

    } catch (error) {
      syncLogger.error('Failed to collect metrics', error as Error);
    }
  }

  /**
   * Record response time metric
   */
  recordResponseTime(system: SystemType, responseTime: number): void {
    const metrics = this.metrics.get(system);
    if (metrics) {
      metrics.responseTime.push({
        value: responseTime,
        timestamp: new Date()
      });

      // Keep only last 100 entries
      if (metrics.responseTime.length > 100) {
        metrics.responseTime.shift();
      }
    }
  }

  /**
   * Record error metric
   */
  recordError(system: SystemType): void {
    const metrics = this.metrics.get(system);
    if (metrics) {
      metrics.errorRate.push({
        value: 1,
        timestamp: new Date()
      });

      // Keep only last 100 entries
      if (metrics.errorRate.length > 100) {
        metrics.errorRate.shift();
      }
    }
  }

  /**
   * Record throughput metric
   */
  recordThroughput(system: SystemType): void {
    const metrics = this.metrics.get(system);
    if (metrics) {
      metrics.throughput.push({
        value: 1,
        timestamp: new Date()
      });

      // Keep only last 100 entries
      if (metrics.throughput.length > 100) {
        metrics.throughput.shift();
      }
    }
  }

  /**
   * Record availability metric
   */
  recordAvailability(system: SystemType, availability: number): void {
    const metrics = this.metrics.get(system);
    if (metrics) {
      metrics.availability.push({
        value: availability,
        timestamp: new Date()
      });

      // Keep only last 100 entries
      if (metrics.availability.length > 100) {
        metrics.availability.shift();
      }
    }
  }

  /**
   * Calculate average of metric values
   */
  private calculateAverage(metrics: MetricValue[]): number {
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(errorMetrics: MetricValue[]): number {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentErrors = errorMetrics.filter(metric => metric.timestamp > fiveMinutesAgo);

    return recentErrors.length; // Errors per 5 minutes
  }

  /**
   * Calculate throughput
   */
  private calculateThroughput(throughputMetrics: MetricValue[]): number {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentRequests = throughputMetrics.filter(metric => metric.timestamp > oneMinuteAgo);

    return recentRequests.length; // Requests per minute
  }

  /**
   * Calculate availability percentage
   */
  private calculateAvailability(availabilityMetrics: MetricValue[]): number {
    if (availabilityMetrics.length === 0) return 0;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAvailability = availabilityMetrics.filter(metric => metric.timestamp > oneHourAgo);

    if (recentAvailability.length === 0) return 0;

    const sum = recentAvailability.reduce((acc, metric) => acc + metric.value, 0);
    return (sum / recentAvailability.length) * 100; // Percentage
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const metrics of this.metrics.values()) {
      metrics.responseTime = metrics.responseTime.filter(metric => metric.timestamp > oneHourAgo);
      metrics.errorRate = metrics.errorRate.filter(metric => metric.timestamp > oneHourAgo);
      metrics.throughput = metrics.throughput.filter(metric => metric.timestamp > oneHourAgo);
      metrics.availability = metrics.availability.filter(metric => metric.timestamp > oneHourAgo);
    }
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_response_time',
        name: 'High Response Time',
        metric: 'avgResponseTime',
        operator: 'gt',
        threshold: 5000, // 5 seconds
        duration: 300000, // 5 minutes
        severity: 'high',
        enabled: true,
        description: 'Average response time is too high'
      },
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        metric: 'errorRate',
        operator: 'gt',
        threshold: 10, // 10 errors per 5 minutes
        duration: 300000, // 5 minutes
        severity: 'critical',
        enabled: true,
        description: 'Error rate is too high'
      },
      {
        id: 'low_availability',
        name: 'Low Availability',
        metric: 'availability',
        operator: 'lt',
        threshold: 95, // 95%
        duration: 600000, // 10 minutes
        severity: 'critical',
        enabled: true,
        description: 'System availability is below threshold'
      },
      {
        id: 'low_throughput',
        name: 'Low Throughput',
        metric: 'throughput',
        operator: 'lt',
        threshold: 1, // 1 request per minute
        duration: 600000, // 10 minutes
        severity: 'medium',
        enabled: true,
        description: 'System throughput is unusually low'
      }
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  /**
   * Check alerts based on metrics
   */
  private async checkAlerts(system: string, metrics: any): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      const metricValue = metrics[rule.metric];
      if (metricValue === undefined) continue;

      const shouldAlert = this.evaluateAlertCondition(metricValue, rule);

      if (shouldAlert) {
        await this.triggerAlert(rule, system, metricValue);
      }
    }
  }

  /**
   * Check health-based alerts
   */
  private async checkHealthAlerts(healthResults: Record<string, boolean>): Promise<void> {
    for (const [system, isHealthy] of Object.entries(healthResults)) {
      if (!isHealthy && Object.values(SystemType).includes(system as SystemType)) {
        await this.triggerHealthAlert(system as SystemType);
      }
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateAlertCondition(value: number, rule: AlertRule): boolean {
    switch (rule.operator) {
      case 'gt':
        return value > rule.threshold;
      case 'gte':
        return value >= rule.threshold;
      case 'lt':
        return value < rule.threshold;
      case 'lte':
        return value <= rule.threshold;
      case 'eq':
        return value === rule.threshold;
      default:
        return false;
    }
  }

  /**
   * Trigger alert
   */
  private async triggerAlert(rule: AlertRule, system: string, value: number): Promise<void> {
    const alertId = `${rule.id}_${system}_${Date.now()}`;

    // Check if alert was recently triggered to avoid spam
    if (rule.lastTriggered && Date.now() - rule.lastTriggered.getTime() < rule.duration) {
      return;
    }

    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: `${rule.description} for ${system}. Current value: ${value}, Threshold: ${rule.threshold}`,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      triggeredAt: new Date(),
      acknowledged: false,
      resolved: false
    };

    this.alerts.set(alertId, alert);
    rule.lastTriggered = new Date();

    // Log alert
    syncLogger.warn('Alert triggered', {
      alertId,
      ruleName: rule.name,
      system,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      severity: rule.severity
    });

    // Store alert in Redis
    await redisManager.set(`alert:${alertId}`, JSON.stringify(alert), 86400); // 24 hours

    // Publish alert
    await redisManager.publish('sync:alerts', JSON.stringify(alert));

    // Emit alert event
    this.emit('alert_triggered', alert);
  }

  /**
   * Trigger health alert
   */
  private async triggerHealthAlert(system: SystemType): Promise<void> {
    const alertId = `health_${system}_${Date.now()}`;

    const alert: Alert = {
      id: alertId,
      ruleId: 'system_health',
      ruleName: 'System Health Check Failed',
      severity: 'critical',
      message: `Health check failed for ${system}`,
      metric: 'health',
      value: 0,
      threshold: 1,
      triggeredAt: new Date(),
      acknowledged: false,
      resolved: false
    };

    this.alerts.set(alertId, alert);

    // Log alert
    syncLogger.error('Health alert triggered', { system, alertId });

    // Store and publish alert
    await redisManager.set(`alert:${alertId}`, JSON.stringify(alert), 86400);
    await redisManager.publish('sync:alerts', JSON.stringify(alert));

    this.emit('health_alert_triggered', { system, alert });
  }

  /**
   * Get current metrics
   */
  async getCurrentMetrics(): Promise<SyncMetrics> {
    try {
      const metricsData = await redisManager.get('sync:metrics');
      if (metricsData) {
        const parsed = JSON.parse(metricsData);
        return {
          total_events: this.calculateTotalEvents(),
          successful_syncs: this.calculateSuccessfulSyncs(),
          failed_syncs: this.calculateFailedSyncs(),
          average_processing_time: this.calculateAverageProcessingTime(),
          last_sync_time: new Date(parsed.timestamp),
          system_health: this.getSystemHealthStatus()
        };
      }

      return this.getDefaultMetrics();
    } catch (error) {
      syncLogger.error('Failed to get current metrics', error as Error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Get system health status
   */
  private getSystemHealthStatus(): Record<SystemType, boolean> {
    const healthStatus: Record<SystemType, boolean> = {
      [SystemType.ERPNEXT]: true,
      [SystemType.ESPOCRM]: true,
      [SystemType.MEDUSA]: true
    };

    // Calculate health based on recent availability metrics
    for (const [system, metrics] of this.metrics) {
      if (Object.values(SystemType).includes(system as SystemType)) {
        const availability = this.calculateAvailability(metrics.availability);
        healthStatus[system as SystemType] = availability > 80; // 80% threshold
      }
    }

    return healthStatus;
  }

  /**
   * Calculate helper methods
   */
  private calculateTotalEvents(): number {
    let total = 0;
    for (const metrics of this.metrics.values()) {
      total += metrics.throughput.length;
    }
    return total;
  }

  private calculateSuccessfulSyncs(): number {
    const totalEvents = this.calculateTotalEvents();
    const failedEvents = this.calculateFailedSyncs();
    return Math.max(0, totalEvents - failedEvents);
  }

  private calculateFailedSyncs(): number {
    let failed = 0;
    for (const metrics of this.metrics.values()) {
      failed += metrics.errorRate.length;
    }
    return failed;
  }

  private calculateAverageProcessingTime(): number {
    const allResponseTimes: number[] = [];
    for (const metrics of this.metrics.values()) {
      allResponseTimes.push(...metrics.responseTime.map(m => m.value));
    }

    if (allResponseTimes.length === 0) return 0;
    return allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length;
  }

  private getDefaultMetrics(): SyncMetrics {
    return {
      total_events: 0,
      successful_syncs: 0,
      failed_syncs: 0,
      average_processing_time: 0,
      last_sync_time: new Date(),
      system_health: {
        [SystemType.ERPNEXT]: true,
        [SystemType.ESPOCRM]: true,
        [SystemType.MEDUSA]: true
      }
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();

      // Update in Redis
      await redisManager.set(`alert:${alertId}`, JSON.stringify(alert), 86400);

      syncLogger.info('Alert acknowledged', { alertId, acknowledgedBy });
      this.emit('alert_acknowledged', alert);
      return true;
    }
    return false;
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();

      // Update in Redis
      await redisManager.set(`alert:${alertId}`, JSON.stringify(alert), 86400);

      syncLogger.info('Alert resolved', { alertId });
      this.emit('alert_resolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    syncLogger.info('Alert rule added', { ruleId: rule.id, ruleName: rule.name });
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    const removed = this.alertRules.delete(ruleId);
    if (removed) {
      syncLogger.info('Alert rule removed', { ruleId });
    }
    return removed;
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): any {
    return {
      isRunning: this.isRunning,
      totalSystems: this.metrics.size,
      totalAlertRules: this.alertRules.size,
      activeAlerts: this.getActiveAlerts().length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      lastHealthCheck: new Date()
    };
  }
}
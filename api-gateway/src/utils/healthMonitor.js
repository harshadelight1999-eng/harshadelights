/**
 * Health Monitoring System for API Gateway
 * Monitors system health, service availability, and performance metrics
 */

const EventEmitter = require('events');
const { getApiGatewayDB, getSyncDB, getErpNextPool } = require('../config/database');
const redisManager = require('../config/redis');
const { logger } = require('./logger');
const config = require('../config');

class HealthMonitor extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.healthChecks = new Map();
    this.metrics = new Map();
    this.alerts = new Map();
    this.checkInterval = config.healthCheck.interval || 30000;
    this.intervalId = null;

    // Health check configurations
    this.checkConfigs = {
      database_api_gateway: {
        name: 'API Gateway Database',
        check: this.checkApiGatewayDatabase.bind(this),
        threshold: { warning: 1000, critical: 5000 },
        timeout: 5000
      },
      database_sync: {
        name: 'Sync Database',
        check: this.checkSyncDatabase.bind(this),
        threshold: { warning: 1000, critical: 5000 },
        timeout: 5000
      },
      database_erpnext: {
        name: 'ERPNext Database',
        check: this.checkErpNextDatabase.bind(this),
        threshold: { warning: 1000, critical: 5000 },
        timeout: 5000
      },
      redis: {
        name: 'Redis Cache',
        check: this.checkRedis.bind(this),
        threshold: { warning: 500, critical: 2000 },
        timeout: 3000
      },
      memory: {
        name: 'Memory Usage',
        check: this.checkMemoryUsage.bind(this),
        threshold: { warning: 80, critical: 95 },
        timeout: 1000
      },
      cpu: {
        name: 'CPU Usage',
        check: this.checkCpuUsage.bind(this),
        threshold: { warning: 80, critical: 95 },
        timeout: 1000
      },
      disk: {
        name: 'Disk Usage',
        check: this.checkDiskUsage.bind(this),
        threshold: { warning: 80, critical: 90 },
        timeout: 1000
      },
      erpnext_api: {
        name: 'ERPNext API',
        check: this.checkErpNextApi.bind(this),
        threshold: { warning: 2000, critical: 10000 },
        timeout: 10000
      }
    };

    // Initialize metrics
    this.initializeMetrics();

    logger.info('Health Monitor initialized');
  }

  /**
   * Initialize metrics storage
   */
  initializeMetrics() {
    this.metrics.set('requests_total', 0);
    this.metrics.set('requests_success', 0);
    this.metrics.set('requests_error', 0);
    this.metrics.set('response_time_avg', 0);
    this.metrics.set('active_connections', 0);
    this.metrics.set('uptime', 0);
  }

  /**
   * Start health monitoring
   */
  start() {
    if (this.isRunning) {
      logger.warn('Health monitor already running');
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.performHealthChecks();
    }, this.checkInterval);

    // Perform initial check
    this.performHealthChecks();

    logger.info('Health monitoring started', {
      interval: this.checkInterval,
      checks: Object.keys(this.checkConfigs).length
    });

    this.emit('started');
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('Health monitoring stopped');
    this.emit('stopped');
  }

  /**
   * Perform all health checks
   */
  async performHealthChecks() {
    const startTime = Date.now();
    const results = {};

    logger.debug('Starting health checks');

    for (const [checkId, config] of Object.entries(this.checkConfigs)) {
      try {
        const checkStart = Date.now();
        const result = await this.executeHealthCheck(checkId, config);
        const checkDuration = Date.now() - checkStart;

        results[checkId] = {
          ...result,
          duration: checkDuration,
          timestamp: new Date().toISOString()
        };

        // Store result
        this.healthChecks.set(checkId, results[checkId]);

        // Check thresholds and emit alerts
        this.checkThresholds(checkId, result, config);

      } catch (error) {
        logger.error(`Health check failed: ${checkId}`, error);
        results[checkId] = {
          status: 'error',
          error: error.message,
          duration: 0,
          timestamp: new Date().toISOString()
        };
        this.healthChecks.set(checkId, results[checkId]);
      }
    }

    const totalDuration = Date.now() - startTime;

    // Update system metrics
    this.updateSystemMetrics();

    // Emit health check completed event
    this.emit('healthCheckCompleted', {
      results,
      duration: totalDuration,
      timestamp: new Date().toISOString()
    });

    logger.debug('Health checks completed', {
      duration: totalDuration,
      checks: Object.keys(results).length
    });
  }

  /**
   * Execute individual health check with timeout
   */
  async executeHealthCheck(checkId, config) {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Health check timeout: ${checkId}`));
      }, config.timeout);

      try {
        const result = await config.check();
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Check thresholds and emit alerts
   */
  checkThresholds(checkId, result, config) {
    if (!config.threshold || result.status === 'error') {
      return;
    }

    const value = result.value || result.duration;
    const { warning, critical } = config.threshold;

    let alertLevel = null;

    if (value >= critical) {
      alertLevel = 'critical';
    } else if (value >= warning) {
      alertLevel = 'warning';
    }

    if (alertLevel) {
      const alert = {
        checkId,
        checkName: config.name,
        level: alertLevel,
        value,
        threshold: config.threshold,
        timestamp: new Date().toISOString()
      };

      this.alerts.set(`${checkId}_${alertLevel}`, alert);
      this.emit('alert', alert);

      logger.security(`Health alert: ${alertLevel}`, {
        check: config.name,
        value,
        threshold: config.threshold
      });
    }
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    this.metrics.set('uptime', Math.floor(process.uptime()));
    this.metrics.set('timestamp', Date.now());
  }

  // ===================================================================================
  // INDIVIDUAL HEALTH CHECKS
  // ===================================================================================

  /**
   * Check API Gateway database connectivity
   */
  async checkApiGatewayDatabase() {
    const startTime = Date.now();
    try {
      const db = getApiGatewayDB();
      await db.raw('SELECT 1 as health_check');
      const duration = Date.now() - startTime;

      return {
        status: 'healthy',
        duration,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Check Sync database connectivity
   */
  async checkSyncDatabase() {
    const startTime = Date.now();
    try {
      const db = getSyncDB();
      await db.raw('SELECT 1 as health_check');
      const duration = Date.now() - startTime;

      return {
        status: 'healthy',
        duration,
        message: 'Sync database connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Check ERPNext database connectivity
   */
  async checkErpNextDatabase() {
    const startTime = Date.now();
    try {
      const pool = getErpNextPool();
      const connection = await pool.getConnection();
      await connection.execute('SELECT 1 as health_check');
      connection.release();
      const duration = Date.now() - startTime;

      return {
        status: 'healthy',
        duration,
        message: 'ERPNext database connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  async checkRedis() {
    const startTime = Date.now();
    try {
      const success = await redisManager.ping();
      const duration = Date.now() - startTime;

      if (success) {
        return {
          status: 'healthy',
          duration,
          message: 'Redis connection successful'
        };
      } else {
        return {
          status: 'degraded',
          duration,
          message: 'Redis not available but service can continue'
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Check memory usage
   */
  async checkMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const percentage = (usedMemory / totalMemory) * 100;

    return {
      status: percentage < 95 ? 'healthy' : 'unhealthy',
      value: percentage,
      details: {
        used: Math.round(usedMemory / 1024 / 1024),
        total: Math.round(totalMemory / 1024 / 1024),
        percentage: Math.round(percentage)
      },
      message: `Memory usage: ${Math.round(percentage)}%`
    };
  }

  /**
   * Check CPU usage (simplified)
   */
  async checkCpuUsage() {
    // Note: This is a simplified CPU check
    // In production, you'd want to use a more sophisticated method
    const startUsage = process.cpuUsage();

    await new Promise(resolve => setTimeout(resolve, 100));

    const endUsage = process.cpuUsage(startUsage);
    const totalUsage = endUsage.user + endUsage.system;
    const percentage = (totalUsage / 100000) * 100; // Rough approximation

    return {
      status: percentage < 95 ? 'healthy' : 'unhealthy',
      value: Math.min(percentage, 100),
      message: `CPU usage: ${Math.round(percentage)}%`
    };
  }

  /**
   * Check disk usage
   */
  async checkDiskUsage() {
    try {
      const fs = require('fs');
      const stats = fs.statSync(process.cwd());
      // This is a simplified check - in production you'd use statvfs or similar

      return {
        status: 'healthy',
        value: 50, // Placeholder
        message: 'Disk usage check not fully implemented'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Check ERPNext API connectivity
   */
  async checkErpNextApi() {
    const startTime = Date.now();
    try {
      const ErpNextService = require('../services/ErpNextService');
      const erpNextService = new ErpNextService();

      const result = await erpNextService.testConnection();
      const duration = Date.now() - startTime;

      return {
        status: result.success ? 'healthy' : 'unhealthy',
        duration,
        message: result.message,
        error: result.success ? null : result.error
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // ===================================================================================
  // PUBLIC API METHODS
  // ===================================================================================

  /**
   * Get current health status
   */
  getHealthStatus() {
    const status = {
      overall: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      checks: {}
    };

    let hasUnhealthy = false;
    let hasDegraded = false;

    for (const [checkId, result] of this.healthChecks) {
      status.checks[checkId] = result;

      if (result.status === 'unhealthy' || result.status === 'error') {
        hasUnhealthy = true;
      } else if (result.status === 'degraded') {
        hasDegraded = true;
      }
    }

    // Determine overall status
    if (hasUnhealthy) {
      status.overall = 'unhealthy';
    } else if (hasDegraded) {
      status.overall = 'degraded';
    }

    return status;
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    const metrics = {};
    for (const [key, value] of this.metrics) {
      metrics[key] = value;
    }

    // Add current memory info
    const memUsage = process.memoryUsage();
    metrics.memory = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    };

    return metrics;
  }

  /**
   * Get active alerts
   */
  getAlerts() {
    const alerts = [];
    for (const [alertId, alert] of this.alerts) {
      alerts.push(alert);
    }
    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Clear alert
   */
  clearAlert(alertId) {
    return this.alerts.delete(alertId);
  }

  /**
   * Update metric value
   */
  updateMetric(key, value) {
    this.metrics.set(key, value);
    this.emit('metricUpdated', { key, value, timestamp: Date.now() });
  }

  /**
   * Increment metric counter
   */
  incrementMetric(key, amount = 1) {
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + amount);
    this.emit('metricUpdated', { key, value: current + amount, timestamp: Date.now() });
  }

  /**
   * Record response time
   */
  recordResponseTime(responseTime) {
    const current = this.metrics.get('response_time_avg') || 0;
    const count = this.metrics.get('response_time_count') || 0;

    const newAvg = (current * count + responseTime) / (count + 1);

    this.metrics.set('response_time_avg', newAvg);
    this.metrics.set('response_time_count', count + 1);
    this.metrics.set('response_time_last', responseTime);
  }

  /**
   * Get health check history
   */
  getHealthHistory(checkId = null, hours = 24) {
    // In a real implementation, this would query stored history
    // For now, return current status
    if (checkId) {
      return this.healthChecks.get(checkId) || null;
    }

    const history = {};
    for (const [id, check] of this.healthChecks) {
      history[id] = check;
    }
    return history;
  }

  /**
   * Force health check
   */
  async forceHealthCheck(checkId = null) {
    if (checkId) {
      const config = this.checkConfigs[checkId];
      if (!config) {
        throw new Error(`Unknown health check: ${checkId}`);
      }

      const result = await this.executeHealthCheck(checkId, config);
      this.healthChecks.set(checkId, {
        ...result,
        timestamp: new Date().toISOString()
      });

      return result;
    } else {
      await this.performHealthChecks();
      return this.getHealthStatus();
    }
  }
}

// Create singleton instance
const healthMonitor = new HealthMonitor();

module.exports = healthMonitor;
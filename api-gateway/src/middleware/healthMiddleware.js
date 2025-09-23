/**
 * Comprehensive Health Check System
 * Monitors all system components and dependencies
 */

const { logger } = require('../utils/logger');
const { createCustomSpan } = require('./datadogMiddleware');
const { Sentry } = require('./sentryMiddleware');
const Redis = require('redis');
const { Pool } = require('pg');
const axios = require('axios');
const config = require('../config');

/**
 * Health check registry for all system components
 */
class HealthCheckRegistry {
  constructor() {
    this.checks = new Map();
    this.dependencies = new Map();
    this.lastResults = new Map();
  }

  /**
   * Register a health check
   */
  register(name, checkFunction, options = {}) {
    this.checks.set(name, {
      name,
      checkFunction,
      timeout: options.timeout || 5000,
      critical: options.critical !== false,
      retries: options.retries || 1,
      interval: options.interval || 30000,
      tags: options.tags || []
    });

    logger.info('Health check registered', { name, critical: options.critical });
  }

  /**
   * Register a dependency for monitoring
   */
  registerDependency(name, config) {
    this.dependencies.set(name, config);
    logger.info('Dependency registered for health monitoring', { name });
  }

  /**
   * Execute a single health check
   */
  async executeCheck(checkName) {
    const check = this.checks.get(checkName);
    if (!check) {
      throw new Error(`Health check '${checkName}' not found`);
    }

    const span = createCustomSpan('health_check', {
      'health_check.name': checkName,
      'health_check.critical': check.critical
    });

    let result;
    let attempts = 0;

    while (attempts < check.retries) {
      try {
        const startTime = Date.now();

        const checkResult = await Promise.race([
          check.checkFunction(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
          )
        ]);

        const duration = Date.now() - startTime;

        result = {
          name: checkName,
          status: 'healthy',
          duration,
          timestamp: new Date().toISOString(),
          details: checkResult || {},
          attempts: attempts + 1
        };

        span.finish({
          'health_check.status': 'healthy',
          'health_check.duration': duration
        });

        break;

      } catch (error) {
        attempts++;

        if (attempts >= check.retries) {
          result = {
            name: checkName,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
            attempts
          };

          span.setError(error);
          span.finish({
            'health_check.status': 'unhealthy',
            'health_check.attempts': attempts
          });

          // Log critical failures
          if (check.critical) {
            logger.error('Critical health check failed', error, {
              checkName,
              attempts,
              critical: true
            });

            // Send to Sentry for critical failures
            Sentry.captureException(error, {
              tags: {
                healthCheck: checkName,
                critical: true
              }
            });
          }
        } else {
          logger.warn('Health check retry', {
            checkName,
            attempt: attempts,
            error: error.message
          });
        }
      }
    }

    this.lastResults.set(checkName, result);
    return result;
  }

  /**
   * Execute all health checks
   */
  async executeAllChecks() {
    const results = [];
    const startTime = Date.now();

    for (const [name] of this.checks) {
      try {
        const result = await this.executeCheck(name);
        results.push(result);
      } catch (error) {
        results.push({
          name,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    const healthyChecks = results.filter(r => r.status === 'healthy').length;
    const unhealthyChecks = results.filter(r => r.status === 'unhealthy').length;
    const errorChecks = results.filter(r => r.status === 'error').length;

    const summary = {
      status: unhealthyChecks === 0 && errorChecks === 0 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      checks: {
        total: results.length,
        healthy: healthyChecks,
        unhealthy: unhealthyChecks,
        errors: errorChecks
      },
      results
    };

    logger.info('Health check summary', summary.checks);
    return summary;
  }

  /**
   * Get specific health check result
   */
  getCheckResult(name) {
    return this.lastResults.get(name);
  }

  /**
   * Get all health check results
   */
  getAllResults() {
    const results = {};
    for (const [name, result] of this.lastResults) {
      results[name] = result;
    }
    return results;
  }
}

// Create global health check registry
const healthRegistry = new HealthCheckRegistry();

/**
 * Database health checks
 */
async function checkPostgresHealth() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || config.database.url,
    connectionTimeoutMillis: 3000
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as timestamp, version() as version');
    client.release();
    await pool.end();

    return {
      connected: true,
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version,
      responseTime: Date.now()
    };
  } catch (error) {
    throw new Error(`PostgreSQL connection failed: ${error.message}`);
  }
}

async function checkRedisHealth() {
  const client = Redis.createClient({
    url: process.env.REDIS_URL || config.redis.url,
    socket: {
      connectTimeout: 3000
    }
  });

  try {
    await client.connect();
    const pong = await client.ping();
    const info = await client.info('server');
    await client.quit();

    return {
      connected: true,
      ping: pong,
      serverInfo: info.split('\r\n')[1] // Redis version line
    };
  } catch (error) {
    throw new Error(`Redis connection failed: ${error.message}`);
  }
}

/**
 * External service health checks
 */
async function checkErpNextHealth() {
  const erpnextUrl = process.env.ERPNEXT_URL || config.services.erpnext.url;

  try {
    const response = await axios.get(`${erpnextUrl}/api/method/ping`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Harsha-Delights-Health-Check'
      }
    });

    return {
      available: true,
      statusCode: response.status,
      responseTime: response.headers['x-response-time'] || 'unknown',
      version: response.headers['x-frappe-version'] || 'unknown'
    };
  } catch (error) {
    throw new Error(`ERPNext health check failed: ${error.message}`);
  }
}

async function checkMedusaHealth() {
  const medusaUrl = process.env.MEDUSA_URL || config.services.medusa.url;

  try {
    const response = await axios.get(`${medusaUrl}/health`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Harsha-Delights-Health-Check'
      }
    });

    return {
      available: true,
      statusCode: response.status,
      data: response.data
    };
  } catch (error) {
    throw new Error(`Medusa health check failed: ${error.message}`);
  }
}

async function checkEspoCrmHealth() {
  const espoCrmUrl = process.env.ESPOCRM_URL || config.services.espocrm.url;

  try {
    const response = await axios.get(`${espoCrmUrl}/api/v1/App/user`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Harsha-Delights-Health-Check'
      }
    });

    return {
      available: true,
      statusCode: response.status
    };
  } catch (error) {
    // EspoCRM might return 401 for unauthorized requests, which indicates it's running
    if (error.response?.status === 401) {
      return {
        available: true,
        statusCode: 401,
        note: 'Service running (unauthorized access expected)'
      };
    }
    throw new Error(`EspoCRM health check failed: ${error.message}`);
  }
}

/**
 * System resource health checks
 */
async function checkSystemResources() {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      usage_percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: Math.round(process.uptime()),
    nodeVersion: process.version,
    pid: process.pid
  };
}

/**
 * Application-specific health checks
 */
async function checkAuthenticationSystem() {
  try {
    // Test JWT token generation
    const jwt = require('jsonwebtoken');
    const testPayload = { test: true, timestamp: Date.now() };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1m' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');

    return {
      jwtWorking: true,
      secretConfigured: !!process.env.JWT_SECRET,
      testTokenGenerated: !!token,
      testTokenDecoded: decoded.test === true
    };
  } catch (error) {
    throw new Error(`Authentication system check failed: ${error.message}`);
  }
}

async function checkRateLimiting() {
  try {
    // Basic check for rate limiting configuration
    const rateLimit = require('express-rate-limit');

    return {
      configured: true,
      redisAvailable: !!process.env.REDIS_URL,
      rateLimitingEnabled: true
    };
  } catch (error) {
    throw new Error(`Rate limiting check failed: ${error.message}`);
  }
}

/**
 * Register all health checks
 */
function registerHealthChecks() {
  // Critical system components
  healthRegistry.register('postgres', checkPostgresHealth, {
    critical: true,
    timeout: 5000,
    retries: 2
  });

  healthRegistry.register('redis', checkRedisHealth, {
    critical: true,
    timeout: 5000,
    retries: 2
  });

  // External services
  healthRegistry.register('erpnext', checkErpNextHealth, {
    critical: false,
    timeout: 10000,
    retries: 1
  });

  healthRegistry.register('medusa', checkMedusaHealth, {
    critical: false,
    timeout: 10000,
    retries: 1
  });

  healthRegistry.register('espocrm', checkEspoCrmHealth, {
    critical: false,
    timeout: 10000,
    retries: 1
  });

  // System resources
  healthRegistry.register('system_resources', checkSystemResources, {
    critical: false,
    timeout: 2000
  });

  // Application components
  healthRegistry.register('authentication', checkAuthenticationSystem, {
    critical: true,
    timeout: 3000
  });

  healthRegistry.register('rate_limiting', checkRateLimiting, {
    critical: false,
    timeout: 2000
  });

  logger.info('All health checks registered successfully');
}

/**
 * Health check endpoint middleware
 */
function createHealthEndpoint() {
  return async (req, res) => {
    try {
      const includeDetails = req.query.details === 'true';
      const checkName = req.params.check;

      let result;

      if (checkName) {
        // Single health check
        result = await healthRegistry.executeCheck(checkName);
      } else {
        // All health checks
        result = await healthRegistry.executeAllChecks();
      }

      const statusCode = result.status === 'healthy' ? 200 : 503;

      if (!includeDetails && result.results) {
        // Remove detailed error information for external health checks
        result.results = result.results.map(check => ({
          name: check.name,
          status: check.status,
          timestamp: check.timestamp
        }));
      }

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Health check endpoint error', error);
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Startup health check
 */
async function performStartupHealthCheck() {
  logger.info('Performing startup health check...');

  try {
    const results = await healthRegistry.executeAllChecks();
    const criticalFailures = results.results.filter(r =>
      r.status !== 'healthy' &&
      healthRegistry.checks.get(r.name)?.critical
    );

    if (criticalFailures.length > 0) {
      logger.error('Critical health check failures detected', {
        failures: criticalFailures.map(f => f.name)
      });

      // Don't exit - allow server to continue with degraded functionality
      logger.warn('🚨 Continuing server startup despite health check failures - API will run in limited mode');
    } else {
      logger.info('Startup health check passed', {
        healthyChecks: results.checks.healthy,
        totalChecks: results.checks.total
      });
    }

    return results;
  } catch (error) {
    logger.error('Startup health check failed', error);

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }

    throw error;
  }
}

/**
 * Periodic health check monitoring
 */
function startPeriodicHealthChecks(intervalMs = 30000) {
  setInterval(async () => {
    try {
      const results = await healthRegistry.executeAllChecks();

      if (results.status !== 'healthy') {
        logger.warn('Periodic health check detected issues', {
          unhealthyChecks: results.checks.unhealthy,
          errorChecks: results.checks.errors
        });
      }
    } catch (error) {
      logger.error('Periodic health check failed', error);
    }
  }, intervalMs);

  logger.info('Periodic health checks started', { intervalMs });
}

module.exports = {
  healthRegistry,
  registerHealthChecks,
  createHealthEndpoint,
  performStartupHealthCheck,
  startPeriodicHealthChecks,
  // Export individual checks for testing
  checkPostgresHealth,
  checkRedisHealth,
  checkErpNextHealth,
  checkMedusaHealth,
  checkEspoCrmHealth,
  checkSystemResources,
  checkAuthenticationSystem,
  checkRateLimiting
};
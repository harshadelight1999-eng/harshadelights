/**
 * Database Configuration for Harsha Delights API Gateway
 * Supports PostgreSQL (API Gateway & Sync) and MariaDB (ERPNext)
 */

const knex = require('knex');
const { logger } = require("../utils/logger");
const mysql = require('mysql2/promise');

const config = {
  // PostgreSQL - API Gateway Database
  apiGateway: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'harsha_delights_gateway',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 1,
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 60000,
      destroyTimeoutMillis: 15000,
      idleTimeoutMillis: 300000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 500,
      propagateCreateError: false
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  // PostgreSQL - Sync Database
  syncDatabase: {
    client: 'pg',
    connection: {
      host: process.env.SYNC_DB_HOST || 'localhost',
      port: parseInt(process.env.SYNC_DB_PORT) || 5432,
      database: process.env.SYNC_DB_NAME || 'harsha_delights_sync',
      user: process.env.SYNC_DB_USER || 'postgres',
      password: process.env.SYNC_DB_PASS || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000
    }
  },

  // MariaDB - ERPNext Database (for direct queries when needed)
  erpNext: {
    host: process.env.ERPNEXT_DB_HOST || 'localhost',
    port: parseInt(process.env.ERPNEXT_DB_PORT) || 3306,
    database: process.env.ERPNEXT_DB_NAME || 'erpnext_hd',
    user: process.env.ERPNEXT_DB_USER || 'root',
    password: process.env.ERPNEXT_DB_PASS || '',
    charset: 'utf8mb4',
    timezone: '+00:00',
    connectionLimit: 10,
    acquireTimeout: 30000,
    timeout: 30000
  }
};

// Initialize database connections
let apiGatewayDB;
let syncDB;
let erpNextPool;

const initializeDatabases = async () => {
  try {
    // Initialize primary PostgreSQL connection (API Gateway)
    if (process.env.DATABASE_URL || process.env.DB_HOST) {
      try {
        apiGatewayDB = knex(config.apiGateway);
        logger.info('✅ API Gateway PostgreSQL connection initialized');
      } catch (error) {
        logger.error('❌ API Gateway database connection failed:', error.message);
      }
    } else {
      logger.warn('⚠️  No API Gateway database configuration found');
    }

    // Initialize sync database (optional)
    if (process.env.SYNC_DB_HOST || process.env.SYNC_DATABASE_URL) {
      try {
        syncDB = knex(config.syncDatabase);
        logger.info('✅ Sync PostgreSQL connection initialized');
      } catch (error) {
        logger.error('❌ Sync database connection failed:', error.message);
      }
    } else {
      logger.info('ℹ️  Sync database not configured - using API Gateway database');
    }

    // Initialize MariaDB connection pool (optional)
    if (process.env.ERPNEXT_DB_HOST) {
      try {
        erpNextPool = mysql.createPool(config.erpNext);
        logger.info('✅ ERPNext MariaDB connection initialized');
      } catch (error) {
        logger.error('❌ ERPNext database connection failed:', error.message);
      }
    } else {
      logger.info('ℹ️  ERPNext database not configured - ERP features disabled');
    }

    logger.info('✅ Database initialization completed');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error.message);
    logger.warn('🚨 Continuing without database - API will run in limited mode');
    // Don't exit - allow server to continue without database
  }
};

const testConnections = async () => {
  // Test PostgreSQL connections
  await apiGatewayDB.raw('SELECT 1');
  logger.info('✅ API Gateway PostgreSQL connection successful');

  await syncDB.raw('SELECT 1');
  logger.info('✅ Sync PostgreSQL connection successful');

  // Test MariaDB connection
  const connection = await erpNextPool.getConnection();
  await connection.execute('SELECT 1');
  connection.release();
  logger.info('✅ ERPNext MariaDB connection successful');
};

const closeDatabases = async () => {
  try {
    if (apiGatewayDB) {
      await apiGatewayDB.destroy();
      logger.info('✅ API Gateway database connection closed');
    }

    if (syncDB) {
      await syncDB.destroy();
      logger.info('✅ Sync database connection closed');
    }

    if (erpNextPool) {
      await erpNextPool.end();
      logger.info('✅ ERPNext database connection closed');
    }
  } catch (error) {
    logger.error('❌ Error closing database connections:', error.message);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('📊 Gracefully shutting down database connections...');
  await closeDatabases();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('📊 Gracefully shutting down database connections...');
  await closeDatabases();
  process.exit(0);
});

module.exports = {
  config,
  initializeDatabases,
  testConnections,
  closeDatabases,
  getApiGatewayDB: () => {
    // Return null if database is not properly initialized or in error state
    if (!apiGatewayDB || apiGatewayDB.isDestroyed || apiGatewayDB._destroying) {
      return null;
    }
    return apiGatewayDB;
  },
  getSyncDB: () => {
    // Return null if database is not properly initialized or in error state
    if (!syncDB || syncDB.isDestroyed || syncDB._destroying) {
      return null;
    }
    return syncDB;
  },
  getErpNextPool: () => erpNextPool
};

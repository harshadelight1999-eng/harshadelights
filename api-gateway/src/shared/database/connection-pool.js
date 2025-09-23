/**
 * Database Connection Pool Manager
 * Wrapper around the existing database configuration
 */

const { initializeDatabases, testConnections } = require('../../config/database');
const { logger } = require('../../utils/logger');

class DatabaseConnectionManager {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      logger.info('Database connection manager already initialized');
      return;
    }

    try {
      logger.info('Initializing database connection pools...');
      await initializeDatabases();

      // Test connections to verify they work
      await testConnections();

      this.initialized = true;
      logger.info('✅ Database connection pools initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize database connection pools:', error);
      throw error;
    }
  }

  async close() {
    if (!this.initialized) {
      return;
    }

    try {
      const { closeDatabases } = require('../../config/database');
      await closeDatabases();
      this.initialized = false;
      logger.info('✅ Database connections closed');
    } catch (error) {
      logger.error('❌ Error closing database connections:', error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }
}

// Export singleton instance
const dbConnectionManager = new DatabaseConnectionManager();

module.exports = dbConnectionManager;
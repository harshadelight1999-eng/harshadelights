#!/usr/bin/env node

/**
 * Database Migration Runner for Harsha Delights
 * Handles PostgreSQL migrations with proper error handling and logging
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'logs/migration.log' })
  ]
});

class MigrationRunner {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://harsha_user:harsha_pass@localhost:5432/harsha_delights',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async init() {
    // Create migrations table if it doesn't exist
    const createMigrationsTable = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        execution_time_ms INTEGER,
        checksum VARCHAR(64)
      );
    `;

    try {
      await this.pool.query(createMigrationsTable);
      logger.info('Migrations table initialized');
    } catch (error) {
      logger.error('Failed to initialize migrations table:', error);
      throw error;
    }
  }

  async getExecutedMigrations() {
    const result = await this.pool.query(
      'SELECT filename FROM migrations ORDER BY id'
    );
    return result.rows.map(row => row.filename);
  }

  async getMigrationFiles() {
    const migrationsDir = path.join(__dirname, 'postgres');
    const files = await fs.readdir(migrationsDir);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  async calculateChecksum(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async executeMigration(filename) {
    const filePath = path.join(__dirname, 'postgres', filename);
    const content = await fs.readFile(filePath, 'utf8');
    const checksum = await this.calculateChecksum(content);

    logger.info(`Executing migration: ${filename}`);
    const startTime = Date.now();

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Execute the migration
      await client.query(content);

      // Record the migration
      await client.query(
        'INSERT INTO migrations (filename, execution_time_ms, checksum) VALUES ($1, $2, $3)',
        [filename, Date.now() - startTime, checksum]
      );

      await client.query('COMMIT');
      logger.info(`Migration ${filename} completed successfully in ${Date.now() - startTime}ms`);

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Migration ${filename} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async run() {
    try {
      await this.init();

      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();

      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      logger.info('All migrations completed successfully');

    } catch (error) {
      logger.error('Migration failed:', error);
      process.exit(1);
    }
  }

  async rollback(targetMigration) {
    // Implement rollback logic if needed
    logger.warn('Rollback functionality not implemented yet');
  }

  async close() {
    await this.pool.end();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const runner = new MigrationRunner();

  const gracefulShutdown = async () => {
    logger.info('Shutting down migration runner...');
    await runner.close();
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  switch (command) {
    case 'up':
    case undefined:
      runner.run().finally(() => runner.close());
      break;

    case 'rollback':
      const target = process.argv[3];
      runner.rollback(target).finally(() => runner.close());
      break;

    default:
      console.log('Usage: node migrate.js [up|rollback <target>]');
      process.exit(1);
  }
}

module.exports = MigrationRunner;
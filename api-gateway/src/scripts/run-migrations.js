/**
 * Migration Runner for Production Deployment
 * Automatically runs all pending database migrations during startup
 */

const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/logger');

async function runMigrations(db) {
  try {
    logger.info('🔄 Starting database migrations...');

    // Create migrations table if it doesn't exist
    const migrationTableExists = await db.schema.hasTable('knex_migrations');
    if (!migrationTableExists) {
      logger.info('📝 Creating migrations tracking table...');
      await db.schema.createTable('knex_migrations', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('batch').notNullable();
        table.timestamp('migration_time').defaultTo(db.fn.now());
      });
    }

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort to ensure correct order

    logger.info(`📋 Found ${migrationFiles.length} migration files`);

    // Get already executed migrations
    const executedMigrations = await db('knex_migrations')
      .select('name')
      .orderBy('id');
    
    const executedNames = executedMigrations.map(m => m.name);
    logger.info(`✅ ${executedNames.length} migrations already executed`);

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(file => {
      const migrationName = file.replace('.js', '');
      return !executedNames.includes(migrationName);
    });

    if (pendingMigrations.length === 0) {
      logger.info('✅ No pending migrations to run');
      return { executed: 0, skipped: executedNames.length };
    }

    logger.info(`🚀 Running ${pendingMigrations.length} pending migrations...`);

    const batch = Math.max(...executedMigrations.map(m => m.batch || 0), 0) + 1;
    const results = [];

    // Execute pending migrations
    for (const migrationFile of pendingMigrations) {
      try {
        logger.info(`📦 Running migration: ${migrationFile}`);
        
        const migrationPath = path.join(migrationsDir, migrationFile);
        const migration = require(migrationPath);
        
        if (typeof migration.up !== 'function') {
          throw new Error(`Migration ${migrationFile} does not export an 'up' function`);
        }

        // Run the migration
        await migration.up(db);
        
        // Record the migration as executed
        const migrationName = migrationFile.replace('.js', '');
        await db('knex_migrations').insert({
          name: migrationName,
          batch: batch
        });

        logger.info(`✅ Migration completed: ${migrationFile}`);
        results.push({ name: migrationFile, status: 'success' });
        
      } catch (error) {
        logger.error(`❌ Migration failed: ${migrationFile}`, error);
        results.push({ name: migrationFile, status: 'failed', error: error.message });
        
        // Stop on first failure to prevent cascading issues
        throw new Error(`Migration ${migrationFile} failed: ${error.message}`);
      }
    }

    logger.info(`🎉 Successfully executed ${results.length} migrations`);
    
    return {
      executed: results.length,
      skipped: executedNames.length,
      batch: batch,
      results: results
    };

  } catch (error) {
    logger.error('💥 Migration runner failed:', error);
    throw error;
  }
}

module.exports = { runMigrations };
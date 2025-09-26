/**
 * Database Migration Script
 * Runs database migrations for the API Gateway
 */

const knex = require('knex');
const config = require('../../knexfile.js');
const { logger } = require('../utils/logger');

const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment];

async function runMigrations() {
  const db = knex(knexConfig);
  
  try {
    logger.info('🔄 Starting database migrations...');
    
    // Run migrations
    const [batchNo, migrations] = await db.migrate.latest();
    
    if (migrations.length === 0) {
      logger.info('✅ Database is already up to date');
    } else {
      logger.info('✅ Database migrations completed', {
        batch: batchNo,
        migrations: migrations.length,
        files: migrations
      });
    }
    
    // Check migration status
    const completed = await db.migrate.status();
    logger.info('📊 Migration status', {
      completed: completed[0]?.length || 0,
      pending: completed[1]?.length || 0
    });
    
  } catch (error) {
    logger.error('❌ Migration failed', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('🎉 Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Migration script failed', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
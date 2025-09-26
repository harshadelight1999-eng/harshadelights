/**
 * Setup script for Diwali launch
 * Runs migrations and seeds the database with Diwali products
 */

require('dotenv').config();
const { logger } = require('../utils/logger');

async function setupDiwaliLaunch() {
  try {
    logger.info('🪔 Setting up Harsha Delights for Diwali launch...');

    // Run migrations
    logger.info('📋 Running database migrations...');
    const { spawn } = require('child_process');
    
    // Run knex migrations
    const migrate = spawn('npm', ['run', 'migrate'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    await new Promise((resolve, reject) => {
      migrate.on('close', (code) => {
        if (code === 0) {
          logger.info('✅ Database migrations completed successfully');
          resolve();
        } else {
          reject(new Error(`Migration failed with exit code ${code}`));
        }
      });
    });

    // Seed Diwali products
    logger.info('🍯 Seeding Diwali product catalog...');
    const { seedDiwaliProducts } = require('./seed-diwali-products');
    const seedResult = await seedDiwaliProducts();

    logger.info('🎉 Diwali launch setup completed successfully!');
    logger.info(`📦 Created ${seedResult.productsCreated} products with ${seedResult.variantsCreated} variants`);
    
    return seedResult;

  } catch (error) {
    logger.error('❌ Diwali launch setup failed:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDiwaliLaunch()
    .then((result) => {
      console.log('🎊 Setup completed successfully!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDiwaliLaunch };
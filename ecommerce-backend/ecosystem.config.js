// =====================================================================================
// HARSHA DELIGHTS MEDUSA.JS - PM2 ECOSYSTEM CONFIGURATION
// =====================================================================================
// Production-ready PM2 configuration for Medusa.js e-commerce backend
// =====================================================================================

module.exports = {
  apps: [
    {
      name: 'harsha-medusa-backend',
      script: './node_modules/@medusajs/medusa/dist/bin/medusa.js',
      args: 'start',
      instances: process.env.PM2_INSTANCES || 2,
      exec_mode: 'cluster',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 9000,
        WORKER_ID: process.env.pm_id || 0
      },

      // Logging
      log_file: './logs/medusa-combined.log',
      out_file: './logs/medusa-out.log',
      error_file: './logs/medusa-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Process management
      autorestart: true,
      watch: false,
      max_memory_restart: '768M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Performance monitoring
      pmx: true,

      // Advanced settings
      node_args: [
        '--max-old-space-size=768',
        '--optimize-for-size'
      ],

      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // Process isolation
      instance_var: 'INSTANCE_ID',

      // Graceful shutdown
      kill_timeout: 10000,
      listen_timeout: 5000,

      // Custom metadata
      meta: {
        name: 'Harsha Delights Medusa Backend',
        description: 'E-commerce backend service for confectionery business',
        version: '1.0.0'
      }
    },

    {
      name: 'harsha-medusa-admin',
      script: './node_modules/@medusajs/admin/dist/bin/medusa-admin.js',
      args: 'serve',
      instances: 1,
      exec_mode: 'fork',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 7000,
        MEDUSA_BACKEND_URL: 'http://localhost:9000'
      },

      // Logging
      log_file: './logs/admin-combined.log',
      out_file: './logs/admin-out.log',
      error_file: './logs/admin-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Process management
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 4000,

      // Advanced settings
      node_args: [
        '--max-old-space-size=512'
      ],

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Custom metadata
      meta: {
        name: 'Harsha Delights Medusa Admin',
        description: 'Admin interface for e-commerce management',
        version: '1.0.0'
      }
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'nodejs',
      host: ['localhost'],
      ref: 'origin/master',
      repo: 'git@github.com:harshadelights/ecommerce-backend.git',
      path: '/var/www/medusa-production',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    },

    staging: {
      user: 'nodejs',
      host: ['localhost'],
      ref: 'origin/develop',
      repo: 'git@github.com:harshadelights/ecommerce-backend.git',
      path: '/var/www/medusa-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};
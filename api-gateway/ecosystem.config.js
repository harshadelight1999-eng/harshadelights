// =====================================================================================
// HARSHA DELIGHTS API GATEWAY - PM2 ECOSYSTEM CONFIGURATION
// =====================================================================================
// Production-ready PM2 configuration for API Gateway process management
// =====================================================================================

module.exports = {
  apps: [
    {
      name: 'harsha-api-gateway',
      script: './src/server.js',
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        WORKER_ID: process.env.pm_id || 0
      },

      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Process management
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Performance monitoring
      pmx: true,

      // Advanced settings
      node_args: [
        '--max-old-space-size=512',
        '--optimize-for-size',
        '--gc-interval=100'
      ],

      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // Process isolation
      instance_var: 'INSTANCE_ID',

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Source map support
      source_map_support: true,

      // Custom metadata
      meta: {
        name: 'Harsha Delights API Gateway',
        description: 'Microservices API Gateway for confectionery business',
        version: '1.0.0'
      }
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'nodejs',
      host: ['localhost'],
      ref: 'origin/master',
      repo: 'git@github.com:harshadelights/api-gateway.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    },

    staging: {
      user: 'nodejs',
      host: ['localhost'],
      ref: 'origin/develop',
      repo: 'git@github.com:harshadelights/api-gateway.git',
      path: '/var/www/staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};
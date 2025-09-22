import dotenv from 'dotenv';
import { SystemConfig, SyncConfig } from '../types';

dotenv.config();

interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  systems: {
    erpnext: SystemConfig;
    espocrm: SystemConfig;
    medusa: SystemConfig;
  };
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };
  sync: SyncConfig;
  logging: {
    level: string;
    filePath: string;
  };
  monitoring: {
    enabled: boolean;
    port: number;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3005', 10),
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  systems: {
    erpnext: {
      url: process.env.ERPNEXT_URL || 'http://localhost:8000',
      apiKey: process.env.ERPNEXT_API_KEY || '',
      apiSecret: process.env.ERPNEXT_API_SECRET || '',
      timeout: 30000,
      retryAttempts: 3
    },
    espocrm: {
      url: process.env.ESPOCRM_URL || 'http://localhost:8080',
      apiKey: process.env.ESPOCRM_API_KEY || '',
      username: process.env.ESPOCRM_USERNAME || '',
      password: process.env.ESPOCRM_PASSWORD || '',
      timeout: 30000,
      retryAttempts: 3
    },
    medusa: {
      url: process.env.MEDUSA_URL || 'http://localhost:9000',
      apiKey: process.env.MEDUSA_API_KEY || '',
      username: process.env.MEDUSA_ADMIN_EMAIL || '',
      password: process.env.MEDUSA_ADMIN_PASSWORD || '',
      timeout: 30000,
      retryAttempts: 3
    }
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'harsha_sync',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },
  sync: {
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '100', 10),
    retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.SYNC_RETRY_DELAY || '5000', 10),
    enableRealTimeSync: process.env.ENABLE_REAL_TIME_SYNC === 'true',
    syncIntervals: {
      customer: 300000, // 5 minutes
      inventory: 60000,  // 1 minute
      orders: 30000,     // 30 seconds
      pricing: 600000    // 10 minutes
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/sync-services.log'
  },
  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    port: parseInt(process.env.METRICS_PORT || '9090', 10)
  }
};

// Validation
function validateConfig(): void {
  const requiredEnvVars = [
    'ERPNEXT_API_KEY',
    'ESPOCRM_API_KEY',
    'MEDUSA_API_KEY',
    'DB_PASSWORD'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (config.server.port < 1 || config.server.port > 65535) {
    throw new Error('Server port must be between 1 and 65535');
  }

  if (config.sync.batchSize < 1 || config.sync.batchSize > 1000) {
    throw new Error('Sync batch size must be between 1 and 1000');
  }
}

// Only validate in production
if (config.server.nodeEnv === 'production') {
  validateConfig();
}

export default config;
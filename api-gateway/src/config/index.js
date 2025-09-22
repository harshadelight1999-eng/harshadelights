/**
 * Main Configuration Module for Harsha Delights API Gateway
 * Centralizes all configuration settings and environment variables
 */

require('dotenv').config();

const config = {
  // Application Settings
  app: {
    name: process.env.APP_NAME || 'Harsha Delights API Gateway',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0'
  },

  // Database Configuration
  database: {
    apiGateway: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      name: process.env.DB_NAME || 'harsha_delights_gateway',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '',
      ssl: process.env.DB_SSL === 'true',
      poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
      poolMax: parseInt(process.env.DB_POOL_MAX) || 10
    },
    sync: {
      host: process.env.SYNC_DB_HOST || 'localhost',
      port: parseInt(process.env.SYNC_DB_PORT) || 5432,
      name: process.env.SYNC_DB_NAME || 'harsha_delights_sync',
      user: process.env.SYNC_DB_USER || 'postgres',
      password: process.env.SYNC_DB_PASS || ''
    },
    erpNext: {
      host: process.env.ERPNEXT_DB_HOST || 'localhost',
      port: parseInt(process.env.ERPNEXT_DB_PORT) || 3306,
      name: process.env.ERPNEXT_DB_NAME || 'erpnext_hd',
      user: process.env.ERPNEXT_DB_USER || 'root',
      password: process.env.ERPNEXT_DB_PASS || ''
    }
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0,
    clusterMode: process.env.REDIS_CLUSTER_MODE === 'true'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'harsha-delights-api-gateway',
    algorithm: 'HS256'
  },

  // API Key Configuration
  apiKey: {
    secret: process.env.API_KEY_SECRET || 'change-this-in-production',
    prefix: process.env.API_KEY_PREFIX || 'hd_',
    length: parseInt(process.env.API_KEY_LENGTH) || 32
  },

  // Two-Factor Authentication
  totp: {
    serviceName: process.env.TOTP_SERVICE_NAME || 'Harsha Delights',
    issuer: process.env.TOTP_ISSUER || 'Harsha Delights API Gateway',
    window: parseInt(process.env.TOTP_WINDOW) || 2
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    tiers: {
      basic: parseInt(process.env.RATE_LIMIT_BASIC_RPM) || 30,
      standard: parseInt(process.env.RATE_LIMIT_STANDARD_RPM) || 100,
      premium: parseInt(process.env.RATE_LIMIT_PREMIUM_RPM) || 500,
      unlimited: parseInt(process.env.RATE_LIMIT_UNLIMITED_RPM) || 0
    }
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
      'X-Forwarded-For',
      'X-Real-IP'
    ]
  },

  // External Services Configuration
  services: {
    erpNext: {
      baseUrl: process.env.ERPNEXT_BASE_URL || 'http://localhost:8000',
      apiKey: process.env.ERPNEXT_API_KEY || '',
      apiSecret: process.env.ERPNEXT_API_SECRET || '',
      timeout: 30000
    },
    medusa: {
      baseUrl: process.env.MEDUSA_BASE_URL || 'http://localhost:9000',
      apiKey: process.env.MEDUSA_API_KEY || '',
      timeout: 30000
    },
    espoCrm: {
      baseUrl: process.env.ESPOCRM_BASE_URL || 'http://localhost:8080',
      apiKey: process.env.ESPOCRM_API_KEY || '',
      timeout: 30000
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/api-gateway.log',
    maxFileSize: process.env.LOG_MAX_FILE_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
  },

  // Health Check Configuration
  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
    retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    password: {
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
      requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true'
    },
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    accountLockTime: parseInt(process.env.ACCOUNT_LOCK_TIME) || 1800000 // 30 minutes
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
    secure: process.env.SESSION_SECURE === 'true',
    httpOnly: process.env.SESSION_HTTP_ONLY !== 'false'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ],
    destination: process.env.UPLOAD_DEST || './uploads'
  },

  // Circuit Breaker Configuration
  circuitBreaker: {
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 60000,
    errorThreshold: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 5,
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000
  },

  // Swagger/API Documentation
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    host: process.env.SWAGGER_HOST || 'localhost:3000',
    basePath: process.env.SWAGGER_BASE_PATH || '/api/v1'
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@harshadelights.com'
  },

  // Webhook Configuration
  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'change-this-in-production',
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT) || 10000
  },

  // Metrics and Analytics
  metrics: {
    enabled: process.env.METRICS_ENABLED === 'true',
    interval: parseInt(process.env.METRICS_INTERVAL) || 60000
  },

  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true'
  }
};

// Validation function
const validateConfig = () => {
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'API_KEY_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && config.app.env === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (config.app.env === 'production') {
    // Additional production validations
    if (config.jwt.secret === 'change-this-in-production') {
      throw new Error('JWT_SECRET must be changed in production');
    }

    if (config.apiKey.secret === 'change-this-in-production') {
      throw new Error('API_KEY_SECRET must be changed in production');
    }
  }
};

// Environment-specific configurations
const envConfigs = {
  development: {
    logging: {
      level: 'debug'
    },
    security: {
      maxLoginAttempts: 10 // More lenient in development
    }
  },

  test: {
    database: {
      apiGateway: {
        name: 'harsha_delights_gateway_test'
      },
      sync: {
        name: 'harsha_delights_sync_test'
      }
    },
    logging: {
      level: 'error'
    }
  },

  production: {
    logging: {
      level: 'warn'
    },
    cors: {
      credentials: true
    },
    session: {
      secure: true
    }
  }
};

// Merge environment-specific config
if (envConfigs[config.app.env]) {
  Object.assign(config, envConfigs[config.app.env]);
}

// Validate configuration
validateConfig();

module.exports = config;
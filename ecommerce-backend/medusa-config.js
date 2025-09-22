// =====================================================================================
// HARSHA DELIGHTS MEDUSA.JS CONFIGURATION
// =====================================================================================
// Production-ready configuration for Medusa.js e-commerce backend
// =====================================================================================

const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {
  console.warn(`Warning: ${ENV_FILE_NAME} file not found. Using environment variables.`);
}

// CORS configuration
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000,http://localhost:3000";

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'harsha_admin'}:${process.env.POSTGRES_PASSWORD || 'harsha_postgres_2024'}@${process.env.POSTGRES_HOST || 'postgres'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'harsha_medusa'}`;

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379/4";

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,

  // File service configuration
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: process.env.MEDUSA_FILE_LOCAL_UPLOAD_DIR || "uploads",
    },
  },

  // Cache service
  {
    resolve: `@medusajs/cache-redis`,
    options: {
      redisUrl: REDIS_URL,
      ttl: 30,
    },
  },

  // Event bus
  {
    resolve: `@medusajs/event-bus-redis`,
    options: {
      redisUrl: REDIS_URL,
    },
  },

  // Stripe payment provider (if configured)
  ...(process.env.STRIPE_API_KEY ? [{
    resolve: `medusa-payment-stripe`,
    options: {
      api_key: process.env.STRIPE_API_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  }] : []),

  // Inventory management
  {
    resolve: `@medusajs/inventory`,
    options: {
      // Inventory service configuration
    },
  },

  // Stock location service
  {
    resolve: `@medusajs/stock-location`,
    options: {
      // Stock location configuration
    },
  },

  // Workflow engine
  {
    resolve: `@medusajs/workflow-engine-inmemory`,
    options: {
      // Workflow configuration
    },
  },
];

const modules = {
  // Inventory module
  inventoryService: {
    resolve: "@medusajs/inventory",
  },

  // Stock location module
  stockLocationService: {
    resolve: "@medusajs/stock-location",
  },

  // Event bus module
  eventBusService: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL,
    },
  },

  // Cache module
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL,
      ttl: 30,
    },
  },

  // Workflow engine module
  workflowEngineService: {
    resolve: "@medusajs/workflow-engine-inmemory",
  },
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig: {
    // JWT configuration
    jwt_secret: process.env.JWT_SECRET || "medusa_jwt_secret_key_256_bits",
    cookie_secret: process.env.COOKIE_SECRET || "medusa_cookie_secret_key",

    // Store configuration
    store_cors: STORE_CORS,
    database_url: DATABASE_URL,
    admin_cors: ADMIN_CORS,

    // Redis configuration
    redis_url: REDIS_URL,

    // Worker configuration
    worker_mode: process.env.MEDUSA_WORKER_MODE || "shared",

    // Database configuration
    database_type: "postgres",
    database_logging: process.env.NODE_ENV === "development",

    // Session configuration
    session_options: {
      name: "harsha_medusa_session",
      resave: false,
      rolling: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET || "medusa_cookie_secret_key",
      cookie: {
        sameSite: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000, // 10 minutes
      },
    },

    // Database extra configuration
    database_extra:
      process.env.NODE_ENV !== "development"
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
            // Connection pool configuration
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
            max: 20,
            min: 2,
          }
        : {},
  },

  plugins,
  modules,

  // Feature flags
  featureFlags: {
    product_categories: true,
    tax_inclusive_pricing: true,
    sales_channels: true,
    medusa_v2: true,
  },
};
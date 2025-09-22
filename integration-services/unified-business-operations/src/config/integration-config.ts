export interface IntegrationConfig {
  // API Gateway Configuration
  apiGateway: {
    baseUrl: string;
    port: number;
    timeout: number;
    retryAttempts: number;
    rateLimiting: {
      requestsPerMinute: number;
      burstLimit: number;
    };
  };

  // B2B Portal Integration
  b2bPortal: {
    baseUrl: string;
    apiVersion: string;
    authentication: {
      type: 'jwt' | 'oauth2' | 'api-key';
      credentials: {
        clientId?: string;
        clientSecret?: string;
        apiKey?: string;
      };
    };
    endpoints: {
      customers: string;
      orders: string;
      products: string;
      analytics: string;
    };
    syncInterval: number; // milliseconds
  };

  // ERPNext Integration
  erpNext: {
    baseUrl: string;
    apiVersion: string;
    authentication: {
      apiKey: string;
      apiSecret: string;
    };
    endpoints: {
      customers: string;
      items: string;
      salesOrders: string;
      inventory: string;
      pricing: string;
      territories: string;
    };
    syncInterval: number;
    batchSize: number;
  };

  // EspoCRM Integration
  espoCrm: {
    baseUrl: string;
    apiVersion: string;
    authentication: {
      username: string;
      password: string;
      apiKey?: string;
    };
    endpoints: {
      accounts: string;
      contacts: string;
      opportunities: string;
      activities: string;
      leads: string;
    };
    syncInterval: number;
  };

  // Flutter Sales App Integration
  flutterSalesApp: {
    apiEndpoints: {
      customers: string;
      routes: string;
      orders: string;
      analytics: string;
      sync: string;
    };
    offlineSync: {
      enabled: boolean;
      syncInterval: number;
      conflictResolution: 'server-wins' | 'client-wins' | 'merge';
    };
    realTimeUpdates: {
      enabled: boolean;
      websocketUrl: string;
      channels: string[];
    };
  };

  // B2C E-commerce Integration
  b2cEcommerce: {
    medusaIntegration: {
      baseUrl: string;
      publishableKey: string;
      adminApiKey: string;
    };
    syncSettings: {
      customerData: boolean;
      orderData: boolean;
      productCatalog: boolean;
      inventory: boolean;
    };
  };

  // Real-time Synchronization
  realTimeSync: {
    websocket: {
      url: string;
      reconnectInterval: number;
      maxReconnectAttempts: number;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
      db: number;
    };
    syncInterval: number;
    eventTypes: {
      customerUpdate: string;
      orderCreated: string;
      inventoryUpdate: string;
      priceChange: string;
      territoryUpdate: string;
    };
  };

  // Data Mapping Configuration
  dataMapping: {
    customerFields: {
      erpNext: Record<string, string>;
      espoCrm: Record<string, string>;
      b2bPortal: Record<string, string>;
      flutterApp: Record<string, string>;
    };
    productFields: {
      erpNext: Record<string, string>;
      medusa: Record<string, string>;
      b2bPortal: Record<string, string>;
    };
    orderFields: {
      erpNext: Record<string, string>;
      medusa: Record<string, string>;
      b2bPortal: Record<string, string>;
      flutterApp: Record<string, string>;
    };
  };

  // Security Configuration
  security: {
    encryption: {
      algorithm: string;
      keyRotationInterval: number;
    };
    authentication: {
      jwtSecret: string;
      tokenExpiry: number;
      refreshTokenExpiry: number;
    };
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
    };
  };

  // Monitoring and Logging
  monitoring: {
    healthCheck: {
      interval: number;
      timeout: number;
      endpoints: string[];
    };
    logging: {
      level: 'error' | 'warn' | 'info' | 'debug';
      destinations: ('console' | 'file' | 'database')[];
    };
    metrics: {
      enabled: boolean;
      endpoint: string;
      interval: number;
    };
  };
}

export const integrationConfig: IntegrationConfig = {
  apiGateway: {
    baseUrl: process.env.API_GATEWAY_URL || 'http://localhost:4000',
    port: parseInt(process.env.API_GATEWAY_PORT || '4000'),
    timeout: 30000,
    retryAttempts: 3,
    rateLimiting: {
      requestsPerMinute: 1000,
      burstLimit: 100,
    },
  },

  b2bPortal: {
    baseUrl: process.env.B2B_PORTAL_URL || 'http://localhost:3002',
    apiVersion: 'v1',
    authentication: {
      type: 'jwt',
      credentials: {
        clientId: process.env.B2B_CLIENT_ID,
        clientSecret: process.env.B2B_CLIENT_SECRET,
      },
    },
    endpoints: {
      customers: '/api/v1/customers',
      orders: '/api/v1/orders',
      products: '/api/v1/products',
      analytics: '/api/v1/analytics',
    },
    syncInterval: 300000, // 5 minutes
  },

  erpNext: {
    baseUrl: process.env.ERPNEXT_URL || 'http://localhost:8000',
    apiVersion: 'v1',
    authentication: {
      apiKey: process.env.ERPNEXT_API_KEY || '',
      apiSecret: process.env.ERPNEXT_API_SECRET || '',
    },
    endpoints: {
      customers: '/api/resource/Customer',
      items: '/api/resource/Item',
      salesOrders: '/api/resource/Sales Order',
      inventory: '/api/resource/Stock Ledger Entry',
      pricing: '/api/resource/Item Price',
      territories: '/api/resource/Territory',
    },
    syncInterval: 600000, // 10 minutes
    batchSize: 100,
  },

  espoCrm: {
    baseUrl: process.env.ESPOCRM_URL || 'http://localhost:8080',
    apiVersion: 'v1',
    authentication: {
      username: process.env.ESPOCRM_USERNAME || '',
      password: process.env.ESPOCRM_PASSWORD || '',
      apiKey: process.env.ESPOCRM_API_KEY,
    },
    endpoints: {
      accounts: '/api/v1/Account',
      contacts: '/api/v1/Contact',
      opportunities: '/api/v1/Opportunity',
      activities: '/api/v1/Activity',
      leads: '/api/v1/Lead',
    },
    syncInterval: 900000, // 15 minutes
  },

  flutterSalesApp: {
    apiEndpoints: {
      customers: '/api/mobile/customers',
      routes: '/api/mobile/routes',
      orders: '/api/mobile/orders',
      analytics: '/api/mobile/analytics',
      sync: '/api/mobile/sync',
    },
    offlineSync: {
      enabled: true,
      syncInterval: 60000, // 1 minute when online
      conflictResolution: 'server-wins',
    },
    realTimeUpdates: {
      enabled: true,
      websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3001/ws',
      channels: ['customer-updates', 'order-updates', 'inventory-updates'],
    },
  },

  b2cEcommerce: {
    medusaIntegration: {
      baseUrl: process.env.MEDUSA_URL || 'http://localhost:9000',
      publishableKey: process.env.MEDUSA_PUBLISHABLE_KEY || '',
      adminApiKey: process.env.MEDUSA_ADMIN_API_KEY || '',
    },
    syncSettings: {
      customerData: true,
      orderData: true,
      productCatalog: true,
      inventory: true,
    },
  },

  realTimeSync: {
    websocket: {
      url: process.env.WEBSOCKET_URL || 'ws://localhost:8080',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_SYNC_DB || '1'),
    },
    syncInterval: parseInt(process.env.SYNC_INTERVAL || '300000'), // 5 minutes
    eventTypes: {
      customerUpdate: 'customer.updated',
      orderCreated: 'order.created',
      inventoryUpdate: 'inventory.updated',
      priceChange: 'price.changed',
      territoryUpdate: 'territory.updated',
    },
  },

  dataMapping: {
    customerFields: {
      erpNext: {
        id: 'name',
        name: 'customer_name',
        email: 'email_id',
        phone: 'mobile_no',
        territory: 'territory',
        customerGroup: 'customer_group',
      },
      espoCrm: {
        id: 'id',
        name: 'name',
        email: 'emailAddress',
        phone: 'phoneNumber',
        territory: 'assignedUser',
        type: 'type',
      },
      b2bPortal: {
        id: 'id',
        name: 'companyName',
        email: 'email',
        phone: 'phone',
        territory: 'territory',
        tier: 'customerTier',
      },
      flutterApp: {
        id: 'id',
        name: 'name',
        email: 'email',
        phone: 'phone',
        territory: 'territory',
        tier: 'tier',
      },
    },
    productFields: {
      erpNext: {
        id: 'name',
        title: 'item_name',
        description: 'description',
        price: 'standard_rate',
        category: 'item_group',
        stock: 'actual_qty',
      },
      medusa: {
        id: 'id',
        title: 'title',
        description: 'description',
        price: 'amount',
        category: 'product_category_id',
        stock: 'inventory_quantity',
      },
      b2bPortal: {
        id: 'id',
        title: 'name',
        description: 'description',
        price: 'price',
        category: 'category',
        stock: 'stock',
      },
    },
    orderFields: {
      erpNext: {
        id: 'name',
        customer: 'customer',
        total: 'grand_total',
        status: 'status',
        date: 'transaction_date',
        items: 'items',
      },
      medusa: {
        id: 'id',
        customer: 'customer_id',
        total: 'total',
        status: 'fulfillment_status',
        date: 'created_at',
        items: 'items',
      },
      b2bPortal: {
        id: 'id',
        customer: 'customerId',
        total: 'totalAmount',
        status: 'status',
        date: 'createdAt',
        items: 'orderItems',
      },
      flutterApp: {
        id: 'id',
        customer: 'customerId',
        total: 'totalAmount',
        status: 'status',
        date: 'createdAt',
        items: 'items',
      },
    },
  },

  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotationInterval: 86400000, // 24 hours
    },
    authentication: {
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      tokenExpiry: 3600, // 1 hour
      refreshTokenExpiry: 604800, // 7 days
    },
    rateLimiting: {
      windowMs: 900000, // 15 minutes
      maxRequests: 1000,
    },
  },

  monitoring: {
    healthCheck: {
      interval: 30000, // 30 seconds
      timeout: 5000,
      endpoints: [
        '/health/erpnext',
        '/health/espocrm',
        '/health/b2b-portal',
        '/health/medusa',
      ],
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      destinations: ['console', 'file'],
    },
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      interval: 60000, // 1 minute
    },
  },
};

export default integrationConfig;

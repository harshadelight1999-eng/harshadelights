<?php
/**
 * EspoCRM Configuration for Harsha Delights Confectionery Business
 * Customized for B2B/B2C operations, inventory management, and Indian business requirements
 */

return [
    'database' => [
        'driver' => 'pdo_mysql',
        'host' => 'espocrm_db',
        'port' => '3306',
        'charset' => 'utf8mb4',
        'dbname' => 'harsha_espocrm',
        'user' => 'espocrm_user',
        'password' => 'HarshaEspo2024!'
    ],

    'language' => 'en_US',
    'logger' => [
        'path' => 'data/logs/espo.log',
        'level' => 'WARNING',
        'rotation' => true,
        'maxFileNumber' => 30,
        'printTrace' => false
    ],

    'defaultPermissions' => [
        'user' => 644,
        'group' => 755
    ],

    // Site Configuration for Harsha Delights
    'siteUrl' => 'https://crm.harshadelights.com',
    'applicationName' => 'Harsha Delights CRM',
    'version' => '7.5.0',
    'timeZone' => 'Asia/Kolkata',

    // Localization Settings for India
    'dateFormat' => 'DD/MM/YYYY',
    'timeFormat' => 'HH:mm',
    'weekStart' => 1, // Monday
    'fiscalYearShift' => 3, // April start (Indian fiscal year)
    'defaultCurrency' => 'INR',

    // Business Configuration
    'companyName' => 'Harsha Delights',
    'companyAddress' => 'Mumbai, Maharashtra, India',
    'companyLogoId' => null,

    // Email Configuration
    'outboundEmailFromName' => 'Harsha Delights CRM',
    'outboundEmailFromAddress' => 'noreply@harshadelights.com',
    'outboundEmailIsShared' => true,

    'smtpServer' => 'smtp.gmail.com',
    'smtpPort' => 587,
    'smtpSecurity' => 'TLS',
    'smtpUsername' => 'noreply@harshadelights.com',

    // Authentication & Security
    'authenticationMethod' => 'Espo',
    'passwordSalt' => 'harsha_delights_salt_2024',
    'cryptKey' => 'harsha_delights_crypt_key_2024',
    'hashSecretKey' => 'harsha_delights_hash_secret_2024',

    // Session Configuration with Redis
    'useCache' => true,
    'cacheTimestamp' => 1695168000,
    'recordsPerPage' => 20,
    'recordsPerPageSmall' => 5,
    'recordsPerPageSelect' => 10,

    // Cache Configuration
    'cache' => [
        'implementation' => 'Redis',
        'redis' => [
            'host' => 'espocrm_redis',
            'port' => 6379,
            'password' => 'HarshaRedis2024!',
            'timeout' => 0.0
        ]
    ],

    // Job Configuration for Background Processing
    'jobMaxPortion' => 15,
    'jobPeriod' => 7800,
    'jobRerunAttemptNumber' => 1,
    'jobRunInParallel' => true,
    'jobPoolConcurrencyNumber' => 8,

    // File Upload Configuration
    'maxEmailSize' => 30,
    'personalEmailMaxPortionSize' => 50,
    'inboundEmailMaxPortionSize' => 50,
    'emailAddressLookupEntityTypeList' => ['User', 'Contact', 'Lead', 'Account'],

    // Notification Configuration
    'assignmentEmailNotifications' => true,
    'assignmentEmailNotificationsEntityList' => ['Lead', 'Opportunity', 'Task', 'Case'],
    'streamEmailNotifications' => false,
    'portalStreamEmailNotifications' => true,
    'emailNotificationsDelay' => 30,

    // Export/Import Configuration
    'exportDisabled' => false,
    'importDisabled' => false,
    'exportDelimiter' => ',',
    'exportBomForCsv' => false,

    // Mass Email Configuration
    'massEmailMaxAttemptCount' => 3,
    'massEmailSiteUrl' => 'https://crm.harshadelights.com',

    // API Configuration
    'apiPath' => '/api/v1',
    'authTokenLifetime' => 0,
    'authTokenMaxIdleTime' => 48,

    // WebSocket Configuration
    'useWebSocket' => true,
    'webSocketUrl' => 'ws://localhost:8081',
    'webSocketSslVerifyPeer' => false,

    // Search Configuration with Elasticsearch
    'textFilterUseContainsForVarchar' => true,
    'globalSearchEntityList' => [
        'Account', 'Contact', 'Lead', 'Opportunity',
        'Product', 'InventoryItem', 'PurchaseOrder', 'SalesOrder'
    ],
    'useFullTextSearch' => true,
    'fullTextSearchMinLength' => 4,
    'searchEngine' => 'Elasticsearch',
    'elasticsearchHost' => 'espocrm_elasticsearch',
    'elasticsearchPort' => 9200,

    // Confectionery Business Specific Settings
    'businessType' => 'confectionery',
    'enableInventoryManagement' => true,
    'enableBatchTracking' => true,
    'enableExpiryManagement' => true,
    'enableMultiWarehouse' => true,
    'enableQualityControl' => true,

    // Customer Segmentation Settings
    'enableB2BSegmentation' => true,
    'enableB2CSegmentation' => true,
    'customerTypes' => [
        'b2b' => [
            'shops_retailers',
            'wholesalers',
            'middlemen_distributors',
            'event_planners',
            'product_dealers',
            'vendors'
        ],
        'b2c' => [
            'individual_consumers',
            'bulk_individual_orders',
            'subscription_customers'
        ]
    ],

    // Pricing Engine Configuration
    'enableDynamicPricing' => true,
    'pricingFactors' => [
        'customer_type',
        'quantity_breaks',
        'seasonal_adjustments',
        'geographic_variations',
        'promotional_pricing',
        'contract_rates'
    ],

    // Inventory Management Settings
    'inventoryValuationMethod' => 'FIFO',
    'enableAutomaticReorderPoints' => true,
    'enableBarcodeScanning' => true,
    'defaultExpiryWarningDays' => 30,
    'enableLotTracking' => true,

    // Financial Settings (Indian Business)
    'enableGSTManagement' => true,
    'gstNumber' => 'HARSHA_GST_NUMBER',
    'enableHSNCodeManagement' => true,
    'defaultGSTRate' => 18.0,
    'enableTDSManagement' => true,

    // Order Processing Configuration
    'enableOrderWorkflow' => true,
    'orderStages' => [
        'draft',
        'confirmed',
        'in_production',
        'quality_check',
        'packed',
        'shipped',
        'delivered',
        'completed'
    ],

    // Quality Control Settings
    'enableQualityWorkflow' => true,
    'qualityCheckStages' => [
        'incoming_inspection',
        'in_process_check',
        'final_inspection',
        'approved',
        'rejected'
    ],

    // Partner Management (Production Partners)
    'enablePartnerManagement' => true,
    'partnerTypes' => [
        'manufacturing_partner',
        'co_packer',
        'ingredient_supplier',
        'packaging_supplier'
    ],

    // Delivery & Logistics
    'enableDeliveryManagement' => true,
    'deliveryMethods' => [
        'self_delivery',
        'third_party_logistics',
        'courier_service',
        'pickup'
    ],

    // Compliance & Certifications
    'enableComplianceManagement' => true,
    'requiredCertifications' => [
        'FSSAI',
        'ISO22000',
        'HACCP',
        'ORGANIC'
    ],

    // Multi-language Support
    'multiLanguageEnabled' => true,
    'supportedLanguages' => ['en_US', 'hi_IN', 'mr_IN'],

    // Dashboard Configuration
    'dashboardLayout' => [
        'sales_overview',
        'inventory_status',
        'order_pipeline',
        'quality_alerts',
        'expiry_warnings',
        'financial_summary'
    ],

    // Mobile App Configuration
    'mobileAppEnabled' => true,
    'mobileFeatures' => [
        'order_entry',
        'inventory_check',
        'customer_management',
        'delivery_tracking',
        'quality_reporting'
    ],

    // Integration Settings
    'enableERPNextIntegration' => true,
    'enableEcommerceIntegration' => true,
    'enableAccountingIntegration' => true,
    'enablePaymentGatewayIntegration' => true,

    // Backup Configuration
    'backupPeriod' => '1 Day',
    'backupTime' => '02:00',
    'backupRetentionDays' => 30,

    // Performance Optimization
    'cleanupJobPeriod' => '1 Day',
    'cleanupActionHistoryPeriod' => '15 days',
    'cleanupAuthTokenPeriod' => '1 Month',
    'aclCacheTimestamp' => 1695168000,

    // Theme Configuration
    'theme' => 'HarshaDelights',
    'themeParams' => [
        'primaryColor' => '#D2691E',  // Chocolate Orange
        'secondaryColor' => '#8B4513', // Saddle Brown
        'successColor' => '#228B22',   // Forest Green
        'dangerColor' => '#DC143C',    // Crimson
        'warningColor' => '#FFD700',   // Gold
        'infoColor' => '#4169E1'       // Royal Blue
    ],

    // Custom Field Types for Confectionery Business
    'customFieldTypes' => [
        'ingredientList',
        'nutritionalInfo',
        'allergenInfo',
        'shelfLife',
        'storageConditions',
        'batchNumber',
        'qualityGrade'
    ],

    // Workflow Automation
    'workflowEnabled' => true,
    'automatedWorkflows' => [
        'order_confirmation',
        'inventory_reorder',
        'quality_alert',
        'expiry_notification',
        'payment_reminder',
        'delivery_update'
    ]
];
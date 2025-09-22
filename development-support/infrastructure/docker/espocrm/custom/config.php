<?php
/**
 * =====================================================================================
 * HARSHA DELIGHTS ESPOCRM CUSTOM CONFIGURATION
 * =====================================================================================
 * This file contains custom configuration settings for EspoCRM to integrate
 * with the Harsha Delights confectionery system
 * =====================================================================================
 */

return [
    // Database Configuration
    'database' => [
        'driver' => 'pdo_mysql',
        'host' => 'mariadb',
        'port' => '3306',
        'charset' => 'utf8mb4',
        'dbname' => 'espocrm_hd',
        'user' => 'espocrm_user',
        'password' => 'espocrm_pass_2024',
        'sslCA' => null,
        'sslCert' => null,
        'sslKey' => null,
        'sslCaPath' => null,
        'sslCipher' => null
    ],

    // System Configuration
    'logger' => [
        'path' => 'data/logs/espo.log',
        'level' => 'WARNING', // DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL, ALERT, EMERGENCY
        'rotation' => true,
        'maxFileNumber' => 30,
        'printTrace' => false
    ],

    // Cache Configuration
    'useCache' => true,
    'cacheTimestamp' => false,
    'recordsPerPage' => 20,
    'recordsPerPageSmall' => 5,
    'recordsPerPageSelect' => 10,
    'recordsPerPageKanban' => 5,

    // Application Settings
    'applicationName' => 'Harsha Delights CRM',
    'version' => '1.0.0',
    'timeZone' => 'UTC',
    'dateFormat' => 'DD.MM.YYYY',
    'timeFormat' => 'HH:mm',
    'weekStart' => 1,
    'thousandSeparator' => ',',
    'decimalMark' => '.',
    'currencyList' => ['USD', 'EUR', 'INR'],
    'defaultCurrency' => 'INR',
    'baseCurrency' => 'INR',
    'currencyRates' => [],
    'currencyNoJoinMode' => false,
    'displayListViewRecordCount' => true,
    'dashboardLayout' => [
        (object) [
            'name' => 'My Espo',
            'layout' => [
                (object) [
                    'id' => 'default-activities',
                    'name' => 'Activities',
                    'x' => 2,
                    'y' => 2,
                    'width' => 2,
                    'height' => 4
                ],
                (object) [
                    'id' => 'default-stream',
                    'name' => 'Stream',
                    'x' => 0,
                    'y' => 0,
                    'width' => 2,
                    'height' => 4
                ]
            ]
        ]
    ],

    // Security Settings
    'authenticationMethod' => 'Espo',
    'auth2FA' => false,
    'passwordRecovery' => true,
    'passwordRecoveryForAdminDisabled' => false,
    'passwordRecoveryForInternalUsersDisabled' => false,
    'passwordRecoveryNoExposure' => false,
    'passwordGenerateLength' => 10,
    'passwordStrengthLength' => 6,
    'passwordStrengthLetterCount' => 1,
    'passwordStrengthNumberCount' => 1,
    'passwordStrengthBothCases' => false,
    'authTokenLifetime' => 0,
    'authTokenMaxIdleTime' => 120,

    // Email Configuration
    'emailKeepParentTeamsEntityList' => ['Case'],
    'emailForceSendingToAssignedUser' => false,
    'emailTemplateHtmlizerDisabled' => false,
    'emailAddressLookupEntityTypeList' => ['User'],
    'emailAddressSelectEntityTypeList' => ['User', 'Contact', 'Lead', 'Account'],
    'emailNotificationsDelay' => 30,
    'emailNotificationsDelayForUsers' => [],

    // Mass Email Settings
    'massEmailMaxPerHourCount' => 100,
    'massEmailVerp' => false,
    'massEmailDisableMandatoryOptOutLink' => false,

    // Integration Settings
    'integrations' => [
        'ERPNext' => [
            'enabled' => true,
            'url' => 'http://erpnext:8000',
            'apiKey' => '',
            'apiSecret' => '',
            'syncCustomers' => true,
            'syncContacts' => true,
            'syncAccounts' => true,
            'syncLeads' => true,
            'syncInterval' => 300000 // 5 minutes
        ],
        'WhatsApp' => [
            'enabled' => false,
            'apiUrl' => '',
            'apiKey' => ''
        ]
    ],

    // Custom Entity Settings for Confectionery Business
    'customEntityTypes' => [
        'ProductCatalog' => [
            'enabled' => true,
            'fields' => [
                'productCode',
                'productName',
                'category',
                'subCategory',
                'brand',
                'weight',
                'ingredients',
                'allergens',
                'nutritionalInfo',
                'shelfLife',
                'storageConditions',
                'minimumOrderQuantity',
                'wholesalePrice',
                'retailPrice',
                'isActive'
            ]
        ],
        'CustomerSegment' => [
            'enabled' => true,
            'fields' => [
                'segmentCode',
                'segmentName',
                'description',
                'customerType',
                'discountPercentage',
                'minimumOrderAmount',
                'paymentTerms',
                'territory'
            ]
        ],
        'QualityControl' => [
            'enabled' => true,
            'fields' => [
                'batchNumber',
                'productCode',
                'testDate',
                'qualityGrade',
                'testResults',
                'certificationStatus',
                'expiryDate',
                'storageConditions'
            ]
        ]
    ],

    // Workflow Settings
    'workflowMaxDepth' => 15,
    'workflowVariablesEnabled' => true,

    // Import/Export Settings
    'importMaxFileSize' => '50M',
    'exportMaxFileSize' => '50M',
    'importDelimiter' => ',',
    'importEnclosure' => '"',

    // File Upload Settings
    'maxFileSize' => '50M',
    'fileStorageImplementation' => 'EspoUploadDir',
    'inlineAttachmentUploadMaxSize' => 20,

    // Notification Settings
    'adminNotifications' => true,
    'adminNotificationsNewVersion' => true,
    'adminNotificationsCronIsNotConfigured' => true,
    'adminNotificationsNewExtensionVersion' => true,

    // Performance Settings
    'cleanupJobPeriod' => '1 month',
    'cleanupActionHistoryPeriod' => '15 days',
    'cleanupAuthTokenPeriod' => '1 month',
    'cleanupAuthLogPeriod' => '2 months',
    'cleanupNotificationsPeriod' => '2 months',
    'cleanupAttachmentsPeriod' => '15 days',
    'cleanupBackupPeriod' => '2 months',
    'cleanupDeletedRecordsPeriod' => '3 months',

    // Stream Settings
    'recordsPerPageStream' => 20,
    'noteDeleteThresholdPeriod' => '1 month',
    'noteEditThresholdPeriod' => '7 days',

    // Kanban Settings
    'kanbanMaxOrderNumber' => 50,

    // Calendar Settings
    'calendarEntityList' => ['Meeting', 'Call', 'Task'],
    'activitiesEntityList' => ['Meeting', 'Call'],
    'historyEntityList' => ['Meeting', 'Call', 'Email'],

    // API Settings
    'apiRealEntitiesOnly' => false,

    // Language Settings
    'language' => 'en_US',
    'languageList' => ['en_US'],

    // Theme Settings
    'theme' => 'Espo',
    'themeParams' => (object) [],
    'darkTheme' => 'EspoDark',

    // Avatar Settings
    'avatarsDisabled' => false,

    // Maps Settings
    'googleMapsApiKey' => '',
    'defaultMapsProvider' => 'Google',

    // SMS Settings
    'smsProvider' => '',

    // Job Settings
    'jobMaxPortion' => 15,
    'jobMaxRunTime' => 7200,
    'jobPeriod' => 7200,
    'jobPeriodForActiveProcess' => 36000,
    'jobRerunAttemptNumber' => 1,
    'jobRunInParallel' => false,
    'cronMinInterval' => 2,

    // Formula Settings
    'formulaMaxProcessTime' => 10,

    // Layout Settings
    'layoutCacheDisabled' => false,

    // Development Settings
    'isDeveloperMode' => false,
    'isInstalled' => true,
    'microtimeInternal' => 1640995200.123456,

    // Custom Business Logic for Harsha Delights
    'harshaDelights' => [
        'businessType' => 'confectionery',
        'supportedCustomerTypes' => [
            'retail',
            'wholesale',
            'distributor',
            'vendor',
            'event_planner',
            'individual'
        ],
        'productCategories' => [
            'sweets',
            'chocolates',
            'namkeens',
            'dry_fruits',
            'buns',
            'cookies',
            'raw_materials'
        ],
        'qualityGrades' => ['A', 'B', 'C'],
        'defaultPaymentTerms' => '30 days',
        'minimumOrderAmounts' => [
            'retail' => 500,
            'wholesale' => 10000,
            'distributor' => 25000
        ],
        'territories' => [
            'local',
            'domestic',
            'international'
        ]
    ]
];
?>
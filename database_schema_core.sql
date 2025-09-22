-- =====================================================================================
-- HARSHA DELIGHTS CONFECTIONERY SYSTEM - CORE DATABASE SCHEMA
-- =====================================================================================
-- This file contains DDL scripts for the three primary databases:
-- 1. ERPNext Extensions (MariaDB)
-- 2. API Gateway Database (PostgreSQL)
-- 3. Sync Database (PostgreSQL)
-- =====================================================================================

-- =====================================================================================
-- 1. ERPNEXT EXTENSIONS DATABASE (MariaDB)
-- =====================================================================================
-- These tables extend the existing ERPNext schema for confectionery-specific operations

-- Create database (if needed)
-- CREATE DATABASE erpnext_hd DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE erpnext_hd;

-- HD Customer Segment Extensions
-- =====================================================================================

-- Customer Segment Master
CREATE TABLE IF NOT EXISTS `tabHD Customer Segment` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,

    -- Core fields
    `segment_code` VARCHAR(20) NOT NULL UNIQUE,
    `segment_name` VARCHAR(100) NOT NULL,
    `segment_description` TEXT NULL,
    `segment_type` VARCHAR(30) NOT NULL, -- 'geographic', 'demographic', 'behavioral', 'psychographic'
    `priority_level` INT(1) NOT NULL DEFAULT 3, -- 1=High, 2=Medium, 3=Low
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,

    -- Pricing configuration
    `default_price_list` VARCHAR(140) NULL,
    `discount_percentage` DECIMAL(8,3) NULL DEFAULT 0.000,
    `minimum_order_amount` DECIMAL(18,6) NULL DEFAULT 0.000,
    `credit_limit_multiplier` DECIMAL(8,3) NOT NULL DEFAULT 1.000,

    -- Business rules
    `payment_terms` VARCHAR(140) NULL,
    `default_sales_person` VARCHAR(140) NULL,
    `territory` VARCHAR(140) NULL,
    `customer_group` VARCHAR(140) NULL,

    -- Metadata
    `created_by` VARCHAR(140) NULL,
    `last_updated_by` VARCHAR(140) NULL,
    `segment_notes` TEXT NULL,

    INDEX idx_segment_code (`segment_code`),
    INDEX idx_segment_type (`segment_type`),
    INDEX idx_priority_level (`priority_level`),
    INDEX idx_is_active (`is_active`),
    INDEX idx_territory (`territory`),
    INDEX idx_customer_group (`customer_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer Segment Assignment (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS `tabHD Customer Segment Assignment` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,

    -- Core fields
    `customer` VARCHAR(140) NOT NULL,
    `customer_segment` VARCHAR(140) NOT NULL,
    `assignment_date` DATE NOT NULL,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
    `assignment_reason` VARCHAR(200) NULL,
    `assigned_by` VARCHAR(140) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Inactive', 'Expired'

    -- Performance metrics
    `total_orders` INT(11) NULL DEFAULT 0,
    `total_revenue` DECIMAL(18,6) NULL DEFAULT 0.000,
    `last_order_date` DATE NULL,
    `avg_order_value` DECIMAL(18,6) NULL DEFAULT 0.000,

    UNIQUE KEY unique_customer_segment (`customer`, `customer_segment`, `effective_from`),
    INDEX idx_customer (`customer`),
    INDEX idx_customer_segment (`customer_segment`),
    INDEX idx_assignment_date (`assignment_date`),
    INDEX idx_effective_from (`effective_from`),
    INDEX idx_effective_to (`effective_to`),
    INDEX idx_is_primary (`is_primary`),
    INDEX idx_status (`status`),

    FOREIGN KEY (`customer`) REFERENCES `tabCustomer`(`name`) ON DELETE CASCADE,
    FOREIGN KEY (`customer_segment`) REFERENCES `tabHD Customer Segment`(`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HD Batch Master for Inventory Tracking
-- =====================================================================================

-- Enhanced Batch Master for confectionery products
CREATE TABLE IF NOT EXISTS `tabHD Batch Master` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,

    -- Core batch information
    `batch_id` VARCHAR(50) NOT NULL UNIQUE,
    `item` VARCHAR(140) NOT NULL,
    `item_name` VARCHAR(200) NULL,
    `warehouse` VARCHAR(140) NOT NULL,
    `supplier` VARCHAR(140) NULL,
    `supplier_batch_id` VARCHAR(100) NULL,

    -- Production details
    `manufacturing_date` DATE NOT NULL,
    `expiry_date` DATE NOT NULL,
    `best_before_date` DATE NULL,
    `production_line` VARCHAR(50) NULL,
    `production_shift` VARCHAR(20) NULL,
    `quality_grade` VARCHAR(20) NOT NULL DEFAULT 'A', -- A, B, C grades

    -- Quantity tracking
    `total_qty` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `available_qty` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `reserved_qty` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `sold_qty` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `damaged_qty` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `expired_qty` DECIMAL(18,6) NOT NULL DEFAULT 0.000,

    -- Cost and pricing
    `unit_cost` DECIMAL(18,6) NULL DEFAULT 0.000,
    `total_cost` DECIMAL(18,6) NULL DEFAULT 0.000,
    `landed_cost_per_unit` DECIMAL(18,6) NULL DEFAULT 0.000,

    -- Confectionery specific fields
    `sugar_content_percentage` DECIMAL(5,2) NULL,
    `fat_content_percentage` DECIMAL(5,2) NULL,
    `moisture_content_percentage` DECIMAL(5,2) NULL,
    `storage_temperature_min` DECIMAL(5,2) NULL,
    `storage_temperature_max` DECIMAL(5,2) NULL,
    `storage_humidity_max` DECIMAL(5,2) NULL,

    -- Quality control
    `quality_tested` TINYINT(1) NOT NULL DEFAULT 0,
    `quality_test_date` DATE NULL,
    `quality_notes` TEXT NULL,
    `allergen_info` TEXT NULL,
    `nutritional_info` JSON NULL,

    -- Status and lifecycle
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Expired', 'Recalled', 'Damaged'
    `batch_notes` TEXT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,

    INDEX idx_batch_id (`batch_id`),
    INDEX idx_item (`item`),
    INDEX idx_warehouse (`warehouse`),
    INDEX idx_supplier (`supplier`),
    INDEX idx_manufacturing_date (`manufacturing_date`),
    INDEX idx_expiry_date (`expiry_date`),
    INDEX idx_quality_grade (`quality_grade`),
    INDEX idx_status (`status`),
    INDEX idx_available_qty (`available_qty`),
    INDEX idx_item_warehouse (`item`, `warehouse`),
    INDEX idx_expiry_status (`expiry_date`, `status`),

    FOREIGN KEY (`item`) REFERENCES `tabItem`(`name`) ON DELETE CASCADE,
    FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse`(`name`) ON DELETE CASCADE,
    FOREIGN KEY (`supplier`) REFERENCES `tabSupplier`(`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Batch Movement Tracking
CREATE TABLE IF NOT EXISTS `tabHD Batch Movement` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,

    -- Movement details
    `batch_id` VARCHAR(140) NOT NULL,
    `movement_type` VARCHAR(30) NOT NULL, -- 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'
    `movement_date` DATETIME(6) NOT NULL,
    `reference_doctype` VARCHAR(100) NULL,
    `reference_name` VARCHAR(140) NULL,

    -- Quantity changes
    `qty_before` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `qty_change` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `qty_after` DECIMAL(18,6) NOT NULL DEFAULT 0.000,

    -- Location details
    `from_warehouse` VARCHAR(140) NULL,
    `to_warehouse` VARCHAR(140) NULL,
    `from_location` VARCHAR(200) NULL,
    `to_location` VARCHAR(200) NULL,

    -- Additional context
    `reason` VARCHAR(200) NULL,
    `notes` TEXT NULL,
    `operator` VARCHAR(140) NULL,

    INDEX idx_batch_id (`batch_id`),
    INDEX idx_movement_type (`movement_type`),
    INDEX idx_movement_date (`movement_date`),
    INDEX idx_reference (`reference_doctype`, `reference_name`),
    INDEX idx_from_warehouse (`from_warehouse`),
    INDEX idx_to_warehouse (`to_warehouse`),

    FOREIGN KEY (`batch_id`) REFERENCES `tabHD Batch Master`(`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HD Dynamic Pricing Rules
-- =====================================================================================

-- Pricing Rule Master with advanced conditions
CREATE TABLE IF NOT EXISTS `tabHD Dynamic Pricing Rule` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,

    -- Rule identification
    `rule_code` VARCHAR(30) NOT NULL UNIQUE,
    `rule_name` VARCHAR(150) NOT NULL,
    `rule_description` TEXT NULL,
    `rule_type` VARCHAR(30) NOT NULL, -- 'discount', 'markup', 'fixed_price', 'tiered'
    `priority` INT(3) NOT NULL DEFAULT 1, -- Higher number = higher priority

    -- Validity period
    `valid_from` DATETIME(6) NOT NULL,
    `valid_to` DATETIME(6) NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,

    -- Application scope
    `apply_on` VARCHAR(30) NOT NULL, -- 'Item Code', 'Item Group', 'Brand', 'Customer', 'Customer Group'
    `applicable_for` VARCHAR(30) NOT NULL, -- 'Customer', 'Customer Group', 'Territory', 'Sales Person'

    -- Conditions
    `min_qty` DECIMAL(18,6) NULL DEFAULT 0.000,
    `max_qty` DECIMAL(18,6) NULL,
    `min_amount` DECIMAL(18,6) NULL DEFAULT 0.000,
    `max_amount` DECIMAL(18,6) NULL,
    `for_price_list` VARCHAR(140) NULL,
    `warehouse` VARCHAR(140) NULL,

    -- Time-based conditions
    `day_of_week` VARCHAR(20) NULL, -- JSON array: ["Monday", "Tuesday"]
    `time_from` TIME NULL,
    `time_to` TIME NULL,
    `seasonal_applicable` TINYINT(1) NOT NULL DEFAULT 0,
    `festival_applicable` TINYINT(1) NOT NULL DEFAULT 0,

    -- Pricing calculation
    `rate_or_discount` VARCHAR(20) NOT NULL DEFAULT 'Discount Percentage', -- 'Rate', 'Discount Percentage', 'Discount Amount'
    `rate` DECIMAL(18,6) NULL DEFAULT 0.000,
    `discount_percentage` DECIMAL(8,3) NULL DEFAULT 0.000,
    `discount_amount` DECIMAL(18,6) NULL DEFAULT 0.000,

    -- Advanced pricing
    `compound_discount` TINYINT(1) NOT NULL DEFAULT 0,
    `mixed_conditions` TINYINT(1) NOT NULL DEFAULT 0,
    `threshold_for_suggestion` DECIMAL(18,6) NULL,

    -- Business rules
    `validate_applied_rule` TINYINT(1) NOT NULL DEFAULT 1,
    `selling` TINYINT(1) NOT NULL DEFAULT 1,
    `buying` TINYINT(1) NOT NULL DEFAULT 0,

    -- Status and metadata
    `rule_status` VARCHAR(20) NOT NULL DEFAULT 'Active',
    `created_by` VARCHAR(140) NULL,
    `approved_by` VARCHAR(140) NULL,
    `approval_date` DATE NULL,
    `usage_count` INT(11) NOT NULL DEFAULT 0,
    `total_discount_given` DECIMAL(18,6) NOT NULL DEFAULT 0.000,

    INDEX idx_rule_code (`rule_code`),
    INDEX idx_rule_type (`rule_type`),
    INDEX idx_priority (`priority`),
    INDEX idx_valid_from (`valid_from`),
    INDEX idx_valid_to (`valid_to`),
    INDEX idx_is_active (`is_active`),
    INDEX idx_apply_on (`apply_on`),
    INDEX idx_applicable_for (`applicable_for`),
    INDEX idx_for_price_list (`for_price_list`),
    INDEX idx_rule_status (`rule_status`),
    INDEX idx_priority_active (`priority`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pricing Rule Items (for item-specific rules)
CREATE TABLE IF NOT EXISTS `tabHD Pricing Rule Item` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,
    `parent` VARCHAR(140) NOT NULL,
    `parentfield` VARCHAR(140) NOT NULL DEFAULT 'items',
    `parenttype` VARCHAR(140) NOT NULL DEFAULT 'HD Dynamic Pricing Rule',

    -- Item details
    `item_code` VARCHAR(140) NOT NULL,
    `item_name` VARCHAR(200) NULL,
    `item_group` VARCHAR(140) NULL,
    `brand` VARCHAR(140) NULL,
    `uom` VARCHAR(50) NULL,

    -- Item-specific pricing
    `rate` DECIMAL(18,6) NULL DEFAULT 0.000,
    `discount_percentage` DECIMAL(8,3) NULL DEFAULT 0.000,
    `min_qty` DECIMAL(18,6) NULL DEFAULT 0.000,
    `max_qty` DECIMAL(18,6) NULL,

    INDEX idx_parent (`parent`),
    INDEX idx_item_code (`item_code`),
    INDEX idx_item_group (`item_group`),
    INDEX idx_brand (`brand`),

    FOREIGN KEY (`parent`) REFERENCES `tabHD Dynamic Pricing Rule`(`name`) ON DELETE CASCADE,
    FOREIGN KEY (`item_code`) REFERENCES `tabItem`(`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pricing Rule Application Log
CREATE TABLE IF NOT EXISTS `tabHD Pricing Rule Application` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,

    -- Application details
    `pricing_rule` VARCHAR(140) NOT NULL,
    `applied_on_doctype` VARCHAR(100) NOT NULL,
    `applied_on_name` VARCHAR(140) NOT NULL,
    `application_date` DATETIME(6) NOT NULL,

    -- Transaction details
    `customer` VARCHAR(140) NULL,
    `item_code` VARCHAR(140) NULL,
    `qty` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `rate` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `original_rate` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `discount_amount` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `total_amount` DECIMAL(18,6) NOT NULL DEFAULT 0.000,

    -- Validation
    `validation_status` VARCHAR(20) NOT NULL DEFAULT 'Applied',
    `validation_notes` TEXT NULL,
    `applied_by` VARCHAR(140) NULL,

    INDEX idx_pricing_rule (`pricing_rule`),
    INDEX idx_applied_on (`applied_on_doctype`, `applied_on_name`),
    INDEX idx_application_date (`application_date`),
    INDEX idx_customer (`customer`),
    INDEX idx_item_code (`item_code`),
    INDEX idx_validation_status (`validation_status`),

    FOREIGN KEY (`pricing_rule`) REFERENCES `tabHD Dynamic Pricing Rule`(`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cross-reference Tables
-- =====================================================================================

-- Customer-Territory Cross Reference for multi-territorial customers
CREATE TABLE IF NOT EXISTS `tabHD Customer Territory Mapping` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,

    -- Mapping details
    `customer` VARCHAR(140) NOT NULL,
    `territory` VARCHAR(140) NOT NULL,
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `mapping_reason` VARCHAR(200) NULL,

    -- Business metrics
    `delivery_preference` VARCHAR(50) NULL,
    `sales_person` VARCHAR(140) NULL,
    `delivery_cost_factor` DECIMAL(8,3) NOT NULL DEFAULT 1.000,
    `service_level` VARCHAR(30) NULL, -- 'Standard', 'Premium', 'Express'

    UNIQUE KEY unique_customer_territory (`customer`, `territory`, `effective_from`),
    INDEX idx_customer (`customer`),
    INDEX idx_territory (`territory`),
    INDEX idx_is_primary (`is_primary`),
    INDEX idx_effective_from (`effective_from`),
    INDEX idx_sales_person (`sales_person`),

    FOREIGN KEY (`customer`) REFERENCES `tabCustomer`(`name`) ON DELETE CASCADE,
    FOREIGN KEY (`territory`) REFERENCES `tabTerritory`(`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Item-Warehouse Optimization Cross Reference
CREATE TABLE IF NOT EXISTS `tabHD Item Warehouse Optimization` (
    `name` VARCHAR(140) NOT NULL PRIMARY KEY,
    `creation` DATETIME(6) NOT NULL,
    `modified` DATETIME(6) NOT NULL,
    `modified_by` VARCHAR(140) NULL,
    `owner` VARCHAR(140) NULL,
    `docstatus` INT(1) NOT NULL DEFAULT 0,
    `idx` INT(8) NOT NULL DEFAULT 0,

    -- Core relationship
    `item_code` VARCHAR(140) NOT NULL,
    `warehouse` VARCHAR(140) NOT NULL,
    `territory` VARCHAR(140) NULL,

    -- Stock optimization
    `reorder_level` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `reorder_qty` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `max_stock_level` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `safety_stock` DECIMAL(18,6) NOT NULL DEFAULT 0.000,

    -- Demand patterns
    `avg_daily_consumption` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `lead_time_days` INT(3) NOT NULL DEFAULT 7,
    `seasonal_factor` DECIMAL(8,3) NOT NULL DEFAULT 1.000,
    `demand_variability` DECIMAL(8,3) NOT NULL DEFAULT 0.100,

    -- Cost factors
    `holding_cost_percentage` DECIMAL(8,3) NOT NULL DEFAULT 15.000,
    `ordering_cost` DECIMAL(18,6) NOT NULL DEFAULT 0.000,
    `shortage_cost_per_unit` DECIMAL(18,6) NOT NULL DEFAULT 0.000,

    -- Performance metrics
    `last_stockout_date` DATE NULL,
    `stockout_frequency` INT(3) NOT NULL DEFAULT 0,
    `turnover_ratio` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `service_level_target` DECIMAL(5,2) NOT NULL DEFAULT 95.00,

    UNIQUE KEY unique_item_warehouse (`item_code`, `warehouse`),
    INDEX idx_item_code (`item_code`),
    INDEX idx_warehouse (`warehouse`),
    INDEX idx_territory (`territory`),
    INDEX idx_reorder_level (`reorder_level`),
    INDEX idx_turnover_ratio (`turnover_ratio`),

    FOREIGN KEY (`item_code`) REFERENCES `tabItem`(`name`) ON DELETE CASCADE,
    FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse`(`name`) ON DELETE CASCADE,
    FOREIGN KEY (`territory`) REFERENCES `tabTerritory`(`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- 2. API GATEWAY DATABASE (PostgreSQL)
-- =====================================================================================

-- Create database (if needed)
-- CREATE DATABASE harsha_delights_gateway;
-- \c harsha_delights_gateway;

-- User Authentication and JWT Management
-- =====================================================================================

CREATE TABLE IF NOT EXISTS api_users (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(140) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100) NOT NULL,

    -- User details
    full_name VARCHAR(200) NOT NULL,
    user_type VARCHAR(30) NOT NULL DEFAULT 'internal', -- 'internal', 'external', 'service'
    department VARCHAR(100) NULL,
    role VARCHAR(50) NOT NULL,

    -- Account status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE NULL,
    password_changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Security settings
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret VARCHAR(100) NULL,
    password_expires_at TIMESTAMP WITH TIME ZONE NULL,
    account_locked_until TIMESTAMP WITH TIME ZONE NULL,

    -- API access
    api_access_enabled BOOLEAN NOT NULL DEFAULT true,
    rate_limit_tier VARCHAR(20) NOT NULL DEFAULT 'standard', -- 'basic', 'standard', 'premium', 'unlimited'

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(140) NULL,
    updated_by VARCHAR(140) NULL
);

-- Indexes for api_users
CREATE INDEX idx_api_users_username ON api_users(username);
CREATE INDEX idx_api_users_email ON api_users(email);
CREATE INDEX idx_api_users_user_type ON api_users(user_type);
CREATE INDEX idx_api_users_role ON api_users(role);
CREATE INDEX idx_api_users_is_active ON api_users(is_active);
CREATE INDEX idx_api_users_last_login ON api_users(last_login_at);
CREATE INDEX idx_api_users_rate_limit_tier ON api_users(rate_limit_tier);

-- JWT Token Management
CREATE TABLE IF NOT EXISTS jwt_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id VARCHAR(140) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,

    -- Token details
    token_type VARCHAR(20) NOT NULL, -- 'access', 'refresh'
    scope JSONB NULL, -- Token permissions/scopes

    -- Validity
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE NULL,
    revoked_by VARCHAR(140) NULL,
    revocation_reason VARCHAR(200) NULL,

    -- Client information
    client_ip INET NOT NULL,
    user_agent TEXT NULL,
    device_fingerprint VARCHAR(255) NULL,

    -- Usage tracking
    last_used_at TIMESTAMP WITH TIME ZONE NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES api_users(user_id) ON DELETE CASCADE
);

-- Indexes for jwt_tokens
CREATE INDEX idx_jwt_tokens_user_id ON jwt_tokens(user_id);
CREATE INDEX idx_jwt_tokens_token_type ON jwt_tokens(token_type);
CREATE INDEX idx_jwt_tokens_expires_at ON jwt_tokens(expires_at);
CREATE INDEX idx_jwt_tokens_is_revoked ON jwt_tokens(is_revoked);
CREATE INDEX idx_jwt_tokens_issued_at ON jwt_tokens(issued_at);
CREATE INDEX idx_jwt_tokens_client_ip ON jwt_tokens(client_ip);
CREATE INDEX idx_jwt_tokens_active ON jwt_tokens(user_id, token_type, is_revoked, expires_at);

-- API Keys Management
-- =====================================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id BIGSERIAL PRIMARY KEY,
    key_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    api_key_hash VARCHAR(255) NOT NULL UNIQUE,

    -- Key identification
    key_name VARCHAR(100) NOT NULL,
    key_description TEXT NULL,
    key_prefix VARCHAR(10) NOT NULL, -- First few chars for identification

    -- Ownership
    user_id VARCHAR(140) NOT NULL,
    service_name VARCHAR(100) NULL,
    application_name VARCHAR(100) NULL,

    -- Access control
    permissions JSONB NOT NULL DEFAULT '[]', -- Array of allowed endpoints/actions
    ip_whitelist JSONB NULL, -- Array of allowed IP addresses
    domain_whitelist JSONB NULL, -- Array of allowed domains

    -- Rate limiting
    rate_limit_tier VARCHAR(20) NOT NULL DEFAULT 'standard',
    requests_per_minute INTEGER NOT NULL DEFAULT 60,
    requests_per_hour INTEGER NOT NULL DEFAULT 1000,
    requests_per_day INTEGER NOT NULL DEFAULT 10000,

    -- Validity
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    last_used_at TIMESTAMP WITH TIME ZONE NULL,

    -- Usage statistics
    total_requests BIGINT NOT NULL DEFAULT 0,
    successful_requests BIGINT NOT NULL DEFAULT 0,
    failed_requests BIGINT NOT NULL DEFAULT 0,

    -- Audit
    created_by VARCHAR(140) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(140) NULL,

    FOREIGN KEY (user_id) REFERENCES api_users(user_id) ON DELETE CASCADE
);

-- Indexes for api_keys
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_service_name ON api_keys(service_name);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_rate_limit_tier ON api_keys(rate_limit_tier);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);
CREATE INDEX idx_api_keys_last_used ON api_keys(last_used_at);

-- Rate Limiting Tracking
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id BIGSERIAL PRIMARY KEY,

    -- Identifier (can be API key, user ID, or IP)
    identifier_type VARCHAR(20) NOT NULL, -- 'api_key', 'user_id', 'ip_address'
    identifier_value VARCHAR(255) NOT NULL,

    -- Time windows
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_type VARCHAR(10) NOT NULL, -- 'minute', 'hour', 'day'

    -- Counters
    request_count INTEGER NOT NULL DEFAULT 0,
    successful_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    blocked_count INTEGER NOT NULL DEFAULT 0,

    -- Limits
    limit_threshold INTEGER NOT NULL,

    -- Last update
    last_request_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(identifier_type, identifier_value, window_start, window_type)
);

-- Indexes for rate_limit_tracking
CREATE INDEX idx_rate_limit_identifier ON rate_limit_tracking(identifier_type, identifier_value);
CREATE INDEX idx_rate_limit_window ON rate_limit_tracking(window_start, window_type);
CREATE INDEX idx_rate_limit_last_request ON rate_limit_tracking(last_request_at);

-- Service Routing Configuration
-- =====================================================================================

CREATE TABLE IF NOT EXISTS service_routes (
    id BIGSERIAL PRIMARY KEY,
    route_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Route definition
    path_pattern VARCHAR(500) NOT NULL, -- e.g., '/api/v1/customers/{id}'
    http_method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE, PATCH
    service_name VARCHAR(100) NOT NULL,
    upstream_url VARCHAR(500) NOT NULL,

    -- Route metadata
    route_name VARCHAR(150) NOT NULL,
    route_description TEXT NULL,
    version VARCHAR(20) NOT NULL DEFAULT 'v1',

    -- Load balancing
    load_balancer_type VARCHAR(20) NOT NULL DEFAULT 'round_robin', -- 'round_robin', 'weighted', 'least_connections'
    upstream_servers JSONB NOT NULL DEFAULT '[]', -- Array of server configurations
    health_check_url VARCHAR(500) NULL,
    health_check_interval INTEGER NOT NULL DEFAULT 30, -- seconds

    -- Security
    authentication_required BOOLEAN NOT NULL DEFAULT true,
    authorization_roles JSONB NULL, -- Array of required roles
    rate_limit_override JSONB NULL, -- Custom rate limits for this route

    -- Timeouts and retries
    timeout_seconds INTEGER NOT NULL DEFAULT 30,
    retry_attempts INTEGER NOT NULL DEFAULT 3,
    retry_delay_ms INTEGER NOT NULL DEFAULT 1000,

    -- Circuit breaker
    circuit_breaker_enabled BOOLEAN NOT NULL DEFAULT true,
    failure_threshold INTEGER NOT NULL DEFAULT 5,
    recovery_timeout INTEGER NOT NULL DEFAULT 60, -- seconds

    -- Caching
    cache_enabled BOOLEAN NOT NULL DEFAULT false,
    cache_ttl_seconds INTEGER NULL,
    cache_key_pattern VARCHAR(200) NULL,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deprecated BOOLEAN NOT NULL DEFAULT false,
    deprecation_date TIMESTAMP WITH TIME ZONE NULL,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(140) NOT NULL,
    updated_by VARCHAR(140) NULL
);

-- Indexes for service_routes
CREATE INDEX idx_service_routes_path_method ON service_routes(path_pattern, http_method);
CREATE INDEX idx_service_routes_service_name ON service_routes(service_name);
CREATE INDEX idx_service_routes_is_active ON service_routes(is_active);
CREATE INDEX idx_service_routes_version ON service_routes(version);
CREATE INDEX idx_service_routes_is_deprecated ON service_routes(is_deprecated);

-- Service Health Status
CREATE TABLE IF NOT EXISTS service_health (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    server_url VARCHAR(500) NOT NULL,

    -- Health status
    status VARCHAR(20) NOT NULL, -- 'healthy', 'unhealthy', 'degraded', 'unknown'
    response_time_ms INTEGER NULL,
    error_message TEXT NULL,

    -- Check details
    check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_type VARCHAR(20) NOT NULL DEFAULT 'automatic', -- 'automatic', 'manual'

    -- Consecutive status tracking
    consecutive_successes INTEGER NOT NULL DEFAULT 0,
    consecutive_failures INTEGER NOT NULL DEFAULT 0,

    UNIQUE(service_name, server_url, check_timestamp)
);

-- Indexes for service_health
CREATE INDEX idx_service_health_service ON service_health(service_name);
CREATE INDEX idx_service_health_status ON service_health(status);
CREATE INDEX idx_service_health_timestamp ON service_health(check_timestamp);
CREATE INDEX idx_service_health_latest ON service_health(service_name, server_url, check_timestamp DESC);

-- API Request Audit Logs
-- =====================================================================================

CREATE TABLE IF NOT EXISTS api_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    request_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Request details
    http_method VARCHAR(10) NOT NULL,
    path VARCHAR(1000) NOT NULL,
    query_params JSONB NULL,
    headers JSONB NULL,

    -- Authentication
    user_id VARCHAR(140) NULL,
    api_key_id UUID NULL,
    authentication_method VARCHAR(20) NULL, -- 'jwt', 'api_key', 'none'

    -- Client information
    client_ip INET NOT NULL,
    user_agent TEXT NULL,
    referer VARCHAR(1000) NULL,

    -- Routing
    matched_route_id UUID NULL,
    service_name VARCHAR(100) NULL,
    upstream_url VARCHAR(500) NULL,

    -- Response details
    status_code INTEGER NOT NULL,
    response_size_bytes BIGINT NULL,
    response_time_ms INTEGER NOT NULL,

    -- Errors
    error_code VARCHAR(50) NULL,
    error_message TEXT NULL,
    error_details JSONB NULL,

    -- Timing
    request_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Rate limiting
    rate_limited BOOLEAN NOT NULL DEFAULT false,
    rate_limit_reason VARCHAR(100) NULL,

    FOREIGN KEY (user_id) REFERENCES api_users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(key_id) ON DELETE SET NULL,
    FOREIGN KEY (matched_route_id) REFERENCES service_routes(route_id) ON DELETE SET NULL
);

-- Indexes for api_audit_logs
CREATE INDEX idx_api_audit_user_id ON api_audit_logs(user_id);
CREATE INDEX idx_api_audit_api_key ON api_audit_logs(api_key_id);
CREATE INDEX idx_api_audit_timestamp ON api_audit_logs(request_timestamp);
CREATE INDEX idx_api_audit_status_code ON api_audit_logs(status_code);
CREATE INDEX idx_api_audit_service ON api_audit_logs(service_name);
CREATE INDEX idx_api_audit_client_ip ON api_audit_logs(client_ip);
CREATE INDEX idx_api_audit_path ON api_audit_logs(path);
CREATE INDEX idx_api_audit_response_time ON api_audit_logs(response_time_ms);
CREATE INDEX idx_api_audit_error_code ON api_audit_logs(error_code);

-- Performance optimization: Partition audit logs by month
-- CREATE TABLE api_audit_logs_y2024m01 PARTITION OF api_audit_logs
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- =====================================================================================
-- 3. SYNC DATABASE (PostgreSQL)
-- =====================================================================================

-- Create database (if needed)
-- CREATE DATABASE harsha_delights_sync;
-- \c harsha_delights_sync;

-- Real-time Event Logs
-- =====================================================================================

CREATE TABLE IF NOT EXISTS sync_events (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Event identification
    event_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'custom'
    event_source VARCHAR(100) NOT NULL, -- 'erpnext', 'api_gateway', 'external_system'
    event_name VARCHAR(150) NOT NULL,

    -- Document details
    doctype VARCHAR(100) NOT NULL,
    doc_name VARCHAR(140) NOT NULL,
    doc_status VARCHAR(20) NULL, -- Document workflow status

    -- Event data
    event_data JSONB NOT NULL, -- Complete event payload
    previous_data JSONB NULL, -- Previous state for updates
    metadata JSONB NULL, -- Additional context

    -- Timing
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Source information
    source_user VARCHAR(140) NULL,
    source_ip INET NULL,
    source_session VARCHAR(255) NULL,

    -- Processing status
    processing_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'processed', 'failed', 'skipped'
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,

    -- Error handling
    error_message TEXT NULL,
    error_details JSONB NULL,
    last_error_at TIMESTAMP WITH TIME ZONE NULL,

    -- Routing
    target_services JSONB NOT NULL DEFAULT '[]', -- Array of services that should process this event
    processed_by_services JSONB NOT NULL DEFAULT '[]', -- Array of services that have processed this event

    -- Priority and grouping
    priority INTEGER NOT NULL DEFAULT 5, -- 1=highest, 10=lowest
    event_group VARCHAR(100) NULL, -- For batching related events
    parent_event_id UUID NULL, -- For hierarchical events

    FOREIGN KEY (parent_event_id) REFERENCES sync_events(event_id) ON DELETE SET NULL
);

-- Indexes for sync_events
CREATE INDEX idx_sync_events_type ON sync_events(event_type);
CREATE INDEX idx_sync_events_source ON sync_events(event_source);
CREATE INDEX idx_sync_events_doctype ON sync_events(doctype);
CREATE INDEX idx_sync_events_doc_name ON sync_events(doctype, doc_name);
CREATE INDEX idx_sync_events_timestamp ON sync_events(event_timestamp);
CREATE INDEX idx_sync_events_status ON sync_events(processing_status);
CREATE INDEX idx_sync_events_priority ON sync_events(priority);
CREATE INDEX idx_sync_events_group ON sync_events(event_group);
CREATE INDEX idx_sync_events_retry ON sync_events(retry_count, max_retries);
CREATE INDEX idx_sync_events_unprocessed ON sync_events(processing_status, priority, event_timestamp)
    WHERE processing_status IN ('pending', 'failed');

-- Data Synchronization Status Tracking
-- =====================================================================================

CREATE TABLE IF NOT EXISTS sync_status (
    id BIGSERIAL PRIMARY KEY,
    sync_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Sync definition
    entity_type VARCHAR(100) NOT NULL, -- 'Customer', 'Item', 'Sales Order', etc.
    entity_id VARCHAR(140) NOT NULL,
    source_system VARCHAR(100) NOT NULL,
    target_system VARCHAR(100) NOT NULL,

    -- Sync operation
    operation_type VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete', 'bulk_sync'
    sync_direction VARCHAR(20) NOT NULL, -- 'source_to_target', 'target_to_source', 'bidirectional'

    -- Status tracking
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'conflict'
    started_at TIMESTAMP WITH TIME ZONE NULL,
    completed_at TIMESTAMP WITH TIME ZONE NULL,

    -- Data versions
    source_version VARCHAR(50) NULL, -- Version/timestamp from source system
    target_version VARCHAR(50) NULL, -- Version/timestamp from target system
    last_sync_version VARCHAR(50) NULL, -- Last successfully synced version

    -- Sync payload
    source_data JSONB NULL, -- Data from source system
    target_data JSONB NULL, -- Data from target system
    transformed_data JSONB NULL, -- Data after transformation rules
    sync_metadata JSONB NULL, -- Additional sync context

    -- Error handling
    error_count INTEGER NOT NULL DEFAULT 0,
    last_error_message TEXT NULL,
    last_error_details JSONB NULL,
    last_error_at TIMESTAMP WITH TIME ZONE NULL,

    -- Retry configuration
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 5,
    next_retry_at TIMESTAMP WITH TIME ZONE NULL,
    backoff_factor DECIMAL(3,2) NOT NULL DEFAULT 2.0,

    -- Performance metrics
    sync_duration_ms INTEGER NULL,
    data_size_bytes BIGINT NULL,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(140) NULL,

    UNIQUE(entity_type, entity_id, source_system, target_system, operation_type, started_at)
);

-- Indexes for sync_status
CREATE INDEX idx_sync_status_entity ON sync_status(entity_type, entity_id);
CREATE INDEX idx_sync_status_systems ON sync_status(source_system, target_system);
CREATE INDEX idx_sync_status_status ON sync_status(sync_status);
CREATE INDEX idx_sync_status_created ON sync_status(created_at);
CREATE INDEX idx_sync_status_retry ON sync_status(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX idx_sync_status_failed ON sync_status(sync_status, error_count) WHERE sync_status = 'failed';
CREATE INDEX idx_sync_status_pending ON sync_status(sync_status, created_at) WHERE sync_status IN ('pending', 'in_progress');

-- Conflict Resolution Records
-- =====================================================================================

CREATE TABLE IF NOT EXISTS sync_conflicts (
    id BIGSERIAL PRIMARY KEY,
    conflict_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Related sync operation
    sync_status_id BIGINT NOT NULL,
    event_id UUID NULL,

    -- Conflict details
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(140) NOT NULL,
    field_name VARCHAR(100) NULL, -- Specific field in conflict (if applicable)

    -- Conflict type
    conflict_type VARCHAR(50) NOT NULL, -- 'version_mismatch', 'data_inconsistency', 'business_rule_violation', 'concurrent_modification'
    conflict_severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

    -- Conflicting data
    source_value JSONB NOT NULL,
    target_value JSONB NOT NULL,
    expected_value JSONB NULL,

    -- Resolution
    resolution_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'ignored', 'escalated'
    resolution_strategy VARCHAR(50) NULL, -- 'source_wins', 'target_wins', 'merge', 'manual', 'business_rule'
    resolved_value JSONB NULL,

    -- Resolution metadata
    auto_resolvable BOOLEAN NOT NULL DEFAULT false,
    resolution_confidence DECIMAL(3,2) NULL, -- 0.0 to 1.0
    resolution_reason TEXT NULL,

    -- Timing
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE NULL,

    -- Assignment
    assigned_to VARCHAR(140) NULL,
    resolved_by VARCHAR(140) NULL,
    escalated_to VARCHAR(140) NULL,

    -- Business impact
    business_impact VARCHAR(20) NULL, -- 'none', 'low', 'medium', 'high'
    impact_description TEXT NULL,
    affects_customer BOOLEAN NOT NULL DEFAULT false,
    affects_inventory BOOLEAN NOT NULL DEFAULT false,
    affects_financials BOOLEAN NOT NULL DEFAULT false,

    FOREIGN KEY (sync_status_id) REFERENCES sync_status(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES sync_events(event_id) ON DELETE SET NULL
);

-- Indexes for sync_conflicts
CREATE INDEX idx_sync_conflicts_sync_status ON sync_conflicts(sync_status_id);
CREATE INDEX idx_sync_conflicts_entity ON sync_conflicts(entity_type, entity_id);
CREATE INDEX idx_sync_conflicts_type ON sync_conflicts(conflict_type);
CREATE INDEX idx_sync_conflicts_severity ON sync_conflicts(conflict_severity);
CREATE INDEX idx_sync_conflicts_status ON sync_conflicts(resolution_status);
CREATE INDEX idx_sync_conflicts_detected ON sync_conflicts(detected_at);
CREATE INDEX idx_sync_conflicts_assigned ON sync_conflicts(assigned_to);
CREATE INDEX idx_sync_conflicts_pending ON sync_conflicts(resolution_status, conflict_severity, detected_at)
    WHERE resolution_status = 'pending';

-- Sync Configuration and Rules
-- =====================================================================================

CREATE TABLE IF NOT EXISTS sync_configurations (
    id BIGSERIAL PRIMARY KEY,
    config_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Configuration identity
    config_name VARCHAR(150) NOT NULL UNIQUE,
    config_description TEXT NULL,
    config_type VARCHAR(50) NOT NULL, -- 'entity_mapping', 'transformation_rule', 'sync_schedule', 'conflict_resolution'

    -- Scope
    entity_type VARCHAR(100) NULL,
    source_system VARCHAR(100) NOT NULL,
    target_system VARCHAR(100) NOT NULL,

    -- Configuration data
    configuration JSONB NOT NULL, -- The actual configuration
    validation_rules JSONB NULL, -- Rules for validating the configuration

    -- Sync behavior
    sync_direction VARCHAR(20) NOT NULL DEFAULT 'source_to_target',
    sync_frequency VARCHAR(50) NULL, -- 'real_time', 'hourly', 'daily', 'weekly', 'on_demand'
    batch_size INTEGER NOT NULL DEFAULT 100,

    -- Error handling
    error_handling_strategy VARCHAR(50) NOT NULL DEFAULT 'retry_with_backoff',
    max_retries INTEGER NOT NULL DEFAULT 5,
    retry_delay_seconds INTEGER NOT NULL DEFAULT 60,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(140) NOT NULL,
    updated_by VARCHAR(140) NULL
);

-- Indexes for sync_configurations
CREATE INDEX idx_sync_configs_name ON sync_configurations(config_name);
CREATE INDEX idx_sync_configs_type ON sync_configurations(config_type);
CREATE INDEX idx_sync_configs_entity ON sync_configurations(entity_type);
CREATE INDEX idx_sync_configs_systems ON sync_configurations(source_system, target_system);
CREATE INDEX idx_sync_configs_active ON sync_configurations(is_active);
CREATE INDEX idx_sync_configs_frequency ON sync_configurations(sync_frequency);

-- Sync Performance Metrics
-- =====================================================================================

CREATE TABLE IF NOT EXISTS sync_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Metric identification
    metric_type VARCHAR(50) NOT NULL, -- 'throughput', 'latency', 'error_rate', 'data_quality'
    entity_type VARCHAR(100) NULL,
    source_system VARCHAR(100) NOT NULL,
    target_system VARCHAR(100) NOT NULL,

    -- Time window
    measurement_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    window_duration_seconds INTEGER NOT NULL,

    -- Metric values
    metric_value DECIMAL(18,6) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL, -- 'records/second', 'milliseconds', 'percentage', 'bytes'

    -- Context
    total_records BIGINT NULL,
    successful_records BIGINT NULL,
    failed_records BIGINT NULL,
    average_record_size_bytes BIGINT NULL,

    -- Quality metrics
    data_accuracy_percentage DECIMAL(5,2) NULL,
    completeness_percentage DECIMAL(5,2) NULL,
    consistency_score DECIMAL(5,2) NULL,

    -- Additional context
    metadata JSONB NULL
);

-- Indexes for sync_metrics
CREATE INDEX idx_sync_metrics_type ON sync_metrics(metric_type);
CREATE INDEX idx_sync_metrics_entity ON sync_metrics(entity_type);
CREATE INDEX idx_sync_metrics_systems ON sync_metrics(source_system, target_system);
CREATE INDEX idx_sync_metrics_timestamp ON sync_metrics(measurement_timestamp);
CREATE INDEX idx_sync_metrics_window ON sync_metrics(window_start, window_end);

-- =====================================================================================
-- VIEWS FOR PERFORMANCE AND REPORTING
-- =====================================================================================

-- ERPNext Views
-- =====================================================================================

-- Customer Segment Analysis View
CREATE OR REPLACE VIEW view_customer_segment_analysis AS
SELECT
    cs.segment_code,
    cs.segment_name,
    cs.segment_type,
    cs.priority_level,
    COUNT(DISTINCT csa.customer) as total_customers,
    COUNT(DISTINCT CASE WHEN csa.is_primary = 1 THEN csa.customer END) as primary_customers,
    AVG(csa.total_revenue) as avg_customer_revenue,
    AVG(csa.avg_order_value) as avg_order_value,
    SUM(csa.total_revenue) as total_segment_revenue,
    AVG(cs.discount_percentage) as avg_discount_percentage
FROM `tabHD Customer Segment` cs
LEFT JOIN `tabHD Customer Segment Assignment` csa ON cs.name = csa.customer_segment
WHERE cs.is_active = 1
    AND (csa.status = 'Active' OR csa.status IS NULL)
    AND (csa.effective_to IS NULL OR csa.effective_to >= CURDATE())
GROUP BY cs.name, cs.segment_code, cs.segment_name, cs.segment_type, cs.priority_level;

-- Batch Expiry Alert View
CREATE OR REPLACE VIEW view_batch_expiry_alerts AS
SELECT
    bm.batch_id,
    bm.item,
    bm.item_name,
    bm.warehouse,
    bm.manufacturing_date,
    bm.expiry_date,
    bm.available_qty,
    bm.quality_grade,
    DATEDIFF(bm.expiry_date, CURDATE()) as days_to_expiry,
    CASE
        WHEN DATEDIFF(bm.expiry_date, CURDATE()) <= 0 THEN 'Expired'
        WHEN DATEDIFF(bm.expiry_date, CURDATE()) <= 7 THEN 'Critical'
        WHEN DATEDIFF(bm.expiry_date, CURDATE()) <= 30 THEN 'Warning'
        ELSE 'Normal'
    END as alert_level,
    bm.total_cost,
    (bm.available_qty * bm.unit_cost) as potential_loss_value
FROM `tabHD Batch Master` bm
WHERE bm.status = 'Active'
    AND bm.available_qty > 0
    AND DATEDIFF(bm.expiry_date, CURDATE()) <= 30
ORDER BY days_to_expiry ASC, potential_loss_value DESC;

-- PostgreSQL Views (API Gateway)
-- =====================================================================================

-- API Usage Summary View
CREATE OR REPLACE VIEW view_api_usage_summary AS
SELECT
    DATE_TRUNC('hour', request_timestamp) as hour_bucket,
    service_name,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as successful_requests,
    COUNT(*) FILTER (WHERE status_code >= 400) as error_requests,
    COUNT(*) FILTER (WHERE rate_limited = true) as rate_limited_requests,
    AVG(response_time_ms) as avg_response_time_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time_ms,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99_response_time_ms
FROM api_audit_logs
WHERE request_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY hour_bucket, service_name
ORDER BY hour_bucket DESC, service_name;

-- PostgreSQL Views (Sync Database)
-- =====================================================================================

-- Sync Health Dashboard View
CREATE OR REPLACE VIEW view_sync_health_dashboard AS
SELECT
    source_system,
    target_system,
    entity_type,
    COUNT(*) as total_syncs,
    COUNT(*) FILTER (WHERE sync_status = 'completed') as successful_syncs,
    COUNT(*) FILTER (WHERE sync_status = 'failed') as failed_syncs,
    COUNT(*) FILTER (WHERE sync_status IN ('pending', 'in_progress')) as pending_syncs,
    AVG(sync_duration_ms) as avg_sync_duration_ms,
    MAX(completed_at) as last_successful_sync,
    COUNT(*) FILTER (WHERE sync_status = 'failed' AND last_error_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour') as recent_failures
FROM sync_status
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY source_system, target_system, entity_type
ORDER BY recent_failures DESC, failed_syncs DESC;

-- =====================================================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================================================

-- ERPNext Triggers (MariaDB)
-- =====================================================================================

-- Update customer segment assignment metrics
DELIMITER //
CREATE TRIGGER update_segment_metrics AFTER UPDATE ON `tabHD Customer Segment Assignment`
FOR EACH ROW
BEGIN
    DECLARE total_orders INT DEFAULT 0;
    DECLARE total_revenue DECIMAL(18,6) DEFAULT 0.000;
    DECLARE avg_order_value DECIMAL(18,6) DEFAULT 0.000;
    DECLARE last_order_date DATE;

    -- Calculate metrics from sales orders (simplified - would need actual ERPNext tables)
    -- This is a placeholder for the actual calculation logic

    UPDATE `tabHD Customer Segment Assignment`
    SET
        total_orders = total_orders,
        total_revenue = total_revenue,
        avg_order_value = avg_order_value,
        last_order_date = last_order_date
    WHERE name = NEW.name;
END//
DELIMITER ;

-- PostgreSQL Functions and Triggers
-- =====================================================================================

-- Function to update API user last login
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE api_users
    SET
        last_login_at = CURRENT_TIMESTAMP,
        failed_login_attempts = 0
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for JWT token creation
CREATE TRIGGER trigger_jwt_token_login
    AFTER INSERT ON jwt_tokens
    FOR EACH ROW
    WHEN (NEW.token_type = 'access')
    EXECUTE FUNCTION update_user_last_login();

-- Function to auto-resolve simple sync conflicts
CREATE OR REPLACE FUNCTION auto_resolve_conflicts()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-resolve conflicts based on predefined rules
    IF NEW.conflict_type = 'version_mismatch' AND NEW.auto_resolvable = true THEN
        UPDATE sync_conflicts
        SET
            resolution_status = 'resolved',
            resolution_strategy = 'source_wins',
            resolved_value = NEW.source_value,
            resolved_at = CURRENT_TIMESTAMP,
            resolved_by = 'system_auto_resolver'
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-conflict resolution
CREATE TRIGGER trigger_auto_resolve_conflicts
    AFTER INSERT ON sync_conflicts
    FOR EACH ROW
    EXECUTE FUNCTION auto_resolve_conflicts();

-- =====================================================================================
-- INITIAL DATA AND CONFIGURATION
-- =====================================================================================

-- ERPNext Initial Data
-- =====================================================================================

-- Insert default customer segments
INSERT INTO `tabHD Customer Segment` (
    name, segment_code, segment_name, segment_type, priority_level,
    default_price_list, discount_percentage, minimum_order_amount,
    creation, modified, docstatus, idx
) VALUES
('HD-SEG-001', 'RETAIL', 'Retail Customers', 'demographic', 3, 'Standard Selling', 0.000, 500.000, NOW(), NOW(), 1, 1),
('HD-SEG-002', 'WHOLESALE', 'Wholesale Distributors', 'demographic', 1, 'Wholesale Price List', 15.000, 10000.000, NOW(), NOW(), 1, 2),
('HD-SEG-003', 'PREMIUM', 'Premium Corporate', 'behavioral', 1, 'Premium Price List', 5.000, 25000.000, NOW(), NOW(), 1, 3),
('HD-SEG-004', 'FESTIVAL', 'Festival Bulk Orders', 'seasonal', 2, 'Festival Price List', 20.000, 50000.000, NOW(), NOW(), 1, 4);

-- API Gateway Initial Data
-- =====================================================================================

-- Insert default admin user
INSERT INTO api_users (
    user_id, username, email, password_hash, salt, full_name,
    user_type, role, is_active, is_verified, api_access_enabled, rate_limit_tier
) VALUES (
    'admin_001', 'admin', 'admin@harshadelights.com',
    '$2b$12$encrypted_password_hash', 'random_salt_value',
    'System Administrator', 'internal', 'administrator',
    true, true, true, 'unlimited'
);

-- Insert default service routes
INSERT INTO service_routes (
    path_pattern, http_method, service_name, upstream_url, route_name,
    authentication_required, timeout_seconds, is_active, created_by
) VALUES
('/api/v1/customers/*', 'GET', 'erpnext', 'http://erpnext:8000/api/resource/Customer', 'Get Customer Data', true, 30, true, 'admin_001'),
('/api/v1/items/*', 'GET', 'erpnext', 'http://erpnext:8000/api/resource/Item', 'Get Item Data', true, 30, true, 'admin_001'),
('/api/v1/pricing/*', 'POST', 'pricing_engine', 'http://pricing-service:8080/calculate', 'Calculate Dynamic Pricing', true, 15, true, 'admin_001'),
('/api/v1/inventory/*', 'GET', 'erpnext', 'http://erpnext:8000/api/resource/Stock%20Entry', 'Get Inventory Data', true, 30, true, 'admin_001');

-- Sync Database Initial Data
-- =====================================================================================

-- Insert default sync configurations
INSERT INTO sync_configurations (
    config_name, config_description, config_type, entity_type,
    source_system, target_system, configuration, sync_frequency,
    is_active, created_by
) VALUES
(
    'ERPNext_Customer_Sync',
    'Synchronize customer data from ERPNext to external systems',
    'entity_mapping',
    'Customer',
    'erpnext',
    'external_crm',
    '{"field_mappings": {"customer_name": "name", "customer_code": "customer_code", "territory": "territory"}, "transformation_rules": []}',
    'real_time',
    true,
    'system'
),
(
    'Item_Master_Sync',
    'Synchronize item master data across systems',
    'entity_mapping',
    'Item',
    'erpnext',
    'warehouse_management',
    '{"field_mappings": {"item_code": "item_code", "item_name": "item_name", "item_group": "category"}, "validation_rules": {"required_fields": ["item_code", "item_name"]}}',
    'hourly',
    true,
    'system'
);

-- =====================================================================================
-- END OF SCHEMA DEFINITION
-- =====================================================================================
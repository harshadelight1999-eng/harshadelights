-- =====================================================================================
-- HARSHA DELIGHTS MARIADB DATABASE INITIALIZATION
-- =====================================================================================
-- This script creates additional databases and users for EspoCRM and other services
-- =====================================================================================

-- Create EspoCRM database
CREATE DATABASE IF NOT EXISTS `espocrm_hd`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create application-specific users
CREATE USER IF NOT EXISTS 'espocrm_user'@'%' IDENTIFIED BY 'espocrm_pass_2024';
CREATE USER IF NOT EXISTS 'readonly_user'@'%' IDENTIFIED BY 'readonly_pass_2024';
CREATE USER IF NOT EXISTS 'backup_user'@'%' IDENTIFIED BY 'backup_pass_2024';

-- Grant privileges for ERPNext database
GRANT ALL PRIVILEGES ON `erpnext_hd`.* TO 'erpnext'@'%';

-- Grant privileges for EspoCRM database
GRANT ALL PRIVILEGES ON `espocrm_hd`.* TO 'espocrm_user'@'%';
GRANT ALL PRIVILEGES ON `espocrm_hd`.* TO 'erpnext'@'%';

-- Grant read-only access for monitoring
GRANT SELECT ON `erpnext_hd`.* TO 'readonly_user'@'%';
GRANT SELECT ON `espocrm_hd`.* TO 'readonly_user'@'%';

-- Grant backup privileges
GRANT SELECT, LOCK TABLES, TRIGGER, SHOW VIEW ON `erpnext_hd`.* TO 'backup_user'@'%';
GRANT SELECT, LOCK TABLES, TRIGGER, SHOW VIEW ON `espocrm_hd`.* TO 'backup_user'@'%';

-- Create monitoring views
USE `erpnext_hd`;

-- View for table sizes
CREATE OR REPLACE VIEW `monitoring_table_sizes` AS
SELECT
    TABLE_SCHEMA as database_name,
    TABLE_NAME as table_name,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as table_size_mb,
    TABLE_ROWS as row_count,
    ROUND((DATA_LENGTH / 1024 / 1024), 2) as data_size_mb,
    ROUND((INDEX_LENGTH / 1024 / 1024), 2) as index_size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA IN ('erpnext_hd', 'espocrm_hd')
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;

-- View for database statistics
CREATE OR REPLACE VIEW `monitoring_database_stats` AS
SELECT
    TABLE_SCHEMA as database_name,
    COUNT(*) as table_count,
    SUM(TABLE_ROWS) as total_rows,
    ROUND(SUM((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as total_size_mb,
    ROUND(SUM(DATA_LENGTH / 1024 / 1024), 2) as data_size_mb,
    ROUND(SUM(INDEX_LENGTH / 1024 / 1024), 2) as index_size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA IN ('erpnext_hd', 'espocrm_hd')
GROUP BY TABLE_SCHEMA;

-- View for process list monitoring
CREATE OR REPLACE VIEW `monitoring_process_list` AS
SELECT
    ID,
    USER,
    HOST,
    DB,
    COMMAND,
    TIME,
    STATE,
    INFO
FROM information_schema.PROCESSLIST
WHERE USER NOT IN ('system user', 'event_scheduler')
ORDER BY TIME DESC;

-- Grant access to monitoring views
GRANT SELECT ON `monitoring_table_sizes` TO 'readonly_user'@'%';
GRANT SELECT ON `monitoring_database_stats` TO 'readonly_user'@'%';
GRANT SELECT ON `monitoring_process_list` TO 'readonly_user'@'%';

-- Performance optimization settings
SET GLOBAL innodb_stats_on_metadata = 0;
SET GLOBAL innodb_file_format = 'Barracuda';
SET GLOBAL innodb_large_prefix = 1;

-- Enable query cache
SET GLOBAL query_cache_type = 1;
SET GLOBAL query_cache_size = 134217728; -- 128MB

-- Flush privileges to ensure all changes take effect
FLUSH PRIVILEGES;

-- Display success message
SELECT 'MariaDB databases and users created successfully!' as message;
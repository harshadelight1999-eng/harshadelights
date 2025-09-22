-- =====================================================================================
-- HARSHA DELIGHTS POSTGRESQL DATABASE INITIALIZATION
-- =====================================================================================
-- This script creates all required databases and users for the system
-- =====================================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create additional databases
CREATE DATABASE harsha_delights_sync
    WITH
    OWNER = harsha_admin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    TEMPLATE = template0;

CREATE DATABASE harsha_medusa
    WITH
    OWNER = harsha_admin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    TEMPLATE = template0;

-- Create application-specific users with limited privileges
CREATE USER api_gateway_user WITH PASSWORD 'api_gateway_pass_2024';
CREATE USER medusa_user WITH PASSWORD 'medusa_pass_2024';
CREATE USER sync_service_user WITH PASSWORD 'sync_service_pass_2024';
CREATE USER readonly_user WITH PASSWORD 'readonly_pass_2024';

-- Grant database access
GRANT CONNECT ON DATABASE harsha_delights_gateway TO api_gateway_user;
GRANT CONNECT ON DATABASE harsha_medusa TO medusa_user;
GRANT CONNECT ON DATABASE harsha_delights_sync TO sync_service_user;

-- Grant read-only access to monitoring user
GRANT CONNECT ON DATABASE harsha_delights_gateway TO readonly_user;
GRANT CONNECT ON DATABASE harsha_medusa TO readonly_user;
GRANT CONNECT ON DATABASE harsha_delights_sync TO readonly_user;

-- Switch to gateway database to set up schema permissions
\c harsha_delights_gateway;

-- Enable extensions for gateway database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS api_gateway;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS audit;

-- Grant schema usage and table creation privileges
GRANT USAGE ON SCHEMA public TO api_gateway_user;
GRANT CREATE ON SCHEMA public TO api_gateway_user;
GRANT USAGE ON SCHEMA api_gateway TO api_gateway_user;
GRANT CREATE ON SCHEMA api_gateway TO api_gateway_user;

-- Grant read access to monitoring user
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT USAGE ON SCHEMA api_gateway TO readonly_user;
GRANT USAGE ON SCHEMA monitoring TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA api_gateway TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA monitoring TO readonly_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA api_gateway GRANT SELECT ON TABLES TO readonly_user;

-- Switch to sync database
\c harsha_delights_sync;

-- Enable extensions for sync database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS sync_engine;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS audit;

-- Grant schema privileges
GRANT USAGE ON SCHEMA public TO sync_service_user;
GRANT CREATE ON SCHEMA public TO sync_service_user;
GRANT USAGE ON SCHEMA sync_engine TO sync_service_user;
GRANT CREATE ON SCHEMA sync_engine TO sync_service_user;

-- Grant read access to monitoring user
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT USAGE ON SCHEMA sync_engine TO readonly_user;
GRANT USAGE ON SCHEMA monitoring TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA sync_engine TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA monitoring TO readonly_user;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA sync_engine GRANT SELECT ON TABLES TO readonly_user;

-- Switch to medusa database
\c harsha_medusa;

-- Enable extensions for medusa database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS medusa_store;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS monitoring;

-- Grant schema privileges
GRANT USAGE ON SCHEMA public TO medusa_user;
GRANT CREATE ON SCHEMA public TO medusa_user;
GRANT USAGE ON SCHEMA medusa_store TO medusa_user;
GRANT CREATE ON SCHEMA medusa_store TO medusa_user;

-- Grant read access to monitoring user
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT USAGE ON SCHEMA medusa_store TO readonly_user;
GRANT USAGE ON SCHEMA analytics TO readonly_user;
GRANT USAGE ON SCHEMA monitoring TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA medusa_store TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA monitoring TO readonly_user;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA medusa_store GRANT SELECT ON TABLES TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT ON TABLES TO readonly_user;

-- Switch back to main database
\c harsha_delights_gateway;

-- Create monitoring and performance views
CREATE OR REPLACE VIEW monitoring.database_stats AS
SELECT
    schemaname,
    tablename,
    attname,
    inherited,
    null_frac,
    avg_width,
    n_distinct,
    most_common_vals,
    most_common_freqs,
    histogram_bounds,
    correlation
FROM pg_stats
WHERE schemaname NOT IN ('information_schema', 'pg_catalog');

CREATE OR REPLACE VIEW monitoring.table_sizes AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

CREATE OR REPLACE VIEW monitoring.active_connections AS
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    client_hostname,
    client_port,
    backend_start,
    xact_start,
    query_start,
    state_change,
    state,
    backend_xid,
    backend_xmin,
    query,
    backend_type
FROM pg_stat_activity
WHERE state != 'idle';

-- Grant access to monitoring views
GRANT SELECT ON ALL TABLES IN SCHEMA monitoring TO readonly_user;

-- Success message
\echo 'PostgreSQL databases and users created successfully!';
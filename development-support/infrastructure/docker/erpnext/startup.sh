#!/bin/bash
# =====================================================================================
# HARSHA DELIGHTS ERPNEXT STARTUP SCRIPT
# =====================================================================================
# This script handles the initialization and startup of ERPNext with custom configurations
# =====================================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] [$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING] [$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] [$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Function to wait for services
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local timeout=${4:-60}

    log "Waiting for $service_name to be ready at $host:$port..."

    for i in $(seq 1 $timeout); do
        if nc -z "$host" "$port"; then
            success "$service_name is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
    done

    error "$service_name is not ready after $timeout seconds"
    return 1
}

# Function to check database connection
check_database() {
    log "Checking database connection..."

    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        success "Database connection successful"
        return 0
    else
        error "Database connection failed"
        return 1
    fi
}

# Function to check Redis connection
check_redis() {
    log "Checking Redis connection..."

    redis-cli -h redis -p 6379 ping > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        success "Redis connection successful"
        return 0
    else
        error "Redis connection failed"
        return 1
    fi
}

# Function to initialize site if it doesn't exist
initialize_site() {
    local site_name=${SITE_NAME:-harshadelights.local}

    if [ ! -d "sites/$site_name" ]; then
        log "Site $site_name does not exist. Creating new site..."

        bench new-site "$site_name" \
            --admin-password "${ADMIN_PASSWORD:-admin_pass_2024}" \
            --mariadb-root-password "${DB_PASSWORD}" \
            --db-host "$DB_HOST" \
            --db-port "$DB_PORT" \
            --no-mariadb-socket

        success "Site $site_name created successfully"

        # Install ERPNext app
        log "Installing ERPNext on site $site_name..."
        bench --site "$site_name" install-app erpnext

        # Install custom Harsha Delights app
        if [ -d "apps/harsha_customizations" ]; then
            log "Getting Harsha Delights customizations app..."
            if bench get-app --skip-assets harsha_customizations apps/harsha_customizations; then
                log "Installing Harsha Delights customizations..."
                bench --site "$site_name" install-app harsha_customizations
                success "Harsha Delights customizations installed"
            else
                warning "Failed to get Harsha Delights app, skipping installation..."
            fi
        else
            warning "Harsha Delights customizations not found, skipping..."
        fi

        # Set site as default
        echo "$site_name" > sites/currentsite.txt

        success "Site initialization completed"
    else
        log "Site $site_name already exists, skipping initialization"
    fi
}

# Function to migrate database
migrate_database() {
    local site_name=${SITE_NAME:-harshadelights.local}

    log "Running database migrations for site $site_name..."
    bench --site "$site_name" migrate

    success "Database migrations completed"
}

# Function to clear cache
clear_cache() {
    local site_name=${SITE_NAME:-harshadelights.local}

    log "Clearing cache for site $site_name..."
    bench --site "$site_name" clear-cache

    success "Cache cleared"
}

# Function to build assets
build_assets() {
    if [ "${DEVELOPER_MODE:-0}" = "1" ]; then
        log "Developer mode enabled, skipping asset build..."
        return 0
    fi

    log "Building assets..."
    bench build --app frappe --app erpnext --app harsha_customizations

    success "Assets built successfully"
}

# Function to setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."

    # Create metrics directory
    mkdir -p /var/lib/erpnext/metrics

    # Start metrics collection in background
    if command -v python3 &> /dev/null; then
        python3 -c "
import time
import psutil
import json
import os

def collect_metrics():
    metrics = {
        'timestamp': time.time(),
        'cpu_percent': psutil.cpu_percent(),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_percent': psutil.disk_usage('/').percent
    }

    with open('/var/lib/erpnext/metrics/system.json', 'w') as f:
        json.dump(metrics, f)

collect_metrics()
" &
    fi

    success "Monitoring setup completed"
}

# Function to validate configuration
validate_config() {
    log "Validating configuration..."

    # Check required environment variables
    local required_vars=("DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
            return 1
        fi
    done

    # Check if site config exists
    local site_name=${SITE_NAME:-harshadelights.local}
    if [ -d "sites/$site_name" ] && [ ! -f "sites/$site_name/site_config.json" ]; then
        warning "Site config not found, using default configuration"
    fi

    success "Configuration validation completed"
}

# Main startup function
main() {
    log "Starting Harsha Delights ERPNext..."

    # Validate configuration
    validate_config || exit 1

    # Wait for required services
    wait_for_service "$DB_HOST" "$DB_PORT" "MariaDB" 60 || exit 1
    wait_for_service "redis" 6379 "Redis" 30 || exit 1

    # Check service connections
    check_database || exit 1
    check_redis || exit 1

    # Change to bench directory
    cd /home/frappe/frappe-bench

    # Initialize site if needed
    initialize_site

    # Run database migrations
    migrate_database

    # Clear cache
    clear_cache

    # Build assets if not in developer mode
    build_assets

    # Setup monitoring
    setup_monitoring

    success "ERPNext startup completed successfully"

    # Execute the original command
    log "Executing command: $*"
    exec "$@"
}

# Handle signals for graceful shutdown
trap 'log "Received shutdown signal, cleaning up..."; exit 0' SIGTERM SIGINT

# Run main function with all arguments
main "$@"
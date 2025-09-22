#!/bin/bash
# =====================================================================================
# HARSHA DELIGHTS DATABASE BACKUP SCRIPT
# =====================================================================================
# Automated backup script for MariaDB and PostgreSQL databases
# =====================================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="/backups/databases"
LOG_FILE="/logs/database-backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Source common functions
source "$SCRIPT_DIR/common.sh"

# Database configuration
MARIADB_HOST=${MARIADB_HOST:-mariadb}
MARIADB_PORT=${MARIADB_PORT:-3306}
MARIADB_ROOT_PASSWORD=${MARIADB_ROOT_PASSWORD:-harsha_root_2024}

POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-harsha_postgres_2024}
POSTGRES_USER=${POSTGRES_USER:-harsha_admin}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Test database connectivity
test_mariadb_connection() {
    log "Testing MariaDB connection..."
    if mysql -h"$MARIADB_HOST" -P"$MARIADB_PORT" -uroot -p"$MARIADB_ROOT_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
        log "MariaDB connection successful"
        return 0
    else
        log "ERROR: Failed to connect to MariaDB"
        return 1
    fi
}

test_postgres_connection() {
    log "Testing PostgreSQL connection..."
    export PGPASSWORD="$POSTGRES_PASSWORD"
    if psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
        log "PostgreSQL connection successful"
        return 0
    else
        log "ERROR: Failed to connect to PostgreSQL"
        return 1
    fi
}

# Backup MariaDB databases
backup_mariadb() {
    log "Starting MariaDB backup..."

    if ! test_mariadb_connection; then
        return 1
    fi

    local databases=("erpnext_hd" "espocrm_hd")

    for db in "${databases[@]}"; do
        log "Backing up MariaDB database: $db"

        local backup_file="$BACKUP_DIR/mariadb_${db}_${TIMESTAMP}.sql"

        # Create backup with compression
        if mysqldump \
            -h"$MARIADB_HOST" \
            -P"$MARIADB_PORT" \
            -uroot \
            -p"$MARIADB_ROOT_PASSWORD" \
            --single-transaction \
            --routines \
            --triggers \
            --events \
            --hex-blob \
            --add-drop-database \
            --databases "$db" \
            > "$backup_file"; then

            # Compress the backup
            if [ "$BACKUP_COMPRESSION" = "true" ]; then
                log "Compressing backup: $backup_file"
                gzip "$backup_file"
                backup_file="${backup_file}.gz"
            fi

            # Verify backup integrity
            if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
                local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
                log "MariaDB backup completed: $backup_file (${file_size} bytes)"
            else
                log "ERROR: MariaDB backup file is empty or missing: $backup_file"
                return 1
            fi
        else
            log "ERROR: Failed to backup MariaDB database: $db"
            return 1
        fi
    done

    log "All MariaDB backups completed successfully"
    return 0
}

# Backup PostgreSQL databases
backup_postgres() {
    log "Starting PostgreSQL backup..."

    if ! test_postgres_connection; then
        return 1
    fi

    export PGPASSWORD="$POSTGRES_PASSWORD"
    local databases=("harsha_delights_gateway" "harsha_delights_sync" "harsha_medusa")

    for db in "${databases[@]}"; do
        log "Backing up PostgreSQL database: $db"

        local backup_file="$BACKUP_DIR/postgres_${db}_${TIMESTAMP}.dump"

        # Create backup using pg_dump with custom format
        if pg_dump \
            -h "$POSTGRES_HOST" \
            -p "$POSTGRES_PORT" \
            -U "$POSTGRES_USER" \
            -d "$db" \
            -f "$backup_file" \
            --format=custom \
            --verbose \
            --no-owner \
            --no-privileges; then

            # Compress the backup if using SQL format
            if [ "$BACKUP_COMPRESSION" = "true" ] && [[ "$backup_file" == *.sql ]]; then
                log "Compressing backup: $backup_file"
                gzip "$backup_file"
                backup_file="${backup_file}.gz"
            fi

            # Verify backup integrity
            if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
                local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
                log "PostgreSQL backup completed: $backup_file (${file_size} bytes)"
            else
                log "ERROR: PostgreSQL backup file is empty or missing: $backup_file"
                return 1
            fi
        else
            log "ERROR: Failed to backup PostgreSQL database: $db"
            return 1
        fi
    done

    unset PGPASSWORD
    log "All PostgreSQL backups completed successfully"
    return 0
}

# Backup Redis data
backup_redis() {
    log "Starting Redis backup..."

    local redis_host=${REDIS_HOST:-redis}
    local redis_port=${REDIS_PORT:-6379}
    local backup_file="$BACKUP_DIR/redis_${TIMESTAMP}.rdb"

    # Use redis-cli to save and copy the RDB file
    if redis-cli -h "$redis_host" -p "$redis_port" BGSAVE; then
        # Wait for background save to complete
        while [ "$(redis-cli -h "$redis_host" -p "$redis_port" LASTSAVE)" = "$(redis-cli -h "$redis_host" -p "$redis_port" LASTSAVE)" ]; do
            sleep 1
        done

        # Note: In a real deployment, you would copy the RDB file from Redis container
        # For now, we'll create a simple backup using redis-cli
        redis-cli -h "$redis_host" -p "$redis_port" --rdb "$backup_file"

        if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
            # Compress the backup
            if [ "$BACKUP_COMPRESSION" = "true" ]; then
                log "Compressing Redis backup: $backup_file"
                gzip "$backup_file"
                backup_file="${backup_file}.gz"
            fi

            local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
            log "Redis backup completed: $backup_file (${file_size} bytes)"
        else
            log "ERROR: Redis backup file is empty or missing: $backup_file"
            return 1
        fi
    else
        log "ERROR: Failed to backup Redis"
        return 1
    fi

    return 0
}

# Generate backup metadata
generate_metadata() {
    local metadata_file="$BACKUP_DIR/backup_metadata_${TIMESTAMP}.json"

    cat > "$metadata_file" << EOF
{
  "backup_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "backup_type": "databases",
  "version": "1.0",
  "environment": "${NODE_ENV:-development}",
  "retention_days": ${BACKUP_RETENTION_DAYS:-30},
  "compression_enabled": ${BACKUP_COMPRESSION:-true},
  "databases": {
    "mariadb": ["erpnext_hd", "espocrm_hd"],
    "postgresql": ["harsha_delights_gateway", "harsha_delights_sync", "harsha_medusa"],
    "redis": ["cache_data"]
  },
  "backup_files": [
$(find "$BACKUP_DIR" -name "*${TIMESTAMP}*" -type f | sed 's/.*/"&"/' | paste -sd, -)
  ]
}
EOF

    log "Backup metadata generated: $metadata_file"
}

# Upload to cloud storage (if configured)
upload_to_cloud() {
    if [ "$BACKUP_STORAGE_TYPE" = "s3" ] && [ -n "$BACKUP_S3_BUCKET" ]; then
        log "Uploading backups to S3..."

        # Upload all backup files for this timestamp
        find "$BACKUP_DIR" -name "*${TIMESTAMP}*" -type f | while read -r file; do
            local s3_key="databases/$(basename "$file")"
            if aws s3 cp "$file" "s3://$BACKUP_S3_BUCKET/$s3_key"; then
                log "Uploaded to S3: $s3_key"
            else
                log "ERROR: Failed to upload to S3: $file"
            fi
        done
    fi
}

# Main function
main() {
    log "=== Starting database backup process ==="

    local exit_code=0

    # Source configuration
    if [ -f "/config/backup.conf" ]; then
        source "/config/backup.conf"
    fi

    # Backup MariaDB
    if ! backup_mariadb; then
        exit_code=1
    fi

    # Backup PostgreSQL
    if ! backup_postgres; then
        exit_code=1
    fi

    # Backup Redis
    if ! backup_redis; then
        exit_code=1
    fi

    # Generate metadata
    generate_metadata

    # Upload to cloud if configured
    upload_to_cloud

    if [ $exit_code -eq 0 ]; then
        log "=== Database backup process completed successfully ==="
    else
        log "=== Database backup process completed with errors ==="
    fi

    return $exit_code
}

# Run main function
main "$@"
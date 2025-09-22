#!/bin/bash

# =====================================================================================
# HARSHA DELIGHTS - BACKUP SERVICE HEALTH CHECK
# =====================================================================================
# Health check script for the backup service container
# =====================================================================================

set -e

# Configuration
HEALTH_CHECK_FILE="/tmp/backup_health"
LOG_FILE="/logs/healthcheck.log"
MAX_LOG_AGE_HOURS=24

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check if backup daemon is running
check_backup_daemon() {
    if pgrep -f "backup-daemon.sh" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check if recent backup exists
check_recent_backup() {
    local backup_dir="/backups"
    local max_age_hours=25  # Allow 1 hour buffer for daily backups

    # Find the most recent backup file
    recent_backup=$(find "$backup_dir" -name "*.sql.gz" -o -name "*.tar.gz" | head -1)

    if [ -z "$recent_backup" ]; then
        log_message "WARNING: No backup files found"
        return 1
    fi

    # Check if the backup is recent enough
    if [ -n "$(find "$recent_backup" -mtime -1)" ]; then
        return 0
    else
        log_message "WARNING: Most recent backup is older than $max_age_hours hours"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local backup_dir="/backups"
    local min_free_space_mb=1000

    # Get available space in MB
    available_space=$(df "$backup_dir" | awk 'NR==2 {print int($4/1024)}')

    if [ "$available_space" -gt "$min_free_space_mb" ]; then
        return 0
    else
        log_message "ERROR: Low disk space - ${available_space}MB available, ${min_free_space_mb}MB required"
        return 1
    fi
}

# Function to check database connectivity
check_database_connectivity() {
    local postgres_host="${POSTGRES_HOST:-postgres}"
    local mariadb_host="${MARIADB_HOST:-mariadb}"
    local redis_host="${REDIS_HOST:-redis}"

    # Check PostgreSQL connectivity
    if ! pg_isready -h "$postgres_host" -p 5432 > /dev/null 2>&1; then
        log_message "WARNING: Cannot connect to PostgreSQL at $postgres_host"
        return 1
    fi

    # Check MariaDB connectivity
    if ! mysqladmin ping -h "$mariadb_host" -P 3306 --silent > /dev/null 2>&1; then
        log_message "WARNING: Cannot connect to MariaDB at $mariadb_host"
        return 1
    fi

    # Check Redis connectivity
    if ! redis-cli -h "$redis_host" -p 6379 ping > /dev/null 2>&1; then
        log_message "WARNING: Cannot connect to Redis at $redis_host"
        return 1
    fi

    return 0
}

# Function to rotate health check logs
rotate_logs() {
    if [ -f "$LOG_FILE" ]; then
        # Remove log entries older than MAX_LOG_AGE_HOURS
        local temp_file=$(mktemp)
        local cutoff_time=$(date -d "$MAX_LOG_AGE_HOURS hours ago" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -v-${MAX_LOG_AGE_HOURS}H '+%Y-%m-%d %H:%M:%S')

        awk -v cutoff="$cutoff_time" '$0 >= cutoff' "$LOG_FILE" > "$temp_file" 2>/dev/null || true
        mv "$temp_file" "$LOG_FILE"
    fi
}

# Main health check function
main() {
    local exit_code=0
    local status_message="OK"

    # Ensure log directory exists
    mkdir -p "$(dirname "$LOG_FILE")"

    # Rotate logs first
    rotate_logs

    log_message "Starting health check"

    # Check backup daemon
    if ! check_backup_daemon; then
        status_message="Backup daemon not running"
        exit_code=1
    fi

    # Check disk space
    if ! check_disk_space; then
        status_message="Insufficient disk space"
        exit_code=1
    fi

    # Check database connectivity (non-critical)
    if ! check_database_connectivity; then
        log_message "WARNING: Database connectivity issues detected"
        # Don't fail health check for database connectivity issues
    fi

    # Check recent backups (only if we've been running for more than 25 hours)
    if [ -f "/tmp/backup_service_started" ]; then
        service_start_time=$(cat /tmp/backup_service_started)
        current_time=$(date +%s)
        uptime_hours=$(( (current_time - service_start_time) / 3600 ))

        if [ "$uptime_hours" -gt 25 ]; then
            if ! check_recent_backup; then
                # Only warn, don't fail health check immediately
                log_message "WARNING: No recent backups found"
            fi
        fi
    else
        # Create startup timestamp
        date +%s > /tmp/backup_service_started
    fi

    # Update health status file
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $status_message" > "$HEALTH_CHECK_FILE"

    if [ $exit_code -eq 0 ]; then
        log_message "Health check passed"
        echo "HEALTHY"
    else
        log_message "Health check failed: $status_message"
        echo "UNHEALTHY: $status_message"
        exit $exit_code
    fi
}

main "$@"
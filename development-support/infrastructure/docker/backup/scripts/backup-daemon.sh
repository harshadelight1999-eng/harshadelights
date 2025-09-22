#!/bin/bash
# =====================================================================================
# HARSHA DELIGHTS BACKUP DAEMON
# =====================================================================================
# Main backup daemon that handles automated backups and cleanup
# =====================================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/logs/backup-daemon.log"
PID_FILE="/tmp/backup-daemon.pid"

# Source common functions
source "$SCRIPT_DIR/common.sh"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Cleanup function
cleanup() {
    log "Backup daemon shutting down..."
    rm -f "$PID_FILE"
    exit 0
}

# Signal handlers
trap cleanup SIGTERM SIGINT

# Check if already running
if [ -f "$PID_FILE" ]; then
    if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        error_exit "Backup daemon is already running"
    else
        rm -f "$PID_FILE"
    fi
fi

# Write PID file
echo $$ > "$PID_FILE"

# Initialize backup system
initialize_backup_system() {
    log "Initializing backup system..."

    # Create necessary directories
    mkdir -p /backups/{databases,files,logs}

    # Set permissions
    chmod 755 /backups

    # Initialize configuration
    if [ ! -f "/config/backup.conf" ]; then
        log "Creating default backup configuration..."
        cat > /config/backup.conf << EOF
# Harsha Delights Backup Configuration
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
BACKUP_COMPRESSION=${BACKUP_COMPRESSION:-true}
BACKUP_ENCRYPTION=${BACKUP_ENCRYPTION:-false}
MARIADB_HOST=${MARIADB_HOST:-mariadb}
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
EOF
    fi

    log "Backup system initialized successfully"
}

# Main backup function
run_backup() {
    local backup_type=$1

    log "Starting $backup_type backup..."

    case $backup_type in
        "databases")
            "$SCRIPT_DIR/backup-databases.sh"
            ;;
        "files")
            "$SCRIPT_DIR/backup-files.sh"
            ;;
        "full")
            "$SCRIPT_DIR/backup-databases.sh"
            "$SCRIPT_DIR/backup-files.sh"
            ;;
        *)
            log "WARNING: Unknown backup type: $backup_type"
            return 1
            ;;
    esac

    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log "$backup_type backup completed successfully"
    else
        log "ERROR: $backup_type backup failed with exit code $exit_code"
    fi

    return $exit_code
}

# Cleanup old backups
cleanup_old_backups() {
    local retention_days=${BACKUP_RETENTION_DAYS:-30}

    log "Cleaning up backups older than $retention_days days..."

    find /backups -type f -name "*.tar.gz" -mtime +$retention_days -delete
    find /backups -type f -name "*.sql" -mtime +$retention_days -delete
    find /backups -type f -name "*.dump" -mtime +$retention_days -delete

    log "Cleanup completed"
}

# Health check function
health_check() {
    # Check if backup directories exist
    if [ ! -d "/backups" ]; then
        return 1
    fi

    # Check if recent backup exists (within last 25 hours)
    if ! find /backups -name "*.tar.gz" -mtime -1 | grep -q .; then
        log "WARNING: No recent backups found"
        return 1
    fi

    return 0
}

# Main daemon loop
main() {
    log "Harsha Delights Backup Daemon starting..."

    # Initialize system
    initialize_backup_system

    # Start cron daemon
    crond -f &
    CRON_PID=$!

    log "Backup daemon started successfully (PID: $$)"
    log "Cron daemon started (PID: $CRON_PID)"

    # Main loop
    while true; do
        # Check if cron is still running
        if ! kill -0 $CRON_PID 2>/dev/null; then
            log "WARNING: Cron daemon died, restarting..."
            crond -f &
            CRON_PID=$!
        fi

        # Perform health check
        if ! health_check; then
            log "Health check failed"
        fi

        # Sleep for 1 hour
        sleep 3600
    done
}

# Handle command line arguments
case "${1:-daemon}" in
    "daemon")
        main
        ;;
    "backup")
        run_backup "${2:-full}"
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "health")
        health_check
        echo $?
        ;;
    *)
        echo "Usage: $0 {daemon|backup [type]|cleanup|health}"
        echo "  daemon  - Run as daemon (default)"
        echo "  backup  - Run backup (types: databases, files, full)"
        echo "  cleanup - Clean up old backups"
        echo "  health  - Check backup system health"
        exit 1
        ;;
esac
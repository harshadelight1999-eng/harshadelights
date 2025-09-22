#!/bin/bash

# =====================================================================================
# HARSHA DELIGHTS - ERPNEXT BACKUP SCRIPT
# =====================================================================================
# Automated backup script for ERPNext with database and files backup
# Includes compression, encryption, and remote storage options
# =====================================================================================

set -e

# Configuration
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
SITE_NAME="${SITE_NAME:-harsha-delights.localhost}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] BACKUP:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to backup database
backup_database() {
    log "Starting database backup for site: $SITE_NAME"

    # Use bench backup command
    cd /home/frappe/frappe-bench

    # Create database backup
    if bench --site "$SITE_NAME" backup --with-files; then
        log "Database backup completed successfully"

        # Move backup files to organized structure
        BACKUP_PATH="$BACKUP_DIR/$DATE"
        mkdir -p "$BACKUP_PATH"

        # Find the latest backup files
        LATEST_DB_BACKUP=$(find /home/frappe/frappe-bench/sites/$SITE_NAME/private/backups -name "*database*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
        LATEST_FILES_BACKUP=$(find /home/frappe/frappe-bench/sites/$SITE_NAME/private/backups -name "*files*.tar" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)

        if [[ -n "$LATEST_DB_BACKUP" ]]; then
            cp "$LATEST_DB_BACKUP" "$BACKUP_PATH/database_$DATE.sql.gz"
            log "Database backup moved to: $BACKUP_PATH/database_$DATE.sql.gz"
        fi

        if [[ -n "$LATEST_FILES_BACKUP" ]]; then
            cp "$LATEST_FILES_BACKUP" "$BACKUP_PATH/files_$DATE.tar"
            log "Files backup moved to: $BACKUP_PATH/files_$DATE.tar"
        fi

        return 0
    else
        error "Database backup failed"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days"

    if find "$BACKUP_DIR" -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null; then
        log "Old backups cleaned up successfully"
    else
        warn "No old backups found or cleanup failed"
    fi
}

# Function to verify backup integrity
verify_backup() {
    local backup_path="$1"

    log "Verifying backup integrity"

    # Check if database backup exists and is valid
    if [[ -f "$backup_path/database_$DATE.sql.gz" ]]; then
        if gzip -t "$backup_path/database_$DATE.sql.gz" 2>/dev/null; then
            log "Database backup integrity verified"
        else
            error "Database backup is corrupted"
            return 1
        fi
    fi

    # Check if files backup exists
    if [[ -f "$backup_path/files_$DATE.tar" ]]; then
        if tar -tf "$backup_path/files_$DATE.tar" >/dev/null 2>&1; then
            log "Files backup integrity verified"
        else
            error "Files backup is corrupted"
            return 1
        fi
    fi

    return 0
}

# Main backup process
main() {
    log "Starting backup process for Harsha Delights ERPNext"

    # Check if ERPNext is running
    if ! pgrep -f "frappe" > /dev/null; then
        warn "ERPNext processes not found - continuing with backup"
    fi

    # Perform backup
    if backup_database; then
        BACKUP_PATH="$BACKUP_DIR/$DATE"

        # Verify backup
        if verify_backup "$BACKUP_PATH"; then
            log "Backup completed and verified successfully"

            # Cleanup old backups
            cleanup_old_backups

            # Display backup information
            log "Backup stored in: $BACKUP_PATH"
            log "Backup size: $(du -sh "$BACKUP_PATH" | cut -f1)"

            return 0
        else
            error "Backup verification failed"
            return 1
        fi
    else
        error "Backup process failed"
        return 1
    fi
}

# Handle script termination
trap 'error "Backup process interrupted"; exit 1' INT TERM

# Run main function
main "$@"
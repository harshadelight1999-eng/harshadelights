#!/bin/bash

# =====================================================================================
# HARSHA DELIGHTS - ERPNEXT MONITORING SCRIPT
# =====================================================================================
# Comprehensive monitoring script for ERPNext health, performance, and resources
# Includes system metrics, database health, and business process monitoring
# =====================================================================================

set -e

# Configuration
SITE_NAME="${SITE_NAME:-harsha-delights.localhost}"
MONITOR_INTERVAL="${MONITOR_INTERVAL:-60}"
LOG_FILE="${LOG_FILE:-/var/log/erpnext-monitor.log}"
ALERT_THRESHOLD_CPU="${ALERT_THRESHOLD_CPU:-80}"
ALERT_THRESHOLD_MEMORY="${ALERT_THRESHOLD_MEMORY:-85}"
ALERT_THRESHOLD_DISK="${ALERT_THRESHOLD_DISK:-90}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] MONITOR: $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

error() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1"
    echo -e "${RED}$message${NC}" >&2
    echo "$message" >> "$LOG_FILE"
}

warn() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

success() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Function to check system resources
check_system_resources() {
    log "Checking system resources"

    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    cpu_usage=${cpu_usage%.*}  # Remove decimal part

    # Memory usage
    local mem_info=$(free | grep Mem)
    local total_mem=$(echo $mem_info | awk '{print $2}')
    local used_mem=$(echo $mem_info | awk '{print $3}')
    local mem_usage=$((used_mem * 100 / total_mem))

    # Disk usage
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

    log "System Resources - CPU: ${cpu_usage}%, Memory: ${mem_usage}%, Disk: ${disk_usage}%"

    # Check thresholds
    if [[ $cpu_usage -gt $ALERT_THRESHOLD_CPU ]]; then
        warn "High CPU usage detected: ${cpu_usage}%"
    fi

    if [[ $mem_usage -gt $ALERT_THRESHOLD_MEMORY ]]; then
        warn "High memory usage detected: ${mem_usage}%"
    fi

    if [[ $disk_usage -gt $ALERT_THRESHOLD_DISK ]]; then
        warn "High disk usage detected: ${disk_usage}%"
    fi
}

# Function to check ERPNext processes
check_erpnext_processes() {
    log "Checking ERPNext processes"

    # Check main ERPNext processes
    local processes=("gunicorn" "redis-server" "nginx" "node")
    local all_running=true

    for process in "${processes[@]}"; do
        if pgrep -f "$process" > /dev/null; then
            success "$process is running"
        else
            error "$process is not running"
            all_running=false
        fi
    done

    # Check Frappe bench processes
    if pgrep -f "frappe" > /dev/null; then
        success "Frappe processes are running"
    else
        error "Frappe processes are not running"
        all_running=false
    fi

    if [[ $all_running == true ]]; then
        success "All ERPNext processes are healthy"
    else
        warn "Some ERPNext processes are not running"
    fi
}

# Function to check database connectivity
check_database_connection() {
    log "Checking database connectivity"

    cd /home/frappe/frappe-bench

    # Try to connect to the database via bench
    if bench --site "$SITE_NAME" console <<< "exit()" 2>/dev/null; then
        success "Database connection is healthy"
        return 0
    else
        error "Database connection failed"
        return 1
    fi
}

# Function to check site health
check_site_health() {
    log "Checking site health for: $SITE_NAME"

    cd /home/frappe/frappe-bench

    # Check if site exists
    if [[ ! -d "sites/$SITE_NAME" ]]; then
        error "Site directory not found: $SITE_NAME"
        return 1
    fi

    # Check site configuration
    if [[ -f "sites/$SITE_NAME/site_config.json" ]]; then
        success "Site configuration exists"
    else
        error "Site configuration missing"
        return 1
    fi

    # Check if site is accessible
    if bench --site "$SITE_NAME" list-apps > /dev/null 2>&1; then
        success "Site is accessible and responsive"

        # List installed apps
        local apps=$(bench --site "$SITE_NAME" list-apps)
        log "Installed apps: $apps"
        return 0
    else
        error "Site is not accessible"
        return 1
    fi
}

# Function to check business critical data
check_business_data() {
    log "Checking business critical data"

    cd /home/frappe/frappe-bench

    # Check if we can query basic business data
    if bench --site "$SITE_NAME" console <<< "
import frappe
frappe.connect()
print('Total customers:', frappe.db.count('Customer'))
print('Total items:', frappe.db.count('Item'))
print('Active sales orders:', frappe.db.count('Sales Order', {'status': ['!=', 'Completed']}))
exit()
" 2>/dev/null; then
        success "Business data is accessible"
    else
        warn "Could not access business data"
    fi
}

# Function to check log files for errors
check_error_logs() {
    log "Checking for recent errors in logs"

    local error_count=0

    # Check ERPNext error logs
    if [[ -f "/home/frappe/frappe-bench/logs/bench.log" ]]; then
        local recent_errors=$(tail -100 /home/frappe/frappe-bench/logs/bench.log | grep -i "error\|exception\|traceback" | wc -l)
        if [[ $recent_errors -gt 0 ]]; then
            warn "Found $recent_errors recent errors in bench.log"
            error_count=$((error_count + recent_errors))
        fi
    fi

    # Check system logs
    local sys_errors=$(journalctl --since "1 hour ago" -p err --no-pager -q | wc -l)
    if [[ $sys_errors -gt 0 ]]; then
        warn "Found $sys_errors system errors in the last hour"
        error_count=$((error_count + sys_errors))
    fi

    if [[ $error_count -eq 0 ]]; then
        success "No recent errors found in logs"
    else
        warn "Total recent errors found: $error_count"
    fi
}

# Function to generate monitoring report
generate_report() {
    log "Generating monitoring report"

    cat << EOF

=====================================================================================
HARSHA DELIGHTS - ERPNEXT MONITORING REPORT
Generated: $(date)
=====================================================================================

SYSTEM STATUS:
- Hostname: $(hostname)
- Uptime: $(uptime -p)
- Load Average: $(uptime | awk -F'load average:' '{print $2}')

PROCESS STATUS:
$(ps aux | head -1)
$(ps aux | grep -E "(gunicorn|redis|nginx|frappe)" | grep -v grep | head -10)

DISK USAGE:
$(df -h)

MEMORY USAGE:
$(free -h)

NETWORK CONNECTIONS:
$(netstat -tuln | grep LISTEN | head -10)

=====================================================================================
EOF
}

# Function to run continuous monitoring
run_continuous_monitoring() {
    log "Starting continuous monitoring (interval: ${MONITOR_INTERVAL}s)"

    while true; do
        log "Starting monitoring cycle"

        check_system_resources
        check_erpnext_processes
        check_database_connection
        check_site_health
        check_business_data
        check_error_logs

        log "Monitoring cycle completed - next check in ${MONITOR_INTERVAL}s"
        sleep "$MONITOR_INTERVAL"
    done
}

# Function to run single check
run_single_check() {
    log "Running single monitoring check"

    check_system_resources
    check_erpnext_processes

    if check_database_connection; then
        check_site_health
        check_business_data
    fi

    check_error_logs
    generate_report

    success "Single monitoring check completed"
}

# Main function
main() {
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"

    case "${1:-single}" in
        "continuous")
            run_continuous_monitoring
            ;;
        "single")
            run_single_check
            ;;
        "report")
            generate_report
            ;;
        *)
            echo "Usage: $0 {single|continuous|report}"
            echo "  single     - Run a single monitoring check (default)"
            echo "  continuous - Run continuous monitoring"
            echo "  report     - Generate system report"
            exit 1
            ;;
    esac
}

# Handle script termination
trap 'log "Monitoring script terminated"; exit 0' INT TERM

# Run main function
main "$@"
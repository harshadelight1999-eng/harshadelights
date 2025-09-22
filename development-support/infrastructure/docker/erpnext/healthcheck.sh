#!/bin/bash
# =====================================================================================
# HARSHA DELIGHTS ERPNEXT HEALTH CHECK SCRIPT
# =====================================================================================

set -e

# Configuration
TIMEOUT=10
SITE_NAME=${SITE_NAME:-harshadelights.local}

# Health check functions
check_web_server() {
    curl -f -s --max-time $TIMEOUT http://localhost:8000/api/method/ping > /dev/null 2>&1
    return $?
}

check_database() {
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1
    return $?
}

check_redis() {
    redis-cli -h redis -p 6379 ping > /dev/null 2>&1
    return $?
}

check_site_status() {
    if [ -d "/home/frappe/frappe-bench/sites/$SITE_NAME" ]; then
        return 0
    else
        return 1
    fi
}

# Main health check
main() {
    local exit_code=0

    # Check web server
    if ! check_web_server; then
        echo "Web server health check failed"
        exit_code=1
    fi

    # Check database connection
    if ! check_database; then
        echo "Database health check failed"
        exit_code=1
    fi

    # Check Redis connection
    if ! check_redis; then
        echo "Redis health check failed"
        exit_code=1
    fi

    # Check site status
    if ! check_site_status; then
        echo "Site status check failed"
        exit_code=1
    fi

    if [ $exit_code -eq 0 ]; then
        echo "All health checks passed"
    fi

    exit $exit_code
}

main "$@"
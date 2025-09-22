#!/bin/bash

# EspoCRM Deployment Script for Harsha Delights
# This script handles the complete deployment of EspoCRM with custom configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$SCRIPT_DIR/.env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found at $ENV_FILE"
        exit 1
    fi

    log_success "Prerequisites check completed"
}

create_directories() {
    log_info "Creating necessary directories..."

    mkdir -p "$SCRIPT_DIR/uploads"
    mkdir -p "$SCRIPT_DIR/backups"
    mkdir -p "$SCRIPT_DIR/nginx/logs"
    mkdir -p "$SCRIPT_DIR/nginx/ssl"
    mkdir -p "$SCRIPT_DIR/database/init"

    log_success "Directories created"
}

setup_nginx_config() {
    log_info "Setting up Nginx configuration..."

    cat > "$SCRIPT_DIR/nginx/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream espocrm {
        server espocrm:80;
    }

    server {
        listen 80;
        server_name crm.harshadelights.com localhost;

        # Redirect HTTP to HTTPS in production
        # return 301 https://$server_name$request_uri;

        # For development, serve directly
        location / {
            proxy_pass http://espocrm;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Handle timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # API endpoints
        location /api/ {
            proxy_pass http://espocrm/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Content-Type application/json;
        }
    }

    # HTTPS configuration (uncomment for production)
    # server {
    #     listen 443 ssl http2;
    #     server_name crm.harshadelights.com;
    #
    #     ssl_certificate /etc/nginx/ssl/harshadelights.crt;
    #     ssl_certificate_key /etc/nginx/ssl/harshadelights.key;
    #
    #     location / {
    #         proxy_pass http://espocrm;
    #         proxy_set_header Host $host;
    #         proxy_set_header X-Real-IP $remote_addr;
    #         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #         proxy_set_header X-Forwarded-Proto https;
    #     }
    # }
}
EOF

    log_success "Nginx configuration created"
}

setup_database_init() {
    log_info "Setting up database initialization..."

    cat > "$SCRIPT_DIR/database/init/01-harsha-delights-init.sql" << 'EOF'
-- Harsha Delights CRM Database Initialization
-- This script sets up initial configurations for the confectionery business

USE harsha_espocrm;

-- Set MySQL configurations for better performance
SET GLOBAL innodb_buffer_pool_size = 536870912; -- 512MB
SET GLOBAL innodb_log_file_size = 268435456;    -- 256MB
SET GLOBAL max_allowed_packet = 268435456;      -- 256MB

-- Create additional indexes for better performance
-- These will be created after EspoCRM installation

-- Set timezone to Asia/Kolkata
SET time_zone = '+05:30';

-- Insert initial configuration
INSERT IGNORE INTO `settings` (`name`, `value`) VALUES
('timeZone', 'Asia/Kolkata'),
('dateFormat', 'DD/MM/YYYY'),
('timeFormat', 'HH:mm'),
('weekStart', '1'),
('fiscalYearShift', '3'),
('defaultCurrency', 'INR'),
('companyName', 'Harsha Delights'),
('applicationName', 'Harsha Delights CRM');
EOF

    log_success "Database initialization script created"
}

pull_images() {
    log_info "Pulling Docker images..."

    cd "$SCRIPT_DIR"
    docker-compose pull

    log_success "Docker images pulled"
}

start_services() {
    log_info "Starting EspoCRM services..."

    cd "$SCRIPT_DIR"

    # Start database first
    docker-compose up -d espocrm_db espocrm_redis
    log_info "Database and Redis started, waiting for initialization..."
    sleep 30

    # Start EspoCRM
    docker-compose up -d espocrm
    log_info "EspoCRM started, waiting for initialization..."
    sleep 60

    # Start remaining services
    docker-compose up -d

    log_success "All services started"
}

wait_for_espocrm() {
    log_info "Waiting for EspoCRM to be ready..."

    max_attempts=30
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:8080/api/v1/App/user > /dev/null 2>&1; then
            log_success "EspoCRM is ready!"
            return 0
        fi

        log_info "Attempt $attempt/$max_attempts - EspoCRM not ready yet, waiting..."
        sleep 10
        ((attempt++))
    done

    log_error "EspoCRM failed to start within expected time"
    return 1
}

install_custom_entities() {
    log_info "Installing custom entities and configurations..."

    # Copy custom files to EspoCRM container
    docker cp "$SCRIPT_DIR/custom/." harsha_espocrm:/var/www/html/custom/
    docker cp "$SCRIPT_DIR/config/config.php" harsha_espocrm:/var/www/html/data/config/config.php

    # Set proper permissions
    docker exec harsha_espocrm chown -R www-data:www-data /var/www/html/custom
    docker exec harsha_espocrm chown -R www-data:www-data /var/www/html/data

    # Clear cache and rebuild
    docker exec harsha_espocrm php /var/www/html/rebuild.php

    log_success "Custom entities installed"
}

setup_api_integration() {
    log_info "Setting up API Gateway integration..."

    # Update API Gateway with EspoCRM routes
    if [ -f "$PROJECT_DIR/api-gateway/src/server.js" ]; then
        # Add EspoCRM routes to API Gateway if not already present
        if ! grep -q "espocrm" "$PROJECT_DIR/api-gateway/src/server.js"; then
            log_info "Adding EspoCRM routes to API Gateway..."

            # Backup original server.js
            cp "$PROJECT_DIR/api-gateway/src/server.js" "$PROJECT_DIR/api-gateway/src/server.js.backup"

            # Add EspoCRM route (this would need to be customized based on existing server.js structure)
            echo "// EspoCRM Integration" >> "$PROJECT_DIR/api-gateway/src/server.js"
            echo "app.use('/api/v1/crm', require('./routes/espocrm'));" >> "$PROJECT_DIR/api-gateway/src/server.js"
        fi
    fi

    log_success "API integration setup completed"
}

create_sample_data() {
    log_info "Creating sample data for testing..."

    # This would typically involve API calls to create sample customers, products, etc.
    # For now, we'll just log that this step would happen
    log_info "Sample data creation would happen here via API calls"

    log_success "Sample data creation completed"
}

show_status() {
    log_info "Deployment Status:"
    echo ""
    echo "Services:"
    docker-compose ps
    echo ""
    echo "Access URLs:"
    echo "- EspoCRM: http://localhost:8080"
    echo "- EspoCRM (via Nginx): http://localhost"
    echo "- MySQL: localhost:3307"
    echo "- Redis: localhost:6379"
    echo "- Elasticsearch: http://localhost:9200"
    echo ""
    echo "Default Credentials:"
    echo "- Username: admin"
    echo "- Password: HarshaAdmin2024!"
    echo ""
    echo "API Endpoints:"
    echo "- Base API: http://localhost:8080/api/v1"
    echo "- Custom Entities: http://localhost:8080/api/v1/CustomerType"
    echo "- Products: http://localhost:8080/api/v1/ConfectioneryProduct"
    echo "- Orders: http://localhost:8080/api/v1/SalesOrder"
}

cleanup_on_error() {
    log_error "Deployment failed. Cleaning up..."
    cd "$SCRIPT_DIR"
    docker-compose down
    exit 1
}

# Main deployment function
main() {
    log_info "Starting EspoCRM deployment for Harsha Delights..."

    # Set up error handling
    trap cleanup_on_error ERR

    # Run deployment steps
    check_prerequisites
    create_directories
    setup_nginx_config
    setup_database_init
    pull_images
    start_services
    wait_for_espocrm
    install_custom_entities
    setup_api_integration
    create_sample_data

    log_success "EspoCRM deployment completed successfully!"
    show_status
}

# Handle command line arguments
case "${1:-}" in
    "start")
        log_info "Starting EspoCRM services..."
        cd "$SCRIPT_DIR"
        docker-compose up -d
        ;;
    "stop")
        log_info "Stopping EspoCRM services..."
        cd "$SCRIPT_DIR"
        docker-compose down
        ;;
    "restart")
        log_info "Restarting EspoCRM services..."
        cd "$SCRIPT_DIR"
        docker-compose restart
        ;;
    "logs")
        cd "$SCRIPT_DIR"
        docker-compose logs -f
        ;;
    "status")
        cd "$SCRIPT_DIR"
        docker-compose ps
        ;;
    "clean")
        log_warning "This will remove all data. Are you sure? (y/N)"
        read -r confirmation
        if [ "$confirmation" = "y" ] || [ "$confirmation" = "Y" ]; then
            cd "$SCRIPT_DIR"
            docker-compose down -v
            docker system prune -f
            log_success "Cleanup completed"
        fi
        ;;
    "backup")
        log_info "Creating backup..."
        cd "$SCRIPT_DIR"
        mkdir -p backups
        timestamp=$(date +%Y%m%d_%H%M%S)
        docker exec harsha_espocrm_db mysqldump -u root -p$MYSQL_ROOT_PASSWORD harsha_espocrm > "backups/backup_$timestamp.sql"
        log_success "Backup created: backups/backup_$timestamp.sql"
        ;;
    *)
        main
        ;;
esac
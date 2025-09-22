# Harsha Delights Docker Development Environment

Complete Docker development environment for the Harsha Delights confectionery system with ERPNext, API Gateway, Medusa.js e-commerce, EspoCRM, and real-time sync services.

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+ and Docker Compose 2.0+
- Git (for cloning the repository)
- At least 8GB RAM and 20GB free disk space

### One-Command Setup

```bash
# Clone and setup (if not already done)
git clone <repository-url>
cd harsha-delights

# Quick development setup
./scripts/dev-setup.sh quick

# OR Full setup with all services
./scripts/dev-setup.sh full
```

## 📋 Services Overview

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Core Services** | | | |
| API Gateway | 3000 | http://localhost:3000 | Central API orchestration |
| ERPNext | 8000 | http://localhost:8000 | ERP system |
| Medusa Store | 9000 | http://localhost:9000 | E-commerce backend |
| Medusa Admin | 7000 | http://localhost:7000 | E-commerce admin |
| EspoCRM | 8080 | http://localhost:8080 | Customer relationship management |
| Sync Services | 3005 | http://localhost:3005 | Real-time data synchronization |
| Nginx (Main) | 80/443 | http://localhost | Reverse proxy |
| **Databases** | | | |
| PostgreSQL | 5433 | localhost:5433 | Primary database |
| MariaDB | 3307 | localhost:3307 | ERPNext/EspoCRM database |
| Redis | 6380 | localhost:6380 | Caching and sessions |
| **Development Tools** | | | |
| Grafana | 3001 | http://localhost:3001 | Monitoring dashboards |
| Prometheus | 9090 | http://localhost:9090 | Metrics collection |
| Adminer | 8081 | http://localhost:8081 | Database administration |
| Redis Commander | 8082 | http://localhost:8082 | Redis management |
| MailHog | 8025 | http://localhost:8025 | Email testing |
| PgAdmin | 5050 | http://localhost:5050 | PostgreSQL admin |

## 🛠 Development Commands

Use the development command script for easy management:

```bash
# Service management
./scripts/dev-commands.sh start api-gateway    # Start specific service
./scripts/dev-commands.sh stop sync-services   # Stop specific service
./scripts/dev-commands.sh restart medusa       # Restart service
./scripts/dev-commands.sh status               # Show all service status

# Logs and debugging
./scripts/dev-commands.sh logs api-gateway     # View service logs
./scripts/dev-commands.sh logs-follow sync-services # Follow logs in real-time
./scripts/dev-commands.sh shell api-gateway    # Open shell in container

# Building and testing
./scripts/dev-commands.sh build api-gateway    # Build specific service
./scripts/dev-commands.sh rebuild-all          # Rebuild all services
./scripts/dev-commands.sh test all             # Run all tests

# Database operations
./scripts/dev-commands.sh db-connect postgres  # Connect to PostgreSQL
./scripts/dev-commands.sh db-connect mariadb   # Connect to MariaDB
./scripts/dev-commands.sh db-backup postgres   # Backup database

# Monitoring
./scripts/dev-commands.sh metrics              # Show metrics endpoints
./scripts/dev-commands.sh health               # Show health status
```

## 🔧 Configuration

### Environment Variables

Copy and customize the environment file:

```bash
cp .env.example .env
# Edit .env with your specific values
```

Key environment variables:

- **Database Passwords**: `MARIADB_ROOT_PASSWORD`, `POSTGRES_PASSWORD`
- **JWT Secrets**: `JWT_SECRET`, `MEDUSA_JWT_SECRET`
- **API Keys**: `ERPNEXT_API_KEY`, `STRIPE_API_KEY`
- **Feature Flags**: `ENABLE_REAL_TIME_SYNC`, `ENABLE_METRICS`

### Service Configuration

#### API Gateway
- **Config**: `/api-gateway/src/config/`
- **Logs**: `docker/api-gateway/logs/`
- **Debug Port**: 9229

#### Sync Services
- **Config**: `/sync-services/src/config/`
- **Logs**: `docker/sync-services/logs/`
- **Metrics**: http://localhost:9091/metrics
- **Debug Port**: 9231

#### Medusa.js
- **Admin**: http://localhost:7000
- **Store API**: http://localhost:9000
- **Config**: `/ecommerce-backend/medusa-config.js`

## 🏗 Architecture

### Network Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                     │
│                   (Port 80/443)                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ API Gateway │ │   ERPNext   │ │   Medusa    │
│ (Port 3000) │ │ (Port 8000) │ │ (Port 9000) │
└─────────────┘ └─────────────┘ └─────────────┘
       │              │              │
       └──────────────┼──────────────┘
                      │
            ┌─────────────────────┐
            │   Sync Services     │
            │    (Port 3005)      │
            └─────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ PostgreSQL  │ │   MariaDB   │ │    Redis    │
│ (Port 5433) │ │ (Port 3307) │ │ (Port 6380) │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Data Flow
1. **External Requests** → Nginx → API Gateway → Services
2. **Real-time Sync** → Sync Services ↔ ERPNext/Medusa/EspoCRM
3. **Database Operations** → Services → PostgreSQL/MariaDB
4. **Caching** → Services → Redis
5. **Monitoring** → Prometheus ← Services → Grafana

## 🔄 Development Workflow

### 1. Hot Reloading

The development environment supports hot reloading for:
- **API Gateway**: File changes in `/api-gateway/src/` trigger restart
- **Sync Services**: TypeScript changes in `/sync-services/src/` auto-compile
- **Medusa**: Changes in `/ecommerce-backend/src/` trigger restart

### 2. Debugging

Enable debugging for Node.js services:

```bash
# API Gateway debugging (port 9229)
docker-compose exec api-gateway npm run debug

# Sync Services debugging (port 9231)
docker-compose exec sync-services npm run debug
```

### 3. Testing

Run tests for specific services:

```bash
# Run API Gateway tests
./scripts/dev-commands.sh test api-gateway

# Run Sync Services tests
./scripts/dev-commands.sh test sync-services

# Run all tests
./scripts/dev-commands.sh test all
```

### 4. Database Management

#### PostgreSQL Operations
```bash
# Connect to PostgreSQL
./scripts/dev-commands.sh db-connect postgres

# Create backup
./scripts/dev-commands.sh db-backup postgres

# Access via PgAdmin: http://localhost:5050
```

#### MariaDB Operations
```bash
# Connect to MariaDB
./scripts/dev-commands.sh db-connect mariadb

# Create backup
./scripts/dev-commands.sh db-backup mariadb

# Access via Adminer: http://localhost:8081
```

## 📊 Monitoring and Observability

### Metrics Collection
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Node Exporter**: System metrics on port 9100
- **Redis Exporter**: Redis metrics on port 9121

### Service Metrics
- **API Gateway**: http://localhost:3000/metrics
- **Sync Services**: http://localhost:9091/metrics

### Log Aggregation
- **Service Logs**: `docker/[service]/logs/`
- **Centralized Logging**: Available via `docker-compose logs -f`

### Health Checks
```bash
# Check all service health
./scripts/dev-commands.sh health

# Individual service health
curl http://localhost:3000/health    # API Gateway
curl http://localhost:3005/health    # Sync Services
curl http://localhost:9000/health    # Medusa
```

## 🔐 Security Features

### Development Security
- **Non-root containers**: All services run as non-root users
- **Network isolation**: Services communicate via internal Docker network
- **Secret management**: Environment variables for sensitive data
- **Security headers**: Nginx implements security headers

### Production Hardening
- **SSL/TLS**: HTTPS configuration ready for production
- **Rate limiting**: Nginx implements API rate limiting
- **Security scanning**: Docker images include security tools
- **Backup encryption**: Automated encrypted backups

## 🔄 Backup and Recovery

### Automated Backups
- **Schedule**: Daily at 2:00 AM (configurable)
- **Retention**: 30 days (configurable)
- **Databases**: PostgreSQL, MariaDB, Redis
- **Application Data**: ERPNext sites, uploads, logs

### Manual Backup
```bash
# Create immediate backup
docker-compose exec backup /scripts/backup-databases.sh postgres mariadb redis

# Backup specific database
./scripts/dev-commands.sh db-backup postgres
```

### Recovery
```bash
# Restore from backup
docker-compose exec postgres psql -U harsha_admin < backup_file.sql
```

## 🚧 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check service status
./scripts/dev-commands.sh status

# Check logs for errors
./scripts/dev-commands.sh logs [service-name]

# Restart problematic service
./scripts/dev-commands.sh restart [service-name]
```

#### Database Connection Issues
```bash
# Verify database health
./scripts/dev-commands.sh health

# Check database logs
./scripts/dev-commands.sh logs postgres
./scripts/dev-commands.sh logs mariadb

# Test database connectivity
./scripts/dev-commands.sh db-connect postgres
```

#### Port Conflicts
```bash
# Check for port conflicts
netstat -tulpn | grep LISTEN

# Modify ports in .env file
# Restart services
docker-compose down && docker-compose up -d
```

#### Memory Issues
```bash
# Check container resource usage
docker stats

# Increase Docker memory limit
# Restart Docker Desktop/Engine
```

### Reset Environment
```bash
# Complete reset (removes all data)
./scripts/dev-commands.sh reset

# Partial reset (keeps volumes)
docker-compose down
docker-compose up -d
```

## 📁 File Structure

```
harsha-delights/
├── api-gateway/              # API Gateway service
├── ecommerce-backend/        # Medusa.js e-commerce
├── sync-services/           # Real-time sync services
├── erpnext_customizations/  # ERPNext customizations
├── espocrm/                # EspoCRM customizations
├── docker/                 # Docker configurations
│   ├── api-gateway/        # API Gateway Dockerfile & configs
│   ├── medusa/            # Medusa Dockerfile & configs
│   ├── sync-services/     # Sync Services Dockerfile & configs
│   ├── nginx/             # Nginx configuration
│   ├── postgres/          # PostgreSQL configuration
│   ├── mariadb/          # MariaDB configuration
│   ├── redis/            # Redis configuration
│   ├── grafana/          # Grafana dashboards
│   ├── prometheus/       # Prometheus configuration
│   └── backup/           # Backup service
├── scripts/               # Development scripts
│   ├── dev-setup.sh      # Environment setup
│   └── dev-commands.sh   # Development commands
├── logs/                 # Application logs
├── docker-compose.yml    # Main Docker Compose
├── docker-compose.override.yml # Development overrides
├── .env.example         # Environment template
└── DOCKER_SETUP_GUIDE.md # This documentation
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with hot reloading enabled
4. Run tests: `./scripts/dev-commands.sh test all`
5. Create pull request

### Code Quality
- **Linting**: ESLint for JavaScript/TypeScript
- **Formatting**: Prettier for code formatting
- **Testing**: Jest for unit/integration tests
- **Type Safety**: TypeScript for sync services

### Docker Best Practices
- Multi-stage builds for production optimization
- Security scanning with built-in tools
- Health checks for all services
- Proper resource limits and monitoring

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review service logs: `./scripts/dev-commands.sh logs [service]`
3. Check service health: `./scripts/dev-commands.sh health`
4. Create GitHub issue with logs and environment details

## 🎯 Next Steps

1. **Production Deployment**: Use production Docker Compose configuration
2. **CI/CD Integration**: Set up automated testing and deployment
3. **Monitoring**: Configure alerting and advanced monitoring
4. **Scaling**: Implement horizontal scaling for high-traffic scenarios
5. **Security**: Implement additional security measures for production

---

**Note**: This environment is optimized for development. For production deployment, use appropriate security measures, resource limits, and monitoring configurations.
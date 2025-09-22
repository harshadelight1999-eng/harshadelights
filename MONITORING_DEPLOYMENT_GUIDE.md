# Harsha Delights - Comprehensive Monitoring & Security Deployment Guide

## 🛡️ Enhanced Security & Monitoring Infrastructure

This guide covers the deployment of the comprehensive monitoring and security infrastructure for the Harsha Delights production system, including Sentry error tracking, DataDog APM, Winston logging, health checks, and advanced security hardening.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Steps](#deployment-steps)
5. [Monitoring Setup](#monitoring-setup)
6. [Security Configuration](#security-configuration)
7. [Health Checks](#health-checks)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)
10. [Best Practices](#best-practices)

## 🏗️ Architecture Overview

### Monitoring Stack
- **Sentry**: Error tracking and performance monitoring
- **DataDog**: APM, infrastructure monitoring, and custom metrics
- **Winston**: Structured logging with multiple transports
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Health Checks**: Comprehensive system health monitoring

### Security Features
- **Input Validation**: Zod schema validation with security hardening
- **Rate Limiting**: Multi-tier rate limiting with Redis
- **Security Headers**: Comprehensive security headers with Helmet
- **CORS**: Production-ready CORS configuration
- **Authentication**: JWT with optional 2FA
- **IP Filtering**: Configurable IP whitelist/blacklist

## 🔧 Prerequisites

### System Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for development)
- 4GB RAM minimum, 8GB recommended
- 20GB disk space minimum

### External Services
- **Sentry Account**: For error tracking
- **DataDog Account**: For APM and infrastructure monitoring
- **Email Service**: SMTP for notifications
- **SSL Certificates**: For production HTTPS

## ⚙️ Environment Configuration

### 1. Create Environment Files

Copy the environment templates:
```bash
cp .env.development .env
# For production:
cp .env.production .env
```

### 2. Configure Monitoring Services

#### Sentry Setup
1. Create a project at [sentry.io](https://sentry.io)
2. Get your DSN from the project settings
3. Update `.env`:
```env
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

#### DataDog Setup
1. Sign up at [datadoghq.com](https://datadoghq.com)
2. Get your API key from Organization Settings
3. Update `.env`:
```env
DD_API_KEY=your-datadog-api-key
DD_SITE=datadoghq.com
DD_SERVICE=harsha-delights-api-gateway
```

### 3. Security Configuration

Update these critical security settings in `.env`:
```env
# CRITICAL: Change these in production!
JWT_SECRET=generate-a-secure-256-bit-key
API_KEY_SECRET=generate-another-secure-256-bit-key
ENCRYPTION_KEY=32-character-encryption-key

# Database passwords
DATABASE_URL=postgres://user:secure_password@postgres:5432/db
REDIS_PASSWORD=secure_redis_password

# CORS origins
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### 4. Create Secrets Directory (Production)

```bash
mkdir -p secrets
echo "your-secure-postgres-password" > secrets/postgres_password.txt
echo "your-secure-jwt-secret" > secrets/jwt_secret.txt
echo "your-secure-api-key-secret" > secrets/api_key_secret.txt
echo "your-secure-grafana-password" > secrets/grafana_admin_password.txt
chmod 600 secrets/*
```

## 🚀 Deployment Steps

### Development Deployment

1. **Start Services**
```bash
docker-compose up -d
```

2. **Verify Services**
```bash
# Check all services are running
docker-compose ps

# Check logs
docker-compose logs api-gateway
```

3. **Access Services**
- API Gateway: http://localhost:4000
- API Documentation: http://localhost:4000/api/docs
- Health Checks: http://localhost:4000/health
- Metrics: http://localhost:4000/metrics
- Grafana: http://localhost:3001 (admin/password from env)
- Prometheus: http://localhost:9090

### Production Deployment

1. **Prepare Production Environment**
```bash
# Copy production configuration
cp docker-compose.production.yml docker-compose.yml

# Create secrets
./scripts/create-production-secrets.sh

# Build production images
docker-compose build
```

2. **Deploy with Security**
```bash
# Deploy production stack
docker-compose -f docker-compose.production.yml up -d

# Verify security configuration
docker-compose exec api-gateway curl -f http://localhost:4000/health
```

3. **Configure SSL (Production)**
```bash
# Install Let's Encrypt certificates
certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Update nginx configuration for SSL
cp configs/nginx/nginx.prod.conf configs/nginx/nginx.conf
docker-compose restart nginx
```

## 📊 Monitoring Setup

### 1. Grafana Dashboard Configuration

Access Grafana at http://localhost:3001:
- Username: `admin`
- Password: From `GRAFANA_ADMIN_PASSWORD` env var

Import these dashboards:
- Node.js Application Dashboard (ID: 11159)
- Docker Container Dashboard (ID: 893)
- PostgreSQL Dashboard (ID: 9628)
- Redis Dashboard (ID: 763)

### 2. Prometheus Alerts

The system includes pre-configured alerts for:
- Service availability
- High error rates
- Performance degradation
- Resource utilization
- Security events

View alerts at: http://localhost:9090/alerts

### 3. DataDog Integration

After deployment, verify DataDog integration:
1. Check the DataDog dashboard for your service
2. Verify APM traces are appearing
3. Confirm custom metrics are being sent
4. Set up alerts for critical thresholds

### 4. Sentry Configuration

Verify Sentry integration:
1. Check the Sentry dashboard for error reports
2. Verify performance monitoring data
3. Configure alert rules for critical errors
4. Set up Slack/Discord notifications

## 🔒 Security Configuration

### 1. Rate Limiting

The system implements multi-tier rate limiting:
- Authentication endpoints: 5 requests/15 minutes
- API endpoints: 100 requests/15 minutes
- Admin endpoints: 10 requests/15 minutes
- Upload endpoints: 20 requests/hour

Configure limits in `.env`:
```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_ADMIN_MAX=10
```

### 2. Input Validation

All endpoints use Zod schema validation with:
- SQL injection prevention
- XSS protection
- Path traversal prevention
- Command injection prevention

### 3. Security Headers

Comprehensive security headers are automatically applied:
- Content Security Policy
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

### 4. IP Filtering

Configure IP restrictions in `.env`:
```env
# Block specific IPs
BLOCKED_IPS=192.168.1.100,malicious.ip.address

# Allow only specific IPs (optional)
ALLOWED_IPS=203.0.113.0/24,trusted.subnet.range
```

## 🏥 Health Checks

### System Health Endpoints

- `/health` - Overall system health
- `/health/postgres` - Database health
- `/health/redis` - Cache health
- `/health/erpnext` - ERPNext service health
- `/health/medusa` - Medusa service health
- `/ready` - Kubernetes readiness probe
- `/live` - Kubernetes liveness probe

### Health Check Monitoring

Health checks run automatically every 30 seconds and monitor:
- Database connections
- External service availability
- System resources
- Authentication systems
- Rate limiting functionality

### Custom Health Checks

Add custom health checks in `/api-gateway/src/middleware/healthMiddleware.js`:

```javascript
healthRegistry.register('custom-service', async () => {
  // Your custom health check logic
  return { status: 'healthy', details: {} };
}, {
  critical: true,
  timeout: 5000,
  retries: 2
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Service Won't Start
```bash
# Check logs
docker-compose logs api-gateway

# Verify environment variables
docker-compose exec api-gateway env | grep -E "SENTRY|DD_"

# Check health
curl http://localhost:4000/health
```

#### 2. Monitoring Not Working
```bash
# Verify Sentry DSN
curl -X POST 'https://sentry.io/api/0/projects/YOUR_ORG/YOUR_PROJECT/store/' \
  -H 'X-Sentry-Auth: Sentry sentry_version=7' \
  -d '{"message": "test"}'

# Check DataDog agent
docker-compose logs datadog-agent

# Verify Prometheus targets
curl http://localhost:9090/api/v1/targets
```

#### 3. High Error Rates
```bash
# Check application logs
docker-compose exec api-gateway tail -f /app/logs/api-gateway.log

# Check security logs
docker-compose exec api-gateway tail -f /app/logs/api-gateway-security.log

# Monitor rate limiting
curl http://localhost:4000/metrics | grep rate_limit
```

### Log Analysis

Access structured logs:
```bash
# Application logs
docker-compose exec api-gateway cat /app/logs/api-gateway.log | jq '.'

# Error logs
docker-compose exec api-gateway cat /app/logs/api-gateway-error.log | jq '.'

# Security logs
docker-compose exec api-gateway cat /app/logs/api-gateway-security.log | jq '.'
```

## 🔄 Maintenance

### Regular Tasks

#### Daily
- Monitor error rates in Sentry and DataDog
- Check system health in Grafana
- Review security logs for suspicious activity

#### Weekly
- Update security patches
- Review and tune alert thresholds
- Analyze performance trends

#### Monthly
- Rotate API keys and secrets
- Review and update rate limiting rules
- Archive old logs and metrics

### Updates and Patches

```bash
# Update to latest version
git pull origin main
docker-compose build api-gateway
docker-compose up -d api-gateway

# Verify deployment
curl http://localhost:4000/health
```

### Backup and Recovery

```bash
# Backup configuration
tar -czf harsha-delights-config-$(date +%Y%m%d).tar.gz \
  configs/ secrets/ .env docker-compose*.yml

# Backup monitoring data
docker run --rm -v prometheus_data:/data \
  -v $(pwd)/backups:/backup alpine \
  tar -czf /backup/prometheus-$(date +%Y%m%d).tar.gz -C /data .
```

## 🎯 Best Practices

### Security
1. **Never commit secrets** - Use environment variables and secrets
2. **Rotate credentials regularly** - Update passwords and API keys monthly
3. **Monitor security events** - Set up alerts for suspicious activity
4. **Use HTTPS everywhere** - Encrypt all communications
5. **Regular security audits** - Review configurations and access logs

### Monitoring
1. **Set meaningful alerts** - Avoid alert fatigue with proper thresholds
2. **Use structured logging** - Include context and correlation IDs
3. **Monitor business metrics** - Track orders, payments, and user activity
4. **Regular dashboard reviews** - Ensure dashboards provide actionable insights

### Performance
1. **Monitor response times** - Set SLAs and alert on degradation
2. **Track resource usage** - Monitor CPU, memory, and database performance
3. **Optimize queries** - Use database monitoring to identify slow queries
4. **Cache effectively** - Monitor cache hit rates and optimize

### Operational
1. **Document everything** - Keep runbooks and procedures updated
2. **Test disaster recovery** - Regular backup and restore tests
3. **Monitor dependencies** - Track external service health
4. **Plan for scaling** - Monitor growth trends and capacity

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs using the commands provided
3. Create an issue in the project repository
4. Contact the development team at dev@harshadelights.com

---

## 🔗 Quick Reference

### Important URLs (Development)
- API Gateway: http://localhost:4000
- Health Checks: http://localhost:4000/health
- API Docs: http://localhost:4000/api/docs
- Metrics: http://localhost:4000/metrics
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

### Key Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api-gateway

# Health check
curl http://localhost:4000/health

# Stop services
docker-compose down

# Production deployment
docker-compose -f docker-compose.production.yml up -d
```

This deployment provides enterprise-grade monitoring and security for the Harsha Delights system. Follow this guide carefully and refer back to it for maintenance and troubleshooting.
# Harsha Delights Enterprise Platform Deployment Guide

## Overview

This guide covers the complete deployment of the Harsha Delights enterprise platform, including all integrated systems:

- **B2C E-commerce Platform** (Next.js)
- **B2B Portal** (Next.js with WorkOS)
- **Flutter Sales Mobile App**
- **Integration Services** (Node.js/TypeScript)
- **API Gateway**
- **Real-time Synchronization**
- **Unified Authentication**

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Flutter**: v3.24.3 or higher
- **Docker**: v20.10.0 or higher (optional)
- **Redis**: v6.0.0 or higher
- **PostgreSQL**: v13.0.0 or higher (for production)

### Development Tools
- Git
- VS Code or preferred IDE
- Android Studio (for Flutter development)
- Xcode (for iOS development, macOS only)

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd harshadelights
```

### 2. Install Dependencies

#### Integration Services
```bash
cd integration-services/unified-business-operations
npm install
```

#### B2C E-commerce
```bash
cd frontend-applications/02-b2c-ecommerce
npm install
```

#### B2B Portal
```bash
cd frontend-applications/03-b2b-portal
npm install
```

#### Flutter Sales App
```bash
cd 05-mobile-sales
flutter pub get
```

### 3. Environment Variables

Create `.env` files in each application directory:

#### Integration Services (.env)
```env
# Server Configuration
NODE_ENV=development
API_GATEWAY_PORT=4000
API_GATEWAY_URL=http://localhost:4000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# External API Configuration
B2B_PORTAL_URL=http://localhost:3003
B2C_ECOMMERCE_URL=http://localhost:3002
ERPNEXT_URL=http://localhost:8000
ESPOCRM_URL=http://localhost:8080

# API Keys (replace with actual keys)
ERPNEXT_API_KEY=your-erpnext-api-key
ERPNEXT_API_SECRET=your-erpnext-api-secret
ESPOCRM_API_KEY=your-espocrm-api-key
```

#### B2C E-commerce (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your-medusa-publishable-key
INTEGRATION_SERVICE_URL=http://localhost:4000
```

#### B2B Portal (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
WORKOS_API_KEY=your-workos-api-key
WORKOS_CLIENT_ID=your-workos-client-id
WORKOS_REDIRECT_URI=http://localhost:3003/callback
INTEGRATION_SERVICE_URL=http://localhost:4000
```

## Deployment Steps

### 1. Start Redis Server

#### Using Docker
```bash
docker run -d --name redis-server -p 6379:6379 redis:6-alpine
```

#### Using Local Installation
```bash
redis-server
```

### 2. Start Integration Services

```bash
cd integration-services/unified-business-operations
npm run dev
```

The integration server will start on `http://localhost:4000` with:
- REST API endpoints
- WebSocket server for real-time sync
- Authentication services
- ERP/CRM integration

### 3. Start B2C E-commerce Platform

```bash
cd frontend-applications/02-b2c-ecommerce
npm run dev
```

Access at: `http://localhost:3002`

### 4. Start B2B Portal

```bash
cd frontend-applications/03-b2b-portal
npm run dev
```

Access at: `http://localhost:3003`

### 5. Build and Run Flutter Sales App

#### For Development (Android)
```bash
cd 05-mobile-sales
flutter run
```

#### For Production Build
```bash
# Android
flutter build apk --release

# iOS (macOS only)
flutter build ios --release
```

## Production Deployment

### 1. Build Applications

#### Integration Services
```bash
cd integration-services/unified-business-operations
npm run build
npm start
```

#### Frontend Applications
```bash
# B2C E-commerce
cd frontend-applications/02-b2c-ecommerce
npm run build
npm start

# B2B Portal
cd frontend-applications/03-b2b-portal
npm run build
npm start
```

### 2. Docker Deployment (Recommended)

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  integration-service:
    build: ./integration-services/unified-business-operations
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    depends_on:
      - redis

  b2c-ecommerce:
    build: ./frontend-applications/02-b2c-ecommerce
    ports:
      - "3002:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://integration-service:4000
    depends_on:
      - integration-service

  b2b-portal:
    build: ./frontend-applications/03-b2b-portal
    ports:
      - "3003:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://integration-service:4000
    depends_on:
      - integration-service

volumes:
  redis_data:
```

Deploy with:
```bash
docker-compose up -d
```

### 3. Cloud Deployment Options

#### AWS Deployment
- **ECS/Fargate**: For containerized applications
- **EC2**: For traditional server deployment
- **ElastiCache**: For Redis
- **RDS**: For PostgreSQL database
- **CloudFront**: For CDN

#### Google Cloud Platform
- **Cloud Run**: For containerized applications
- **Compute Engine**: For VMs
- **Memorystore**: For Redis
- **Cloud SQL**: For PostgreSQL

#### Azure Deployment
- **Container Instances**: For containers
- **App Service**: For web applications
- **Azure Cache for Redis**: For Redis
- **Azure Database**: For PostgreSQL

## Configuration Management

### 1. Environment-Specific Configurations

Create separate configuration files for each environment:

- `config/development.json`
- `config/staging.json`
- `config/production.json`

### 2. Security Considerations

#### Production Security Checklist
- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS/TLS for all services
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting

#### JWT Security
```env
# Use strong, unique secrets (minimum 32 characters)
JWT_SECRET=your-256-bit-secret-key-here-change-this-in-production
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-key-here-change-this
```

## Monitoring and Logging

### 1. Application Monitoring

#### Health Check Endpoints
- Integration Service: `http://localhost:4000/health`
- B2C E-commerce: `http://localhost:3002/api/health`
- B2B Portal: `http://localhost:3003/api/health`

#### Integration Status
- Real-time status: `http://localhost:4000/api/integration/status`
- Connected clients: WebSocket connections
- Queue status: Sync event processing

### 2. Logging Configuration

All services include structured logging with different levels:
- **ERROR**: Critical issues requiring immediate attention
- **WARN**: Important issues that should be monitored
- **INFO**: General operational information
- **DEBUG**: Detailed debugging information (development only)

### 3. Performance Monitoring

#### Key Metrics to Monitor
- **Response Times**: API endpoint performance
- **WebSocket Connections**: Real-time sync health
- **Queue Length**: Sync event processing backlog
- **Memory Usage**: Application resource consumption
- **Redis Performance**: Cache hit rates and latency

## Testing

### 1. Integration Testing

```bash
# Test integration service
cd integration-services/unified-business-operations
npm test

# Test API endpoints
curl http://localhost:4000/health
curl http://localhost:4000/api/integration/status
```

### 2. End-to-End Testing

#### Authentication Flow
1. Login via B2B Portal
2. Verify token validation across services
3. Test WebSocket connection
4. Verify real-time sync

#### Data Synchronization
1. Create customer in B2B Portal
2. Verify sync to Integration Service
3. Check Flutter app receives update
4. Validate ERP synchronization

### 3. Flutter App Testing

```bash
cd 05-mobile-sales
flutter test
flutter integration_test
```

## Troubleshooting

### Common Issues

#### 1. WebSocket Connection Failures
- Check Redis connectivity
- Verify CORS configuration
- Ensure proper authentication headers

#### 2. Sync Event Processing Delays
- Monitor Redis queue length
- Check integration service logs
- Verify external API connectivity

#### 3. Authentication Issues
- Validate JWT secrets configuration
- Check token expiration settings
- Verify cross-platform token validation

#### 4. Flutter Build Issues
- Update Flutter SDK: `flutter upgrade`
- Clean build cache: `flutter clean`
- Regenerate platform files: `flutter create .`

### Debug Commands

```bash
# Check service status
curl http://localhost:4000/health

# View integration status
curl http://localhost:4000/api/integration/status

# Test authentication
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/auth/validate

# Monitor WebSocket connections
# Use browser dev tools or WebSocket testing tools
```

## Maintenance

### 1. Regular Updates

#### Weekly Tasks
- Monitor application logs
- Check system resource usage
- Review security alerts
- Update dependencies (patch versions)

#### Monthly Tasks
- Performance optimization review
- Security audit
- Backup verification
- Dependency updates (minor versions)

#### Quarterly Tasks
- Major dependency updates
- Security penetration testing
- Disaster recovery testing
- Architecture review

### 2. Backup Strategy

#### Data Backup
- Redis data snapshots
- Application logs
- Configuration files
- SSL certificates

#### Recovery Procedures
- Service restart procedures
- Database restoration
- Configuration rollback
- Emergency contact procedures

## Support and Documentation

### 1. API Documentation
- Integration Service API: `http://localhost:4000/api/docs`
- Authentication endpoints: `http://localhost:4000/api/auth`
- WebSocket events documentation

### 2. Architecture Diagrams
- System architecture overview
- Data flow diagrams
- Integration patterns
- Security model

### 3. Contact Information
- Development Team: dev-team@harshadelights.com
- System Administrator: admin@harshadelights.com
- Emergency Contact: emergency@harshadelights.com

---

## Quick Start Commands

```bash
# Complete setup and start all services
git clone <repository-url>
cd harshadelights

# Start Redis
docker run -d --name redis-server -p 6379:6379 redis:6-alpine

# Start Integration Service
cd integration-services/unified-business-operations
npm install && npm run dev &

# Start B2C E-commerce
cd ../../frontend-applications/02-b2c-ecommerce
npm install && npm run dev &

# Start B2B Portal
cd ../03-b2b-portal
npm install && npm run dev &

# Build Flutter App
cd ../../05-mobile-sales
flutter pub get && flutter run
```

All services will be running and integrated with real-time synchronization enabled.

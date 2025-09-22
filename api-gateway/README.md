# Harsha Delights Consolidated Backend

A unified backend service for the Harsha Delights confectionery system. This consolidated architecture integrates API Gateway, Integration Services, and Sync Services into a single high-performance Node.js application with shared middleware, database connection pooling, and modular service architecture.

## 🏗️ Consolidated Architecture

This unified backend combines three previously separate services:

### **Core Services (Integrated)**
- **API Gateway**: Central routing, authentication, and security
- **Integration Services**: Business operations coordination
- **Sync Services**: Real-time data synchronization

### **Shared Infrastructure**
- **Unified Middleware Stack**: Single authentication, validation, and security layer
- **Database Connection Pooling**: Optimized PostgreSQL, MySQL, and Redis connections
- **Modular Service Architecture**: Services as modules, not separate processes

### **Business Capabilities**
- **ERPNext Integration**: Customer management, order processing, inventory tracking
- **Real-time Synchronization**: Batch tracking with expiry monitoring
- **Dynamic Pricing Engine**: Customer segment-based pricing with business rules
- **Authentication & Security**: JWT and API key authentication with comprehensive security middleware

## 🚀 Features

### Authentication & Security
- JWT-based authentication with access and refresh tokens
- API key management with granular permissions
- Two-factor authentication (TOTP)
- Rate limiting with multiple tiers
- Comprehensive security middleware (CORS, Helmet, XSS protection, SQL injection prevention)
- Request sanitization and audit logging

### Service Integration
- ERPNext REST API integration
- Service discovery and health monitoring
- Circuit breaker pattern for resilience
- Load balancing across multiple upstream servers
- Request/response caching with Redis

### Business Logic
- Customer segmentation with dynamic assignment
- Batch tracking for confectionery products
- Dynamic pricing rules engine
- Real-time inventory monitoring
- Order processing pipeline

### Monitoring & Operations
- Comprehensive health checks
- Performance metrics collection
- Structured logging with multiple outputs
- Request tracing and audit trails
- Admin dashboard for system management

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **PostgreSQL**: 15.x (for API Gateway and Sync databases)
- **MariaDB**: 10.11.x (for ERPNext integration)
- **Redis**: 7.x (for caching and rate limiting)
- **Docker & Docker Compose**: For containerized deployment

## 🛠️ Installation

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshadelights/api-gateway.git
   cd api-gateway
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup databases:**
   ```bash
   # The unified backend uses connection pooling for all databases
   # Single PostgreSQL database for the consolidated backend
   createdb harsha_delights

   # Run database schema
   psql harsha_delights < database_schema_core.sql
   ```

5. **Start the consolidated backend:**
   ```bash
   npm run dev          # Starts unified API Gateway + Integration + Sync services
   ```

   The server includes:
   - API Gateway routes at `http://localhost:4000/api/*`
   - Integration service endpoints at `http://localhost:4000/api/integration/*`
   - Sync service endpoints at `http://localhost:4000/api/sync/*`

### Docker Deployment

#### Development Environment
```bash
# Start all services including development tools
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f api-gateway
```

#### Production Environment
```bash
# Start production services
docker-compose --profile production up -d

# With SSL/TLS termination
docker-compose --profile production --profile ssl up -d
```

## 🔧 Configuration

### Environment Variables

Key environment variables that need to be configured:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_NAME=harsha_delights_gateway
DB_USER=postgres
DB_PASS=your_password

# JWT Secrets (MUST change in production)
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# API Key Secret (MUST change in production)
API_KEY_SECRET=your_api_key_encryption_secret

# ERPNext Integration
ERPNEXT_BASE_URL=http://localhost:8000
ERPNEXT_API_KEY=your_erpnext_api_key
ERPNEXT_API_SECRET=your_erpnext_api_secret

# Redis
REDIS_HOST=localhost
REDIS_PASSWORD=your_redis_password
```

### Database Schema

The system uses three databases:

1. **API Gateway Database (PostgreSQL)**: User authentication, API keys, service routes, audit logs
2. **Sync Database (PostgreSQL)**: Real-time event synchronization, conflict resolution
3. **ERPNext Database (MariaDB)**: Custom confectionery extensions for customer segments, batch tracking, pricing rules

## 📖 API Documentation

### Access Documentation
- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI Spec**: `http://localhost:3000/api/docs.json`

### Authentication

#### JWT Bearer Token
```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:3000/api/v1/customers
```

#### API Key
```bash
curl -H "X-API-Key: <your-api-key>" \
     http://localhost:3000/api/v1/customers
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

#### Customer Management
- `GET /api/v1/customers` - List customers with segmentation
- `GET /api/v1/customers/{id}` - Get specific customer
- `GET /api/v1/customers/{id}/pricing` - Get customer-specific pricing

#### Inventory Management
- `GET /api/v1/inventory/stock-levels` - Real-time stock levels
- `GET /api/v1/inventory/batch-info` - Batch tracking information
- `GET /api/v1/inventory/batches/expiring` - Batches expiring soon

#### Pricing Engine
- `POST /api/v1/pricing/calculate` - Calculate dynamic pricing

#### Order Processing
- `GET /api/v1/orders` - List sales orders
- `POST /api/v1/orders` - Create new order
- `POST /api/v1/orders/process` - Process order with business rules

#### Admin Functions (Admin Role Required)
- `GET /api/v1/admin/dashboard` - System dashboard
- `GET /api/v1/admin/users` - User management
- `GET /api/v1/admin/routes` - Service route management
- `GET /api/v1/admin/audit-logs` - Audit trail access

## 🔒 Security Features

### Authentication Layers
- **JWT Authentication**: Stateless token-based authentication
- **API Key Authentication**: For service-to-service communication
- **Two-Factor Authentication**: TOTP-based additional security layer

### Security Middleware
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: Multiple tiers with Redis-backed storage
- **Input Sanitization**: XSS and SQL injection prevention
- **Security Headers**: Comprehensive HTTP security headers via Helmet
- **Request Validation**: Joi-based input validation

### Audit & Monitoring
- **Request Logging**: Every API request logged with context
- **Security Events**: Authentication failures, rate limit violations
- **Performance Metrics**: Response times, error rates, system health

## 📊 Monitoring & Health Checks

### Health Endpoints
- `GET /health` - Basic service health
- `GET /api/v1/admin/system/health` - Detailed system health (admin only)
- `GET /metrics` - System metrics (authenticated)

### Database Management Tools
- **pgAdmin**: `http://localhost:5050` (development)
- **Redis Commander**: `http://localhost:8081` (development)

### Logging
Structured logging with multiple outputs:
- Console output (development)
- File rotation (production)
- Separate files for errors, security events, and audit logs

## 🔄 Business Logic Features

### Customer Segmentation
- Dynamic customer segment assignment
- Priority-based segmentation (High/Medium/Low)
- Geographic, demographic, behavioral, and psychographic segments
- Automatic pricing rule application based on segments

### Confectionery-Specific Batch Tracking
- Manufacturing and expiry date tracking
- Quality grade monitoring (A/B/C grades)
- Nutritional and allergen information
- Storage condition requirements
- Automatic expiry alerts

### Dynamic Pricing Engine
- Customer segment-based pricing rules
- Time-sensitive pricing (seasonal, festival)
- Quantity-based discounts
- Mixed conditions support
- Automatic price calculation with rule validation

### Real-time Inventory
- Batch-level stock tracking
- Expiry monitoring with alerts
- Quality control integration
- Movement tracking and audit trail

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production with Docker
```bash
# Build and deploy
docker-compose --profile production up -d

# Scale API Gateway
docker-compose up -d --scale api-gateway=3

# View logs
docker-compose logs -f
```

### Health Monitoring
```bash
# Check service health
curl http://localhost:3000/health

# Check detailed health (requires authentication)
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/v1/admin/system/health
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "Authentication"
```

## 📝 Development

### Code Structure
```
src/
├── config/          # Configuration and database setup
├── controllers/     # HTTP request handlers
├── middleware/      # Express middleware (auth, security, rate limiting)
├── models/          # Database models and operations
├── routes/          # API route definitions
├── services/        # Business logic and external service integration
└── utils/           # Utility functions and helpers
```

### Adding New Features
1. Create models in `src/models/`
2. Implement business logic in `src/services/`
3. Add controllers in `src/controllers/`
4. Define routes in `src/routes/`
5. Add middleware if needed
6. Update API documentation with Swagger comments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: dev@harshadelights.com
- **Documentation**: `http://localhost:3000/api/docs`
- **Issues**: GitHub Issues

## 🔗 Related Projects

- **ERPNext Customizations**: Custom doctypes and business logic for confectionery operations
- **Medusa.js E-commerce**: Customer-facing e-commerce integration
- **EspoCRM Integration**: Customer relationship management
- **Mobile Applications**: React Native apps for field operations

---

**Harsha Delights API Gateway** - Powering confectionery business operations with modern API architecture.
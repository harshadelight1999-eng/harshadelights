# EspoCRM Deployment for Harsha Delights

This directory contains the complete EspoCRM deployment configuration customized for Harsha Delights confectionery business operations.

## Overview

The EspoCRM deployment includes:
- **Custom entities** for B2B/B2C customer segmentation
- **Confectionery-specific product management**
- **Order processing workflows**
- **Inventory management** with batch tracking
- **Quality control system**
- **API Gateway integration**
- **Indian business compliance** (GST, HSN codes)

## Architecture

```
├── docker-compose.yml          # Main Docker Compose configuration
├── config/
│   └── config.php             # EspoCRM business configuration
├── custom/                    # Custom entities and modifications
│   └── Espo/Custom/
│       ├── Resources/
│       │   ├── metadata/
│       │   │   ├── entityDefs/    # Entity definitions
│       │   │   └── clientDefs/    # Client configurations
│       │   └── layouts/           # Custom layouts
│       ├── Controllers/           # Custom controllers
│       └── Services/             # Custom services
├── middleware/                # API Gateway integration
│   ├── espocrm-client.js     # EspoCRM API client
│   └── espocrm-middleware.js # Express middleware
└── deploy.sh                 # Deployment script
```

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 80, 443, 3307, 6379, 8080, 8081, 9200 available

### 1. Deploy EspoCRM

```bash
# Clone and navigate to project directory
cd /Users/devji/harshadelights/espocrm

# Run deployment
./deploy.sh
```

### 2. Access EspoCRM

- **URL**: http://localhost:8080
- **Username**: admin
- **Password**: HarshaAdmin2024!

### 3. Configure API Gateway Integration

```bash
# Start API Gateway (if not already running)
cd ../api-gateway
npm start
```

## Custom Entities

### CustomerType
Defines B2B/B2C customer segments with specific pricing and payment terms.

**Fields:**
- Category (B2B/B2C)
- Pricing multiplier
- Credit limits
- Payment terms
- Minimum order amounts

**API Endpoint:** `/api/v1/crm/customer-types`

### ConfectioneryProduct
Complete product management for confectionery items.

**Features:**
- SKU and barcode tracking
- Batch and expiry management
- Nutritional information
- Allergen tracking
- HSN codes for GST
- Quality grades
- Storage conditions

**API Endpoint:** `/api/v1/crm/products`

### SalesOrder
Order processing with confectionery-specific workflows.

**Features:**
- Multi-item orders
- Customer-specific pricing
- Production scheduling
- Quality check requirements
- Delivery tracking
- GST calculations

**API Endpoint:** `/api/v1/crm/orders`

### InventoryItem
Comprehensive inventory management.

**Features:**
- Real-time stock levels
- Batch/lot tracking
- Expiry date monitoring
- Multi-warehouse support
- Automatic reorder alerts
- Quality status tracking

**API Endpoint:** `/api/v1/crm/inventory`

### QualityCheck
Quality control and compliance management.

**Features:**
- Multi-stage quality checks
- Sensory evaluations
- Compliance tracking
- Defect management
- Certificate generation
- Regulatory requirements

**API Endpoint:** `/api/v1/crm/quality-checks`

## API Integration

### Authentication

```javascript
// Example API client usage
const EspoCRMClient = require('./middleware/espocrm-client');

const client = new EspoCRMClient({
    baseURL: 'http://localhost:8080',
    apiKey: 'your_api_key',
    secretKey: 'your_secret_key'
});

await client.authenticate();
```

### Customer Management

```javascript
// Create customer
const customer = await client.syncCustomer({
    name: 'Sweet Treats Shop',
    emailAddress: 'contact@sweettreats.com',
    customerTypeId: 'b2b_retailers',
    phoneNumber: '+91 98765 43210'
});

// Get customer pricing
const pricing = await client.getCustomerPricing(
    customerId,
    productId,
    quantity
);
```

### Order Processing

```javascript
// Create sales order
const order = await client.createSalesOrder({
    customerId: 'customer_id',
    customerTypeId: 'b2b_retailers',
    orderDate: new Date().toISOString(),
    requiredDate: '2024-12-31',
    items: [
        {
            productId: 'product_id',
            quantity: 100,
            unitPrice: 25.50
        }
    ]
});

// Update order status
await client.updateOrderStatus(orderId, 'confirmed');
```

### Inventory Management

```javascript
// Update inventory
await client.updateInventory(
    productId,
    warehouseId,
    quantity,
    'production'
);

// Get inventory alerts
const alerts = await client.getInventoryAlerts();
```

## Configuration

### Environment Variables

Key configuration in `.env`:

```bash
# Database
MYSQL_PASSWORD=HarshaEspo2024!

# Admin credentials
ESPOCRM_ADMIN_USERNAME=admin
ESPOCRM_ADMIN_PASSWORD=HarshaAdmin2024!

# API configuration
ESPOCRM_API_KEY=harsha_api_key_2024
ESPOCRM_SECRET_KEY=harsha_secret_key_2024

# Business settings
COMPANY_NAME=Harsha Delights
COMPANY_GST_NUMBER=27ABCDE1234F1Z5
```

### Business Configuration

The system is pre-configured for:
- **Indian market** (INR currency, GST, HSN codes)
- **Confectionery business** (product categories, quality requirements)
- **B2B/B2C operations** (customer segmentation, pricing)
- **Multi-warehouse** inventory management
- **Quality compliance** (FSSAI, food safety)

## Management Commands

```bash
# Start services
./deploy.sh start

# Stop services
./deploy.sh stop

# Restart services
./deploy.sh restart

# View logs
./deploy.sh logs

# Check status
./deploy.sh status

# Create backup
./deploy.sh backup

# Clean everything (WARNING: removes all data)
./deploy.sh clean
```

## Monitoring and Maintenance

### Health Checks

Monitor service health:
```bash
# Check EspoCRM status
curl http://localhost:8080/api/v1/App/user

# Check database
docker exec harsha_espocrm_db mysql -u espocrm_user -p -e "SELECT 1"

# Check Redis
docker exec harsha_espocrm_redis redis-cli ping
```

### Backups

Automated daily backups are configured. Manual backup:
```bash
./deploy.sh backup
```

### Logs

Access logs for troubleshooting:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f espocrm

# API Gateway logs
tail -f ../api-gateway/logs/app.log
```

## Integration Points

### ERPNext Integration
- Customer synchronization
- Product data sync
- Order fulfillment
- Financial data exchange

### E-commerce Integration
- Product catalog sync
- Order import
- Inventory updates
- Customer data sync

### Payment Gateway Integration
- Order payment processing
- Transaction tracking
- Refund management

## Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check Docker status
   docker ps

   # Check logs
   ./deploy.sh logs
   ```

2. **Database connection issues**
   ```bash
   # Reset database
   docker-compose restart espocrm_db
   ```

3. **API integration failures**
   ```bash
   # Check API Gateway connectivity
   curl http://localhost:3000/health

   # Verify EspoCRM API
   curl http://localhost:8080/api/v1/App/user
   ```

4. **Custom entities not showing**
   ```bash
   # Rebuild EspoCRM
   docker exec harsha_espocrm php /var/www/html/rebuild.php
   ```

### Performance Optimization

- Increase memory limits in docker-compose.yml
- Configure MySQL buffer pool size
- Enable Redis caching
- Optimize Elasticsearch settings

## Security Considerations

- Change default passwords in production
- Configure SSL certificates
- Set up firewall rules
- Regular security updates
- API key rotation

## Support

For technical support:
- Check logs first: `./deploy.sh logs`
- Review EspoCRM documentation
- Verify API Gateway integration
- Contact system administrator

---

**Version**: 1.0.0
**Last Updated**: September 2024
**Environment**: Development/Production Ready
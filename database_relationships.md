# Harsha Delights Confectionery System - Database Relationships & Architecture

## Overview

This document describes the entity relationships, design decisions, and architecture considerations for the three core databases in the Harsha Delights confectionery system:

1. **ERPNext Extensions Database** (MariaDB)
2. **API Gateway Database** (PostgreSQL)
3. **Sync Database** (PostgreSQL)

## 1. ERPNext Extensions Database (MariaDB)

### Entity Relationship Diagram Description

#### Customer Segmentation Module

```
tabHD Customer Segment (1) ←→ (M) tabHD Customer Segment Assignment (M) ←→ (1) tabCustomer
                           ↓
                    tabHD Customer Territory Mapping
```

**Key Relationships:**
- **Customer Segment to Assignment**: One-to-Many relationship allowing multiple customers per segment
- **Customer to Assignment**: Many-to-Many through assignment table, enabling customers to belong to multiple segments
- **Customer to Territory Mapping**: Many-to-Many relationship for multi-territorial customer coverage

**Business Logic:**
- Customers can have multiple segment assignments with effective date ranges
- Only one primary segment per customer at any given time
- Historical segment assignment tracking for analytics
- Territory-based pricing and service level differentiation

#### Inventory & Batch Management Module

```
tabItem (1) ←→ (M) tabHD Batch Master (1) ←→ (M) tabHD Batch Movement
    ↓                           ↓
tabHD Item Warehouse Optimization ← → tabWarehouse
```

**Key Relationships:**
- **Item to Batch Master**: One-to-Many for multiple batches per item
- **Batch Master to Movement**: One-to-Many for complete audit trail
- **Item-Warehouse Optimization**: Cross-reference for stock optimization parameters

**Confectionery-Specific Features:**
- Expiry date tracking with alert levels (Critical: ≤7 days, Warning: ≤30 days)
- Quality grade classification (A, B, C)
- Storage condition tracking (temperature, humidity)
- Nutritional and allergen information storage
- FIFO/FEFO batch consumption logic support

#### Dynamic Pricing Module

```
tabHD Dynamic Pricing Rule (1) ←→ (M) tabHD Pricing Rule Item
                           ↓
                   tabHD Pricing Rule Application
```

**Key Relationships:**
- **Pricing Rule to Items**: One-to-Many for item-specific pricing configurations
- **Pricing Rule to Applications**: One-to-Many for audit trail and usage analytics

**Advanced Pricing Features:**
- Time-based pricing (day of week, time ranges)
- Seasonal and festival-specific pricing
- Tiered pricing based on quantity/amount thresholds
- Customer segment-specific pricing rules
- Compound discount calculations

### Performance Optimization Strategies

#### Indexing Strategy
```sql
-- Composite indexes for common query patterns
INDEX idx_customer_segment_active (customer, is_primary, status, effective_from)
INDEX idx_batch_expiry_status (expiry_date, status, available_qty)
INDEX idx_pricing_rule_priority_active (priority, is_active, valid_from, valid_to)
```

#### Partitioning Considerations
- **Batch Movement**: Partition by month for historical data management
- **Pricing Rule Applications**: Partition by application date for performance

## 2. API Gateway Database (PostgreSQL)

### Entity Relationship Diagram Description

#### Authentication & Authorization Module

```
api_users (1) ←→ (M) jwt_tokens
    ↓
api_keys (M) ←→ (1) api_users
    ↓
rate_limit_tracking
```

**Key Relationships:**
- **Users to JWT Tokens**: One-to-Many for session management
- **Users to API Keys**: One-to-Many for service-to-service authentication
- **API Keys to Rate Limiting**: One-to-Many for usage tracking

**Security Features:**
- JWT token rotation and revocation
- API key scoping and IP whitelisting
- Multi-tier rate limiting (per minute/hour/day)
- Failed login attempt tracking with account lockout

#### Service Routing & Health Module

```
service_routes (1) ←→ (M) api_audit_logs
    ↓
service_health
```

**Key Relationships:**
- **Routes to Audit Logs**: One-to-Many for request tracking
- **Routes to Health Status**: One-to-Many for availability monitoring

**Routing Features:**
- Dynamic service discovery
- Load balancing with multiple algorithms
- Circuit breaker pattern implementation
- Health check automation
- Request/response caching with TTL

### High Availability Design

#### Load Balancing Configuration
```json
{
  "upstream_servers": [
    {"url": "http://erpnext-1:8000", "weight": 1, "status": "active"},
    {"url": "http://erpnext-2:8000", "weight": 1, "status": "active"}
  ],
  "load_balancer_type": "weighted_round_robin",
  "health_check_interval": 30
}
```

#### Circuit Breaker Implementation
- **Failure Threshold**: 5 consecutive failures trigger circuit open
- **Recovery Timeout**: 60 seconds before attempting recovery
- **Half-Open State**: Single test request before full recovery

## 3. Sync Database (PostgreSQL)

### Entity Relationship Diagram Description

#### Event Processing Module

```
sync_events (1) ←→ (M) sync_status
    ↓                    ↓
sync_conflicts ←→ sync_metrics
    ↓
sync_configurations
```

**Key Relationships:**
- **Events to Status**: One-to-Many for tracking sync operations
- **Status to Conflicts**: One-to-Many for conflict resolution
- **Events to Configurations**: Many-to-One for sync rule application

**Event Processing Flow:**
1. **Event Generation**: Real-time capture from source systems
2. **Event Routing**: Target service determination
3. **Conflict Detection**: Data consistency validation
4. **Resolution Strategy**: Automated or manual conflict resolution

#### Data Synchronization Patterns

##### Real-Time Synchronization
```
Source System Change → Event Generation → Target System Update
                 ↓
            Conflict Detection → Resolution → Audit Trail
```

##### Batch Synchronization
```
Scheduled Trigger → Bulk Data Extract → Transformation → Bulk Load
                                  ↓
                            Validation → Error Handling → Metrics
```

### Conflict Resolution Strategies

#### Automatic Resolution Rules
1. **Source Wins**: For master data updates from authoritative systems
2. **Target Wins**: For local modifications with business significance
3. **Merge Strategy**: For non-conflicting field updates
4. **Business Rule**: Custom logic based on data type and context

#### Manual Resolution Workflow
```
Conflict Detection → Assignment → Review → Resolution → Validation → Closure
```

### Performance & Scalability Design

#### Event Partitioning Strategy
```sql
-- Partition sync_events by month for optimal performance
CREATE TABLE sync_events_y2024m01 PARTITION OF sync_events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### Retention Policies
- **Event Logs**: 6 months for active analysis, 2 years for compliance
- **Audit Trails**: 7 years for regulatory requirements
- **Metrics**: 1 year for performance trend analysis

## Cross-Database Relationships

### System Integration Points

#### ERPNext ↔ API Gateway
```
Customer Data → API Gateway → External CRM
Item Data → API Gateway → E-commerce Platform
Pricing Rules → API Gateway → Mobile Application
```

#### API Gateway ↔ Sync Database
```
API Requests → Event Generation → Sync Processing
Service Metrics → Performance Monitoring → System Optimization
```

#### ERPNext ↔ Sync Database
```
Document Changes → Event Capture → Multi-system Synchronization
Business Transactions → Audit Trail → Compliance Reporting
```

### Data Flow Architecture

#### Real-Time Order Processing
1. **Customer Places Order** (External System)
2. **API Gateway Authentication** → Route to ERPNext
3. **ERPNext Processing** → Customer Validation, Inventory Check, Pricing Calculation
4. **Event Generation** → Sync Database captures transaction
5. **Downstream Updates** → Warehouse Management, CRM, Analytics

#### Inventory Management Flow
1. **Stock Movement** (ERPNext) → Event Generation
2. **Batch Tracking Update** → Expiry Monitoring
3. **Multi-Warehouse Sync** → Cross-location visibility
4. **Reorder Point Calculation** → Automated procurement triggers

## Security & Compliance Considerations

### Data Protection
- **Encryption at Rest**: AES-256 for sensitive customer data
- **Encryption in Transit**: TLS 1.3 for all API communications
- **Data Masking**: PII protection in non-production environments
- **Access Control**: Role-based permissions with principle of least privilege

### Audit & Compliance
- **Complete Audit Trail**: All data changes tracked with user attribution
- **Regulatory Compliance**: GDPR-compliant data handling and retention
- **Financial Audit**: Transaction-level tracking for revenue recognition
- **Data Lineage**: Source-to-destination data tracking for validation

### Backup & Recovery
- **ERPNext Database**: Daily full backup with hourly incremental
- **API Gateway Database**: Real-time replication with 4-hour RPO
- **Sync Database**: Continuous replication with instant failover

## Monitoring & Alerting

### Key Performance Indicators

#### ERPNext Extensions
- **Batch Expiry Alerts**: Daily scan for expiring inventory
- **Customer Segment Performance**: Monthly revenue analysis
- **Pricing Rule Effectiveness**: Discount impact tracking

#### API Gateway
- **Response Time**: 95th percentile < 200ms
- **Availability**: 99.9% uptime SLA
- **Rate Limit Violations**: Alert on excessive rate limiting

#### Sync Database
- **Event Processing Lag**: Real-time events processed within 5 seconds
- **Conflict Resolution Time**: 90% of conflicts auto-resolved
- **Data Quality Score**: 99.5% accuracy target

### Alerting Configuration
```yaml
alerts:
  critical:
    - API Gateway down for > 1 minute
    - Sync failures > 10 in 1 hour
    - Database connection failures
  warning:
    - Response time > 500ms for 5 minutes
    - Batch expiry within 7 days
    - Unresolved conflicts > 24 hours
```

## Scalability & Growth Planning

### Horizontal Scaling Strategy
- **Database Sharding**: Customer-based partitioning for ERPNext
- **Service Mesh**: Microservices architecture with auto-scaling
- **CDN Integration**: Static content delivery optimization
- **Caching Layers**: Redis clusters for frequently accessed data

### Capacity Planning
- **Storage Growth**: 20% annual increase projection
- **Transaction Volume**: 5x growth over 3 years
- **User Base Expansion**: Multi-tenant architecture support
- **Geographic Expansion**: Regional data center deployment

## Migration & Deployment Strategy

### Database Migration Approach
1. **Schema Versioning**: Flyway-based migration management
2. **Zero-Downtime Deployment**: Blue-green deployment strategy
3. **Rollback Procedures**: Automated rollback on failure detection
4. **Data Validation**: Post-migration integrity checks

### Testing Strategy
- **Unit Tests**: Individual component validation
- **Integration Tests**: Cross-system data flow validation
- **Performance Tests**: Load testing under peak conditions
- **Disaster Recovery Tests**: Quarterly failover validation

This comprehensive database design provides a robust foundation for Harsha Delights' confectionery operations, ensuring scalability, reliability, and performance while maintaining data integrity and supporting complex business workflows.
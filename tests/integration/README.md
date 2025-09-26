# Integration Tests - Harsha Delights

Comprehensive integration tests for the Harsha Delights confectionery management system, covering end-to-end business workflows, pricing engine, and real-time synchronization services.

## Test Coverage

### 1. Pricing Engine Integration Tests (`pricing-engine-integration.test.js`)
- **Dynamic Pricing Rule Creation**: Tests creation of percentage discount, volume discount slabs
- **Price Calculation API**: Base pricing, customer segment discounts, volume discounts
- **Analytics Tracking**: Rule usage tracking, effectiveness metrics
- **Error Handling**: Invalid customers, items, concurrent requests
- **Performance**: Handles multiple concurrent pricing requests

### 2. Sync Services Integration Tests (`sync-services-integration.test.js`)
- **Customer Sync Operations**: Create, update, delete across ERPNext, Medusa, EspoCRM
- **Real-time WebSocket Updates**: Event broadcasting, subscription management
- **Bulk Sync Operations**: Full synchronization, incremental updates
- **Conflict Resolution**: Handles concurrent modifications, automatic resolution
- **System Health Monitoring**: Service status, performance metrics
- **Connection Management**: WebSocket reconnection, subscription handling

### 3. End-to-End Workflow Tests (`end-to-end-workflow.test.js`)
- **Complete Order Lifecycle**: Browse → Price → Order → Fulfill → Track
- **Inventory Management**: Batch allocation, stock movements, expiry alerts
- **Customer Experience**: Order tracking, service inquiries, recommendations
- **Business Intelligence**: Sales analytics, pricing effectiveness, inventory turnover
- **System Performance**: Health metrics, concurrent operations, monitoring

## Prerequisites

### Database Setup
- MySQL 8.0+ running locally or accessible server
- Redis for caching and session management
- ERPNext database schema (basic tables will be created automatically)

### Environment Variables
```bash
# Database Configuration
ERPNEXT_DB_HOST=localhost
ERPNEXT_DB_PORT=3306
ERPNEXT_DB_USER=root
ERPNEXT_DB_PASSWORD=your_password
ERPNEXT_DB_NAME=erpnext_test

# Service Ports
API_GATEWAY_PORT=3000
SYNC_SERVICES_PORT=3001
PUBLIC_WEBSITE_PORT=3002
SYNC_WS_URL=ws://localhost:3001

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Service Dependencies
Ensure the following services are running:
- API Gateway (`../../api-gateway`)
- Sync Services (`../../sync-services`)
- Public Website (`../../frontend-applications/01-public-website`)

## Installation

```bash
cd tests/integration
npm install
```

## Running Tests

### Setup Test Environment
```bash
npm run setup
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Pricing Engine Tests
npm run test:pricing

# Sync Services Tests
npm run test:sync

# End-to-End Workflow Tests
npm run test:e2e
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Architecture

### Test Data Management
- **Setup**: Creates test customers, items, batches, pricing rules
- **Isolation**: Each test cleans up its data to prevent interference
- **Realistic Data**: Uses confectionery-specific items and business scenarios

### Real-time Testing
- **WebSocket Integration**: Tests real-time updates during sync operations
- **Message Validation**: Verifies correct event types and data structures
- **Timing Considerations**: Includes appropriate waits for async operations

### Error Scenarios
- **Graceful Degradation**: Tests system behavior with invalid data
- **Conflict Resolution**: Concurrent operations and conflict handling
- **Network Issues**: Connection failures and reconnection logic

## Test Data

### Sample Customer
```javascript
{
  id: 'E2E-CUSTOMER-001',
  name: 'E2E Test Customer',
  email: 'e2e.test@harshadelights.com',
  customer_group: 'Premium',
  territory: 'Mumbai'
}
```

### Sample Items
- **E2E-KAJU-KATLI**: Premium Kaju Katli (₹800/kg)
- **E2E-GULAB-JAMUN**: Fresh Gulab Jamun (₹400/kg)

### Sample Pricing Rules
- **Volume Discounts**: 5% (1-10 units), 10% (11-50 units), 15% (51+ units)
- **Customer Segment**: 15% discount for Premium customers
- **Bulk Order**: 12% discount for orders ≥10 units

## Key Test Scenarios

### 1. Dynamic Pricing Workflow
```
Browse Products → Add to Cart → Calculate Pricing → Apply Discounts → Create Order
```
- Tests volume discounts taking precedence over segment discounts
- Validates pricing rule analytics and usage tracking
- Ensures concurrent pricing requests work correctly

### 2. Inventory Management Workflow
```
Batch Creation → Stock Allocation → Order Fulfillment → Consumption Logging → Expiry Alerts
```
- Tests batch tracking with quality parameters
- Validates stock movement across warehouses
- Ensures traceability through consumption logs

### 3. Real-time Sync Workflow
```
Data Change → Event Generation → Queue Processing → System Sync → WebSocket Broadcast
```
- Tests customer sync across ERPNext, Medusa, EspoCRM
- Validates conflict resolution for concurrent updates
- Ensures real-time updates reach all subscribed clients

### 4. Complete Business Workflow
```
Customer Registration → Product Browse → Price Calculation → Order Placement → 
Inventory Allocation → Quality Inspection → Order Fulfillment → Customer Service
```
- Tests end-to-end order lifecycle
- Validates integration between all system components
- Ensures business rules are enforced throughout

## Performance Benchmarks

### Expected Response Times
- **Pricing Calculation**: < 500ms for 10 items
- **Order Creation**: < 1 second including batch allocation
- **Sync Operations**: < 2 seconds for single entity sync
- **WebSocket Updates**: < 100ms propagation time

### Concurrent Operation Limits
- **Pricing Requests**: 50+ concurrent requests handled
- **Order Creation**: 10+ concurrent orders processed
- **Sync Operations**: 20+ operations queued simultaneously

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check MySQL service
   sudo service mysql status
   
   # Verify credentials
   mysql -h localhost -u root -p
   ```

2. **WebSocket Connection Failures**
   ```bash
   # Check if sync services are running
   curl http://localhost:3001/health
   
   # Verify WebSocket endpoint
   wscat -c ws://localhost:3001
   ```

3. **Test Data Conflicts**
   ```bash
   # Clean up test data
   npm run cleanup
   
   # Reset test environment
   npm run setup
   ```

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=harsha:* npm test
LOG_LEVEL=debug npm test
```

## Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/integration-tests.yml
- name: Setup Test Environment
  run: |
    npm run setup
    
- name: Run Integration Tests
  run: |
    npm run test:coverage
    
- name: Cleanup
  run: |
    npm run cleanup
```

### Test Reporting
- **Mocha Spec Reporter**: Detailed test results
- **NYC Coverage**: Code coverage metrics
- **JUnit XML**: CI/CD integration format

## Contributing

### Adding New Tests
1. Follow existing test structure and naming conventions
2. Include proper setup/teardown for test data
3. Add WebSocket message validation for sync operations
4. Include performance assertions where relevant
5. Document new test scenarios in this README

### Test Data Guidelines
- Use prefixes like 'E2E-', 'TEST-', 'SYNC-' for easy identification
- Clean up all created data in test teardown
- Use realistic confectionery business data
- Include both positive and negative test cases

### Performance Considerations
- Set appropriate timeouts for different operations
- Include concurrent operation tests
- Monitor resource usage during test runs
- Validate system behavior under load

## Support

For questions or issues with integration tests:
- Check test logs for detailed error information
- Review WebSocket message flow for sync issues
- Verify database state after test failures
- Contact the development team for complex scenarios
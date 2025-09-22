# Integration Testing Guide

## Overview

This guide provides comprehensive testing procedures for the Harsha Delights enterprise integration platform, covering all systems and their interactions.

## Testing Environment Setup

### Prerequisites
- All services running (Integration Service, B2C, B2B, Flutter app)
- Redis server active
- Test data populated
- API testing tools (Postman, curl, or similar)

### Test Data Setup

```bash
# Create test customers, products, and orders
curl -X POST http://localhost:4000/api/test/setup-data \
  -H "Content-Type: application/json" \
  -d '{"environment": "testing"}'
```

## Authentication Testing

### 1. Login Flow Testing

```bash
# Test login endpoint
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sales.manager@harshadelights.com",
    "password": "testpassword",
    "platform": "b2b-portal",
    "deviceInfo": {
      "deviceId": "test-device-001",
      "userAgent": "Test-Client/1.0"
    }
  }'
```

Expected Response:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

### 2. Token Validation Testing

```bash
# Test token validation
curl -X GET http://localhost:4000/api/auth/validate \
  -H "Authorization: Bearer <access_token>"
```

### 3. Cross-Platform Authentication

```bash
# Test Flutter app authentication
curl -X GET http://localhost:4000/api/auth/validate/flutter \
  -H "Authorization: Bearer <access_token>"

# Test B2B portal authentication
curl -X GET http://localhost:4000/api/auth/validate/b2b \
  -H "Authorization: Bearer <access_token>"
```

## Real-Time Synchronization Testing

### 1. WebSocket Connection Testing

```javascript
// JavaScript WebSocket test
const ws = new WebSocket('ws://localhost:4000/ws');

ws.onopen = function() {
  console.log('WebSocket connected');
  
  // Subscribe to channels
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['customer-updates', 'order-updates', 'all']
  }));
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### 2. Sync Event Testing

```bash
# Test customer update sync
curl -X POST http://localhost:4000/api/integration/sync/customer/test-customer-001 \
  -H "Authorization: Bearer <access_token>"

# Test order sync
curl -X POST http://localhost:4000/api/integration/sync/order/test-order-001 \
  -H "Authorization: Bearer <access_token>"
```

### 3. Event Broadcasting Testing

```bash
# Monitor sync events
curl -X GET http://localhost:4000/api/integration/status \
  -H "Authorization: Bearer <access_token>"
```

## ERP Integration Testing

### 1. Customer Synchronization

```bash
# Test customer sync from ERP
curl -X POST http://localhost:4000/api/erp/sync/customers \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"

# Verify customer data
curl -X GET http://localhost:4000/api/customers \
  -H "Authorization: Bearer <access_token>"
```

### 2. Inventory Synchronization

```bash
# Test inventory update
curl -X PUT http://localhost:4000/api/erp/inventory/product-001 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100, "reserved": 10}'
```

### 3. Order Processing

```bash
# Test order creation and ERP sync
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test-customer-001",
    "items": [
      {"productId": "product-001", "quantity": 5, "price": 25.99}
    ],
    "total": 129.95
  }'
```

## B2B Portal Integration Testing

### 1. Customer Management

```bash
# Test B2B customer creation
curl -X POST http://localhost:3003/api/customers \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test B2B Customer",
    "email": "test@b2bcustomer.com",
    "tier": "gold",
    "territory": "north"
  }'
```

### 2. Order Processing

```bash
# Test B2B order creation
curl -X POST http://localhost:3003/api/orders \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "b2b-customer-001",
    "items": [
      {"productId": "product-001", "quantity": 50}
    ]
  }'
```

## Flutter App Integration Testing

### 1. Authentication Flow

```dart
// Test Flutter authentication
final response = await http.post(
  Uri.parse('http://localhost:4000/api/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({
    'email': 'sales.rep@harshadelights.com',
    'password': 'testpassword',
    'platform': 'flutter-app',
    'deviceInfo': {
      'deviceId': 'flutter-test-device',
      'userAgent': 'Flutter-SalesApp/1.0'
    }
  }),
);
```

### 2. WebSocket Integration

```dart
// Test WebSocket connection from Flutter
final channel = IOWebSocketChannel.connect(
  Uri.parse('ws://localhost:4000/ws'),
  headers: {'Authorization': 'Bearer $token'},
);

channel.stream.listen((message) {
  final data = json.decode(message);
  print('Received sync event: ${data['type']}');
});
```

### 3. Data Synchronization

```dart
// Test customer sync
final customers = await integrationService.syncCustomersFromB2B();
print('Synced ${customers.length} customers');

// Test order sync
final success = await integrationService.syncOrderToB2B(orderData);
print('Order sync success: $success');
```

## Performance Testing

### 1. Load Testing

```bash
# Install Apache Bench for load testing
# Test API endpoint performance
ab -n 1000 -c 10 http://localhost:4000/api/integration/status

# Test WebSocket connections
# Use specialized WebSocket load testing tools
```

### 2. Sync Performance Testing

```bash
# Test bulk sync performance
curl -X POST http://localhost:4000/api/test/bulk-sync \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"customerCount": 1000, "orderCount": 5000}'
```

### 3. Memory and Resource Testing

```bash
# Monitor resource usage during testing
top -p $(pgrep -f "node.*server.js")
redis-cli info memory
```

## Error Handling Testing

### 1. Network Failure Simulation

```bash
# Test Redis connection failure
docker stop redis-server

# Verify graceful degradation
curl http://localhost:4000/health

# Restart Redis
docker start redis-server
```

### 2. Authentication Failure Testing

```bash
# Test invalid token
curl -X GET http://localhost:4000/api/integration/status \
  -H "Authorization: Bearer invalid-token"

# Test expired token
curl -X GET http://localhost:4000/api/integration/status \
  -H "Authorization: Bearer <expired_token>"
```

### 3. Sync Failure Recovery

```bash
# Test sync event retry mechanism
# Simulate ERP downtime and verify retry logic
curl -X POST http://localhost:4000/api/test/simulate-erp-failure
```

## End-to-End Testing Scenarios

### Scenario 1: Complete Customer Journey

1. **Create customer in B2B Portal**
   ```bash
   curl -X POST http://localhost:3003/api/customers \
     -H "Authorization: Bearer <token>" \
     -d '{"name": "E2E Test Customer", "email": "e2e@test.com"}'
   ```

2. **Verify sync to Integration Service**
   ```bash
   curl -X GET http://localhost:4000/api/customers/search?email=e2e@test.com \
     -H "Authorization: Bearer <token>"
   ```

3. **Check Flutter app receives update**
   - Monitor WebSocket messages
   - Verify local storage update

4. **Validate ERP synchronization**
   ```bash
   curl -X GET http://localhost:4000/api/erp/customers/e2e@test.com \
     -H "Authorization: Bearer <token>"
   ```

### Scenario 2: Order Processing Flow

1. **Create order in Flutter app**
2. **Verify B2B portal sync**
3. **Check inventory updates**
4. **Validate ERP order creation**
5. **Confirm real-time notifications**

### Scenario 3: Conflict Resolution

1. **Create simultaneous updates**
2. **Verify conflict detection**
3. **Check resolution strategy**
4. **Validate final state consistency**

## Automated Testing Scripts

### Test Suite Runner

```bash
#!/bin/bash
# run-integration-tests.sh

echo "Starting Integration Test Suite..."

# Start services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Run authentication tests
echo "Testing Authentication..."
./tests/auth-tests.sh

# Run sync tests
echo "Testing Real-time Sync..."
./tests/sync-tests.sh

# Run ERP integration tests
echo "Testing ERP Integration..."
./tests/erp-tests.sh

# Run performance tests
echo "Testing Performance..."
./tests/performance-tests.sh

echo "Integration tests completed!"
```

### Continuous Integration

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      redis:
        image: redis:6-alpine
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd integration-services/unified-business-operations
          npm install
      
      - name: Start integration service
        run: |
          cd integration-services/unified-business-operations
          npm run dev &
          sleep 10
      
      - name: Run integration tests
        run: ./run-integration-tests.sh
```

## Test Reporting

### Test Results Format

```json
{
  "testSuite": "Integration Tests",
  "timestamp": "2024-01-15T10:30:00Z",
  "results": {
    "authentication": {
      "passed": 15,
      "failed": 0,
      "duration": "2.3s"
    },
    "realTimeSync": {
      "passed": 12,
      "failed": 1,
      "duration": "5.7s",
      "failures": ["WebSocket reconnection timeout"]
    },
    "erpIntegration": {
      "passed": 8,
      "failed": 0,
      "duration": "3.1s"
    }
  },
  "coverage": {
    "lines": 85.2,
    "functions": 92.1,
    "branches": 78.9
  }
}
```

### Monitoring Dashboard

Access test results and system health at:
- Test Dashboard: `http://localhost:4000/test-dashboard`
- Integration Status: `http://localhost:4000/api/integration/status`
- Health Metrics: `http://localhost:4000/health`

This comprehensive testing guide ensures all integration points work correctly and the system maintains data consistency across all platforms.

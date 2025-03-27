# Testing Strategy for Currency Conversion Service

This document outlines the testing approach for the Currency Conversion Service, which includes unit tests, integration tests, and load tests.

## Overview

Our testing strategy follows the testing pyramid approach:
- **Unit Tests**: Testing individual components in isolation
- **Integration Tests**: Testing interactions between components
- **Load Tests**: Testing performance under high traffic

## Test Directory Structure

```
src/__tests__/
├── unit/              # Unit tests for individual components
│   ├── controllers/   # Tests for API controllers
│   ├── middleware/    # Tests for Express middleware
│   ├── services/      # Tests for service layer
│   └── utils/         # Tests for utility functions
├── integration/       # Integration tests
│   ├── api/           # API endpoint tests
│   ├── docker/        # Docker environment tests
│   └── rate-limiting/ # Rate limiting behavior tests
└── load/              # Load and performance tests
    ├── scenarios/     # Artillery test scenarios
    └── reports/       # Performance test reports
```

## Running Tests

### Unit Tests
```bash
bun run test:unit
```

### Integration Tests
```bash
bun run test:integration
```

### Load Tests
```bash
# Start the server first
bun run dev

# In another terminal, run the load tests
bun run test:load

# Generate a report
bun run test:load:report
```

### All Tests with Coverage
```bash
bun run test:coverage
```

## Testing Requirements

### 1. Unit Tests

- **Exchange Rate Calculation**
  - Test BTC → USD conversion correctly
  - Test decimal precision handling
  - Test error handling for unsupported currencies

- **Redis Caching Logic**
  - Test cache retrieval when fresh (<10 minutes old)
  - Test cache bypass when stale
  - Test Coinbase API fallback

- **Rate Limiting Enforcement**
  - Test weekday limits (100 requests)
  - Test weekend limits (200 requests)
  - Test midnight UTC reset
  - Test HTTP 429 response

- **MongoDB Request Logging**
  - Test successful request logging
  - Test metadata accuracy
  - Test log retention

- **Authentication Handling**
  - Test valid Bearer token acceptance
  - Test 401 responses for invalid tokens

### 2. Integration Tests

- **Full Currency Conversion Flow**
  - Test end-to-end with DB logging and caching

- **API Resilience**
  - Test Coinbase API failure handling
  - Test Redis downtime handling
  - Test MongoDB downtime handling

- **Rate Limiting Behavior**
  - Test multiple requests over time
  - Test reset behavior

- **Docker Environment**
  - Test containerized functionality
  - Test service connectivity

### 3. Load Tests

- **High Traffic Testing**
  - Test 10,000 concurrent users
  - Test response time (<500ms for 95%)
  - Test cache efficiency

- **Edge Cases**
  - Test graceful degradation
  - Test large payload handling

## CI Integration

Tests are automatically run on GitHub Actions for:
- Pull requests to main branch
- Pushes to main branch

The workflow includes:
- Linting
- Unit tests
- Integration tests
- Coverage reports

## Mock Strategy

- **MongoDB**: Using mongodb-memory-server for in-memory testing
- **Redis**: Using redis-mock for unit tests
- **External APIs**: Using Vitest mocks 
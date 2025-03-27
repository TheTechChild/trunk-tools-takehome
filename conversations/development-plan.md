# Currency Conversion Service Development Plan

## Project Overview
A Dockerized Node.js & Express currency conversion API that integrates Coinbase for exchange rates, MongoDB for logging & user storage, and Redis for caching & rate limiting. The API ensures real-time accuracy, enforces fair usage, and includes comprehensive testing to verify functionality.

## Technical Stack
- **Runtime**: Node.js with Express
- **Database**: MongoDB
- **Caching**: Redis
- **External API**: Coinbase
- **Testing**: Jest + Supertest
- **Containerization**: Docker
- **Load Testing**: Artillery

## Core Features & Requirements

### 1. Currency Conversion
- Real-time conversion using Coinbase API
- Support for BTC → USD conversions
- Proper decimal precision handling
- Error handling for unsupported currency pairs
- Response time target: <500ms for 95% of requests

### 2. Data Storage (MongoDB)
#### Users Collection Schema
```json
{
  "_id": "dab458d6-8352-42e6-88a1-88acc76b4e43",
  "email": "user@example.com",
  "created_at": "2025-03-27T10:00:00Z"
}
```

#### Request Logs Collection Schema
```json
{
  "_id": "some-object-id",
  "user_id": "dab458d6-8352-42e6-88a1-88acc76b4e43",
  "from_currency": "BTC",
  "to_currency": "USD",
  "amount": 999.20,
  "converted_amount": 67890.12,
  "exchange_rate": 67.89,
  "timestamp": "2025-03-27T14:52:00Z"
}
```

### 3. Redis Caching
- Cache exchange rates for 10 minutes
- Key structure: `{ "BTC-USD": { "exchange_rate": 67890.12, "timestamp": "2025-03-27T14:50:00Z" } }`
- Fallback to Coinbase API when cache is stale
- Graceful degradation if Redis is unavailable

### 4. Rate Limiting
- 100 requests per weekday (Monday-Friday) per user
- 200 requests per weekend day (Saturday-Sunday) per user
- HTTP 429 response when limits exceeded
- Daily reset at midnight UTC
- Implemented using Redis

### 5. Authentication
- Bearer token authentication
- 401 Unauthorized for missing/invalid tokens
- User identification for rate limiting and logging

## Development Phases

### Phase 1: Project Setup & Core Infrastructure
1. Initialize project with TypeScript
2. Set up Express server with basic routing
3. Configure Docker environment
4. Implement basic error handling
5. Set up development environment with hot reloading

### Phase 2: Database & Caching Implementation
1. Set up MongoDB connection and schemas
2. Implement Redis connection and caching logic
3. Create data access layer for users and logs
4. Implement exchange rate caching strategy
5. Add request logging functionality

### Phase 3: Core Business Logic
1. Implement currency conversion logic
2. Integrate Coinbase API
3. Add rate limiting middleware
4. Implement authentication system
5. Add request validation

### Phase 4: Testing Implementation
1. Set up Jest and Supertest
2. Implement unit tests for:
   - Exchange rate calculations
   - Redis caching logic
   - Rate limiting enforcement
   - MongoDB request logging
   - Authentication handling
3. Implement integration tests for:
   - Full currency conversion flow
   - API resilience and failure handling
   - Rate limiting behavior
   - Docker environment testing
4. Implement load tests using Artillery

### Phase 5: Performance Optimization & Documentation
1. Optimize response times
2. Implement graceful degradation
3. Add comprehensive API documentation
4. Create deployment guide
5. Add monitoring and logging

## Testing Strategy

### Unit Tests
- Exchange rate calculation accuracy
- Redis caching behavior
- Rate limiting logic
- MongoDB logging functionality
- Authentication handling

### Integration Tests
- Complete conversion flow
- System resilience
- Rate limiting behavior
- Docker environment functionality

### Load Tests
- High-volume traffic simulation
- Response time verification
- Redis caching efficiency
- Edge case handling

## Docker Configuration
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGO_URI=mongodb://mongodb:27017/currency_converter
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - COINBASE_API_KEY=your_api_key

  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
```

## Success Criteria
1. All core features implemented and tested
2. Response times under 500ms for 95% of requests
3. Successful handling of all edge cases
4. Comprehensive test coverage
5. Proper error handling and logging
6. Secure authentication and rate limiting
7. Efficient caching implementation
8. Docker environment working correctly

## Next Steps
1. Set up development environment
2. Initialize project structure
3. Configure Docker environment
4. Begin implementing core features
5. Start writing tests alongside development 
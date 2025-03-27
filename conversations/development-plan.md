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

## Phase 0: GitHub & AI Development Setup
### 1. GitHub Repository Structure
- Initialize GitHub repository
- Set up branch protection rules
- Configure GitHub Actions for CI/CD
- Set up code quality checks (ESLint, Prettier)
- Configure commit message linting

### 2. GitHub Templates
#### Pull Request Template
```markdown
## Description
[Provide a brief description of the changes]

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

#### Issue Templates
##### Bug Report
```markdown
## Bug Description
[Provide a clear and concise description of the bug]

## Steps to Reproduce
1. [First Step]
2. [Second Step]
3. [Other Steps...]

## Expected Behavior
[What you expect to happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., macOS, Windows]
- Node Version: [e.g., v18.0.0]
- Docker Version: [e.g., 20.10.0]

## Additional Context
[Add any other context about the problem here]
```

##### Feature Request
```markdown
## Feature Description
[Provide a clear and concise description of the feature]

## Use Case
[Describe the use case for this feature]

## Proposed Solution
[Describe your proposed solution]

## Alternatives Considered
[Describe any alternative solutions or features you've considered]

## Additional Context
[Add any other context or screenshots about the feature request here]
```

### 3. AI Development Setup
- Create `.cursor` directory for AI-specific configurations
- Set up conversation templates for:
  - Code reviews
  - Architecture discussions
  - Bug analysis
  - Feature implementation
- Configure AI development guidelines
- Set up AI-assisted testing templates

### 4. Documentation Structure
- Create `docs` directory with:
  - Architecture diagrams
  - API documentation
  - Development guidelines
  - Deployment procedures
  - Testing strategies
- Set up automated documentation generation
- Configure documentation deployment

### 5. Development Guidelines
- Establish coding standards
- Define commit message conventions
- Set up pre-commit hooks
- Configure automated code formatting
- Establish review process guidelines

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

## Timeline
- Phase 0: 1 week
- Phase 1: 1 week
- Phase 2: 1 week
- Phase 3: 1 week
- Phase 4: 1 week
- Phase 5: 1 week

Total estimated time: 6 weeks

## Next Steps
1. Set up GitHub repository and tooling
2. Configure AI development environment
3. Initialize project structure
4. Configure Docker environment
5. Begin implementing core features
6. Start writing tests alongside development 
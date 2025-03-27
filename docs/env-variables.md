# Environment Variables Documentation

## Required Environment Variables

The Currency Conversion Service requires the following environment variables:

### Application Configuration

- `NODE_ENV`: Application environment (development, production, test)
- `PORT`: Port number for the HTTP server (default: 8000)

### MongoDB Configuration

- `MONGODB_URI`: MongoDB connection string
  - Default: `mongodb://localhost:27017/currency-service`
  - Docker: `mongodb://mongodb:27017/currency-service`

### Redis Configuration

- `REDIS_URI`: Redis connection string
  - Default: `redis://localhost:6379`
  - Docker: `redis://redis:6379`

### Rate Limiting

- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting in milliseconds (default: 60000)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window (default: 100)

### API Keys (for Phase 3)

- `CURRENCY_API_KEY`: API key for external currency service

## Example .env File 

```
# Application
NODE_ENV=development
PORT=8000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/currency-service

# Redis
REDIS_URI=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# API Keys (for production these should be securely stored)
CURRENCY_API_KEY=your_api_key_here
```

## Environment-Specific Configuration

### Development

```
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/currency-service
REDIS_URI=redis://localhost:6379
```

### Docker Development

```
NODE_ENV=development
MONGODB_URI=mongodb://mongodb:27017/currency-service
REDIS_URI=redis://redis:6379
```

### Production

```
NODE_ENV=production
MONGODB_URI=mongodb://user:password@production-db:27017/currency-service?authSource=admin
REDIS_URI=redis://:password@production-redis:6379
``` 
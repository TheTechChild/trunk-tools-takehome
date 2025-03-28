# Environment Variables Documentation

## Required Environment Variables

The Currency Conversion Service requires the following environment variables:

### Application Configuration

- `NODE_ENV`: Application environment (local, production)
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
- `RATE_LIMIT_WEEKDAY`: Maximum requests per day on weekdays (default: 100)
- `RATE_LIMIT_WEEKEND`: Maximum requests per day on weekends (default: 200)

### Precision Settings

- `DECIMAL_PRECISION_BTC`: Number of decimal places for BTC (default: 8)
- `DECIMAL_PRECISION_USD`: Number of decimal places for USD (default: 2)

### Maximum Amounts

- `MAX_AMOUNT_BTC`: Maximum BTC amount for conversions (default: 1000)

### Coinbase API

- `COINBASE_API_URL`: Base URL for Coinbase API (default: https://api.coinbase.com/v2)

## Example .env File

```
# Application
NODE_ENV=local
PORT=8000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/currency-service

# Redis
REDIS_URI=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WEEKDAY=100
RATE_LIMIT_WEEKEND=200

# Precision Settings
DECIMAL_PRECISION_BTC=8
DECIMAL_PRECISION_USD=2

# Maximum Amounts
MAX_AMOUNT_BTC=1000

# Coinbase API
COINBASE_API_URL=https://api.coinbase.com/v2
```

## Environment-Specific Configuration

### Development

```
NODE_ENV=local
MONGODB_URI=mongodb://localhost:27017/currency-service
REDIS_URI=redis://localhost:6379
```

### Docker Development

```
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/currency-service
REDIS_URI=redis://redis:6379
```

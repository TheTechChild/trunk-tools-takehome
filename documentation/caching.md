# Caching Documentation

## Redis Configuration

The Currency Conversion Service uses Redis for caching exchange rates and rate limiting. The connection is configured in `src/config/redis.ts`.

### Connection Settings

- **Connection String**: Set via `REDIS_URI` environment variable
- **Default**: `redis://localhost:6379`
- **Connection Timeout**: 5 seconds
- **Retry Strategy**: Exponential backoff with maximum 3000ms delay

## Caching Strategy

### Exchange Rate Caching

Exchange rates are cached using the following strategy:

- **TTL (Time To Live)**: 10 minutes (600 seconds)
- **Key Format**: `exchange-rate:BTC-USD` (prefix:from-to)
- **Stale-While-Revalidate**: Cached data is returned immediately while being refreshed in the background when >75% of TTL has elapsed

### Cache Operations

The `CacheService` provides the following operations:

- `get<T>(key: string)`: Retrieve a value from cache
- `set<T>(key: string, value: T, options?: CacheOptions)`: Store a value in cache
- `del(key: string)`: Remove a value from cache
- `exists(key: string)`: Check if a key exists in cache
- `ping()`: Check Redis connection

### Graceful Degradation

The system is designed to degrade gracefully when Redis is unavailable:

- Cache operations catch and log errors without throwing
- Exchange rate service falls back to direct API calls when cache is unavailable
- Operations continue with slightly degraded performance

## Metrics

Cache performance is tracked with the following metrics:

- **Hits**: Successful cache retrievals
- **Misses**: Cache retrievals that didn't find data
- **Sets**: Successful cache stores
- **Deletes**: Successful cache removals
- **Errors**: Failed cache operations

These metrics are available via the `/api/v1/metrics/cache` endpoint.

## Cache Configuration

### Redis Configuration

- **Host**: Configurable via environment variables
- **Port**: Default 6379
- **Database**: 0
- **Connection Pool**: 10 connections

### Cache Keys

1. **Exchange Rate Cache**
   - Key Format: `exchange_rate:{FROM}-{TO}`
   - TTL: 600 seconds (10 minutes)
   - Value Format: JSON string containing rate and timestamp

2. **Rate Limit Cache**
   - Key Format: `rate_limit:{user_id}`
   - TTL: 86400 seconds (24 hours)
   - Value Format: JSON string containing count and reset time

3. **User Cache**
   - Key Format: `user:{user_id}`
   - TTL: 3600 seconds (1 hour)
   - Value Format: JSON string containing user data

## Implementation Details

### Exchange Rate Caching

```typescript
// Example caching flow
const cacheKey = `exchange_rate:${fromCurrency}-${toCurrency}`;
const ttl = 600; // 10 minutes

// Try to get from cache
const cachedData = await redis.get(cacheKey);
if (cachedData) {
  return JSON.parse(cachedData);
}

// If not in cache, fetch from API
const rateData = await fetchFromApi(fromCurrency, toCurrency);

// Store in cache
await redis.set(cacheKey, JSON.stringify(rateData), 'EX', ttl);
return rateData;
```

### Cache Invalidation

1. **Automatic Invalidation**
   - Keys expire automatically after TTL
   - No manual cleanup required
   - Redis handles memory management

2. **Manual Invalidation**
   ```typescript
   // Example manual invalidation
   await redis.del(`exchange_rate:${fromCurrency}-${toCurrency}`);
   ```

## Error Handling

1. **Cache Miss**
   - Graceful fallback to API
   - No impact on service availability
   - Logged for monitoring

2. **Cache Errors**
   - Fallback to direct API calls
   - Error logged for debugging
   - Service continues functioning

## Performance Considerations

1. **Memory Usage**
   - Monitor Redis memory usage
   - Set appropriate TTL values
   - Implement eviction policies

2. **Latency**
   - Use connection pooling
   - Implement circuit breakers
   - Monitor cache hit rates

## Monitoring

1. **Cache Statistics**
   - Hit rate monitoring
   - Memory usage tracking
   - Latency measurements

2. **Health Checks**
   - Redis connection status
   - Cache performance metrics
   - Error rate monitoring

## Best Practices

1. **Key Design**
   - Use consistent naming
   - Include version prefix
   - Keep keys short

2. **Value Design**
   - Serialize efficiently
   - Include metadata
   - Use appropriate TTL

3. **Error Handling**
   - Implement fallbacks
   - Log errors properly
   - Monitor failures

## Configuration

Caching can be configured through environment variables:

- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis server password
- `CACHE_TTL`: Default cache TTL in seconds

## Testing

1. **Unit Tests**
   - Test cache operations
   - Test error handling
   - Test TTL behavior

2. **Integration Tests**
   - Test Redis connection
   - Test cache invalidation
   - Test concurrent access

3. **Performance Tests**
   - Test under load
   - Test memory usage
   - Test latency

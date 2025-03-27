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
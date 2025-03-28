/**
 * Redis mock utility for cache service tests
 *
 * Provides a in-memory mock Redis client for unit testing cache operations
 * without connecting to a real Redis instance.
 */
import { mock } from 'bun:test';

// Store data in memory
const redisStore = new Map<string, string>();

// Type for Redis set command options
interface SetOptions {
  ex?: number;
  px?: number;
  nx?: boolean;
  xx?: boolean;
}

// Mock Redis client for testing
export const mockRedisClient = {
  // Get a value from Redis
  get: mock((key: string) => Promise.resolve(redisStore.get(key) || null)),

  // Set a value in Redis with optional expiration
  set: mock((key: string, value: string, _options?: SetOptions) => {
    redisStore.set(key, value);
    return Promise.resolve('OK');
  }),

  // Delete one or more keys
  del: mock((key: string | string[]) => {
    if (typeof key === 'string') {
      if (redisStore.has(key)) {
        redisStore.delete(key);
        return Promise.resolve(1);
      }
      return Promise.resolve(0);
    } else {
      let count = 0;
      for (const k of key) {
        if (redisStore.has(k)) {
          redisStore.delete(k);
          count++;
        }
      }
      return Promise.resolve(count);
    }
  }),

  // Check if a key exists
  exists: mock((key: string) => {
    return Promise.resolve(redisStore.has(key) ? 1 : 0);
  }),

  // Set a key with expiration
  setex: mock((key: string, seconds: number, value: string) => {
    redisStore.set(key, value);
    return Promise.resolve('OK');
  }),
};

// Clear the Redis store (for test setup/teardown)
export const clearStore = () => {
  redisStore.clear();
  return Promise.resolve();
};

// Get a direct reference to the store (for test assertions)
export const getStore = () => redisStore;

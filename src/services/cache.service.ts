import { getRedisClient, DEFAULT_CACHE_TTL } from '../config/redis';
import type { CacheOptions, CacheServiceInterface } from '../types/cache.types';

// Cache metrics
interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  sets: number;
  deletes: number;
}

/**
 * Redis cache service implementation
 */
export class CacheService implements CacheServiceInterface {
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    sets: 0,
    deletes: 0,
  };

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redisClient = await getRedisClient();
      const data = await redisClient.get(key);

      if (!data) {
        this.metrics.misses++;
        return null;
      }

      this.metrics.hits++;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const redisClient = await getRedisClient();
      const serializedValue = JSON.stringify(value);
      const ttl = options.ttl || DEFAULT_CACHE_TTL;

      await redisClient.set(key, serializedValue, 'EX', ttl);
      this.metrics.sets++;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      this.metrics.errors++;
      // Don't throw, allow graceful degradation
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    try {
      const redisClient = await getRedisClient();
      await redisClient.del(key);
      this.metrics.deletes++;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      this.metrics.errors++;
      // Don't throw, allow graceful degradation
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const redisClient = await getRedisClient();
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Ping Redis to check connection
   */
  async ping(): Promise<boolean> {
    try {
      const redisClient = await getRedisClient();
      const result = await redisClient.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset cache metrics
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      sets: 0,
      deletes: 0,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();

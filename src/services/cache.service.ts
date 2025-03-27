import { getRedisClient, DEFAULT_CACHE_TTL } from '../config/redis';
import type { CacheOptions, CacheServiceInterface } from '../types/cache.types';

/**
 * Redis cache service implementation
 */
export class CacheService implements CacheServiceInterface {
  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redisClient = getRedisClient();
      const data = await redisClient.get(key);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const serializedValue = JSON.stringify(value);
      const ttl = options.ttl || DEFAULT_CACHE_TTL;
      
      await redisClient.set(key, serializedValue, 'EX', ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      // Don't throw, allow graceful degradation
    }
  }
  
  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    try {
      const redisClient = getRedisClient();
      await redisClient.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      // Don't throw, allow graceful degradation
    }
  }
  
  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
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
      const redisClient = getRedisClient();
      const result = await redisClient.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService(); 
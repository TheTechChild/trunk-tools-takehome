import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import Redis from 'ioredis';
import { CacheService } from '../../../services/cache.service';
import '../../setup/environment';

describe('Cache Service', () => {
  let cacheService: CacheService;
  let redisClient: Redis | null = null;

  // Set up unique prefix for test keys to avoid conflicts
  const TEST_KEY_PREFIX = `test:cache:${Date.now()}:`;

  beforeAll(async () => {
    try {
      // Try to connect to Redis using various hostnames
      const hosts = ['localhost', '127.0.0.1'];
      const port = parseInt(process.env.REDIS_PORT || '6379', 10);

      let lastError: Error | null = null;

      for (const host of hosts) {
        try {
          console.info(`Attempting to connect to Redis at ${host}:${port}...`);

          redisClient = new Redis({
            host,
            port,
            connectTimeout: 5000,
            maxRetriesPerRequest: 1,
          });

          // Test connection
          await redisClient.ping();
          console.info(`✅ Connected to Redis at ${host}:${port} for cache service tests`);
          break;
        } catch (error) {
          console.error(`Failed to connect to Redis at ${host}:${port}`);

          if (redisClient) {
            await redisClient.quit().catch(() => {});
            redisClient = null;
          }

          lastError = error as Error;
        }
      }

      if (!redisClient) {
        throw lastError || new Error('Failed to connect to Redis');
      }

      // Create a new instance of the cache service for testing
      cacheService = new CacheService();
    } catch (error) {
      console.error('Failed to set up cache service tests:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up and close connection
    if (redisClient) {
      try {
        await redisClient.quit();
        console.info('👋 Disconnected from Redis after cache service tests');
      } catch (error) {
        console.error('Error disconnecting from Redis:', error);
      }
    }
  });

  beforeEach(async () => {
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }

    // Reset metrics and clean up any test keys
    cacheService.resetMetrics();

    try {
      // Clean up any existing test keys
      const keys = await redisClient.keys(`${TEST_KEY_PREFIX}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Error cleaning up test keys:', error);
    }
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      // Act
      const result = await cacheService.get(TEST_KEY_PREFIX + 'non-existent-key');

      // Assert
      expect(result).toBeNull();

      // Verify metrics are updated
      const metrics = cacheService.getMetrics();
      expect(metrics.misses).toBe(1);
    });

    it('should return value for existing key', async () => {
      // Arrange
      const key = TEST_KEY_PREFIX + 'test-key';
      const value = { data: 'test-value' };
      await cacheService.set(key, value);

      // Act
      const result = await cacheService.get(key);

      // Assert
      expect(result).toEqual(value);

      // Verify metrics are updated
      const metrics = cacheService.getMetrics();
      expect(metrics.hits).toBe(1);
    });
  });

  describe('set', () => {
    it('should store value in cache', async () => {
      // Arrange
      const key = TEST_KEY_PREFIX + 'test-set-key';
      const value = { data: 'test-set-value' };

      // Act
      await cacheService.set(key, value);

      // Assert
      const cachedValue = await cacheService.get(key);
      expect(cachedValue).toEqual(value);

      // Verify metrics are updated
      const metrics = cacheService.getMetrics();
      expect(metrics.sets).toBe(1);
    });

    it('should handle expiration options', async () => {
      if (!redisClient) {
        throw new Error('Redis client not initialized');
      }

      // Arrange
      const key = TEST_KEY_PREFIX + 'test-expiry-key';
      const value = { data: 'test-expiry-value' };

      // Act - set with a very large expiration so it doesn't expire during the test
      await cacheService.set(key, value, { ttl: 3600 });

      // Assert
      const cachedValue = await cacheService.get(key);
      expect(cachedValue).toEqual(value);

      // Verify TTL is set (greater than 0 but less than or equal to 3600)
      const ttl = await redisClient.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(3600);
    });
  });

  describe('del', () => {
    it('should delete existing key', async () => {
      // Arrange
      const key = TEST_KEY_PREFIX + 'test-del-key';
      const value = { data: 'test-del-value' };
      await cacheService.set(key, value);

      // Verify key exists before deletion
      const existsBeforeDel = await cacheService.exists(key);
      expect(existsBeforeDel).toBe(true);

      // Act
      await cacheService.del(key);

      // Assert
      const cachedValue = await cacheService.get(key);
      expect(cachedValue).toBeNull();

      // Verify metrics are updated
      const metrics = cacheService.getMetrics();
      expect(metrics.deletes).toBe(1);
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      // Arrange
      const key = TEST_KEY_PREFIX + 'test-exists-key';
      const value = { data: 'test-exists-value' };
      await cacheService.set(key, value);

      // Act
      const exists = await cacheService.exists(key);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      // Act
      const exists = await cacheService.exists(TEST_KEY_PREFIX + 'non-existent-key');

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('ping', () => {
    it('should successfully ping Redis', async () => {
      // Act
      const result = await cacheService.ping();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('metrics', () => {
    it('should track cache metrics correctly', async () => {
      // Reset metrics
      cacheService.resetMetrics();

      // Perform operations
      const key = TEST_KEY_PREFIX + 'metrics-test-key';

      // Miss (get non-existent)
      await cacheService.get(key);

      // Set
      await cacheService.set(key, { test: 'value' });

      // Hit (get existing)
      await cacheService.get(key);

      // Delete
      await cacheService.del(key);

      // Check metrics
      const metrics = cacheService.getMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(1);
      expect(metrics.sets).toBe(1);
      expect(metrics.deletes).toBe(1);
    });

    it('should reset metrics', async () => {
      // Arrange - do some operations
      const key = TEST_KEY_PREFIX + 'reset-metrics-test';
      await cacheService.set(key, { test: 'data' });
      await cacheService.get(key);

      // Act - reset metrics
      cacheService.resetMetrics();

      // Assert - metrics should be zeroed
      const metrics = cacheService.getMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.sets).toBe(0);
      expect(metrics.deletes).toBe(0);
      expect(metrics.errors).toBe(0);
    });
  });
});

import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import supertest from 'supertest';
import type { Express } from 'express';
import type { IUser } from '../../../types/database.types';
import '../../setup/environment'; // Import just the environment setup
import { mockCoinbaseService } from '../../mocks/coinbaseService.mock';
import { coinbaseService } from '../../../services/coinbaseService';
import { cacheService } from '../../../services/cache.service';
import * as redisModule from '../../../config/redis';
import appToTest from '../../..';
import { mockRedisClient } from '../../mocks/redis.mock';
import { testDataManager } from '../../utils/test-data';
import { ensureDatabaseConnection } from '../../../config/database';

// Simple in-memory rate limit tracking
const userRateLimits = new Map<string, number>();

// Function to clear rate limit data between tests
const clearRateLimitData = () => {
  userRateLimits.clear();
};

describe('Currency API', () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;
  let testUser: IUser;

  // Preserve original implementations to restore later
  const originalCacheGet = cacheService.get;
  const originalCacheSet = cacheService.set;
  const originalCacheDel = cacheService.del;
  const originalCacheExists = cacheService.exists;
  const originalCachePing = cacheService.ping;

  beforeAll(async () => {
    // Ensure database connection and seed test data
    await ensureDatabaseConnection();
    await testDataManager.seedTestUsers(10); // Seed 10 test users
    testUser = testDataManager.getRandomTestUser();

    // Mock Redis by directly intercepting the methods we need
    mock.module('../../../config/redis', () => {
      return {
        ...redisModule,
        getRedisClient: () => mockRedisClient,
        initializeRedis: () => mockRedisClient,
      };
    });

    // Mock coinbase service with our test implementation
    Object.assign(coinbaseService, mockCoinbaseService);

    // Mock cache service methods to avoid Redis dependency
    cacheService.get = mock(() => Promise.resolve(null));
    cacheService.set = mock(() => Promise.resolve());
    cacheService.del = mock(() => Promise.resolve());
    cacheService.exists = mock(() => Promise.resolve(false));
    cacheService.ping = mock(() => Promise.resolve(true));

    // Create a test app with our routes and middleware
    app = appToTest;
    request = supertest(app);

    // Clear any rate limit data
    clearRateLimitData();

    console.info('✅ Test environment setup complete');
  });

  afterAll(async () => {
    // Restore original implementations
    cacheService.get = originalCacheGet;
    cacheService.set = originalCacheSet;
    cacheService.del = originalCacheDel;
    cacheService.exists = originalCacheExists;
    cacheService.ping = originalCachePing;

    // Restore original Redis module functions
    mock.restore();

    // Clean up test data
    await testDataManager.clearTestData();

    console.info('✅ Test environment cleanup complete');
  });

  describe('GET /api/v1/currency/rates', () => {
    it('should retrieve exchange rates with USD base currency', async () => {
      const response = await request
        .get('/api/v1/currency/rates')
        .query({ base: 'USD' })
        .set('Authorization', `Bearer ${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.base).toBe('USD');
      expect(response.body.data.rates).toBeDefined();
      expect(typeof response.body.data.rates).toBe('object');
    });

    it('should return 400 for invalid base currency', async () => {
      const response = await request
        .get('/api/v1/currency/rates')
        .query({ base: 'XYZ' })
        .set('Authorization', `Bearer ${testUser._id}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/currency/supported', () => {
    it('should retrieve supported currencies', async () => {
      const response = await request
        .get('/api/v1/currency/supported')
        .set('Authorization', `Bearer ${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some((currency: { code: string }) => currency.code === 'USD')).toBe(
        true
      );
      expect(response.body.data.some((currency: { code: string }) => currency.code === 'BTC')).toBe(
        true
      );
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request.get('/api/v1/currency/supported');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});

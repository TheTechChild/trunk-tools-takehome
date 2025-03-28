import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import supertest from 'supertest';
import type { IUser } from '../../../types/database.types';
import '../../setup/environment';
import { testDataManager } from '../../utils/test-data';
import { ensureDatabaseConnection } from '../../../config/database';
import { getRedisClient, initializeRedis } from '../../../config/redis';
import type { Redis } from 'ioredis';
import { RATE_LIMIT } from '../../../config/constants';
import { createRateLimitKey } from '../../../middleware/rateLimiter';

// Get the base URL from environment variable
const APP_URL = process.env.APP_URL;
if (!APP_URL) {
  throw new Error('APP_URL environment variable is required for integration tests');
}

describe('Currency Conversion API', () => {
  let testUser: IUser;
  let request: ReturnType<typeof supertest>;
  let redisClient: Redis;

  beforeAll(async () => {
    // Ensure database connection and initialize Redis
    await ensureDatabaseConnection();
    await initializeRedis();
    redisClient = await getRedisClient();

    // Seed test data and get a test user
    await testDataManager.clearTestData();
    await testDataManager.seedTestUsers(10);
    testUser = testDataManager.getRandomTestUser();

    // Initialize supertest with the actual app URL
    request = supertest(APP_URL);
  });

  afterAll(async () => {
    // Clean up test data
    // await testDataManager.clearTestData();
  });

  describe('GET /api/v1/currency/convert', () => {
    it('should successfully convert USD to BTC', async () => {
      const response = await request
        .get(`/api/v1/currency/convert`)
        .query({
          from: 'USD',
          to: 'BTC',
          amount: '100',
        })
        .set('Authorization', `Bearer ${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('from', 'USD');
      expect(response.body.data).toHaveProperty('to', 'BTC');
      expect(response.body.data).toHaveProperty('amount', 100);
      expect(response.body.data).toHaveProperty('rate');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should handle rate limiting', async () => {
      // Get current date in UTC to determine if it's a weekend
      const now = new Date();
      const currentDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const isWeekend = currentDay === 0 || currentDay === 6;
      const rateLimit = isWeekend ? RATE_LIMIT.WEEKEND : RATE_LIMIT.WEEKDAY;

      // Create the rate limit key for the test user
      const rateLimitKey = createRateLimitKey(testUser._id);

      // Set the rate limit counter to the limit
      await redisClient.set(rateLimitKey, rateLimit);

      // Make a single request that should exceed the limit
      const response = await request
        .get(`/api/v1/currency/convert`)
        .query({
          from: 'USD',
          to: 'BTC',
          amount: '100',
        })
        .set('Authorization', `Bearer ${testUser._id}`);

      // Verify rate limit exceeded response
      expect(response.status).toBe(429);
      expect(response.body.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
      expect(response.body.error.details).toHaveProperty('limit', rateLimit);
      expect(response.body.error.details).toHaveProperty('remaining', 0);
      expect(response.body.error.details).toHaveProperty('reset');

      // Set the rate limit counter to 1 to allow tests to continue
      await redisClient.set(rateLimitKey, 0);
    });

    it('should handle invalid currency pairs', async () => {
      const response = await request
        .get(`/api/v1/currency/convert`)
        .query({
          from: 'INVALID',
          to: 'BTC',
          amount: '100',
        })
        .set('Authorization', `Bearer ${testUser._id}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toHaveProperty('errors');
      expect(response.body.error.details.errors.from).toBe('Invalid source currency');
    });
  });
});

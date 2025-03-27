import { vi } from 'vitest';

// Mock Redis client
vi.mock('../../../utils/redis', () => {
  const mockClient = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  };
  return {
    getRedisClient: () => mockClient,
  };
});

import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { configureRoutes } from '../../../routes/index';
import { errorHandler } from '../../../middleware/errorHandler';
import { beforeAll, describe, expect, it, beforeEach, afterEach } from 'vitest';

// Mock current date/time
const mockDate = (dateString: string) => {
  const date = new Date(dateString);
  vi.setSystemTime(date);
  return date;
};

describe('Rate Limiting Integration Tests - Reset Behavior', () => {
  let app: Express;
  let redisClient: any;

  beforeAll(() => {
    // Enable mock timers
    vi.useFakeTimers();

    // Create a test app with our routes and middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    configureRoutes(app);
    app.use(errorHandler);

    // Get redis client mock
    redisClient = vi.mocked(vi.importActual('../../../utils/redis') as any).getRedisClient();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Restore timers
    vi.useRealTimers();
  });

  describe('Daily Reset at Midnight UTC', () => {
    it('should reset the counter at midnight UTC', async () => {
      // Arrange - First day just before midnight
      mockDate('2023-04-10T23:59:59.000Z');

      // Simulate a user who has reached their daily limit
      const userId = 'test-user-123';
      const rateKey = `rate-limit:${userId}:2023-04-10`;
      redisClient.get.mockImplementation((key: string) => {
        if (key === rateKey) return '100'; // User has reached the limit
        return null;
      });

      // Act - Make a request just before midnight
      const beforeMidnightResponse = await request(app)
        .get('/api/v1/currency/convert')
        .query({ from: 'USD', to: 'EUR', amount: '100' })
        .set('Authorization', `Bearer ${userId}`);

      // Assert - Should be rate limited
      expect(beforeMidnightResponse.status).toBe(429);

      // Arrange - Now it's past midnight (next day)
      mockDate('2023-04-11T00:00:01.000Z');

      // Update mock to use new day's key
      const newDayKey = `rate-limit:${userId}:2023-04-11`;
      redisClient.get.mockImplementation((key: string) => {
        if (key === newDayKey) return null; // No requests yet for new day
        return null;
      });

      // Act - Make a request after midnight
      const afterMidnightResponse = await request(app)
        .get('/api/v1/currency/convert')
        .query({ from: 'USD', to: 'EUR', amount: '100' })
        .set('Authorization', `Bearer ${userId}`);

      // Assert - Should not be rate limited
      expect(afterMidnightResponse.status).not.toBe(429);
    });
  });

  describe('Weekday to Weekend Transition', () => {
    it('should apply different limits when transitioning from Friday to Saturday', async () => {
      const userId = 'test-user-456';

      // Arrange - Friday with 100 requests (at limit)
      mockDate('2023-04-14T23:59:59.000Z'); // Friday

      const fridayKey = `rate-limit:${userId}:2023-04-14`;
      redisClient.get.mockImplementation((key: string) => {
        if (key === fridayKey) return '100'; // At weekday limit
        return null;
      });

      // Act - Make request on Friday (at limit)
      const fridayResponse = await request(app)
        .get('/api/v1/currency/convert')
        .query({ from: 'USD', to: 'EUR', amount: '100' })
        .set('Authorization', `Bearer ${userId}`);

      // Assert - Should be rate limited on Friday
      expect(fridayResponse.status).toBe(429);

      // Arrange - Now it's Saturday
      mockDate('2023-04-15T00:00:01.000Z'); // Saturday

      // Reset mock for Saturday with higher limit
      const saturdayKey = `rate-limit:${userId}:2023-04-15`;
      redisClient.get.mockImplementation((key: string) => {
        if (key === saturdayKey) return '150'; // Below weekend limit (200)
        return null;
      });

      // Act - Make request on Saturday
      const saturdayResponse = await request(app)
        .get('/api/v1/currency/convert')
        .query({ from: 'USD', to: 'EUR', amount: '100' })
        .set('Authorization', `Bearer ${userId}`);

      // Assert - Should not be rate limited on Saturday
      expect(saturdayResponse.status).not.toBe(429);
    });
  });
});

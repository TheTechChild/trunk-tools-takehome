import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { configureRoutes } from '../../../routes/index';
import { errorHandler } from '../../../middleware/errorHandler';
import { beforeAll, describe, expect, it, beforeEach, vi, afterEach } from 'vitest';

// Mock Redis client
vi.mock('../../../utils/redis', () => {
  let requestCount = 0;
  
  const mockClient = {
    get: vi.fn(() => Promise.resolve(String(requestCount))),
    set: vi.fn(),
    incr: vi.fn(() => {
      requestCount += 1;
      return Promise.resolve(requestCount);
    }),
    expire: vi.fn(),
    del: vi.fn(() => {
      requestCount = 0;
      return Promise.resolve(1);
    }),
  };
  
  return { getRedisClient: () => mockClient };
});

describe('Rate Limiting Integration Tests - API Endpoints', () => {
  let app: Express;
  let redisClient: any;
  
  beforeAll(() => {
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
    // Reset counter
    redisClient.del();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should count all currency endpoints toward the same rate limit', async () => {
    // Arrange - Set up counter to be near limit
    const userId = 'test-user-789';
    
    // Mock weekday - 100 request limit
    const mockDate = new Date('2023-04-10T12:00:00Z'); // Monday
    vi.setSystemTime(mockDate);
    
    // Mock that user has used 98 requests
    let requestCount = 98;
    redisClient.get.mockImplementation(() => Promise.resolve(String(requestCount)));
    redisClient.incr.mockImplementation(() => {
      requestCount += 1;
      return Promise.resolve(requestCount);
    });
    
    // Act & Assert - Make requests to different endpoints
    
    // 1. First call to /convert (99th request)
    const convertResponse1 = await request(app)
      .get('/api/v1/currency/convert')
      .query({ from: 'USD', to: 'EUR', amount: '100' })
      .set('Authorization', `Bearer ${userId}`);
    
    // Assert - Should be allowed
    expect(convertResponse1.status).not.toBe(429);
    
    // 2. Call to /rates (100th request)
    const ratesResponse = await request(app)
      .get('/api/v1/currency/rates')
      .set('Authorization', `Bearer ${userId}`);
    
    // Assert - Should be allowed (exactly at limit)
    expect(ratesResponse.status).not.toBe(429);
    
    // 3. Call to /supported (101st request)
    const supportedResponse = await request(app)
      .get('/api/v1/currency/supported')
      .set('Authorization', `Bearer ${userId}`);
    
    // Assert - Should be rate limited (over limit)
    expect(supportedResponse.status).toBe(429);
    expect(supportedResponse.body.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
    
    // 4. Second call to /convert (would be 102nd request)
    const convertResponse2 = await request(app)
      .get('/api/v1/currency/convert')
      .query({ from: 'BTC', to: 'USD', amount: '1' })
      .set('Authorization', `Bearer ${userId}`);
    
    // Assert - Should still be rate limited
    expect(convertResponse2.status).toBe(429);
  });
  
  it('should apply rate limits to authenticated endpoints only', async () => {
    // This test assumes some endpoints require authentication while others don't
    
    // Arrange
    const userId = 'test-user-abc';
    
    // Mock weekday - 100 request limit
    const mockDate = new Date('2023-04-10T12:00:00Z'); // Monday
    vi.setSystemTime(mockDate);
    
    // Mock that user has used 100 requests (at limit)
    redisClient.get.mockImplementation(() => Promise.resolve('100'));
    
    // Act & Assert
    
    // 1. Call to an authenticated endpoint
    const authenticatedResponse = await request(app)
      .get('/api/v1/currency/convert')
      .query({ from: 'USD', to: 'EUR', amount: '100' })
      .set('Authorization', `Bearer ${userId}`);
    
    // Assert - Should be rate limited
    expect(authenticatedResponse.status).toBe(429);
    
    // 2. Call to public health endpoint (assumes health endpoint bypasses rate limiting)
    const healthResponse = await request(app)
      .get('/health');
    
    // Assert - Health endpoint should not be rate limited
    expect(healthResponse.status).not.toBe(429);
    expect(healthResponse.status).toBe(200);
  });
  
  afterAll(() => {
    vi.useRealTimers();
  });
});
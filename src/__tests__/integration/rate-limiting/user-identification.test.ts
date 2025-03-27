import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { configureRoutes } from '../../../routes/index';
import { errorHandler } from '../../../middleware/errorHandler';
import { beforeAll, describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Redis client for rate limiting
vi.mock('../../../utils/redis', () => {
  // Create a map to store user-specific rate limit data
  const rateLimitData = new Map<string, string>();
  
  const mockClient = {
    get: vi.fn((key: string) => {
      return Promise.resolve(rateLimitData.get(key) || null);
    }),
    set: vi.fn(),
    incr: vi.fn((key: string) => {
      const currentValue = parseInt(rateLimitData.get(key) || '0', 10);
      const newValue = currentValue + 1;
      rateLimitData.set(key, newValue.toString());
      return Promise.resolve(newValue);
    }),
    expire: vi.fn(),
    del: vi.fn(),
  };
  
  return { 
    getRedisClient: () => mockClient 
  };
});

describe('Rate Limiting Integration Tests - User Identification', () => {
  let app: Express;
  let mockRedisClient: any;
  
  beforeAll(() => {
    // Create a test app with our routes and middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    configureRoutes(app);
    app.use(errorHandler);
    
    // Get the mock Redis client
    mockRedisClient = vi.mocked(vi.importActual('../../../utils/redis') as any).getRedisClient();
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should apply rate limits independently for different users', async () => {
    // Arrange
    const userA = 'user-a';
    const userB = 'user-b';
    
    // Mock date (weekday - 100 request limit)
    const mockDate = new Date('2023-04-10T12:00:00Z'); // Monday
    vi.setSystemTime(mockDate);
    
    // Set up user A at limit
    const userAKey = `rate-limit:${userA}:2023-04-10`;
    mockRedisClient.get.mockImplementation((key: string) => {
      if (key === userAKey) return Promise.resolve('100'); // At limit
      if (key.includes(userB)) return Promise.resolve('50'); // Half of limit
      return Promise.resolve(null);
    });
    
    // Act - Make request as user A (should be limited)
    const responseA = await request(app)
      .get('/api/v1/currency/convert')
      .query({ from: 'USD', to: 'EUR', amount: '100' })
      .set('Authorization', `Bearer ${userA}`);
    
    // Assert - User A should be rate limited
    expect(responseA.status).toBe(429);
    expect(responseA.body.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
    
    // Act - Make request as user B (should not be limited)
    const responseB = await request(app)
      .get('/api/v1/currency/convert')
      .query({ from: 'USD', to: 'EUR', amount: '100' })
      .set('Authorization', `Bearer ${userB}`);
    
    // Assert - User B should not be rate limited
    expect(responseB.status).not.toBe(429);
  });
  
  it('should apply rate limits for anonymous users based on IP address', async () => {
    // For this test we'll simulate IP-based rate limiting for users without authentication
    
    // Arrange
    const ipA = '192.168.1.1';
    const ipB = '192.168.1.2';
    
    // Mock date (weekday - 100 request limit)
    const mockDate = new Date('2023-04-10T12:00:00Z'); // Monday
    vi.setSystemTime(mockDate);
    
    // Set up IP A at limit
    const ipAKey = `rate-limit:${ipA}:2023-04-10`;
    mockRedisClient.get.mockImplementation((key: string) => {
      if (key === ipAKey || key.includes(ipA)) return Promise.resolve('100'); // At limit
      if (key.includes(ipB)) return Promise.resolve('50'); // Half of limit
      return Promise.resolve(null);
    });
    
    // Act - Make request from IP A (should be limited)
    const responseA = await request(app)
      .get('/api/v1/currency/convert')
      .query({ from: 'USD', to: 'EUR', amount: '100' })
      .set('X-Forwarded-For', ipA); // Simulate IP address
    
    // Assert - IP A should be rate limited
    expect(responseA.status).toBe(429);
    
    // Act - Make request from IP B (should not be limited)
    const responseB = await request(app)
      .get('/api/v1/currency/convert')
      .query({ from: 'USD', to: 'EUR', amount: '100' })
      .set('X-Forwarded-For', ipB); // Simulate different IP
    
    // Assert - IP B should not be rate limited
    expect(responseB.status).not.toBe(429);
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
});
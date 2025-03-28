import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import '../../setup/environment';

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('should load environment variables from .env.test file', () => {
    // Test if NODE_ENV is set to test
    expect(process.env.NODE_ENV).toBe('test');

    // Test MongoDB URI
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toBe('mongodb://localhost:27017/currency-service');

    // Test Redis configuration
    expect(process.env.REDIS_HOST).toBeDefined();
    expect(process.env.REDIS_HOST).toBe('redis');
    expect(process.env.REDIS_PORT).toBeDefined();
    expect(process.env.REDIS_PORT).toBe('6379');

    // Test PORT
    expect(process.env.PORT).toBeDefined();
    expect(process.env.PORT).toBe('9000');

    // Test Rate Limiting
    expect(process.env.RATE_LIMIT_WEEKDAY).toBe('100');
    expect(process.env.RATE_LIMIT_WEEKEND).toBe('200');

    // Test API Configuration
    expect(process.env.COINBASE_API_URL).toBe('https://api.coinbase.com/v2');

    // Test Decimal Precision
    expect(process.env.DECIMAL_PRECISION_BTC).toBe('8');
    expect(process.env.DECIMAL_PRECISION_USD).toBe('2');

    // Test Maximum Amounts
    expect(process.env.MAX_AMOUNT_BTC).toBe('1000');

    // Test JWT configuration if defined
    if (process.env.JWT_SECRET) {
      expect(process.env.JWT_SECRET).toBeDefined();
    }

    // Test API keys if defined
    if (process.env.EXCHANGE_API_KEY) {
      expect(process.env.EXCHANGE_API_KEY).toBeDefined();
    }
  });
});

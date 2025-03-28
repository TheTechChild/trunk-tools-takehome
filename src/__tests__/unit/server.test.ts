import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import '../setup/environment'; // Import environment setup

// Create simplified tests that don't rely on mock
describe('Server Initialization', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('should use port from environment variables', () => {
    // Values should already be loaded from .env.test
    const port = process.env.PORT;
    expect(port).toBe('9000');
  });

  test('should have environment variables for connecting to services', () => {
    // Check the MongoDB URI
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toContain('mongodb://');

    // Check Redis configuration
    expect(process.env.REDIS_HOST).toBeDefined();
    expect(process.env.REDIS_PORT).toBeDefined();

    // Check that values match what we set in .env.test
    expect(process.env.MONGODB_URI).toBe(
      process.env.NODE_ENV === 'local'
        ? 'mongodb://localhost:27017/currency-service'
        : 'mongodb://mongodb:27017/currency-service'
    );
    expect(process.env.REDIS_HOST).toBe('redis');
    expect(process.env.REDIS_PORT).toBe('6379');
  });
});

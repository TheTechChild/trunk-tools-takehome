/**
 * Global Vitest setup for Currency Conversion Service tests
 */

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '8001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/currency-service-test';
process.env.REDIS_URI = 'redis://localhost:6379';

// Add any global setup/teardown here if needed

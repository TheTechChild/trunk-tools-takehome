import { describe, test, expect } from 'bun:test';
import dbSetup from '../utils/bun-test-setup';
import mongoose from 'mongoose';

// Set up database hooks (will run before and after all tests)
dbSetup.setupDatabaseHooks();

describe('Database Connection Tests', () => {
  test('should connect to MongoDB and perform a simple operation', async () => {
    // MongoDB connection should be established by setupDatabaseHooks
    // Just verify the connection is active

    // Check connection state
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected

    // Get database name from connection
    const db = mongoose.connection.db;
    expect(db).toBeDefined();

    if (db) {
      const dbName = db.databaseName;
      console.info(`Connected to MongoDB database: ${dbName}`);
      expect(dbName).toBe('currency-service-test');
    }
  });

  test('should connect to Redis and perform a simple operation', async () => {
    // Create a new Redis client for this test
    const Redis = (await import('ioredis')).default;
    const client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

    try {
      // Test setting and getting a value
      const testKey = 'test:connection';
      const testValue = 'success-' + Date.now();

      // Set a value
      await client.set(testKey, testValue);

      // Get the value
      const result = await client.get(testKey);

      // Check result
      console.info(`Redis test key result: ${result}`);
      expect(result).toBe(testValue);

      // Clean up
      await client.del(testKey);
    } finally {
      // Always close the client
      await client.quit();
    }
  });
});

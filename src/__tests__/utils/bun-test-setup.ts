/**
 * Global test setup for Bun test runner
 * This file should be imported at the top of test files that need database connectivity
 */

import mongoose from 'mongoose';
import Redis from 'ioredis';
import { afterAll, beforeAll } from 'bun:test';

// Setup environment variables for tests if not already set
process.env.NODE_ENV = 'test';
// Don't override existing environment variables that might be set by Docker
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/currency-service-test';
}
if (!process.env.REDIS_HOST) {
  process.env.REDIS_HOST = 'localhost';
}
if (!process.env.REDIS_PORT) {
  process.env.REDIS_PORT = '6379';
}

// Connection instances
let redisClient: Redis | null = null;

/**
 * Connect to MongoDB
 */
export const connectMongoDB = async (): Promise<void> => {
  try {
    // Get connection string from environment with fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/currency-service-test';

    console.info(`Attempting to connect to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for Docker environments
      connectTimeoutMS: 10000,
    });

    console.info(`✅ Successfully connected to MongoDB at ${mongoUri}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Close MongoDB connection
 */
export const closeMongoDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.info('MongoDB connection closed');
  }
};

/**
 * Connect to Redis
 */
export const connectRedis = async (): Promise<Redis> => {
  try {
    // Define potential Redis servers
    const redisServers = [
      {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      { host: 'localhost', port: 6379 },
      { host: '127.0.0.1', port: 6379 },
      { host: 'currency-redis', port: 6379 }, // Docker container name
    ];

    let lastError: Error | null = null;

    // Try each Redis server
    for (const server of redisServers) {
      try {
        console.info(`Attempting to connect to Redis at ${server.host}:${server.port}...`);

        redisClient = new Redis({
          host: server.host,
          port: server.port,
          connectTimeout: 3000,
          maxRetriesPerRequest: 1,
        });

        // Test the connection with a 3-second timeout
        await Promise.race([
          redisClient.ping(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis ping timeout')), 3000)
          ),
        ]);

        console.info(`✅ Successfully connected to Redis at ${server.host}:${server.port}`);
        return redisClient;
      } catch (error) {
        console.error(`❌ Failed to connect to Redis at ${server.host}:${server.port}`);
        if (redisClient) {
          try {
            await redisClient.quit();
          } catch {
            // Ignore errors during quit
          }
          redisClient = null;
        }
        lastError = error as Error;
      }
    }

    // If we reach here, all connection attempts failed
    throw lastError || new Error('Failed to connect to Redis after trying multiple servers');
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.info('Redis connection closed');
  }
};

/**
 * Clear all MongoDB collections for a clean test environment
 */
export const clearDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return; // Not connected
  }

  try {
    const collections = mongoose.connection.collections;

    // Check if we're in a test database
    if (!process.env.MONGODB_URI?.includes('test')) {
      throw new Error('Refusing to clear non-test database');
    }

    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }

    console.info('Database cleared for testing');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// Add setup and teardown hooks that tests can use
export const setupDatabaseHooks = () => {
  beforeAll(async () => {
    await connectMongoDB();
    await connectRedis();
  });

  afterAll(async () => {
    await closeMongoDB();
    await closeRedis();
  });
};

// Export for tests
export default {
  connectMongoDB,
  closeMongoDB,
  connectRedis,
  closeRedis,
  clearDatabase,
  setupDatabaseHooks,
};

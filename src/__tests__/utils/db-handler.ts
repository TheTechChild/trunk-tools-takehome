import { vi } from 'vitest';
import mongoose from 'mongoose';

/**
 * Connect to the MongoDB database container
 */
export const connect = async (): Promise<void> => {
  try {
    // Use the MongoDB container defined in docker-compose
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/currency-service-test';

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 15000, // 15 seconds
    });

    console.info('✅ Connected to MongoDB container at:', uri);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error; // Re-throw to fail tests if connection fails
  }
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.info('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

/**
 * Clear all collections
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    const collections = mongoose.connection.collections;

    // Use a dedicated test database to minimize the risk of data loss
    if (!process.env.MONGODB_URI?.includes('test')) {
      console.error(
        '❌ Refusing to clear non-test database. Ensure your MONGODB_URI contains "test"'
      );
      return;
    }

    for (const key in collections) {
      const collection = collections[key];
      if (collection) {
        await collection.deleteMany({});
      }
    }
    console.info('✅ Database collections cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

/**
 * Reset all mocks
 */
export const resetMocks = (): void => {
  vi.resetAllMocks();
};

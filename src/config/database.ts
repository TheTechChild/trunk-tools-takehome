import mongoose from 'mongoose';

/**
 * MongoDB connection options
 */
const mongooseOptions = {
  // Maintain up to 10 socket connections
  maxPoolSize: 10,
  // Close sockets after 45 seconds of inactivity
  socketTimeoutMS: 45000,
  // Keep trying to send operations for 5 seconds
  serverSelectionTimeoutMS: 5000,
  // Retries 5 times before failing
  retryReads: true,
};

/**
 * Get MongoDB connection status
 */
export const getDatabaseStatus = (): boolean => {
  return mongoose.connection.readyState === 1;
};

/**
 * Ensure database connection is established
 * If already connected, this function will do nothing
 */
export const ensureDatabaseConnection = async (): Promise<void> => {
  if (getDatabaseStatus()) {
    console.info('Already connected to MongoDB');
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/currency-service';

  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.info('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

/**
 * Close MongoDB connection
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.info('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

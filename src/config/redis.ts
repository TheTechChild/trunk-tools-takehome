import Redis from 'ioredis';

// Default connection timeout in milliseconds
const REDIS_CONNECT_TIMEOUT = 5000;

// Default TTL in seconds (10 minutes)
export const DEFAULT_CACHE_TTL = 600;

// Default Redis client
let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 */
export const initializeRedis = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

  try {
    redisClient = new Redis(REDIS_URI, {
      connectTimeout: REDIS_CONNECT_TIMEOUT,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        // Exponential backoff (ms)
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      console.info('Connected to Redis');
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    return redisClient;
  } catch (error) {
    console.error('Redis initialization error:', error);
    throw error;
  }
};

/**
 * Get Redis client
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return initializeRedis();
  }
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      console.info('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
};

/**
 * Get Redis connection status
 */
export const getRedisStatus = async (): Promise<boolean> => {
  if (!redisClient) {
    return false;
  }

  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
};

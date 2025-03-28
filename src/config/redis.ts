import Redis from 'ioredis';

// Default connection timeout in milliseconds
const REDIS_CONNECT_TIMEOUT = 5000;

// Default TTL in seconds (10 minutes)
export const DEFAULT_CACHE_TTL = 600;

// Default Redis client
let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 * Returns a Promise that resolves when Redis is ready
 */
export const initializeRedis = async (): Promise<Redis> => {
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  } else if (redisClient) {
    await redisClient.quit();
    redisClient = null;
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

    // Return a promise that resolves when Redis is ready
    return new Promise((resolve, reject) => {
      redisClient!.once('ready', () => {
        console.info('Connected to Redis');
        // Test basic Redis commands to ensure they're available
        redisClient!.ping()
          .then(() => {
            resolve(redisClient!);
          })
          .catch(reject);
      });

      redisClient!.once('error', (error) => {
        console.error('Redis connection error:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Redis initialization error:', error);
    throw error;
  }
};

/**
 * Get Redis client instance
 * If not initialized, will initialize first
 */
export const getRedisClient = async (): Promise<Redis> => {
  if (!redisClient || redisClient.status !== 'ready') {
    return initializeRedis();
  }
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.info('Redis connection closed');
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

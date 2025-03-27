/**
 * Redis mock utility for rate limiting tests
 * This provides mockable Redis clients for testing rate limiting
 */
import { mock } from 'bun:test';

// Mock actual Redis module
const mockRedisModule = () => {
  // Store data in memory
  const redisStore = new Map<string, string>();
  
  // Create a mock client with methods needed for rate limiting
  const createMockClient = () => ({
    get: mock((key: string) => Promise.resolve(redisStore.get(key) || null)),
    
    set: mock((key: string, value: string) => {
      redisStore.set(key, value);
      return Promise.resolve('OK');
    }),
    
    setex: mock((key: string, seconds: number, value: string) => {
      redisStore.set(key, value);
      return Promise.resolve('OK');
    }),
    
    incr: mock((key: string) => {
      const currentVal = parseInt(redisStore.get(key) || '0', 10);
      const newVal = currentVal + 1;
      redisStore.set(key, newVal.toString());
      return Promise.resolve(newVal);
    }),
    
    expire: mock(() => Promise.resolve(1)),
    
    del: mock((key: string) => {
      if (redisStore.has(key)) {
        redisStore.delete(key);
        return Promise.resolve(1);
      }
      return Promise.resolve(0);
    }),
    
    // Method to directly manipulate the store for testing
    _getStore: () => redisStore,
    
    // Method to clear all data
    _clearStore: () => {
      redisStore.clear();
      return Promise.resolve();
    },
    
    // Method to set a specific value for testing
    _setValue: (key: string, value: string) => {
      redisStore.set(key, value);
      return Promise.resolve();
    }
  });
  
  // Create a single client instance
  const mockClient = createMockClient();
  
  // Return a function to get the client
  return {
    getRedisClient: () => mockClient,
    
    // Method to clear the store at module level
    clearStore: () => {
      redisStore.clear();
      return Promise.resolve();
    }
  };
};

// Fixed date for testing rate limiting
export const mockDate = (dateString: string) => {
  const date = new Date(dateString);
  // Note: Bun doesn't have direct time mocking like Vitest
  // We can use this date within our tests
  return date;
};

// Export the mocked Redis module
export default mockRedisModule(); 
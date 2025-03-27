/**
 * Mock implementation of the Redis client for testing
 * This file should be imported instead of the real Redis client in tests
 */

import { mock } from 'bun:test';

// In-memory data store for tests
const redisStore: Map<string, string> = new Map();

// Mock Redis client implementation
const mockRedisClient = {
  get: mock((key: string) => {
    return Promise.resolve(redisStore.get(key) || null);
  }),
  
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
  })
};

// Function to clear store for testing
export function clearRedisStore(): void {
  redisStore.clear();
}

// Function to set specific values for testing
export function setRedisValue(key: string, value: string): void {
  redisStore.set(key, value);
}

// Export the mocked getRedisClient function to match the real module
export function getRedisClient() {
  return mockRedisClient;
}

// Export the store for direct manipulation in tests
export { redisStore }; 
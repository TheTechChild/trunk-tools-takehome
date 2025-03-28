/**
 * Artillery processor functions for load testing
 *
 * This module provides functions that can be used in Artillery load tests
 * to generate dynamic data and process requests/responses.
 */

import { testDataManager } from '../utils/test-data';

// Artillery types (minimal definition for our use case)
interface ArtilleryContext {
  vars: Record<string, any>;
}

interface ArtilleryRequest {
  url: string;
}

interface ArtilleryResponse {
  timings: {
    phases: {
      firstByte: number;
    };
  };
}

interface ArtilleryEventEmitter {
  emit(event: string, name: string, value: number): void;
}

// Initialize test data when the processor is loaded
let testUsers: string[] = [];

// Generate a random user ID for each virtual user
export async function generateUserId(userContext: ArtilleryContext, _events: any): Promise<void> {
  // Initialize test users if not already done
  if (testUsers.length === 0) {
    const users = await testDataManager.seedTestUsers(1000);
    testUsers = users.map((user) => user._id);
  }

  // Pick a random user ID from our seeded list
  const randomIndex = Math.floor(Math.random() * testUsers.length);
  userContext.vars.userId = testUsers[randomIndex];

  // Generate some random amounts
  userContext.vars.smallAmount = Math.floor(Math.random() * 100) + 1;
  userContext.vars.mediumAmount = Math.floor(Math.random() * 1000) + 100;
  userContext.vars.largeAmount = Math.floor(Math.random() * 10000) + 1000;

  // Pick random currency pairs for testing
  const currencies = ['USD', 'BTC'];
  userContext.vars.fromCurrency = currencies[Math.floor(Math.random() * (currencies.length - 1))];

  // Ensure we pick a different currency for the target
  let toCurrencyIndex;
  do {
    toCurrencyIndex = Math.floor(Math.random() * currencies.length);
  } while (currencies[toCurrencyIndex] === userContext.vars.fromCurrency);

  userContext.vars.toCurrency = currencies[toCurrencyIndex];
}

// Log response times for analysis
export async function logResponseTime(
  requestParams: ArtilleryRequest,
  response: ArtilleryResponse,
  _context: ArtilleryContext,
  _ee: ArtilleryEventEmitter
): Promise<void> {
  const url = requestParams.url;
  const responseTime = response.timings.phases.firstByte;

  // Log to console in development
  // Using globalThis to reference the global scope in a type-safe way
  if (globalThis.process?.env.NODE_ENV !== 'production') {
    globalThis.console?.log(`Request to ${url} completed in ${responseTime}ms`);
  }
}

// Track cache hits/misses based on response times
export async function trackCacheStatus(
  _requestParams: ArtilleryRequest,
  response: ArtilleryResponse,
  _context: ArtilleryContext,
  ee: ArtilleryEventEmitter
): Promise<void> {
  // We're making an assumption that cache hits will be under 50ms
  // This is an approximation for demonstration purposes
  const responseTime = response.timings.phases.firstByte;

  if (responseTime < 50) {
    // Likely a cache hit
    ee.emit('counter', 'cache.hits', 1);
  } else {
    // Likely a cache miss
    ee.emit('counter', 'cache.misses', 1);
  }
}

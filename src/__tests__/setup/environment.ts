/**
 * Test Environment Setup
 *
 * Loads environment variables from .env.test file for test suites.
 * This file should be imported at the top of test files or in the test setup.
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load test environment variables
dotenv.config({
  path: resolve(__dirname, '../../../.env.test'),
  override: true,
});

/**
 * Validates that all required environment variables are set
 */
export function validateTestEnvironment(): void {
  const requiredVars = ['APP_URL', 'PORT', 'NODE_ENV', 'MONGODB_URI', 'REDIS_HOST', 'REDIS_PORT'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Validate the environment when this module is imported
validateTestEnvironment();

console.info('🧪 Test environment variables loaded from .env.test');

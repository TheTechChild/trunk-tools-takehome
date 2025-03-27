/**
 * Application Constants
 */

// Helper function to parse numeric environment variables
const parseNumericEnv = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Coinbase API URL
export const COINBASE_API_URL = process.env.COINBASE_API_URL || 'https://api.coinbase.com/v2';

// Supported currencies
export const SUPPORTED_CURRENCIES = ['BTC', 'USD'];

// Rate limiting constants
export const RATE_LIMIT = {
  WEEKDAY: parseNumericEnv(process.env.RATE_LIMIT_WEEKDAY, 100),
  WEEKEND: parseNumericEnv(process.env.RATE_LIMIT_WEEKEND, 200),
  KEY_PREFIX: 'rate_limit',
};

// Cache constants
export const CACHE = {
  EXCHANGE_RATE_TTL: 600, // 10 minutes in seconds
  EXCHANGE_RATE_KEY_PREFIX: 'exchange_rate',
};

// Decimal precision
export const DECIMAL_PRECISION = {
  BTC: parseNumericEnv(process.env.DECIMAL_PRECISION_BTC, 8),
  USD: parseNumericEnv(process.env.DECIMAL_PRECISION_USD, 2),
};

// Maximum amounts
export const MAX_AMOUNTS = {
  BTC: parseNumericEnv(process.env.MAX_AMOUNT_BTC, 1000),
};

// Authentication
export const AUTH = {
  TOKEN_EXPIRY: '24h', // JWT token expiry
}; 
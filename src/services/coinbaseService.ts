import { getRedisClient } from '../config/redis';
import { InternalServerError } from '../errors/AppError';
import { COINBASE_API_URL, CACHE } from '../config/constants';

// Coinbase API response types
interface CoinbaseApiResponse {
  data: {
    currency: string;
    rates: Record<string, string>;
  };
}

interface ExchangeRateData {
  rate: number;
  timestamp: Date;
}

/**
 * Coinbase API Service
 * Handles fetching exchange rates from Coinbase API with Redis caching
 */
export class CoinbaseService {
  private baseApiUrl: string;

  constructor() {
    // Get Coinbase API URL from environment variable or use default
    this.baseApiUrl = COINBASE_API_URL;
  }

  /**
   * Get current exchange rate for a given currency pair
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateData> {
    const cacheKey = this.getExchangeRateCacheKey(fromCurrency, toCurrency);
    const redisClient = await getRedisClient();

    try {
      // Try to get rate from Redis cache first
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData) as ExchangeRateData;
        return parsedData;
      }

      // If not in cache, fetch from Coinbase API
      const rateData = await this.fetchExchangeRateFromApi(fromCurrency, toCurrency);

      // Store in cache with expiration
      await redisClient.set(cacheKey, JSON.stringify(rateData), 'EX', CACHE.EXCHANGE_RATE_TTL);

      return rateData;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      throw new InternalServerError('Failed to fetch exchange rate', 'EXCHANGE_RATE_FETCH_ERROR');
    }
  }

  /**
   * Fetch exchange rate from Coinbase API
   */
  private async fetchExchangeRateFromApi(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ExchangeRateData> {
    const currencyPair = `${fromCurrency}-${toCurrency}`;
    const url = `${this.baseApiUrl}/exchange-rates?currency=${fromCurrency}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Coinbase API responded with status: ${response.status}`);
      }

      const data = (await response.json()) as CoinbaseApiResponse;

      // Handle API specific errors if present
      if (!data.data || !data.data.rates || !data.data.rates[toCurrency]) {
        throw new Error(`Invalid response from Coinbase API for ${currencyPair}`);
      }

      return {
        rate: parseFloat(data.data.rates[toCurrency]),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Failed to fetch exchange rate from Coinbase API: ${error}`);
      throw new InternalServerError(
        'Unable to fetch exchange rate from external service',
        'EXCHANGE_RATE_API_ERROR'
      );
    }
  }

  /**
   * Get cache key for exchange rate
   */
  private getExchangeRateCacheKey(fromCurrency: string, toCurrency: string): string {
    return `${CACHE.EXCHANGE_RATE_KEY_PREFIX}:${fromCurrency.toUpperCase()}-${toCurrency.toUpperCase()}`;
  }
}

// Export singleton instance
export const coinbaseService = new CoinbaseService();

import { cacheService } from './cache.service';
import type { ExchangeRateCache } from '../types/cache.types';
import { DEFAULT_CACHE_TTL } from '../config/redis';

/**
 * Exchange Rate Service
 * Handles fetching and caching of currency exchange rates
 */
export class ExchangeRateService {
  private readonly CACHE_KEY_PREFIX = 'exchange-rate';
  private readonly DEFAULT_TTL = DEFAULT_CACHE_TTL; // 10 minutes

  /**
   * Get exchange rate from cache or external API
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const cacheKey = this.buildCacheKey(fromCurrency, toCurrency);

    try {
      // Try to get from cache first
      const cachedRate = await this.getRateFromCache(cacheKey);

      if (cachedRate) {
        // Return cached data immediately
        const cachedTimestamp = new Date(cachedRate.timestamp);
        const currentTime = new Date();

        // Check if the cache is getting stale (>75% of TTL elapsed)
        const cacheAge = currentTime.getTime() - cachedTimestamp.getTime();
        const staleTreshold = this.DEFAULT_TTL * 1000 * 0.75; // 75% of TTL in ms

        // If cache is getting stale, refresh in background
        if (cacheAge > staleTreshold) {
          // Don't await - refresh in background
          this.refreshCache(fromCurrency, toCurrency).catch((error) => {
            console.error(`Background refresh failed for ${fromCurrency}-${toCurrency}:`, error);
          });
        }

        return cachedRate.exchange_rate;
      }

      // Not in cache, fetch from external API
      const exchangeRate = await this.fetchRateFromExternalAPI(fromCurrency, toCurrency);

      // Cache the new rate
      await this.cacheExchangeRate(cacheKey, exchangeRate);

      return exchangeRate;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      throw new Error(`Failed to get exchange rate for ${fromCurrency} to ${toCurrency}`);
    }
  }

  /**
   * Get exchange rates for multiple currencies
   */
  async getExchangeRates(
    baseCurrency: string,
    targetCurrencies: string[]
  ): Promise<Record<string, number>> {
    const result: Record<string, number> = {};

    // Execute in parallel for better performance
    await Promise.all(
      targetCurrencies.map(async (targetCurrency) => {
        try {
          const rate = await this.getExchangeRate(baseCurrency, targetCurrency);
          result[targetCurrency] = rate;
        } catch (error) {
          console.error(`Error getting exchange rate for ${targetCurrency}:`, error);
          result[targetCurrency] = 0; // Indicate error with 0 rate
        }
      })
    );

    return result;
  }

  /**
   * Build cache key for exchange rate
   */
  private buildCacheKey(fromCurrency: string, toCurrency: string): string {
    return `${this.CACHE_KEY_PREFIX}:${fromCurrency.toUpperCase()}-${toCurrency.toUpperCase()}`;
  }

  /**
   * Get exchange rate from cache
   */
  private async getRateFromCache(cacheKey: string): Promise<ExchangeRateCache | null> {
    return await cacheService.get<ExchangeRateCache>(cacheKey);
  }

  /**
   * Cache exchange rate
   */
  private async cacheExchangeRate(cacheKey: string, rate: number): Promise<void> {
    const cacheValue: ExchangeRateCache = {
      exchange_rate: rate,
      timestamp: new Date().toISOString(),
    };

    await cacheService.set<ExchangeRateCache>(cacheKey, cacheValue, {
      ttl: this.DEFAULT_TTL,
    });
  }

  /**
   * Fetch exchange rate from external API
   * Currently mocked, but will be replaced by actual API call in Phase 3
   */
  private async fetchRateFromExternalAPI(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    // Mock implementation - will be replaced with actual API call
    // This is just for Phase 2 implementation
    const mockRates: Record<string, number> = {
      'BTC-USD': 67890.12,
      'USD-EUR': 0.91,
      'USD-GBP': 0.78,
      'EUR-USD': 1.1,
      'BTC-EUR': 61800.21,
    };

    const key = `${fromCurrency.toUpperCase()}-${toCurrency.toUpperCase()}`;
    const reverseKey = `${toCurrency.toUpperCase()}-${fromCurrency.toUpperCase()}`;

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (mockRates[key]) {
      return mockRates[key];
    } else if (mockRates[reverseKey]) {
      return 1 / mockRates[reverseKey];
    } else {
      // Default fallback for mock implementation
      return 1.0;
    }
  }

  /**
   * Invalidate cache for a specific currency pair
   */
  async invalidateCache(fromCurrency: string, toCurrency: string): Promise<void> {
    const cacheKey = this.buildCacheKey(fromCurrency, toCurrency);
    await cacheService.del(cacheKey);
  }

  /**
   * Refresh cache for a specific currency pair
   */
  async refreshCache(fromCurrency: string, toCurrency: string): Promise<number> {
    const cacheKey = this.buildCacheKey(fromCurrency, toCurrency);

    // Fetch new rate from API
    const exchangeRate = await this.fetchRateFromExternalAPI(fromCurrency, toCurrency);

    // Update cache
    await this.cacheExchangeRate(cacheKey, exchangeRate);

    return exchangeRate;
  }
}

// Export singleton instance
export const exchangeRateService = new ExchangeRateService();

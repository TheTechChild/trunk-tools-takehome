/**
 * Cache type definitions
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export interface ExchangeRateCache {
  exchange_rate: number;
  timestamp: string;
}

export interface CacheServiceInterface {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  ping(): Promise<boolean>;
}

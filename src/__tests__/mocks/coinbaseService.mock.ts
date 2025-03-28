/**
 * Mock Coinbase Service for Testing
 *
 * Provides a consistent mock implementation of the Coinbase API service
 * for use in unit and integration tests.
 */

import { CoinbaseService } from '../../services/coinbaseService';
import { mock } from 'bun:test';

// Define interface from the original service
interface ExchangeRateData {
  rate: number;
  timestamp: Date;
}

// Mocked rates for testing
const RATES: Record<string, Record<string, number>> = {
  USD: {
    BTC: 0.000033, // USD to BTC rate
  },
  BTC: {
    USD: 30000, // BTC to USD rate
  },
};

// Create the mock function
const getExchangeRateMock = mock(
  async (fromCurrency: string, toCurrency: string): Promise<ExchangeRateData> => {
    const fromCurr = fromCurrency.toUpperCase();
    const toCurr = toCurrency.toUpperCase();

    if (!RATES[fromCurr] || !RATES[fromCurr][toCurr]) {
      throw new Error(`Conversion from ${fromCurr} to ${toCurr} is not supported`);
    }

    return {
      rate: RATES[fromCurr][toCurr],
      timestamp: new Date(),
    };
  }
);

export const mockCoinbaseService: Partial<CoinbaseService> = {
  getExchangeRate: getExchangeRateMock,
};

// Use this function to reset the mock state if needed
export function resetCoinbaseServiceMock() {
  getExchangeRateMock.mockReset();
}

export default mockCoinbaseService;

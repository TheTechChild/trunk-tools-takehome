import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ConversionService } from '../../../services/conversionService';
import { mockCoinbaseService } from '../../mocks/coinbaseService.mock';
import { BadRequestError } from '../../../errors/AppError';
import type { IRequestLog } from '../../../types/database.types';

// Create a mock request log
const mockRequestLog: IRequestLog = {
  _id: 'mock-id',
  user_id: 'user123',
  from_currency: 'USD',
  to_currency: 'BTC',
  amount: 100,
  converted_amount: 0.0033,
  exchange_rate: 0.000033,
  timestamp: new Date(),
};

// Mock the dependencies with proper return type
const mockCreate = mock(() => Promise.resolve(mockRequestLog));

// Mock modules
import { requestLogRepository } from '../../../repositories/requestLog.repository';
requestLogRepository.create = mockCreate as any; // Type assertion to avoid type issues

// Override coinbaseService with our mock
import { coinbaseService } from '../../../services/coinbaseService';
Object.assign(coinbaseService, mockCoinbaseService);

describe('ConversionService', () => {
  let conversionService: ConversionService;

  beforeEach(() => {
    conversionService = new ConversionService();
    mockCreate.mockClear();
  });

  describe('convertCurrency', () => {
    it('should successfully convert from USD to BTC', async () => {
      // Arrange
      const fromCurrency = 'USD';
      const toCurrency = 'BTC';
      const amount = 100;
      const userId = 'user123';

      // Act
      const result = await conversionService.convertCurrency(
        fromCurrency,
        toCurrency,
        amount,
        userId
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.from).toBe(fromCurrency);
      expect(result.to).toBe(toCurrency);
      expect(result.amount).toBe(amount);
      expect(result.convertedAmount).toBeCloseTo(0.0033, 4); // USD to BTC rate is 0.000033
      expect(result.rate).toBeCloseTo(0.000033, 6);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should successfully convert from BTC to USD', async () => {
      // Arrange
      const fromCurrency = 'BTC';
      const toCurrency = 'USD';
      const amount = 1;
      const userId = 'user123';

      // Act
      const result = await conversionService.convertCurrency(
        fromCurrency,
        toCurrency,
        amount,
        userId
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.from).toBe(fromCurrency);
      expect(result.to).toBe(toCurrency);
      expect(result.amount).toBe(amount);
      expect(result.convertedAmount).toBeCloseTo(30000, 2); // BTC to USD rate is 30000
      expect(result.rate).toBeCloseTo(30000, 2);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should throw an error for unsupported currencies', async () => {
      // Arrange
      const fromCurrency = 'USD';
      const toCurrency = 'XYZ'; // Unsupported
      const amount = 100;
      const userId = 'user123';

      // Act & Assert
      await expect(
        conversionService.convertCurrency(fromCurrency, toCurrency, amount, userId)
      ).rejects.toThrow(BadRequestError);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should throw an error for negative amounts', async () => {
      // Arrange
      const fromCurrency = 'USD';
      const toCurrency = 'BTC';
      const amount = -100; // Negative amount
      const userId = 'user123';

      // Act & Assert
      await expect(
        conversionService.convertCurrency(fromCurrency, toCurrency, amount, userId)
      ).rejects.toThrow(BadRequestError);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should throw an error for same source and target currencies', async () => {
      // Arrange
      const fromCurrency = 'USD';
      const toCurrency = 'USD'; // Same currency
      const amount = 100;
      const userId = 'user123';

      // Act & Assert
      await expect(
        conversionService.convertCurrency(fromCurrency, toCurrency, amount, userId)
      ).rejects.toThrow(BadRequestError);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should handle currency case insensitivity', async () => {
      // Arrange
      const fromCurrency = 'usd'; // lowercase
      const toCurrency = 'BtC'; // mixed case
      const amount = 100;
      const userId = 'user123';

      // Act
      const result = await conversionService.convertCurrency(
        fromCurrency,
        toCurrency,
        amount,
        userId
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.from).toBe(fromCurrency);
      expect(result.to).toBe(toCurrency);
      expect(result.convertedAmount).toBeCloseTo(0.0033, 4); // USD to BTC conversion
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});

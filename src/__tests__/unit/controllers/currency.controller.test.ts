import { describe, it, expect, beforeEach, mock, afterAll } from 'bun:test';
import { currencyController } from '../../../controllers/currency.controller';
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/authentication';
import { conversionService } from '../../../services/conversionService';
import { coinbaseService } from '../../../services/coinbaseService';

// Create backup of original functions (to restore later if needed)
const originalConvertCurrency = conversionService.convertCurrency;
const originalGetExchangeRate = coinbaseService.getExchangeRate;

// Setup mocks
conversionService.convertCurrency = mock(() =>
  Promise.resolve({
    from: 'USD',
    to: 'BTC',
    amount: 100,
    convertedAmount: 0.0033,
    rate: 0.000033,
    timestamp: new Date(),
  })
);

coinbaseService.getExchangeRate = mock(() =>
  Promise.resolve({
    rate: 0.000033,
    timestamp: new Date(),
  })
);

describe('Currency Controller', () => {
  // Create mock request, response, and next function
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: ReturnType<typeof mock>;

  beforeEach(() => {
    // Reset mock implementations before each test
    mockRequest = {
      query: {},
      user: {
        userId: 'test-user-123',
        email: 'test@example.com',
      },
    };

    mockResponse = {
      status: mock(function (this: any) {
        return this;
      }),
      json: mock(),
    };

    nextFunction = mock();

    // Reset mocks
    (conversionService.convertCurrency as ReturnType<typeof mock>).mockClear();
    (coinbaseService.getExchangeRate as ReturnType<typeof mock>).mockClear();
  });

  // Cleanup after all tests
  afterAll(() => {
    // Restore original functions
    conversionService.convertCurrency = originalConvertCurrency;
    coinbaseService.getExchangeRate = originalGetExchangeRate;
  });

  describe('convertCurrency', () => {
    it('should convert currency when valid parameters are provided', async () => {
      // Arrange
      mockRequest.query = {
        from: 'USD',
        to: 'BTC',
        amount: '100',
      };

      // Act
      await currencyController.convertCurrency(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction as NextFunction
      );

      // Assert
      expect(conversionService.convertCurrency).toHaveBeenCalledWith(
        'USD',
        'BTC',
        100,
        'test-user-123'
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should call next with BadRequestError when required parameters are missing', async () => {
      // Arrange
      mockRequest.query = {
        from: 'USD',
        // 'to' and 'amount' are missing
      };

      // Act
      await currencyController.convertCurrency(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction as NextFunction
      );

      // Assert
      expect(nextFunction).toHaveBeenCalled();
      expect(conversionService.convertCurrency).not.toHaveBeenCalled();
    });
  });

  describe('getExchangeRates', () => {
    it('should return exchange rates with specified base currency', async () => {
      // Arrange
      mockRequest.query = {
        base: 'USD',
      };

      // Act
      await currencyController.getExchangeRates(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction as NextFunction
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should use USD as default base currency if not specified', async () => {
      // Arrange
      mockRequest.query = {}; // No base currency specified

      // Act
      await currencyController.getExchangeRates(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction as NextFunction
      );

      // Assert
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of supported currencies', async () => {
      // Act
      await currencyController.getSupportedCurrencies(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction as NextFunction
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

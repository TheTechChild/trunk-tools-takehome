import type { Request, Response, NextFunction } from 'express';
import { currencyController } from '../../../controllers/currency.controller';
import { BadRequestError } from '../../../errors/AppError';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Currency Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction = vi.fn();
  let responseObject: any = {};

  beforeEach(() => {
    mockRequest = {
      query: {}
    };
    responseObject = {
      statusCode: 0,
      body: {}
    };
    mockResponse = {
      status: vi.fn().mockImplementation((code) => {
        responseObject.statusCode = code;
        return mockResponse;
      }),
      json: vi.fn().mockImplementation((data) => {
        responseObject.body = data;
        return mockResponse;
      })
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('convertCurrency', () => {
    it('should convert currency when valid parameters are provided', () => {
      // Arrange
      mockRequest.query = {
        from: 'USD',
        to: 'EUR',
        amount: '100'
      };

      // Act
      currencyController.convertCurrency(
        mockRequest as Request, 
        mockResponse as Response, 
        nextFunction as unknown as NextFunction
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body.success).toBe(true);
      expect(responseObject.body.data).toHaveProperty('from', 'USD');
      expect(responseObject.body.data).toHaveProperty('to', 'EUR');
      expect(responseObject.body.data).toHaveProperty('amount', 100);
      expect(responseObject.body.data).toHaveProperty('rate');
      expect(responseObject.body.data).toHaveProperty('result');
      expect(responseObject.body.data).toHaveProperty('timestamp');
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with BadRequestError when required parameters are missing', () => {
      // Arrange
      mockRequest.query = {
        from: 'USD',
        // missing 'to' and 'amount'
      };

      // Act
      currencyController.convertCurrency(
        mockRequest as Request, 
        mockResponse as Response, 
        nextFunction as unknown as NextFunction
      );

      // Assert
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledTimes(1);
      
      // Add type guard to ensure the error object exists
      const errorObj = nextFunction.mock.calls[0]?.[0];
      expect(errorObj).toBeDefined();
      expect(errorObj).toBeInstanceOf(BadRequestError);
      
      // Type assertion since we've verified it exists and is a BadRequestError
      const error = errorObj as BadRequestError;
      expect(error.message).toBe('Missing required parameters');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ required: ['from', 'to', 'amount'] });
    });
  });

  describe('getExchangeRates', () => {
    it('should return exchange rates with specified base currency', () => {
      // Arrange
      mockRequest.query = {
        base: 'EUR'
      };

      // Act
      currencyController.getExchangeRates(
        mockRequest as Request, 
        mockResponse as Response, 
        nextFunction as unknown as NextFunction
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body.success).toBe(true);
      expect(responseObject.body.data).toHaveProperty('base', 'EUR');
      expect(responseObject.body.data).toHaveProperty('rates');
      expect(responseObject.body.data).toHaveProperty('timestamp');
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should use USD as default base currency if not specified', () => {
      // Arrange
      mockRequest.query = {};

      // Act
      currencyController.getExchangeRates(
        mockRequest as Request, 
        mockResponse as Response, 
        nextFunction as unknown as NextFunction
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body.data).toHaveProperty('base', 'USD');
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of supported currencies', () => {
      // Act
      currencyController.getSupportedCurrencies(
        mockRequest as Request, 
        mockResponse as Response, 
        nextFunction as unknown as NextFunction
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body.success).toBe(true);
      expect(responseObject.body.data).toBeInstanceOf(Array);
      expect(responseObject.body.data.length).toBeGreaterThan(0);
      expect(responseObject.body.data[0]).toHaveProperty('code');
      expect(responseObject.body.data[0]).toHaveProperty('name');
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
}); 
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../middleware/errorHandler';
import { AppError, BadRequestError, NotFoundError, InternalServerError } from '../../../errors/AppError';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = vi.fn();
  let responseObject: any = {};

  beforeEach(() => {
    mockRequest = {
      path: '/test-path',
      method: 'GET'
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
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle AppError with correct status code and error details', () => {
    // Arrange
    const error = new BadRequestError('Invalid input', 'VALIDATION_ERROR', { field: 'amount' });

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(responseObject.body.success).toBe(false);
    expect(responseObject.body.error.code).toBe('VALIDATION_ERROR');
    expect(responseObject.body.error.message).toBe('Invalid input');
    expect(responseObject.body.error.details).toEqual({ field: 'amount' });
  });

  it('should handle NotFoundError correctly', () => {
    // Arrange
    const error = new NotFoundError('Resource not found', 'RESOURCE_NOT_FOUND');

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(responseObject.body.error.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('should handle regular Error as InternalServerError', () => {
    // Arrange
    const error = new Error('Something went wrong');

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(responseObject.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(responseObject.body.error.message).toBe('Something went wrong');
  });

  it('should include stack trace in development mode', () => {
    // Arrange
    const error = new InternalServerError('Server error');
    process.env.NODE_ENV = 'development';

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(responseObject.body.error).toHaveProperty('stack');
  });

  it('should not include stack trace in production mode', () => {
    // Arrange
    const error = new InternalServerError('Server error');
    process.env.NODE_ENV = 'production';

    // Act
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(responseObject.body.error).not.toHaveProperty('stack');

    // Reset environment
    process.env.NODE_ENV = 'test';
  });
}); 
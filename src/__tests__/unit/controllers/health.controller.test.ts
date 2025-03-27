import type { Request, Response } from 'express';
import { healthController } from '../../../controllers/health.controller';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Health Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any = {};

  beforeEach(() => {
    mockRequest = {};
    responseObject = {
      statusCode: 0,
      body: {},
    };
    mockResponse = {
      status: vi.fn().mockImplementation((code: number) => {
        responseObject.statusCode = code;
        return mockResponse as Response;
      }),
      json: vi.fn().mockImplementation((data: any) => {
        responseObject.body = data;
        return mockResponse as Response;
      }),
    };
  });

  describe('getStatus', () => {
    it('should return a 200 status and basic health data', () => {
      // Act
      healthController.getStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toHaveProperty('status', 'ok');
      expect(responseObject.body).toHaveProperty('timestamp');
      expect(responseObject.body).toHaveProperty('service', 'currency-conversion-service');
    });
  });

  describe('getDetailedStatus', () => {
    it('should return a 200 status and detailed health data', async () => {
      // Act
      await healthController.getDetailedStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.body).toHaveProperty('status', 'ok');
      expect(responseObject.body).toHaveProperty('timestamp');
      expect(responseObject.body).toHaveProperty('uptime');
      expect(responseObject.body).toHaveProperty('memory');
      expect(responseObject.body).toHaveProperty('dependencies');
      expect(responseObject.body.dependencies).toHaveProperty('database');
      expect(responseObject.body.dependencies).toHaveProperty('redis');
    });
  });
});

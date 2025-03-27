import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { configureRoutes } from '../../../routes/index';
import { errorHandler } from '../../../middleware/errorHandler';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Currency API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    // Create a test app with our routes and middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    configureRoutes(app);
    app.use(errorHandler);
  });

  describe('GET /api/v1/currency/convert', () => {
    it('should convert currency successfully with valid parameters', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/currency/convert')
        .query({ from: 'USD', to: 'EUR', amount: '100' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('from', 'USD');
      expect(response.body.data).toHaveProperty('to', 'EUR');
      expect(response.body.data).toHaveProperty('amount', 100);
      expect(response.body.data).toHaveProperty('rate');
      expect(response.body.data).toHaveProperty('result');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should return 400 when required parameters are missing', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/currency/convert')
        .query({ from: 'USD' }); // Missing 'to' and 'amount'

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'INVALID_PARAMETERS');
      expect(response.body.error).toHaveProperty('message', 'Missing required parameters');
      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('required');
    });
  });

  describe('GET /api/v1/currency/rates', () => {
    it('should return exchange rates with default base currency', async () => {
      // Act
      const response = await request(app).get('/api/v1/currency/rates');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('base', 'USD');
      expect(response.body.data).toHaveProperty('rates');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should return exchange rates with specified base currency', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/currency/rates')
        .query({ base: 'EUR' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('base', 'EUR');
    });
  });

  describe('GET /api/v1/currency/supported', () => {
    it('should return the list of supported currencies', async () => {
      // Act
      const response = await request(app).get('/api/v1/currency/supported');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('code');
      expect(response.body.data[0]).toHaveProperty('name');
    });
  });
}); 
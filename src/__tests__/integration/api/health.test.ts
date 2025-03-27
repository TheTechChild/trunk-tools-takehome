import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { configureRoutes } from '../../../routes/index';
import { errorHandler } from '../../../middleware/errorHandler';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Health API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    // Create a test app with our routes and middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    configureRoutes(app);
    app.use(errorHandler);
  });

  describe('GET /health', () => {
    it('should return a 200 status and basic health check info', async () => {
      // Act
      const response = await request(app).get('/health');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'currency-conversion-service');
    });
  });

  describe('GET /health/detailed', () => {
    it('should return a 200 status and detailed health check info', async () => {
      // Act
      const response = await request(app).get('/health/detailed');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('dependencies');
      expect(response.body.dependencies).toHaveProperty('database');
      expect(response.body.dependencies).toHaveProperty('redis');
    });
  });
});

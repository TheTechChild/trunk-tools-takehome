import supertest from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { beforeAll, describe, expect, it, mock, afterAll } from 'bun:test';
import { configureRoutes } from '../../../routes/index';
import { errorHandler } from '../../../middleware/errorHandler';
import '../../setup/environment'; // Import environment setup

// Import services that need mocking
import { cacheService } from '../../../services/cache.service';

describe('Health API Integration Tests', () => {
  let app: Express;
  let request: ReturnType<typeof supertest>;

  // Preserve original implementations to restore later
  const originalCachePing = cacheService.ping;

  beforeAll(() => {
    // Mock Redis status
    cacheService.ping = mock(() => Promise.resolve(true));

    // Create a test app with our routes and middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    configureRoutes(app);
    app.use(errorHandler);

    request = supertest(app);

    console.info('✅ Health API test setup complete');
  });

  afterAll(() => {
    // Restore original implementations
    cacheService.ping = originalCachePing;

    console.info('✅ Health API test cleanup complete');
  });

  describe('GET /health', () => {
    it('should return a 200 status and basic health check info', async () => {
      // Act
      const response = await request.get('/health');

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
      const response = await request.get('/health/detailed');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('dependencies');
      expect(response.body.dependencies).toHaveProperty('database');
      expect(response.body.dependencies).toHaveProperty('redis');

      // Both dependencies should be healthy as the controller returns static values
      expect(response.body.dependencies.database.status).toBe('ok');
      expect(response.body.dependencies.redis.status).toBe('ok');
    });
  });
});

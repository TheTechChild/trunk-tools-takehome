import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';
import { authenticate } from '../middleware/authentication';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/v1/metrics/cache - Get cache metrics
router.get('/cache', authenticate, rateLimiter, metricsController.getCacheMetrics);

// GET /api/v1/metrics/health - Get system health
router.get('/health', authenticate, rateLimiter, metricsController.getSystemHealth);

export default router;

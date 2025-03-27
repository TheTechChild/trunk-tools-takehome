import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller';

const router = Router();

// GET /api/v1/metrics/cache - Get cache metrics
router.get('/cache', metricsController.getCacheMetrics);

// GET /api/v1/metrics/health - Get system health
router.get('/health', metricsController.getSystemHealth);

export default router; 
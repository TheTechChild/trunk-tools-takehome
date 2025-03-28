import { Router } from 'express';
import { healthController } from '../controllers/health.controller';
import { authenticate } from '../middleware/authentication';

const router = Router();

// GET /health - Basic health check
router.get('/', healthController.getStatus);

// GET /health/detailed - Detailed health check that includes database and external service dependencies
router.get('/detailed', authenticate, healthController.getDetailedStatus);

export default router;

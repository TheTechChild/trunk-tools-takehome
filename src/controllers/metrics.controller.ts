import type { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import { getRedisStatus } from '../config/redis';
import { getDatabaseStatus } from '../config/database';

/**
 * Metrics controller for service health and monitoring
 */
export const metricsController = {
  /**
   * Get cache metrics
   */
  getCacheMetrics: (req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = cacheService.getMetrics();

      res.status(200).json({
        success: true,
        data: {
          cache: metrics,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get system health metrics
   */
  getSystemHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisStatus = await getRedisStatus();
      const databaseStatus = getDatabaseStatus();

      res.status(200).json({
        success: true,
        data: {
          redis: {
            connected: redisStatus,
          },
          database: {
            connected: databaseStatus,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

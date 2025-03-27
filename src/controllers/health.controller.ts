import type { Request, Response } from 'express';

/**
 * Health check controller
 */
export const healthController = {
  /**
   * Get basic health status
   */
  getStatus: (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'currency-conversion-service',
    });
  },

  /**
   * Get detailed health status including dependencies
   */
  getDetailedStatus: async (req: Request, res: Response) => {
    try {
      // In a real application, we would check database connections,
      // external services, etc.
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'currency-conversion-service',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        // These would be actual checks in a real application
        dependencies: {
          database: {
            status: 'ok',
            responseTime: 10, // example value in ms
          },
          redis: {
            status: 'ok',
            responseTime: 5, // example value in ms
          },
        },
      };

      res.status(200).json(health);
    } catch {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to retrieve health details',
      });
    }
  },
};

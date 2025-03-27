import type { Express } from 'express';
import healthRoutes from './health.routes';
import currencyRoutes from './currency.routes';

/**
 * Configure all application routes
 */
export const configureRoutes = (app: Express): void => {
  // Health check routes
  app.use('/health', healthRoutes);

  // API v1 routes
  app.use('/api/v1/currency', currencyRoutes);
};

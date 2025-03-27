import type { Request, Response, NextFunction } from 'express';
import { requestLogRepository } from '../repositories';
import type { IRequestLog } from '../types/database.types';

/**
 * Middleware to log currency conversion requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Only log currency conversion requests
  const isConversionRequest = req.path.includes('/convert') && req.method === 'GET';

  // If not a conversion request, move on
  if (!isConversionRequest) {
    return next();
  }

  // Get user ID from auth (this will be implemented in Phase 3)
  // For now, use a placeholder mock user ID
  const userId = req.headers.authorization?.split(' ')[1] || 'mock-user-id';

  // Parse query parameters
  const { from, to, amount } = req.query;

  // Check if required parameters are present
  if (!from || !to || !amount) {
    return next();
  }

  // Capture the original json method
  const originalJson = res.json;

  // Override the json method
  res.json = function (body: any): Response {
    // Log the request asynchronously (non-blocking)
    if (body?.success && body?.data) {
      const data = body.data;
      const logData: Omit<IRequestLog, '_id'> = {
        user_id: userId,
        from_currency: from as string,
        to_currency: to as string,
        amount: parseFloat(amount as string),
        converted_amount: data.result || 0,
        exchange_rate: data.rate || 0,
        timestamp: new Date(),
      };

      // Don't await, so it doesn't block the response
      requestLogRepository
        .create(logData)
        .catch((error) => console.error('Error logging request:', error));
    }

    // Call the original json method
    return originalJson.call(this, body);
  };

  next();
};

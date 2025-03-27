import type { Request, Response, NextFunction } from 'express';
// Import using the TypeScript module pattern
import { AppError } from '../errors/AppError';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  // Log the error (would be replaced with a proper logger in production)
  console.error(`[ERROR] ${errorCode}: ${message}`, {
    path: req.path,
    method: req.method,
    ...(err instanceof AppError ? { details: err.details } : {}),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(err instanceof AppError && err.details ? { details: err.details } : {}),
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};

/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    
    // Capturing stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Invalid input
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errorCode: string = 'BAD_REQUEST', details?: Record<string, unknown>) {
    super(message, 400, errorCode, details);
  }
}

/**
 * 401 Unauthorized - Authentication is required
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', errorCode: string = 'UNAUTHORIZED', details?: Record<string, unknown>) {
    super(message, 401, errorCode, details);
  }
}

/**
 * 403 Forbidden - No permission to access
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', errorCode: string = 'FORBIDDEN', details?: Record<string, unknown>) {
    super(message, 403, errorCode, details);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', errorCode: string = 'NOT_FOUND', details?: Record<string, unknown>) {
    super(message, 404, errorCode, details);
  }
}

/**
 * 429 Too Many Requests - Rate limiting
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', errorCode: string = 'TOO_MANY_REQUESTS', details?: Record<string, unknown>) {
    super(message, 429, errorCode, details);
  }
}

/**
 * 500 Internal Server Error - Unexpected error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', errorCode: string = 'INTERNAL_SERVER_ERROR', details?: Record<string, unknown>) {
    super(message, 500, errorCode, details);
  }
} 
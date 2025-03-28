import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import { userRepository } from '../repositories/user.repository';

// Authentication interface to extend Express Request
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

/**
 * Bearer Token Authentication Middleware
 * Validates the Bearer token and attaches user info to the request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get Bearer token authentication
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Authentication required', 'MISSING_TOKEN');
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid token format', 'INVALID_TOKEN_FORMAT');
    }

    const token = parts[1];

    // In a real application, we would verify the token using JWT or another token validation
    // For this example, we'll treat the token as a user ID and verify it exists in our database
    if (!token) {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }

    // Find user by ID (token)
    const user = await userRepository.findById(token);

    if (!user) {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

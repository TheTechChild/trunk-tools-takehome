import type { Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { TooManyRequestsError, UnauthorizedError } from '../errors/AppError';
import type { AuthenticatedRequest } from './authentication';
import { RATE_LIMIT } from '../config/constants';

/**
 * Rate Limiting Middleware
 * Limits API requests based on weekday/weekend and user identity
 */
export const rateLimiter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.userId) {
      return next(new UnauthorizedError('Authentication required', 'Invalid token'));
    }

    const userId = req.user.userId;
    const redisClient = await getRedisClient();

    // Get current date in UTC
    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Determine if it's a weekend (Saturday = 6 or Sunday = 0)
    const isWeekend = currentDay === 0 || currentDay === 6;

    // Set rate limit based on weekday/weekend
    const rateLimit = isWeekend ? RATE_LIMIT.WEEKEND : RATE_LIMIT.WEEKDAY;

    // Create a key that includes the user ID and the current UTC date
    // This will automatically reset at midnight UTC
    const dateStr = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const rateLimitKey = `${RATE_LIMIT.KEY_PREFIX}:${userId}:${dateStr}`;

    // Increment the counter for this user and date
    const requestCount = await redisClient.incr(rateLimitKey);

    // Set expiry for the key if it's new
    if (requestCount === 1) {
      // Calculate seconds until midnight UTC
      const midnight = new Date(now);
      midnight.setUTCHours(24, 0, 0, 0);
      const secondsUntilMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);

      // Set the key to expire at midnight UTC
      await redisClient.expire(rateLimitKey, secondsUntilMidnight);
    }

    // Check if the user has exceeded their rate limit
    if (requestCount > rateLimit) {
      // Add rate limit headers
      res.set('X-RateLimit-Limit', rateLimit.toString());
      res.set('X-RateLimit-Remaining', '0');

      return next(
        new TooManyRequestsError(
          `Rate limit exceeded. Maximum of ${rateLimit} requests per day allowed.`,
          'RATE_LIMIT_EXCEEDED',
          {
            limit: rateLimit,
            remaining: 0,
            reset: Math.floor(await redisClient.ttl(rateLimitKey)),
          }
        )
      );
    }

    // Add rate limit headers to the response
    res.set('X-RateLimit-Limit', rateLimit.toString());
    res.set('X-RateLimit-Remaining', (rateLimit - requestCount).toString());
    res.set('X-RateLimit-Reset', Math.floor(await redisClient.ttl(rateLimitKey)).toString());

    // Continue with the request
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If there's an error with rate limiting, we'll still allow the request
    // but log the error
    next();
  }
};

export const createRateLimitKey = (userId: string): string => {
  // Get current date in UTC and format as YYYY-MM-DD
  const dateStr = new Date().toISOString().split('T')[0];

  // Create the key using the same format as the middleware
  return `${RATE_LIMIT.KEY_PREFIX}:${userId}:${dateStr}`;
};

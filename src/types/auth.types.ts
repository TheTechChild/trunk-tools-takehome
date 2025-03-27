/**
 * Authentication Type Definitions
 */

/**
 * User Information
 */
export interface UserInfo {
  userId: string;
  email: string;
}

/**
 * Authentication Payload
 */
export interface AuthPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Token Response
 */
export interface TokenResponse {
  token: string;
  expiresIn: number;
}

/**
 * Rate Limit Info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
} 
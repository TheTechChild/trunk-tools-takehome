# Authentication

This document outlines the authentication system implemented in the Currency Conversion Service.

## Overview

The service uses Bearer token authentication to secure API endpoints. All authenticated endpoints require a valid JWT token in the Authorization header.

## Authentication Flow

1. **Token Format**
   ```
   Authorization: Bearer <jwt_token>
   ```

2. **Token Structure**
   ```json
   {
     "sub": "user123",
     "iat": 1683072000,
     "exp": 1683158400,
     "iss": "currency-service"
   }
   ```

3. **Required Claims**
   - `sub`: User ID (required)
   - `iat`: Issued at timestamp (required)
   - `exp`: Expiration timestamp (required)
   - `iss`: Issuer (required)

## Implementation Details

### Token Validation

1. **Validation Steps**
   ```typescript
   // Example validation flow
   const token = req.headers.authorization?.split(' ')[1];
   if (!token) {
     throw new UnauthorizedError('No token provided');
   }

   try {
     const decoded = jwt.verify(token, JWT_SECRET);
     if (!decoded.sub) {
       throw new UnauthorizedError('Invalid token: missing user ID');
     }
     req.user = { userId: decoded.sub };
     next();
   } catch (error) {
     throw new UnauthorizedError('Invalid token');
   }
   ```

2. **Error Handling**
   - Missing token: `401 Unauthorized`
   - Invalid token: `401 Unauthorized`
   - Expired token: `401 Unauthorized`
   - Missing claims: `401 Unauthorized`

### User ID Requirements

1. **Format**
   - Must be a non-empty string
   - Maximum length: 64 characters
   - Alphanumeric characters only

2. **Validation**
   ```typescript
   const userIdRegex = /^[a-zA-Z0-9]{1,64}$/;
   if (!userIdRegex.test(userId)) {
     throw new BadRequestError('Invalid user ID format');
   }
   ```

## Error Responses

### Missing Token
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided",
    "details": {
      "required": "Bearer token in Authorization header"
    }
  }
}
```

### Invalid Token
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token",
    "details": {
      "reason": "Token validation failed"
    }
  }
}
```

### Expired Token
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token has expired",
    "details": {
      "expired_at": "2023-05-01T00:00:00.000Z"
    }
  }
}
```

## Security Considerations

1. **Token Storage**
   - Tokens are not stored server-side
   - Client responsible for secure storage
   - HTTPS required for all requests

2. **Token Lifetime**
   - Default expiration: 24 hours
   - Configurable via environment variables
   - Refresh token mechanism available

3. **Rate Limiting**
   - Authentication attempts are rate limited
   - Failed attempts tracked separately
   - Account lockout after multiple failures

## Configuration

Authentication can be configured through environment variables:

- `JWT_SECRET`: Secret key for token signing
- `JWT_EXPIRATION`: Token expiration time in seconds
- `AUTH_RATE_LIMIT`: Maximum authentication attempts per minute

## Best Practices

1. **Client Implementation**
   - Store tokens securely
   - Implement token refresh
   - Handle authentication errors

2. **Service Implementation**
   - Validate tokens early
   - Use secure session management
   - Implement proper error handling

3. **Security Measures**
   - Use HTTPS only
   - Implement CORS properly
   - Regular security audits

## Testing

1. **Unit Tests**
   - Test token validation
   - Test error handling
   - Test user ID validation

2. **Integration Tests**
   - Test authentication flow
   - Test protected endpoints
   - Test error scenarios

3. **Security Tests**
   - Test token tampering
   - Test expired tokens
   - Test invalid claims

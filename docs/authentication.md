# Authentication

This document outlines the authentication requirements and process for the Currency Conversion Service.

## Bearer Token Authentication

The Currency Conversion Service uses Bearer token authentication for securing API endpoints. All API requests must include a valid Bearer token to authenticate the user.

### Token Format

The Bearer token used in this service is a UUID that corresponds to a user's ID in the database. It's a simple implementation for the purposes of this service.

### Authentication Header

Include the Bearer token in the HTTP Authorization header:

```
Authorization: Bearer <token>
```

Example:

```
Authorization: Bearer dab458d6-8352-42e6-88a1-88acc76b4e43
```

### Authentication Process

1. When a request is received, the authentication middleware extracts the token from the Authorization header.
2. The middleware verifies the token exists and checks if a user with that ID exists in the database.
3. If valid, the user's identity is attached to the request object for use by downstream middleware and controllers.
4. If invalid, a 401 Unauthorized response is returned.

### Error Responses

Authentication failures result in the following error responses:

- **Missing Token**:

  ```json
  {
    "success": false,
    "error": {
      "code": "MISSING_TOKEN",
      "message": "Authentication required"
    }
  }
  ```

- **Invalid Token Format**:

  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_TOKEN_FORMAT",
      "message": "Invalid token format"
    }
  }
  ```

- **Invalid Token**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_TOKEN",
      "message": "Invalid token"
    }
  }
  ```

## Testing Authentication

For testing purposes, you can create a user in the database and use their ID as a Bearer token.

Example:

```javascript
// Create a user
const user = await userRepository.create({
  email: 'test@example.com',
});

// Use the user ID as a Bearer token
const token = user._id;
```

## Security Considerations

In a production environment, this authentication method would be replaced with a more secure implementation:

1. Instead of using UUIDs directly, a JWT (JSON Web Token) would be issued and signed with a secret key.
2. Tokens would include claims like expiration time, issuer, and user roles.
3. HTTPS would be enforced for all API communication.
4. Additional security measures like refresh tokens, token rotation, and device tracking would be implemented.

## Integration with Rate Limiting

The authentication system is tightly integrated with the rate limiting system:

- Rate limits are applied per authenticated user
- Requests without authentication are rejected before rate limiting is applied
- Each user's rate limit usage is tracked individually

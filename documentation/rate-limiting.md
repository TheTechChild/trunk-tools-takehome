# Rate Limiting

This document outlines the rate limiting system implemented in the Currency Conversion Service.

## Overview

The rate limiting system is designed to prevent abuse of the service and ensure fair usage among all users. It applies different limits based on the day of the week and tracks each user's request count separately.

## Rate Limits

Rate limits are applied per user, per day, and vary based on the day of the week:

- **Weekdays (Monday-Friday)**: 100 requests per day
- **Weekends (Saturday-Sunday)**: 200 requests per day

These limits can be configured through environment variables:

- `RATE_LIMIT_WEEKDAY`: Number of requests allowed on weekdays
- `RATE_LIMIT_WEEKEND`: Number of requests allowed on weekends

## Reset Schedule

Rate limits reset at midnight UTC every day. This means that:

1. Each user's request count is tracked separately for each calendar day
2. At midnight UTC, all counters are reset automatically
3. The day of the week is determined in UTC time zone

## Implementation Details

The rate limiting system uses Redis to track request counts:

1. Each user-day combination has a unique key in Redis: `rate_limit:{user_id}:{YYYY-MM-DD}`
2. When a request is made, the counter for that key is incremented
3. If the counter exceeds the limit, the request is rejected
4. When a new key is created (first request of the day), an expiry time is set to ensure it's automatically removed after the day ends

## Rate Limit Headers

The following headers are included in API responses to help clients track their rate limit usage:

- `X-RateLimit-Limit`: The rate limit ceiling for the current user
- `X-RateLimit-Remaining`: The number of requests left for the current user until the limit is reached
- `X-RateLimit-Reset`: Unix timestamp when the rate limit will reset

Example:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1683072000
```

## Rate Limit Errors

When a user exceeds their rate limit, they will receive a `429 Too Many Requests` response with details about the rate limit:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Maximum of 100 requests per day allowed.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": 3600
    }
  }
}
```

The `reset` value in the response indicates the number of seconds until the rate limit will reset.

## Authentication Requirement

Rate limiting requires authentication to function properly:

1. All rate-limited endpoints require authentication
2. The rate limit is applied based on the authenticated user's ID
3. If a request is not authenticated, it will be rejected before rate limiting is applied

## Client Recommendations

To work effectively with the rate limiting system, clients should:

1. Monitor the rate limit headers to track remaining requests
2. Implement exponential backoff when receiving rate limit errors
3. Optimize request patterns to avoid hitting rate limits unnecessarily
4. Consider different usage patterns for weekdays vs weekends

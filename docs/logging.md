# Logging Documentation

## Overview

The Currency Conversion Service implements a comprehensive logging strategy for tracking API usage, debugging, and auditing purposes. This document describes the logging format, storage, and retention policies.

## Request Logging

### Middleware Implementation

API request logging is implemented via the `requestLogger` middleware in `src/middleware/requestLogger.ts`. This middleware:

1. Intercepts currency conversion API requests
2. Extracts relevant information (user, currencies, amounts)
3. Logs the data to MongoDB after the response is sent
4. Uses non-blocking asynchronous operations to avoid impacting response time

### Log Format

Request logs adhere to the `IRequestLog` interface and are stored in MongoDB with the following structure:

```typescript
interface IRequestLog {
  _id?: string;              // MongoDB-generated ID
  user_id: string;           // User ID from authentication
  from_currency: string;     // Source currency code (e.g., "BTC")
  to_currency: string;       // Target currency code (e.g., "USD")
  amount: number;            // Amount to convert
  converted_amount: number;  // Resulting converted amount
  exchange_rate: number;     // Exchange rate used for conversion
  timestamp: Date;           // When the conversion was performed
}
```

### Sensitive Information Handling

The request logging system handles sensitive information as follows:

- User authentication tokens are never logged
- Only the user ID (not personal information) is stored in logs
- No IP addresses or device information is captured
- Request headers are not stored to avoid capturing sensitive data

## Application Logging

In addition to request logging, the application uses console-based logging for operational events:

- **Info level**: Application startup, connections to services
- **Error level**: Failed connections, API errors, unexpected exceptions
- **Debug level**: Only in development mode, for detailed troubleshooting

## Data Retention Policy

### MongoDB Request Logs

Request logs stored in MongoDB follow these retention guidelines:

- **Retention Period**: Logs are kept for 90 days by default
- **Archiving**: Logs older than 90 days should be archived to cold storage
- **Purging**: Logs older than 1 year should be permanently deleted

These policies should be implemented via scheduled MongoDB maintenance tasks (not included in Phase 2, to be added in future phases).

### Application Logs

Console logs follow these retention guidelines when deployed:

- **Development**: No retention, logs are ephemeral
- **Production**: Captured by container logging system
- **Retention**: 30 days in production environment

## Performance Considerations

The logging system is designed with performance in mind:

- **Non-blocking**: Request logging uses asynchronous operations
- **Error Handling**: Logging failures don't affect API responses
- **Batch Operations**: Future optimization will include batch inserts for high-volume scenarios
- **Indexing**: MongoDB collection is indexed for efficient querying

## Monitoring and Usage

Request logs can be queried using the `RequestLogRepository`:

- Query by user ID to analyze user activity
- Query by currency pair to track popular conversions
- Query by date range for time-based analysis
- Use count operations for aggregated metrics

Example:

```typescript
// Count conversions by user in the last 24 hours
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
const today = new Date();
const count = await requestLogRepository.countByUserIdAndDateRange(
  userId,
  yesterday,
  today
);
``` 
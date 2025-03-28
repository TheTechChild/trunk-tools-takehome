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
  _id?: string; // MongoDB-generated ID
  user_id: string; // User ID from authentication
  from_currency: string; // Source currency code (e.g., "BTC")
  to_currency: string; // Target currency code (e.g., "USD")
  amount: number; // Amount to convert
  converted_amount: number; // Resulting converted amount
  exchange_rate: number; // Exchange rate used for conversion
  timestamp: Date; // When the conversion was performed
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
const count = await requestLogRepository.countByUserIdAndDateRange(userId, yesterday, today);
```

## Log Types

### Request Logs

Request logs track all currency conversion requests with the following information:

```typescript
interface IRequestLog {
  user_id: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  converted_amount: number;
  exchange_rate: number;
  timestamp: Date;
}
```

### Error Logs

Error logs capture system errors and exceptions:

```typescript
interface IErrorLog {
  timestamp: Date;
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  stack?: string;
  context?: Record<string, any>;
}
```

### Access Logs

Access logs track API access patterns:

```typescript
interface IAccessLog {
  timestamp: Date;
  method: string;
  path: string;
  status_code: number;
  response_time: number;
  user_id?: string;
  ip_address: string;
}
```

## Implementation Details

### Request Logging

1. **Non-Blocking Logging**
   ```typescript
   // Example non-blocking logging
   const logData = {
     user_id: userId,
     from_currency: fromCurrency,
     to_currency: toCurrency,
     amount: amount,
     converted_amount: convertedAmount,
     exchange_rate: exchangeRate,
     timestamp: new Date()
   };

   // Log asynchronously without awaiting
   requestLogRepository.create(logData)
     .catch(error => console.error('Failed to log request:', error));
   ```

2. **Performance Considerations**
   - Asynchronous logging
   - Batch processing for high volume
   - Indexed fields for fast queries

### Error Logging

1. **Error Capture**
   ```typescript
   // Example error logging
   try {
     // Operation that might fail
   } catch (error) {
     await errorLogRepository.create({
       timestamp: new Date(),
       level: 'ERROR',
       message: error.message,
       stack: error.stack,
       context: {
         operation: 'currency_conversion',
         user_id: userId
       }
     });
     throw error;
   }
   ```

2. **Error Classification**
   - Validation errors
   - Authentication errors
   - Rate limit errors
   - External API errors

## Log Storage

### MongoDB Collections

1. **request_logs**
   - Indexes:
     - `user_id`
     - `timestamp`
     - `{user_id, timestamp}`

2. **error_logs**
   - Indexes:
     - `timestamp`
     - `level`
     - `{level, timestamp}`

3. **access_logs**
   - Indexes:
     - `timestamp`
     - `user_id`
     - `{method, path}`

## Log Analysis

### Common Queries

1. **User Activity**
   ```javascript
   db.request_logs.aggregate([
     { $match: { user_id: "user123" } },
     { $group: {
       _id: null,
       total_requests: { $sum: 1 },
       total_amount: { $sum: "$amount" }
     }}
   ]);
   ```

2. **Error Analysis**
   ```javascript
   db.error_logs.aggregate([
     { $match: { level: "ERROR" } },
     { $group: {
       _id: "$message",
       count: { $sum: 1 }
     }},
     { $sort: { count: -1 } }
   ]);
   ```

3. **Performance Metrics**
   ```javascript
   db.access_logs.aggregate([
     { $group: {
       _id: "$path",
       avg_response_time: { $avg: "$response_time" },
       max_response_time: { $max: "$response_time" }
     }}
   ]);
   ```

## Log Retention

1. **Retention Policy**
   - Request logs: 30 days
   - Error logs: 90 days
   - Access logs: 30 days

2. **Cleanup Process**
   - Automated daily cleanup
   - Configurable retention periods
   - Backup before deletion

## Monitoring

1. **Log Volume**
   - Track log growth
   - Monitor storage usage
   - Alert on anomalies

2. **Error Rates**
   - Monitor error frequency
   - Track error types
   - Alert on spikes

## Best Practices

1. **Logging Guidelines**
   - Include context
   - Use appropriate levels
   - Avoid sensitive data

2. **Performance**
   - Use async logging
   - Implement batching
   - Monitor impact

3. **Security**
   - Sanitize sensitive data
   - Implement access controls
   - Regular audits

## Configuration

Logging can be configured through environment variables:

- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARN, ERROR)
- `LOG_RETENTION_DAYS`: Number of days to keep logs
- `LOG_BATCH_SIZE`: Size of log batches
- `LOG_ENABLED`: Enable/disable logging

## Testing

1. **Unit Tests**
   - Test log creation
   - Test error handling
   - Test retention

2. **Integration Tests**
   - Test MongoDB interaction
   - Test log queries
   - Test cleanup

3. **Performance Tests**
   - Test under load
   - Test storage impact
   - Test query performance

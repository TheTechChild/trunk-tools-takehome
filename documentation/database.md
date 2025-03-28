# Database Documentation

This document outlines the database structure and implementation for the Currency Conversion Service.

## Overview

The service uses MongoDB as its primary database, with Redis for caching. This document focuses on the MongoDB implementation.

## Database Schema

### Request Log Collection

The `request_logs` collection stores information about currency conversion requests.

#### Schema Definition

```typescript
interface IRequestLog {
  _id?: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  converted_amount: number;
  exchange_rate: number;
  timestamp: Date;
}
```

#### Indexes

- `user_id`: Indexed for faster user-specific queries
- `timestamp`: Indexed for time-based queries
- Compound index on `{user_id, timestamp}` for efficient user history queries

#### Field Descriptions

| Field            | Type   | Required | Description                   |
| ---------------- | ------ | -------- | ----------------------------- |
| user_id          | string | Yes      | ID of the user making request |
| from_currency    | string | Yes      | Source currency code          |
| to_currency      | string | Yes      | Target currency code          |
| amount           | number | Yes      | Original amount to convert    |
| converted_amount | number | Yes      | Result of conversion          |
| exchange_rate    | number | Yes      | Rate used for conversion      |
| timestamp        | Date   | Yes      | When the request was made     |

## Request Logging System

### Overview

The request logging system is designed to track all currency conversion requests for monitoring, analytics, and debugging purposes.

### Implementation Details

1. **Non-Blocking Logging**

   - Logging is performed asynchronously
   - Does not impact API response time
   - Failed logs are caught and logged to console

2. **Logging Process**

   ```typescript
   // Example logging flow
   try {
     await requestLogRepository.create({
       user_id: userId,
       from_currency: fromCurrency.toUpperCase(),
       to_currency: toCurrency.toUpperCase(),
       amount: amount,
       converted_amount: convertedAmount,
       exchange_rate: exchangeRate,
       timestamp: new Date(),
     });
   } catch (error) {
     console.error('Failed to log conversion request:', error);
   }
   ```

3. **Performance Considerations**
   - Indexes optimize query performance
   - Bulk operations for high-volume logging
   - Automatic cleanup of old logs (configurable)

### Query Examples

1. **Get User's Conversion History**

   ```javascript
   db.request_logs.find({ user_id: 'user123' }).sort({ timestamp: -1 }).limit(10);
   ```

2. **Get Popular Currency Pairs**

   ```javascript
   db.request_logs.aggregate([
     {
       $group: {
         _id: { from: '$from_currency', to: '$to_currency' },
         count: { $sum: 1 },
       },
     },
     { $sort: { count: -1 } },
     { $limit: 10 },
   ]);
   ```

3. **Get Conversion Statistics**
   ```javascript
   db.request_logs.aggregate([
     {
       $group: {
         _id: null,
         total_requests: { $sum: 1 },
         avg_amount: { $avg: '$amount' },
         avg_rate: { $avg: '$exchange_rate' },
       },
     },
   ]);
   ```

## Data Retention

1. **Log Retention Policy**

   - Default retention: 30 days
   - Configurable via environment variables
   - Automatic cleanup of expired logs

2. **Backup Strategy**
   - Daily backups
   - Point-in-time recovery available
   - Backup verification process

## Monitoring and Maintenance

1. **Health Checks**

   - Database connection monitoring
   - Index usage statistics
   - Query performance metrics

2. **Maintenance Tasks**
   - Regular index optimization
   - Data cleanup
   - Performance tuning

## Error Handling

1. **Connection Errors**

   - Automatic retry mechanism
   - Fallback to cached data
   - Alert system for persistent issues

2. **Data Validation**
   - Schema validation
   - Type checking
   - Required field enforcement

## MongoDB Configuration

The Currency Conversion Service uses MongoDB for storing user data and request logs. The connection is configured in `src/config/database.ts`.

### Connection Settings

- **Connection String**: Set via `MONGODB_URI` environment variable
- **Default**: `mongodb://localhost:27017/currency-service`
- **Connection Pool**: 10 connections maximum
- **Socket Timeout**: 45 seconds
- **Server Selection Timeout**: 5 seconds

## Schemas

### User Schema

The User schema is defined in `src/models/user.model.ts`.

| Field      | Type          | Description                  |
| ---------- | ------------- | ---------------------------- |
| \_id       | String (UUID) | Primary key, auto-generated  |
| email      | String        | User's email address, unique |
| created_at | Date          | Timestamp of user creation   |

Indexes:

- `email`: Unique index for faster lookups by email

### Request Log Schema

The Request Log schema is defined in `src/models/requestLog.model.ts`.

| Field            | Type   | Description                       |
| ---------------- | ------ | --------------------------------- |
| user_id          | String | Reference to User \_id            |
| from_currency    | String | Source currency code              |
| to_currency      | String | Target currency code              |
| amount           | Number | Amount to convert                 |
| converted_amount | Number | Resulting converted amount        |
| exchange_rate    | Number | Exchange rate used                |
| timestamp        | Date   | When the conversion was performed |

Indexes:

- `user_id`: For faster lookups by user
- `timestamp`: For date-based queries
- `{ from_currency, to_currency }`: For currency pair lookups

## Data Access Layer

The repository pattern is used to abstract database operations. Repositories are located in `src/repositories/`.

- `UserRepository`: Operations related to user management
- `RequestLogRepository`: Operations related to request logging and querying

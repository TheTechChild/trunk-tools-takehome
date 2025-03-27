# Database Documentation

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

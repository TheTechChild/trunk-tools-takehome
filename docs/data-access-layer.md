# Data Access Layer API Documentation

## Overview

The Currency Conversion Service uses the repository pattern to abstract database operations. This pattern provides a clean separation between the data access logic and business logic, making the system more maintainable and testable.

## Repository Interfaces

### UserRepositoryInterface

The `UserRepositoryInterface` defines the contract for user-related operations:

```typescript
export interface UserRepositoryInterface {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Omit<IUser, '_id' | 'created_at'>): Promise<IUser>;
  update(id: string, userData: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}
```

### RequestLogRepositoryInterface

The `RequestLogRepositoryInterface` defines the contract for request log operations:

```typescript
export interface RequestLogRepositoryInterface {
  create(logData: Omit<IRequestLog, '_id'>): Promise<IRequestLog>;
  findByUserId(userId: string, limit?: number, skip?: number): Promise<IRequestLog[]>;
  findByCurrencyPair(
    fromCurrency: string,
    toCurrency: string,
    limit?: number,
    skip?: number
  ): Promise<IRequestLog[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
    skip?: number
  ): Promise<IRequestLog[]>;
  countByUserId(userId: string): Promise<number>;
  countByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<number>;
}
```

## Repository Implementations

### UserRepository

The `UserRepository` implements the `UserRepositoryInterface` using Mongoose to interact with MongoDB:

- **findById(id: string)**: Retrieves a user by their ID
- **findByEmail(email: string)**: Retrieves a user by their email address
- **create(userData)**: Creates a new user in the database
- **update(id, userData)**: Updates an existing user's information
- **delete(id)**: Removes a user from the database

### RequestLogRepository

The `RequestLogRepository` implements the `RequestLogRepositoryInterface` using Mongoose:

- **create(logData)**: Creates a new request log entry
- **findByUserId(userId, limit, skip)**: Retrieves logs for a specific user with pagination
- **findByCurrencyPair(fromCurrency, toCurrency, limit, skip)**: Retrieves logs for a specific currency pair
- **findByDateRange(startDate, endDate, limit, skip)**: Retrieves logs within a date range
- **countByUserId(userId)**: Counts logs for a specific user
- **countByUserIdAndDateRange(userId, startDate, endDate)**: Counts logs for a user within a date range

## Usage Examples

### Creating a User

```typescript
import { userRepository } from '../repositories';

// Create a new user
try {
  const newUser = await userRepository.create({
    email: 'user@example.com',
  });
  console.log('User created:', newUser);
} catch (error) {
  console.error('Error creating user:', error);
}
```

### Logging a Currency Conversion Request

```typescript
import { requestLogRepository } from '../repositories';

// Log a currency conversion request
try {
  const log = await requestLogRepository.create({
    user_id: 'user-123',
    from_currency: 'BTC',
    to_currency: 'USD',
    amount: 1.5,
    converted_amount: 67890.12,
    exchange_rate: 45260.08,
    timestamp: new Date(),
  });
  console.log('Request logged:', log);
} catch (error) {
  console.error('Error logging request:', error);
}
```

### Finding User's Conversion History

```typescript
import { requestLogRepository } from '../repositories';

// Get a user's conversion history (most recent 20)
try {
  const logs = await requestLogRepository.findByUserId('user-123', 20, 0);
  console.log('Conversion history:', logs);
} catch (error) {
  console.error('Error getting conversion history:', error);
}
```

## Error Handling

All repository methods include error handling to prevent exceptions from propagating to the application logic:

- Methods that retrieve data return `null` or an empty array on error
- Methods that create data re-throw errors to allow specific error handling
- Methods that update or delete data return `null` or `false` on error

This approach ensures the application can gracefully handle database failures without crashing.

## Type Safety

The data access layer leverages TypeScript interfaces to ensure type safety:

- `IUser` and `IRequestLog` interfaces define the structure of database entities
- Repository methods use these interfaces to ensure type consistency
- TypeScript's utility types (`Omit`, `Partial`) provide additional type safety for operations

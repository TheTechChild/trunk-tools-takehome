# Input Validation

This document outlines the input validation rules and implementation for the Currency Conversion Service.

## Overview

The Currency Conversion Service implements comprehensive input validation to ensure that all API requests contain valid and properly formatted data. This helps prevent errors, improves security, and provides clear feedback to API users.

## Validation Framework

The service uses a custom validation framework that:

1. Validates request parameters against defined schemas
2. Returns consistent error responses for invalid inputs
3. Supports validation of query parameters, request body, and URL parameters
4. Provides detailed error messages to help API users correct their requests

## Validation Rules by Endpoint

### Currency Conversion (`/api/v1/currency/convert`)

| Parameter | Rule                                    | Required | Error Message                    |
| --------- | --------------------------------------- | -------- | -------------------------------- |
| from      | Must be a supported currency (BTC, USD) | Yes      | Invalid source currency          |
| to        | Must be a supported currency (BTC, USD) | Yes      | Invalid target currency          |
| amount    | Must be a positive number               | Yes      | Amount must be a positive number |

Additional validation:

- Source and target currencies must be different
- Amount must not exceed the maximum allowed (1000 BTC)

### Exchange Rates (`/api/v1/currency/rates`)

| Parameter | Rule                                    | Required | Error Message         |
| --------- | --------------------------------------- | -------- | --------------------- |
| base      | Must be a supported currency (BTC, USD) | Yes      | Invalid base currency |

## Validation Error Response

When validation fails, the API returns a `400 Bad Request` response with detailed information about the validation errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error",
    "details": {
      "errors": {
        "from": "Invalid source currency",
        "amount": "Amount must be a positive number"
      },
      "requiredFields": ["to"]
    }
  }
}
```

The error response includes:

- The specific validation error for each invalid field
- A list of required fields that are missing (if any)

## Validator Functions

The validation system includes a set of reusable validator functions:

### String Validators

- `isString`: Checks if the value is a string
- `isNonEmptyString`: Checks if the value is a non-empty string
- `isAlphanumeric`: Checks if the value contains only alphanumeric characters
- `isCurrency`: Checks if the value is a supported currency code

### Number Validators

- `isNumber`: Checks if the value can be parsed as a number
- `isPositiveNumber`: Checks if the value is a positive number
- `isInteger`: Checks if the value is an integer
- `isPositiveInteger`: Checks if the value is a positive integer
- `inRange(min, max)`: Creates a validator that checks if a number is within a specified range

### Other Validators

- `isEmail`: Checks if the value is a valid email address

## Custom Validation

For more complex validation requirements, the service supports custom validation rules within controller functions. These include:

1. Cross-field validation (e.g., comparing from/to currencies)
2. Business rule validation (e.g., maximum amount checks)
3. Context-specific validation based on the current user or other runtime factors

## Configuration

The supported currencies are defined in the `SUPPORTED_CURRENCIES` constant, which can be modified to support additional currencies in the future.

## Security Considerations

The validation system helps prevent several security issues:

1. Input injection attacks by validating and sanitizing inputs
2. Resource exhaustion by enforcing maximum values
3. Data corruption by ensuring inputs meet business requirements

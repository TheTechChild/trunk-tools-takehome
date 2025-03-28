# API Endpoints

This document outlines the available API endpoints for the Currency Conversion Service.

## Base URLs

- API endpoints: `/api/v1/currency`
- Metrics endpoints: `/api/v1/metrics`
- Health check: `/health`

## Authentication

All endpoints require Bearer token authentication. See the [authentication.md](authentication.md) documentation for details.

## Rate Limiting

API requests are subject to rate limiting. See the [rate-limiting.md](rate-limiting.md) documentation for details.

## Endpoints

### Convert Currency

Converts an amount from one currency to another.

- **URL**: `/api/v1/currency/convert`
- **Method**: `GET`
- **Authentication**: Required
- **Rate Limited**: Yes

#### Query Parameters

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| from      | string | Yes      | Source currency (e.g., BTC)  |
| to        | string | Yes      | Target currency (e.g., USD)  |
| amount    | number | Yes      | Amount to convert (positive) |

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "from": "BTC",
    "to": "USD",
    "amount": 1.0,
    "rate": 65432.1,
    "converted_amount": 65432.1,
    "timestamp": "2023-04-01T12:34:56.789Z"
  }
}
```

#### Error Responses

- **Code**: `400 Bad Request`
- **Conditions**: Invalid currency, negative amount, or missing required parameters
- **Content Example**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error",
    "details": {
      "errors": {
        "from": "Invalid source currency"
      }
    }
  }
}
```

- **Code**: `401 Unauthorized`
- **Conditions**: Missing or invalid authentication token
- **Content Example**:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

- **Code**: `429 Too Many Requests`
- **Conditions**: Rate limit exceeded
- **Content Example**:

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

### Get Exchange Rates

Retrieves the current exchange rates for a specified base currency.

- **URL**: `/api/v1/currency/rates`
- **Method**: `GET`
- **Authentication**: Required
- **Rate Limited**: Yes

#### Query Parameters

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| base      | string | Yes      | Base currency (e.g., BTC) |

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "base": "BTC",
    "timestamp": "2023-04-01T12:34:56.789Z",
    "rates": {
      "USD": 65432.1
    }
  }
}
```

#### Error Responses

Same error responses as the Convert Currency endpoint.

### Get Supported Currencies

Retrieves the list of supported currencies.

- **URL**: `/api/v1/currency/supported`
- **Method**: `GET`
- **Authentication**: Required
- **Rate Limited**: Yes

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": [
    { "code": "BTC", "name": "Bitcoin" },
    { "code": "USD", "name": "US Dollar" }
  ]
}
```

#### Error Responses

Same error responses as the Convert Currency endpoint.

### Get Metrics

Retrieves application metrics and statistics.

- **URL**: `/api/v1/metrics`
- **Method**: `GET`
- **Authentication**: Required
- **Rate Limited**: Yes

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "total_requests": 1000,
    "successful_requests": 950,
    "failed_requests": 50,
    "average_response_time": 150,
    "popular_conversions": [
      {
        "from": "BTC",
        "to": "USD",
        "count": 500
      }
    ]
  }
}
```

#### Error Responses

Same error responses as the Convert Currency endpoint.

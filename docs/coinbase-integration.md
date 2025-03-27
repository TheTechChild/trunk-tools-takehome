# Coinbase API Integration

This document outlines the integration with the Coinbase API for fetching real-time exchange rates.

## Overview

The Currency Conversion Service integrates with the Coinbase API to fetch current exchange rates for currency conversion. This integration provides accurate, real-time rates for converting between BTC and USD.

## Coinbase API Endpoints

The service utilizes the following Coinbase API endpoint:

- **Exchange Rates**: `GET https://api.coinbase.com/v2/exchange-rates`
  - Query Parameters: `currency={base_currency}`
  - Returns exchange rates for the specified base currency against multiple target currencies

## Configuration

The Coinbase API integration is configured through environment variables:

- `COINBASE_API_URL`: Base URL for Coinbase API (default: `https://api.coinbase.com/v2`)

## Implementation Details

### Exchange Rate Fetching

1. The service fetches exchange rates from Coinbase when needed for currency conversion
2. Rates are requested from the `/exchange-rates` endpoint with the source currency as a parameter
3. The response includes exchange rates for multiple currencies, from which we extract the rate for the target currency

Example API response from Coinbase:

```json
{
  "data": {
    "currency": "BTC",
    "rates": {
      "USD": "65432.10",
      "EUR": "60123.45",
      "GBP": "51234.56",
      "...": "..."
    }
  }
}
```

### Redis Caching

To minimize API calls and improve performance, exchange rates are cached in Redis:

1. When an exchange rate is fetched from Coinbase, it's stored in Redis with a 10-minute TTL
2. Subsequent requests for the same currency pair within the TTL period use the cached rate
3. The cache key format is `exchange_rate:{FROM_CURRENCY}-{TO_CURRENCY}`
4. Each cached entry includes both the rate and the timestamp when it was fetched

The cache TTL can be configured via the `CACHE.EXCHANGE_RATE_TTL` constant in the code (default: 600 seconds).

### Error Handling

The integration includes robust error handling:

1. Network errors are caught and appropriate error responses are returned
2. Invalid or unsuccessful API responses are properly handled
3. If the API is unavailable, the system will use cached rates if available
4. Clear error messages are provided when the API integration fails

## Rate Limiting Considerations

The Coinbase API has rate limits, though they are not explicitly documented. The service has been designed with these considerations in mind:

1. Caching reduces the number of API calls made
2. Error handling includes handling rate limit responses from Coinbase
3. In high-traffic scenarios, the caching system ensures we don't exceed reasonable rate limits

## Security Considerations

1. All communication with the Coinbase API is done via HTTPS
2. In a production environment, API keys would be used for authentication
3. No sensitive data is exchanged in the current implementation

## Testing

The Coinbase API integration can be tested in several ways:

1. **Unit tests**: Testing the service with mocked API responses
2. **Integration tests**: Testing against the actual Coinbase API in a controlled environment
3. **Sandbox testing**: If using authenticated APIs in the future, Coinbase provides a sandbox environment

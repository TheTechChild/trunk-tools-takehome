# **PRD: Currency Conversion Service Testing Requirements **

## **TL;DR**

A **Dockerized** Node.js & Express currency conversion API that integrates **Coinbase for exchange rates**, **MongoDB for logging & user storage**, and **Redis for caching & rate limiting**. The API ensures **real-time accuracy**, **enforces fair usage**, and includes **comprehensive testing** to verify functionality.

## **Testing Requirements**

All functionality must be **covered by automated tests** using **Bun test runner** for API testing and **Redis/MongoDB mocks** to simulate real-world conditions.

### **1. Unit Tests**

✅ **Exchange Rate Calculation**

- Converts **BTC → USD** correctly based on an exchange rate.
- Handles **decimal precision issues**.
- Returns an error for **unsupported currency pairs**.

✅ **Redis Caching Logic**

- Retrieves exchange rates from Redis **if cache is fresh (<10 minutes old)**.
- Fetches from **Coinbase API if cache is stale**, then updates Redis.

✅ **Rate Limiting Enforcement**

- Allows **100 requests per weekday (Monday-Friday)** per user.
- Allows **200 requests per weekend day (Saturday-Sunday)** per user.
- Returns **HTTP 429** when limits are exceeded.
- Rate limits **reset daily at midnight UTC**.

✅ **MongoDB Request Logging**

- Logs every **successful** API request.
- Stores **correct metadata** (user, currency pair, timestamp, response).
- Ensures **log retention policies work** (e.g., deleting logs after 30 days).

✅ **Authentication Handling**

- Accepts requests with **valid Bearer tokens**.
- Returns **401 Unauthorized** for missing/invalid tokens.

### **2. Integration Tests**

✅ **Full Currency Conversion Flow**

- Calls API with `from=BTC&to=USD&amount=100`, verifies response.
- Ensures **MongoDB logs the request**.
- Ensures **Redis caches the exchange rate**.

✅ **API Resilience & Failure Handling**

- **Coinbase API Down:** Returns **503 Service Unavailable**.
- **Redis Down:** Bypasses cache, fetches directly from Coinbase.
- **MongoDB Down:** API still functions but skips request logging.

✅ **Rate Limiting Behavior Over Time**

- Simulate **multiple requests** in one day.
- Test **next-day reset at midnight UTC**.

✅ **Docker Environment Testing**

- Ensure API functions **inside Docker containers**.
- Verify **MongoDB & Redis connectivity in Docker**.

### **3. Load & Performance Tests**

✅ **High-Volume API Traffic**

- Simulate **10,000 concurrent users** hitting the API.
- Measure **average response time** (goal: **<500ms** for 95% of requests).
- Ensure Redis **reduces API calls** to Coinbase under load.

✅ **Edge Cases & Stress Tests**

- Verify **graceful degradation** (e.g., Redis crashes but API still works).
- Test **large payloads** (e.g., `amount=999999999.99`).

## **Implementation Strategy**

- **Bun test runner** for API testing.
- **MongoDB in-memory server** for unit tests.
- **Redis-mock** to simulate caching.
- **Artillery** for load testing.

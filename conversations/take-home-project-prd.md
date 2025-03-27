# **PRD: Currency Conversion Service (Updated)**  

## **TL;DR**
Develop a **Dockerized** Node.js & Express service for real-time **currency conversion** using the **Coinbase API**. The service will use **MongoDB** for storing users and request logs, **Redis for caching exchange rates**, and **rate limiting** to control API usage.

## **Additional Technical Considerations**
### **1. MongoDB Schema Design**
We need **two key collections**:  

#### **Users Collection**
Represents authenticated users making API requests.  
```json
{
  "_id": "dab458d6-8352-42e6-88a1-88acc76b4e43",
  "email": "user@example.com",
  "created_at": "2025-03-27T10:00:00Z"
}
```

#### **Request Logs Collection**
Stores all conversion requests for auditing.  
```json
{
  "_id": "some-object-id",
  "user_id": "dab458d6-8352-42e6-88a1-88acc76b4e43",
  "from_currency": "BTC",
  "to_currency": "USD",
  "amount": 999.20,
  "converted_amount": 67890.12,
  "exchange_rate": 67.89,
  "timestamp": "2025-03-27T14:52:00Z"
}
```

---

### **2. Redis for Exchange Rate Caching**
#### **Why Redis?**
- Reduces API calls to Coinbase.
- Speeds up conversion requests.
- Prevents hitting API rate limits.

#### **Caching Strategy**
1. **Check Redis first**: If the exchange rate exists and is **less than 10 minutes old**, use it.
2. **If expired or missing**: Fetch from **Coinbase API**, update Redis, and return the new rate.

#### **Redis Key Structure**
```json
{
  "BTC-USD": {
    "exchange_rate": 67890.12,
    "timestamp": "2025-03-27T14:50:00Z"
  }
}
```

---

### **3. Dockerization**
#### **Why Docker?**
- Eliminates local environment setup issues.
- Ensures the **same environment** runs on both **local** and **interviewer’s system**.
- Provides **isolated containers** for the app, MongoDB, and Redis.

#### **Docker Setup**
- **Node.js app**: Runs the Express service.
- **MongoDB**: Stores user data and logs.
- **Redis**: Caches exchange rates and enforces rate limits.

#### **docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGO_URI=mongodb://mongodb:27017/currency_converter
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - COINBASE_API_KEY=your_api_key

  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
```

---

### **4. Updated Milestones & Sequencing**
#### **Phase 1: Core API Development (XX weeks)**
✅ Set up Express server.  
✅ Implement currency conversion logic.  
✅ Integrate Coinbase API.  

#### **Phase 2: MongoDB & Redis (XX weeks)**
✅ Define MongoDB schemas (Users, Request Logs).  
✅ Implement exchange rate caching with Redis.  
✅ Implement rate limiting using Redis.  

#### **Phase 3: Dockerization & Deployment (XX weeks)**
✅ Create `Dockerfile` & `docker-compose.yml`.  
✅ Ensure local development mirrors production setup.  

#### **Phase 4: Logging, Testing & Optimization (XX weeks)**
✅ Implement request logging in MongoDB.  
✅ Write unit tests for currency conversion, caching, and rate limits.  
✅ Perform load testing to verify Redis caching efficiency.  

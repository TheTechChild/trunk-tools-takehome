# Currency Conversion Service

A modern currency conversion API service with rate limiting, Redis caching, and MongoDB for user data storage. Built with TypeScript, Express, and Bun.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github)](https://github.com/TheTechChild/trunk-tools-takehome)

## Features

- TypeScript-based Express server with Bun runtime
- Docker and docker-compose setup for local development
- MongoDB integration for data persistence and request logging
- Redis caching for optimized performance and rate limiting
- Comprehensive error handling and logging system
- Hot reloading for development
- Rate limiting with configurable windows and limits
- Request logging and metrics tracking
- Health check endpoints with dependency status
- CI/CD pipeline with GitHub Actions
- TypeScript strict mode and best practices

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (>= 1.2.0)
- [Docker Desktop](https://www.docker.com/) and Docker Compose

### Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose, which will set up the entire stack including MongoDB and Redis:

```bash
# Build and start all containers
docker-compose up -d

# View application logs
docker-compose logs -f app

# Stop all containers
docker-compose down
```

The application will be available at `http://localhost:8000`.

### Manual Development Setup

If you prefer to run the application directly on your machine (requires local MongoDB and Redis):

1. Clone the repository and install dependencies:

```bash
# Install dependencies
bun install
```

2. Copy the environment variables example file:

```bash
cp .env.example .env
```

3. Start the service in development mode:

```bash
# Start with hot reloading
bun run dev
```

## API Endpoints

### Health Check

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with dependency status

### Currency Conversion

- `GET /api/v1/currency/convert` - Convert between currencies
  - Query parameters: `from`, `to`, `amount`
- `GET /api/v1/currency/rates` - Get latest exchange rates
  - Query parameters: `base` (optional)
- `GET /api/v1/currency/supported` - List supported currencies
- `GET /api/v1/metrics` - Get application metrics and statistics

### Testing the API

A Postman collection is available to help you test the API endpoints. You can find it in the `documentation/` directory:

1. Import the collection:

   - Open Postman
   - Click "Import"
   - Select `documentation/Trunk Tools POC.postman_collection.json`

2. Set up environment variables:

   - Create a new environment in Postman
   - Add the following variables:
     - `domain`: Set to `localhost:8000` for local development
     - `UserId`: Your user ID for authentication (required for most endpoints)
     - `UserId2`: Alternative user ID for testing different scenarios

3. Available requests in the collection:
   - Health Check (Basic and Detailed)
   - Get Supported Currencies
   - Get Exchange Rates
   - Convert Currency
   - Get Health Metrics
   - Get Cache Metrics

## Environment Variables

The following environment variables are required:

### Application Configuration

- `NODE_ENV`: Application environment (local, production)
- `PORT`: Port number for the HTTP server (default: 8000)

### MongoDB Configuration

- `MONGODB_URI`: MongoDB connection string
  - Default: `mongodb://localhost:27017/currency-service`
  - Docker: `mongodb://mongodb:27017/currency-service`

### Redis Configuration

- `REDIS_URI`: Redis connection string
  - Default: `redis://localhost:6379`
  - Docker: `redis://redis:6379`

### Rate Limiting

- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting (default: 60000)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window (default: 100)
- `RATE_LIMIT_WEEKDAY`: Maximum requests per day on weekdays (default: 100)
- `RATE_LIMIT_WEEKEND`: Maximum requests per day on weekends (default: 200)

### Precision Settings

- `DECIMAL_PRECISION_BTC`: Number of decimal places for BTC (default: 8)
- `DECIMAL_PRECISION_USD`: Number of decimal places for USD (default: 2)

### Maximum Amounts

- `MAX_AMOUNT_BTC`: Maximum BTC amount for conversions (default: 1000)

### Coinbase API

- `COINBASE_API_URL`: Base URL for Coinbase API (default: https://api.coinbase.com/v2)

## Project Structure

```
currency-conversion-service/
├── src/
│   ├── controllers/     # Route controllers
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Express middleware
│   ├── errors/          # Error handling
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── config/          # Configuration files
│   ├── repositories/    # Data access layer
│   └── index.ts         # Application entry point
├── documentation/       # Project documentation
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── .env.example         # Example environment variables
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies and scripts
```

## Scripts

- `bun run dev` - Start the server with hot reloading
- `bun run build` - Run TypeScript type checking
- `bun run start` - Start the server in production mode
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint issues
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting
- `bun run docker:build` - Build Docker containers
- `bun run docker:up` - Start Docker containers
- `bun run docker:down` - Stop Docker containers
- `bun run seed` - Seed initial data
- `bun run restart` - Restart the entire stack

## Documentation

Detailed documentation is available in the `documentation/` directory:

- [API Endpoints](documentation/api-endpoints.md)
- [Environment Variables](documentation/env-variables.md)
- [Data Access Layer](documentation/data-access-layer.md)
- [Logging](documentation/logging.md)

## Development Guidelines

- Follow TypeScript best practices and strict mode
- Use ES Module syntax for imports/exports
- Implement proper error handling with custom error types
- Write comprehensive tests for new features
- Follow the existing code style and formatting rules
- Document new features and API changes

## Testing

The project uses Bun's built-in test runner. Run tests with:

```bash
bun test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is private and confidential.

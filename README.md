# Currency Conversion Service

A modern currency conversion API service with rate limiting, Redis caching, and MongoDB for user data storage.

## Features

- TypeScript-based Express server
- Docker and docker-compose setup for local development
- MongoDB integration for data persistence
- Redis caching for optimized performance
- Comprehensive error handling
- Hot reloading for development

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (>= 1.2.0)
- [Docker](https://www.docker.com/) and Docker Compose

### Development Setup

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

### Using Docker

To run the entire stack (API, MongoDB, Redis) using Docker:

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down
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
│   └── index.ts         # Application entry point
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

This project was created using `bun`.

FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files first to leverage caching
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Run type checking
RUN bun run build

# Production image
FROM oven/bun:1-slim AS production

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["bun", "run", "src/index.ts"] 
import express from 'express';
import { configureRoutes } from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { connectToDatabase } from './config/database';
import { initializeRedis } from './config/redis';

const app = express();
const port = process.env.PORT || 8000;
console.info('HELLO WORLD');

// Connect to MongoDB
connectToDatabase().catch((error) => {
  console.error('Failed to connect to MongoDB', error);
  // Application will continue to run even if DB connection fails
});

// Initialize Redis
try {
  initializeRedis();
} catch (error) {
  console.error('Failed to initialize Redis', error);
  // Application will continue to run even if Redis initialization fails
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Configure all routes
configureRoutes(app);

// Error handling (should be after routes)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}`);
});

export default app;

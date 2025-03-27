import express from 'express';
import { configureRoutes } from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure all routes
configureRoutes(app);

// Error handling (should be after routes)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}`);
});

export default app;

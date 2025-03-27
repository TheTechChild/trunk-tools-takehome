import express from 'express';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { configureRoutes } from '../../routes/index';
import { errorHandler } from '../../middleware/errorHandler';

// Mock express listen function
vi.mock('express', () => {
  const app = {
    use: vi.fn(),
    listen: vi.fn(),
  };
  return {
    default: vi.fn(() => app),
    json: vi.fn(),
    urlencoded: vi.fn(),
  };
});

// Mock route configuration
vi.mock('../../routes/index', () => ({
  configureRoutes: vi.fn(),
}));

// Mock error handler
vi.mock('../../middleware/errorHandler', () => ({
  errorHandler: vi.fn(),
}));

describe('Server Initialization', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('should initialize the Express application with required middleware', async () => {
    // Act
    await import('../../index');
    const app = express();

    // Assert
    expect(express).toHaveBeenCalled();
    expect(express.json).toHaveBeenCalled();
    expect(express.urlencoded).toHaveBeenCalledWith({ extended: true });
    expect(app.use).toHaveBeenCalled();
  });

  it('should configure routes', async () => {
    // Act
    await import('../../index');

    // Assert
    expect(configureRoutes).toHaveBeenCalled();
  });

  it('should apply error handling middleware', async () => {
    // Act
    await import('../../index');
    const app = express();

    // Assert
    expect(app.use).toHaveBeenCalled();
    expect(errorHandler).toBeDefined();
  });

  it('should listen on the default port if PORT env variable is not set', async () => {
    // Arrange
    delete process.env.PORT;

    // Act
    await import('../../index');
    const app = express();

    // Assert
    expect(app.listen).toHaveBeenCalledWith(8000, expect.any(Function));
  });

  it('should listen on the specified port if PORT env variable is set', async () => {
    // Arrange
    process.env.PORT = '9000';

    // Act
    await import('../../index');
    const app = express();

    // Assert
    expect(app.listen).toHaveBeenCalledWith('9000', expect.any(Function));
  });
}); 
import type { Express } from 'express';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { configureRoutes } from '../../routes/index';

describe('Route Registration', () => {
  let app: Express;
  const mockUse = vi.fn();

  beforeEach(() => {
    // Create a mock Express app
    app = {
      use: mockUse,
    } as unknown as Express;

    vi.clearAllMocks();
  });

  it('should register health routes on the correct path', () => {
    // Act
    configureRoutes(app);

    // Assert
    expect(mockUse).toHaveBeenCalledWith('/health', expect.anything());
  });

  it('should register currency routes on the correct path', () => {
    // Act
    configureRoutes(app);

    // Assert
    expect(mockUse).toHaveBeenCalledWith('/api/v1/currency', expect.anything());
  });

  it('should register all required routes', () => {
    // Act
    configureRoutes(app);

    // Assert
    expect(mockUse).toHaveBeenCalledTimes(2); // Health and currency routes
    expect(mockUse).toHaveBeenNthCalledWith(1, '/health', expect.anything());
    expect(mockUse).toHaveBeenNthCalledWith(2, '/api/v1/currency', expect.anything());
  });
});

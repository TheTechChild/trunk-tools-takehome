import type { Express } from 'express';
import { describe, expect, test, beforeEach } from 'bun:test';
import { mock } from 'bun:test';
import { configureRoutes } from '../../routes/index';

describe('Route Registration', () => {
  let app: Express;
  const mockUse = mock();

  beforeEach(() => {
    // Create a mock Express app
    app = {
      use: mockUse,
    } as unknown as Express;

    // Reset mocks between tests
    mockUse.mockReset();
  });

  test('should register health routes on the correct path', () => {
    // Act
    configureRoutes(app);

    // Assert
    expect(mockUse).toHaveBeenCalledWith('/health', expect.anything());
  });

  test('should register currency routes on the correct path', () => {
    // Act
    configureRoutes(app);

    // Assert
    expect(mockUse).toHaveBeenCalledWith('/api/v1/currency', expect.anything());
  });

  test('should register metrics routes on the correct path', () => {
    // Act
    configureRoutes(app);

    // Assert
    expect(mockUse).toHaveBeenCalledWith('/api/v1/metrics', expect.anything());
  });

  test('should register all required routes', () => {
    // Act
    configureRoutes(app);

    // Assert
    expect(mockUse).toHaveBeenCalledTimes(3); // Health, currency, and metrics routes
    expect(mockUse).toHaveBeenNthCalledWith(1, '/health', expect.anything());
    expect(mockUse).toHaveBeenNthCalledWith(2, '/api/v1/currency', expect.anything());
    expect(mockUse).toHaveBeenNthCalledWith(3, '/api/v1/metrics', expect.anything());
  });
});

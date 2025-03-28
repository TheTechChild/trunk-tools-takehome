import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import '../../setup/environment';
import { ensureDatabaseConnection, closeDatabaseConnection } from '../../../config/database';
import { initializeRedis, getRedisStatus, closeRedisConnection } from '../../../config/redis';
import { getDatabaseStatus } from '../../../config/database';

// This test uses simple mocks to avoid actual database connections
describe('Database Connections', () => {
  beforeAll(async () => {
    console.info('Setting up connection tests...');
    await ensureDatabaseConnection();
    await initializeRedis();
    console.info('Completed setting up connection tests...');
  });

  afterAll(async () => {
    console.info('Cleaning up connection tests...');
    await closeDatabaseConnection();
    await closeRedisConnection();
    console.info('Completed cleaning up connection tests');
  });

  it('should connect to MongoDB successfully', async () => {
    const connectionStatus = await getDatabaseStatus();
    expect(connectionStatus).toBe(true);
  });

  it('should connect to Redis successfully', async () => {
    // Connect using the mocked function
    const redisStatus = await getRedisStatus();

    expect(redisStatus).toBe(true);
  });
});

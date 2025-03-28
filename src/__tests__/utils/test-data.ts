import { ensureDatabaseConnection } from '../../config/database';
import { getUserModel } from '../../models/user.model';
import type { Model } from 'mongoose';

/**
 * Test data management utilities
 */
export class TestDataManager {
  private static instance: TestDataManager;
  private testUsers: Array<{ _id: string; email: string; created_at: Date }> = [];
  private User: Model<{ _id: string; email: string; created_at: Date }>;

  private constructor() {
    this.User = getUserModel();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  /**
   * Seed test users and store their IDs
   */
  public async seedTestUsers(
    count: number = 10
  ): Promise<Array<{ _id: string; email: string; created_at: Date }>> {
    await ensureDatabaseConnection();

    // Clear existing test users
    await this.User.deleteMany({ email: /^test-user/ });

    // Create new test users
    const users = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        this.User.create({
          email: `test-user-${i}@example.com`,
          created_at: new Date(),
        })
      )
    );

    this.testUsers = users;
    return users;
  }

  /**
   * Get a random test user
   */
  public getRandomTestUser(): { _id: string; email: string; created_at: Date } {
    if (this.testUsers.length === 0) {
      throw new Error('No test users available. Run seedTestUsers() first.');
    }
    const randomIndex = Math.floor(Math.random() * this.testUsers.length);
    const user = this.testUsers[randomIndex];
    if (!user) {
      throw new Error('Failed to get random test user');
    }
    return user;
  }

  /**
   * Get all test users
   */
  public getAllTestUsers(): Array<{ _id: string; email: string; created_at: Date }> {
    return this.testUsers;
  }

  /**
   * Get a test user by email
   */
  public getTestUserByEmail(
    email: string
  ): { _id: string; email: string; created_at: Date } | undefined {
    return this.testUsers.find((user) => user.email === email);
  }

  /**
   * Clear all test data
   */
  public async clearTestData(): Promise<void> {
    await ensureDatabaseConnection();
    await this.User.deleteMany({ email: /^test-user/ });
    this.testUsers = [];
  }
}

// Export singleton instance
export const testDataManager = TestDataManager.getInstance();

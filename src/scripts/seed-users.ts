import { config } from 'dotenv';
import { getUserModel } from '../models/user.model';
import { ensureDatabaseConnection } from '../config/database';

// Load environment variables
config();

async function seedTestUsers() {
  try {
    // Connect to MongoDB using the application's database configuration
    await ensureDatabaseConnection();
    console.info('Connected to MongoDB');

    // Get the User model using the application's model getter
    const User = getUserModel();

    // Clear existing test users
    await User.deleteMany({ email: /^test-user-/ });
    console.info('Cleared existing test users');

    // Create test users
    const testUsers = [];
    const numUsers = 10; // Number of test users to create

    for (let i = 0; i < numUsers; i++) {
      testUsers.push({
        email: `test-user-${i}@example.com`,
        created_at: new Date(),
      });
    }

    // Insert all test users
    await User.insertMany(testUsers);
    console.info(`Created ${numUsers} test users`);

    // Print some example user IDs for reference
    const sampleUsers = await User.find();
    console.info('\nSample test user IDs:');
    sampleUsers.forEach((user) => {
      console.info(`Email: ${user.email}, ID: ${user._id}`);
    });

    console.info('\nSeeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test users:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedTestUsers();

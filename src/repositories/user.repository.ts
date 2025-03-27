import { UserModel } from '../models/user.model';
import type { IUser } from '../types/database.types';
import type { UserRepositoryInterface } from '../types/repository.types';

/**
 * User repository implementation
 */
export class UserRepository implements UserRepositoryInterface {
  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(id).lean();
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await UserModel.findOne({ email }).lean();
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  async create(userData: Omit<IUser, '_id' | 'created_at'>): Promise<IUser> {
    try {
      const user = new UserModel(userData);
      await user.save();
      return user.toJSON() as IUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw to let caller handle specific errors
    }
  }

  /**
   * Update a user
   */
  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true }
      ).lean();
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository(); 
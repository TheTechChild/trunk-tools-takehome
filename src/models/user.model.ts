import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import type { IUser } from '../types/database.types';

/**
 * User Schema
 */
const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, // Disable auto-generated _id
    versionKey: false, // Disable __v field
  }
);

/**
 * Get or create User model
 * This prevents the "Cannot overwrite model" error in tests
 */
export const getUserModel = (): mongoose.Model<IUser> => {
  // Check if the model already exists to prevent compilation errors
  return mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
};

// For compatibility with existing code, export the model directly
export const UserModel = getUserModel();

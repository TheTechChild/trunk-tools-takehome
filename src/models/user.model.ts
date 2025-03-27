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

// Add indexes for faster lookups
UserSchema.index({ email: 1 }, { unique: true });

// Create and export User model
export const UserModel = mongoose.model<IUser>('User', UserSchema); 
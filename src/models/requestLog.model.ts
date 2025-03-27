import mongoose, { Schema } from 'mongoose';
import type { IRequestLog } from '../types/database.types';

/**
 * Request Log Schema
 */
const RequestLogSchema = new Schema<IRequestLog>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    from_currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    to_currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    converted_amount: {
      type: Number,
      required: true,
    },
    exchange_rate: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Add indexes for faster lookups
RequestLogSchema.index({ user_id: 1 });
RequestLogSchema.index({ timestamp: -1 });
RequestLogSchema.index({ from_currency: 1, to_currency: 1 });

/**
 * Get or create RequestLog model
 * This prevents the "Cannot overwrite model" error in tests
 */
export const getRequestLogModel = (): mongoose.Model<IRequestLog> => {
  // Check if the model already exists to prevent compilation errors
  return mongoose.models.RequestLog || mongoose.model<IRequestLog>('RequestLog', RequestLogSchema);
};

// For compatibility with existing code, export the model directly
export const RequestLogModel = getRequestLogModel();

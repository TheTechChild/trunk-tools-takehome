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

// Create and export RequestLog model
export const RequestLogModel = mongoose.model<IRequestLog>('RequestLog', RequestLogSchema); 
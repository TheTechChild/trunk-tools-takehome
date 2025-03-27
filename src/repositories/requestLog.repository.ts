import { RequestLogModel } from '../models/requestLog.model';
import type { IRequestLog } from '../types/database.types';
import type { RequestLogRepositoryInterface } from '../types/repository.types';

/**
 * Request Log repository implementation
 */
export class RequestLogRepository implements RequestLogRepositoryInterface {
  /**
   * Create a new request log
   */
  async create(logData: Omit<IRequestLog, '_id'>): Promise<IRequestLog> {
    try {
      const requestLog = new RequestLogModel(logData);
      await requestLog.save();
      return requestLog.toJSON() as IRequestLog;
    } catch (error) {
      console.error('Error creating request log:', error);
      throw error; // Re-throw to let caller handle specific errors
    }
  }

  /**
   * Find request logs by user ID
   */
  async findByUserId(userId: string, limit = 20, skip = 0): Promise<IRequestLog[]> {
    try {
      return await RequestLogModel.find({ user_id: userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error finding request logs by user ID:', error);
      return [];
    }
  }

  /**
   * Find request logs by currency pair
   */
  async findByCurrencyPair(
    fromCurrency: string,
    toCurrency: string,
    limit = 20,
    skip = 0
  ): Promise<IRequestLog[]> {
    try {
      return await RequestLogModel.find({
        from_currency: fromCurrency.toUpperCase(),
        to_currency: toCurrency.toUpperCase(),
      })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error finding request logs by currency pair:', error);
      return [];
    }
  }

  /**
   * Find request logs by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 20,
    skip = 0
  ): Promise<IRequestLog[]> {
    try {
      return await RequestLogModel.find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error finding request logs by date range:', error);
      return [];
    }
  }

  /**
   * Count request logs by user ID
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      return await RequestLogModel.countDocuments({ user_id: userId });
    } catch (error) {
      console.error('Error counting request logs by user ID:', error);
      return 0;
    }
  }

  /**
   * Count request logs by user ID and date range
   */
  async countByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      return await RequestLogModel.countDocuments({
        user_id: userId,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      });
    } catch (error) {
      console.error('Error counting request logs by user ID and date range:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const requestLogRepository = new RequestLogRepository();

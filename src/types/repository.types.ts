/**
 * Repository interface definitions
 */
import type { IUser, IRequestLog } from './database.types';

export interface UserRepositoryInterface {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Omit<IUser, '_id' | 'created_at'>): Promise<IUser>;
  update(id: string, userData: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}

export interface RequestLogRepositoryInterface {
  create(logData: Omit<IRequestLog, '_id'>): Promise<IRequestLog>;
  findByUserId(userId: string, limit?: number, skip?: number): Promise<IRequestLog[]>;
  findByCurrencyPair(
    fromCurrency: string,
    toCurrency: string,
    limit?: number,
    skip?: number
  ): Promise<IRequestLog[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
    skip?: number
  ): Promise<IRequestLog[]>;
  countByUserId(userId: string): Promise<number>;
  countByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<number>;
}

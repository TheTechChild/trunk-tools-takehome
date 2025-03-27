/**
 * Database type definitions
 */

export interface IUser {
  _id: string;
  email: string;
  created_at: Date;
}

export interface IRequestLog {
  _id?: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  converted_amount: number;
  exchange_rate: number;
  timestamp: Date;
} 
/**
 * API Type Definitions
 */

/**
 * Currency Conversion Request
 */
export interface CurrencyConversionRequest {
  from: string;
  to: string;
  amount: number;
}

/**
 * Currency Conversion Response
 */
export interface CurrencyConversionResponse {
  from: string;
  to: string;
  amount: number;
  rate: number;
  converted_amount: number;
  timestamp: string;
}

/**
 * Exchange Rate Request
 */
export interface ExchangeRateRequest {
  base: string;
}

/**
 * Exchange Rate Response
 */
export interface ExchangeRateResponse {
  base: string;
  timestamp: string;
  rates: Record<string, number>;
}

/**
 * Supported Currency
 */
export interface SupportedCurrency {
  code: string;
  name: string;
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
}

/**
 * API Response (Success or Error)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse; 
import { BadRequestError } from '../errors/AppError';
import { coinbaseService } from './coinbaseService';
import { requestLogRepository } from '../repositories/requestLog.repository';
import { SUPPORTED_CURRENCIES, DECIMAL_PRECISION, MAX_AMOUNTS } from '../config/constants';

/**
 * Currency Conversion Result
 */
export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
}

/**
 * Currency Conversion Service
 * Handles conversion between currencies with proper precision
 */
export class ConversionService {
  /**
   * Convert from one currency to another
   */
  async convertCurrency(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    userId: string
  ): Promise<ConversionResult> {
    // Validate currencies
    this.validateCurrencies(fromCurrency, toCurrency);

    // Validate amount
    this.validateAmount(amount);

    // Get exchange rate
    const { rate, timestamp } = await coinbaseService.getExchangeRate(fromCurrency, toCurrency);

    // Perform conversion with proper precision
    const convertedAmount = this.calculateConversion(fromCurrency, toCurrency, amount, rate);

    // Log the request
    await this.logConversion(userId, fromCurrency, toCurrency, amount, convertedAmount, rate);

    return {
      from: fromCurrency,
      to: toCurrency,
      amount,
      convertedAmount,
      rate,
      timestamp,
    };
  }

  /**
   * Validate that the currencies are supported
   */
  private validateCurrencies(fromCurrency: string, toCurrency: string): void {
    const normalizedFrom = fromCurrency.toUpperCase();
    const normalizedTo = toCurrency.toUpperCase();

    // Check if currencies are supported
    if (!SUPPORTED_CURRENCIES.includes(normalizedFrom)) {
      throw new BadRequestError(`Unsupported currency: ${fromCurrency}`, 'UNSUPPORTED_CURRENCY', {
        supportedCurrencies: SUPPORTED_CURRENCIES,
      });
    }

    if (!SUPPORTED_CURRENCIES.includes(normalizedTo)) {
      throw new BadRequestError(`Unsupported currency: ${toCurrency}`, 'UNSUPPORTED_CURRENCY', {
        supportedCurrencies: SUPPORTED_CURRENCIES,
      });
    }

    // Check for same currency
    if (normalizedFrom === normalizedTo) {
      throw new BadRequestError('Cannot convert to the same currency', 'INVALID_CURRENCY_PAIR');
    }
  }

  /**
   * Validate the amount is positive and within acceptable range
   */
  private validateAmount(amount: number): void {
    if (isNaN(amount) || !isFinite(amount)) {
      throw new BadRequestError('Invalid amount', 'INVALID_AMOUNT');
    }

    if (amount <= 0) {
      throw new BadRequestError('Amount must be greater than zero', 'INVALID_AMOUNT');
    }

    // Set an upper limit to prevent overflow issues
    if (amount > MAX_AMOUNTS.BTC) {
      throw new BadRequestError(
        `Amount exceeds maximum allowed (${MAX_AMOUNTS.BTC})`,
        'AMOUNT_TOO_LARGE'
      );
    }
  }

  /**
   * Calculate conversion with proper decimal precision
   */
  private calculateConversion(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    rate: number
  ): number {
    // First perform the calculation
    const rawConvertedAmount = amount * rate;

    // Then apply the correct precision based on target currency
    if (toCurrency.toUpperCase() === 'BTC') {
      return this.roundToPrecision(rawConvertedAmount, DECIMAL_PRECISION.BTC);
    } else if (toCurrency.toUpperCase() === 'USD') {
      return this.roundToPrecision(rawConvertedAmount, DECIMAL_PRECISION.USD);
    }

    // Default precision for other currencies (should not happen due to validation)
    return rawConvertedAmount;
  }

  /**
   * Round a number to specific decimal precision
   */
  private roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  /**
   * Log the conversion to the database
   */
  private async logConversion(
    userId: string,
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    convertedAmount: number,
    exchangeRate: number
  ): Promise<void> {
    try {
      await requestLogRepository.create({
        user_id: userId,
        from_currency: fromCurrency.toUpperCase(),
        to_currency: toCurrency.toUpperCase(),
        amount,
        converted_amount: convertedAmount,
        exchange_rate: exchangeRate,
        timestamp: new Date(),
      });
    } catch (error) {
      // Log error but don't fail the conversion
      console.error('Failed to log conversion request:', error);
    }
  }
}

// Export singleton instance
export const conversionService = new ConversionService();

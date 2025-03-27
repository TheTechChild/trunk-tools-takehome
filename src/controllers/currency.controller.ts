import type { Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/AppError';
import { conversionService } from '../services/conversionService';
import { coinbaseService } from '../services/coinbaseService';
import type { AuthenticatedRequest } from '../middleware/authentication';
import { SUPPORTED_CURRENCIES } from '../config/constants';

/**
 * Currency conversion controller
 */
export const currencyController = {
  /**
   * Convert between currencies
   */
  convertCurrency: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Authentication is enforced by middleware, so we can safely assume req.user exists
      if (!req.user || !req.user.userId) {
        throw new BadRequestError('User not authenticated', 'USER_NOT_AUTHENTICATED');
      }

      const { from, to, amount } = req.query;

      if (!from || !to || !amount) {
        throw new BadRequestError('Missing required parameters', 'INVALID_PARAMETERS', {
          required: ['from', 'to', 'amount'],
        });
      }

      // Convert string parameters to appropriate types
      const fromCurrency = String(from);
      const toCurrency = String(to);
      const amountValue = parseFloat(String(amount));

      // Convert the currency using the service
      const result = await conversionService.convertCurrency(
        fromCurrency,
        toCurrency,
        amountValue,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        data: {
          from: result.from,
          to: result.to,
          amount: result.amount,
          rate: result.rate,
          converted_amount: result.convertedAmount,
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get latest exchange rates
   */
  getExchangeRates: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { base } = req.query;

      if (!base) {
        throw new BadRequestError('Missing required parameter: base', 'INVALID_PARAMETERS');
      }

      const baseCurrency = String(base).toUpperCase();

      // We'll get rates for all supported currencies except the base currency
      const targetCurrencies = SUPPORTED_CURRENCIES.filter((curr) => curr !== baseCurrency);

      // Get exchange rates for each target currency
      const ratesPromises = targetCurrencies.map(async (currency) => {
        const { rate } = await coinbaseService.getExchangeRate(baseCurrency, currency);
        return { currency, rate };
      });

      const ratesResults = await Promise.all(ratesPromises);

      // Convert results to object format { USD: 1.23, BTC: 0.000123 }
      const rates = ratesResults.reduce(
        (acc, { currency, rate }) => {
          acc[currency] = rate;
          return acc;
        },
        {} as Record<string, number>
      );

      res.status(200).json({
        success: true,
        data: {
          base: baseCurrency,
          timestamp: new Date().toISOString(),
          rates,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get list of supported currencies
   */
  getSupportedCurrencies: (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Map the supported currencies to objects with name and code
      const currencies = SUPPORTED_CURRENCIES.map((code) => {
        const name = code === 'BTC' ? 'Bitcoin' : code === 'USD' ? 'US Dollar' : code;
        return { code, name };
      });

      res.status(200).json({
        success: true,
        data: currencies,
      });
    } catch (error) {
      next(error);
    }
  },
};

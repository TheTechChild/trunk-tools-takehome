import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/AppError';

/**
 * Currency conversion controller
 */
export const currencyController = {
  /**
   * Convert between currencies
   */
  convertCurrency: (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, amount } = req.query;
      
      // Validate required parameters
      if (!from || !to || !amount) {
        throw new BadRequestError(
          'Missing required parameters',
          'INVALID_PARAMETERS',
          { required: ['from', 'to', 'amount'] }
        );
      }

      // This is just a placeholder - in the final implementation
      // we would call a service to handle the actual conversion
      const result = {
        from: from,
        to: to,
        amount: parseFloat(amount as string),
        rate: 1.1, // Example rate
        result: parseFloat(amount as string) * 1.1,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get latest exchange rates
   */
  getExchangeRates: (req: Request, res: Response, next: NextFunction) => {
    try {
      const { base } = req.query;
      
      // This is just a placeholder - in the final implementation
      // we would fetch actual rates from a service
      const rates = {
        base: base || 'USD',
        timestamp: new Date().toISOString(),
        rates: {
          EUR: 0.91,
          GBP: 0.78,
          JPY: 108.95,
          AUD: 1.45
        }
      };
      
      res.status(200).json({
        success: true,
        data: rates
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get list of supported currencies
   */
  getSupportedCurrencies: (req: Request, res: Response, next: NextFunction) => {
    try {
      // This is just a placeholder - in the final implementation
      // we would fetch the actual supported currencies from a service
      const currencies = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'AUD', name: 'Australian Dollar' }
      ];
      
      res.status(200).json({
        success: true,
        data: currencies
      });
    } catch (error) {
      next(error);
    }
  }
}; 
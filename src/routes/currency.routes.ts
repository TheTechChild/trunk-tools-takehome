import { Router } from 'express';
import { currencyController } from '../controllers/currency.controller';
import { authenticate } from '../middleware/authentication';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest, currencyConversionSchema } from '../middleware/validation';
import { SUPPORTED_CURRENCIES } from '../config/constants';

const router = Router();

// GET /api/v1/currency/convert - Convert between currencies
router.get(
  '/convert',
  authenticate,
  rateLimiter,
  validateRequest(currencyConversionSchema),
  currencyController.convertCurrency
);

// GET /api/v1/currency/rates - Get latest exchange rates
router.get(
  '/rates',
  authenticate,
  rateLimiter,
  validateRequest({
    base: {
      validate: (value) => typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value.toUpperCase()),
      message: `Invalid base currency. Must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
      required: true
    }
  }),
  currencyController.getExchangeRates
);

// GET /api/v1/currency/supported - Get list of supported currencies
router.get(
  '/supported',
  authenticate,
  currencyController.getSupportedCurrencies
);

export default router;

import { Router } from 'express';
import { currencyController } from '../controllers/currency.controller';

const router = Router();

// GET /api/v1/currency/convert - Convert between currencies
router.get('/convert', currencyController.convertCurrency);

// GET /api/v1/currency/rates - Get latest exchange rates
router.get('/rates', currencyController.getExchangeRates);

// GET /api/v1/currency/supported - Get list of supported currencies
router.get('/supported', currencyController.getSupportedCurrencies);

export default router;

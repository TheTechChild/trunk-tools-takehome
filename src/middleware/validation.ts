import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/AppError';
import { SUPPORTED_CURRENCIES } from '../config/constants';

// Validation functions
interface ValidationFn {
  (value: any): boolean;
}

// Validation error messages
interface ValidationErrorMessages {
  [key: string]: string;
}

// Validation schema
interface ValidationSchema {
  [key: string]: {
    validate: ValidationFn;
    message: string;
    required?: boolean;
  };
}

/**
 * Validate request fields against a schema
 */
export const validateRequest = (
  schema: ValidationSchema,
  source: 'body' | 'query' | 'params' = 'query'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const errors: ValidationErrorMessages = {};
      const requiredFields: string[] = [];

      // Check all fields in the schema
      for (const [fieldName, fieldValidation] of Object.entries(schema)) {
        // Check if the field is required
        if (fieldValidation.required && (data[fieldName] === undefined || data[fieldName] === '')) {
          requiredFields.push(fieldName);
          errors[fieldName] = `${fieldName} is required`;
          continue;
        }

        // Skip validation if field is not required and not present
        if (!fieldValidation.required && (data[fieldName] === undefined || data[fieldName] === '')) {
          continue;
        }

        // Validate the field
        const isValid = fieldValidation.validate(data[fieldName]);
        if (!isValid) {
          errors[fieldName] = fieldValidation.message;
        }
      }

      // If there are any validation errors, throw a BadRequestError
      if (Object.keys(errors).length > 0) {
        throw new BadRequestError(
          'Validation error',
          'VALIDATION_ERROR',
          { errors, requiredFields: requiredFields.length > 0 ? requiredFields : undefined }
        );
      }

      next();
    } catch (error) {
      if (error instanceof BadRequestError) {
        next(error);
      } else {
        next(new BadRequestError('Invalid input format', 'INVALID_INPUT'));
      }
    }
  };
};

/**
 * Common validators
 */
export const validators = {
  // String validators
  isString: (value: any) => typeof value === 'string',
  isNonEmptyString: (value: any) => typeof value === 'string' && value.trim().length > 0,
  isAlphanumeric: (value: any) => typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value),
  
  // Number validators
  isNumber: (value: any) => !isNaN(Number(value)),
  isPositiveNumber: (value: any) => !isNaN(Number(value)) && Number(value) > 0,
  isInteger: (value: any) => Number.isInteger(Number(value)),
  isPositiveInteger: (value: any) => Number.isInteger(Number(value)) && Number(value) > 0,
  
  // Special validators
  isCurrency: (value: any) => {
    if (typeof value !== 'string') return false;
    const upperValue = value.toUpperCase();
    // Use supported currencies from constants
    return SUPPORTED_CURRENCIES.includes(upperValue);
  },
  
  // Custom validator factory
  inRange: (min: number, max: number) => (value: any) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },
  
  // Email validator
  isEmail: (value: any) => {
    if (typeof value !== 'string') return false;
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
};

/**
 * Validation schema for currency conversion
 */
export const currencyConversionSchema = {
  from: {
    validate: validators.isCurrency,
    message: 'Invalid source currency',
    required: true
  },
  to: {
    validate: validators.isCurrency,
    message: 'Invalid target currency',
    required: true
  },
  amount: {
    validate: validators.isPositiveNumber,
    message: 'Amount must be a positive number',
    required: true
  }
}; 
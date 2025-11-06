/**
 * @fileoverview Validation Module - Central export point for all validators
 * @description Provides type-safe API response validators with business rule validation
 */

// Export all validators from a single entry point
export { BaseValidator } from './BaseValidator';
export { AccountValidator } from './AccountValidator';
export { OrganizationValidator } from './OrganizationValidator';
export { UserValidator } from './UserValidator';

// Export types
export type { ValidationConfig, ResponseSchema } from './BaseValidator';
export type { AccountDetails } from './AccountValidator';
export type { OrganizationDetails } from './OrganizationValidator';
export type { UserDetails } from './UserValidator';

// Re-export commonly used validator factory
import { AccountValidator } from './AccountValidator';
import { OrganizationValidator } from './OrganizationValidator';
import { UserValidator } from './UserValidator';

/**
 * Validator Factory for easy access to validators
 * @example
 * const accountValidator = ValidatorFactory.getAccountValidator();
 * const account = await accountValidator.validateAccountResponse(response);
 */
export class ValidatorFactory {
  static getAccountValidator() {
    return AccountValidator;
  }

  static getOrganizationValidator() {
    return OrganizationValidator;
  }

  static getUserValidator() {
    return UserValidator;
  }
}

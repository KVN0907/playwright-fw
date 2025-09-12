import { APIResponse } from '@playwright/test';
import { BaseValidator, ResponseSchema } from './BaseValidator';

export interface AccountDetails {
  id: string;
  login: string;
  email?: string;
  role?: string;
  langKey?: string;
  activated?: boolean;
  [key: string]: unknown;
}

/**
 * Account endpoint response validator
 * Handles validation for /account endpoints
 */
export class AccountValidator extends BaseValidator {
  private static readonly ACCOUNT_SCHEMA: ResponseSchema = {
    id: {
      type: 'string',
      required: true,
      minLength: 1,
    },
    login: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    email: {
      type: 'string',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    role: {
      type: 'string',
      required: false,
    },
    langKey: {
      type: 'string',
      required: false,
    },
    activated: {
      type: 'boolean',
      required: false,
    },
  };

  /**
   * Validate account response with comprehensive checks
   */
  static async validateAccountResponse(response: APIResponse): Promise<AccountDetails> {
    return this.validateResponse<AccountDetails>(
      response,
      this.ACCOUNT_SCHEMA,
      200,
      'GET /account'
    );
  }

  /**
   * Custom validation for business rules
   */
  static validateBusinessRules(account: AccountDetails): void {
    // Basic account validations
    if (account.id && account.id.length === 0) {
      throw new Error('Account ID cannot be empty');
    }

    if (account.login && account.login.length === 0) {
      throw new Error('Account login cannot be empty');
    }

    // Email validation if present
    if (account.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
      throw new Error('Invalid email format');
    }

    // Language key validation if present
    if (account.langKey && !['en', 'es', 'fr', 'de'].includes(account.langKey)) {
      throw new Error('Unsupported language key');
    }
  }
}

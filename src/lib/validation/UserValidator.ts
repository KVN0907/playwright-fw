import { APIResponse } from '@playwright/test';
import { BaseValidator, ResponseSchema } from './BaseValidator';

export interface UserDetails {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  active?: boolean;
  [key: string]: unknown;
}

/**
 * User endpoint response validator
 * Handles validation for /user endpoints
 */
export class UserValidator extends BaseValidator {
  private static readonly USER_SCHEMA: ResponseSchema = {
    id: {
      type: 'string',
      required: true,
      minLength: 1,
    },
    username: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    firstName: {
      type: 'string',
      required: false,
      minLength: 1,
      maxLength: 100,
    },
    lastName: {
      type: 'string',
      required: false,
      minLength: 1,
      maxLength: 100,
    },
    active: {
      type: 'boolean',
      required: false,
    },
  };

  /**
   * Validate create user response
   */
  static async validateCreateUser(response: APIResponse): Promise<UserDetails> {
    return this.validateResponse<UserDetails>(response, this.USER_SCHEMA, 201, 'POST /user');
  }

  /**
   * Validate get user response
   */
  static async validateGetUser(response: APIResponse): Promise<UserDetails> {
    return this.validateResponse<UserDetails>(response, this.USER_SCHEMA, 200, 'GET /user');
  }

  /**
   * Custom validation for user business rules
   */
  static validateBusinessRules(user: UserDetails): void {
    // Email validation
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      throw new Error('Invalid email format');
    }

    // Username length validation
    if (user.username && user.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    // Inactive users should not have sensitive data exposed
    if (user.active === false && (user.firstName || user.lastName)) {
      // This is acceptable, but log for audit
      console.warn('Inactive user has personal information exposed');
    }
  }
}

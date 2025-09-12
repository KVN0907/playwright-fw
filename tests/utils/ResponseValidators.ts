import { expect } from '@playwright/test';
import { APIResponse } from '@playwright/test';
import Log from './Log';

// Common response interfaces
export interface AccountData {
  id?: string;
  login?: string;
  email?: string;
  role?: string;
  langKey?: string;
  activated?: boolean;
  [key: string]: unknown;
}

export interface ValidationConfig {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
}

export interface ResponseSchema {
  [key: string]: ValidationConfig;
}

/**
 * Base response validator with common validation logic
 */
export class ResponseValidator {
  /**
   * Validate response status and extract JSON body
   */
  static async validateAndExtractJson<T>(
    response: APIResponse,
    expectedStatus: number = 200
  ): Promise<T> {
    expect(response.status()).toBe(expectedStatus);
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    expect(typeof responseBody).toBe('object');
    return responseBody as T;
  }

  /**
   * Validate response against a schema
   */
  static validateAgainstSchema(data: Record<string, unknown>, schema: ResponseSchema): void {
    Object.entries(schema).forEach(([field, config]) => {
      if (field in data) {
        expect(typeof data[field]).toBe(config.type);
        if (
          config.required &&
          (data[field] === null || data[field] === undefined || data[field] === '')
        ) {
          throw new Error(`Required field '${field}' is empty or null`);
        }
      } else if (config.required) {
        throw new Error(`Required field '${field}' is missing from response data`);
      }
    });
  }

  /**
   * Log validation success
   */
  static logValidationSuccess(endpoint: string): void {
    Log.info(`✅ ${endpoint} - All validations passed`);
  }

  /**
   * Log validation error
   */
  static logValidationError(endpoint: string, error: Error): void {
    Log.error(`❌ ${endpoint} - Validation failed: ${error.message}`);
  }
}

/**
 * Account-specific validators
 */
export class AccountValidator extends ResponseValidator {
  private static readonly ACCOUNT_SCHEMA: ResponseSchema = {
    id: { type: 'string', required: true },
    login: { type: 'string', required: true },
    email: { type: 'string', required: false },
    role: { type: 'string', required: false },
    langKey: { type: 'string', required: false },
    activated: { type: 'boolean', required: false },
  };

  /**
   * Validate account details response
   */
  static async validateAccountDetails(response: APIResponse): Promise<AccountData> {
    const accountData = await this.validateAndExtractJson<AccountData>(response, 200);

    // Validate against account schema
    this.validateAgainstSchema(accountData, this.ACCOUNT_SCHEMA);

    // Additional account-specific validations
    if (accountData.id) {
      expect(accountData.id).toBeTruthy();
    }

    if (accountData.login) {
      expect(accountData.login).toBeTruthy();
    }

    this.logValidationSuccess('GET Account Details');
    return accountData;
  }
}

/**
 * Add more endpoint validators here as needed
 * Example Organization Validator:
 */
export class OrganizationValidator extends ResponseValidator {
  private static readonly ORGANIZATION_SCHEMA: ResponseSchema = {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    code: { type: 'string', required: true },
    status: { type: 'string', required: false },
    createdDate: { type: 'string', required: false },
  };

  /**
   * Validate create organization response
   */
  static async validateCreateOrganization(response: APIResponse): Promise<Record<string, unknown>> {
    const orgData = await this.validateAndExtractJson<Record<string, unknown>>(response, 201);
    this.validateAgainstSchema(orgData, this.ORGANIZATION_SCHEMA);
    this.logValidationSuccess('POST Create Organization');
    return orgData;
  }

  /**
   * Validate get organization response
   */
  static async validateGetOrganization(response: APIResponse): Promise<Record<string, unknown>> {
    const orgData = await this.validateAndExtractJson<Record<string, unknown>>(response, 200);
    this.validateAgainstSchema(orgData, this.ORGANIZATION_SCHEMA);
    this.logValidationSuccess('GET Organization Details');
    return orgData;
  }
}

/**
 * Example User Validator:
 */
export class UserValidator extends ResponseValidator {
  private static readonly USER_SCHEMA: ResponseSchema = {
    id: { type: 'string', required: true },
    username: { type: 'string', required: true },
    email: { type: 'string', required: true },
    firstName: { type: 'string', required: false },
    lastName: { type: 'string', required: false },
    active: { type: 'boolean', required: false },
  };

  static async validateCreateUser(response: APIResponse): Promise<Record<string, unknown>> {
    const userData = await this.validateAndExtractJson<Record<string, unknown>>(response, 201);
    this.validateAgainstSchema(userData, this.USER_SCHEMA);
    this.logValidationSuccess('POST Create User');
    return userData;
  }

  static async validateGetUser(response: APIResponse): Promise<Record<string, unknown>> {
    const userData = await this.validateAndExtractJson<Record<string, unknown>>(response, 200);
    this.validateAgainstSchema(userData, this.USER_SCHEMA);
    this.logValidationSuccess('GET User Details');
    return userData;
  }
}

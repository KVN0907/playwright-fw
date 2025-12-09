import { expect, APIResponse } from '@playwright/test';
import Log from '../utils/Log';

export interface ValidationConfig {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: (string | number)[];
}

export interface ResponseSchema {
  [key: string]: ValidationConfig;
}

/**
 * Base response validator with common validation logic
 * This is the foundation for all endpoint validators
 */
export abstract class BaseValidator {
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
   * Validate response against a schema with enhanced validation
   */
  static validateAgainstSchema(data: Record<string, unknown>, schema: ResponseSchema): void {
    Object.entries(schema).forEach(([field, config]) => {
      if (field in data) {
        const value = data[field];

        // Type validation
        expect(typeof value).toBe(config.type);

        // Required field validation
        if (config.required && (value === null || value === undefined || value === '')) {
          throw new Error(`Required field '${field}' is empty or null`);
        }

        // Additional validations based on type
        if (config.type === 'string' && typeof value === 'string') {
          if (config.minLength && value.length < config.minLength) {
            throw new Error(`Field '${field}' must be at least ${config.minLength} characters`);
          }
          if (config.maxLength && value.length > config.maxLength) {
            throw new Error(`Field '${field}' must not exceed ${config.maxLength} characters`);
          }
          if (config.pattern && !config.pattern.test(value)) {
            throw new Error(`Field '${field}' does not match required pattern`);
          }
        }

        if (config.type === 'number' && typeof value === 'number') {
          if (config.min !== undefined && value < config.min) {
            throw new Error(`Field '${field}' must be at least ${config.min}`);
          }
          if (config.max !== undefined && value > config.max) {
            throw new Error(`Field '${field}' must not exceed ${config.max}`);
          }
        }

        if (config.enum) {
          if (!config.enum.includes(value as string | number)) {
            throw new Error(`Field '${field}' must be one of: ${config.enum.join(', ')}`);
          }
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

  /**
   * Generic validator that can be used for any endpoint
   */
  static async validateResponse<T>(
    response: APIResponse,
    schema: ResponseSchema,
    expectedStatus: number = 200,
    endpointName: string
  ): Promise<T> {
    try {
      const data = await this.validateAndExtractJson<T>(response, expectedStatus);
      this.validateAgainstSchema(data as Record<string, unknown>, schema);
      this.logValidationSuccess(endpointName);
      return data;
    } catch (error) {
      this.logValidationError(endpointName, error as Error);
      throw error;
    }
  }
}

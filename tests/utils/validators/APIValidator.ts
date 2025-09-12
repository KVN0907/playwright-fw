import { APIResponse } from '@playwright/test';
import { BaseValidator } from './BaseValidator';
import { API_SCHEMAS, EndpointKey } from './schemas';

/**
 * Universal API validator - handles any endpoint using schemas
 * No need to create individual validators for each endpoint
 */
export class APIValidator {
  /**
   * Validate any API response using predefined schemas
   */
  static async validateEndpoint<T>(
    response: APIResponse,
    endpointKey: EndpointKey,
    expectedStatus: number = 200
  ): Promise<T> {
    const schema = API_SCHEMAS[endpointKey];
    return BaseValidator.validateResponse<T>(response, schema as any, expectedStatus, endpointKey);
  }

  /**
   * Quick validation for endpoints without predefined schemas
   */
  static async validateBasic<T>(
    response: APIResponse,
    expectedStatus: number = 200,
    endpointName: string = 'API'
  ): Promise<T> {
    return BaseValidator.validateAndExtractJson<T>(response, expectedStatus);
  }
}

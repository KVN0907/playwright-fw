import { test, expect } from '@playwright/test';
import { APITestHelper } from '../utils/APITestHelper';
import Log from '../utils/Log';
import urls from './endPointsDTO/uri.json';

interface AccountData {
  id?: string;
  login?: string;
  email?: string;
  role?: string;
  langKey?: string;
  activated?: boolean;
  [key: string]: unknown;
}

test.describe('API Tests - Account Management', () => {
  let apiHelper: APITestHelper;

  test.beforeEach(async ({ page, request }) => {
    // Initialize API helper
    apiHelper = new APITestHelper(request, page);
  });

  test('GET Account Details of the Logged In User', async () => {
    try {
      // Get account details using the helper
      const response = await apiHelper.get(urls.getAccountDetails);

      // Validate response status
      await apiHelper.validateResponse(response, 200);

      // Get response body
      const accountData = (await apiHelper.getResponseBody(response)) as AccountData;

      // Validate response structure
      expect(accountData).toBeDefined();
      expect(typeof accountData).toBe('object');

      // Validate required fields
      if ('id' in accountData) {
        expect(typeof accountData.id).toBe('string');
        expect(accountData.id).toBeTruthy();
      }

      if ('login' in accountData) {
        expect(typeof accountData.login).toBe('string');
        expect(accountData.login).toBeTruthy();
      }

      if ('email' in accountData) {
        expect(typeof accountData.email).toBe('string');
      }

      if ('role' in accountData) {
        expect(typeof accountData.role).toBe('string');
      }

      // Define expected response schema
      const expectedResponseSchema = {
        id: { type: 'string', required: true },
        login: { type: 'string', required: true },
        email: { type: 'string', required: false },
        role: { type: 'string', required: false },
        langKey: { type: 'string', required: false },
        activated: { type: 'boolean', required: false },
      };

      // Validate response against schema
      Object.entries(expectedResponseSchema).forEach(([field, config]) => {
        if (field in accountData) {
          expect(typeof accountData[field as keyof typeof accountData]).toBe(config.type);
          if (config.required) {
            expect(accountData[field as keyof typeof accountData]).toBeTruthy();
          }
        } else if (config.required) {
          throw new Error(`Required field '${field}' is missing from account data`);
        }
      });

      if ('activated' in accountData) {
        expect(typeof accountData.activated).toBe('boolean');
      }

      Log.info('✅ All account data validations passed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Log.error(`❌ Account details test failed: ${errorMessage}`);
      throw error;
    }
  });
});

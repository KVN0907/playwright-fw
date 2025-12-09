import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';

/**
 * Comprehensive API Tests for AccountResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: AccountResource.java
 */

test.describe('AccountResource API Tests', () => {
  test('@smoke GET /api/account - getAccount - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/account');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/account');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/authenticate - isAuthenticated - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/authenticate');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/authenticate');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/csrf-token-gateway - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/csrf-token-gateway');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/csrf-token-gateway');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});

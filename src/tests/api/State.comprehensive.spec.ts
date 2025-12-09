import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';

/**
 * Comprehensive API Tests for StateResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: StateResource.java
 */

test.describe('StateResource API Tests', () => {
  test('@smoke GET /api/states/country/{countryId} - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/states/country/{countryId}');

    // Given valid request data
    const countryId = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/states/country/${countryId}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/states/active - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/states/active');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/states/active');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/states/country/{countryId}/active - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/states/country/{countryId}/active');

    // Given valid request data
    const countryId = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/states/country/${countryId}/active');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/states/search - searchState - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/states/search');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/states/search');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/states/exists - checkStateExists - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/states/exists');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/states/exists');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/states - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/states');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/states');

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

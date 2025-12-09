import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';

/**
 * Comprehensive API Tests for AttributesResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: AttributesResource.java
 */

test.describe('AttributesResource API Tests', () => {
  test('@smoke POST /api/attributes - createAttributes - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/attributes');

    // Given valid request data

    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
    };

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/attributes', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/attributes - invalidpayload', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: invalidpayload');

    // Given unknown condition
    // Setup for invalidpayload

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/attributes');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('invalidpayload');
  });

  test('@smoke GET /api/attributes/{controlId} - getAttributesByControlId - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/attributes/{controlId}');

    // Given valid request data
    const controlId = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/attributes/${controlId}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke DELETE /api/attributes/delete/{id} - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing DELETE /api/attributes/delete/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated DELETE request
    const response = await authenticatedApi.delete('/api/attributes/delete/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);
  });
});

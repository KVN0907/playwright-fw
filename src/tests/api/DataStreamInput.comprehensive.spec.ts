import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';

/**
 * Comprehensive API Tests for DataStreamInputResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: DataStreamInputResource.java
 */

test.describe('DataStreamInputResource API Tests', () => {
  test('@smoke POST /api/data-stream-inputs - createDataStreamInput - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/data-stream-inputs');

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
    const response = await authenticatedApi.post('/api/data-stream-inputs', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/data-stream-inputs - idexists', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idexists');

    // Given unknown condition
    const requestData = { id: 999, username: 'existing', email: 'existing@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/data-stream-inputs', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('idexists');
  });

  test('@smoke PUT /api/data-stream-inputs/{id} - updateDataStreamInput - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing PUT /api/data-stream-inputs/{id}');

    // Given valid request data
    const Long = 'test-value';
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
    };

    // When making authenticated PUT request
    const response = await authenticatedApi.put('/api/data-stream-inputs/{id}', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative PUT /api/data-stream-inputs/{id} - idnull', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnull');

    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/data-stream-inputs/{id}', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('idnull');
  });

  test('@negative PUT /api/data-stream-inputs/{id} - idinvalid', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idinvalid');

    // Given unknown condition
    // Setup for idinvalid

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/data-stream-inputs/{id}');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('idinvalid');
  });

  test('@negative PUT /api/data-stream-inputs/{id} - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');

    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/data-stream-inputs/' + nonExistentId + '');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('idnotfound');
  });

  test('@smoke PATCH /api/data-stream-inputs - partialUpdateDataStreamInput - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing PATCH /api/data-stream-inputs');

    // Given valid request data
    const Long = 'test-value';
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
    };

    // When making authenticated PATCH request
    const response = await authenticatedApi.patch('/api/data-stream-inputs', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative PATCH /api/data-stream-inputs - idnull', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnull');

    // Given unknown condition
    const requestData = { id: null };

    // When making PATCH request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.patch('/api/data-stream-inputs', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('idnull');
  });

  test('@negative PATCH /api/data-stream-inputs - idinvalid', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idinvalid');

    // Given unknown condition
    // Setup for idinvalid

    // When making PATCH request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.patch('/api/data-stream-inputs');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('idinvalid');
  });

  test('@negative PATCH /api/data-stream-inputs - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');

    // Given unknown condition
    const nonExistentId = 999999;

    // When making PATCH request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.patch('/api/data-stream-inputs');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('idnotfound');
  });

  test('@smoke GET /api/data-stream-inputs - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/data-stream-inputs');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/data-stream-inputs');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/data-stream-inputs/{id} - getDataStreamInput - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/data-stream-inputs/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/data-stream-inputs/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke DELETE /api/data-stream-inputs/{id} - deleteDataStreamInput - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing DELETE /api/data-stream-inputs/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated DELETE request
    const response = await authenticatedApi.delete('/api/data-stream-inputs/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);
  });
});

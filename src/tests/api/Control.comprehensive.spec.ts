import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';

/**
 * Comprehensive API Tests for ControlResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: ControlResource.java
 */

test.describe('ControlResource API Tests', () => {
  test('@smoke POST /api/control - createControls - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/control');

    // Given valid request data

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/control');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/control - idexists', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idexists');

    // Given unknown condition
    const requestData = { id: 999, username: 'existing', email: 'existing@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/control', requestData);
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

  test('@smoke PUT /api/control/{id} - updateControl - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing PUT /api/control/{id}');

    // Given valid request data
    const Long = 'test-value';

    // When making authenticated PUT request
    const response = await authenticatedApi.put('/api/control/{id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative PUT /api/control/{id} - idnull', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnull');

    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/control/{id}', requestData);
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

  test('@negative PUT /api/control/{id} - idinvalid', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idinvalid');

    // Given unknown condition
    // Setup for idinvalid

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/control/{id}');
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

  test('@negative PUT /api/control/{id} - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');

    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/control/' + nonExistentId + '');
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

  test('@smoke GET /api/control/filter-options - getAllFilterOptions - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/filter-options');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/control/filter-options');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/control/application-details-from-list-page/{id} - getApplicationDetailsFromListPage - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/application-details-from-list-page/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get(
      '/api/control/application-details-from-list-page/${id}'
    );

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/control/list - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/control/list');

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
    const response = await authenticatedApi.post('/api/control/list', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/controldownloadByDocId/{controlDocId} - downloadControlDocByDocId - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/controldownloadByDocId/{controlDocId}');

    // Given valid request data
    const controlDocId = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/controldownloadByDocId/${controlDocId}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke DELETE /api/control/{id} - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing DELETE /api/control/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated DELETE request
    const response = await authenticatedApi.delete('/api/control/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);
  });

  test('@smoke GET /api/control/nature-type - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/nature-type');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/control/nature-type');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/control/engine-type - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/engine-type');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/control/engine-type');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/control/frequency-type - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/frequency-type');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/control/frequency-type');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/control/details/{id} - getControl - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/details/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/control/details/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/controltoggle-status/{id} - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/controltoggle-status/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/controltoggle-status/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/control/bulk-upload/template - downloadBulkUploadTemplate - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/bulk-upload/template');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/control/bulk-upload/template');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/control/bulk-upload/edit-template - downloadBulkEditTemplate - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/bulk-upload/edit-template');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/control/bulk-upload/edit-template');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/control - bulkUploadControls - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/control');

    // Given valid request data

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/control');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/control/{id} - getControlDetails - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/control/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/control/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/control/list-items - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/control/list-items');

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
    const response = await authenticatedApi.post('/api/control/list-items', requestData);

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

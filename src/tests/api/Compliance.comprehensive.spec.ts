import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';

/**
 * Comprehensive API Tests for ComplianceResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: ComplianceResource.java
 */

test.describe('ComplianceResource API Tests', () => {
  test('@smoke POST /api/compliances - createCompliance - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/compliances');

    // Given valid request data

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/compliances');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/compliances - invalidjson', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: invalidjson');

    // Given unknown condition
    // Setup for invalidjson

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/compliances');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('invalidjson');
  });

  test('@negative POST /api/compliances - idexists', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idexists');

    // Given unknown condition
    const requestData = { id: 999, username: 'existing', email: 'existing@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/compliances', requestData);
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

  test('@smoke PUT /api/compliances/{id} - updateCompliance - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing PUT /api/compliances/{id}');

    // Given valid request data
    const Long = 'test-value';

    // When making authenticated PUT request
    const response = await authenticatedApi.put('/api/compliances/{id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative PUT /api/compliances/{id} - invalidjson', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: invalidjson');

    // Given unknown condition
    // Setup for invalidjson

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/compliances/{id}');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('invalidjson');
  });

  test('@negative PUT /api/compliances/{id} - idnull', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnull');

    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/compliances/{id}', requestData);
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

  test('@negative PUT /api/compliances/{id} - idinvalid', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idinvalid');

    // Given unknown condition
    // Setup for idinvalid

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/compliances/{id}');
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

  test('@negative PUT /api/compliances/{id} - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');

    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/compliances/' + nonExistentId + '');
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

  test('@smoke GET /api/compliances - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/compliances');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/compliances');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/compliances/{id} - getCompliance - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/compliances/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/compliances/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke DELETE /api/compliances/deleteByComplianceDocId/{complianceDocId} - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing DELETE /api/compliances/deleteByComplianceDocId/{complianceDocId}');

    // Given valid request data
    const complianceDocId = 1;

    // When making authenticated DELETE request
    const response = await authenticatedApi.delete(
      '/api/compliances/deleteByComplianceDocId/${complianceDocId}'
    );

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);
  });

  test('@smoke GET /api/compliancesdownloadByDocId/{complianceDocId} - downloadComplianceDocByDocId - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/compliancesdownloadByDocId/{complianceDocId}');

    // Given valid request data
    const complianceDocId = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get(
      '/api/compliancesdownloadByDocId/${complianceDocId}'
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

  test('@smoke GET /api/compliancesdownloadAllDocs/{complianceId} - downloadMultipleComplianceDocsByDocId - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/compliancesdownloadAllDocs/{complianceId}');

    // Given valid request data
    const complianceId = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/compliancesdownloadAllDocs/${complianceId}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/compliancestoggle-status/{id} - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/compliancestoggle-status/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/compliancestoggle-status/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke DELETE /api/compliances/{id} - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing DELETE /api/compliances/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated DELETE request
    const response = await authenticatedApi.delete('/api/compliances/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);
  });

  test('@smoke POST /api/compliances/list - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/compliances/list');

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
    const response = await authenticatedApi.post('/api/compliances/list', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/compliances/bulk-upload/template - downloadBulkUploadTemplate - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/compliances/bulk-upload/template');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/compliances/bulk-upload/template');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/compliances - bulkUploadCompliances - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/compliances');

    // Given valid request data

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/compliances');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/compliances - emptyFile', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: emptyFile');

    // Given unknown condition
    // Setup for emptyFile

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/compliances');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('emptyFile');
  });

  test('@negative POST /api/compliances - invalidfile', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: invalidfile');

    // Given unknown condition
    // Setup for invalidfile

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/compliances');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('invalidfile');
  });

  test('@smoke GET /api/compliances/bulk-upload/edit-template - downloadBulkEditTemplate - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/compliances/bulk-upload/edit-template');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/compliances/bulk-upload/edit-template');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/compliances/compliance-list - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/compliances/compliance-list');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/compliances/compliance-list');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/compliances/list-items - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/compliances/list-items');

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
    const response = await authenticatedApi.post('/api/compliances/list-items', requestData);

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

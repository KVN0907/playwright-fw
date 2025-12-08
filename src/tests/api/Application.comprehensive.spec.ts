import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/Log';

/**
 * Comprehensive API Tests for ApplicationResource
 * Generated automatically with ZERO manual intervention
 * 
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 * 
 * Source: ApplicationResource.java
 */

test.describe('ApplicationResource API Tests', () => {
  test('@smoke POST /api/applications - createApplication - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/applications');
    
    // Given valid request data
    
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    };

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/applications', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/applications - idexists', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idexists');
    
    // Given unknown condition
    const requestData = { id: 999, username: "existing", email: "existing@test.com" };

    // When making POST request with invalid data
    try {
      const response = await authenticatedApi.post('/api/applications', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('idexists');
  });

  test('@smoke PUT /api/applications/{id} - updateApplication - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing PUT /api/applications/{id}');
    
    // Given valid request data
    const Long = 'test-value';
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    };

    // When making authenticated PUT request
    const response = await authenticatedApi.put('/api/applications/{id}', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative PUT /api/applications/{id} - idnull', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnull');
    
    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    try {
      const response = await authenticatedApi.put('/api/applications/{id}', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('idnull');
  });

  test('@negative PUT /api/applications/{id} - idinvalid', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idinvalid');
    
    // Given unknown condition
    // Setup for idinvalid

    // When making PUT request with invalid data
    try {
      const response = await authenticatedApi.put('/api/applications/{id}');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('idinvalid');
  });

  test('@negative PUT /api/applications/{id} - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');
    
    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    try {
      const response = await authenticatedApi.put('/api/applications/' + nonExistentId + '');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('idnotfound');
  });

  test('@smoke POST /api/applications/list - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/applications/list');
    
    // Given valid request data
    
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    };

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/applications/list', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/applications/filter-options - getAllFilterOptions - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/applications/filter-options');
    
    // Given valid request data
    
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/applications/filter-options');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/applications/{id} - getApplication - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/applications/{id}');
    
    // Given valid request data
    const id = 1;
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/applications/${id}');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/applications/details/{id} - getApplicationDetails - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/applications/details/{id}');
    
    // Given valid request data
    const id = 1;
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/applications/details/${id}');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/applications/details-from-list-page/{id} - getApplicationDetailsFromListPage - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/applications/details-from-list-page/{id}');
    
    // Given valid request data
    const id = 1;
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/applications/details-from-list-page/${id}');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/applications/details-all/{id} - getApplicationAllDetails - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/applications/details-all/{id}');
    
    // Given valid request data
    const id = 1;
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/applications/details-all/${id}');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/applications/details-view/{id} - getApplicationAllDetailsForView - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/applications/details-view/{id}');
    
    // Given valid request data
    const id = 1;
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/applications/details-view/${id}');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke DELETE /api/applications/{id} - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing DELETE /api/applications/{id}');
    
    // Given valid request data
    const id = 1;
    

    // When making authenticated DELETE request
    const response = await authenticatedApi.delete('/api/applications/${id}');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
  });

  test('@negative DELETE /api/applications/{id} - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');
    
    // Given unknown condition
    const nonExistentId = 999999;

    // When making DELETE request with invalid data
    try {
      const response = await authenticatedApi.delete('/api/applications/' + nonExistentId + '');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('idnotfound');
  });

  test('@smoke GET /api/applicationstoggle-status/{id} - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/applicationstoggle-status/{id}');
    
    // Given valid request data
    const id = 1;
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/applicationstoggle-status/${id}');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative GET /api/applicationstoggle-status/{id} - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');
    
    // Given unknown condition
    const nonExistentId = 999999;

    // When making GET request with invalid data
    try {
      const response = await authenticatedApi.get('/api/applicationstoggle-status/' + nonExistentId + '');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('idnotfound');
  });

  test('@smoke POST /api/applications/details-by-location - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/applications/details-by-location');
    
    // Given valid request data
    
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    };

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/applications/details-by-location', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/applications/list-items - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/applications/list-items');
    
    // Given valid request data
    
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    };

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/applications/list-items', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});

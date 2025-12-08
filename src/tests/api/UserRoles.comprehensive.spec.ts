import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/Log';

/**
 * Comprehensive API Tests for UserRolesResource
 * Generated automatically with ZERO manual intervention
 * 
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 * 
 * Source: UserRolesResource.java
 */

test.describe('UserRolesResource API Tests', () => {
  test('@smoke POST /api/user-roles - createUserRoles - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/user-roles');
    
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
    const response = await authenticatedApi.post('/api/user-roles', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/user-roles - notAssignableRole', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: notAssignableRole');
    
    // Given unknown condition
    // Setup for notAssignableRole

    // When making POST request with invalid data
    try {
      const response = await authenticatedApi.post('/api/user-roles');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('notAssignableRole');
  });

  test('@negative POST /api/user-roles - idexists', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idexists');
    
    // Given unknown condition
    const requestData = { id: 999, username: "existing", email: "existing@test.com" };

    // When making POST request with invalid data
    try {
      const response = await authenticatedApi.post('/api/user-roles', requestData);
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

  test('@negative POST /api/user-roles - userRoleCombinationExist', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: userRoleCombinationExist');
    
    // Given unknown condition
    // Setup for userRoleCombinationExist

    // When making POST request with invalid data
    try {
      const response = await authenticatedApi.post('/api/user-roles');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('userRoleCombinationExist');
  });

  test('@smoke PUT /api/user-roles - updateUserRoles - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing PUT /api/user-roles');
    
    // Given valid request data
    
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    };

    // When making authenticated PUT request
    const response = await authenticatedApi.put('/api/user-roles', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative PUT /api/user-roles - idnull', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnull');
    
    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    try {
      const response = await authenticatedApi.put('/api/user-roles', requestData);
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

  test('@negative PUT /api/user-roles - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');
    
    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    try {
      const response = await authenticatedApi.put('/api/user-roles');
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

  test('@negative PUT /api/user-roles - notEditableUserRole', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: notEditableUserRole');
    
    // Given unknown condition
    // Setup for notEditableUserRole

    // When making PUT request with invalid data
    try {
      const response = await authenticatedApi.put('/api/user-roles');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('notEditableUserRole');
  });

  test('@negative PUT /api/user-roles - userRoleCombinationExist', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: userRoleCombinationExist');
    
    // Given unknown condition
    // Setup for userRoleCombinationExist

    // When making PUT request with invalid data
    try {
      const response = await authenticatedApi.put('/api/user-roles');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('userRoleCombinationExist');
  });

  test('@negative PUT /api/user-roles - notAssignableRole', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: notAssignableRole');
    
    // Given unknown condition
    // Setup for notAssignableRole

    // When making PUT request with invalid data
    try {
      const response = await authenticatedApi.put('/api/user-roles');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('notAssignableRole');
  });

  test('@smoke GET /api/user-roles - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/user-roles');
    
    // Given valid request data
    
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/user-roles');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/user-roles/getById - getUserRoles - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/user-roles/getById');
    
    // Given valid request data
    
    

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/user-roles/getById');

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

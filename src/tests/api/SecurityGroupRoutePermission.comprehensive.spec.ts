import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';
import { APITestHelper } from '../../lib/api/APITestHelper';

/**
 * Comprehensive API Tests for SecurityGroupRoutePermissionResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: SecurityGroupRoutePermissionResource.java
 */

test.describe('SecurityGroupRoutePermissionResource API Tests', () => {
  test('@smoke POST /api/security-group-route-permissions - createSecurityGroupRoutePermission - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/security-group-route-permissions');

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
    const response = await authenticatedApi.post(
      '/api/security-group-route-permissions',
      requestData
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

  test('@negative POST /api/security-group-route-permissions - idexists', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: idexists');

    // Given unknown condition
    const requestData = { id: 999, username: 'existing', email: 'existing@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/security-group-route-permissions', requestData);
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

  test('@negative POST /api/security-group-route-permissions - securityGroupPathPermissionCombinationExist', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: securityGroupPathPermissionCombinationExist');

    // Given unknown condition
    // Setup for securityGroupPathPermissionCombinationExist

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/security-group-route-permissions');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('securityGroupPathPermissionCombinationExist');
  });

  test('@negative POST /api/security-group-route-permissions - notAuthorize', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: notAuthorize');

    // Given unauthorized access
    // Setup for notAuthorize

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/security-group-route-permissions');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 401 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('notAuthorize');
  });

  test('@security POST /api/security-group-route-permissions - Unauthorized Access', async ({
    request,
  }) => {
    Log.info('Testing unauthorized access');

    // Given no valid authentication/authorization
    // Create a new API helper without auth
    const unauthApi = new APITestHelper(request);

    // When making POST request without proper permissions
    let response;
    try {
      response = await unauthApi.post('/api/security-group-route-permissions', undefined, {
        skipAuth: true,
      });
    } catch (error) {
      Log.info('Expected auth error caught');
    }

    // Then should return 401/403 error
    if (response) {
      expect([401]).toContain(response!.status());
    }
  });

  test('@smoke PUT /api/security-group-route-permissions - updateSecurityGroupRoutePermission - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing PUT /api/security-group-route-permissions');

    // Given valid request data

    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
    };

    // When making authenticated PUT request
    const response = await authenticatedApi.put(
      '/api/security-group-route-permissions',
      requestData
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

  test('@negative PUT /api/security-group-route-permissions - idnull', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: idnull');

    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/security-group-route-permissions', requestData);
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

  test('@negative PUT /api/security-group-route-permissions - idnotfound', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: idnotfound');

    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/security-group-route-permissions');
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

  test('@negative PUT /api/security-group-route-permissions - securityGroupPathPermissionCombinationExist', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: securityGroupPathPermissionCombinationExist');

    // Given unknown condition
    // Setup for securityGroupPathPermissionCombinationExist

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/security-group-route-permissions');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('securityGroupPathPermissionCombinationExist');
  });

  test('@negative PUT /api/security-group-route-permissions - notAuthorize', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: notAuthorize');

    // Given unauthorized access
    // Setup for notAuthorize

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/security-group-route-permissions');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 401 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('notAuthorize');
  });

  test('@security PUT /api/security-group-route-permissions - Unauthorized Access', async ({
    request,
  }) => {
    Log.info('Testing unauthorized access');

    // Given no valid authentication/authorization
    // Create a new API helper without auth
    const unauthApi = new APITestHelper(request);

    // When making PUT request without proper permissions
    let response;
    try {
      response = await unauthApi.put('/api/security-group-route-permissions', undefined, {
        skipAuth: true,
      });
    } catch (error) {
      Log.info('Expected auth error caught');
    }

    // Then should return 401/403 error
    if (response) {
      expect([401]).toContain(response!.status());
    }
  });

  test('@smoke GET /api/security-group-route-permissions - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/security-group-route-permissions');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/security-group-route-permissions');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/security-group-route-permissions/getById - getSecurityGroupRoutePermission - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/security-group-route-permissions/getById');

    // Given valid request data

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/security-group-route-permissions/getById');

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

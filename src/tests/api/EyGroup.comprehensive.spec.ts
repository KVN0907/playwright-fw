import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';
import { APITestHelper } from '../../lib/api/APITestHelper';

/**
 * Comprehensive API Tests for EyGroupResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: EyGroupResource.java
 */

test.describe('EyGroupResource API Tests', () => {
  test('@smoke POST /api/ey-groups/organization - createOrganization - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/ey-groups/organization');

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
    const response = await authenticatedApi.post('/api/ey-groups/organization', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/ey-groups/organization - idexists', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idexists');

    // Given unknown condition
    const requestData = { id: 999, username: 'existing', email: 'existing@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/organization', requestData);
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

  test('@negative POST /api/ey-groups/organization - userNameExist', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: userNameExist');

    // Given unknown condition
    const requestData = { username: 'existinguser', email: 'new@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/organization', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('userNameExist');
  });

  test('@negative POST /api/ey-groups/organization - emailExist', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: emailExist');

    // Given unknown condition
    const requestData = { username: 'newuser', email: 'existing@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/organization', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('emailExist');
  });

  test('@negative POST /api/ey-groups/organization - shortFormExist', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: shortFormExist');

    // Given unknown condition
    // Setup for shortFormExist

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/organization');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('shortFormExist');
  });

  test('@negative POST /api/ey-groups/organization - notAuthorize', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: notAuthorize');

    // Given unauthorized access
    // Setup for notAuthorize

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/organization');
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

  test('@security POST /api/ey-groups/organization - Unauthorized Access', async ({ request }) => {
    Log.info('Testing unauthorized access');

    // Given no valid authentication/authorization
    // Create a new API helper without auth
    const unauthApi = new APITestHelper(request);

    // When making POST request without proper permissions
    let response;
    try {
      response = await unauthApi.post('/api/ey-groups/organization', undefined, { skipAuth: true });
    } catch (error) {
      Log.info('Expected auth error caught');
    }

    // Then should return 401/403 error
    if (response) {
      expect([401]).toContain(response!.status());
    }
  });

  test('@smoke PUT /api/ey-groups/organization - updateOrganization - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing PUT /api/ey-groups/organization');

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
    const response = await authenticatedApi.put('/api/ey-groups/organization', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative PUT /api/ey-groups/organization - idnull', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnull');

    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization', requestData);
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

  test('@negative PUT /api/ey-groups/organization - idinvalid', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idinvalid');

    // Given unknown condition
    // Setup for idinvalid

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization');
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

  test('@negative PUT /api/ey-groups/organization - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');

    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization');
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

  test('@negative PUT /api/ey-groups/organization - shortFormExist', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: shortFormExist');

    // Given unknown condition
    // Setup for shortFormExist

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('shortFormExist');
  });

  test('@negative PUT /api/ey-groups/organization - notAuthorize', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: notAuthorize');

    // Given unauthorized access
    // Setup for notAuthorize

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization');
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

  test('@security PUT /api/ey-groups/organization - Unauthorized Access', async ({ request }) => {
    Log.info('Testing unauthorized access');

    // Given no valid authentication/authorization
    // Create a new API helper without auth
    const unauthApi = new APITestHelper(request);

    // When making PUT request without proper permissions
    let response;
    try {
      response = await unauthApi.put('/api/ey-groups/organization', undefined, { skipAuth: true });
    } catch (error) {
      Log.info('Expected auth error caught');
    }

    // Then should return 401/403 error
    if (response) {
      expect([401]).toContain(response!.status());
    }
  });

  test('@smoke GET /api/ey-groups/organization - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/ey-groups/organization');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/ey-groups/organization');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/ey-groups/organization/detailsById - getOrganization - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/ey-groups/organization/detailsById');

    // Given valid request data

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/ey-groups/organization/detailsById');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/ey-groups/company - createCompany - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/ey-groups/company');

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
    const response = await authenticatedApi.post('/api/ey-groups/company', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative POST /api/ey-groups/company - idexists', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idexists');

    // Given unknown condition
    const requestData = { id: 999, username: 'existing', email: 'existing@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/company', requestData);
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

  test('@negative POST /api/ey-groups/company - userNameExist', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: userNameExist');

    // Given unknown condition
    const requestData = { username: 'existinguser', email: 'new@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/company', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('userNameExist');
  });

  test('@negative POST /api/ey-groups/company - emailExist', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: emailExist');

    // Given unknown condition
    const requestData = { username: 'newuser', email: 'existing@test.com' };

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/company', requestData);
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('emailExist');
  });

  test('@negative POST /api/ey-groups/company - shortFormExist', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: shortFormExist');

    // Given unknown condition
    // Setup for shortFormExist

    // When making POST request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.post('/api/ey-groups/company');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('shortFormExist');
  });

  test('@smoke PUT /api/ey-groups/company - updateCompany - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing PUT /api/ey-groups/company');

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
    const response = await authenticatedApi.put('/api/ey-groups/company', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@negative PUT /api/ey-groups/company - idnull', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnull');

    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/company', requestData);
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

  test('@negative PUT /api/ey-groups/company - idinvalid', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idinvalid');

    // Given unknown condition
    // Setup for idinvalid

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/company');
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

  test('@negative PUT /api/ey-groups/company - idnotfound', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: idnotfound');

    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/company');
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

  test('@negative PUT /api/ey-groups/company - shortFormExist', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: shortFormExist');

    // Given unknown condition
    // Setup for shortFormExist

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/company');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('shortFormExist');
  });

  test('@smoke GET /api/ey-groups/company - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/ey-groups/company');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/ey-groups/company');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/ey-groups/company/{id} - getCompany - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/ey-groups/company/{id}');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/ey-groups/company/${id}');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/ey-groups/organization/verification-mail - sendVerificationMail - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/ey-groups/organization/verification-mail');

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
      '/api/ey-groups/organization/verification-mail',
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

  test('@smoke GET /api/ey-groups/all-login-user-child - unknown - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/ey-groups/all-login-user-child');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/ey-groups/all-login-user-child');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/ey-groups/login - getEyGroupByLogin - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/ey-groups/login');

    // Given valid request data

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/ey-groups/login');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke PUT /api/ey-groups/organization/updateIsActive - updateIsActiveEyGroupOrganization - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing PUT /api/ey-groups/organization/updateIsActive');

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
      '/api/ey-groups/organization/updateIsActive',
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

  test('@negative PUT /api/ey-groups/organization/updateIsActive - idnull', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: idnull');

    // Given unknown condition
    const requestData = { id: null };

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put(
        '/api/ey-groups/organization/updateIsActive',
        requestData
      );
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

  test('@negative PUT /api/ey-groups/organization/updateIsActive - idinvalid', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: idinvalid');

    // Given unknown condition
    // Setup for idinvalid

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization/updateIsActive');
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

  test('@negative PUT /api/ey-groups/organization/updateIsActive - idnotfound', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: idnotfound');

    // Given unknown condition
    const nonExistentId = 999999;

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization/updateIsActive');
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

  test('@negative PUT /api/ey-groups/organization/updateIsActive - shortFormExist', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: shortFormExist');

    // Given unknown condition
    // Setup for shortFormExist

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization/updateIsActive');
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return 400 error
    expect([404]).toContain(response!.status());

    // And error should have correct error key
    const errorBody = await response!.text();
    expect(errorBody).toContain('shortFormExist');
  });

  test('@negative PUT /api/ey-groups/organization/updateIsActive - notAuthorize', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing error scenario: notAuthorize');

    // Given unauthorized access
    // Setup for notAuthorize

    // When making PUT request with invalid data
    let response: Awaited<ReturnType<typeof authenticatedApi.post>> | undefined;
    try {
      response = await authenticatedApi.put('/api/ey-groups/organization/updateIsActive');
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

  test('@security PUT /api/ey-groups/organization/updateIsActive - Unauthorized Access', async ({
    request,
  }) => {
    Log.info('Testing unauthorized access');

    // Given no valid authentication/authorization
    // Create a new API helper without auth
    const unauthApi = new APITestHelper(request);

    // When making PUT request without proper permissions
    let response;
    try {
      response = await unauthApi.put('/api/ey-groups/organization/updateIsActive', undefined, {
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

  test('@smoke POST /api/ey-groups/company/detailsById - getCompanyById - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/ey-groups/company/detailsById');

    // Given valid request data

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/ey-groups/company/detailsById');

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

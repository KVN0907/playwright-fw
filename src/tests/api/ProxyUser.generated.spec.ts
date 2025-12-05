import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for ProxyUserController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\security\src\main\java\com\ey\compliance\service\web\rest\ProxyUserController.java
 * Base Path: /api
 */

test.describe('ProxyUserController API Tests', () => {
  test('GET /api/proxy-users/disable-proxy-user - disableProxyUser', async ({ request }) => {
    // Given no parameters required

    // When disable existing proxy user
    const response = await request.get(`/api/proxy-users/disable-proxy-user`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/proxy-users/set-proxy-user - createProxyUser', async ({ request }) => {
    // Given valid request data

    // When create new proxy user
    const requestData = {
      id: 1,
      name: 'Test ProxyUserCreateRequest',
    };
    const response = await request.post(`/api/proxy-users/set-proxy-user`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

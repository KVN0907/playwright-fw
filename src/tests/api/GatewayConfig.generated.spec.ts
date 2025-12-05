import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for GatewayConfigController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\gateway\src\main\java\com\ey\ct\wlms\web\rest\GatewayConfigController.java
 * Base Path: /api
 */

test.describe('GatewayConfigController API Tests', () => {
  test('GET /api - seed', async ({ request }) => {
    // Given no parameters required

    // When test seed
    const response = await request.get(`/api`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api - read', async ({ request }) => {
    // Given no parameters required

    // When test read
    const response = await request.get(`/api`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api - write', async ({ request }) => {
    // Given valid request data

    // When test write
    const requestData = {
      id: 1,
      name: 'Test Gateway',
    };
    const response = await request.post(`/api`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

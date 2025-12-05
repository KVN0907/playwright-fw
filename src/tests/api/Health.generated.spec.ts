import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for HealthController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\security\src\main\java\com\ey\compliance\service\web\rest\HealthController.java
 * Base Path: /health
 */

test.describe('HealthController API Tests', () => {
  test('GET /health - unknown', async ({ request }) => {
    // Given no parameters required

    // When test unknown
    const response = await request.get(`/health`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /health/detailed - unknown', async ({ request }) => {
    // Given no parameters required

    // When test unknown
    const response = await request.get(`/health/detailed`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /health/ping - ping', async ({ request }) => {
    // Given no parameters required

    // When test ping
    const response = await request.get(`/health/ping`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /health/ready - unknown', async ({ request }) => {
    // Given no parameters required

    // When test unknown
    const response = await request.get(`/health/ready`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /health/live - unknown', async ({ request }) => {
    // Given no parameters required

    // When test unknown
    const response = await request.get(`/health/live`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

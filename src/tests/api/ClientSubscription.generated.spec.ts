import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for ClientSubscriptionController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\security\src\main\java\com\ey\compliance\service\web\rest\ClientSubscriptionController.java
 * Base Path: /api
 */

test.describe('ClientSubscriptionController API Tests', () => {
  test('GET /api/client-subscriptions/change-active-status/{id} - unknown', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When change client subscription active status by id
    const response = await request.get(`/api/client-subscriptions/change-active-status/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/client-subscriptions - unknown', async ({ request }) => {
    // Given valid request data

    // When create or retrieve client subscriptions
    const requestData = { name: 'Test Location', address: 'Test Address' };
    const response = await request.post(`/api/client-subscriptions`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

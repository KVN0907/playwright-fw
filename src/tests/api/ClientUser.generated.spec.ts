import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for ClientUserController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\security\src\main\java\com\ey\compliance\service\web\rest\ClientUserController.java
 * Base Path: /api
 */

test.describe('ClientUserController API Tests', () => {
  test('GET /api/client-users - unknown', async ({ request }) => {
    // Given no parameters required

    // When get all client users
    const response = await request.get(`/api/client-users`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/client-users/{id} - getClientUserById', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When get client user by id
    const response = await request.get(`/api/client-users/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/client-users/change-active-status/{id} - changeUserActiveStatus', async ({
    request,
  }) => {
    // Given valid id
    const id = 1;

    // When change user active status by id
    const response = await request.get(`/api/client-users/change-active-status/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/client-users - createClientUser', async ({ request }) => {
    // Given valid request data

    // When create new client user
    const requestData = { name: 'Test Location', address: 'Test Address' };
    const response = await request.post(`/api/client-users`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/client-users/paginated - unknown', async ({ request }) => {
    // Given valid request data

    // When get list of client users for pagination
    const requestData = { name: 'Test Location', address: 'Test Address' };
    const response = await request.post(`/api/client-users/paginated`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/client-users/bulk - bulkCreateClientUsers', async ({ request }) => {
    // Given valid request data

    // When bulk create client users
    const requestData = {
      id: 1,
      name: 'Test ClientUserBulkCreateRequest',
    };
    const response = await request.post(`/api/client-users/bulk`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PUT /api/client-users - updateClientUser', async ({ request }) => {
    // Given valid

    // When update existing client user
    const response = await request.put(`/api/client-users`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('DELETE /api/client-users/{id} - deleteClientUser', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When delete client user by id
    const response = await request.delete(`/api/client-users/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

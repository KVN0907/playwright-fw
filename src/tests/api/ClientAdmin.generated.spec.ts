import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for ClientAdminController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\security\src\main\java\com\ey\compliance\service\web\rest\ClientAdminController.java
 * Base Path: /api
 */

test.describe('ClientAdminController API Tests', () => {
  test('GET /api/client-admins - unknown', async ({ request }) => {
    // Given no parameters required

    // When get all client admins
    const response = await request.get(`/api/client-admins`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/client-admins/{id} - getClientAdminById', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When get client admin by id
    const response = await request.get(`/api/client-admins/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/client-admins/change-active-status/{id} - changeUserActiveStatus', async ({
    request,
  }) => {
    // Given valid id
    const id = 1;

    // When change user active status by id
    const response = await request.get(`/api/client-admins/change-active-status/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/client-admins - createClientAdmin', async ({ request }) => {
    // Given valid request data

    // When create new client admin
    const requestData = {
      id: 1,
      name: 'Test ClientAdminCreateRequest',
    };
    const response = await request.post(`/api/client-admins`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PUT /api/client-admins - updateClientAdmin', async ({ request }) => {
    // Given valid update data

    // When update existing client admin
    const requestData = {
      id: 1,
      name: 'Test ClientAdminUpdateRequest',
    };
    const response = await request.put(`/api/client-admins`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('DELETE /api/client-admins/{id} - deleteEyAdmin', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When delete client admin by id
    const response = await request.delete(`/api/client-admins/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

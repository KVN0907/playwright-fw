import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for ClientController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\security\src\main\java\com\ey\compliance\service\web\rest\ClientController.java
 * Base Path: /api
 */

test.describe('ClientController API Tests', () => {
  test('GET /api/clients - unknown', async ({ request }) => {
    // Given no parameters required

    // When get all clients
    const response = await request.get(`/api/clients`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/clients/{id} - getClientById', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When get client by id
    const response = await request.get(`/api/clients/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/clients/change-active-status/{id} - changeClientActiveStatus', async ({
    request,
  }) => {
    // Given valid id
    const id = 1;

    // When change client active status by id
    const response = await request.get(`/api/clients/change-active-status/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/clients/assigned-client - getAssignedClient', async ({ request }) => {
    // Given no parameters required

    // When change client active status by id
    const response = await request.get(`/api/clients/assigned-client`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/clients - createClient', async ({ request }) => {
    // Given valid request data

    // When create new client
    const requestData = {
      id: 1,
      name: 'Test ClientCreateRequest',
    };
    const response = await request.post(`/api/clients`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/clients/paginated - unknown', async ({ request }) => {
    // Given valid request data

    // When get list of clients for pagination
    const requestData = { name: 'Test Location', address: 'Test Address' };
    const response = await request.post(`/api/clients/paginated`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PUT /api/clients - updateClient', async ({ request }) => {
    // Given valid update data

    // When update existing client
    const requestData = {
      id: 1,
      name: 'Test ClientUpdateRequest',
    };
    const response = await request.put(`/api/clients`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

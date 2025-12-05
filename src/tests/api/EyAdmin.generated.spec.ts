import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for EyAdminController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\security\src\main\java\com\ey\compliance\service\web\rest\EyAdminController.java
 * Base Path: /api
 */

test.describe('EyAdminController API Tests', () => {
  test('GET /api/ey-admins - unknown', async ({ request }) => {
    // Given no parameters required

    // When get all ey admins
    const response = await request.get(`/api/ey-admins`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/ey-admins/{id} - getEyAdminById', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When get ey admin by id
    const response = await request.get(`/api/ey-admins/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /api/ey-admins/change-active-status/{id} - changeUserActiveStatus', async ({
    request,
  }) => {
    // Given valid id
    const id = 1;

    // When change user active status by id
    const response = await request.get(`/api/ey-admins/change-active-status/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/ey-admins - createEyAdmin', async ({ request }) => {
    // Given valid request data

    // When create new ey admin
    const requestData = {
      id: 1,
      name: 'Test EyAdminCreateRequest',
    };
    const response = await request.post(`/api/ey-admins`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/ey-admins/paginated - unknown', async ({ request }) => {
    // Given valid request data

    // When get list of ey admins for pagination
    const requestData = { name: 'Test Location', address: 'Test Address' };
    const response = await request.post(`/api/ey-admins/paginated`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/ey-admins/search-active-by-name - unknown', async ({ request }) => {
    // Given valid request data

    // When get all active ey admins by name
    const requestData = {
      id: 1,
      name: 'Test NameLikeSearchRequest',
    };
    const response = await request.post(`/api/ey-admins/search-active-by-name`, {
      data: requestData,
    });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PUT /api/ey-admins - updateEyAdmin', async ({ request }) => {
    // Given valid update data

    // When update existing ey admin
    const requestData = {
      id: 1,
      name: 'Test EyAdminUpdateRequest',
    };
    const response = await request.put(`/api/ey-admins`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('DELETE /api/ey-admins/{id} - deleteEyAdmin', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When delete ey admin by id
    const response = await request.delete(`/api/ey-admins/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

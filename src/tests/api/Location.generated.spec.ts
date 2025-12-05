import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for LocationController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\compliancemanager\src\main\java\com\ey\compliance\service\web\rest\LocationController.java
 * Base Path: /locations
 */

test.describe('LocationController API Tests', () => {
  test('GET /locations/{id} - getLocationById', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When get location by id
    const response = await request.get(`/locations/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /locations - unknown', async ({ request }) => {
    // Given no parameters required

    // When get all locations
    const response = await request.get(`/locations`, {
      params: { searchTerm: 'test-string', countryId: '1' },
    });

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /locations/client/{clientTenantId} - unknown', async ({ request }) => {
    // Given valid clientTenantId
    const clientTenantId = 1;

    // When get locations by client
    const response = await request.get(`/locations/client/${clientTenantId}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /locations/organization/{hierarchyId} - unknown', async ({ request }) => {
    // Given valid hierarchyId
    const hierarchyId = 1;

    // When get locations by organization
    const response = await request.get(`/locations/organization/${hierarchyId}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /locations/template/download - downloadTemplate', async ({ request }) => {
    // Given no parameters required

    // When download location template
    const response = await request.get(`/locations/template/download`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /locations - bulkUploadLocations', async ({ request }) => {
    // Given valid request data

    // When bulk upload locations
    const requestData = { name: 'Test Location', address: 'Test Address' };
    const response = await request.post(`/locations`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PUT /locations - updateLocation', async ({ request }) => {
    // Given valid update data

    // When update a location
    const requestData = {
      id: 1,
      name: 'Test LocationUpdateDTO',
    };
    const response = await request.put(`/locations`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PUT /locations/{id}/activate - activateLocation', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When activate location
    const response = await request.put(`/locations/${id}/activate`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PUT /locations/{id}/deactivate - deactivateLocation', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When deactivate location
    const response = await request.put(`/locations/${id}/deactivate`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PUT /locations/tag-organization - tagOrganizationToLocation', async ({ request }) => {
    // Given valid update data

    // When tag organization to location
    const requestData = {
      id: 1,
      name: 'Test LocationTagOrganizationDTO',
    };
    const response = await request.put(`/locations/tag-organization`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('DELETE /locations/{id} - deleteLocation', async ({ request }) => {
    // Given valid id
    const id = 1;

    // When delete location
    const response = await request.delete(`/locations/${id}`);

    // Then should return success with no content
    expect(response.status()).toBe(204);
  });

  test('DELETE /locations/{id}/organization-mapping - removeOrganizationMapping', async ({
    request,
  }) => {
    // Given valid id
    const id = 1;

    // When remove organization mapping
    const response = await request.delete(`/locations/${id}/organization-mapping`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

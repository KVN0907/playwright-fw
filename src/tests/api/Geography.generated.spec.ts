import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for GeographyController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\compliancemanager\src\main\java\com\ey\compliance\service\web\rest\GeographyController.java
 * Base Path: /geography
 */

test.describe('GeographyController API Tests', () => {
  test('GET /geography/countries - unknown', async ({ request }) => {
    // Given no parameters required

    // When get all countries
    const response = await request.get(`/geography/countries`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /geography/countries/{countryId}/states - unknown', async ({ request }) => {
    // Given valid countryId
    const countryId = 1;

    // When get states by country
    const response = await request.get(`/geography/countries/${countryId}/states`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /geography/states/{stateId}/cities - unknown', async ({ request }) => {
    // Given valid stateId
    const stateId = 1;

    // When get cities by state
    const response = await request.get(`/geography/states/${stateId}/cities`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('GET /geography/countries/assigned/{clientTenantId} - unknown', async ({ request }) => {
    // Given valid clientTenantId
    const clientTenantId = 1;

    // When get assigned countries for client
    const response = await request.get(`/geography/countries/assigned/${clientTenantId}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

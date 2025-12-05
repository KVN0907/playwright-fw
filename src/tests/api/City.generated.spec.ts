import { test, expect } from '../fixtures/advancedFixtures';

/**
 * API Tests for CityController
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\security\src\main\java\com\ey\compliance\service\web\rest\CityController.java
 * Base Path: /api
 */

test.describe('CityController API Tests', () => {
  test('POST /api/cities/search-by-name - unknown', async ({ request }) => {
    // Given valid request data

    // When get all cities by name
    const requestData = {
      id: 1,
      name: 'Test NameLikeSearchRequest',
    };
    const response = await request.post(`/api/cities/search-by-name`, { data: requestData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();
  });
});

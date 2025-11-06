import { test, expect } from '../fixtures/advancedFixtures';
import urls from './endPointsDTO/uri.json';

test.describe('MW/API - GET Account Details', () => {
  test('GET Account Details of the Logged In User', async ({ apiHelper }) => {
    // Make API call
    const response = await apiHelper.get(urls.getAccountDetails);

    // Basic validations
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    console.log('API Response:', JSON.stringify(responseBody, null, 2));

    // Simple assertions
    expect(responseBody).toBeDefined();
    expect(responseBody.id).toBeTruthy();
    expect(responseBody.email).toBeTruthy();
  });

  test('GET Account Details - Negative: Invalid Endpoint', async ({ apiHelper }) => {
    // Test with invalid endpoint
    const response = await apiHelper.get('/invalid-endpoint');

    // Should get 404
    expect(response.status()).toBe(404);
    console.log('Expected 404 response received');
  });
});

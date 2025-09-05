import { test, expect } from '@playwright/test';
import { HomePage } from '../uiTests/pageObjects/HomePage';
import urls from '../apiTests/endPointsDTO/uri.json';

test.describe('MW/API- Fetch Session ID and GET Account details', () => {
  let homePage: HomePage;
  let baseUrl: string;

  test.beforeEach(async ({ page }) => {
    // Assuming storageState.json is already specified in playwright.config.ts
    homePage = new HomePage(page);
     const ENV = process.env.NODE_ENV || 'dev';
    // Construct the account details URL
    baseUrl = process.env[`${ENV.toUpperCase()}_APP_URL`] || '';
  if (!baseUrl) {
    console.log(`Warning: ${ENV.toUpperCase()}_APP_URL not found, trying APP_URL fallback`);
    baseUrl = process.env.APP_URL || '';
  }
  });

  test('GET Account Details of the Logged In User', async ({ page }) => {
    
    
    const accountDetailsUrl = `${baseUrl}${urls.getAccountDetails}`;
    console.log(`baseUrl: ${baseUrl}`);
    console.log(`Endpoint: ${urls.getAccountDetails}`);

    // Use the session cookie in the API request
    const response = await page.request.get(accountDetailsUrl);

    // Log the API response
    console.log('API Response:', JSON.stringify(response, null, 2));

    // Assert that the response status is 200
    expect(response.status()).toBe(200);
  });
});

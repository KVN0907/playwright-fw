import { test, expect } from '@playwright/test';
import { HomePage } from '../uiTests/pageObjects/HomePage';
import urls from '../apiTests/endPointsDTO/uri.json';

test.describe('MW/API- Fetch Session ID and GET Account details', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    // Assuming storageState.json is already specified in playwright.config.ts
    homePage = new HomePage(page);
  });

  test('GET Account Details of the Logged In User', async ({ page }) => {
    // Navigate to the home page and verify the banner text
    await page.goto('/');
    const expectedText = process.env.DEV_SSO_USERNAME;
    if (!expectedText) {
      throw new Error('DEV_SSO_USERNAME environment variable is not set.');
    }
    //await homePage.verifyBannerText(expectedText);

    // Construct the account details URL
    const baseUrl = process.env.DEV_BASE_URL || 'https://saasifier-dev.ey.com/';
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

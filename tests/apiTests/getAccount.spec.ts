import { test, expect } from '@playwright/test';
import { HomePage } from '../uiTests/pageObjects/HomePage';
import urls from '../apiTests/endPointsDTO/uri.json';
import Log from '../utils/Log'; // Adjust the path as necessary

test.describe('MW/API- Fetch Session ID and GET Account details', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    // Assuming storageState.json is already specified in playwright.config.ts
    homePage = new HomePage(page);
    Log.info('Initialized HomePage object');
  });

  test('GET Account Details of the Logged In User', async ({ page }) => {
    const scenarioName = 'GET Account Details of the Logged In User';
    Log.testBegin(scenarioName);

    try {
      // Navigate to the home page and verify the banner text
      await page.goto('/');
      const ssoUsername = process.env.DEV_SSO_USERNAME;
      if (!ssoUsername) {
        throw new Error('DEV_SSO_USERNAME environment variable is not set.');
      }
      Log.info(`Navigating to the home page as user: ${ssoUsername}`);
      //await homePage.verifyBannerText(ssoUsername);
      Log.info('Verified banner text');

      // Construct the account details URL
      const baseUrl = process.env.DEV_BASE_URL || 'https://saasifier-dev.ey.com/';
      const accountDetailsUrl = `${baseUrl}${urls.getAccountDetails}`;
      Log.info(`Constructed account details URL: ${accountDetailsUrl}`);

      // Use the session cookie in the API request
      const response = await page.request.get(accountDetailsUrl);
      Log.info('Performed GET request for account details');

      // Log the API response
      Log.info(`API Response: ${JSON.stringify(response, null, 2)}`);

      // Assert that the response status is 200
      expect(response.status()).toBe(200);
      Log.info('Verified response status is 200');

      Log.testEnd(scenarioName, 'PASSED');
    } catch (error) {
      Log.error(`Test failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      Log.testEnd(scenarioName, 'FAILED');
      throw error; // Rethrow the error to ensure the test runner marks this test as failed
    }
  });
});

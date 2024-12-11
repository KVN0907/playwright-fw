import { test } from '@playwright/test';
import { HomePage } from '../pageObjects/HomePage';
import Log from '../../utils/Log'; // Adjust the path as necessary

test('Home page test', async ({ page }) => {
  const scenarioName = 'Home page test';
  Log.testBegin(scenarioName);

  // Check if the SSO_USERNAME environment variable is set before starting the test
  const ssoUsername = process.env.DEV_SSO_USERNAME;
  if (!ssoUsername) {
    Log.error('SSO_USERNAME environment variable is not set.');
    throw new Error('SSO_USERNAME environment variable is not set.');
  }

  try {
    Log.info('Navigating to the home page');
    await page.goto('/');

    const homePage = new HomePage(page);

    Log.info('Verifying banner text');
    await homePage.verifyBannerText(ssoUsername);

    Log.info('Verifying heading text');
    await homePage.verifyHeadingText(`Good Day, ${ssoUsername}!`);

    Log.info('Navigating to setup');
    await homePage.navigateToSetup();

    Log.testEnd(scenarioName, 'PASSED');
  } catch (error) {
    Log.error(`Test failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    Log.testEnd(scenarioName, 'FAILED');
    throw error; // Rethrow the error to ensure the test runner marks this test as failed
  }
});

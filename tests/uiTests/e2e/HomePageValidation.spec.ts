import { test } from '@playwright/test';
import { HomePage } from '../pageObjects/HomePage';

test('Home page test', async ({ page }) => {
  await page.goto("/")
  const homePage = new HomePage(page);
  const expectedText = process.env.DEV_SSO_USERNAME;
  if (!expectedText) {
    throw new Error('SSO_USERNAME environment variable is not set.');
  }
  await homePage.verifyBannerText(expectedText);
  await homePage.verifyHeadingText(`Good Day, ${expectedText}!`);
  await homePage.navigateToSetup();
});

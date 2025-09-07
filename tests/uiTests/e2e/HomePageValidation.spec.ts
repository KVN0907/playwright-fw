import { test, expect } from '@playwright/test';
import { HomePage } from '../pageObjects/HomePage';

test.describe('Home Page Validation Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    // Initialize page object
    homePage = new HomePage(page);

    // Navigate to home page - authentication should already be loaded from auth.json
    await page.goto('/');
  });

  test('Home page test', async ({ page: _page }) => {
    const environment = process.env.NODE_ENV || 'dev';
    const username = environment === 'qa' ? process.env.QA_USERNAME : process.env.DEV_USERNAME;

    if (!username) {
      throw new Error(`USERNAME environment variable is not set for ${environment} environment.`);
    }

    await homePage.verifyBannerText(`Good Day.`);
  });

  test('Navigate to Control Definition Libraries', async ({ page }) => {
    await homePage.navigateToControlDefinitionLibraries();
    // Add verification that we're on the correct page
    await expect(page).toHaveURL(/.*control.*definition.*libraries.*/i);
  });

  test('Navigate to Approval section', async ({ page }) => {
    await homePage.navigateToApproval();
    // Add verification that we're on the correct page
    await expect(page).toHaveURL(/.*approval.*/i);
  });

  test('Navigate to Maintenance section', async ({ page }) => {
    await homePage.navigateToMaintenance();
    // Add verification that we're on the correct page
    await expect(page).toHaveURL(/.*maintenance.*/i);
  });
});

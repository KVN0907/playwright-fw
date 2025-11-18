import { test, expect } from '../../fixtures/advancedFixtures';
import { HomePage } from '../../../pages/common/HomePage';

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
});

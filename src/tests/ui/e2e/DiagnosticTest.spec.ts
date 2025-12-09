import { test, expect } from '../../fixtures/advancedFixtures';
import Log from '../../../lib/utils/Log';

test.describe('Diagnostic Tests', () => {
  test('Check page state and authentication', async ({ page }) => {
    Log.info('=== DIAGNOSTIC TEST START ===');

    // Navigate to home page
    Log.info('Navigating to home page...');
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot for debugging
    await page.screenshot({ path: 'diagnostic-page.png', fullPage: true });

    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    Log.info(`Page title: ${title}`);
    Log.info(`Page URL: ${url}`);

    // Check for error messages - use first() to handle multiple h1 elements
    const errorHeading = page.locator('h1').first();
    const errorExists = await errorHeading.isVisible();
    if (errorExists) {
      const errorText = await errorHeading.textContent();
      Log.error(`Error found on page: ${errorText}`);
    }

    // Check for login elements
    const loginButton = page.locator('button:has-text("Login")');
    const loginExists = await loginButton.isVisible();
    if (loginExists) {
      Log.error('Login button found - authentication may have failed');
    }

    // Check for main content elements
    const mainContent = page.locator('main, .main, #main, [role="main"]');
    const contentExists = await mainContent.isVisible();
    Log.info(`Main content visible: ${contentExists}`);

    // Log all h1, h2, h3 elements
    const headings = await page.locator('h1, h2, h3').allTextContents();
    Log.info(`Headings found: ${JSON.stringify(headings)}`);

    // Check for banner/welcome text
    const bannerElements = await page.locator('div, span, p').allTextContents();
    const welcomeTexts = bannerElements.filter(
      text =>
        text.includes('Good Day') ||
        text.includes('Welcome') ||
        text.includes('superadmin') ||
        text.toLowerCase().includes('dashboard')
    );
    Log.info(`Welcome/Banner texts found: ${JSON.stringify(welcomeTexts)}`);

    // Get page HTML for analysis
    const pageContent = await page.content();
    Log.info(
      `Page contains login form: ${pageContent.includes('form') && pageContent.includes('password')}`
    );
    Log.info(
      `Page contains authentication elements: ${pageContent.includes('auth') || pageContent.includes('login')}`
    );

    Log.info('=== DIAGNOSTIC TEST END ===');

    // This test should not fail - it's for diagnostics only
    expect(true).toBe(true);
  });
});

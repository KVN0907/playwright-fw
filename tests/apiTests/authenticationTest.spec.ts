import { test, expect } from '@playwright/test';
import { AuthenticationManager } from '../utils/AuthenticationManager';
import Log from '../utils/Log';

test.describe('Multi-Authentication Tests', () => {
  test('Verify AuthenticationManager loads correct auth type', async () => {
    Log.info('=== Testing AuthenticationManager Configuration ===');

    const authManager = AuthenticationManager.getInstance();
    const authType = authManager.getAuthType();

    Log.info(`Auth Type: ${authType}`);

    // Verify we have a valid auth type
    expect([
      'browser_session',
      'bearer_token',
      'jwt_token',
      'api_key',
      'basic_auth',
      'oauth2',
      'custom_headers',
    ]).toContain(authType);

    Log.info('✅ AuthenticationManager configuration is valid');
  });

  test('Verify browser session authentication works', async ({ page }) => {
    Log.info('=== Testing Browser Session Authentication ===');

    const authManager = AuthenticationManager.getInstance();
    const authType = authManager.getAuthType();

    if (authType === 'browser_session') {
      Log.info('Testing browser session authentication...');

      // Navigate to the application
      await page.goto(
        process.env.QA_APP_URL || process.env.APP_URL || 'https://infinity-qa.ey.com/'
      );

      // Check if we're already authenticated (from global setup)
      const title = await page.title();
      Log.info(`Page title: ${title}`);

      // If we see login page, authenticate
      if (title.toLowerCase().includes('login') || title.toLowerCase().includes('sign in')) {
        Log.info('Not authenticated, performing login...');
        await authManager.authenticate(page);
      } else {
        Log.info('Already authenticated from global setup');
      }

      // Verify we're authenticated by checking page title or URL
      const finalTitle = await page.title();
      const finalUrl = page.url();

      Log.info(`Final page title: ${finalTitle}`);
      Log.info(`Final page URL: ${finalUrl}`);

      // Should not be on login page anymore
      expect(finalTitle.toLowerCase()).not.toContain('login');
      expect(finalTitle.toLowerCase()).not.toContain('sign in');

      Log.info('✅ Browser session authentication successful');
    } else {
      test.skip(true, 'Skipping browser session test - different auth type configured');
    }
  });

  test('Verify API authentication headers are set correctly', async ({ page }) => {
    Log.info('=== Testing API Authentication Headers ===');

    const authManager = AuthenticationManager.getInstance();
    const authType = authManager.getAuthType();

    Log.info(`Testing with auth type: ${authType}`);

    // For browser session, we need to authenticate first
    if (authType === 'browser_session') {
      await page.goto(
        process.env.QA_APP_URL || process.env.APP_URL || 'https://infinity-qa.ey.com/'
      );
      const title = await page.title();

      if (title.toLowerCase().includes('login') || title.toLowerCase().includes('sign in')) {
        await authManager.authenticate(page);
      }
    }

    // Get auth headers
    const authHeaders = await authManager.getAuthHeaders();
    Log.info(`Auth headers count: ${Object.keys(authHeaders).length}`);

    if (authType === 'browser_session') {
      // For browser session, we rely on cookies
      const cookies = await page.context().cookies();
      Log.info(`Available cookies count: ${cookies.length}`);

      // Should have some authentication cookies
      expect(cookies.length).toBeGreaterThan(0);

      const authCookies = cookies.filter(
        cookie =>
          cookie.name.toLowerCase().includes('session') ||
          cookie.name.toLowerCase().includes('auth') ||
          cookie.name.toLowerCase().includes('token')
      );

      Log.info(`Authentication cookies found: ${authCookies.map(c => c.name).join(', ')}`);
      expect(authCookies.length).toBeGreaterThan(0);
    } else {
      // For other auth types, we should have headers
      expect(Object.keys(authHeaders).length).toBeGreaterThan(0);

      // Check for common auth headers
      const hasAuthHeader =
        authHeaders['Authorization'] ||
        authHeaders['X-API-Key'] ||
        authHeaders['Bearer'] ||
        Object.keys(authHeaders).some(key => key.toLowerCase().includes('auth'));

      expect(hasAuthHeader).toBeTruthy();
    }

    Log.info('✅ API authentication headers verification successful');
  });

  test('Verify environment configuration is loaded correctly', async () => {
    Log.info('=== Testing Environment Configuration ===');

    const authManager = AuthenticationManager.getInstance();
    const authType = authManager.getAuthType();

    // Check required environment variables are loaded
    expect(process.env.NODE_ENV).toBeTruthy();
    expect(authType).toBeTruthy();

    Log.info(`Environment: ${process.env.NODE_ENV}`);
    Log.info(`Auth Type: ${authType}`);

    // Verify the auth type is valid
    const validAuthTypes = [
      'browser_session',
      'bearer_token',
      'jwt_token',
      'api_key',
      'basic_auth',
      'oauth2',
      'custom_headers',
    ];

    expect(validAuthTypes).toContain(authType);

    Log.info('✅ Environment configuration verification successful');
  });
});

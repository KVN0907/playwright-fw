import { test, expect } from '@playwright/test';
import { ConfigManager } from '../utils/ConfigManager';
import { AuthenticationManager } from '../utils/AuthenticationManager';
import Log from '../utils/Log';
import urls from './endPointsDTO/uri.json';

test.describe('API Tests - Account Management', () => {
  let configManager: ConfigManager;
  let authManager: AuthenticationManager;
  let baseUrl: string;

  test.beforeEach(async ({ page }) => {
    // Initialize managers
    configManager = ConfigManager.getInstance();
    authManager = AuthenticationManager.getInstance();

    // Get environment-specific base URL
    baseUrl = configManager.getBaseURL();

    Log.info('=== API Test Setup ===');
    Log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    Log.info(`Base URL: ${baseUrl}`);
    Log.info(`API URL: ${configManager.getApiURL()}`);
    Log.info(`Auth Type: ${authManager.getAuthType()}`);

    // For browser session auth, the global setup already handled authentication
    // For token-based auth, we need to authenticate here
    if (authManager.getAuthType() === 'browser_session') {
      Log.info('Using browser session authentication from global setup');

      // Navigate to application to establish session using existing auth state
      Log.info('Navigating to application to establish browser session');
      await page.goto(baseUrl, { waitUntil: 'networkidle' });

      // Verify we're logged in by checking for login indicators
      try {
        await page.waitForTimeout(2000);

        const pageTitle = await page.title();
        const pageUrl = page.url();
        Log.info(`Current page title: ${pageTitle}`);
        Log.info(`Current page URL: ${pageUrl}`);

        const loginIndicators = [
          'login',
          'sign-in',
          'authenticate',
          'auth',
          'username',
          'password',
          'sign in',
        ];

        const hasLoginIndicator = loginIndicators.some(
          indicator =>
            pageTitle.toLowerCase().includes(indicator) || pageUrl.toLowerCase().includes(indicator)
        );

        if (hasLoginIndicator) {
          Log.error('⚠️ CRITICAL: Detected login page - authentication from global setup failed!');
          throw new Error(
            'Authentication failed - still on login page after using auth state from global setup'
          );
        } else {
          Log.info('✅ Successfully navigated to application - session from global setup is valid');
        }
      } catch (error) {
        Log.error(`Error during session verification: ${error}`);
        throw error;
      }
    } else {
      // For non-browser auth types, authenticate using the configured method
      Log.info('Performing token-based authentication');
      const authResult = await authManager.authenticate(page, page.request);

      if (!authResult.success) {
        throw new Error(`Authentication failed: ${authResult.error}`);
      }

      Log.info('✅ Token-based authentication successful');
    }
  });

  test('GET Account Details of the Logged In User', async ({ page }) => {
    const scenarioName = 'GET Account Details';

    Log.info('=== Starting Account Details API Test ===');

    try {
      // Get authentication headers
      const authHeaders = authManager.getAuthHeaders();
      Log.info(`Auth headers count: ${Object.keys(authHeaders).length}`);

      // If using browser session, check cookies
      if (authManager.getAuthType() === 'browser_session') {
        const cookies = await page.context().cookies();
        Log.info(`Available cookies count: ${cookies.length}`);

        const importantCookies = cookies.filter(
          cookie =>
            cookie.name.includes('SESSION') ||
            cookie.name.includes('AUTH') ||
            cookie.name.includes('JSESSIONID')
        );
        Log.info(`Authentication cookies found: ${importantCookies.map(c => c.name).join(', ')}`);
      }

      // Construct the full API URL
      const fullApiUrl = `${baseUrl}${urls.getAccountDetails}`;
      Log.info(`Making API request to: ${fullApiUrl}`);
      Log.info(`Endpoint: ${urls.getAccountDetails}`);

      // Prepare headers with authentication
      const requestHeaders = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...authHeaders, // Add authentication headers
      };

      Log.info(`Request headers: ${JSON.stringify(requestHeaders, null, 2)}`);

      // Make the API request with appropriate authentication
      let response;

      if (authManager.getAuthType() === 'browser_session') {
        // Use page.request for browser session (includes cookies automatically)
        response = await page.request.get(fullApiUrl, {
          timeout: configManager.getTimeout(),
          ignoreHTTPSErrors: true,
          headers: requestHeaders,
        });
      } else {
        // Use request context for token-based auth
        response = await page.request.get(fullApiUrl, {
          timeout: configManager.getTimeout(),
          ignoreHTTPSErrors: true,
          headers: requestHeaders,
        });
      }

      Log.info(`✅ API Response Status: ${response.status()}`);
      Log.info(`Response Headers: ${JSON.stringify(response.headers(), null, 2)}`);

      // Handle authentication failures
      if (response.status() === 401) {
        Log.info('Received 401 Unauthorized - attempting to refresh authentication');

        // Try to refresh authentication
        const refreshSuccess = await authManager.refreshAuthIfNeeded(page.request);

        if (refreshSuccess) {
          Log.info('Authentication refreshed, retrying request');
          const newAuthHeaders = authManager.getAuthHeaders();
          const newRequestHeaders = {
            ...requestHeaders,
            ...newAuthHeaders,
          };

          response = await page.request.get(fullApiUrl, {
            timeout: configManager.getTimeout(),
            ignoreHTTPSErrors: true,
            headers: newRequestHeaders,
          });

          Log.info(`✅ Retry API Response Status: ${response.status()}`);
        } else {
          Log.error('Failed to refresh authentication');
        }
      }

      // Validate response status
      if (response.status() !== 200) {
        const responseText = await response.text();
        Log.error(`API call failed with status ${response.status()}`);
        Log.error(`Response body: ${responseText}`);
        throw new Error(
          `Expected status 200 but got ${response.status()}. Response: ${responseText}`
        );
      }

      // Get and validate response body for JSON content
      let responseBody;
      try {
        responseBody = await response.json();
        Log.info(`Response Body Type: ${typeof responseBody}`);
        Log.info(`Account Details Response: ${JSON.stringify(responseBody, null, 2)}`);
      } catch (parseError) {
        const responseText = await response.text();
        Log.error('Failed to parse response as JSON');
        Log.error(`Raw response: ${responseText}`);
        throw new Error(`Failed to parse JSON response: ${parseError}`);
      }

      // Validate response structure for account details
      expect(responseBody).toBeDefined();
      expect(response.status()).toBe(200);

      // Type guard and additional validations based on expected account structure
      if (responseBody && typeof responseBody === 'object') {
        // Check for common account properties
        if ('id' in responseBody) {
          expect(typeof responseBody.id).toBe('string');
          Log.info(`✅ Account ID: ${responseBody.id}`);
        }

        if ('login' in responseBody) {
          expect(typeof responseBody.login).toBe('string');
          expect(responseBody.login).toBeTruthy();
          Log.info(`✅ Account Login: ${responseBody.login}`);
        }

        if ('email' in responseBody) {
          expect(typeof responseBody.email).toBe('string');
          Log.info(`✅ Account Email: ${responseBody.email}`);
        }

        if ('role' in responseBody) {
          expect(typeof responseBody.role).toBe('string');
          Log.info(`✅ Account Role: ${responseBody.role}`);
        }

        if ('langKey' in responseBody) {
          expect(typeof responseBody.langKey).toBe('string');
          Log.info(`✅ Language Key: ${responseBody.langKey}`);
        }

        if ('activated' in responseBody) {
          expect(typeof responseBody.activated).toBe('boolean');
          Log.info(`✅ Account Activated: ${responseBody.activated}`);
        }
      } else {
        Log.error('Response body is not a valid object');
        throw new Error('Invalid response structure - expected object');
      }

      Log.info('=== Account Details API Test Completed Successfully ===');
    } catch (error) {
      Log.error(`❌ ${scenarioName} failed: ${error}`);

      // Add detailed error information for troubleshooting
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Expected status 200')) {
        Log.error('API call failed - this could be due to:');
        Log.error('1. Authentication session expired or invalid');
        Log.error('2. API endpoint URL is incorrect');
        Log.error('3. Server is returning an error');
        Log.error('4. CORS or other network issues');
      }

      throw error;
    }
  });
});

import { test, expect } from '@playwright/test';
import { ConfigManager } from '../utils/ConfigManager';
import Log from '../utils/Log';
import urls from './endPointsDTO/uri.json';

test.describe('API Tests - Account Management', () => {
  let configManager: ConfigManager;
  let baseUrl: string;

  test.beforeEach(async ({ page }) => {
    // Initialize configuration manager
    configManager = ConfigManager.getInstance();
    
    // Get environment-specific base URL
    baseUrl = configManager.getBaseURL();
    
    Log.info('=== API Test Setup ===');
    Log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    Log.info(`Base URL: ${baseUrl}`);
    Log.info(`API URL: ${configManager.getApiURL()}`);
    
    // Navigate to the application to establish/verify session
    Log.info('Navigating to application to establish session');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Verify we're logged in by checking for login indicators
    try {
      // Wait a bit for the page to fully load
      await page.waitForTimeout(2000);
      
      // Check if we're on login page or already authenticated
      const pageTitle = await page.title();
      const pageUrl = page.url();
      Log.info(`Current page title: ${pageTitle}`);
      Log.info(`Current page URL: ${pageUrl}`);
      
      // If we see login indicators, the session might be expired
      const loginIndicators = [
        'login', 'sign-in', 'authenticate', 'auth',
        'username', 'password', 'sign in'
      ];
      
      const hasLoginIndicator = loginIndicators.some(indicator => 
        pageTitle.toLowerCase().includes(indicator) || 
        pageUrl.toLowerCase().includes(indicator)
      );
      
      if (hasLoginIndicator) {
        Log.info('⚠️ WARNING: Detected login page - session may have expired');
        Log.info('Global setup should handle authentication, but session might need refresh');
      } else {
        Log.info('✅ Successfully navigated to application - session appears valid');
      }
    } catch (error) {
      Log.info(`Warning during session verification: ${error}`);
    }
  });

  test('GET Account Details of the Logged In User', async ({ page }) => {
    const scenarioName = 'GET Account Details';
    
    Log.info('=== Starting Account Details API Test ===');
    
    try {
      // The page already has the session from beforeEach and global setup
      // Now make the API call using the page's request context which has the session
      
      // Construct the full API URL
      const fullApiUrl = `${baseUrl}${urls.getAccountDetails}`;
      Log.info(`Making API request to: ${fullApiUrl}`);
      Log.info(`Endpoint: ${urls.getAccountDetails}`);

      // Make the API request using the page's request context (which has session cookies)
      const response = await page.request.get(fullApiUrl, {
        timeout: configManager.getTimeout(),
        ignoreHTTPSErrors: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // Helps identify this as an AJAX request
        }
      });

      Log.info(`✅ API Response Status: ${response.status()}`);
      Log.info(`Response Headers: ${JSON.stringify(response.headers(), null, 2)}`);

      // Check if we got redirected to login page (HTML response instead of JSON)
      const contentType = response.headers()['content-type'] || '';
      Log.info(`Content-Type: ${contentType}`);
      
      if (contentType.includes('text/html')) {
        const responseText = await response.text();
        Log.info(`HTML Response Length: ${responseText.length}`);
        
        // Check if this is a login page
        if (responseText.includes('login') || responseText.includes('sign-in') || 
            responseText.includes('auth') || responseText.includes('password')) {
          Log.error('❌ Received HTML login page instead of JSON - Authentication failed');
          Log.error('This indicates the API request was redirected to login page');
          Log.info('Possible causes:');
          Log.info('1. Session expired or invalid');
          Log.info('2. API endpoint requires different authentication');
          Log.info('3. CSRF protection or session token required');
          throw new Error('Authentication failed - received login page instead of API response');
        }
      }

      // Validate response status - if we got here, we have a response
      if (response.status() !== 200) {
        const responseText = await response.text();
        Log.error(`API call failed with status ${response.status()}`);
        Log.error(`Response body: ${responseText}`);
        throw new Error(`Expected status 200 but got ${response.status()}. Response: ${responseText}`);
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
          expect(typeof responseBody.id).toBe('string'); // ID is a UUID string
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

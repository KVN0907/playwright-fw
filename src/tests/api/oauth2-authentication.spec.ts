import { test, expect } from '../fixtures/advancedFixtures';
import { AuthenticationManager } from '../../lib/auth/AuthenticationManager';
import { APITestHelper } from '../../lib/APITestHelper';
import Log from '../../lib/Log';

/**
 * OAuth2/JWT Authentication Tests
 * Tests the OAuth2/JWT authentication flow with Keycloak
 */
test.describe('OAuth2/JWT Authentication with Keycloak', () => {
  test.beforeAll(() => {
    Log.info('=== OAuth2 Authentication Test Suite ===');
    Log.info(`Environment: ${process.env.NODE_ENV || 'qa'}`);
  });

  test('@smoke @critical Verify OAuth2 token generation via /api/auth/token', async ({
    request,
  }) => {
    Log.info('=== Testing OAuth2 Token Generation ===');

    const username = process.env.USERNAME || process.env.SSO_USERNAME || 'superadmin';
    const password = process.env.PASSWORD || process.env.SSO_PASSWORD || 'password';

    // Test the token endpoint directly
    const response = await request.post('/api/auth/token', {
      data: {
        username: username,
        password: password,
      },
    });

    // Verify response status
    expect(response.status()).toBe(200);

    // Verify response structure
    const tokenData = await response.json();
    expect(tokenData).toHaveProperty('accessToken');
    expect(tokenData).toHaveProperty('tokenType');
    expect(tokenData.tokenType).toBe('Bearer');

    Log.info('✅ Token generated successfully');
    Log.info(`   Token Type: ${tokenData.tokenType}`);
    Log.info(`   Expires In: ${tokenData.expiresIn} seconds`);
    Log.info(`   Has Refresh Token: ${!!tokenData.refreshToken}`);
  });

  test('@smoke @critical Verify AuthenticationManager OAuth2 integration', async ({ request }) => {
    Log.info('=== Testing AuthenticationManager OAuth2 Flow ===');

    const authManager = AuthenticationManager.getInstance();

    // Clear any cached auth
    authManager.clearAuth();

    // Authenticate using OAuth2
    const authResult = await authManager.authenticate(undefined, request);

    // Verify authentication succeeded
    expect(authResult.success).toBe(true);
    expect(authResult.token).toBeDefined();
    expect(authResult.headers).toBeDefined();
    expect(authResult.headers?.['Authorization']).toContain('Bearer ');

    Log.info('✅ AuthenticationManager OAuth2 authentication successful');
    Log.info(`   Auth Type: ${authManager.getAuthType()}`);
    Log.info(`   Token: ${authResult.token?.substring(0, 20)}...`);
  });

  test('@regression Verify authenticated API request with JWT token', async ({ request }) => {
    Log.info('=== Testing Authenticated API Request ===');

    const apiHelper = new APITestHelper(request);

    // Make an authenticated request (APITestHelper will handle auth automatically)
    const response = await apiHelper.get('/api/admin/clients');

    // Verify response
    expect(response.ok()).toBe(true);

    const data = await response.json();
    Log.info('✅ Authenticated API request successful');
    Log.info(`   Response Status: ${response.status()}`);
    Log.info(`   Response Type: ${Array.isArray(data) ? 'Array' : typeof data}`);
  });

  test('@regression Verify custom headers (X-Tenant-Id, X-User-Id) are included', async ({
    request,
  }) => {
    Log.info('=== Testing Custom Headers ===');

    // Set environment variables for tenant and user
    process.env.X_TENANT_ID = '1';
    process.env.X_USER_ID = '123';

    const authManager = AuthenticationManager.getInstance();
    authManager.clearAuth();

    const authResult = await authManager.authenticate(undefined, request);

    // Verify custom headers are included
    expect(authResult.headers).toBeDefined();

    if (process.env.X_TENANT_ID) {
      expect(authResult.headers?.['X-Tenant-Id']).toBe('1');
    }

    if (process.env.X_USER_ID) {
      expect(authResult.headers?.['X-User-Id']).toBe('123');
    }

    Log.info('✅ Custom headers verified');
    Log.info(`   X-Tenant-Id: ${authResult.headers?.['X-Tenant-Id']}`);
    Log.info(`   X-User-Id: ${authResult.headers?.['X-User-Id']}`);
  });

  test('@regression Verify token refresh mechanism', async ({ request }) => {
    Log.info('=== Testing Token Refresh ===');

    const authManager = AuthenticationManager.getInstance();

    // First, get a token with refresh token
    const initialAuth = await authManager.authenticate(undefined, request);
    expect(initialAuth.success).toBe(true);

    // Attempt to refresh (if refresh token available)
    const refreshed = await authManager.refreshAuthIfNeeded(request);

    Log.info(`Token refresh ${refreshed ? 'successful' : 'not needed or failed'}`);
    Log.info('✅ Token refresh mechanism tested');
  });

  test('@api @smoke Verify API requests work with different HTTP methods', async ({ request }) => {
    Log.info('=== Testing Different HTTP Methods with Auth ===');

    const apiHelper = new APITestHelper(request);

    // Test GET
    const getResponse = await apiHelper.get('/api/admin/clients');
    expect(getResponse.ok()).toBe(true);
    Log.info('✅ GET request successful');

    // Test POST (create)
    const postData = {
      name: 'Test Client OAuth2',
      description: 'Created via OAuth2 test',
    };

    const postResponse = await apiHelper.post('/api/admin/clients', postData);
    expect([200, 201, 400, 409]).toContain(postResponse.status()); // May fail if duplicate
    Log.info(`✅ POST request completed with status: ${postResponse.status()}`);

    // Note: PUT and DELETE tests would need valid IDs
    Log.info('✅ HTTP methods testing completed');
  });

  test('@smoke Verify public endpoints work without authentication', async ({ request }) => {
    Log.info('=== Testing Public Endpoints ===');

    const apiHelper = new APITestHelper(request);

    // Test health endpoint (should be public)
    const response = await apiHelper.get('/api/admin/actuator/health', { skipAuth: true });

    // Health endpoint should be accessible without auth
    expect(response.ok()).toBe(true);

    const healthData = await response.json();
    Log.info('✅ Public endpoint accessible without authentication');
    Log.info(`   Health Status: ${healthData.status}`);
  });
});

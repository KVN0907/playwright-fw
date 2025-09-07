# Multi-Authentication API Testing Guide

This framework supports multiple authentication methods for API testing, making it flexible to work with various backend systems.

## Supported Authentication Types

### 1. Browser Session Authentication (Default)

Uses UI login and browser cookies for API authentication.

```bash
# .env configuration
QA_AUTH_TYPE=browser_session
QA_USERNAME=your_username
QA_PASSWORD=your_password
```

**Use Case**: When your API endpoints require the same session as the web application.

### 2. Bearer Token Authentication

Uses Bearer tokens in the Authorization header.

```bash
# .env configuration
QA_AUTH_TYPE=bearer_token

# Option A: Use existing token
QA_AUTH_TOKEN=your_existing_bearer_token

# Option B: Obtain token via login
QA_USERNAME=your_username
QA_PASSWORD=your_password
QA_LOGIN_ENDPOINT=/api/auth/login
QA_TOKEN_FIELD=access_token
```

**Use Case**: REST APIs that use JWT or other bearer tokens.

### 3. JWT Token Authentication

Similar to bearer token but uses "JWT" prefix.

```bash
# .env configuration
QA_AUTH_TYPE=jwt_token
QA_AUTH_TOKEN=your_jwt_token
# OR obtain via login (same as bearer token)
```

**Use Case**: APIs specifically requiring JWT format.

### 4. API Key Authentication

Uses API keys in headers.

```bash
# .env configuration
QA_AUTH_TYPE=api_key
QA_API_KEY=your_api_key_here
```

**Use Case**: Simple API key-based authentication.

### 5. Basic Authentication

Uses HTTP Basic Authentication.

```bash
# .env configuration
QA_AUTH_TYPE=basic_auth
QA_USERNAME=your_username
QA_PASSWORD=your_password
```

**Use Case**: Traditional username/password authentication.

### 6. OAuth2 Client Credentials

Uses OAuth2 client credentials flow.

```bash
# .env configuration
QA_AUTH_TYPE=oauth2
QA_CLIENT_ID=your_client_id
QA_CLIENT_SECRET=your_client_secret
QA_TOKEN_ENDPOINT=/oauth/token
```

**Use Case**: Service-to-service authentication.

### 7. Custom Headers Authentication

Uses custom headers for authentication.

```bash
# .env configuration
QA_AUTH_TYPE=custom_headers
QA_CUSTOM_HEADERS={"X-API-Token":"your_token","X-Client-ID":"your_client_id"}
```

**Use Case**: Proprietary authentication schemes.

## Configuration Examples

### Example 1: Microservice with JWT

```bash
NODE_ENV=production
PRODUCTION_AUTH_TYPE=jwt_token
PRODUCTION_USERNAME=service_user
PRODUCTION_PASSWORD=service_password
PRODUCTION_LOGIN_ENDPOINT=/api/v1/auth/login
PRODUCTION_TOKEN_FIELD=token
PRODUCTION_APP_URL=https://api.yourservice.com
```

### Example 2: Third-party API with API Key

```bash
NODE_ENV=integration
INTEGRATION_AUTH_TYPE=api_key
INTEGRATION_API_KEY=sk_live_abcd1234567890
INTEGRATION_APP_URL=https://api.thirdparty.com
```

### Example 3: OAuth2 Service

```bash
NODE_ENV=staging
STAGING_AUTH_TYPE=oauth2
STAGING_CLIENT_ID=your_oauth_client_id
STAGING_CLIENT_SECRET=your_oauth_client_secret
STAGING_TOKEN_ENDPOINT=/oauth/v2/token
STAGING_APP_URL=https://staging-api.yourservice.com
```

## Advanced Features

### Token Refresh

Automatic token refresh for expired tokens:

```bash
QA_REFRESH_TOKEN=your_refresh_token
QA_REFRESH_ENDPOINT=/api/auth/refresh
```

### Custom Endpoints

Override default authentication endpoints:

```bash
QA_LOGIN_ENDPOINT=/custom/login
QA_TOKEN_ENDPOINT=/custom/token
QA_REFRESH_ENDPOINT=/custom/refresh
```

### Custom Token Field

Specify the field name for token extraction:

```bash
QA_TOKEN_FIELD=access_token  # Default
# OR
QA_TOKEN_FIELD=authToken     # Custom field name
```

## Usage in Tests

The AuthenticationManager is automatically used in your API tests:

```typescript
import { test, expect } from '@playwright/test';
import { AuthenticationManager } from '../utils/AuthenticationManager';

test.describe('API Tests', () => {
  let authManager: AuthenticationManager;

  test.beforeEach(async ({ page }) => {
    authManager = AuthenticationManager.getInstance();

    // Authenticate using configured method
    const authResult = await authManager.authenticate(page, page.request);

    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }
  });

  test('API call with authentication', async ({ page }) => {
    // Get authentication headers
    const authHeaders = authManager.getAuthHeaders();

    // Make authenticated API request
    const response = await page.request.get('/api/endpoint', {
      headers: {
        Accept: 'application/json',
        ...authHeaders,
      },
    });

    expect(response.status()).toBe(200);
  });
});
```

## Debugging Authentication

### Check Authentication Type

```typescript
console.log(`Current auth type: ${authManager.getAuthType()}`);
```

### Check Authentication Headers

```typescript
const headers = authManager.getAuthHeaders();
console.log('Auth headers:', headers);
```

### Check Authentication Token

```typescript
const token = authManager.getAuthToken();
console.log('Auth token:', token ? 'Present' : 'Missing');
```

## Environment-Specific Configuration

You can have different authentication methods for different environments:

```bash
# .env.dev
DEV_AUTH_TYPE=browser_session
DEV_USERNAME=dev_user
DEV_PASSWORD=dev_pass

# .env.staging
STAGING_AUTH_TYPE=bearer_token
STAGING_AUTH_TOKEN=staging_bearer_token

# .env.production
PRODUCTION_AUTH_TYPE=oauth2
PRODUCTION_CLIENT_ID=prod_client_id
PRODUCTION_CLIENT_SECRET=prod_client_secret
```

## Migration Guide

### From Browser Session Only

If you're currently using only browser session authentication:

1. Your existing `.env` files will continue to work (browser_session is default)
2. No changes needed to existing tests
3. Add `AUTH_TYPE=browser_session` explicitly if you want to be explicit

### Adding New Authentication Methods

1. Update your `.env` file with the new authentication type
2. Add required credentials/configuration
3. Tests will automatically use the new authentication method

## Troubleshooting

### Authentication Failures

- Check your `.env` file configuration
- Verify credentials are correct
- Check endpoint URLs
- Enable debug logging to see detailed authentication flow

### Token Expiration

- Configure refresh tokens if supported
- The framework will automatically attempt token refresh
- Check token expiration times in your environment

### Multiple Environments

- Use environment-specific `.env` files (`.env.qa`, `.env.staging`, etc.)
- Prefix all variables with environment name (e.g., `QA_AUTH_TYPE`)
- Test with different environments to ensure proper configuration

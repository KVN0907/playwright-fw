import { Page, APIRequestContext, Cookie } from '@playwright/test';
import Log from '../utils/Log';
import { ConfigManager } from '../config/ConfigManager';
import { LoginPage } from '../../pages/common/LoginPage';

export interface AuthConfig {
  type:
    | 'browser_session'
    | 'bearer_token'
    | 'jwt_token'
    | 'api_key'
    | 'basic_auth'
    | 'oauth2'
    | 'custom_headers';
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    customHeaders?: Record<string, string>;
  };
  endpoints?: {
    login?: string;
    token?: string;
    refresh?: string;
  };
  storageKey?: string;
  tokenField?: string;
}

// Validation helper to ensure required credentials are present for each auth type
export function validateAuthConfig(config: AuthConfig): boolean {
  const { type, credentials } = config;

  switch (type) {
    case 'bearer_token':
    case 'jwt_token':
      if (!credentials?.token) {
        throw new TypeError(`Authentication type '${type}' requires a token in credentials`);
      }
      break;
    case 'api_key':
      if (!credentials?.apiKey) {
        throw new TypeError(`Authentication type '${type}' requires an apiKey in credentials`);
      }
      break;
    case 'basic_auth':
      if (!credentials?.username || !credentials?.password) {
        throw new TypeError(
          `Authentication type '${type}' requires username and password in credentials`
        );
      }
      break;
    case 'oauth2':
      if (!credentials?.clientId || !credentials?.clientSecret) {
        throw new TypeError(
          `Authentication type '${type}' requires clientId and clientSecret in credentials`
        );
      }
      break;
    case 'custom_headers':
      if (!credentials?.customHeaders || Object.keys(credentials.customHeaders).length === 0) {
        throw new TypeError(`Authentication type '${type}' requires customHeaders in credentials`);
      }
      break;
    case 'browser_session':
      // Browser session might not require explicit credentials as they could come from environment
      break;
    default:
      throw new RangeError(`Unsupported authentication type: ${type}`);
  }
  return true;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  headers?: Record<string, string>;
  cookies?: Cookie[];
  error?: string;
}

export class AuthenticationManager {
  private static instance: AuthenticationManager;
  private configManager: ConfigManager;
  private authConfig!: AuthConfig;
  private cachedAuth: AuthResult | null = null;

  private constructor() {
    this.configManager = ConfigManager.getInstance();
    this.loadAuthConfig();
  }

  public static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager();
    }
    return AuthenticationManager.instance;
  }

  private loadAuthConfig(): void {
    const env = process.env.NODE_ENV || 'development';

    // Load auth configuration from environment variables
    // Try environment-specific first, then fall back to generic
    const getEnvVar = (key: string) => {
      return process.env[`${env.toUpperCase()}_${key}`] || process.env[key];
    };

    this.authConfig = {
      type: (getEnvVar('AUTH_TYPE') || 'browser_session') as AuthConfig['type'],
      credentials: {
        username: getEnvVar('USERNAME'),
        password: getEnvVar('PASSWORD'),
        token: getEnvVar('AUTH_TOKEN'),
        apiKey: getEnvVar('API_KEY'),
        clientId: getEnvVar('CLIENT_ID'),
        clientSecret: getEnvVar('CLIENT_SECRET'),
        refreshToken: getEnvVar('REFRESH_TOKEN'),
        customHeaders: this.parseCustomHeaders(),
      },
      endpoints: {
        login: getEnvVar('LOGIN_ENDPOINT') || '/api/auth/login',
        token: getEnvVar('TOKEN_ENDPOINT') || '/api/auth/token',
        refresh: getEnvVar('REFRESH_ENDPOINT') || '/api/auth/refresh',
      },
      storageKey: getEnvVar('STORAGE_KEY') || 'auth_token',
      tokenField: getEnvVar('TOKEN_FIELD') || 'access_token',
    };

    // Validate the configuration
    try {
      validateAuthConfig(this.authConfig);
      Log.info(`Loaded auth configuration: ${this.authConfig.type}`);
    } catch (error) {
      Log.error(`Auth configuration validation failed: ${error}`);
      // For now, just log the error but continue - this allows browser_session to work
      // without requiring explicit credentials in environment variables
      Log.info(`Loaded auth configuration: ${this.authConfig.type} (with validation warnings)`);
    }
  }

  private parseCustomHeaders(): Record<string, string> | undefined {
    const env = process.env.NODE_ENV || 'development';
    const getEnvVar = (key: string) => {
      return process.env[`${env.toUpperCase()}_${key}`] || process.env[key];
    };

    const headersStr = getEnvVar('CUSTOM_HEADERS');

    if (!headersStr) return undefined;

    try {
      return JSON.parse(headersStr);
    } catch (error) {
      Log.error(`Failed to parse custom headers: ${error}`);
      return undefined;
    }
  }

  /**
   * Authenticate using the configured method
   */
  async authenticate(page?: Page, requestContext?: APIRequestContext): Promise<AuthResult> {
    Log.info(`=== Starting Authentication: ${this.authConfig.type} ===`);

    try {
      let result: AuthResult;

      switch (this.authConfig.type) {
        case 'browser_session':
          result = await this.authenticateWithBrowserSession(page);
          break;
        case 'bearer_token':
          result = await this.authenticateWithBearerToken(requestContext);
          break;
        case 'jwt_token':
          result = await this.authenticateWithJWT(requestContext);
          break;
        case 'api_key':
          result = await this.authenticateWithApiKey();
          break;
        case 'basic_auth':
          result = await this.authenticateWithBasicAuth();
          break;
        case 'oauth2':
          result = await this.authenticateWithOAuth2(requestContext);
          break;
        case 'custom_headers':
          result = await this.authenticateWithCustomHeaders();
          break;
        default:
          throw new Error(`Unsupported authentication type: ${this.authConfig.type}`);
      }

      if (result.success) {
        this.cachedAuth = result;
        Log.info('✅ Authentication successful');
      } else {
        Log.error(`❌ Authentication failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Log.error(`❌ Authentication error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Browser session authentication (current method)
   */
  private async authenticateWithBrowserSession(page?: Page): Promise<AuthResult> {
    if (!page) {
      return { success: false, error: 'Page context required for browser session authentication' };
    }

    const loginPage = new LoginPage(page);
    const baseUrl = this.configManager.getBaseURL();

    Log.info('Performing browser session authentication');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    await loginPage.login(
      this.authConfig.credentials?.username || '',
      this.authConfig.credentials?.password || ''
    );

    // Get cookies after successful login
    const cookies = await page.context().cookies();

    return {
      success: true,
      cookies: cookies,
      headers: {},
    };
  }

  /**
   * Bearer token authentication
   */
  private async authenticateWithBearerToken(
    requestContext?: APIRequestContext
  ): Promise<AuthResult> {
    if (this.authConfig.credentials?.token) {
      // Use existing token
      Log.info('Using existing bearer token');
      return {
        success: true,
        token: this.authConfig.credentials.token,
        headers: {
          Authorization: `Bearer ${this.authConfig.credentials.token}`,
        },
      };
    }

    if (!requestContext) {
      return { success: false, error: 'Request context required for token authentication' };
    }

    // Obtain token via login
    Log.info('Obtaining bearer token via login');
    const loginResponse = await requestContext.post(
      `${this.configManager.getBaseURL()}${this.authConfig.endpoints?.login}`,
      {
        data: {
          username: this.authConfig.credentials?.username,
          password: this.authConfig.credentials?.password,
        },
      }
    );

    if (loginResponse.status() === 200) {
      const responseData = await loginResponse.json();
      const token = responseData[this.authConfig.tokenField || 'access_token'];

      if (token) {
        return {
          success: true,
          token: token,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      }
    }

    return {
      success: false,
      error: `Failed to obtain bearer token. Status: ${loginResponse.status()}`,
    };
  }

  /**
   * JWT token authentication
   */
  private async authenticateWithJWT(requestContext?: APIRequestContext): Promise<AuthResult> {
    if (this.authConfig.credentials?.token) {
      // Use existing JWT token
      Log.info('Using existing JWT token');
      return {
        success: true,
        token: this.authConfig.credentials.token,
        headers: {
          Authorization: `JWT ${this.authConfig.credentials.token}`,
        },
      };
    }

    if (!requestContext) {
      return { success: false, error: 'Request context required for JWT authentication' };
    }

    // Obtain JWT token
    Log.info('Obtaining JWT token');
    const tokenResponse = await requestContext.post(
      `${this.configManager.getBaseURL()}${this.authConfig.endpoints?.token}`,
      {
        data: {
          username: this.authConfig.credentials?.username,
          password: this.authConfig.credentials?.password,
        },
      }
    );

    if (tokenResponse.status() === 200) {
      const responseData = await tokenResponse.json();
      const token = responseData[this.authConfig.tokenField || 'token'];

      if (token) {
        return {
          success: true,
          token: token,
          headers: {
            Authorization: `JWT ${token}`,
          },
        };
      }
    }

    return {
      success: false,
      error: `Failed to obtain JWT token. Status: ${tokenResponse.status()}`,
    };
  }

  /**
   * API Key authentication
   */
  private async authenticateWithApiKey(): Promise<AuthResult> {
    if (!this.authConfig.credentials?.apiKey) {
      return { success: false, error: 'API key not provided' };
    }

    Log.info('Using API key authentication');
    return {
      success: true,
      headers: {
        'X-API-Key': this.authConfig.credentials.apiKey,
      },
    };
  }

  /**
   * Basic authentication
   */
  private async authenticateWithBasicAuth(): Promise<AuthResult> {
    if (!this.authConfig.credentials?.username || !this.authConfig.credentials?.password) {
      return { success: false, error: 'Username and password required for basic auth' };
    }

    Log.info('Using basic authentication');
    const credentials = Buffer.from(
      `${this.authConfig.credentials.username}:${this.authConfig.credentials.password}`
    ).toString('base64');

    return {
      success: true,
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    };
  }

  /**
   * OAuth2 authentication (Enhanced for Keycloak JWT tokens)
   */
  private async authenticateWithOAuth2(requestContext?: APIRequestContext): Promise<AuthResult> {
    if (!requestContext) {
      return { success: false, error: 'Request context required for OAuth2 authentication' };
    }

    Log.info('Performing OAuth2/JWT authentication via Keycloak');

    // Try password grant flow with username/password
    if (this.authConfig.credentials?.username && this.authConfig.credentials?.password) {
      Log.info('Using password grant flow (Resource Owner Password Credentials)');

      try {
        const tokenResponse = await requestContext.post(
          `${this.configManager.getApiURL()}${this.authConfig.endpoints?.token}`,
          {
            data: {
              username: this.authConfig.credentials.username,
              password: this.authConfig.credentials.password,
            },
          }
        );

        if (tokenResponse.ok()) {
          const responseData = await tokenResponse.json();
          const token = responseData.accessToken || responseData.access_token;
          const refreshToken = responseData.refreshToken || responseData.refresh_token;

          if (token) {
            // Store refresh token for later use
            if (refreshToken && this.authConfig.credentials) {
              this.authConfig.credentials.refreshToken = refreshToken;
            }

            const headers: Record<string, string> = {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            };

            // Add tenant and user headers if available
            const tenantId = process.env.X_TENANT_ID || process.env.TENANT_ID;
            const userId = process.env.X_USER_ID || process.env.USER_ID;
            const proxyTenantId = process.env.X_PROXY_TENANT_ID;

            if (tenantId) headers['X-Tenant-Id'] = tenantId;
            if (userId) headers['X-User-Id'] = userId;
            if (proxyTenantId) headers['X-Proxy-Tenant-Id'] = proxyTenantId;

            Log.info('✅ OAuth2/JWT token obtained successfully');
            return {
              success: true,
              token: token,
              headers: headers,
            };
          }
        }

        const errorBody = await tokenResponse.text();
        Log.error(`Token request failed: ${tokenResponse.status()} - ${errorBody}`);
      } catch (error) {
        Log.error(`OAuth2 authentication error: ${error}`);
      }
    }

    // Fallback to client credentials if username/password not available
    if (this.authConfig.credentials?.clientId && this.authConfig.credentials?.clientSecret) {
      Log.info('Attempting client credentials flow');

      try {
        const tokenResponse = await requestContext.post(
          `${this.configManager.getApiURL()}${this.authConfig.endpoints?.token?.replace('/token', '/client-token')}`,
          {
            data: {},
          }
        );

        if (tokenResponse.ok()) {
          const responseData = await tokenResponse.json();
          const token = responseData.accessToken || responseData.access_token;

          if (token) {
            return {
              success: true,
              token: token,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            };
          }
        }
      } catch (error) {
        Log.error(`Client credentials flow error: ${error}`);
      }
    }

    return {
      success: false,
      error: 'OAuth2 authentication failed: No valid credentials provided or token request failed',
    };
  }

  /**
   * Custom headers authentication
   */
  private async authenticateWithCustomHeaders(): Promise<AuthResult> {
    if (!this.authConfig.credentials?.customHeaders) {
      return { success: false, error: 'Custom headers not provided' };
    }

    Log.info('Using custom headers authentication');
    return {
      success: true,
      headers: this.authConfig.credentials.customHeaders,
    };
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.cachedAuth || !this.cachedAuth.success) {
      Log.info('No valid authentication found. Call authenticate() first.');
      return {};
    }

    return this.cachedAuth.headers || {};
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | undefined {
    if (!this.cachedAuth || !this.cachedAuth.success) {
      Log.info('No valid authentication found. Call authenticate() first.');
      return undefined;
    }

    return this.cachedAuth.token;
  }

  /**
   * Check if authentication is valid and refresh if needed
   */
  async refreshAuthIfNeeded(requestContext?: APIRequestContext): Promise<boolean> {
    if (this.authConfig.type === 'browser_session') {
      // Browser sessions are handled differently
      return true;
    }

    if (!this.authConfig.credentials?.refreshToken || !this.authConfig.endpoints?.refresh) {
      Log.info('No refresh token or endpoint configured');
      return false;
    }

    if (!requestContext) {
      Log.info('Request context required for token refresh');
      return false;
    }

    try {
      Log.info('Refreshing authentication token');
      const refreshResponse = await requestContext.post(
        `${this.configManager.getBaseURL()}${this.authConfig.endpoints.refresh}`,
        {
          data: {
            refresh_token: this.authConfig.credentials.refreshToken,
          },
        }
      );

      if (refreshResponse.status() === 200) {
        const responseData = await refreshResponse.json();
        const newToken = responseData[this.authConfig.tokenField || 'access_token'];

        if (newToken && this.cachedAuth) {
          this.cachedAuth.token = newToken;
          this.cachedAuth.headers = {
            ...this.cachedAuth.headers,
            Authorization: `Bearer ${newToken}`,
          };
          Log.info('✅ Token refreshed successfully');
          return true;
        }
      }
    } catch (error) {
      Log.error(`Token refresh failed: ${error}`);
    }

    return false;
  }

  /**
   * Clear cached authentication
   */
  clearAuth(): void {
    this.cachedAuth = null;
    Log.info('Authentication cache cleared');
  }

  /**
   * Get current auth configuration type
   */
  getAuthType(): string {
    return this.authConfig.type;
  }
}

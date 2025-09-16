import { APIRequestContext, APIResponse, Page } from '@playwright/test';
import Log from '../utils/Log';
import { ConfigManager } from '../utils/ConfigManager';

export interface APITestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  ignoreHTTPSErrors?: boolean;
}

export class APITestHelper {
  private apiContext: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private page?: Page;

  constructor(apiContext: APIRequestContext, page?: Page) {
    this.apiContext = apiContext;
    this.page = page;
    this.baseURL = ConfigManager.getInstance().getApiURL();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private getFullURL(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
  }

  private mergeHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return { ...this.defaultHeaders, ...customHeaders };
  }

  async get(endpoint: string, options?: APITestOptions): Promise<APIResponse> {
    const url = this.getFullURL(endpoint);
    Log.info(`API GET: ${url}`);

    const response = await this.apiContext.get(url, {
      headers: this.mergeHeaders(options?.headers),
      timeout: options?.timeout || ConfigManager.getInstance().getTimeout(),
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors || true,
    });

    Log.info(`API GET Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  async post(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: APITestOptions
  ): Promise<APIResponse> {
    const url = this.getFullURL(endpoint);
    Log.info(`API POST: ${url}`);

    const response = await this.apiContext.post(url, {
      data: data,
      headers: this.mergeHeaders(options?.headers),
      timeout: options?.timeout || ConfigManager.getInstance().getTimeout(),
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors || true,
    });

    Log.info(`API POST Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  async put(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: APITestOptions
  ): Promise<APIResponse> {
    const url = this.getFullURL(endpoint);
    Log.info(`API PUT: ${url}`);

    const response = await this.apiContext.put(url, {
      data: data,
      headers: this.mergeHeaders(options?.headers),
      timeout: options?.timeout || ConfigManager.getInstance().getTimeout(),
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors || true,
    });

    Log.info(`API PUT Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  async delete(endpoint: string, options?: APITestOptions): Promise<APIResponse> {
    const url = this.getFullURL(endpoint);
    Log.info(`API DELETE: ${url}`);

    const response = await this.apiContext.delete(url, {
      headers: this.mergeHeaders(options?.headers),
      timeout: options?.timeout || ConfigManager.getInstance().getTimeout(),
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors || true,
    });

    Log.info(`API DELETE Response: ${response.status()} ${response.statusText()}`);
    return response;
  }

  // Helper methods for common API operations
  async validateResponse(response: APIResponse, expectedStatus: number): Promise<void> {
    if (response.status() !== expectedStatus) {
      const responseText = await response.text();
      throw new Error(
        `Expected status ${expectedStatus} but got ${response.status()}. Response: ${responseText}`
      );
    }
  }

  async getResponseBody<T>(response: APIResponse): Promise<T> {
    return (await response.json()) as T;
  }

  async logResponse(response: APIResponse): Promise<void> {
    const body = await response.text();
    Log.info(`Response Status: ${response.status()}`);
    Log.info(`Response Headers: ${JSON.stringify(response.headers(), null, 2)}`);
    Log.info(`Response Body: ${body}`);
  }

  /**
   * Fetch CSRF token using session cookie
   * Note: Requires urls.json to have csrfTokenGateWay endpoint defined
   * @param csrfEndpoint - The CSRF token endpoint path
   * @returns Promise<string> - The CSRF token
   */
  async fetchCSRFToken(csrfEndpoint: string = '/api/csrf'): Promise<string> {
    if (!this.page) {
      throw new Error(
        'Page instance is required for CSRF token fetching. Please pass page to APITestHelper constructor.'
      );
    }

    const baseUrl = this.baseURL || process.env.APP_URL || 'https://default-url.com/';
    const csrfGatewayURI = `${baseUrl}${csrfEndpoint}`;

    // Get session cookie from page context
    const cookies = await this.page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'SESSION');

    if (!sessionCookie) {
      throw new Error('Session cookie not found. Make sure user is logged in.');
    }

    Log.info(`Fetching CSRF token from: ${csrfGatewayURI}`);

    const response = await this.page.request.get(csrfGatewayURI, {
      headers: {
        Cookie: `SESSION=${sessionCookie.value}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to fetch CSRF token: ${response.status()} ${response.statusText()}`);
    }

    // Parse the response body as JSON and extract the CSRF token
    const responseBody = await response.json();

    if (!responseBody.csrfToken) {
      throw new Error('CSRF token not found in response. Check the endpoint response structure.');
    }

    Log.info('CSRF token fetched successfully');
    return responseBody.csrfToken;
  }
}

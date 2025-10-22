import { APIRequestContext, APIResponse, Page } from '@playwright/test';
import Log from './Log';
import { ConfigManager } from './config/ConfigManager';

export interface APITestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  ignoreHTTPSErrors?: boolean;
}

export class APITestHelper {
  private apiContext: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(apiContext: APIRequestContext, _page?: Page) {
    this.apiContext = apiContext;
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
}

/**
 * @fileoverview Enhanced API Test Helper
 * @description Provides comprehensive API testing utilities with retry, interceptors, and error handling
 * @version 2.0
 */

import { APIRequestContext, APIResponse, Page } from '@playwright/test';
import Log from './Log';
import { ConfigManager } from './config/ConfigManager';
import { APIError } from './errors';

export interface APITestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  ignoreHTTPSErrors?: boolean;
  retries?: number;
  retryDelay?: number;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatusCodes: number[];
}

export interface RequestInterceptor {
  name: string;
  onRequest: (endpoint: string, options: any) => Promise<void> | void;
}

export interface ResponseInterceptor {
  name: string;
  onResponse: (response: APIResponse) => Promise<void> | void;
}

export class APITestHelper {
  private apiContext: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private retryConfig: RetryConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private requestHistory: Array<{
    endpoint: string;
    method: string;
    timestamp: Date;
    duration?: number;
  }> = [];

  constructor(apiContext: APIRequestContext, _page?: Page) {
    this.apiContext = apiContext;
    this.baseURL = ConfigManager.getInstance().getApiURL();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    };
  }

  private getFullURL(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
  }

  private mergeHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return { ...this.defaultHeaders, ...customHeaders };
  }

  /**
   * Configure retry behavior
   */
  configureRetry(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
    Log.info(`Added request interceptor: ${interceptor.name}`);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
    Log.info(`Added response interceptor: ${interceptor.name}`);
  }

  /**
   * Remove interceptor by name
   */
  removeInterceptor(name: string): void {
    this.requestInterceptors = this.requestInterceptors.filter(i => i.name !== name);
    this.responseInterceptors = this.responseInterceptors.filter(i => i.name !== name);
  }

  /**
   * Execute request interceptors
   */
  private async executeRequestInterceptors(endpoint: string, options: any): Promise<void> {
    for (const interceptor of this.requestInterceptors) {
      try {
        await interceptor.onRequest(endpoint, options);
      } catch (error) {
        Log.warn(`Request interceptor ${interceptor.name} failed: ${error}`);
      }
    }
  }

  /**
   * Execute response interceptors
   */
  private async executeResponseInterceptors(response: APIResponse): Promise<void> {
    for (const interceptor of this.responseInterceptors) {
      try {
        await interceptor.onResponse(response);
      } catch (error) {
        Log.warn(`Response interceptor ${interceptor.name} failed: ${error}`);
      }
    }
  }

  /**
   * Execute API request with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    retries?: number
  ): Promise<T> {
    const maxRetries = retries ?? this.retryConfig.maxRetries;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 0) {
          Log.info(`${operationName} succeeded on retry ${attempt}/${maxRetries}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const shouldRetry = this.shouldRetry(error);
          if (shouldRetry) {
            const delay = this.retryConfig.retryDelay * (attempt + 1);
            Log.info(
              `${operationName} failed, retrying in ${delay}ms (${attempt + 1}/${maxRetries})`
            );
            await this.sleep(delay);
          } else {
            Log.info(`${operationName} failed with non-retryable error`);
            throw error;
          }
        }
      }
    }

    throw new APIError(
      `${operationName} failed after ${maxRetries} retries: ${lastError!.message}`,
      operationName,
      'GET',
      undefined,
      undefined,
      { attempts: maxRetries + 1 }
    );
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof APIError) {
      return (
        error.statusCode !== undefined &&
        this.retryConfig.retryableStatusCodes.includes(error.statusCode)
      );
    }
    return true; // Retry network errors by default
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Record request in history
   */
  private recordRequest(endpoint: string, method: string, duration?: number): void {
    this.requestHistory.push({
      endpoint,
      method,
      timestamp: new Date(),
      duration,
    });
  }

  /**
   * Get request history
   */
  getRequestHistory(): typeof this.requestHistory {
    return [...this.requestHistory];
  }

  /**
   * Clear request history
   */
  clearRequestHistory(): void {
    this.requestHistory = [];
  }

  async get(endpoint: string, options?: APITestOptions): Promise<APIResponse> {
    const url = this.getFullURL(endpoint);
    const startTime = Date.now();

    return this.executeWithRetry(
      async () => {
        Log.info(`API GET: ${url}`);

        // Execute request interceptors
        await this.executeRequestInterceptors(endpoint, { method: 'GET', ...options });

        const response = await this.apiContext.get(url, {
          headers: this.mergeHeaders(options?.headers),
          timeout: options?.timeout || ConfigManager.getInstance().getTimeout(),
          ignoreHTTPSErrors: options?.ignoreHTTPSErrors || true,
        });

        const duration = Date.now() - startTime;
        this.recordRequest(endpoint, 'GET', duration);

        Log.info(`API GET Response: ${response.status()} ${response.statusText()} (${duration}ms)`);

        // Execute response interceptors
        await this.executeResponseInterceptors(response);

        // Throw error for non-2xx responses to trigger retry
        if (!response.ok()) {
          const body = await response.text();
          throw new APIError(
            `GET request failed: ${response.statusText()}`,
            endpoint,
            'GET',
            response.status(),
            body
          );
        }

        return response;
      },
      `GET ${endpoint}`,
      options?.retries
    );
  }

  async post(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: APITestOptions
  ): Promise<APIResponse> {
    const url = this.getFullURL(endpoint);
    const startTime = Date.now();

    return this.executeWithRetry(
      async () => {
        Log.info(`API POST: ${url}`);

        await this.executeRequestInterceptors(endpoint, { method: 'POST', data, ...options });

        const response = await this.apiContext.post(url, {
          data: data,
          headers: this.mergeHeaders(options?.headers),
          timeout: options?.timeout || ConfigManager.getInstance().getTimeout(),
          ignoreHTTPSErrors: options?.ignoreHTTPSErrors || true,
        });

        const duration = Date.now() - startTime;
        this.recordRequest(endpoint, 'POST', duration);

        Log.info(
          `API POST Response: ${response.status()} ${response.statusText()} (${duration}ms)`
        );

        await this.executeResponseInterceptors(response);

        if (!response.ok() && response.status() !== 201) {
          const body = await response.text();
          throw new APIError(
            `POST request failed: ${response.statusText()}`,
            endpoint,
            'POST',
            response.status(),
            body
          );
        }

        return response;
      },
      `POST ${endpoint}`,
      options?.retries
    );
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

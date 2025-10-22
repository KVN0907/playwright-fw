import { Page, BrowserContext } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

export interface TestSetupConfig {
  environment?: string;
  clearStorage?: boolean;
  waitForNetworkIdle?: boolean;
  logNavigation?: boolean;
  preserveAuth?: boolean;
}

export class TestSetup {
  private page: Page;
  private context: BrowserContext;
  private baseUrl: string = '';
  private environment: string;

  constructor(page: Page, context: BrowserContext, config: TestSetupConfig = {}) {
    this.page = page;
    this.context = context;
    this.environment = config.environment || process.env.NODE_ENV || 'qa';

    // Load environment variables
    this.loadEnvironmentVariables();
  }

  /**
   * Load environment variables for the current environment
   */
  private loadEnvironmentVariables(): void {
    const envPath = path.resolve(__dirname, `../../.env.${this.environment}`);
    dotenv.config({ path: envPath });
  }

  /**
   * Get and validate the base URL from environment variables
   */
  private getBaseUrl(): string {
    const ENV = this.environment.toUpperCase();

    // Get base URL from environment variables, with fallback chain
    this.baseUrl = process.env.APP_URL || process.env[`${ENV}_APP_URL`] || '';

    if (!this.baseUrl) {
      throw new Error(
        `No base URL found for environment ${this.environment}. Please set APP_URL or ${ENV}_APP_URL in your environment variables.`
      );
    }

    return this.baseUrl;
  }

  /**
   * Navigate to the home page
   */
  private async navigateToHomePage(waitForNetworkIdle: boolean = true): Promise<void> {
    const baseUrl = this.getBaseUrl();

    await this.page.goto(baseUrl);

    if (waitForNetworkIdle) {
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Clear browser storage while preserving authentication
   */
  private async clearBrowserStorage(preserveAuth: boolean = true): Promise<void> {
    try {
      if (preserveAuth) {
        // Only clear non-authentication related storage
        await this.page.evaluate(() => {
          if (typeof Storage !== 'undefined') {
            // Get all localStorage keys
            const localStorageKeys = Object.keys(localStorage);
            // Get all sessionStorage keys
            const sessionStorageKeys = Object.keys(sessionStorage);

            // Define authentication-related keys to preserve
            const authKeys = [
              'auth',
              'token',
              'session',
              'user',
              'login',
              'jwt',
              'access_token',
              'refresh_token',
              'authState',
              'userSession',
              'auth-token',
            ];

            // Clear localStorage except auth-related keys
            localStorageKeys.forEach(key => {
              const isAuthKey = authKeys.some(authKey =>
                key.toLowerCase().includes(authKey.toLowerCase())
              );
              if (!isAuthKey) {
                localStorage.removeItem(key);
              }
            });

            // Clear sessionStorage except auth-related keys
            sessionStorageKeys.forEach(key => {
              const isAuthKey = authKeys.some(authKey =>
                key.toLowerCase().includes(authKey.toLowerCase())
              );
              if (!isAuthKey) {
                sessionStorage.removeItem(key);
              }
            });
          }
        });
        console.log('Cleared non-authentication storage');
      } else {
        // Clear all storage
        await this.page.evaluate(() => {
          if (typeof Storage !== 'undefined') {
            if (window.localStorage) {
              localStorage.clear();
            }
            if (window.sessionStorage) {
              sessionStorage.clear();
            }
          }
        });
        console.log('Cleared all local and session storage');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('Storage clearing not available or failed, continuing...', errorMessage);
    }
  }

  /**
   * Log environment and navigation information
   */
  private logSetupInfo(): void {
    console.log(`Using environment: ${this.environment.toUpperCase()}`);
    console.log(`Base URL: ${this.baseUrl}`);
    console.log('Navigated to home page with existing authentication');
  }

  /**
   * Complete setup process
   */
  async setup(config: TestSetupConfig = {}): Promise<void> {
    const {
      clearStorage = true,
      waitForNetworkIdle = true,
      logNavigation = true,
      preserveAuth = true,
    } = config;

    // Navigate to home page first (authentication state from globalSetup will be preserved)
    await this.navigateToHomePage(waitForNetworkIdle);

    // Log setup information
    if (logNavigation) {
      this.logSetupInfo();
    }

    // Clear browser storage if requested
    if (clearStorage) {
      await this.clearBrowserStorage(preserveAuth);
    }
  }

  /**
   * Setup for page object generation (preserves authentication by default)
   */
  async setupForPageGeneration(): Promise<void> {
    await this.setup({
      clearStorage: false, // Don't clear storage for page generation
      waitForNetworkIdle: true,
      logNavigation: true,
      preserveAuth: true,
    });
  }

  /**
   * Get the base URL (useful for page objects that need it)
   */
  getUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the current environment
   */
  getEnvironment(): string {
    return this.environment;
  }
}

/**
 * Enhanced Configuration Manager with Profile Support
 * Supports environment + optional profile overlays for flexibility
 */

export interface EnvironmentConfig {
  baseURL: string;
  apiURL: string;
  timeout: number;
  retries: number;
  workers: number;
  headless: boolean;
  slowMo: number;
  video: boolean;
  screenshot: boolean;
  trace: boolean;
}

export type TestProfile = 'smoke' | 'regression' | 'mobile' | 'performance' | string;

export class ConfigManager {
  private static instance: ConfigManager;
  private config: EnvironmentConfig;
  private environment: string;
  private profile?: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'qa';
    this.profile = process.env.PROFILE;
    this.loadEnvironment(); // Load .env file FIRST
    this.config = this.loadConfig();
    this.logConfiguration();
  }

  /**
   * Load environment variables from .env file with optional profile overlay
   */
  private loadEnvironment(): void {
    const dotenv = require('dotenv');
    const path = require('path');
    const fs = require('fs');

    // Load base environment file
    const envPath = path.resolve(process.cwd(), `config/environments/${this.environment}.env`);
    dotenv.config({ path: envPath, override: true });
    console.log(`📁 Loaded environment: ${this.environment}`);

    // Load profile overlay if specified
    if (this.profile) {
      const profilePath = path.resolve(process.cwd(), `config/profiles/${this.profile}.env`);
      if (fs.existsSync(profilePath)) {
        dotenv.config({ path: profilePath, override: true });
        console.log(`🎯 Applied profile: ${this.profile}`);
      } else {
        console.warn(`⚠️  Profile file not found: ${profilePath}`);
      }
    }
  }

  /**
   * Log current configuration for visibility
   */
  private logConfiguration(): void {
    const configSummary = {
      environment: this.environment,
      profile: this.profile || 'none',
      baseURL: this.config.baseURL,
      workers: this.config.workers,
      headless: this.config.headless,
    };
    console.log('⚙️  Configuration:', JSON.stringify(configSummary, null, 2));
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): EnvironmentConfig {
    // Get environment-specific URL
    const ENV = this.environment.toUpperCase();
    let baseURL = process.env[`${ENV}_APP_URL`];
    if (!baseURL) {
      baseURL = process.env.APP_URL;
    }
    if (!baseURL) {
      throw new Error(
        `No base URL found for environment ${this.environment}. Please set ${ENV}_APP_URL or APP_URL in your environment variables.`
      );
    }

    // Get environment-specific API URL
    let apiURL = process.env[`${ENV}_API_URL`];
    if (!apiURL) {
      apiURL = process.env.API_URL;
    }
    if (!apiURL) {
      // Default to base URL + /api if no API URL is specified
      apiURL = `${baseURL.replace(/\/$/, '')}/api`;
    }

    const baseConfig: EnvironmentConfig = {
      baseURL: baseURL,
      apiURL: apiURL,
      timeout: parseInt(this.getEnvVar('TIMEOUT', '30000')),
      retries: parseInt(this.getEnvVar('RETRIES', '1')),
      workers: parseInt(this.getEnvVar('PARALLEL_THREAD', '4')),
      headless: this.getEnvVar('HEADLESS', 'true') === 'true',
      slowMo: parseInt(this.getEnvVar('SLOW_MO', '0')),
      video: this.getEnvVar('VIDEO', 'retain-on-failure') !== 'off',
      screenshot: this.getEnvVar('SCREENSHOT', 'only-on-failure') !== 'off',
      trace: this.getEnvVar('TRACE', 'retain-on-failure') !== 'off',
    };

    return baseConfig;
  }

  private getEnvVar(key: string, defaultValue?: string): string {
    const envSpecificKey = `${this.environment.toUpperCase()}_${key}`;
    const value = process.env[envSpecificKey] || process.env[key];

    if (!value && !defaultValue) {
      throw new Error(`Environment variable ${envSpecificKey} or ${key} is required but not set.`);
    }

    return value || (defaultValue ?? '');
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  getBaseURL(): string {
    return this.config.baseURL;
  }

  getApiURL(): string {
    return this.config.apiURL;
  }

  getTimeout(): number {
    return this.config.timeout;
  }

  isHeadless(): boolean {
    return this.config.headless;
  }

  getEnvironment(): string {
    return this.environment;
  }

  getProfile(): string | undefined {
    return this.profile;
  }

  getRetries(): number {
    return this.config.retries;
  }

  getWorkers(): number {
    return this.config.workers;
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  /**
   * Check if a specific profile is active
   */
  hasProfile(profileName: string): boolean {
    return this.profile === profileName;
  }

  /**
   * Get full configuration summary
   */
  getSummary(): {
    environment: string;
    profile?: string;
    baseURL: string;
    apiURL: string;
    timeout: number;
    retries: number;
    workers: number;
    headless: boolean;
  } {
    return {
      environment: this.environment,
      profile: this.profile,
      baseURL: this.config.baseURL,
      apiURL: this.config.apiURL,
      timeout: this.config.timeout,
      retries: this.config.retries,
      workers: this.config.workers,
      headless: this.config.headless,
    };
  }
}

// Export singleton instance for easy access
export const config = ConfigManager.getInstance();

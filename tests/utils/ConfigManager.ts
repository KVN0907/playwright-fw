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

export class ConfigManager {
  private static instance: ConfigManager;
  private config: EnvironmentConfig;
  private environment: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = this.loadConfig();
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
      throw new Error(`No base URL found for environment ${this.environment}. Please set ${ENV}_APP_URL or APP_URL in your environment variables.`);
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
      trace: this.getEnvVar('TRACE', 'retain-on-failure') !== 'off'
    };

    return baseConfig;
  }

  private getEnvVar(key: string, defaultValue?: string): string {
    const envSpecificKey = `${this.environment.toUpperCase()}_${key}`;
    const value = process.env[envSpecificKey] || process.env[key];
    
    if (!value && !defaultValue) {
      throw new Error(`Environment variable ${envSpecificKey} or ${key} is required but not set.`);
    }
    
    return value || defaultValue!;
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
}

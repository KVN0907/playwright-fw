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
    this.environment = process.env.NODE_ENV || 'dev';
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): EnvironmentConfig {
    const baseConfig: EnvironmentConfig = {
      baseURL: this.getEnvVar('BASE_URL', 'https://saasifier-dev.ey.com/'),
      apiURL: this.getEnvVar('API_URL', 'https://saasifier-dev.ey.com/api'),
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

  private getEnvVar(key: string, defaultValue: string): string {
    const envSpecificKey = `${this.environment.toUpperCase()}_${key}`;
    return process.env[envSpecificKey] || process.env[key] || defaultValue;
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

/**
 * @fileoverview Unified Test Configuration System with Advanced TypeScript
 * @description Type-safe, environment-aware configuration management for Playwright testing
 * @version 2.0
 */

import { PlaywrightTestConfig, devices } from '@playwright/test';
import { Utils } from '../lib/Utils';

/* ===== ADVANCED CONFIGURATION TYPES ===== */

/** Environment types with strict validation */
type Environment = 'dev' | 'qa' | 'staging' | 'prod';

/** Browser configuration with advanced options */
interface BrowserConfig {
  readonly name: string;
  readonly use: Record<string, any>;
  readonly testDir?: string;
  readonly testIgnore?: string[];
  readonly dependencies?: string[];
}

/** Test execution configuration */
interface ExecutionConfig {
  readonly baseURL: string;
  readonly timeout: number;
  readonly retries: number;
  readonly workers: number;
  readonly reporter: string | string[];
  readonly use: {
    readonly baseURL: string;
    readonly screenshot: 'off' | 'only-on-failure' | 'on';
    readonly video: 'off' | 'on-first-retry' | 'retain-on-failure';
    readonly trace: 'off' | 'on-first-retry' | 'retain-on-failure';
  };
}

/** Reporter configuration */
interface ReporterConfig {
  readonly name: string;
  readonly options?: Record<string, any>;
}

/** Environment-specific settings */
interface EnvironmentSettings {
  readonly baseURL: string;
  readonly timeout: number;
  readonly retries: number;
  readonly workers: number;
  readonly headless: boolean;
  readonly slowMo?: number;
  readonly apiBaseURL?: string;
  readonly debugMode?: boolean;
}

/** Complete test configuration schema */
interface TestConfig {
  readonly environment: Environment;
  readonly execution: ExecutionConfig;
  readonly browsers: readonly BrowserConfig[];
  readonly reporting: {
    readonly outputDir: string;
    readonly reporters: readonly ReporterConfig[];
    readonly htmlReport: boolean;
    readonly junitReport: boolean;
  };
  readonly api: {
    readonly baseURL: string;
    readonly timeout: number;
    readonly retries: number;
  };
}

/* ===== CONFIGURATION FACTORY ===== */

/**
 * @class ConfigurationFactory
 * @description Factory class for creating environment-specific configurations
 */
class ConfigurationFactory {
  private static readonly ENV_SETTINGS: Record<Environment, EnvironmentSettings> = {
    dev: {
      baseURL: process.env.DEV_APP_URL || process.env.APP_URL || 'https://infinity-dev.ey.com/',
      timeout: 30000,
      retries: 1,
      workers: 2,
      headless: false,
      slowMo: 100,
      debugMode: true,
      apiBaseURL: process.env.DEV_API_URL || process.env.API_URL || 'https://api-dev.ey.com/'
    },
    qa: {
      baseURL: process.env.QA_APP_URL || process.env.APP_URL || 'https://infinity-qa.ey.com/',
      timeout: 30000,
      retries: 2,
      workers: 4,
      headless: false,
      apiBaseURL: process.env.QA_API_URL || process.env.API_URL || 'https://api-qa.ey.com/'
    },
    staging: {
      baseURL: process.env.STAGING_APP_URL || process.env.APP_URL || 'https://infinity-staging.ey.com/',
      timeout: 45000,
      retries: 2,
      workers: 3,
      headless: true,
      apiBaseURL: process.env.STAGING_API_URL || process.env.API_URL || 'https://api-staging.ey.com/'
    },
    prod: {
      baseURL: process.env.PROD_APP_URL || process.env.APP_URL || 'https://infinity.ey.com/',
      timeout: 60000,
      retries: 3,
      workers: 2,
      headless: true,
      apiBaseURL: process.env.PROD_API_URL || process.env.API_URL || 'https://api.ey.com/'
    }
  } as const;

  /**
   * @description Create browser configurations with advanced features
   * @param settings - Environment settings
   * @returns Array of browser configurations
   */
  private static createBrowserConfigs(settings: EnvironmentSettings): readonly BrowserConfig[] {
    const baseConfig = {
      headless: settings.headless,
      slowMo: settings.slowMo,
      baseURL: settings.baseURL,
      screenshot: 'only-on-failure' as const,
      video: 'retain-on-failure' as const,
      trace: 'retain-on-failure' as const
    };

    return [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'], ...baseConfig },
        testDir: './src/tests',
        testIgnore: ['**/node_modules/**', '**/api/**']
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'], ...baseConfig },
        testDir: './src/tests',
        testIgnore: ['**/node_modules/**', '**/api/**'],
        dependencies: ['chromium']
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'], ...baseConfig },
        testDir: './src/tests',
        testIgnore: ['**/node_modules/**', '**/api/**'],
        dependencies: ['chromium']
      },
      {
        name: 'mobile-chrome',
        use: { ...devices['Pixel 5'], ...baseConfig },
        testDir: './src/tests/mobile',
        testIgnore: ['**/api/**']
      },
      {
        name: 'api',
        use: {
          baseURL: settings.apiBaseURL || settings.baseURL,
          extraHTTPHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        },
        testDir: './src/tests/api'
      }
    ] as const;
  }

  /**
   * @description Generate complete test configuration for environment
   * @param env - Target environment
   * @returns Complete test configuration
   */
  static createConfig(env: Environment): TestConfig {
    const settings = this.ENV_SETTINGS[env];
    
    return {
      environment: env,
      execution: {
        baseURL: settings.baseURL,
        timeout: settings.timeout,
        retries: settings.retries,
        workers: settings.workers,
        reporter: env === 'prod' ? 'junit' : 'html',
        use: {
          baseURL: settings.baseURL,
          screenshot: 'only-on-failure',
          video: 'retain-on-failure',
          trace: 'retain-on-failure'
        }
      },
      browsers: this.createBrowserConfigs(settings),
      reporting: {
        outputDir: `./test-results/${env}`,
        reporters: [
          { name: 'playwright-enhanced-reporter', options: { 
            outputFolder: `./test-results/${env}/enhanced-report`,
            open: env !== 'prod' ? 'always' : 'never',
            showTrace: true,
            showScreenshots: true
          }},
          { name: 'junit', options: { outputFile: `./test-results/${env}/junit-report.xml` } },
          { name: 'json', options: { outputFile: `./test-results/${env}/test-results.json` } },
          { name: 'list' }
        ],
        htmlReport: true,
        junitReport: env !== 'dev'
      },
      api: {
        baseURL: settings.apiBaseURL || settings.baseURL,
        timeout: 15000,
        retries: 3
      }
    };
  }

  /**
   * @description Convert internal config to Playwright config format
   * @param config - Internal test configuration
   * @returns Playwright configuration
   */
  static toPlaywrightConfig(config: TestConfig): PlaywrightTestConfig {
    return {
      testDir: './src/tests',
      timeout: config.execution.timeout,
      retries: config.execution.retries,
      workers: config.execution.workers,
      
      outputDir: config.reporting.outputDir,
      
      use: {
        ...config.execution.use,
        actionTimeout: 10000,
        navigationTimeout: 30000
      },
      
      projects: config.browsers.map(browser => ({
        name: browser.name,
        use: browser.use,
        testDir: browser.testDir,
        testIgnore: browser.testIgnore,
        dependencies: browser.dependencies
      })),
      
      reporter: config.reporting.reporters.map(reporter => 
        reporter.options 
          ? [reporter.name, reporter.options] 
          : [reporter.name]
      )
    };
  }
}

/* ===== CONFIGURATION MANAGER ===== */

/**
 * @class ConfigManager
 * @description Singleton configuration manager with advanced features
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private readonly currentConfig: TestConfig;
  private readonly environment: Environment;

  private constructor() {
    // Initialize environment utilities
    Utils.Environment.configure();
    
    // Determine environment with fallback
    this.environment = this.detectEnvironment();
    this.currentConfig = ConfigurationFactory.createConfig(this.environment);
    
    // Validate configuration
    this.validateConfiguration();
  }

  /**
   * @description Get singleton instance
   * @returns ConfigManager instance
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * @description Detect current environment from various sources
   * @returns Detected environment
   */
  private detectEnvironment(): Environment {
    const envSources = [
      Utils.Environment.get('NODE_ENV'),
      Utils.Environment.get('TEST_ENV'),
      Utils.Environment.get('ENVIRONMENT'),
      'qa' // fallback
    ];

    const detectedEnv = envSources.find(env => 
      env && ['dev', 'qa', 'staging', 'prod'].includes(env)
    ) as Environment;

    console.log(`🌍 Detected environment: ${detectedEnv}`);
    return detectedEnv;
  }

  /**
   * @description Validate configuration completeness
   * @throws Error if configuration is invalid
   */
  private validateConfiguration(): void {
    const required = ['baseURL', 'timeout', 'retries'];
    const missing = required.filter(key => !this.currentConfig.execution[key as keyof ExecutionConfig]);
    
    if (missing.length > 0) {
      throw new Error(`Invalid configuration: missing ${missing.join(', ')}`);
    }
  }

  /**
   * @description Get current test configuration
   * @returns Current test configuration
   */
  getConfig(): TestConfig {
    return this.currentConfig;
  }

  /**
   * @description Get Playwright-compatible configuration
   * @returns Playwright configuration
   */
  getPlaywrightConfig(): PlaywrightTestConfig {
    return ConfigurationFactory.toPlaywrightConfig(this.currentConfig);
  }

  /**
   * @description Get environment-specific setting
   * @param key - Setting key
   * @returns Setting value or undefined
   */
  getSetting<T>(key: string): T | undefined {
    return Utils.Environment.get(key) as T;
  }

  /**
   * @description Get current environment
   * @returns Current environment
   */
  getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * @description Check if running in production
   * @returns True if in production environment
   */
  isProduction(): boolean {
    return this.environment === 'prod';
  }

  /**
   * @description Check if debug mode is enabled
   * @returns True if debug mode is active
   */
  isDebugMode(): boolean {
    return this.environment === 'dev' || Boolean(Utils.Environment.get('DEBUG'));
  }
}

/* ===== EXPORTS ===== */

/** Global configuration instance */
export const config = ConfigManager.getInstance();

/** Export types for external use */
export type { 
  Environment, 
  TestConfig, 
  BrowserConfig, 
  ExecutionConfig, 
  EnvironmentSettings,
  ReporterConfig 
};

/** Default export for Playwright config file */
export default config.getPlaywrightConfig();
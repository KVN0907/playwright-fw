/**
 * Simplified Playwright Test Configuration
 * Uses unified ConfigManager for straightforward configuration
 */

import { PlaywrightTestConfig, devices } from '@playwright/test';
import { config } from '../lib/config/ConfigManager';

// Get configuration from unified manager
const environment = config.getEnvironment();
const envConfig = config.getConfig();

/**
 * Playwright configuration with sensible defaults
 */
const playwrightConfig: PlaywrightTestConfig = {
  testDir: './src/tests',
  timeout: envConfig.timeout,
  retries: envConfig.retries,
  workers: envConfig.workers,
  outputDir: `./test-results/${environment}`,

  use: {
    baseURL: envConfig.baseURL,
    headless: envConfig.headless,
    screenshot: envConfig.screenshot ? 'on' : 'off',
    video: envConfig.video ? 'on' : 'off',
    trace: envConfig.trace ? 'on' : 'off',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(envConfig.slowMo > 0 && { launchOptions: { slowMo: envConfig.slowMo } }),
      },
      testDir: './src/tests',
      testIgnore: ['**/node_modules/**', '**/api/**'],
    },
    {
      name: 'api',
      use: {
        baseURL: envConfig.apiURL,
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
      testDir: './src/tests/api',
    },
  ],

  reporter: [
    [
      'playwright-enhanced-reporter',
      {
        outputFolder: `./test-results/${environment}/enhanced-report`,
        open: environment !== 'prod' ? 'always' : 'never',
        showTrace: true,
        showScreenshots: true,
      },
    ],
    ['junit', { outputFile: `./test-results/${environment}/junit-report.xml` }],
    ['json', { outputFile: `./test-results/${environment}/test-results.json` }],
    ['list'],
  ],
};

export default playwrightConfig;

/**
 * Simplified Playwright Test Configuration
 * Uses unified ConfigManager for straightforward configuration
 */

import { PlaywrightTestConfig, devices } from '@playwright/test';
import { config } from '../lib/config/ConfigManager';
import * as path from 'path';

// Get configuration from unified manager
const environment = config.getEnvironment();
const envConfig = config.getConfig();

// Auth state file path
const AUTH_FILE = path.join(__dirname, '../../auth.json');

/**
 * Playwright configuration with sensible defaults
 */
const playwrightConfig: PlaywrightTestConfig = {
  testDir: './src/tests',
  timeout: envConfig.timeout,
  retries: envConfig.retries,
  workers: envConfig.workers,
  outputDir: `./test-results/${environment}`,

  // Global setup for browser authentication
  globalSetup: require.resolve('./global-setup'),

  use: {
    baseURL: envConfig.baseURL,
    headless: process.env.CI ? true : envConfig.headless,
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
        // Use saved auth state from browser login
        storageState: AUTH_FILE,
      },
      testDir: './src/tests/api',
    },
  ],

  reporter: [
    ['html', { outputFolder: './playwright-report', open: 'never' }],
    [
      'playwright-enhanced-reporter',
      {
        outputFolder: `./test-results/${environment}/enhanced-report`,
        open: environment !== 'prod' ? 'always' : 'never',
        showTrace: true,
        showScreenshots: true,
        title: 'COMPLIANCE MANAGER AUTOMATION TESTS',
      },
    ],
    ['junit', { outputFile: `./test-results/${environment}/junit-report.xml` }],
    ['json', { outputFile: `./test-results/${environment}/test-results.json` }],
    ['list'],
  ],
};

export default playwrightConfig;

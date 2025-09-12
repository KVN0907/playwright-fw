import { defineConfig, devices } from '@playwright/test';
// import { CurrentsConfig, currentsReporter } from '@currents/playwright'; // Commented out for future use
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs-extra';
import type { PlaywrightTestConfig } from '@playwright/test';
import Log from './tests/utils/Log';
import { ConfigManager } from './tests/utils/ConfigManager';

// Load environment variables from the .env file based on TEST_ENV
dotenv.config({
  path: process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env',
  override: Boolean(process.env.TEST_ENV),
});

// Get configuration
let configManager: ConfigManager;
let config: any;

try {
  configManager = ConfigManager.getInstance();
  config = configManager.getConfig();
} catch (error) {
  console.warn('ConfigManager not available, using default configuration');

  // Get environment-specific URL
  const ENV = process.env.NODE_ENV || 'development';
  let baseURL = process.env[`${ENV.toUpperCase()}_APP_URL`];
  if (!baseURL) {
    baseURL = process.env.APP_URL;
  }
  if (!baseURL) {
    throw new Error(
      `No base URL found for environment ${ENV}. Please set ${ENV.toUpperCase()}_APP_URL or APP_URL in your environment variables.`
    );
  }

  config = {
    baseURL: baseURL,
    headless: process.env.HEADLESS !== 'false',
    retries: parseInt(process.env.RETRIES || '1'),
    workers: parseInt(process.env.WORKERS || '4'),
    timeout: parseInt(process.env.TIMEOUT || '30000'),
    trace: process.env.TRACE === 'true',
    video: process.env.VIDEO === 'true',
    screenshot: process.env.SCREENSHOT === 'true',
  };
}

// Paths for directories
const reportsDir = path.join('.', 'test-results', 'reports');
const screenshotsDir = path.join('.', 'test-results', 'screenshots');
const videosDir = path.join('.', 'test-results', 'videos');

// Ensure directories and clean up old test results
fs.ensureDirSync(reportsDir);
fs.ensureDirSync(screenshotsDir);
fs.ensureDirSync(videosDir);

// Clean up old files with proper glob patterns
if (fs.existsSync(reportsDir)) {
  const reportFiles = fs.readdirSync(reportsDir).filter(file => file.endsWith('.json'));
  reportFiles.forEach(file => fs.removeSync(path.join(reportsDir, file)));
}
if (fs.existsSync(screenshotsDir)) {
  const screenshotFiles = fs.readdirSync(screenshotsDir).filter(file => file.endsWith('.png'));
  screenshotFiles.forEach(file => fs.removeSync(path.join(screenshotsDir, file)));
}
if (fs.existsSync(videosDir)) {
  const videoFiles = fs.readdirSync(videosDir).filter(file => file.endsWith('.webm'));
  videoFiles.forEach(file => fs.removeSync(path.join(videosDir, file)));
}

// Define the environment (default to 'development' if not set)
const ENV = process.env.NODE_ENV || 'development';
Log.info(`Environment: ${ENV}`);
Log.info(`baseURL: ${config.baseURL}`);

// Currents Config - Commented out for future use
// const currentsConfig: CurrentsConfig = {
//   recordKey: '86CygT0blrunOUXm',
//   projectId: 'VKVIEo',
//   ciBuildId: Date.now().toString(),
//   tag: ['playwright', 'test', ENV],
// };

const playwrightConfig: PlaywrightTestConfig = defineConfig({
  globalSetup: require.resolve('./testConfig/globalSetup.ts'),
  testDir: './tests',
  fullyParallel: false, // Changed to false for sequential execution
  forbidOnly: Boolean(process.env.CI),
  retries: config.retries,
  workers: 1, // Set to 1 worker for sequential execution
  timeout: config.timeout,
  expect: {
    timeout: 10000, // Expect timeout
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }], // Disable auto-open
    ['line'],
    ['json', { outputFile: path.join(reportsDir, 'results.json') }],
    ['junit', { outputFile: path.join(reportsDir, 'junit.xml') }],
    // currentsReporter(currentsConfig), // Commented out for future use
    [
      'playwright-enhanced-reporter',
      {
        outputDir: './test-results/reports',
        outputFile: 'enhanced-report.html',
        title: 'Automation Results',
        includeCharts: true,
        includeTrends: true,
        openReport: false,
        theme: 'auto', // 'light', 'dark', or 'auto'
      },
    ],
  ],
  use: {
    baseURL: config.baseURL,
    headless: config.headless,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    trace: config.trace ? 'retain-on-failure' : 'off',
    video: config.video ? 'retain-on-failure' : 'off',
    screenshot: config.screenshot ? 'only-on-failure' : 'off',
    // Only use storageState for browser_session authentication
    ...((process.env[`${ENV.toUpperCase()}_AUTH_TYPE`] || process.env.AUTH_TYPE) ===
      'browser_session' || !(process.env[`${ENV.toUpperCase()}_AUTH_TYPE`] || process.env.AUTH_TYPE)
      ? { storageState: './auth.json' }
      : {}),
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Commented out other browsers to run only chromium
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  outputDir: 'test-results/',
});

export default playwrightConfig;

import { defineConfig, devices } from '@playwright/test';
import { CurrentsConfig, currentsReporter } from "@currents/playwright";
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs-extra';
import type { PlaywrightTestConfig } from "@playwright/test";
import Log from './tests/utils/Log'; // Adjust the path as necessary

// Load environment variables from the .env file based on TEST_ENV
dotenv.config({
  path: process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env',
  override: Boolean(process.env.TEST_ENV),
});

// Paths for directories
const reportsDir = path.join('.', 'test-results', 'reports');
const screenshotsDir = path.join('.', 'test-results', 'screenshots');
const videosDir = path.join('.', 'test-results', 'videos');

// Ensure directories and clean up old test results
fs.ensureDirSync(reportsDir);
fs.removeSync(screenshotsDir);
fs.removeSync(videosDir);

// Define the environment (default to 'development' if not set)
const ENV = process.env.NODE_ENV || 'development';
Log.info(`Environment: ${ENV}`);

// Retrieve the baseURL from the environment variables based on the environment
const BASE_URL = process.env[`${ENV.toUpperCase()}_BASE_URL`] || 'https://eyhive-dev.ey.com/';
Log.info(`baseURL: ${BASE_URL}`);

// Currents Config
const currentsConfig: CurrentsConfig = {
  recordKey: "86CygT0blrunOUXm", 
  projectId: "VKVIEo", 
  ciBuildId: Date.now().toString(),
  tag: ["playwright", "test"],
  debug: "remote"
};

const config: PlaywrightTestConfig = defineConfig({
  globalSetup: require.resolve('./testConfig/globalSetup.ts'), 
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.RETRIES ? parseInt(process.env.RETRIES, 10) : 0,
  workers: process.env.PARALLEL_THREAD ? parseInt(process.env.PARALLEL_THREAD, 10) : undefined,
  reporter: [
    ["html"], // Default HTML reporter
    ["line"], // Default CLI reporter
    currentsReporter(currentsConfig), // Currents reporter
    [
      "json",
      {
        outputFile: path.join(reportsDir, 'cucumber.json'), // Use path.join for file paths
      },
    ],
  ],
  use: {
    baseURL: BASE_URL, // Use the environment-specific baseURL
    trace: 'on',
    storageState: 'storageState.json',
  },
});

export default config;

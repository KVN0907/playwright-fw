// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { CurrentsConfig, currentsReporter } from "@currents/playwright";
import * as dotenv from 'dotenv';
import * as path from 'path';
import type { PlaywrightTestConfig } from "@playwright/test";
import { Status } from "allure-js-commons";
import * as os from "node:os";

// Load environment variables from the .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Define the environment (default to 'development' if not set)
const ENV = process.env.NODE_ENV || 'development';
console.log(`Environment: ${ENV}`);

// Retrieve the baseURL from the environment variables based on the environment
const BASE_URL = process.env[`${ENV.toUpperCase()}_BASE_URL`] || 'https://saasifier-dev.ey.com/';
console.log(`baseURL: ${BASE_URL}`);

//Curents Config

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
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"], // Default HTML reporter
    ["line"], // Default CLI reporter
    currentsReporter(currentsConfig), // Currents reporter
    [
      "allure-playwright", // Allure reporter
      {
        resultsDir: "allure-results", // Custom results directory for Allure reports
      },
    ],
    [
      "allure-playwright",
      {
        resultsDir: "./out/allure-results",
        detail: true,
        suiteTitle: true,
        links: {
          issue: {
            nameTemplate: "Issue #%s",
            urlTemplate: "https://issues.example.com/%s",
          },
          tms: {
            nameTemplate: "TMS #%s",
            urlTemplate: "https://tms.example.com/%s",
          },
          jira: {
            urlTemplate: (v) => `https://jira.example.com/browse/${v}`,
          },
        },
        categories: [
          {
            name: "foo",
            messageRegex: "bar",
            traceRegex: "baz",
            matchedStatuses: [Status.FAILED, Status.BROKEN],
          },
        ],
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          os_version: os.version(),
          node_version: process.version,
        },
      },
    ],
  ],
  use: {
    baseURL: BASE_URL, // Use the environment-specific baseURL
    trace: 'on',
    storageState: 'storageState.json',
    video: "on",
    screenshot: "on",
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // ... other projects
  ],
  // ... other configuration options
});

export default config;

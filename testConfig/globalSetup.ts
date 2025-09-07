// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { AuthenticationManager } from '../tests/utils/AuthenticationManager';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from environment-specific .env file
function loadEnvWithDebug() {
  // Load environment-specific .env file based on NODE_ENV
  const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
  const envPath = path.resolve(__dirname, `../${envFile}`);

  console.log(`Loading environment variables from: ${envPath}`);

  if (!fs.existsSync(envPath)) {
    console.error(`ERROR: ${envFile} file not found at ${envPath}`);
    // Fallback to main .env file
    const fallbackPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(fallbackPath)) {
      console.log(`Falling back to: ${fallbackPath}`);
      dotenv.config({ path: fallbackPath });
      return true;
    }
    return false;
  }

  // Load the environment-specific file
  dotenv.config({
    path: envPath,
    override: true,
  });

  return true;
}

async function globalSetup(config: FullConfig) {
  // Load environment variables with debug info
  const envLoaded = loadEnvWithDebug();
  if (!envLoaded) {
    process.exit(1);
  }

  // Get the current environment
  const ENV = process.env.NODE_ENV || 'qa';
  console.log(`Using environment: ${ENV.toUpperCase()}`);

  // Debug all relevant environment variables
  console.log('--- Environment Variables Debug ---');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`APP_URL: ${process.env.APP_URL}`);
  console.log(`${ENV.toUpperCase()}_APP_URL: ${process.env[`${ENV.toUpperCase()}_APP_URL`]}`);
  console.log(`${ENV.toUpperCase()}_USERNAME: ${process.env[`${ENV.toUpperCase()}_USERNAME`]}`);
  console.log(
    `${ENV.toUpperCase()}_PASSWORD: ${process.env[`${ENV.toUpperCase()}_PASSWORD`] ? '****' : 'not set'}`
  );
  console.log('-----------------------------------');

  // Get the base URL for the current environment with explicit fallback
  let baseURL = process.env[`${ENV.toUpperCase()}_APP_URL`];
  if (!baseURL) {
    console.log(`Warning: ${ENV.toUpperCase()}_APP_URL not found, trying APP_URL fallback`);
    baseURL = process.env.APP_URL;
  }

  // Log and exit if no base URL is configured
  if (!baseURL) {
    console.error(`ERROR: No base URL configured for environment ${ENV.toUpperCase()}`);
    console.error('Please check your .env file and ensure APP_URL or ${ENV}_APP_URL is set');
    process.exit(1);
  }

  console.log(`Base URL: ${baseURL}`);

  // Get credentials for the current environment
  const username = process.env[`${ENV.toUpperCase()}_USERNAME`];
  const password = process.env[`${ENV.toUpperCase()}_PASSWORD`];

  // Log and exit if credentials are missing
  if (!username || !password) {
    console.error(`ERROR: Credentials not configured for environment ${ENV.toUpperCase()}`);
    console.error(
      'Please check your .env file and ensure ${ENV}_USERNAME and ${ENV}_PASSWORD are set'
    );
    process.exit(1);
  }

  // Launch browser and create a new page
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const authManager = AuthenticationManager.getInstance();

  try {
    console.log(`Authentication Type: ${authManager.getAuthType()}`);

    // Authenticate using the configured method
    const authResult = await authManager.authenticate(page, page.request);

    if (!authResult.success) {
      console.error(`Authentication failed: ${authResult.error}`);
      process.exit(1);
    }

    console.log('✅ Authentication successful');

    // For browser session authentication, save storage state
    if (authManager.getAuthType() === 'browser_session') {
      // Store authentication state
      const authPath = path.resolve(__dirname, '../auth.json');
      await page.context().storageState({ path: authPath });
      console.log(`Authentication state saved to: ${authPath}`);
    } else {
      // For token-based auth, we don't need to save browser state
      // The AuthenticationManager will handle token storage internally
      console.log('Token-based authentication configured - no browser state to save');
    }
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;

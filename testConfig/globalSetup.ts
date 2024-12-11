// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import { SsoLoginPage } from '../tests/uiTests/pageObjects/ssoLoginPage'; 

// Load environment variables from the .env file
dotenv.config();

async function globalSetup(config: FullConfig) {
  console.log('Starting global setup...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const ssoLoginPage = new SsoLoginPage(page);

  // Define the environment (default to 'development' if not set)
  const ENV = process.env.NODE_ENV || 'dev';

  // Retrieve SSO credentials from environment variables based on the environment
  const username = process.env[`${ENV.toUpperCase()}_SSO_USERNAME`];
  const password = process.env[`${ENV.toUpperCase()}_SSO_PASSWORD`];

  // Use the baseURL from the first project configuration as an example
  // Ensure that baseURL is always a string
  const { baseURL, storageState } = config.projects[0].use;
  console.log(`Using baseURL: ${baseURL}`);

  // Ensure that username and password are defined
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new Error(`${ENV.toUpperCase()}_SSO_USERNAME or ${ENV.toUpperCase()}_SSO_PASSWORD environment variable is not set or not a string.`);
  }

  // Navigate to the SSO login page and perform the login
  await page.goto(baseURL!); 
  await ssoLoginPage.login(username, password);

  await page.waitForURL("https://saasifier-dev.ey.com/");
  // Save signed-in state to 'storageState.json'
  await page.context().storageState({ path: 'storageState.json' });

  await browser.close();
  console.log('Global setup completed.');
}

export default globalSetup;

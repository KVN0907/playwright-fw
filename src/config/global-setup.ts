/**
 * Global Setup - Browser Session Authentication
 * Logs in via browser and saves auth state for API tests
 */

import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from '../pages/common/LoginPage';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment config
const envFile = process.env.NODE_ENV || 'qa';
dotenv.config({
  path: path.resolve(__dirname, `../../config/environments/${envFile}.env`),
  override: true,
});

const AUTH_FILE = path.join(__dirname, '../../auth.json');

async function globalSetup(config: FullConfig) {
  const env = process.env.NODE_ENV || 'qa';
  const ENV = env.toUpperCase();

  const baseURL = process.env[`${ENV}_APP_URL`] || process.env.APP_URL || '';
  const username = process.env[`${ENV}_USERNAME`] || process.env.USERNAME || '';
  const password = process.env[`${ENV}_PASSWORD`] || process.env.PASSWORD || '';

  console.log(`\n🔐 Global Setup: Browser Session Authentication`);
  console.log(`   Environment: ${env}`);
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   Username: ${username}`);

  if (!baseURL || !username || !password) {
    console.log('⚠️  Missing credentials, skipping browser auth setup');
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    console.log('   Navigating to login page...');
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });

    const loginPage = new LoginPage(page);

    console.log('   Performing login...');
    await loginPage.login(username, password);

    // Wait for successful login (adjust selector based on your app)
    await page.waitForURL(url => !url.href.includes('login'), { timeout: 60000 });

    console.log('   Saving auth state...');
    await context.storageState({ path: AUTH_FILE });

    console.log('✅ Auth state saved to auth.json');
  } catch (error) {
    console.error('❌ Browser auth setup failed:', error);
    // Take screenshot on failure
    await page.screenshot({ path: 'test-results/auth-setup-failure.png' });
  } finally {
    await browser.close();
  }
}

export default globalSetup;

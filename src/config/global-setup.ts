/**
 * Global Setup - Multi-Role Browser Session Authentication
 * Logs in multiple user roles via browser and saves auth states for API tests
 *
 * Auth files are stored per environment in .auth/{env}/ directory:
 * - .auth/qa/auth.json (Super Admin)
 * - .auth/qa/auth-ey-admin.json (EY Admin)
 * - .auth/qa/auth-client-admin.json (Client Admin)
 * - .auth/dev/auth.json (Super Admin)
 * - etc.
 */

import { chromium, FullConfig, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/common/LoginPage';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment config
const envFile = process.env.NODE_ENV || 'qa';
dotenv.config({
  path: path.resolve(__dirname, `../../config/environments/${envFile}.env`),
  override: true,
});

// Auth directory per environment
const AUTH_BASE_DIR = path.join(__dirname, '../../.auth');

/**
 * Get auth file paths for a specific environment
 */
export function getAuthFilePaths(env: string = envFile) {
  const authDir = path.join(AUTH_BASE_DIR, env);
  return {
    dir: authDir,
    superAdmin: path.join(authDir, 'auth.json'),
    eyAdmin: path.join(authDir, 'auth-ey-admin.json'),
    clientAdmin: path.join(authDir, 'auth-client-admin.json'),
  };
}

// Current environment auth files
const AUTH_FILES = getAuthFilePaths(envFile);

interface UserCredentials {
  username: string;
  password: string;
  authFile: string;
  roleName: string;
  optional?: boolean;
}

/**
 * Check if auth file exists and is recent (less than 1 hour old)
 */
function isAuthFileValid(authFile: string, maxAgeHours = 1): boolean {
  if (!fs.existsSync(authFile)) return false;
  const stats = fs.statSync(authFile);
  const ageInHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
  return ageInHours < maxAgeHours;
}

/**
 * Authenticate a single user via Keycloak
 */
async function authenticateUser(
  page: Page,
  context: BrowserContext,
  baseURL: string,
  creds: UserCredentials,
  loginType: string
): Promise<boolean> {
  console.log(`\n   👤 Authenticating ${creds.roleName}...`);
  console.log(`      Username: ${creds.username}`);

  // Check if auth file already valid
  if (isAuthFileValid(creds.authFile)) {
    console.log(`      ✅ Using existing auth state (less than 1 hour old)`);
    return true;
  }

  if (!creds.username || !creds.password) {
    if (creds.optional) {
      console.log(`      ⚠️ Credentials not configured, skipping`);
      return false;
    }
    console.log(`      ❌ Missing credentials`);
    return false;
  }

  try {
    // Clear cookies for fresh login
    await context.clearCookies();

    // Navigate to app
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });

    if (loginType === 'keycloak') {
      // Check if we're on keycloak login page or need to click login button
      const currentUrl = page.url();
      if (!currentUrl.includes('auth') && !currentUrl.includes('keycloak')) {
        const loginButton = page.locator('role=button[name="Login"]');
        if (await loginButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await loginButton.click();
          await page.waitForLoadState('networkidle');
        }
      }

      // Fill keycloak form
      await page.locator('#username').fill(creds.username);
      await page.locator('#password').fill(creds.password);
      await page.locator('#kc-login').click();
    } else {
      const loginPage = new LoginPage(page);
      await loginPage.login(creds.username, creds.password);
    }

    // Wait for successful login
    await page.waitForURL(url => !url.href.includes('login') && !url.href.includes('auth'), {
      timeout: 60000,
    });

    // Save auth state
    await context.storageState({ path: creds.authFile });
    console.log(`      ✅ Auth state saved to ${path.basename(creds.authFile)}`);
    return true;
  } catch (error) {
    console.error(`      ❌ Authentication failed:`, error);
    await page.screenshot({
      path: `test-results/auth-failure-${creds.roleName.toLowerCase().replace(' ', '-')}.png`,
    });
    return false;
  }
}

async function globalSetup(_config: FullConfig) {
  const env = process.env.NODE_ENV || 'qa';
  const ENV = env.toUpperCase();

  const baseURL = process.env[`${ENV}_APP_URL`] || process.env.APP_URL || '';
  const loginType = process.env.LOGIN_TYPE || 'browser_session';

  console.log(`\n🔐 Global Setup: Multi-Role Browser Authentication`);
  console.log(`   Environment: ${env}`);
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   Login type: ${loginType}`);
  console.log(`   Auth directory: .auth/${env}/`);

  if (!baseURL) {
    console.log('⚠️  Missing base URL, skipping auth setup');
    return;
  }

  // Ensure auth directory exists for this environment
  if (!fs.existsSync(AUTH_FILES.dir)) {
    fs.mkdirSync(AUTH_FILES.dir, { recursive: true });
    console.log(`   Created auth directory: ${AUTH_FILES.dir}`);
  }

  // Define users to authenticate
  const users: UserCredentials[] = [
    {
      username: process.env[`${ENV}_USERNAME`] || process.env.QA_USERNAME || '',
      password: process.env[`${ENV}_PASSWORD`] || process.env.QA_PASSWORD || '',
      authFile: AUTH_FILES.superAdmin,
      roleName: 'Super Admin',
      optional: false,
    },
    {
      username: process.env.EY_ADMIN_USERNAME || '',
      password: process.env.EY_ADMIN_PASSWORD || '',
      authFile: AUTH_FILES.eyAdmin,
      roleName: 'EY Admin',
      optional: true, // Don't fail if not configured
    },
    {
      username: process.env.CLIENT_ADMIN_USERNAME || '',
      password: process.env.CLIENT_ADMIN_PASSWORD || '',
      authFile: AUTH_FILES.clientAdmin,
      roleName: 'Client Admin',
      optional: true, // Don't fail if not configured
    },
  ];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const success = await authenticateUser(page, context, baseURL, user, loginType);
      if (success) {
        successCount++;
      } else if (!user.optional) {
        failCount++;
      }
    }

    console.log(`\n📊 Authentication Summary: ${successCount} succeeded, ${failCount} failed`);

    if (failCount > 0) {
      console.error('❌ Required authentications failed');
    } else {
      console.log('✅ All required authentications completed');
    }
  } finally {
    await browser.close();
  }
}

export default globalSetup;

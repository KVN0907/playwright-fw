/**
 * @fileoverview Role-Based API Fixtures
 * @description Provides authenticated API request contexts for different user roles
 *
 * Usage in tests:
 *   import { test, expect } from '../fixtures/apiRoleFixtures';
 *
 *   test('compare responses by role', async ({ superAdminRequest, eyAdminRequest }) => {
 *     const superAdminResponse = await superAdminRequest.get('/api/admin/api/clients');
 *     const eyAdminResponse = await eyAdminRequest.get('/api/admin/api/clients');
 *     // Compare or use both...
 *   });
 */

import { test as base, APIRequestContext } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Auth file paths
const AUTH_DIR = path.join(__dirname, '../../../');
const SUPER_ADMIN_AUTH = path.join(AUTH_DIR, 'auth.json');
const EY_ADMIN_AUTH = path.join(AUTH_DIR, 'auth-ey-admin.json');
const CLIENT_ADMIN_AUTH = path.join(AUTH_DIR, 'auth-client-admin.json');

/**
 * Role-based fixture types
 */
export type RoleFixtures = {
  /** Unauthenticated API request context (for login/auth endpoints) */
  request: APIRequestContext;
  /** API request context authenticated as Super Admin (default from global setup) */
  superAdminRequest: APIRequestContext;
  /** API request context authenticated as EY Admin */
  eyAdminRequest: APIRequestContext;
  /** API request context authenticated as Client Admin */
  clientAdminRequest: APIRequestContext;
};

/**
 * Helper to create API context with auth state
 */
async function createAuthenticatedContext(
  playwright: (typeof import('@playwright/test'))['default']['prototype'],
  authFile: string,
  roleName: string
): Promise<APIRequestContext> {
  const baseURL =
    process.env.QA_APP_URL || process.env.APP_URL || 'https://eycompliancemanager-uat.ey.com/';

  if (!fs.existsSync(authFile)) {
    console.warn(`⚠️ Auth file not found for ${roleName}: ${authFile}`);
    console.warn(`   Run global setup or create auth file manually`);
    // Return unauthenticated context - tests will likely fail with 401
    return await playwright.request.newContext({
      baseURL,
      ignoreHTTPSErrors: true,
    });
  }

  return await playwright.request.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
    storageState: authFile,
  });
}

/**
 * Extended test with role-based API fixtures
 */
export const test = base.extend<RoleFixtures>({
  // Unauthenticated request - for login/auth endpoints
  request: async ({ playwright }, use) => {
    const baseURL =
      process.env.QA_APP_URL || process.env.APP_URL || 'https://eycompliancemanager-uat.ey.com/';
    const context = await playwright.request.newContext({
      baseURL,
      ignoreHTTPSErrors: true,
    });
    await use(context);
    await context.dispose();
  },

  // Super Admin - uses default auth.json from global setup
  superAdminRequest: async ({ playwright }, use) => {
    const context = await createAuthenticatedContext(playwright, SUPER_ADMIN_AUTH, 'Super Admin');
    await use(context);
    await context.dispose();
  },

  // EY Admin - uses auth-ey-admin.json
  eyAdminRequest: async ({ playwright }, use) => {
    const context = await createAuthenticatedContext(playwright, EY_ADMIN_AUTH, 'EY Admin');
    await use(context);
    await context.dispose();
  },

  // Client Admin - uses auth-client-admin.json
  clientAdminRequest: async ({ playwright }, use) => {
    const context = await createAuthenticatedContext(playwright, CLIENT_ADMIN_AUTH, 'Client Admin');
    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';

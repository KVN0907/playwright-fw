import { test as base, expect, Page } from '@playwright/test';
import { HomePage } from '../../pages/common/HomePage';
import { LoginPage } from '../../pages/common/LoginPage';
import { APITestHelper } from '../../lib/APITestHelper';
import Log from '../../lib/Log';
import * as path from 'path';
import * as fs from 'fs';

// Define the types for your fixtures
type MyFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  loggedInPage: Page;
  apiHelper: APITestHelper;
};

// Extend the base test with your fixtures
export const test = base.extend<MyFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  loggedInPage: async ({ page }, use) => {
    // Use the existing storage state for authenticated tests
    await use(page);
  },

  apiHelper: async ({ playwright }, use) => {
    // Load the stored authentication state
    const authPath = path.resolve(__dirname, '../../../auth.json');
    let storageState = {};
    
    try {
      if (fs.existsSync(authPath)) {
        storageState = { storageState: authPath };
        Log.info(`Using stored authentication from: ${authPath}`);
      } else {
        Log.info('No stored auth state found, proceeding without authentication');
      }
    } catch (error) {
      Log.info(`Failed to load auth state: ${error}`);
    }

    const apiContext = await playwright.request.newContext({
      ignoreHTTPSErrors: true,
      ...storageState
    });
    
    const apiHelper = new APITestHelper(apiContext);
    await use(apiHelper);
    await apiContext.dispose();
  },
});

export { expect } from '@playwright/test';

// Base test class for common test operations
export class BaseTest {
  static async executeWithLogging<T>(
    scenarioName: string,
    testAction: () => Promise<T>
  ): Promise<T> {
    Log.testBegin(scenarioName);
    try {
      const result = await testAction();
      Log.testEnd(scenarioName, 'PASSED');
      return result;
    } catch (error) {
      Log.error(`Test failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      Log.testEnd(scenarioName, 'FAILED');
      throw error;
    }
  }
}

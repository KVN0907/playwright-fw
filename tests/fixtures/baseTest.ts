import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../uiTests/pageObjects/LoginPage';
import { Document360DashboardPage } from '../uiTests/pageObjects/Document360DashboardPage';
import { Document360ProjectCreationPage } from '../uiTests/pageObjects/Document360ProjectCreationPage';
import { Document360ProjectSettingsPage } from '../uiTests/pageObjects/Document360ProjectSettingsPage';
import { APITestHelper } from '../utils/APITestHelper';
import Log from '../utils/Log';

// Define the types for your fixtures
type MyFixtures = {
  loginPage: LoginPage;
  document360DashboardPage: Document360DashboardPage;
  document360ProjectCreationPage: Document360ProjectCreationPage;
  document360ProjectSettingsPage: Document360ProjectSettingsPage;
  loggedInPage: Page;
  apiHelper: APITestHelper;
};

// Extend the base test with your fixtures
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  document360DashboardPage: async ({ page }, use) => {
    const document360DashboardPage = new Document360DashboardPage(page);
    await use(document360DashboardPage);
  },

  document360ProjectCreationPage: async ({ page }, use) => {
    const document360ProjectCreationPage = new Document360ProjectCreationPage(page);
    await use(document360ProjectCreationPage);
  },

  document360ProjectSettingsPage: async ({ page }, use) => {
    const document360ProjectSettingsPage = new Document360ProjectSettingsPage(page);
    await use(document360ProjectSettingsPage);
  },

  loggedInPage: async ({ page }, use) => {
    // Use the existing storage state for authenticated tests
    await use(page);
  },

  apiHelper: async ({ playwright }, use) => {
    const apiContext = await playwright.request.newContext({
      ignoreHTTPSErrors: true,
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

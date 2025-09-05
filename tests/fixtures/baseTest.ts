import { test as base, Page, APIRequestContext } from '@playwright/test';
import { HomePage } from '../uiTests/pageObjects/HomePage';
import { SsoLoginPage } from '../uiTests/pageObjects/SsoLoginPage';
import { APITestHelper } from '../utils/APITestHelper';
import Log from '../utils/Log';

// Define the types for your fixtures
type MyFixtures = {
  homePage: HomePage;
  ssoLoginPage: SsoLoginPage;
  loggedInPage: Page;
  apiHelper: APITestHelper;
};

// Extend the base test with your fixtures
export const test = base.extend<MyFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  ssoLoginPage: async ({ page }, use) => {
    const ssoLoginPage = new SsoLoginPage(page);
    await use(ssoLoginPage);
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
  }
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

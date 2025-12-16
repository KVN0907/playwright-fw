/**
 * @fileoverview Advanced Test Fixtures
 * @description Enhanced fixtures with dependency injection and smart context management
 * @version 1.0
 */

import { test as base, Page, TestInfo, PlaywrightWorkerArgs } from '@playwright/test';
import { APITestHelper } from '../../lib/api/APITestHelper';
import { HomePage } from '../../pages/common/HomePage';
import { LoginPage } from '../../pages/common/LoginPage';
import { LocationLibraryPage } from '../../pages/common/LocationLibraryPage';
import { EYAdminClientListingPage } from '../../pages/eyadmin/EYAdminClientListingPage';
import { RegulationConfigPanelPage } from '../../pages/eyadmin/RegulationConfigPanelPage';
import { MasterQuestionnairePage } from '../../pages/eyadmin/MasterQuestionnairePage';
import { EYAdminUserManagementPage } from '../../pages/eyadmin/EYAdminUserManagementPage';
import {
  UserBuilder,
  OrganizationBuilder,
  LocationBuilder,
  ScenarioBuilder,
} from '../../lib/testData';
import { pluginManager } from '../../lib/plugins';
import { RuntimeDataResolver } from '../../lib/testData/RuntimeDataResolver';
import { runtimeConfig } from '../../lib/testData/RuntimeDataConfig';
import Log from '../../lib/utils/Log';
import * as fs from 'fs-extra';
import * as path from 'path';

/* ===== FIXTURE TYPES ===== */

/**
 * Advanced fixture types with dependency injection
 */
export type AdvancedFixtures = {
  // Page Objects
  homePage: HomePage;
  loginPage: LoginPage;
  locationLibraryPage: LocationLibraryPage;
  eyAdminClientListingPage: EYAdminClientListingPage;
  regulationConfigPanelPage: RegulationConfigPanelPage;
  masterQuestionnairePage: MasterQuestionnairePage;
  eyAdminUserManagementPage: EYAdminUserManagementPage;

  // API Helpers
  apiHelper: APITestHelper;
  authenticatedApi: APITestHelper;

  // Test Data Builders
  userBuilder: typeof UserBuilder;
  organizationBuilder: typeof OrganizationBuilder;
  locationBuilder: typeof LocationBuilder;
  scenarioBuilder: typeof ScenarioBuilder;

  // Runtime Data Resolver
  dataResolver: typeof RuntimeDataResolver;
  runtimeConfig: typeof runtimeConfig;

  // Context & State
  testContext: TestContext;
  cleanupStack: CleanupStack;
};

/**
 * Test context with metadata
 */
export interface TestContext {
  testId: string;
  testName: string;
  startTime: Date;
  environment: string;
  metadata: Record<string, unknown>;

  /**
   * Add metadata to test context
   */
  addMetadata(key: string, value: unknown): void;

  /**
   * Get metadata from test context
   */
  getMetadata(key: string): unknown;
}

/**
 * Cleanup stack for automatic resource cleanup
 */
export interface CleanupStack {
  /**
   * Register cleanup function
   */
  register(name: string, cleanup: () => Promise<void>): void;

  /**
   * Execute all cleanups
   */
  executeAll(): Promise<void>;

  /**
   * Get cleanup count
   */
  count(): number;
}

/* ===== ADVANCED TEST WITH FIXTURES ===== */

/**
 * Enhanced test with advanced fixtures
 */
export const test = base.extend<AdvancedFixtures>({
  // Page Objects with auto-initialization
  homePage: async ({ page }: { page: Page }, use: (r: HomePage) => Promise<void>) => {
    const homePage = new HomePage(page);
    Log.info('🏠 HomePage fixture initialized');
    await use(homePage);
    Log.info('🏠 HomePage fixture cleanup');
  },

  loginPage: async ({ page }: { page: Page }, use: (r: LoginPage) => Promise<void>) => {
    const loginPage = new LoginPage(page);
    Log.info('🔐 LoginPage fixture initialized');
    await use(loginPage);
    Log.info('🔐 LoginPage fixture cleanup');
  },

  locationLibraryPage: async (
    { page }: { page: Page },
    use: (r: LocationLibraryPage) => Promise<void>
  ) => {
    const locationLibraryPage = new LocationLibraryPage(page);
    Log.info('📍 LocationLibraryPage fixture initialized');
    await use(locationLibraryPage);
    Log.info('📍 LocationLibraryPage fixture cleanup');
  },

  eyAdminClientListingPage: async (
    { page }: { page: Page },
    use: (r: EYAdminClientListingPage) => Promise<void>
  ) => {
    const eyAdminClientListingPage = new EYAdminClientListingPage(page);
    Log.info('👔 EYAdminClientListingPage fixture initialized');
    await use(eyAdminClientListingPage);
    Log.info('👔 EYAdminClientListingPage fixture cleanup');
  },

  regulationConfigPanelPage: async (
    { page }: { page: Page },
    use: (r: RegulationConfigPanelPage) => Promise<void>
  ) => {
    const regulationConfigPanelPage = new RegulationConfigPanelPage(page);
    Log.info('⚖️ RegulationConfigPanelPage fixture initialized');
    await use(regulationConfigPanelPage);
    Log.info('⚖️ RegulationConfigPanelPage fixture cleanup');
  },

  masterQuestionnairePage: async (
    { page }: { page: Page },
    use: (r: MasterQuestionnairePage) => Promise<void>
  ) => {
    const masterQuestionnairePage = new MasterQuestionnairePage(page);
    Log.info('📋 MasterQuestionnairePage fixture initialized');
    await use(masterQuestionnairePage);
    Log.info('📋 MasterQuestionnairePage fixture cleanup');
  },

  eyAdminUserManagementPage: async (
    { page }: { page: Page },
    use: (r: EYAdminUserManagementPage) => Promise<void>
  ) => {
    const eyAdminUserManagementPage = new EYAdminUserManagementPage(page);
    Log.info('👥 EYAdminUserManagementPage fixture initialized');
    await use(eyAdminUserManagementPage);
    Log.info('👥 EYAdminUserManagementPage fixture cleanup');
  },

  // API Helper with authentication
  apiHelper: async (
    { playwright }: PlaywrightWorkerArgs,
    use: (r: APITestHelper) => Promise<void>,
    _testInfo: TestInfo
  ) => {
    const apiContext = await playwright.request.newContext({
      ignoreHTTPSErrors: true,
    });

    const apiHelper = new APITestHelper(apiContext);
    Log.info('🌐 APIHelper fixture initialized');

    await use(apiHelper);

    await apiContext.dispose();
    Log.info('🌐 APIHelper fixture cleanup');
  },

  // Authenticated API Helper
  authenticatedApi: async (
    { playwright }: PlaywrightWorkerArgs,
    use: (r: APITestHelper) => Promise<void>,
    _testInfo: TestInfo
  ) => {
    const authPath = path.resolve(process.cwd(), 'auth.json');

    let storageState = {};
    if (fs.existsSync(authPath)) {
      storageState = { storageState: authPath };
      Log.info('🔐 Using stored authentication for API');
    }

    const apiContext = await playwright.request.newContext({
      ignoreHTTPSErrors: true,
      ...storageState,
    });

    const apiHelper = new APITestHelper(apiContext);
    Log.info('🔒 Authenticated APIHelper fixture initialized');

    await use(apiHelper);

    await apiContext.dispose();
    Log.info('🔒 Authenticated APIHelper fixture cleanup');
  },

  // Test Data Builders (injected as static classes)
  userBuilder: async ({}: {}, use: (r: typeof UserBuilder) => Promise<void>) => {
    Log.info('👤 UserBuilder fixture initialized');
    await use(UserBuilder);
  },

  organizationBuilder: async ({}: {}, use: (r: typeof OrganizationBuilder) => Promise<void>) => {
    Log.info('🏢 OrganizationBuilder fixture initialized');
    await use(OrganizationBuilder);
  },

  locationBuilder: async ({}: {}, use: (r: typeof LocationBuilder) => Promise<void>) => {
    Log.info('📍 LocationBuilder fixture initialized');
    await use(LocationBuilder);
  },

  scenarioBuilder: async ({}: {}, use: (r: typeof ScenarioBuilder) => Promise<void>) => {
    Log.info('📦 ScenarioBuilder fixture initialized');
    await use(ScenarioBuilder);
  },

  // Runtime Data Resolver
  dataResolver: async ({}: {}, use: (r: typeof RuntimeDataResolver) => Promise<void>) => {
    Log.info('🔧 RuntimeDataResolver fixture initialized');
    await use(RuntimeDataResolver);
  },

  runtimeConfig: async ({}: {}, use: (r: typeof runtimeConfig) => Promise<void>) => {
    Log.info('⚙️ RuntimeConfig fixture initialized');
    await use(runtimeConfig);
  },

  // Test Context with metadata
  testContext: async ({}: {}, use: (r: TestContext) => Promise<void>, testInfo: TestInfo) => {
    const context: TestContext = {
      testId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      testName: testInfo.title,
      startTime: new Date(),
      environment: process.env.NODE_ENV || 'qa',
      metadata: {},

      addMetadata(key: string, value: unknown) {
        this.metadata[key] = value;
      },

      getMetadata(key: string): unknown {
        return this.metadata[key];
      },
    };

    Log.info(`🎯 Test context initialized: ${context.testId}`);
    Log.info(`   Test: ${context.testName}`);
    Log.info(`   Environment: ${context.environment}`);

    await use(context);

    const duration = Date.now() - context.startTime.getTime();
    Log.info(`⏱️  Test duration: ${duration}ms`);
  },

  // Cleanup Stack for automatic resource management
  cleanupStack: async ({}: {}, use: (r: CleanupStack) => Promise<void>, _testInfo: TestInfo) => {
    const cleanups: Array<{ name: string; fn: () => Promise<void> }> = [];

    const stack: CleanupStack = {
      register(name: string, cleanup: () => Promise<void>) {
        cleanups.push({ name, fn: cleanup });
        Log.info(`📌 Registered cleanup: ${name}`);
      },

      async executeAll() {
        Log.info(`🧹 Executing ${cleanups.length} cleanup(s)...`);
        for (const { name, fn } of cleanups.reverse()) {
          try {
            Log.info(`   Cleaning up: ${name}`);
            await fn();
          } catch (error) {
            Log.error(`   ❌ Cleanup failed for ${name}: ${error}`);
          }
        }
        Log.info('✅ All cleanups executed');
      },

      count() {
        return cleanups.length;
      },
    };

    await use(stack);

    // Auto-execute cleanups after test
    await stack.executeAll();
  },
});

/* ===== SPECIALIZED TEST VARIANTS ===== */

/**
 * Test with plugin support
 */
export const testWithPlugins = test.extend({
  page: async ({ page }, use, testInfo) => {
    // Execute plugin lifecycle
    const context = {
      page,
      testInfo,
      config: {},
      environment: process.env.NODE_ENV || 'qa',
    };

    await pluginManager.executeStage('onTestStart', context);

    await use(page);

    await pluginManager.executeStage('onTestEnd', context, {
      status: testInfo.status as 'passed' | 'failed' | 'skipped' | 'timedOut',
      duration: testInfo.duration,
      retry: testInfo.retry,
      attachments: testInfo.attachments,
    });
  },
});

/**
 * Test with automatic screenshot on failure
 */
export const testWithScreenshots = test.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    // Capture screenshot on failure
    if (testInfo.status === 'failed') {
      const screenshot = await page.screenshot();
      await testInfo.attach('failure-screenshot', {
        body: screenshot,
        contentType: 'image/png',
      });
      Log.info('📸 Screenshot captured on failure');
    }
  },
});

/**
 * Test with performance monitoring
 */
export const testWithPerformance = test.extend({
  page: async ({ page }, use, testInfo) => {
    const startTime = Date.now();

    await use(page);

    const duration = Date.now() - startTime;
    Log.info(`⏱️ Test "${testInfo.title}" took ${duration}ms`);

    if (duration > 30000) {
      Log.warn(`⚠️ Slow test detected: ${duration}ms`);
    }
  },
});

/* ===== EXPORT EXPECT ===== */

export { expect } from '@playwright/test';

/**
 * Framework Exports
 * Central export file for easy consumption in product repositories
 */

// Configuration
export { ConfigManager, config } from './lib/config/ConfigManager';
export type { EnvironmentConfig, TestProfile } from './lib/config/ConfigManager';

// Utilities
export { Utils, DateTimeUtils, EnvironmentUtils, StringUtils, WebUtils } from './lib/Utils';
export { default as Log } from './lib/Log';

// Test Helpers
export { SimpleTestSetup, setupTest } from './lib/SimpleTestSetup';
export { APITestHelper } from './lib/APITestHelper';

// ADO Integration
export { ADOHelper, createADOHelperFromEnv, testADOConnection } from './lib/ADOHelper';
export type { ADOConfig, ADOWorkItem, ADOGenerationResult } from './lib/ADOHelper';

// Test Data
export { RuntimeDataResolver } from './lib/testData/RuntimeDataResolver';
export { runtimeConfig } from './lib/testData/RuntimeDataConfig';
export { UserBuilder, OrganizationBuilder, LocationBuilder, ScenarioBuilder } from './lib/testData';

// Page Objects (Base)
export { BasePage } from './pages/common/BasePage';

// Fixtures
export { test, expect } from './tests/fixtures/simpleFixtures';
export type { SimpleFixtures } from './tests/fixtures/simpleFixtures';

// Advanced fixtures (optional)
export {
  test as advancedTest,
  expect as advancedExpect,
  testWithPlugins,
  testWithScreenshots,
  testWithPerformance,
} from './tests/fixtures/advancedFixtures';
export type {
  AdvancedFixtures,
  TestContext,
  CleanupStack,
} from './tests/fixtures/advancedFixtures';

// Error Handling
export { ErrorHandler } from './lib/ErrorHandler';

// Test Data Generator
export { TestDataGenerator } from './lib/TestDataGenerator';

// Validators
export { APIValidator } from './lib/validation/APIValidator';
export { AccountValidator } from './lib/validation/AccountValidator';
export { UserValidator } from './lib/validation/UserValidator';
export { OrganizationValidator } from './lib/validation/OrganizationValidator';

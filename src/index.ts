/**
 * Framework Exports
 * Central export file for easy consumption in product repositories
 */

// Configuration
export { ConfigManager, config } from './lib/config/ConfigManager';
export type { EnvironmentConfig, TestProfile } from './lib/config/ConfigManager';

// Utilities
export { Utils, DateTimeUtils, EnvironmentUtils, StringUtils, WebUtils } from './lib/utils/Utils';
export { default as Log } from './lib/utils/Log';

// Test Helpers
// Note: SimpleTestSetup was removed, use testSetup from setup folder if needed
export { APITestHelper } from './lib/api/APITestHelper';

// ADO Integration
export { ADOHelper, createADOHelperFromEnv, testADOConnection } from './lib/ado/ADOHelper';
export type { ADOConfig, ADOWorkItem, ADOGenerationResult } from './lib/ado/ADOHelper';

// Test Data
export { RuntimeDataResolver } from './lib/testData/RuntimeDataResolver';
export { runtimeConfig } from './lib/testData/RuntimeDataConfig';
export { UserBuilder, OrganizationBuilder, LocationBuilder, ScenarioBuilder } from './lib/testData';

// Page Objects (Base)
export { BasePage } from './pages/common/BasePage';

// Advanced fixtures
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
export { ErrorHandler } from './lib/utils/ErrorHandler';

// Test Data Generator
export { TestDataGenerator } from './lib/generators/TestDataGenerator';

// Validators
export { APIValidator } from './lib/validation/APIValidator';
export { AccountValidator } from './lib/validation/AccountValidator';
export { UserValidator } from './lib/validation/UserValidator';
export { OrganizationValidator } from './lib/validation/OrganizationValidator';

// Visual Regression Testing
export { VisualRegressionHelper } from './lib/visual/VisualRegressionHelper';
export type { VisualTestOptions, VisualTestConfig } from './lib/visual/VisualRegressionHelper';
export { FigmaHelper } from './lib/figma/FigmaHelper';
export { VisualComparator } from './lib/visual/VisualComparator';
export type { ComparisonOptions, ComparisonResult } from './lib/visual/VisualComparator';
export { BaselineManager } from './lib/visual/BaselineManager';
export type { BaselineMetadata, BaselineInfo } from './lib/visual/BaselineManager';

// Visual Testing Fixtures
export {
  visualTest,
  expect as visualExpect,
  visualExpect as visualMatchers,
} from './tests/fixtures/visualFixtures';
export type { VisualFixtures } from './tests/fixtures/visualFixtures';

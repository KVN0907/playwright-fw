# 🚀 Advanced Features Usage Guide

## Overview

This guide covers the advanced features added to the Playwright framework to enhance flexibility, maintainability, and scalability.

## 📦 Phase 1 Features (Implemented)

### 1. Plugin Architecture

The plugin system allows you to extend the framework with custom functionality.

#### Creating a Custom Plugin

```typescript
import { BasePlugin, FrameworkContext, TestResult } from '../lib/plugins';

export class MyCustomPlugin extends BasePlugin {
  constructor() {
    super(
      {
        name: 'my-custom-plugin',
        version: '1.0.0',
        description: 'My custom functionality',
      },
      {
        enabled: true,
        priority: 'high',
        stages: ['beforeEach', 'afterEach'],
        options: {
          customOption: 'value',
        },
      }
    );
  }

  async init(context: FrameworkContext): Promise<void> {
    this.log('Initializing custom plugin');
    // Your initialization code
  }

  async beforeEach(context: FrameworkContext): Promise<void> {
    this.log('Running before each test');
    // Your before each code
  }

  async afterEach(context: FrameworkContext, result: TestResult): Promise<void> {
    this.log(`Test ${result.status}: ${context.testInfo?.title}`);
    // Your after each code
  }
}
```

#### Registering Plugins

```typescript
import { pluginManager } from './lib/plugins';
import { ScreenshotPlugin, PerformancePlugin } from './lib/plugins';
import { MyCustomPlugin } from './plugins/MyCustomPlugin';

// In globalSetup or test file
await pluginManager.register(new ScreenshotPlugin());
await pluginManager.register(new PerformancePlugin());
await pluginManager.register(new MyCustomPlugin());

// Initialize all plugins
await pluginManager.initializeAll({
  config: {},
  environment: process.env.NODE_ENV || 'qa',
});
```

#### Using Plugins in Tests

```typescript
import { testWithPlugins } from './tests/fixtures/advancedFixtures';

testWithPlugins('My test with plugins', async ({ page }) => {
  // Plugins automatically execute during test lifecycle
  await page.goto('https://example.com');
  // Your test code
});
```

---

### 2. Test Data Factory & Builders

Create complex test data using fluent builder patterns.

#### Building Users

```typescript
import { UserBuilder } from './lib/testData';

// Simple user
const user = UserBuilder.create()
  .withName('John', 'Doe')
  .withEmail('john.doe@test.com')
  .withRole('admin')
  .build();

// Admin user with organization
const admin = UserBuilder.create()
  .asAdmin()
  .withOrganization('Test Org')
  .withDepartment('Engineering')
  .inEnvironment('qa')
  .build();

// Multiple users
const users = UserBuilder.create()
  .withRole('user')
  .buildMultiple(5);
```

#### Building Organizations

```typescript
import { OrganizationBuilder } from './lib/testData';

// Enterprise organization
const org = OrganizationBuilder.create()
  .withName('Acme Corp')
  .asEnterprise()
  .withAddress('123 Main St', 'New York', 'USA')
  .withContactInfo('contact@acme.com', '+1-555-0100', 'https://acme.com')
  .withFeatures(['sso', 'audit', 'api'])
  .build();

// Startup
const startup = OrganizationBuilder.create()
  .withName('TechStart')
  .asStartup()
  .build();
```

#### Building Locations

```typescript
import { LocationBuilder } from './lib/testData';

// Office location
const office = LocationBuilder.create()
  .withName('Main Office')
  .asOffice()
  .withOwner('John Doe', 'john@test.com')
  .withEntity('EY_US')
  .withCapacity(200)
  .build();

// With random data
const location = LocationBuilder.create()
  .withRandomData()
  .build();
```

#### Building Complete Scenarios

```typescript
import { ScenarioBuilder } from './lib/testData';

// Complete organization scenario
const scenario = ScenarioBuilder.create('Complete Org Setup')
  .withDescription('Organization with users and locations')
  .withCompleteOrganization(10, 5) // 10 users, 5 locations
  .buildWithLogs();

// Access scenario data
console.log(`Users: ${scenario.users.length}`);
console.log(`Organizations: ${scenario.organizations.length}`);
console.log(`Locations: ${scenario.locations.length}`);

// Multi-tenant scenario
const multiTenant = ScenarioBuilder.create('Multi-Tenant')
  .withMultiTenant(3) // 3 tenants
  .build();
```

#### Using in Tests

```typescript
import { test } from './tests/fixtures/advancedFixtures';

test('Create user workflow', async ({ page, userBuilder, organizationBuilder }) => {
  // Build test data
  const org = organizationBuilder.create()
    .withName('Test Org')
    .build();
  
  const user = userBuilder.create()
    .withOrganization(org.name)
    .asAdmin()
    .build();
  
  // Use in your test
  console.log(`Testing with: ${user.email}`);
  // Your test logic
});
```

---

### 3. Advanced Fixtures with Dependency Injection

Enhanced fixtures provide automatic dependency injection and cleanup.

#### Using Advanced Fixtures

```typescript
import { test, expect } from './tests/fixtures/advancedFixtures';

test('Test with all fixtures', async ({
  page,
  homePage,
  loginPage,
  apiHelper,
  userBuilder,
  testContext,
  cleanupStack,
}) => {
  // Test context with metadata
  testContext.addMetadata('testType', 'integration');
  testContext.addMetadata('priority', 'high');
  
  // Build test data
  const user = userBuilder.create()
    .withEmail('test@example.com')
    .build();
  
  // Use page objects
  await homePage.navigateTo('/');
  await loginPage.login(user.email, user.password);
  
  // API calls
  const response = await apiHelper.get('/api/users');
  expect(response.status()).toBe(200);
  
  // Register cleanup
  cleanupStack.register('delete-user', async () => {
    await apiHelper.delete(`/api/users/${user.id}`);
  });
  
  // Cleanup happens automatically after test
});
```

#### Specialized Test Variants

```typescript
import { testWithScreenshots, testWithPerformance } from './tests/fixtures/advancedFixtures';

// Automatic screenshots on failure
testWithScreenshots('Test with auto screenshots', async ({ page }) => {
  await page.goto('https://example.com');
  // Screenshot captured automatically if test fails
});

// Performance monitoring
testWithPerformance('Test with performance tracking', async ({ page }) => {
  await page.goto('https://example.com');
  // Performance metrics logged automatically
});
```

---

### 4. Dynamic Configuration Profiles

Apply different configurations based on testing scenarios.

#### Using Profiles via Command Line

```bash
# Run with mobile profile
npm test -- --profile=mobile

# Run with multiple profiles
npm test -- --profile=mobile,performance

# Run with accessibility profile
npm test -- --profile=accessibility

# Debug mode
npm test -- --profile=debug
```

#### Using Profiles via Environment Variable

```bash
# Set profile in environment
export TEST_PROFILES=mobile,performance
npm test
```

#### Available Profiles

##### Mobile Profile
- Tests across iPhone 13, Pixel 5, Samsung Galaxy, iPad Pro
- Touch events enabled
- Mobile viewports
- Network throttling

```bash
npm test -- --profile=mobile
```

##### Accessibility Profile
- WCAG compliance testing
- High contrast mode
- Forced colors
- Both light and dark themes

```bash
npm test -- --profile=accessibility
```

##### Performance Profile
- Metrics collection
- No retries for accuracy
- Sequential execution
- Network throttling options

```bash
npm test -- --profile=performance
```

##### Debug Profile
- Headed browser
- DevTools open
- No timeouts
- Slow motion enabled

```bash
npm test -- --profile=debug
```

#### Programmatic Profile Usage

```typescript
import { profileManager } from './config/profiles/ProfileManager';
import testConfig from './src/config/TestConfig';

// Load all profiles
await profileManager.loadProfiles();

// Get profiles from CLI
const profiles = ProfileManager.getProfilesFromArgs();

// Merge with base config
const finalConfig = profileManager.merge(testConfig, profiles);

export default finalConfig;
```

#### Creating Custom Profiles

```typescript
// config/profiles/custom.profile.ts
import { ProfileConfig } from './ProfileManager';

export const profile: ProfileConfig = {
  name: 'custom',
  description: 'My custom profile',
  enabled: true,
  overrides: {
    timeout: 60000,
    retries: 3,
    workers: 4,
    use: {
      headless: true,
      screenshot: 'on',
    },
  },
};

export default profile;
```

---

## 🎯 Complete Example

Here's a complete test using all Phase 1 features:

```typescript
import { test, expect } from './tests/fixtures/advancedFixtures';
import { pluginManager } from './lib/plugins';
import { ScreenshotPlugin, PerformancePlugin } from './lib/plugins';

// Register plugins (in globalSetup or beforeAll)
test.beforeAll(async () => {
  await pluginManager.register(new ScreenshotPlugin());
  await pluginManager.register(new PerformancePlugin());
  
  await pluginManager.initializeAll({
    config: {},
    environment: 'qa',
  });
});

test.describe('Complete Feature Demo', () => {
  test('Create organization with users and locations', async ({
    page,
    homePage,
    authenticatedApi,
    organizationBuilder,
    userBuilder,
    locationBuilder,
    scenarioBuilder,
    testContext,
    cleanupStack,
  }) => {
    // Add test metadata
    testContext.addMetadata('feature', 'organization-management');
    testContext.addMetadata('priority', 'critical');
    
    // Build complete scenario
    const scenario = scenarioBuilder.create('Org Setup')
      .withDescription('Full organization setup with users and locations')
      .withCompleteOrganization(3, 2) // 3 users, 2 locations
      .build();
    
    // Navigate to application
    await homePage.navigateTo('/organizations');
    
    // Create organization via API
    const orgResponse = await authenticatedApi.post('/api/organizations', {
      name: scenario.organizations[0].name,
      type: scenario.organizations[0].type,
    });
    expect(orgResponse.status()).toBe(201);
    
    const orgData = await orgResponse.json();
    const orgId = orgData.id;
    
    // Register cleanup
    cleanupStack.register('delete-org', async () => {
      await authenticatedApi.delete(`/api/organizations/${orgId}`);
    });
    
    // Create users
    for (const user of scenario.users) {
      const userResponse = await authenticatedApi.post('/api/users', {
        ...user,
        organizationId: orgId,
      });
      expect(userResponse.status()).toBe(201);
      
      const userData = await userResponse.json();
      cleanupStack.register(`delete-user-${user.email}`, async () => {
        await authenticatedApi.delete(`/api/users/${userData.id}`);
      });
    }
    
    // Create locations
    for (const location of scenario.locations) {
      const locResponse = await authenticatedApi.post('/api/locations', {
        ...location,
        organizationId: orgId,
      });
      expect(locResponse.status()).toBe(201);
    }
    
    // Verify in UI
    await page.goto(`/organizations/${orgId}`);
    await expect(page.locator('h1')).toContainText(scenario.organizations[0].name);
    
    // All cleanups execute automatically after test
  });
});

test.afterAll(async () => {
  // Cleanup plugins
  await pluginManager.clear();
});
```

---

## 🔧 Configuration

### Enable Features in playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test';
import testConfig from './src/config/TestConfig';
import { profileManager, ProfileManager } from './config/profiles/ProfileManager';

// Load profiles
await profileManager.loadProfiles();

// Get profiles from CLI or env
const profiles = ProfileManager.getProfilesFromArgs() || 
                 ProfileManager.getProfilesFromEnv() ||
                 [];

// Merge configurations
const finalConfig = profiles.length > 0
  ? profileManager.merge(testConfig, profiles)
  : testConfig;

export default defineConfig(finalConfig);
```

---

## 📚 Next Steps

Phase 2-4 features will include:
- Smart Retry Strategy
- Environment-Specific Mocks
- Performance Budgets
- Visual Regression Testing
- Accessibility Testing
- Multi-Tenant Support
- And more...

Refer to the implementation plan for the complete list of upcoming features.

# 🚀 Quick Reference Guide - Advanced Features

## 📦 Test Data Builders

### Create a User
```typescript
const user = UserBuilder.create()
  .withName('John', 'Doe')
  .withEmail('john@test.com')
  .asAdmin()
  .build();
```

### Create an Organization
```typescript
const org = OrganizationBuilder.create()
  .withName('Acme Corp')
  .asEnterprise()
  .build();
```

### Create a Location
```typescript
const location = LocationBuilder.create()
  .withName('Main Office')
  .asOffice()
  .withCapacity(200)
  .build();
```

### Create Complete Scenario
```typescript
const scenario = ScenarioBuilder.create('Setup')
  .withCompleteOrganization(10, 5) // 10 users, 5 locations
  .build();
```

---

## 🔌 Plugins

### Register Plugin
```typescript
import { pluginManager, ScreenshotPlugin } from './lib/plugins';

await pluginManager.register(new ScreenshotPlugin());
await pluginManager.initializeAll({ config: {}, environment: 'qa' });
```

### Create Custom Plugin
```typescript
import { BasePlugin } from './lib/plugins';

class MyPlugin extends BasePlugin {
  constructor() {
    super(
      { name: 'my-plugin', version: '1.0.0' },
      { enabled: true, stages: ['afterEach'] }
    );
  }

  async init(context) {
    this.log('Initialized');
  }

  async afterEach(context, result) {
    this.log(`Test ${result.status}`);
  }
}
```

---

## 🎯 Advanced Fixtures

### Basic Usage
```typescript
import { test } from './tests/fixtures/advancedFixtures';

test('My test', async ({
  page,
  homePage,
  userBuilder,
  testContext,
  cleanupStack,
}) => {
  const user = userBuilder.create().build();
  testContext.addMetadata('priority', 'high');
  
  cleanupStack.register('cleanup', async () => {
    // Cleanup code
  });
});
```

### Test Variants
```typescript
import { testWithScreenshots, testWithPerformance } from './tests/fixtures/advancedFixtures';

testWithScreenshots('Auto screenshot on fail', async ({ page }) => {
  // Screenshots captured automatically on failure
});

testWithPerformance('Track performance', async ({ page }) => {
  // Performance metrics logged automatically
});
```

---

## 📋 Configuration Profiles

### Run with Profile
```bash
# Single profile
npm test -- --profile=mobile

# Multiple profiles
npm test -- --profile=mobile,performance

# Debug mode
npm test -- --profile=debug
```

### Create Custom Profile
```typescript
// config/profiles/custom.profile.ts
export const profile = {
  name: 'custom',
  description: 'My custom profile',
  enabled: true,
  overrides: {
    timeout: 60000,
    retries: 3,
    use: { headless: true },
  },
};
```

---

## 🔄 Smart Retry

### Basic Retry
```typescript
import { RetryExecutor } from './lib/retry/RetryStrategy';

const result = await RetryExecutor.execute(
  async () => {
    // Your code
  },
  { maxRetries: 3, backoff: 'exponential' }
);
```

### Auto-Categorized Retry
```typescript
const result = await RetryExecutor.executeWithCategory(
  async () => {
    // Automatically categorizes and retries based on error type
  }
);
```

### Decorator
```typescript
import { RetryWithStrategy } from './lib/retry/RetryStrategy';

class MyPage {
  @RetryWithStrategy('NetworkError')
  async fetchData() {
    // Automatically retries on network errors
  }
}
```

---

## 📊 Structured Logging

### Basic Logging
```typescript
import Log from './lib/Log';

Log.info('Message');
Log.error('Error message');
Log.warn('Warning');
Log.debug('Debug info');
```

### Set Context
```typescript
Log.setContext({
  testId: 'test-123',
  browser: 'chrome',
  environment: 'qa',
  tenant: 'acme',
});

Log.info('Message'); // [test-123] [chrome] [qa] [tenant:acme] Message
```

### Temporary Context
```typescript
Log.withContext({ correlationId: 'abc' }).info('API call');
Log.popContext(); // Remove temporary context
```

### Special Logs
```typescript
Log.action('Click button', { element: '#submit' });
Log.metric('page_load_time', 1.23, { page: 'dashboard' });
```

---

## 🧪 Complete Test Example

```typescript
import { test, expect } from './tests/fixtures/advancedFixtures';
import Log from './lib/Log';
import { RetryExecutor } from './lib/retry/RetryStrategy';

test.describe('My Feature', () => {
  test.beforeEach(async ({ testContext }) => {
    Log.setContext({
      testId: testContext.testId,
      environment: 'qa',
    });
  });

  test('Complete example', async ({
    page,
    userBuilder,
    organizationBuilder,
    testContext,
    cleanupStack,
    authenticatedApi,
  }) => {
    // Build test data
    const org = organizationBuilder.create()
      .withName('Test Org')
      .asEnterprise()
      .build();
    
    const user = userBuilder.create()
      .withOrganization(org.name)
      .asAdmin()
      .build();
    
    Log.info('Created test data', { org: org.name, user: user.email });
    
    // Create via API with retry
    const result = await RetryExecutor.execute(
      async () => {
        const response = await authenticatedApi.post('/api/users', user);
        expect(response.status()).toBe(201);
        return await response.json();
      },
      { maxRetries: 3, backoff: 'exponential' }
    );
    
    // Register cleanup
    cleanupStack.register('delete-user', async () => {
      await authenticatedApi.delete(`/api/users/${result.id}`);
    });
    
    // Verify in UI
    await page.goto(`/users/${result.id}`);
    await expect(page.locator('h1')).toContainText(user.firstName);
    
    Log.action('Verified user in UI', { userId: result.id });
    Log.metric('test_duration', Date.now() - testContext.startTime.getTime());
  });
});
```

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run with profile
npm test -- --profile=mobile

# Run specific test
npm test src/tests/examples/advanced-features-demo.spec.ts

# Run in debug mode
npm test -- --profile=debug

# Run with headed browser
npm run test:qa

# Format code
npm run format

# Lint code
npm run lint
```

---

## 📚 More Information

- **Detailed Guide**: `docs/ADVANCED_FEATURES_GUIDE.md`
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md`
- **Original README**: `README.md`

---

**Need Help?** Check the example test at `src/tests/examples/advanced-features-demo.spec.ts`

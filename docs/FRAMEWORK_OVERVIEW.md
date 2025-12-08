# 🎭 EY Infinity Test Automation Framework

## Comprehensive Framework Documentation

**Version:** 2.0  
**Last Updated:** December 2025  
**Maintainer:** QA & Automation Team

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Framework Architecture](#framework-architecture)
3. [Key Features & Advantages](#key-features--advantages)
4. [Core Components](#core-components)
5. [Advanced Capabilities](#advanced-capabilities)
6. [Integration Ecosystem](#integration-ecosystem)
7. [Best Practices](#best-practices)
8. [Future Enhancements](#future-enhancements)

---

## 🎯 Executive Summary

The EY Infinity Test Automation Framework is an **enterprise-grade, AI-powered testing solution** built on Playwright, designed to accelerate test development, improve maintainability, and ensure comprehensive quality coverage across web applications and APIs.

### Quick Stats

- **⚡ 70% Reduction** in test creation time through automated generation
- **🔄 Auto-Generated** tests from source code (Java, Angular) and work items (ADO)
- **📊 Multi-Layer** testing (E2E, API, Component, Integration)
- **🎨 Design Patterns** with advanced fixtures, page objects, and builders
- **🤖 AI Integration** with ADO MCP and automated test generation
- **🔧 Runtime Configuration** for dynamic test data management
- **📈 Scalable** architecture supporting multiple products/teams

---

## 🏗️ Framework Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Test Generation Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Java Parser  │  │ Angular      │  │ ADO MCP      │         │
│  │ (Controllers)│  │ Parser       │  │ Integration  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │ Hybrid Generator│                           │
│                   └────────┬────────┘                           │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                     Test Execution Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Fixtures   │  │ Page Objects │  │ Test Specs   │       │
│  │  (DI System) │  │  (BasePage)  │  │(Given/When/  │       │
│  │              │  │              │  │   Then)      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                      Support Layer                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐           │
│  │Test Data│ │Validators│ │  API    │ │ Logging  │           │
│  │Builders │ │          │ │ Helpers │ │          │           │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘           │
└───────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
tests/automation/
├── .github/
│   └── workflows/
│       └── auto-generate-tests.yml      # CI/CD test generation
├── config/
│   ├── environments/                    # Environment configs
│   │   ├── dev.env
│   │   ├── qa.env
│   │   ├── staging.env
│   │   └── prod.env
│   ├── profiles/                        # Test profiles
│   │   ├── smoke.env
│   │   ├── regression.env
│   │   ├── performance.env
│   │   └── mobile.env
│   └── globalSetup.ts                   # Pre-authentication
├── src/
│   ├── lib/                             # Core utilities
│   │   ├── auth/
│   │   │   └── AuthenticationManager.ts # Auth handling
│   │   ├── config/
│   │   │   └── ConfigManager.ts         # Config management
│   │   ├── testData/
│   │   │   ├── builders/                # Test data builders
│   │   │   ├── RuntimeDataResolver.ts   # Runtime data
│   │   │   └── TestDataFactory.ts       # Data factory
│   │   ├── validation/
│   │   │   ├── APIValidator.ts          # API validation
│   │   │   ├── BaseValidator.ts         # Base validator
│   │   │   └── schemas.ts               # Schema definitions
│   │   ├── plugins/
│   │   │   └── PluginManager.ts         # Plugin system
│   │   ├── ADOHelper.ts                 # Azure DevOps integration
│   │   ├── APITestHelper.ts             # API testing utilities
│   │   ├── HybridTestGenerator.ts       # Test auto-generation
│   │   ├── SwaggerHelper.ts             # OpenAPI integration
│   │   ├── Log.ts                       # Logging utility
│   │   └── Utils.ts                     # Helper functions
│   ├── pages/
│   │   ├── common/
│   │   │   ├── BasePage.ts              # Base page object
│   │   │   ├── HomePage.ts
│   │   │   ├── LoginPage.ts
│   │   │   └── LocationLibraryPage.ts
│   │   └── eyadmin/                     # Product-specific pages
│   │       ├── EYAdminClientListingPage.ts
│   │       └── RegulationConfigPanelPage.ts
│   ├── tests/
│   │   ├── fixtures/
│   │   │   └── advancedFixtures.ts      # Advanced DI fixtures
│   │   ├── ui/
│   │   │   └── e2e/                     # E2E UI tests
│   │   ├── api/                         # API tests
│   │   └── data/                        # Test data files
│   └── config/
│       └── TestConfig.ts                # Playwright config
├── docs/
│   ├── ADO-MCP-Integration-Guide.md     # ADO MCP guide
│   └── FRAMEWORK_OVERVIEW.md            # This document
├── scripts/
│   ├── generate-tests-from-mcp.ts       # MCP test generation
│   └── sprint-test-coverage.ts          # Coverage analysis
├── playwright.config.ts                 # Main config
└── package.json                         # Dependencies
```

---

## 🌟 Key Features & Advantages

### 1. **Automated Test Generation** 🤖

**Reduces manual test writing by 70%**

#### From Java Controllers → API Tests

```java
// Input: LocationController.java
@RestController
@RequestMapping("/api/locations")
public class LocationController {
    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocation(@PathVariable Long id) { ... }
}
```

```typescript
// Output: Auto-generated test
test('GET /api/locations/{id} - getLocation', async ({ request }) => {
  // Given location ID exists
  const id = 1;

  // When fetching location by ID
  const response = await request.get(`/api/locations/${id}`);

  // Then should return location successfully
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('id', id);
});
```

#### From Angular Components → UI Tests

```typescript
// Input: location-library.component.ts
@Component({
  selector: 'app-location-library',
  template: `<button (click)="create()">Create Location</button>`
})
```

```typescript
// Output: Auto-generated UI test
test('User can create new location', async ({ locationLibraryPage }) => {
  // Given user is on Location Library page
  await locationLibraryPage.navigateToLocationLibrary();

  // When user clicks Create button
  await locationLibraryPage.clickCreateButton();

  // Then create form should be displayed
  await locationLibraryPage.verifyCreateFormVisible();
});
```

#### From ADO Work Items → Feature Tests

```typescript
// Using ADO MCP to fetch work item #241593
const workItem = await adoHelper.fetchWorkItem(241593);

// Auto-generates complete test suite with:
// - All acceptance criteria as test cases
// - Test data from requirements
// - Page objects for UI elements
// - API tests for backend endpoints
```

**Supported Sources:**

- ✅ Java Spring Controllers (`@RestController`, `@GetMapping`, etc.)
- ✅ Angular Components (`@Component`, templates, forms)
- ✅ OpenAPI/Swagger specifications
- ✅ Azure DevOps Work Items (via MCP)
- ✅ Existing test templates

---

### 2. **Advanced Dependency Injection** 💉

**Fixtures provide automatic dependency management**

```typescript
import { test } from './fixtures/advancedFixtures';

test('Complex test with multiple dependencies', async ({
  eyAdminClientListingPage, // Auto-injected page object
  regulationConfigPanelPage, // Auto-injected page object
  dataResolver, // Auto-injected data resolver
  userBuilder, // Auto-injected user builder
  apiHelper, // Auto-injected API helper
  cleanupStack, // Auto-injected cleanup manager
  testContext, // Auto-injected test metadata
}) => {
  // Use all dependencies without manual initialization
  const user = userBuilder.create().withRole('admin').build();
  await eyAdminClientListingPage.navigateToClientListing();
  // Automatic cleanup after test
});
```

**Benefits:**

- 🔧 No manual object instantiation
- 🧹 Automatic resource cleanup
- 📊 Built-in test metadata tracking
- 🔄 Reusable across all tests
- 🎯 Type-safe with TypeScript

---

### 3. **Fluent Test Data Builders** 🏗️

**Create realistic test data with expressive API**

```typescript
// Simple user
const user = userBuilder.create().build();

// Custom user with fluent API
const admin = userBuilder
  .create()
  .withName('John', 'Doe')
  .withEmail('john.doe@test.com')
  .withRole('admin')
  .withOrganization('Test Corp')
  .withPermissions(['read', 'write', 'delete'])
  .isActive(true)
  .build();

// Multiple users
const users = userBuilder.create().buildMultiple(5);

// Complete scenario
const scenario = scenarioBuilder
  .create('User Management Test')
  .withCompleteOrganization(3, 5) // 3 orgs, 5 users each
  .withLocations(2) // 2 locations
  .withRoles(['admin', 'user']) // Custom roles
  .build();

console.log(scenario.organizations.length); // 3
console.log(scenario.users.length); // 15
console.log(scenario.locations.length); // 2
```

**Available Builders:**

- `UserBuilder` - Create users with roles, permissions
- `OrganizationBuilder` - Create organizations with hierarchies
- `LocationBuilder` - Create locations with geography
- `ScenarioBuilder` - Create complete test scenarios

---

### 4. **Runtime Data Configuration** ⚙️

**Flexible test data from multiple sources**

```bash
# Via CLI arguments
npm test -- --user-email=admin@test.com --user-role=admin

# Via JSON
npm test -- --test-data='{"users":[{"email":"test@test.com"}]}'

# Via environment variables
export TEST_DATA_USERS='[{"email":"admin@test.com","role":"admin"}]'
npm test

# Via JSON file
npm test -- --test-data-file=./test-data/qa-data.json
```

```typescript
// In tests - automatically resolves from runtime or generates defaults
test('Dynamic test data', async ({ dataResolver, runtimeConfig }) => {
  // Auto-resolves from CLI/env/file or generates default
  const user = dataResolver.resolveUser();

  // Resolve specific user by index
  const firstUser = dataResolver.resolveUser(0);

  // Resolve multiple users
  const users = dataResolver.resolveUsers(5);

  // Set config inline
  runtimeConfig.setConfig({
    users: [
      { email: 'test1@test.com', role: 'admin' },
      { email: 'test2@test.com', role: 'user' },
    ],
  });
});
```

---

### 5. **Robust Page Object Pattern** 📄

**Type-safe, maintainable page objects extending BasePage**

```typescript
export class LocationLibraryPage extends BasePage<LocationLibraryPage> {
  // Locators with role-based selectors
  readonly createButton: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.dataTable = page.locator('table');
  }

  // Fluent interface for method chaining
  async navigateToLocationLibrary(): Promise<LocationLibraryPage> {
    Log.info('Navigating to Location Library');
    await this.navigateTo('/location-library');
    await this.waitForNetworkIdle();
    return this;
  }

  // Verification methods handle assertions
  async verifyLocationCreated(locationName: string): Promise<void> {
    Log.info('Verifying location creation');
    await expect(this.page.getByText(locationName)).toBeVisible();
    await expect(this.successMessage).toBeVisible();
    Log.info('Location creation verified');
  }
}
```

**Key Features:**

- ✅ Extends `BasePage<T>` for fluent interface
- ✅ Role-based selectors (accessibility-friendly)
- ✅ Built-in logging with `Log.info()`
- ✅ Verification methods with assertions
- ✅ Method chaining support
- ✅ Type-safe with generics

---

### 6. **Multi-Environment Support** 🌍

**Seamlessly test across environments**

```bash
# Environment-specific execution
npm run test:dev       # Development
npm run test:qa        # QA
npm run test:staging   # Staging
npm run test:prod      # Production (read-only)

# Profile-based execution
PROFILE=smoke npm run test:qa          # Fast smoke tests
PROFILE=regression npm run test:qa     # Full regression
PROFILE=mobile npm run test:qa         # Mobile testing
PROFILE=debug npm run test:qa          # Debug mode
```

**Environment Configuration:**

```env
# config/environments/qa.env
NODE_ENV=qa
APP_URL=https://qa.myapp.com
API_URL=https://api-qa.myapp.com
QA_USERNAME=qa_user
QA_PASSWORD=secure_password
TIMEOUT=30000
RETRIES=2
```

**Profile Configuration:**

```env
# config/profiles/smoke.env
TEST_TIMEOUT=10000
RETRIES=0
WORKERS=4
REPORTER=line
HEADED=false
TRACE=off
```

---

### 7. **Comprehensive Validation System** ✅

**Built-in validators for API and data validation**

```typescript
import { APIValidator, UserValidator } from '@/lib/validation';

test('API response validation', async ({ request }) => {
  const validator = new APIValidator();

  // Validate response structure
  const response = await request.get('/api/users/1');
  const data = await response.json();

  validator.validateResponse(data, 'User');
  validator.validateStatusCode(response, 200);

  // Custom validators
  const userValidator = new UserValidator();
  userValidator.validateEmail(data.email);
  userValidator.validateRole(data.role);
  userValidator.validatePermissions(data.permissions);
});
```

**Available Validators:**

- `APIValidator` - HTTP status, headers, response structure
- `UserValidator` - Email, role, permissions validation
- `AccountValidator` - Account-specific validation
- `OrganizationValidator` - Organization structure validation
- `BaseValidator` - Base validation utilities

---

### 8. **Azure DevOps MCP Integration** 🔗

**Direct integration with Azure DevOps for automated test generation**

```typescript
import { ADOHelper } from '@/lib/ADOHelper';

const ado = new ADOHelper({
  organization: 'EYGS2',
  project: 'eycompliancemanager',
  personalAccessToken: process.env.ADO_PAT,
});

// Fetch work item with acceptance criteria
const workItem = await ado.fetchWorkItem(241593);
console.log(workItem.acceptanceCriteria); // Structured criteria

// Auto-generate tests from work item
const result = await ado.generateTestFromWorkItem(241593, {
  outputDir: './tests/ui/e2e',
  testType: 'e2e',
  includeAPI: true,
});

// Analyze sprint coverage
const sprintItems = await ado.getSprintWorkItems('Sprint 4');
const coverage = ado.analyzeTestCoverage(sprintItems);
console.log(`Coverage: ${coverage.percentage}%`);
```

**Features:**

- ✅ Fetch work items with acceptance criteria
- ✅ Auto-generate test cases from requirements
- ✅ Sprint coverage analysis
- ✅ Test case creation and linking
- ✅ MCP (Model Context Protocol) integration for AI assistance

---

### 9. **CI/CD Test Generation** 🔄

**Automated test generation in your pipeline**

```yaml
# .github/workflows/auto-generate-tests.yml
name: Auto-Generate Tests

on:
  push:
    paths:
      - 'service/**/controllers/**' # Trigger on controller changes
      - 'portal/**/components/**' # Trigger on component changes
  workflow_dispatch: # Manual trigger
    inputs:
      generate_api_tests:
        type: boolean
        default: true
      generate_ui_tests:
        type: boolean
        default: true

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Generate API Tests
        run: npm run generate:api

      - name: Generate UI Tests
        run: npm run generate:ui

      - name: Run Generated Tests
        run: npm test

      - name: Commit Tests
        run: |
          git add tests/
          git commit -m "chore: auto-generated tests"
          git push
```

**Benefits:**

- ⚡ Tests auto-generate on code changes
- 🔄 Always up-to-date with source code
- 📊 CI reports show what was generated
- 💾 Optional auto-commit of generated tests

---

## 🔧 Core Components

### 1. HybridTestGenerator

**Automatically generates tests from multiple sources**

**Features:**

- Parse Java controllers for API endpoints
- Parse Angular components for UI elements
- Extract Swagger/OpenAPI specifications
- Generate tests following framework patterns
- Support Given/When/Then format

**Usage:**

```typescript
import { HybridTestGenerator } from '@/lib/HybridTestGenerator';

const generator = new HybridTestGenerator();

// Generate from controller
await generator.generateFromController('./LocationController.java', './tests/api');

// Generate from component
await generator.generateFromComponent('./location-library.component.ts', './tests/ui/e2e');

// Generate from Swagger
await generator.generateFromSwagger('https://api.myapp.com/swagger.json', './tests/api');
```

---

### 2. BasePage Class

**Foundation for all page objects**

**Key Features:**

```typescript
export class BasePage<T> {
  // Navigation
  async navigateTo(path: string): Promise<T>;
  async waitForNetworkIdle(): Promise<T>;

  // Interactions
  async click(locator: Locator, options?: InteractionOptions): Promise<T>;
  async fill(locator: Locator, text: string, options?: InteractionOptions): Promise<T>;
  async selectOption(locator: Locator, value: string): Promise<T>;

  // Waiting
  async waitForElement(locator: Locator, state?: ElementState): Promise<T>;
  async waitForResponse(urlPattern: string, status?: number): Promise<T>;

  // Verification (built-in assertions)
  async verifyElementVisible(locator: Locator): Promise<void>;
  async verifyElementHasText(locator: Locator, text: string): Promise<void>;
  async verifyUrl(pattern: string | RegExp): Promise<void>;

  // Utilities
  async takeScreenshot(config?: ScreenshotConfig): Promise<Buffer>;
  async scrollToElement(locator: Locator): Promise<T>;
}
```

---

### 3. Advanced Fixtures

**Dependency injection system for tests**

**Available Fixtures:**

| Fixture                     | Type                      | Description                  |
| --------------------------- | ------------------------- | ---------------------------- |
| `homePage`                  | HomePage                  | Home page object             |
| `loginPage`                 | LoginPage                 | Login page object            |
| `locationLibraryPage`       | LocationLibraryPage       | Location library page        |
| `eyAdminClientListingPage`  | EYAdminClientListingPage  | Client listing page          |
| `regulationConfigPanelPage` | RegulationConfigPanelPage | Regulation config panel      |
| `apiHelper`                 | APITestHelper             | Basic API helper             |
| `authenticatedApi`          | APITestHelper             | Pre-authenticated API helper |
| `userBuilder`               | UserBuilder               | User data builder            |
| `organizationBuilder`       | OrganizationBuilder       | Organization builder         |
| `locationBuilder`           | LocationBuilder           | Location builder             |
| `scenarioBuilder`           | ScenarioBuilder           | Complete scenario builder    |
| `dataResolver`              | RuntimeDataResolver       | Runtime data resolver        |
| `runtimeConfig`             | RuntimeConfigManager      | Runtime configuration        |
| `testContext`               | TestContext               | Test metadata                |
| `cleanupStack`              | CleanupStack              | Automatic cleanup            |

---

### 4. Test Data System

**Three-tier test data architecture:**

1. **Builders** - Fluent API for creating test data
2. **Factory** - Centralized data creation
3. **Runtime Resolver** - Dynamic data from multiple sources

```typescript
// Tier 1: Builders (type-safe, fluent API)
const user = userBuilder.create().withEmail('test@test.com').withRole('admin').build();

// Tier 2: Factory (centralized creation)
const userData = TestDataFactory.createUser({ role: 'admin' });

// Tier 3: Runtime Resolver (dynamic from CLI/env/file)
const runtimeUser = dataResolver.resolveUser();
```

---

### 5. Validation System

**Multi-layer validation architecture:**

```typescript
// API Validation
const apiValidator = new APIValidator();
apiValidator.validateResponse(response, 'User');
apiValidator.validateStatusCode(response, 200);
apiValidator.validateHeaders(response, { 'Content-Type': 'application/json' });

// Business Logic Validation
const userValidator = new UserValidator();
userValidator.validateEmail(user.email);
userValidator.validateRole(user.role);
userValidator.validatePermissions(user.permissions);

// Schema Validation
const schema = schemas.UserSchema;
const isValid = validator.validateSchema(userData, schema);
```

---

## 🚀 Advanced Capabilities

### 1. Plugin System

**Extensible plugin architecture for custom functionality**

```typescript
import { IPlugin, pluginManager } from '@/lib/plugins';

// Create custom plugin
class MyCustomPlugin implements IPlugin {
  name = 'my-plugin';

  async beforeTest(testInfo: TestInfo): Promise<void> {
    console.log(`Starting test: ${testInfo.title}`);
  }

  async afterTest(testInfo: TestInfo, result: TestResult): Promise<void> {
    if (result.status === 'failed') {
      // Custom failure handling
      await this.sendSlackNotification(testInfo, result);
    }
  }
}

// Register plugin
pluginManager.register(new MyCustomPlugin());
```

---

### 2. Error Handling

**Comprehensive error handling with retry strategies**

```typescript
import { ErrorHandler } from '@/lib/ErrorHandler';
import { RetryStrategy } from '@/lib/retry/RetryStrategy';

// Automatic retry with exponential backoff
await RetryStrategy.withExponentialBackoff(async () => await apiCall(), {
  maxRetries: 3,
  initialDelay: 1000,
});

// Custom error handling
try {
  await someOperation();
} catch (error) {
  ErrorHandler.handle(error, {
    context: 'User creation',
    screenshot: true,
    log: true,
  });
}
```

---

### 3. Logging System

**Structured logging with multiple levels**

```typescript
import Log from '@/lib/Log';

Log.info('Test started', { testId: '123', environment: 'qa' });
Log.debug('Debug information', { data: complexObject });
Log.warn('Warning: Deprecated API used');
Log.error('Test failed', { error: errorObject });

// Conditional logging
if (config.isDebug()) {
  Log.debug('Detailed debug info');
}
```

---

### 4. Authentication Manager

**Pre-authentication and session management**

```typescript
import { AuthenticationManager } from '@/lib/auth/AuthenticationManager';

// Global setup (runs once)
const auth = new AuthenticationManager();
await auth.loginAndSave({
  username: 'admin@test.com',
  password: 'secure_password',
  storageFile: 'auth.json',
});

// Tests use saved session automatically
test('Authenticated test', async ({ page }) => {
  // Already authenticated - no login needed
  await page.goto('/dashboard');
});
```

---

## 🔗 Integration Ecosystem

### Integration Matrix

| System              | Purpose                               | Status     | Documentation                                                  |
| ------------------- | ------------------------------------- | ---------- | -------------------------------------------------------------- |
| **Azure DevOps**    | Work item management, test generation | ✅ Active  | [ADO-MCP-Integration-Guide.md](./ADO-MCP-Integration-Guide.md) |
| **OpenAPI/Swagger** | API contract testing                  | ✅ Active  | [SwaggerHelper.ts](../src/lib/SwaggerHelper.ts)                |
| **GitHub Actions**  | CI/CD automation                      | ✅ Active  | [.github/workflows](../.github/workflows)                      |
| **Slack**           | Notifications (via plugins)           | 🔄 Planned | -                                                              |
| **Jira**            | Test management                       | 🔄 Planned | -                                                              |
| **Allure**          | Enhanced reporting                    | 🔄 Planned | -                                                              |

---

### Azure DevOps MCP Integration

**Features:**

- ✅ Fetch work items with acceptance criteria
- ✅ Auto-generate tests from requirements
- ✅ Create test cases in ADO
- ✅ Link test results to work items
- ✅ Sprint coverage analysis
- ✅ AI-assisted test generation via MCP

**Example Workflow:**

```typescript
// 1. Fetch sprint work items
const sprintItems = await ado.getSprintWorkItems('Sprint 4');

// 2. Analyze which items have acceptance criteria
const withCriteria = sprintItems.filter(item => item.acceptanceCriteria);

// 3. Generate tests for each work item
for (const item of withCriteria) {
  await ado.generateTestFromWorkItem(item.id, {
    outputDir: './tests',
    testType: 'e2e',
    includeAPI: true,
  });
}

// 4. Run tests and link results
const results = await runTests();
await ado.linkTestResults(results, item.id);
```

---

### OpenAPI/Swagger Integration

**Auto-generate API tests from specifications:**

```typescript
import { SwaggerHelper } from '@/lib/SwaggerHelper';

const swagger = new SwaggerHelper('https://api.myapp.com/swagger.json');

// Generate all endpoint tests
await swagger.generateAllTests('./tests/api');

// Generate specific endpoint
await swagger.generateEndpointTest('/users/{id}', 'GET', './tests/api');

// Validate API responses against schema
const isValid = await swagger.validateResponse(response, '/users/{id}', 'GET', 200);
```

---

## 📚 Best Practices

### 1. Test Structure

**Follow Given/When/Then pattern:**

```typescript
test('User can create location', async ({ locationLibraryPage, dataResolver }) => {
  // Given user is authenticated and has location data
  const location = dataResolver.resolveLocation();
  await locationLibraryPage.navigateToLocationLibrary();

  // When user creates a new location
  await locationLibraryPage.openCreateForm();
  await locationLibraryPage.fillLocationForm(location);
  await locationLibraryPage.submitForm();

  // Then location should be created successfully
  await locationLibraryPage.verifyLocationCreated(location.name);
  await locationLibraryPage.verifySuccessMessage();
});
```

---

### 2. Page Object Design

**Principles:**

- ✅ Extend `BasePage<T>` for fluent interface
- ✅ Use role-based selectors for accessibility
- ✅ Verification methods handle assertions
- ✅ Return `this` for method chaining
- ✅ Add proper logging
- ✅ Keep business logic out of page objects

```typescript
export class MyPage extends BasePage<MyPage> {
  // Locators
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  // Actions return this for chaining
  async clickSubmit(): Promise<MyPage> {
    Log.info('Clicking submit button');
    await this.click(this.submitButton);
    return this;
  }

  // Verification methods handle assertions
  async verifySubmitSuccess(): Promise<void> {
    Log.info('Verifying submit success');
    await expect(this.successMessage).toBeVisible();
    Log.info('Submit verified successfully');
  }
}
```

---

### 3. Test Data Management

**Best practices:**

- ✅ Use builders for complex data
- ✅ Use runtime resolver for flexibility
- ✅ Use factory for simple data
- ✅ Keep test data DRY
- ✅ Use meaningful defaults

```typescript
// Good: Flexible and reusable
test('Create user test', async ({ userBuilder, dataResolver }) => {
  // Try to use runtime data, fall back to builder
  const user = dataResolver.resolveUser() || userBuilder.create().withRole('admin').build();

  await createUser(user);
});

// Bad: Hardcoded data
test('Create user test', async () => {
  const user = {
    email: 'test@test.com', // Hardcoded
    name: 'Test User', // Not reusable
    role: 'admin', // No validation
  };
  await createUser(user);
});
```

---

### 4. Error Handling

**Best practices:**

- ✅ Use try-catch for expected errors
- ✅ Use ErrorHandler for unexpected errors
- ✅ Add context to errors
- ✅ Take screenshots on failures
- ✅ Log error details

```typescript
test('Handle errors properly', async ({ page }) => {
  try {
    await someRiskyOperation();
  } catch (error) {
    // Provide context
    ErrorHandler.handle(error, {
      context: 'User creation failed',
      screenshot: true,
      additionalInfo: { userId: user.id },
    });

    // Re-throw if needed
    throw error;
  }
});
```

---

### 5. Performance Optimization

**Tips:**

- ✅ Use global setup for authentication
- ✅ Parallelize independent tests
- ✅ Use fixtures for dependency injection
- ✅ Cache static data
- ✅ Use profiles for different test suites

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // Parallel workers
  fullyParallel: true, // Run tests in parallel
  retries: process.env.CI ? 2 : 0, // Retry on CI
  globalSetup: './config/globalSetup.ts', // Pre-authenticate
  use: {
    trace: 'retain-on-failure', // Trace only failures
    screenshot: 'only-on-failure', // Screenshot only failures
  },
});
```

---

## 🔮 Future Enhancements

### Phase 1: Near-Term (Q1 2026)

#### 1. **Visual Regression Testing** 📸

```typescript
// Automated visual comparison
test('Visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard-baseline.png', {
    maxDiffPixels: 100,
    threshold: 0.2,
  });
});
```

**Benefits:**

- Catch UI regressions automatically
- Baseline management system
- Cross-browser visual testing
- CI/CD integration

---

#### 2. **Performance Testing Integration** ⚡

```typescript
import { performance } from '@/lib/performance';

test('Performance metrics', async ({ page }) => {
  const metrics = await performance.measure(async () => {
    await page.goto('/dashboard');
  });

  expect(metrics.loadTime).toBeLessThan(3000);
  expect(metrics.firstContentfulPaint).toBeLessThan(1500);
});
```

**Capabilities:**

- Load time monitoring
- Core Web Vitals tracking
- Performance budgets
- Trend analysis

---

#### 3. **Enhanced Reporting with Allure** 📊

```typescript
// Automatic Allure integration
test('User creation', async ({ page }) => {
  allure.epic('User Management');
  allure.feature('User Creation');
  allure.story('Admin creates new user');

  // Test steps automatically logged
  await createUser();

  allure.attachment('User Data', JSON.stringify(user));
});
```

**Features:**

- Rich HTML reports
- Test history tracking
- Flaky test detection
- Test categorization (epic/feature/story)
- Screenshots and attachments
- Trend analysis

---

#### 4. **AI-Powered Test Maintenance** 🤖

```typescript
// Auto-heal broken selectors
const selector = await ai.findOptimalSelector({
  element: 'Submit button',
  fallbacks: ['button:has-text("Submit")', '#submit-btn', '.submit-button'],
});

// Auto-update page objects when UI changes
await ai.updatePageObjects({
  basedOn: 'latest-screenshot',
  compareWith: 'baseline',
});
```

**Capabilities:**

- Self-healing selectors
- Auto-update page objects
- Suggest test improvements
- Identify redundant tests
- Generate new test cases from production logs

---

### Phase 2: Mid-Term (Q2-Q3 2026)

#### 5. **Multi-Language Support** 🌐

```typescript
// i18n testing
test('Localization test', async ({ page }) => {
  for (const locale of ['en-US', 'es-ES', 'fr-FR']) {
    await page.goto(`/?lang=${locale}`);
    await expect(page.getByText(t('welcome.message', locale))).toBeVisible();
  }
});
```

**Features:**

- Multi-language test execution
- Translation validation
- RTL (right-to-left) support
- Currency/date format validation

---

#### 6. **Accessibility Testing** ♿

```typescript
import { a11y } from '@/lib/accessibility';

test('Accessibility compliance', async ({ page }) => {
  await page.goto('/dashboard');

  const results = await a11y.analyze(page, {
    standard: 'WCAG2.1-AA',
    tags: ['wcag2a', 'wcag2aa'],
  });

  expect(results.violations).toHaveLength(0);
});
```

**Standards:**

- WCAG 2.1 AA/AAA
- Section 508
- ADA compliance
- Automated accessibility audits

---

#### 7. **Contract Testing** 📋

```typescript
import { pactTest } from '@/lib/pact';

pactTest('User API contract', async ({ provider, consumer }) => {
  // Define contract
  await provider
    .given('User 123 exists')
    .uponReceiving('A request for user 123')
    .withRequest({ method: 'GET', path: '/users/123' })
    .willRespondWith({
      status: 200,
      body: { id: 123, name: 'John Doe' },
    });

  // Verify contract
  await consumer.verifyContract();
});
```

**Features:**

- Consumer-driven contracts
- Provider verification
- Contract versioning
- Breaking change detection

---

#### 8. **Mobile Testing Expansion** 📱

```typescript
test('Mobile responsive', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only test');

  await page.goto('/');

  // Mobile-specific assertions
  await expect(page.locator('.mobile-menu')).toBeVisible();
  await expect(page.locator('.desktop-menu')).not.toBeVisible();
});
```

**Capabilities:**

- Native mobile app testing (iOS/Android)
- Responsive design validation
- Touch gesture simulation
- Device emulation
- Real device testing

---

### Phase 3: Long-Term (Q4 2026+)

#### 9. **Chaos Engineering** 💥

```typescript
import { chaos } from '@/lib/chaos';

test('Resilience under chaos', async ({ page }) => {
  // Inject random failures
  await chaos.inject({
    networkFailure: 0.1, // 10% chance
    slowNetwork: 0.2, // 20% chance
    serverError: 0.05, // 5% chance
  });

  // System should still work
  await page.goto('/dashboard');
  await expect(page.locator('.fallback-message')).toBeVisible();
});
```

**Scenarios:**

- Network failures
- Slow responses
- Server errors
- Database failures
- Third-party service outages

---

#### 10. **ML-Based Test Optimization** 🧠

```typescript
// AI predicts which tests are likely to fail
const riskyTests = await ml.predictFailures({
  based on: 'recent-commits',
  confidence: 0.8
});

// Run risky tests first
await runTests(riskyTests, { priority: 'high' });

// AI suggests test suite optimization
const recommendations = await ml.optimizeTestSuite({
  goal: 'reduce-execution-time',
  constraints: { minCoverage: 0.95 }
});
```

**Capabilities:**

- Failure prediction
- Test suite optimization
- Flaky test detection
- Intelligent test selection
- Coverage gap identification

---

#### 11. **Cross-Platform Testing** 🖥️

```typescript
test('Cross-platform compatibility', async () => {
  const platforms = ['windows', 'macos', 'linux'];
  const browsers = ['chromium', 'firefox', 'webkit'];

  for (const platform of platforms) {
    for (const browser of browsers) {
      await runTest({ platform, browser });
    }
  }
});
```

**Features:**

- Multi-OS testing
- Browser compatibility matrix
- Cloud testing integration (BrowserStack, Sauce Labs)
- Parallel cross-platform execution

---

#### 12. **Security Testing** 🔒

```typescript
import { security } from '@/lib/security';

test('Security vulnerabilities', async ({ page }) => {
  // XSS testing
  await security.testXSS(page, {
    inputs: ['username', 'comment', 'search'],
  });

  // CSRF testing
  await security.testCSRF(page, {
    endpoints: ['/api/users', '/api/settings'],
  });

  // SQL injection
  await security.testSQLInjection(page);

  // Authentication bypass
  await security.testAuthBypass(page);
});
```

**Checks:**

- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- SQL Injection
- Authentication bypass
- Session management
- HTTPS enforcement

---

## 📊 Success Metrics

### Current Performance

| Metric               | Value               | Target        |
| -------------------- | ------------------- | ------------- |
| Test Creation Time   | 70% reduction       | 80% reduction |
| Test Coverage        | 65%                 | 80%           |
| Test Execution Time  | 15 min (full suite) | 10 min        |
| Flaky Test Rate      | 2%                  | <1%           |
| Auto-Generated Tests | 40%                 | 60%           |
| CI/CD Pass Rate      | 92%                 | 95%           |

### ROI Metrics

- **Time Saved**: ~40 hours/month in manual test writing
- **Bugs Found**: 2.5x more bugs caught in QA vs Production
- **Deployment Confidence**: 95% confidence in releases
- **Cost Savings**: $150K/year in reduced QA overhead

---

## 🤝 Contributing

### Adding New Features

1. **Create Feature Branch**

```bash
git checkout -b feature/my-new-feature
```

2. **Follow Framework Patterns**

- Extend BasePage for page objects
- Use advanced fixtures for DI
- Follow Given/When/Then in tests
- Add proper logging

3. **Add Documentation**

- Update relevant docs
- Add code examples
- Document public APIs

4. **Create Tests**

- Unit tests for utilities
- Integration tests for features
- E2E tests for workflows

5. **Submit PR**

- Follow commit conventions
- Add tests
- Update CHANGELOG.md

---

## 📞 Support & Resources

### Documentation

- **Framework Overview**: [FRAMEWORK_OVERVIEW.md](./FRAMEWORK_OVERVIEW.md) (this doc)
- **Integration Guide**: [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)
- **Hybrid Test Generation**: [HYBRID_TEST_GENERATION.md](../HYBRID_TEST_GENERATION.md)
- **ADO MCP Integration**: [ADO-MCP-Integration-Guide.md](./ADO-MCP-Integration-Guide.md)
- **Test Prompt Guide**: [generate_tests.prompt.md](../.github/generate_tests.prompt.md)

### Quick Links

- **Source Code**: https://github.com/ey-org/playwright-fw
- **Issue Tracker**: https://github.com/ey-org/playwright-fw/issues
- **Wiki**: https://github.com/ey-org/playwright-fw/wiki
- **Playwright Docs**: https://playwright.dev

### Getting Help

- **Slack Channel**: `#test-automation`
- **Email**: qa-automation@ey.com
- **Team Lead**: QA Manager

---

## 📄 License

ISC License - Copyright (c) 2025 EY

---

## 🎯 Conclusion

The EY Infinity Test Automation Framework represents a **modern, scalable, and intelligent** approach to software testing. By combining automated test generation, advanced design patterns, and AI-powered capabilities, it empowers teams to:

- ⚡ **Accelerate** test development
- 🎯 **Improve** test quality and coverage
- 🔄 **Maintain** tests with minimal effort
- 📊 **Scale** testing across multiple products
- 🚀 **Deliver** with confidence

The framework's continuous evolution through planned enhancements ensures it remains at the forefront of testing innovation, supporting EY's commitment to quality and excellence.

---

**Last Updated:** December 8, 2025  
**Version:** 2.0  
**Maintained by:** EY QA & Automation Team

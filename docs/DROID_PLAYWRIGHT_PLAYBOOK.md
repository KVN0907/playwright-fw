# Factory.ai Droid + Playwright Automation Playbook

## Executive Summary

This playbook enables team members to leverage Factory.ai Droid for accelerating Playwright test automation. By combining AI-assisted development with your existing automation framework, you can shift functional QE cycles to a broader team base while freeing QE bandwidth for higher-order activities.

**Target Audience:** Developers, QE Engineers, Product Owners, Business Analysts

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Workflows](#core-workflows)
3. [API Test Generation](#api-test-generation)
4. [UI Test Generation](#ui-test-generation)
5. [Test Enhancement & Debugging](#test-enhancement--debugging)
6. [ADO Integration](#ado-integration)
7. [Best Practices](#best-practices)
8. [Command Reference](#command-reference)

---

## Quick Start

### Prerequisites

- Factory.ai Droid extension installed in VS Code
- Access to the automation framework (`tests/automation/`)
- Node.js 20.x and npm installed

### Your First Droid-Assisted Test

1. **Open the test file or folder** in VS Code
2. **Invoke Droid** using `Cmd+I` (Mac) or `Ctrl+I` (Windows)
3. **Describe what you need** in natural language

**Example Prompt:**

```
Create an API test for the create-users endpoint that validates:
- Successful user creation with valid EY email
- Rejection of non-EY email domains
- Duplicate email validation
```

---

## Core Workflows

### Workflow 1: Generate Tests from ADO Work Items

**Scenario:** You have ADO Story #197592 and need comprehensive test coverage.

**Droid Prompt:**

```
Read ADO Story #197592 and generate Playwright API tests covering:
- All acceptance criteria
- Edge cases and negative scenarios
- Security validations (XSS, SQL injection)
Tag each test with the corresponding ADO test case ID
```

**What Droid Does:**

1. Fetches the ADO work item details
2. Analyzes acceptance criteria
3. Generates tests following your framework patterns
4. Links tests to ADO with `@ADO-{testCaseId}` tags

**Output Example:**

```typescript
test('should create EY Admin user successfully @regression @ADO-201683', async ({ request }) => {
  const userData = generateTestUser();
  const response = await request.post(EY_ADMINS_ENDPOINT, { data: userData });
  expect([200, 201]).toContain(response.status());
  // ... assertions
});
```

---

### Workflow 2: Expand Test Coverage for Existing Tests

**Scenario:** You have basic happy-path tests and need comprehensive coverage.

**Droid Prompt:**

```
Analyze the existing tests in 197592-create-users.spec.ts and add:
- Boundary value tests (min/max field lengths)
- Security tests (injection attacks)
- Race condition tests (parallel submissions)
- Error state recovery tests
```

**Droid analyzes your patterns and generates:**

```typescript
test('should enforce maximum field lengths @regression @ADO-201697', async ({ request }) => {
  const veryLongName = 'A'.repeat(500);
  const response = await request.post(EY_ADMINS_ENDPOINT, {
    data: {
      firstName: veryLongName,
      lastName: 'TestLast',
      username: generateTestEmail('max.length'),
    },
  });
  expect([400, 413, 422]).toContain(response.status());
});
```

---

### Workflow 3: Create Page Objects for New Features

**Scenario:** New UI feature needs Page Object implementation.

**Droid Prompt:**

```
Create a Page Object for the User Management page that includes:
- Add User dialog interactions
- User table operations (search, filter, pagination)
- Form validation checks
- Follow the BasePage pattern from our framework
```

**Droid generates:**

```typescript
export class EYAdminUserManagementPage extends BasePage<EYAdminUserManagementPage> {
  // Locators
  readonly addUserButton = this.page.getByRole('button', { name: /add user/i });
  readonly searchInput = this.page.getByPlaceholder('Search');

  // Actions
  async createEYAdmin(user: EYAdminUser): Promise<void> {
    await this.openAddUserDialog();
    await this.fillAddUserForm(user);
    await this.submitAddUserForm();
  }
  // ... more methods
}
```

---

## API Test Generation

### Pattern: CRUD Operations

**Droid Prompt:**

```
Generate comprehensive CRUD tests for the /api/admin/api/ey-admins endpoint including:
- Create with valid/invalid data
- Read single and list with pagination
- Update partial and full records
- Delete with cascade validation
Use our APITestHelper and fixtures pattern
```

### Pattern: RBAC Testing

**Droid Prompt:**

```
Create RBAC tests for the clients endpoint that verify:
- Super Admin: full CRUD access
- EY Admin: full CRUD access
- Client Admin: read-only access
- Viewer: read-only access
Test unauthorized access returns 403
```

**Generated Pattern:**

```typescript
const RBAC_MATRIX = [
  { role: 'superAdmin', create: true, read: true, update: true, delete: true },
  { role: 'eyAdmin', create: true, read: true, update: true, delete: true },
  { role: 'clientAdmin', create: false, read: true, update: false, delete: false },
];

for (const { role, ...permissions } of RBAC_MATRIX) {
  test.describe(`RBAC: ${role}`, () => {
    test(`${role} create permission`, async ({ request }) => {
      // Test implementation
    });
  });
}
```

### Pattern: Network Intercept Tests

**Droid Prompt:**

```
Create network intercept tests that simulate:
- API 500/503 errors and verify graceful handling
- Slow network responses (3s+ latency)
- Timeout scenarios
- Offline mode recovery
```

---

## UI Test Generation

### Pattern: Form Validation Tests

**Droid Prompt:**

```
Generate UI tests for the Add User form covering:
- Required field validation (blank submission)
- Email format validation
- EY domain enforcement
- Duplicate email detection
- XSS/injection prevention
Use the EYAdminUserManagementPage object
```

### Pattern: User Journey Tests

**Droid Prompt:**

```
Create an E2E test for the complete user onboarding journey:
1. Login as Super Admin
2. Navigate to User Management
3. Create new EY Admin user
4. Verify user appears in Active list
5. Search and filter the new user
6. Deactivate the user
7. Verify user moves to Inactive list
```

### Pattern: Accessibility Tests

**Droid Prompt:**

```
Add accessibility checks to the User Management page tests:
- Keyboard navigation (Tab order)
- Screen reader compatibility (ARIA labels)
- Focus management in dialogs
- Color contrast validation
```

---

## Test Enhancement & Debugging

### Debug Failing Tests

**Droid Prompt:**

```
This test is failing intermittently:
[paste test code or error message]

Analyze and:
1. Identify potential race conditions
2. Add proper waits/assertions
3. Improve error messages for debugging
```

### Improve Test Reliability

**Droid Prompt:**

```
Review this test file and improve reliability:
- Replace hard waits with proper assertions
- Add retry logic for flaky network calls
- Improve locator specificity
- Add meaningful test descriptions
```

### Generate Test Data

**Droid Prompt:**

```
Create a TestDataFactory for user creation that generates:
- Valid EY emails with unique suffixes
- Names with special characters (O'Brien, García)
- Edge case data (max length, unicode)
- Invalid data for negative tests
```

---

## ADO Integration

### Link Tests to Work Items

**Droid Prompt:**

```
Update these tests to link with ADO:
- Add @ADO-{testCaseId} tags
- Include story reference in describe block
- Add test case documentation comments
```

### Generate Bug Reports

**Droid Prompt:**

```
This test found a bug. Create an ADO bug report with:
- Clear reproduction steps
- Expected vs actual behavior
- HTTP request/response examples
- Screenshots if available
- Suggested severity: High
```

### Create Test Plan from Sprint

**Droid Prompt:**

```
Analyze ADO Sprint 1-4 stories and create a test coverage matrix showing:
- Story ID → Test coverage status
- Missing test scenarios
- Priority recommendations
```

---

## Best Practices

### Do's

| Practice                        | Example                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| **Be specific in prompts**      | "Create API test for POST /ey-admins with invalid email formats" |
| **Reference existing patterns** | "Follow the pattern in 197592-create-users.spec.ts"              |
| **Include acceptance criteria** | "Test should verify AC#3: email must be EY domain only"          |
| **Request tags**                | "Add @regression @security @ADO-12345 tags"                      |
| **Ask for edge cases**          | "Include boundary values and security scenarios"                 |

### Don'ts

| Anti-Pattern       | Better Approach                                     |
| ------------------ | --------------------------------------------------- |
| "Write some tests" | "Create CRUD tests for /api/clients endpoint"       |
| "Make it work"     | "Fix the timing issue by adding waitForResponse"    |
| "Test everything"  | "Test user creation with focus on email validation" |

### Prompt Templates

**API Test Generation:**

```
Create Playwright API tests for {endpoint} that cover:
- Happy path: {describe success scenario}
- Validation: {list validation rules}
- Security: {XSS, injection, auth}
- Edge cases: {boundary values, special characters}

Use fixtures from advancedFixtures.ts
Follow patterns from existing Sprint1 tests
Tag with @ADO-{storyId}
```

**UI Test Generation:**

```
Create Playwright UI tests for {feature} that:
- Use Page Object: {PageObjectName}
- Test user journey: {steps}
- Validate: {assertions}
- Handle errors: {error scenarios}

Include accessibility checks
Follow existing E2E patterns
```

---

## Command Reference

### Droid Keyboard Shortcuts

| Shortcut               | Action                        |
| ---------------------- | ----------------------------- |
| `Cmd/Ctrl + I`         | Open Droid chat               |
| `Cmd/Ctrl + Shift + I` | Inline edit with Droid        |
| `Cmd/Ctrl + L`         | Open Droid with selected code |

### Common Droid Commands

```
# Generate tests from file
"Generate tests for the API defined in security-service-uri.json"

# Analyze and improve
"Analyze this test file and suggest improvements for reliability"

# Debug assistance
"Why is this test failing? Here's the error: [paste error]"

# Documentation
"Add JSDoc comments to all test functions in this file"

# Refactor
"Refactor these tests to use the advancedFixtures pattern"
```

### Framework Commands

```bash
# Run all tests
npm run test:qa

# Run specific test file
npm test -- --grep "197592"

# Run with specific tag
npm test -- --grep "@regression"

# Debug mode (visible browser)
npm run test:debug

# Generate HTML report
npm run report
```

---

## Success Metrics

Track your Droid-Playwright adoption:

| Metric                 | Target         | Measurement                   |
| ---------------------- | -------------- | ----------------------------- |
| Test coverage increase | 30% per sprint | Tests generated vs manual     |
| Time to first test     | < 15 minutes   | From story to passing test    |
| Bug detection rate     | +20%           | Bugs found by generated tests |
| QE bandwidth freed     | 40%            | Time saved on test creation   |

---

## Appendix: Sample Generated Tests

### Complete API Test Example

```typescript
import { test, expect } from '../../fixtures/advancedFixtures';
import { faker } from '@faker-js/faker';

/**
 * Sprint 1 API Tests - Create Users: EY Super Admin
 * ADO Story: #197592
 */

const API_BASE = '/api/admin/api';
const EY_ADMINS_ENDPOINT = `${API_BASE}/ey-admins`;

const generateTestUser = () => ({
  firstName: `Test${faker.string.alphanumeric(6)}`,
  lastName: `User${faker.string.alphanumeric(6)}`,
  username: `test.user.${Date.now()}@in.ey.com`,
});

test.describe('Story #197592: Create Users - EY Super Admin', () => {
  test('should create EY Admin user successfully @regression @ADO-201683', async ({ request }) => {
    const userData = generateTestUser();
    const response = await request.post(EY_ADMINS_ENDPOINT, { data: userData });

    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.firstName).toBe(userData.firstName);
  });

  test('should reject non-EY email domain @regression @ADO-201685', async ({ request }) => {
    const response = await request.post(EY_ADMINS_ENDPOINT, {
      data: { ...generateTestUser(), username: 'test@gmail.com' },
    });
    expect([400, 403, 422]).toContain(response.status());
  });

  test('should protect against SQL injection @security @ADO-201699', async ({ request }) => {
    const response = await request.post(EY_ADMINS_ENDPOINT, {
      data: {
        firstName: "Robert'); DROP TABLE users;--",
        lastName: 'Test',
        username: `inject.${Date.now()}@in.ey.com`,
      },
    });
    // Should not cause server error
    expect([200, 201, 400, 422]).toContain(response.status());
  });
});
```

### Complete UI Test Example

```typescript
import { test, expect } from '../../fixtures/advancedFixtures';
import { EYAdminUserManagementPage } from '../../../pages/eyadmin/EYAdminUserManagementPage';

test.describe('Story #197596 - Create EY Admin User', () => {
  let userManagementPage: EYAdminUserManagementPage;

  test.beforeEach(async ({ page }) => {
    userManagementPage = new EYAdminUserManagementPage(page);
    await userManagementPage.navigateToUserManagement();
    await userManagementPage.verifyPageLoaded();
  });

  test('Successfully Add EY Admin @regression @smoke @ADO-202107', async () => {
    const newUser = {
      firstName: `AUTOQA_Test_${Date.now()}`,
      lastName: `User${Date.now()}`,
      email: `test.user.${Date.now()}@in.ey.com`,
    };

    await userManagementPage.createEYAdmin(newUser);
    await userManagementPage.verifyUserCreationSuccess();

    const fullName = `${newUser.firstName} ${newUser.lastName}`;
    await userManagementPage.verifyUserInTable(fullName);
    await userManagementPage.verifyUserStatus(fullName, 'Active');
  });

  test('XSS Injection Prevention @security @SECURITY-001', async ({ page }) => {
    await userManagementPage.openAddUserDialog();

    await userManagementPage.fillAddUserForm({
      firstName: "<script>alert('XSS')</script>",
      lastName: 'TestUser',
      email: `xss.test.${Date.now()}@ey.com`,
    });
    await userManagementPage.submitAddUserForm();

    // Verify no script execution
    const alertDetected = await page.evaluate(() => (window as any).xssAlertTriggered === true);
    expect(alertDetected).toBeFalsy();
  });
});
```

---

_Document Version: 1.0 | Last Updated: December 2024_

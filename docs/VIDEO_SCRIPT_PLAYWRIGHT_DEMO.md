# Video Script: Playwright Framework Capabilities Demo

## Video Details

- **Duration:** 8-10 minutes
- **Format:** Screen recording with voiceover
- **Purpose:** Showcase Playwright framework capabilities independent of Droid
- **Target Audience:** Technical team members, stakeholders, new team onboarding

---

## Pre-Recording Checklist

- [ ] VS Code open with automation project
- [ ] QA environment accessible and stable
- [ ] Sample test data ready
- [ ] Clear browser cache/cookies
- [ ] Terminal ready
- [ ] Screen resolution: 1920x1080
- [ ] Playwright trace viewer ready

---

## SCENE 1: Introduction & Framework Overview (1 minute)

### Visual

- Title card: "EY Playwright Automation Framework"
- Show project structure in VS Code explorer

### Script

```
"Welcome to the EY Playwright Automation Framework demo. This enterprise-grade
framework powers our test automation across multiple products, starting with
EY Compliance Manager.

Let me show you the framework structure:
- src/tests contains our API and UI test suites
- src/pages holds our Page Object classes
- src/lib provides utilities, API helpers, and test data factories
- src/fixtures manages dependency injection for tests

This architecture enables parallel execution, multi-environment support,
and comprehensive reporting. Let's see it in action."
```

### Actions

1. Show folder structure briefly
2. Highlight key directories
3. Open package.json to show available scripts

---

## SCENE 2: API Testing Capabilities (2 minutes)

### Visual

- Open an API test file
- Run tests in terminal
- Show passing results

### Actions to Record

**Step 1: Show API Test Structure**

- Open `197592-create-users.spec.ts`
- Highlight test structure, fixtures usage

**Step 2: Run API Tests**

```bash
npm run test:api -- --grep "Create Users"
```

**Step 3: Show Results**

- Display test output
- Highlight pass/fail summary

### Script

```
"Our API testing suite provides comprehensive backend validation. Here's
a test file for user creation - notice the clean structure with describe
blocks, individual test cases, and ADO traceability tags.

Each test uses our APITestHelper which handles:
- Authentication automatically
- Retry logic for flaky network calls
- Request/response logging
- Error categorization

Let me run these tests... All 20 tests pass in under 30 seconds. The
framework validates CRUD operations, security scenarios, and edge cases
like duplicate email handling."
```

---

## SCENE 3: UI Testing with Page Objects (2 minutes)

### Visual

- Show Page Object file
- Show corresponding UI test
- Run with visible browser

### Actions to Record

**Step 1: Show Page Object**

- Open `EYAdminUserManagementPage.ts`
- Highlight locators and methods

**Step 2: Show UI Test**

- Open `197596-create-ey-admin-user.spec.ts`
- Show how it uses the Page Object

**Step 3: Run with Headed Mode**

```bash
npm run test:headed -- --grep "Successfully Add EY Admin"
```

### Script

```
"For UI testing, we use the Page Object Model pattern. This Page Object
encapsulates all User Management interactions - locators at the top,
action methods below.

The corresponding test file reads like plain English: navigate to user
management, create EY admin, verify creation success. This abstraction
makes tests maintainable and readable by non-technical stakeholders.

Watch the headed test execution... The browser launches, navigates to
the page, interacts with the form, and validates the result. All actions
are visible for debugging and demonstration purposes."
```

---

## SCENE 4: Multi-Environment Support (1 minute)

### Visual

- Show environment config files
- Switch environments via command line

### Actions to Record

**Step 1: Show Environment Configs**

- Open `config/environments/` folder
- Show `qa.env` and `dev.env` differences

**Step 2: Run in Different Environment**

```bash
# Run in QA
npm run test:qa

# Run in Dev
npm run test:dev
```

### Script

```
"The framework supports multiple environments out of the box. Each
environment has its own configuration file with URLs, credentials,
and feature flags.

Switching environments is simple - just change the command. The
ConfigManager automatically loads the correct settings, handles
authentication, and adjusts test behavior.

This enables the same test suite to run against Dev for smoke tests,
QA for regression, and staging for pre-production validation."
```

---

## SCENE 5: Advanced Features (2 minutes)

### Visual

- Show test with network interception
- Show RBAC test suite
- Show visual regression output

### Section A: Network Intercept Testing (45 seconds)

**Actions:**

- Open `network.spec.ts`
- Show mock setup code

**Script:**

```
"Network intercept testing lets us simulate backend failures. Here we
mock a 500 error to verify the UI handles it gracefully.

We can also simulate slow networks, timeouts, and specific error
responses. This catches issues that are impossible to find with
standard testing."
```

### Section B: RBAC Testing (45 seconds)

**Actions:**

- Open `rbac.spec.ts`
- Show role-based test matrix

**Script:**

```
"Role-based access control testing uses a data-driven approach. We
define a permission matrix and automatically generate tests for each
role-endpoint combination.

This ensures Super Admins have full access, while Client Admins are
properly restricted - critical for compliance."
```

### Section C: Visual Testing (30 seconds)

**Actions:**

- Show visual comparison output
- Highlight diff detection

**Script:**

```
"Visual regression testing captures UI screenshots and compares them
against baselines. Any unexpected changes are flagged with pixel-level
diff highlighting - catching CSS regressions and layout issues
automatically."
```

---

## SCENE 6: Reporting & CI/CD Integration (1.5 minutes)

### Visual

- Open HTML test report
- Show GitHub Actions workflow
- Show ADO bug creation

### Actions to Record

**Step 1: Open Report**

```bash
npm run report
```

- Navigate through report sections
- Show failure details, screenshots, traces

**Step 2: Show CI Pipeline**

- Open `.github/workflows/qa-automation.yml`
- Highlight triggers and stages

**Step 3: Show ADO Integration**

- Show auto-created bug in ADO (screenshot or brief demo)

### Script

```
"After test execution, our enhanced HTML reporter provides an interactive
dashboard. You can filter by status, view failure screenshots, and drill
into trace files for debugging.

The framework integrates with GitHub Actions for CI/CD. Tests run
automatically on pull requests, scheduled nightly for regression, and
on-demand for targeted validation.

When tests fail, the framework can automatically create ADO bugs with:
- Detailed reproduction steps
- HTTP request/response examples
- Screenshots and traces
- Links to the parent story

This closes the loop from test failure to bug tracking automatically."
```

---

## SCENE 7: Running Tests - Command Reference (1 minute)

### Visual

- Terminal with commands
- Show different execution modes

### Actions to Record

**Execute each command briefly:**

```bash
# All tests
npm test

# API only
npm run test:api

# UI only
npm run test:ui

# Specific file
npm test -- 197592-create-users.spec.ts

# Specific tag
npm test -- --grep "@regression"

# Debug mode
npm run test:debug

# With coverage
npm run test:coverage
```

### Script

```
"Here's your command reference for running tests:

npm test runs everything. Add :api or :ui to target specific suites.

For specific files, pass the filename. For tags, use --grep with the
tag name.

Debug mode opens the Playwright Inspector for step-by-step debugging.
And test:coverage generates a coverage report showing which code paths
are exercised.

These commands work locally and in CI - same framework, same results."
```

---

## SCENE 8: Closing (30 seconds)

### Visual

- Summary slide
- Resource links

### Script

```
"That's the EY Playwright Automation Framework. Key capabilities include:

- API and UI testing with Page Objects
- Multi-environment support
- Network mocking and RBAC testing
- Visual regression detection
- Integrated reporting and CI/CD
- Automatic ADO bug creation

Documentation is in the docs folder. The FRAMEWORK_OVERVIEW provides
architecture details, and GETTING_STARTED helps you write your first test.

Questions? Reach out to the QA Automation team. Happy testing!"
```

---

## Recording Tips

### Demo Best Practices

- Pre-run tests once to ensure they pass
- Have backup recordings of successful runs
- Use a clean test environment
- Clear browser history/cache before recording

### Command Execution

- Type commands clearly (not too fast)
- Pause for output to display
- Scroll slowly through long outputs

### Narration

- Match voiceover to on-screen actions
- Pause briefly before switching scenes
- Emphasize key features and benefits

---

## Post-Production Notes

### Chapter Markers

| Timestamp | Chapter           |
| --------- | ----------------- |
| 0:00      | Introduction      |
| 1:00      | API Testing       |
| 3:00      | UI Testing        |
| 5:00      | Environments      |
| 6:00      | Advanced Features |
| 7:30      | Reporting & CI/CD |
| 9:00      | Command Reference |

### Suggested Captions/Overlays

- Command text displayed on screen
- Feature highlights in corner badges
- "Pro Tip" callouts for best practices

### End Slide Content

```
EY Playwright Automation Framework

Documentation:
- docs/FRAMEWORK_OVERVIEW.md
- docs/GETTING_STARTED_HYBRID.md
- docs/INTEGRATION_GUIDE.md

Support:
- QA Automation Team
- #qa-automation Slack channel

Happy Testing!
```

---

_Demo Script Version: 1.0 | Last Updated: December 2024_

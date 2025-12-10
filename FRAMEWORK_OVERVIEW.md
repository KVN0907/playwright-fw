# EY AUTOMATION TEST FRAMEWORK

## Executive Summary

A comprehensive, enterprise-grade test automation framework built with Playwright, designed for scalable testing across multiple EY products. The framework supports API, UI, and E2E testing with integrated CI/CD pipelines, Azure DevOps bug tracking, and advanced reporting capabilities.

**Pilot Implementation:** EY Compliance Manager

---

## Framework Capabilities

| Feature                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| **Test Types**         | API, UI, E2E, Smoke, Regression, RBAC, Network Intercept       |
| **Multi-Environment**  | Dev, QA, Staging, Production with environment-specific configs |
| **Authentication**     | Keycloak SSO, Browser Session, Multi-user support              |
| **CI/CD Integration**  | GitHub Actions with manual, scheduled & post-deploy triggers   |
| **Reporting**          | Enhanced HTML, JUnit XML, JSON, GitHub Pages publishing        |
| **Bug Tracking**       | Azure DevOps integration with auto-linking to stories          |
| **Cross-Browser**      | Chromium, Firefox, WebKit support                              |
| **Parallel Execution** | Configurable workers & sharding                                |

---

## Framework Architecture

```
playwright-fw/
├── src/
│   ├── config/              # Environment & test configuration
│   │   ├── TestConfig.ts    # Playwright configuration
│   │   └── global-setup.ts  # Authentication setup
│   ├── fixtures/            # Reusable test fixtures
│   ├── lib/                 # Utilities & helpers
│   │   ├── config/          # Config management
│   │   └── rag/             # AI-powered test generation
│   └── tests/
│       ├── api/             # API test suites
│       └── ui/              # UI test suites
├── config/environments/     # Environment-specific .env files
└── playwright-report/       # Generated reports
```

---

## Key Features

### 1. Multi-Environment Support

- Separate configurations for Dev, QA, Staging, Production
- Environment-specific credentials and URLs
- Easy switching via `NODE_ENV` variable

```bash
# Run tests in different environments
npm run test:dev
npm run test:qa
npm run test:staging
npm run test:prod
```

### 2. Advanced Reporting

| Report Type   | Format   | Purpose                                     |
| ------------- | -------- | ------------------------------------------- |
| Enhanced HTML | `.html`  | Interactive dashboard with charts & filters |
| JUnit XML     | `.xml`   | CI/CD integration                           |
| JSON          | `.json`  | Programmatic access to results              |
| GitHub Pages  | Live URL | Shareable report hosting                    |

### 3. CI/CD Pipeline

```
┌──────────────────────────────────────────────────────────┐
│                  QA Automation Pipeline                   │
├──────────────────────────────────────────────────────────┤
│  Triggers:                                                │
│  • Manual dispatch with environment/suite selection       │
│  • Scheduled (configurable cron)                          │
│  • Post-deployment hooks                                  │
├──────────────────────────────────────────────────────────┤
│  Test Suites:                                             │
│  • Smoke Tests - Fast validation                          │
│  • API Tests - Backend validation                         │
│  • UI Tests - Frontend E2E (parallel shards)              │
│  • Regression - Full suite (nightly)                      │
├──────────────────────────────────────────────────────────┤
│  Outputs:                                                 │
│  • Test summary with pass/fail counts                     │
│  • Live HTML report on GitHub Pages                       │
│  • Downloadable artifacts                                 │
│  • Failed test list in workflow summary                   │
└──────────────────────────────────────────────────────────┘
```

### 4. RBAC Testing Support

- Multi-user authentication
- Role-based permission validation
- Configurable user credentials per environment

### 5. Network Intercept Testing

- Mock API responses
- Simulate error conditions (500, 503, 401, 403, 404)
- Test network conditions (slow, timeout, offline)
- Request/response monitoring

### 6. Azure DevOps Integration

- Automatic bug creation with detailed reproduction steps
- Link bugs to parent stories
- Include HTTP request/response examples
- Severity and priority classification

---

## Technical Stack

| Component      | Technology                   | Version |
| -------------- | ---------------------------- | ------- |
| Test Framework | Playwright                   | 1.57.0  |
| Runtime        | Node.js                      | 20.x    |
| Language       | TypeScript                   | 5.x     |
| CI/CD          | GitHub Actions               | -       |
| Bug Tracking   | Azure DevOps                 | -       |
| Authentication | Keycloak                     | -       |
| Reporting      | playwright-enhanced-reporter | 2.1.0   |

---

## Test Organization Pattern

```
src/tests/api/{Module}/
├── generated.spec.ts    # CRUD & validation tests
├── rbac.spec.ts         # Role-based access tests
└── network.spec.ts      # Network intercept tests
```

---

## Available NPM Scripts

| Script                    | Description                  |
| ------------------------- | ---------------------------- |
| `npm run test`            | Run all tests                |
| `npm run test:api`        | Run API tests only           |
| `npm run test:ui`         | Run UI tests only            |
| `npm run test:smoke`      | Run smoke tests              |
| `npm run test:regression` | Run regression tests         |
| `npm run test:dev`        | Run tests in dev environment |
| `npm run test:qa`         | Run tests in QA environment  |
| `npm run report`          | Open HTML report             |

---

# PILOT: EY Compliance Manager

## Implementation Summary

| Metric               | Value                        |
| -------------------- | ---------------------------- |
| **Endpoint Tested**  | RegArea API                  |
| **Total Test Cases** | 99                           |
| **Bugs Discovered**  | 14                           |
| **Bug Severity**     | 6 Critical, 5 High, 3 Medium |

## Test Coverage

| Category        | Tests | Description                         |
| --------------- | ----- | ----------------------------------- |
| CRUD Operations | 12    | Create, Read, Update, Delete        |
| Edge Cases      | 21    | Boundary values, special characters |
| Security        | 13    | XSS, SQL injection, path traversal  |
| Functional      | 19    | Business logic, data integrity      |
| RBAC            | 16    | Permission enforcement              |
| Network         | 18    | Mocking, error handling             |

## RBAC Matrix

| Role         | Create | Read | Update | Delete |
| ------------ | ------ | ---- | ------ | ------ |
| Super Admin  | ✅     | ✅   | ✅     | ✅     |
| EY Admin     | ✅     | ✅   | ✅     | ✅     |
| Client Admin | ❌     | ✅   | ❌     | ❌     |
| Viewer       | ❌     | ✅   | ❌     | ❌     |
| Reviewer     | ❌     | ✅   | ❌     | ❌     |

## Bugs Identified

| ID Range      | Severity | Issue                                  |
| ------------- | -------- | -------------------------------------- |
| 269479-269491 | CRITICAL | XSS vulnerabilities (multiple vectors) |
| 269497-269498 | HIGH     | Data loss on partial updates           |
| 269499        | HIGH     | Duplicate name validation bypass       |
| 269495-269496 | MEDIUM   | Validation & API contract issues       |

_All bugs logged in Azure DevOps with detailed HTTP examples and linked to stories_

## Test Files

```
src/tests/api/RegArea/
├── generated.spec.ts    # 65 tests - CRUD, edge cases, security
├── rbac.spec.ts         # 16 tests - Role-based access control
└── network.spec.ts      # 18 tests - Network intercept & mocking
```

---

## Report Access

| Type        | URL                                                                                    |
| ----------- | -------------------------------------------------------------------------------------- |
| Live Report | `https://ey-org.github.io/eycompliancemanager/test-reports/{run}/enhanced-report.html` |
| Artifacts   | GitHub Actions → Workflow Run → Artifacts                                              |

---

## Onboarding New Products

### Step 1: Create Product Branch

```bash
cd tests/automation
git checkout -b {product-name}
```

### Step 2: Add Environment Config

Create `config/environments/{env}.env` with product-specific settings:

```env
APP_URL=https://your-product-url.ey.com/
API_URL=https://your-product-url.ey.com/api
USERNAME=your-username
PASSWORD=your-password
```

### Step 3: Create Test Folder

```
src/tests/api/{ProductName}/
├── generated.spec.ts
├── rbac.spec.ts
└── network.spec.ts
```

### Step 4: Configure Pipeline

Copy and customize `.github/workflows/qa-automation.yml`

### Step 5: Run Tests

```bash
npm run test:api
```

---

## Future Roadmap

### Framework Enhancements

- [ ] Add more reusable fixtures and utilities
- [ ] Implement test data management
- [ ] Add visual regression testing
- [ ] Enhance AI-powered test generation
- [ ] Add performance testing capabilities

### Compliance Manager Pilot

- [ ] Configure remaining user roles for RBAC testing
- [ ] Expand API coverage to all endpoints
- [ ] Add UI E2E tests for critical flows
- [ ] Integrate with deployment pipeline

---

## Repository Information

| Repository                   | Branch               | Purpose              |
| ---------------------------- | -------------------- | -------------------- |
| `ey-org/playwright-fw`       | `compliance-manager` | Framework source     |
| `ey-org/eycompliancemanager` | `tests/cm_sprint1-4` | Pilot implementation |

---

## Contact

**QA Automation Team**

---

_Document Version: 1.0_  
_Last Updated: December 2024_

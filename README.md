# Playwright Testing Framework<!--

This file is the README for the Playwright Core Framework project.

# 🎭 Advanced Playwright Framework v2.0

> **A modern, type-safe, and highly efficient test automation framework built with advanced TypeScript patterns and Playwright**

## 📋 Table of Contents

- [🚀 Features](#-features)
- [🏗️ Architecture](#️-architecture)  
- [⚡ Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [📝 Usage Examples](#-usage-examples)
- [🧪 Test Organization](#-test-organization)
- [🔌 ADO Integration](#-ado-integration)
- [📊 Reporting](#-reporting)
- [🤝 Contributing](#-contributing)

## 🚀 Features

### **Framework Highlights**
- ✅ **Advanced TypeScript Patterns**: Generics, decorators, utility types, functional programming
- ✅ **Type-Safe Configuration**: Environment-aware, unified configuration system
- ✅ **Fluent Page Objects**: Method chaining with strategy patterns
- ✅ **Consolidated Utilities**: Single import for all utility functions
- ✅ **ADO Integration**: Fetch work items and generate comprehensive test cases
- ✅ **Zero If-Else Loops**: Functional programming approach for maintainability
- ✅ **Optimized Scripts**: Smart npm script consolidation and advanced patterns

### **Test Execution Features**
- 🎯 Multi-environment support (dev, qa, staging, prod)
- 🖥️ Cross-browser testing (Chromium, Firefox, WebKit, Mobile)
- 📸 Screenshot and video capture on failures
- 🔍 Distributed tracing and debugging
- ⚡ Parallel and sequential execution modes
- 📊 Enhanced HTML reporting with charts and trends

## 🏗️ Architecture

```
src/
├── config/           # Unified type-safe configuration
│   └── TestConfig.ts # Advanced environment management
├── lib/              # Consolidated utilities
│   ├── Utils.ts      # All-in-one utility module
│   ├── Log.ts        # Advanced Winston logging
│   └── ado/          # ADO integration with TypeScript
├── pages/            # Fluent page objects with decorators
│   └── common/       # Base classes and shared pages
├── tests/            # Organized test suites
│   ├── api/          # API test automation
│   ├── ui/           # UI test automation
│   └── fixtures/     # Shared test fixtures
└── validation/       # Type-safe validation schemas
```

## ⚡ Quick Start

### **1. Installation & Setup**

```bash
# Clone and install dependencies
git clone <repository-url>
cd playwright-fw
npm install

# Setup browsers and environment
npm run setup
```

### **2. Environment Configuration**

```bash
# Configure your environment file
cp config/environments/ado.env.template config/environments/ado.env

# Add your ADO credentials
ADO_ORGANIZATION=YourOrg
ADO_PROJECT=YourProject  
ADO_PERSONAL_ACCESS_TOKEN=your-token
```

### **3. Run Your First Test**

```bash
# Run tests in different environments
npm run test:qa          # QA environment with headed mode
npm run test:dev         # Development environment
npm run test:api         # API tests only
npm run test:smoke       # Smoke tests (@smoke tagged)
```

## 🔧 Configuration

### **Advanced Environment Management**

Our framework uses a unified configuration system with type safety:

```typescript
// Automatic environment detection
const config = ConfigManager.getInstance();

// Type-safe environment settings
interface EnvironmentSettings {
  readonly baseURL: string;
  readonly timeout: number;
  readonly retries: number;
  readonly workers: number;
  readonly headless: boolean;
}

// Environment-specific configurations
const settings = config.getConfig();
```

### **Available Environments**
- **dev**: Development with debug features, non-headless mode
- **qa**: Quality assurance with standard settings
- **staging**: Pre-production with headless mode
- **prod**: Production with maximum retries and headless mode

## 📝 Usage Examples

### **Advanced Page Objects with Fluent Interface**

```typescript
import { LoginPage } from '../pages/common/LoginPage';

// Method chaining with type safety
await new LoginPage(page)
  .navigateToLogin('https://app.example.com')
  .login({ email: 'user@test.com', password: 'password123' })
  .verifyLoginSuccess();

// Strategy pattern automatically handles SSO vs Form login
const authState = await loginPage.getAuthState();
console.log(`Authenticated via: ${authState.authMethod}`);
```

### **Consolidated Utilities Usage**

```typescript
import { Utils } from '../lib/Utils';

// All utilities in one import
const testData = {
  email: Utils.String.generateEmail(),
  id: Utils.String.generateInteger(6),
  date: Utils.DateTime.generate('YYYY-MM-DD', { days: 30 }),
  uuid: Utils.String.generateUUID()
};

// Environment management
Utils.Environment.configure({ testEnv: 'qa' });
const apiUrl = Utils.Environment.get('API_URL', 'https://default-api.com');

// Web utilities with error handling
const csrfToken = await Utils.Web.fetchCSRFToken(page);
await Utils.Web.safeInteraction(page, '#submit-btn', 
  async (element) => await element.click()
);
```

### **ADO Integration Examples**

```typescript
// Generate tests from ADO work items
npm run ado:generate -- --workItems 197256,197257

// Test ADO connection
npm run ado:test

// Advanced ADO API usage
import { ADOIntegration } from '../lib/ado/ADOIntegration';

const ado = new ADOIntegration({
  organization: 'YourOrg',
  project: 'YourProject',
  personalAccessToken: 'your-token'
});

// Fetch with type safety and error handling
const workItems = await ado.fetchMultipleWorkItems([197256, 197257]);
const searchResults = await ado.searchWorkItems('SELECT [System.Id] FROM WorkItems WHERE [System.State] = "Active"');
```

## 🧪 Test Organization

### **Smart Script Organization**

```bash
# Environment-based execution
npm run test:dev         # Development environment
npm run test:qa          # QA with headed mode  
npm run test:staging     # Staging environment
npm run test:prod        # Production environment

# Test category execution
npm run test:api         # API tests only
npm run test:ui          # UI tests only
npm run test:smoke       # Smoke tests (@smoke)
npm run test:regression  # Regression tests (@regression)

# Browser-specific testing
npm run test:chromium    # Chromium only
npm run test:browsers    # All browsers (Chrome, Firefox, Safari)
npm run test:mobile      # Mobile testing

# Performance and debugging
npm run test:parallel    # Parallel execution (4 workers)
npm run test:debug       # Debug mode with single worker
```

### **Advanced Test Configuration**

```typescript
// Type-safe test metadata
interface TestMetadata {
  readonly priority: 'critical' | 'high' | 'medium' | 'low';
  readonly category: 'functional' | 'api' | 'ui' | 'performance';
  readonly tags: readonly string[];
}

// Enhanced test organization
test.describe('User Authentication', () => {
  test('should login with valid credentials @smoke @critical', async ({ page }) => {
    // Test implementation with advanced patterns
  });
});
```

## 🔌 ADO Integration

### **Work Item Test Generation**

Our ADO integration uses advanced TypeScript patterns for robust test generation:

```typescript
// Functional programming approach (zero if-else loops)
const strategies = [
  new SecurityTestStrategy(),
  new FunctionalTestStrategy(), 
  new PerformanceTestStrategy()
].filter(strategy => strategy.canHandle(workItem));

// Type-safe work item handling
interface ADOWorkItem {
  readonly id: number;
  readonly title: string;
  readonly acceptanceCriteria: string;
  readonly workItemType: string;
}
```

### **Generated Test Structure**

When you run `npm run ado:generate`, the framework creates:

- 📄 **Comprehensive Test Spec**: Full test coverage with multiple scenarios
- 🎭 **Advanced Page Object**: Type-safe, fluent interface page objects  
- 📊 **Test Data Classes**: Structured test data with validation
- ⚙️ **Configuration Files**: Environment-specific test settings

## 📊 Reporting

### **Enhanced Reporting System**

```bash
# View different report types
npm run report           # Standard Playwright HTML report
npm run report:enhanced  # Enhanced report with charts and trends
npm run report:detailed  # Detailed JSON analysis
npm run report:open      # Open reports directory
```

### **Report Features**
- 📈 **Trend Analysis**: Track test performance over time
- 📊 **Interactive Charts**: Visual test execution metrics  
- 🎯 **Failure Analysis**: Detailed failure categorization
- 📸 **Screenshot Gallery**: Organized failure screenshots
- 🎬 **Video Recordings**: Step-by-step execution videos

## 🤝 Contributing

### **Development Guidelines**

1. **TypeScript Best Practices**: Use advanced patterns, avoid if-else loops
2. **Functional Programming**: Prefer composition over inheritance
3. **Type Safety**: Leverage TypeScript's type system extensively
4. **Documentation**: Use comprehensive JSDoc comments
5. **Testing**: Follow the established patterns and utilities

### **Code Standards**

```bash
# Code quality and formatting  
npm run format          # Format all files and run linting
npm run lint           # ESLint with automatic fixes
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ADO REST API](https://docs.microsoft.com/en-us/rest/api/azure/devops/)

---

**Built with ❤️ using Advanced TypeScript patterns and modern testing practices**It provides an overview and documentation for the playwright-core-fw repository.

-->

## 🚀 Quick Start

# Playwright Test Framework

### Prerequisites

- Node.js 18+ A comprehensive Playwright testing framework for end-to-end and API testing.

- npm or yarn

## 🏗️ Framework Architecture

### Setup & Installation

### Directory Structure

```bash

# Clone and navigate to the project```

git clone <repository-url>playwright-fw/

cd playwright-fw├── tests/

│   ├── apiTests/           # API test specifications

# Install dependencies (includes UI setup)│   ├── uiTests/           # UI test specifications

npm install│   │   ├── e2e/           # End-to-end tests

│   │   └── pageObjects/   # Page Object Model classes

# Install Playwright browsers│   ├── fixtures/          # Test fixtures and base classes

npm run install:browsers│   ├── utils/             # Utility classes and helpers

│   ├── data/              # Test data files

# Start the UI (recommended)│   └── reporter/          # Custom reporters

npm run ui:start├── testConfig/            # Test configuration files

# OR use the batch file├── test-results/          # Test execution results

./scripts/start-ui.bat└── playwright-report/     # HTML reports

``````



### Access the Framework## 🚀 Getting Started

- **UI Dashboard**: http://localhost:3000

- **API Server**: http://localhost:3001/api### Prerequisites

- **Test Reports**: `./test-results/reports/`

- Node.js (v18 or higher)

## 🎯 Features- npm or yarn



### 🖥️ Modern Web UI### Installation

- **Real-time Test Execution** with live progress monitoring

- **Interactive Dashboard** with execution history and stats```bash

- **Test Configuration** with environment selectionnpm install

- **Report Visualization** with screenshots and videosnpx playwright install

- **ADO Integration** for work item synchronization```



### 🧪 Testing Capabilities### Environment Setup

- **Multi-browser Support**: Chromium, Firefox, WebKit, Mobile

- **Environment Management**: dev, qa, staging, production1. Copy environment template:

- **Parallel Execution** with configurable workers

- **API & UI Testing** with comprehensive assertions```bash

- **Advanced Reporting** with Allure and HTML reportscp .env.dev .env

```

### 🔧 Enterprise Features

- **Authentication Management** with SSO integration2. Update environment variables in `.env` file with your credentials

- **Configuration Management** with environment overrides

- **Validation Framework** with response validators## 🧪 Running Tests

- **Error Handling** with detailed logging

- **CI/CD Integration** ready### Basic Commands



## 📁 Project Structure```bash

# Run all tests in development environment

```npm run test:dev

playwright-fw/

├── README.md                    # This file# Run tests headlessly

├── package.json                 # Main package configurationnpm run test:dev:headless

├── playwright.config.ts         # Playwright configuration

│# Run only UI tests

├── config/                      # Configuration managementnpm run test:ui

│   ├── globalSetup.ts          # Global test setup

│   └── environments/           # Environment-specific configs# Run only API tests

│       ├── dev.envnpm run test:api

│       ├── qa.env

│       └── prod.env# Run tests in debug mode

│npm run test:debug

├── src/                        # Core framework source```

│   ├── lib/                    # Shared utilities and libraries
│   │   ├── auth/              # Authentication utilities
│   │   ├── config/            # Configuration management
│   │   ├── validation/        # Response validators
│   │   ├── ado/               # Azure DevOps integration
│   │   └── reporting/         # Report generation
│   │
│   ├── tests/                  # Test suites
│   │   ├── api/               # API test cases
│   │   ├── ui/                # UI test cases
│   │   ├── fixtures/          # Test fixtures
│   │   └── data/              # Test data files
│   │
│   └── pages/                  # Page Object Model
│       ├── common/            # Shared page objects
│       └── modules/           # Feature-specific pages
│
├── ui/                         # Modern Web UI
│   ├── client/                # React frontend (port 3000)
│   └── server/                # Express backend (port 3001)
│
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
└── test-results/              # Test outputs (auto-generated)
```

## 🧪 Running Tests

### Via UI (Recommended)
1. Start the UI: `npm run ui:start`
2. Open http://localhost:3000
3. Navigate to "Execute Tests"
4. Configure and run tests with real-time monitoring

### Via Command Line

```bash
# Run all tests
npm test

# Environment-specific execution
npm run test:dev      # Development environment
npm run test:qa       # QA environment
npm run test:staging  # Staging environment
npm run test:prod     # Production environment

# Test type specific
npm run test:api      # API tests only
npm run test:ui       # UI tests only

# Advanced options
npm run test:headed   # Run with browser UI
npm run test:debug    # Debug mode
npm run test:parallel # Parallel execution with multiple workers
```

### Browser-specific Testing
```bash
npm run test:chromium  # Chromium only
npm run test:firefox   # Firefox only  
npm run test:webkit    # WebKit/Safari only
npm run test:mobile    # Mobile browsers
```

### Test Filtering
```bash
# Run tests with tags
npm run test:smoke     # Smoke tests (@smoke tag)
npm run test:regression # Regression tests (@regression tag)
```

## 📊 Reports & Results

### Viewing Reports
```bash
# Open HTML report
npm run show:report

# Open enhanced report  
npm run show:enhanced

# View all reports
npm run show:reports
```

### Report Types Generated
- **HTML Report**: Interactive Playwright report
- **Allure Report**: Detailed test execution report
- **JSON Report**: Programmatic access to results
- **Screenshots**: Failure screenshots
- **Videos**: Test execution recordings
- **Traces**: Detailed execution traces

## ⚙️ Configuration

### Environment Configuration
Configure environments in `config/environments/`:

```javascript
// config/environments/dev.env
DEV_APP_URL=https://your-dev-app.com
DEV_SSO_USERNAME=dev-user@company.com
DEV_SSO_PASSWORD=dev-password
```

### Framework Configuration
Main configuration in `playwright.config.ts`:

```typescript
// Key configuration options
{
  baseURL: 'environment-specific',
  timeout: 30000,
  retries: 2,
  workers: 4,
  browsers: ['chromium', 'firefox', 'webkit']
}
```

### UI Configuration
UI settings in `ui/.env`:

```bash
PORT=3001                    # Backend port
CLIENT_URL=http://localhost:3000  # Frontend URL
NODE_ENV=development         # Environment mode
```

## 🔧 Development

### Adding New Tests

#### API Tests
```typescript
// src/tests/api/example.spec.ts
import { test, expect } from '@playwright/test';

test('API endpoint test', async ({ request }) => {
  const response = await request.get('/api/endpoint');
  expect(response.status()).toBe(200);
});
```

#### UI Tests  
```typescript
// src/tests/ui/example.spec.ts
import { test, expect } from '@playwright/test';

test('UI functionality test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Welcome');
});
```

### Adding Page Objects
```typescript
// src/pages/common/ExamplePage.ts
import { Page, Locator } from '@playwright/test';

export class ExamplePage {
  readonly page: Page;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.locator('[data-testid="submit"]');
  }

  async submit() {
    await this.submitButton.click();
  }
}
```

## 🔗 Integration

### Azure DevOps Integration
Configure ADO settings in the UI or environment variables:

```bash
ADO_ORGANIZATION=your-org
ADO_PROJECT=your-project  
ADO_PAT=your-personal-access-token
```

### CI/CD Integration
GitHub Actions workflow included at `.github/workflows/playwright.yml`

```bash
# Run tests in CI
npm run test:ci
```

## 🆘 Troubleshooting

### Common Issues

**Port conflicts**: Use `./scripts/clean-ports.bat` to clear ports 3000/3001

**Browser installation**: Run `npm run install:browsers`

**Environment issues**: Check `.env` files in `config/environments/`

**UI not loading**: Ensure both client and server are running

### Getting Help
- Check the `docs/` directory for detailed guides
- Review test execution logs in `test-results/logs/`
- Use the debug mode: `npm run test:debug`

## 📈 Advanced Features

### Custom Validators
```typescript
// src/lib/validation/CustomValidator.ts
import { BaseValidator } from './BaseValidator';

export class CustomValidator extends BaseValidator {
  async validateResponse(response: any): Promise<boolean> {
    // Custom validation logic
    return true;
  }
}
```

### Environment Switching
```typescript
// Programmatic environment switching
process.env.NODE_ENV = 'qa';
// Framework automatically loads qa.env configuration
```

### Reporting Extensions
The framework supports custom reporters and can integrate with external systems for enhanced reporting capabilities.

---

## 🎊 Framework Benefits

- **🚀 Fast Setup**: Get running in minutes with the UI
- **🔄 Real-time Monitoring**: Watch tests execute live
- **📊 Rich Reporting**: Multiple report formats with visual feedback
- **🏗️ Scalable Architecture**: Easily extend and customize
- **🤝 Team Collaboration**: Shared configuration and results
- **🔧 Enterprise Ready**: Authentication, CI/CD, and ADO integration

**Ready to start testing? Launch the UI and explore the full capabilities of this modern testing framework!**
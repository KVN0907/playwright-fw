# Document360 API Documentation Test Framework

![Playwright Tests](https://github.com/KVN0907/playwright-fw/actions/workflows/playwright.yml/badge.svg)

## 🎭 Automated Testing for Document360 API Documentation

This repository contains a comprehensive Playwright test framework specifically designed for testing Document360's API Documentation module workflows.

### 🚀 Features

- **Multi-Browser Support**: Tests run on Chromium, Firefox, and WebKit
- **Robust Authentication**: Handles both new and existing user scenarios
- **Smart Navigation**: Adapts to different dashboard layouts and project states
- **Enhanced Reporting**: Detailed HTML reports with screenshots and traces
- **CI/CD Integration**: Automated testing via GitHub Actions
- **Smart Element Selection**: Priority-based selector helper following Playwright best practices

### 🎯 Test Coverage

#### 1. User Authentication & Project Access

- ✅ Login with valid credentials
- ✅ Login error handling
- ✅ Project dashboard navigation
- ✅ Session persistence across browser refresh

#### 2. API Documentation Content Management

- ✅ Content creation workflows
- ✅ Editor functionality
- ✅ Quick insert features
- ✅ Endpoint documentation

#### 3. API Documentation Publishing

- ✅ Published site access
- ✅ Content verification
- ✅ Navigation structure validation
- ✅ Code examples verification

2. Update environment variables in `.env` file with your credentials

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests in development environment
npm run test:dev

# Run tests headlessly
npm run test:dev:headless

# Run only UI tests
npm run test:ui

# Run only API tests
npm run test:api

# Run tests in debug mode
npm run test:debug
```

### 🛠️ Test Utilities

#### SelectorHelper

A comprehensive utility for element selection using Playwright's recommended priority order:

1. **getByRole()** - Most accessible, recommended for interactive elements
2. **getByLabel()** - Good for form controls with labels
3. **getByPlaceholder()** - Useful for input fields
4. **getByText()** - Good for text content
5. **getByAltText()** - For images with alt text
6. **getByTitle()** - For elements with title attributes
7. **getByTestId()** - Last resort, but very reliable for testing

**Key Features:**

- Smart selector with automatic fallback strategies
- Built-in retry logic for flaky elements
- Pre-defined common UI patterns (CommonSelectors)
- Debug mode for selector resolution tracing
- Type-safe with full TypeScript support

**Usage Example:**

```typescript
import { createSelectorHelper, CommonSelectors } from '../utils/SelectorHelper';

const selectorHelper = createSelectorHelper(page, 30000, true);

// Smart selector with multiple fallback strategies
await selectorHelper.clickElement({
  role: { role: 'button', name: /login/i },
  text: /login/i,
  testId: 'login-button',
});

// Use pre-defined common selectors
await selectorHelper.fillElement(CommonSelectors.emailInput, 'user@example.com');
```

See [SelectorHelper Usage Guide](./docs/SelectorHelper_Usage.md) for comprehensive examples.

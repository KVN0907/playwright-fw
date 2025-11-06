# Contributing to Playwright Test Framework

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git configured
- Familiarity with TypeScript and Playwright

### Setup Development Environment

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/playwright-fw.git
   cd playwright-fw
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install Playwright browsers**

   ```bash
   npx playwright install
   ```

4. **Create environment file**

   ```bash
   cp .env.example config/environments/dev.env
   # Edit dev.env with your credentials
   ```

5. **Run tests to verify setup**
   ```bash
   npm run test:dev
   ```

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or updates

### 2. Make Your Changes

- Write clean, maintainable code
- Follow existing patterns and conventions
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run formatting
npm run format

# Run tests
npm run test:dev

# Run specific test file
npm test src/tests/your-test.spec.ts
```

### 4. Commit Your Changes

Follow the [commit message guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 📝 Coding Standards

### TypeScript Guidelines

1. **Use Type Safety**

   ```typescript
   // ✅ Good
   interface User {
     id: string;
     name: string;
     email: string;
   }

   function getUser(id: string): Promise<User> {
     // ...
   }

   // ❌ Bad
   function getUser(id: any): any {
     // ...
   }
   ```

2. **Use Path Aliases**

   ```typescript
   // ✅ Good
   import { test } from '@fixtures/advancedFixtures';
   import Log from '@lib/Log';

   // ❌ Bad
   import { test } from '../../fixtures/advancedFixtures';
   import Log from '../../../lib/Log';
   ```

3. **Use Readonly for Immutable Data**

   ```typescript
   // ✅ Good
   interface Config {
     readonly baseURL: string;
     readonly timeout: number;
   }

   // ❌ Bad
   interface Config {
     baseURL: string;
     timeout: number;
   }
   ```

4. **Avoid `any` Type**

   ```typescript
   // ✅ Good
   function processData<T>(data: T): T {
     return data;
   }

   // ❌ Bad
   function processData(data: any): any {
     return data;
   }
   ```

### Code Style

1. **Use Structured Logging**

   ```typescript
   // ✅ Good
   import Log from '@lib/Log';
   Log.info('User logged in', { userId: user.id });

   // ❌ Bad
   console.log('User logged in', user.id);
   ```

2. **Use Fluent Interface**

   ```typescript
   // ✅ Good
   await homePage.navigateTo('/dashboard').verifyBannerText('Welcome');

   // ❌ Bad
   await homePage.navigateTo('/dashboard');
   await homePage.verifyBannerText('Welcome');
   ```

3. **Use Error Factory**

   ```typescript
   // ✅ Good
   import { ErrorFactory } from '@lib/errors';
   throw ErrorFactory.api('Request failed', '/api/users', 'GET', 404);

   // ❌ Bad
   throw new Error('Request failed');
   ```

4. **Use Test Data Builders**

   ```typescript
   // ✅ Good
   const user = UserBuilder.create()
     .withName('John', 'Doe')
     .withEmail('john@test.com')
     .asAdmin()
     .build();

   // ❌ Bad
   const user = {
     firstName: 'John',
     lastName: 'Doe',
     email: 'john@test.com',
     role: 'admin',
   };
   ```

### File Organization

```
src/
├── config/          # Configuration management
├── lib/             # Shared libraries and utilities
│   ├── auth/        # Authentication utilities
│   ├── errors/      # Custom error classes
│   ├── testData/    # Test data builders
│   └── validation/  # Validators
├── pages/           # Page object models
│   └── common/      # Shared page objects
└── tests/           # Test suites
    ├── api/         # API tests
    ├── ui/          # UI tests
    └── fixtures/    # Test fixtures
```

---

## 🧪 Testing Guidelines

### Test Structure

Use BDD-style test naming:

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('@smoke @critical should perform critical action', async ({ page }) => {
    // Given - Setup preconditions
    await page.goto('/');

    // When - Perform action
    await page.click('#submit-button');

    // Then - Verify outcome
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

### Test Tags

Use appropriate tags:

- `@smoke` - Critical path tests (run on every commit)
- `@regression` - Full regression suite
- `@critical` - High priority tests
- `@api` - API tests
- `@ui` - UI tests
- `@slow` - Tests that take longer than 30 seconds

### Page Objects

```typescript
export class MyPage extends BasePage<MyPage> {
  private readonly submitButton = this.page.locator('#submit');

  async submitForm(): Promise<MyPage> {
    await this.click(this.submitButton, { description: 'Submit form' });
    return this;
  }

  async verifySuccess(): Promise<void> {
    await this.verifyVisible(this.page.locator('.success'));
  }
}
```

### Test Data

Use builders for test data:

```typescript
const user = UserBuilder.create().withName('John', 'Doe').withEmail('john@test.com').build();
```

---

## 🔍 Pull Request Process

### Before Submitting

1. ✅ Code passes all linting checks: `npm run lint`
2. ✅ Code is properly formatted: `npm run format`
3. ✅ All tests pass: `npm test`
4. ✅ New tests added for new features
5. ✅ Documentation updated
6. ✅ No console.log statements (use Log utility)

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Tests pass locally

## Screenshots (if applicable)

Add screenshots for UI changes
```

### Review Process

1. At least one approval required
2. All CI checks must pass
3. No merge conflicts
4. Code review comments addressed

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Examples

```bash
feat(auth): add SSO authentication support

- Implement SSO login flow
- Add SSO configuration
- Update authentication manager

Closes #123
```

```bash
fix(api): resolve retry mechanism issue

The API retry was not respecting the configured delay.
Fixed by properly implementing the backoff strategy.

Fixes #456
```

```bash
docs(readme): update setup instructions

- Add Docker setup steps
- Update environment configuration
- Add troubleshooting section
```

### Commit Message Rules

1. Use present tense ("add feature" not "added feature")
2. Use imperative mood ("move cursor to..." not "moves cursor to...")
3. Keep subject line under 50 characters
4. Capitalize subject line
5. Don't end subject line with period
6. Separate subject from body with blank line
7. Wrap body at 72 characters
8. Reference issues and PRs in footer

---

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - Detailed steps
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, Node version, browser
6. **Screenshots** - If applicable
7. **Logs** - Relevant error logs

---

## 💡 Feature Requests

When requesting features:

1. **Description** - What you want to achieve
2. **Use Case** - Why this feature is needed
3. **Proposed Solution** - Your suggested approach
4. **Alternatives** - Other options you've considered
5. **Additional Context** - Any other relevant info

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Playwright Documentation](https://playwright.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

---

## 🙏 Thank You

Thank you for contributing to make this framework better! Your efforts are greatly appreciated.

For questions or help, please:

- Open a GitHub issue
- Contact the maintainers
- Check existing documentation

Happy coding! 🚀

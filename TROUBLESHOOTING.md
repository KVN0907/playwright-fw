# Troubleshooting Guide

Common issues and solutions for the Playwright Test Framework.

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Problems](#configuration-problems)
- [Test Execution Failures](#test-execution-failures)
- [Authentication Issues](#authentication-issues)
- [Browser Problems](#browser-problems)
- [CI/CD Issues](#cicd-issues)
- [Performance Issues](#performance-issues)
- [Common Errors](#common-errors)

---

## 🔧 Installation Issues

### Issue: `npm install` fails

**Symptoms:**

```bash
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path package.json
```

**Solutions:**

1. Ensure you're in the correct directory

   ```bash
   cd playwright-fw
   pwd  # Verify you're in the right folder
   ```

2. Check Node.js version

   ```bash
   node --version  # Should be 18+
   ```

3. Clear npm cache
   ```bash
   npm cache clean --force
   npm install
   ```

### Issue: Playwright browsers not installing

**Symptoms:**

```bash
browserType.launch: Executable doesn't exist
```

**Solutions:**

1. Install browsers manually

   ```bash
   npx playwright install
   ```

2. Install with dependencies (Linux)

   ```bash
   npx playwright install --with-deps
   ```

3. Install specific browser
   ```bash
   npx playwright install chromium
   ```

---

## ⚙️ Configuration Problems

### Issue: Environment variables not loading

**Symptoms:**

- Tests fail with "undefined" environment variables
- Wrong environment being used

**Solutions:**

1. Check environment file exists

   ```bash
   ls config/environments/
   # Should show: dev.env, qa.env, staging.env, prod.env
   ```

2. Verify NODE_ENV is set

   ```bash
   # Windows PowerShell
   $env:NODE_ENV = "qa"

   # Windows CMD
   set NODE_ENV=qa

   # Linux/Mac
   export NODE_ENV=qa
   ```

3. Check .env file format

   ```bash
   # ✅ Correct
   APP_URL=https://app.com

   # ❌ Incorrect (no quotes, no spaces)
   APP_URL = "https://app.com"
   ```

### Issue: ESLint not working

**Symptoms:**

```bash
ESLint couldn't find an eslint.config.(js|mjs|cjs) file
```

**Solutions:**

1. Ensure `eslint.config.js` exists (not `.eslintrc.json`)
2. Delete `.eslintrc.json` if present
3. Run lint to test:
   ```bash
   npm run lint
   ```

### Issue: TypeScript path aliases not working

**Symptoms:**

```typescript
Cannot find module '@fixtures/advancedFixtures'
```

**Solutions:**

1. Check `tsconfig.json` has path configuration

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@fixtures/*": ["src/tests/fixtures/*"],
         "@pages/*": ["src/pages/*"],
         "@lib/*": ["src/lib/*"]
       }
     }
   }
   ```

2. Restart your IDE/editor
3. Clear TypeScript cache
   ```bash
   rm -rf node_modules/.cache
   ```

---

## 🧪 Test Execution Failures

### Issue: All tests failing immediately

**Symptoms:**

```bash
Error: No tests found
```

**Solutions:**

1. Check test file location

   ```bash
   # Tests should be in src/tests/
   ls src/tests/**/*.spec.ts
   ```

2. Verify test file naming
   - Files must end with `.spec.ts` or `.test.ts`

3. Check playwright.config.ts
   ```typescript
   testDir: './src/tests';
   ```

### Issue: Tests timeout

**Symptoms:**

```bash
Test timeout of 30000ms exceeded
```

**Solutions:**

1. Increase timeout in playwright.config.ts

   ```typescript
   timeout: 60000,  // 60 seconds
   ```

2. Increase timeout for specific test

   ```typescript
   test('slow test', async ({ page }) => {
     test.setTimeout(60000);
     // test code
   });
   ```

3. Check network connectivity
4. Verify application is accessible

### Issue: Flaky tests

**Symptoms:**

- Tests pass sometimes, fail other times
- Intermittent failures

**Solutions:**

1. Add proper waits

   ```typescript
   // ✅ Good
   await page.waitForSelector('#element');
   await page.click('#element');

   // ❌ Bad
   await page.click('#element'); // May fail if element not ready
   ```

2. Use auto-waiting assertions

   ```typescript
   // ✅ Good
   await expect(page.locator('#element')).toBeVisible();

   // ❌ Bad
   const isVisible = await page.locator('#element').isVisible();
   expect(isVisible).toBe(true);
   ```

3. Increase retries
   ```typescript
   // playwright.config.ts
   retries: 2;
   ```

---

## 🔐 Authentication Issues

### Issue: Login failing in tests

**Symptoms:**

- Tests can't authenticate
- Stuck on login page

**Solutions:**

1. Check credentials in environment file

   ```bash
   # config/environments/qa.env
   SSO_USERNAME=your-username
   SSO_PASSWORD=your-password
   ```

2. Verify authentication type

   ```typescript
   const authManager = AuthenticationManager.getInstance();
   console.log(authManager.getAuthType());
   ```

3. Check if global setup is configured

   ```typescript
   // playwright.config.ts
   globalSetup: require.resolve('./config/globalSetup.ts');
   ```

4. Delete old storage state
   ```bash
   rm storageState.json
   rm auth.json
   ```

### Issue: Session expires during tests

**Symptoms:**

- Tests pass initially, then fail
- Redirected to login mid-test

**Solutions:**

1. Use storageState

   ```typescript
   // Save state after login
   await page.context().storageState({ path: 'storageState.json' });

   // Use state in tests
   use: {
     storageState: 'storageState.json';
   }
   ```

2. Implement token refresh logic
3. Check session timeout settings

---

## 🌐 Browser Problems

### Issue: Browser not launching

**Symptoms:**

```bash
browserType.launch: Executable doesn't exist
```

**Solutions:**

1. Reinstall browsers

   ```bash
   npx playwright install chromium
   ```

2. Check browser path

   ```bash
   npx playwright install --dry-run
   ```

3. Try different browser
   ```bash
   npm run test:chromium  # Instead of webkit/firefox
   ```

### Issue: Headless mode issues

**Symptoms:**

- Tests fail in headless but pass in headed mode

**Solutions:**

1. Run in headed mode for debugging

   ```bash
   npm run test:qa  # Uses headed mode
   ```

2. Check viewport size

   ```typescript
   use: {
     viewport: { width: 1280, height: 720 }
   }
   ```

3. Add screenshots on failure
   ```typescript
   screenshot: 'only-on-failure';
   ```

---

## 🚀 CI/CD Issues

### Issue: Tests pass locally but fail in CI

**Symptoms:**

- Local tests: ✅ Pass
- CI tests: ❌ Fail

**Solutions:**

1. Check environment variables in CI

   ```yaml
   # .github/workflows/test.yml
   env:
     NODE_ENV: qa
     APP_URL: ${{ secrets.APP_URL }}
   ```

2. Install system dependencies

   ```yaml
   - name: Install Playwright
     run: npx playwright install --with-deps
   ```

3. Check CI timeout settings

   ```yaml
   timeout-minutes: 30
   ```

4. Add debug logging
   ```bash
   DEBUG=pw:api npm test
   ```

### Issue: Artifacts not uploading

**Symptoms:**

- Can't see test results/screenshots in CI

**Solutions:**

1. Check artifact upload configuration

   ```yaml
   - uses: actions/upload-artifact@v4
     if: always() # Upload even on failure
     with:
       name: test-results
       path: test-results/
   ```

2. Verify path exists
   ```yaml
   - run: ls -la test-results/
   ```

---

## ⚡ Performance Issues

### Issue: Tests running slowly

**Symptoms:**

- Test suite takes too long
- Individual tests timeout

**Solutions:**

1. Run tests in parallel

   ```bash
   npm run test:parallel  # Uses multiple workers
   ```

2. Optimize selectors

   ```typescript
   // ✅ Fast - use data-testid
   page.locator('[data-testid="submit"]');

   // ❌ Slow - complex CSS
   page.locator('div.container > form > button.submit');
   ```

3. Reduce navigation

   ```typescript
   // ✅ Good - use storageState
   use: {
     storageState: 'auth.json';
   }

   // ❌ Bad - login in each test
   test.beforeEach(async () => {
     await loginPage.login();
   });
   ```

4. Use test.describe.serial for dependent tests
   ```typescript
   test.describe.serial('Dependent tests', () => {
     // Tests run in order, share state
   });
   ```

---

## ❌ Common Errors

### Error: "Cannot find module"

**Solutions:**

1. Install dependencies

   ```bash
   npm install
   ```

2. Check import path

   ```typescript
   // Use path aliases
   import { test } from '@fixtures/advancedFixtures';
   ```

3. Clear node_modules
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Error: "Protocol error"

**Solutions:**

1. Close other browser instances
2. Restart test
3. Clear browser cache
   ```bash
   rm -rf ~/.cache/ms-playwright
   npx playwright install
   ```

### Error: "Target closed"

**Solutions:**

1. Add proper waits
2. Check for navigation
3. Use try-catch for expected closures
   ```typescript
   try {
     await page.click('#button');
   } catch (error) {
     if (error.message.includes('Target closed')) {
       // Handle expected closure
     }
   }
   ```

### Error: "Selector resolved to hidden"

**Solutions:**

1. Wait for element to be visible

   ```typescript
   await page.locator('#element').waitFor({ state: 'visible' });
   ```

2. Use force click (last resort)

   ```typescript
   await page.locator('#element').click({ force: true });
   ```

3. Check if element is covered by overlay

---

## 🔍 Debugging Tips

### Enable Debug Mode

```bash
# Verbose logging
DEBUG=pw:api npm test

# Headed mode with slowMo
npm run test:debug

# Playwright Inspector
PWDEBUG=1 npm test
```

### View Trace

```bash
# Open trace file
npx playwright show-trace test-results/trace.zip
```

### Interactive Mode

```typescript
// Add pause to inspect
await page.pause();
```

### Screenshots

```typescript
// Take screenshot
await page.screenshot({ path: 'screenshot.png' });

// Full page
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### Console Logs

```typescript
// Log page console
page.on('console', msg => console.log(msg.text()));

// Log network requests
page.on('request', request => console.log(request.url()));
```

---

## 📚 Additional Resources

- [Playwright Debugging Guide](https://playwright.dev/docs/debug)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [GitHub Issues](https://github.com/microsoft/playwright/issues)

---

## 🆘 Still Need Help?

If you're still experiencing issues:

1. Check existing [GitHub Issues](https://github.com/your-repo/issues)
2. Create a new issue with:
   - Problem description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots/logs
3. Ask in team chat/Slack channel
4. Contact framework maintainers

---

**Last Updated:** November 6, 2025

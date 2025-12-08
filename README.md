# Playwright Test Framework

A streamlined, flexible Playwright testing framework for UI and API automation.

## For Framework Development

```bash
# Install dependencies
npm install

# Setup browsers
npm run setup

# Run tests
npm run test:qa
```

## For Product Integration (Recommended)

Use this framework in your product repository via Git submodule:

```bash
# In your product repo
git submodule add https://github.com/ey-org/playwright-fw.git tests/framework

# Create your product tests
mkdir -p tests/YOUR-PRODUCT-tests/{ui,api,pages}

# See INTEGRATION_GUIDE.md for complete setup
```

**📖 Complete Guide**: [INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)

## Configuration

### Environment Setup

Set environment in `config/environments/{env}.env`:

```env
NODE_ENV=qa
APP_URL=https://your-app.com
QA_USERNAME=username
QA_PASSWORD=password
```

### Profile Support (Optional)

Apply profiles to customize test execution:

```bash
# Smoke tests (fast, minimal reporting)
PROFILE=smoke npm run test:qa

# Regression tests (thorough, full coverage)
PROFILE=regression npm run test:qa

# Mobile tests
PROFILE=mobile npm run test:qa

# Debug mode (visible browser, slow motion)
PROFILE=debug npm run test:qa
```

See `config/profiles/README.md` for all available profiles.

## Running Tests

```bash
npm run test:qa          # QA environment
npm run test:dev         # Dev environment
npm run test:headed      # With visible browser
npm run test:debug       # Debug mode
npm run test:ui          # UI tests only
npm run test:api         # API tests only
```

## Project Structure

```
src/
├── lib/                 # Core utilities
│   ├── config/         # Configuration management
│   ├── ADOHelper.ts    # Azure DevOps integration
│   ├── Utils.ts        # Helper functions
│   └── Log.ts          # Logging utility
├── pages/              # Page objects
├── tests/              # Test files
│   ├── ui/            # UI tests
│   ├── api/           # API tests
│   └── fixtures/      # Test fixtures
└── config/
    └── TestConfig.ts   # Playwright configuration
```

## Writing Tests

### Simple Test

```typescript
import { test, expect } from '@playwright/test';
import { setupTest } from './lib/SimpleTestSetup';

test('My test', async ({ page }) => {
  const setup = setupTest(page);
  await setup.gotoHome();
  expect(page.url()).toContain('my-app');
});
```

### Using Fixtures

```typescript
import { test, expect } from './fixtures/simpleFixtures';

test('Test with fixtures', async ({ testSetup, homePage }) => {
  await testSetup.gotoHome();
  await homePage.verifyBannerText('Welcome');
});
```

## Configuration Access

```typescript
import { config } from './lib/config/ConfigManager';

const baseURL = config.getBaseURL();
const environment = config.getEnvironment();
const profile = config.getProfile();

// Check if profile is active
if (config.hasProfile('mobile')) {
  // Mobile-specific logic
}

// Get full config summary
const summary = config.getSummary();
```

## Azure DevOps Integration

```typescript
import { ADOHelper } from './lib/ADOHelper';

const ado = new ADOHelper({
  organization: 'your-org',
  project: 'your-project',
  personalAccessToken: 'your-pat',
});

// Fetch work item
const workItem = await ado.fetchWorkItem(12345);

// Generate test from work item
const result = await ado.generateTestFromWorkItem(12345);
```

## Available Scripts

| Command               | Description                     |
| --------------------- | ------------------------------- |
| `npm test`            | Run all tests                   |
| `npm run test:qa`     | Run in QA environment           |
| `npm run test:dev`    | Run in DEV environment          |
| `npm run test:headed` | Run with visible browser        |
| `npm run test:debug`  | Debug with Playwright Inspector |
| `npm run report`      | Open test report                |
| `npm run lint`        | Lint code                       |
| `npm run format`      | Format code                     |
| `npm run codegen`     | Generate tests                  |

## Environment Variables

Required:

- `NODE_ENV` - Environment (dev/qa/staging/prod)
- `APP_URL` - Application URL
- `{ENV}_USERNAME` - Username for environment
- `{ENV}_PASSWORD` - Password for environment

Optional:

- `API_URL` - API base URL
- `TIMEOUT` - Test timeout (default: 30000)
- `RETRIES` - Test retries (default: 1)
- `HEADLESS` - Run headless (default: true)

## License

ISC

# Product Integration Guide

How to use this framework in your product repository.

## Quick Setup (5 minutes)

### 1. Add Framework as Submodule

```bash
cd your-product-repo
git submodule add https://github.com/ey-org/playwright-fw.git tests/framework
git submodule update --init --recursive
```

### 2. Create Your Product Tests

```bash
# Use any name you want - examples:
mkdir -p tests/infinity-tests/{ui,api,pages}
mkdir -p tests/payment-tests/{ui,api,pages}
mkdir -p tests/YOUR-PRODUCT-tests/{ui,api,pages}

mkdir -p tests/config/environments
```

### 3. Configure Environment

Create `tests/config/environments/qa.env`:

```env
NODE_ENV=qa
APP_URL=https://your-product-qa.com/
QA_USERNAME=testuser
QA_PASSWORD=testpass
TIMEOUT=30000
RETRIES=1
HEADLESS=true
```

### 4. Setup Playwright Config

Create `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV || 'qa';
dotenv.config({
  path: path.resolve(__dirname, `tests/config/environments/${env}.env`),
  override: true,
});

export default defineConfig({
  testDir: './tests/YOUR-PRODUCT-tests', // Your folder name
  timeout: 30000,
  use: {
    baseURL: process.env.APP_URL,
    headless: process.env.HEADLESS === 'true',
  },
  projects: [
    { name: 'chromium', testDir: './tests/YOUR-PRODUCT-tests/ui' },
    { name: 'api', testDir: './tests/YOUR-PRODUCT-tests/api' },
  ],
});
```

### 5. Write Test

Create `tests/YOUR-PRODUCT-tests/ui/example.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { setupTest } from '../../framework/src/lib/SimpleTestSetup';

test('product test', async ({ page }) => {
  const setup = setupTest(page);
  await setup.gotoHome();
  expect(page.url()).toContain(process.env.APP_URL || '');
});
```

### 6. Run

```bash
npm install @playwright/test cross-env
npx playwright install
npx playwright test
```

## Folder Structure Example

```
your-product-repo/
├── tests/
│   ├── framework/              # Submodule (this repo)
│   ├── infinity-tests/         # Your product tests (any name!)
│   │   ├── ui/
│   │   ├── api/
│   │   └── pages/
│   └── config/
│       └── environments/
└── playwright.config.ts
```

## Using Framework Features

### Utilities

```typescript
import { Utils } from '../../framework/src/lib/Utils';
const email = Utils.String.generateEmail();
```

### Config Manager

```typescript
import { config } from '../../framework/src/lib/config/ConfigManager';
const baseURL = config.getBaseURL();
```

### Simple Fixtures

```typescript
import { test } from '../../framework/src/tests/fixtures/simpleFixtures';
test('test', async ({ testSetup, homePage }) => {
  await testSetup.gotoHome();
});
```

### Page Objects

```typescript
import { BasePage } from '../../framework/src/pages/common/BasePage';
export class MyPage extends BasePage<MyPage> {
  async clickButton() {
    await this.page.click('.button');
    return this;
  }
}
```

## Updating Framework

```bash
cd tests/framework
git pull origin master
cd ../..
git add tests/framework
git commit -m "chore: update framework"
```

## CI/CD (GitHub Actions)

```yaml
- uses: actions/checkout@v3
  with:
    submodules: recursive # Important!
- run: npm ci
- run: npx playwright install --with-deps
- run: npx playwright test
```

## Multiple Products

```
enterprise-repo/
├── tests/
│   ├── framework/          # Shared
│   ├── product-a-tests/    # Product A
│   └── product-b-tests/    # Product B
```

## Key Points

✅ **Any folder name** - Name it after your product  
✅ **Framework stays separate** - Don't modify submodule  
✅ **Easy updates** - Pull from framework repo  
✅ **Full control** - Your tests, your structure

---

That's it! Questions? Check framework README or examples.

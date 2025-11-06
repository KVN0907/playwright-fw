# 🔄 Runtime Data Configuration Guide

## Overview

The Runtime Data system allows you to **pass test data dynamically at runtime** instead of hardcoding it in your tests. Data can come from:

- ✅ Command-line arguments
- ✅ Environment variables
- ✅ JSON files
- ✅ API endpoints
- ✅ Inline configuration in tests

---

## 🚀 Quick Start

### Example 1: Pass Data via CLI

```bash
# Single user
npm test -- --user-email=admin@test.com --user-role=admin

# Complete test data
npm test -- --test-data='{"users":[{"email":"test@test.com","role":"admin"}]}'
```

### Example 2: Use in Test

```typescript
import { test } from './tests/fixtures/advancedFixtures';

test('My test', async ({ dataResolver }) => {
  // Automatically uses CLI data or falls back to defaults
  const user = dataResolver.resolveUser();
  
  console.log(user.email); // admin@test.com (from CLI) or generated
});
```

---

## 📋 Data Sources

### 1. **Command Line Arguments**

#### Individual Parameters
```bash
# User data
npm test -- --user-email=john@test.com --user-role=admin --user-name="John Doe"

# Organization data
npm test -- --org-name="Acme Corp" --org-type=enterprise

# Location data
npm test -- --location-name="Main Office" --location-type=Office
```

#### JSON Format
```bash
npm test -- --test-data='{
  "users": [
    {"email": "admin@test.com", "role": "admin"},
    {"email": "user@test.com", "role": "user"}
  ],
  "organizations": [
    {"name": "Test Corp", "type": "enterprise"}
  ]
}'
```

---

### 2. **Environment Variables**

```bash
# Set environment variables
export TEST_DATA_USERS='[{"email":"admin@test.com","role":"admin"}]'
export TEST_DATA_ORGS='[{"name":"Test Corp","type":"enterprise"}]'
export TEST_DATA_LOCATIONS='[{"name":"Office","type":"Office"}]'

# Or use a data file
export TEST_DATA_FILE='./test-data/qa-data.json'

# Run tests
npm test
```

---

### 3. **JSON Files**

**Create file: `test-data/qa-data.json`**
```json
{
  "users": [
    {
      "name": "Admin User",
      "email": "admin@test.com",
      "role": "admin",
      "organization": "Test Corp"
    }
  ],
  "organizations": [
    {
      "name": "Test Corp",
      "type": "enterprise"
    }
  ],
  "custom": {
    "apiKey": "test-key-123",
    "featureFlags": ["newUI", "betaFeature"]
  }
}
```

**Load in test:**
```typescript
test('Load from file', async ({ runtimeConfig, dataResolver }) => {
  await runtimeConfig.loadFromSources([
    { source: 'file', path: './test-data/qa-data.json' }
  ]);
  
  const user = dataResolver.resolveUser(0);
  // user.email = "admin@test.com"
});
```

---

### 4. **Inline Configuration**

```typescript
test('Inline config', async ({ runtimeConfig, dataResolver }) => {
  // Set directly in test
  runtimeConfig.setConfig({
    users: [
      { email: 'john@test.com', role: 'admin' },
      { email: 'jane@test.com', role: 'manager' }
    ],
    organizations: [
      { name: 'My Corp', type: 'business' }
    ]
  });
  
  // Resolve
  const admin = dataResolver.resolveUser(0);
  const manager = dataResolver.resolveUser(1);
  const org = dataResolver.resolveOrganization(0);
});
```

---

### 5. **API Endpoint** (Advanced)

```typescript
test('Load from API', async ({ runtimeConfig }) => {
  await runtimeConfig.loadFromSources([
    { 
      source: 'api', 
      apiEndpoint: 'https://api.test.com/test-data',
      priority: 1
    }
  ]);
  
  // API response should match RuntimeDataConfig format
});
```

---

## 🎯 Usage Examples

### Basic Usage

```typescript
import { test } from './tests/fixtures/advancedFixtures';

test('Resolve user', async ({ dataResolver }) => {
  // Auto-resolves from CLI, env, or defaults
  const user = dataResolver.resolveUser();
  
  console.log(user.email); // From runtime or generated
  console.log(user.role);  // From runtime or 'user'
});
```

---

### Resolve Specific User

```typescript
test('Resolve by index', async ({ dataResolver, runtimeConfig }) => {
  runtimeConfig.setConfig({
    users: [
      { email: 'user0@test.com' },
      { email: 'user1@test.com' },
      { email: 'user2@test.com' }
    ]
  });
  
  const firstUser = dataResolver.resolveUser(0);
  const secondUser = dataResolver.resolveUser(1);
  
  console.log(firstUser.email);  // user0@test.com
  console.log(secondUser.email); // user1@test.com
});
```

---

### Resolve Multiple Users

```typescript
test('Resolve multiple', async ({ dataResolver, runtimeConfig }) => {
  runtimeConfig.setConfig({
    users: [
      { email: 'user1@test.com', role: 'admin' },
      { email: 'user2@test.com', role: 'user' }
    ]
  });
  
  // Resolve up to 5 users (uses runtime data + generates remaining)
  const users = dataResolver.resolveUsers(5);
  
  console.log(users.length); // 5
  console.log(users[0].email); // user1@test.com (from runtime)
  console.log(users[2].email); // Generated (fallback)
});
```

---

### Complete Scenario

```typescript
test('Complete scenario', async ({ dataResolver, runtimeConfig }) => {
  runtimeConfig.setConfig({
    users: [
      { email: 'admin@test.com', role: 'admin' },
      { email: 'user@test.com', role: 'user' }
    ],
    organizations: [
      { name: 'Test Corp', type: 'enterprise' }
    ],
    locations: [
      { name: 'Office 1', type: 'Office' },
      { name: 'Office 2', type: 'Office' }
    ]
  });
  
  const scenario = dataResolver.resolveScenario('My Scenario');
  
  console.log(scenario.users.length);         // 2
  console.log(scenario.organizations.length); // 1
  console.log(scenario.locations.length);     // 2
});
```

---

### Custom Data

```typescript
test('Custom data', async ({ runtimeConfig }) => {
  runtimeConfig.setConfig({
    custom: {
      apiKey: 'my-api-key',
      environment: 'qa',
      featureFlags: ['newUI', 'betaSearch']
    }
  });
  
  const apiKey = runtimeConfig.getCustomData<string>('apiKey');
  const flags = runtimeConfig.getCustomData<string[]>('featureFlags');
  
  console.log(apiKey);  // my-api-key
  console.log(flags);   // ['newUI', 'betaSearch']
});
```

---

## 🔧 Advanced Options

### Resolver Options

```typescript
const user = dataResolver.resolveUser(0, {
  useRuntimeConfig: true,      // Use runtime data (default: true)
  fallbackToDefaults: true,    // Fallback to generated data (default: true)
  cacheResolved: true,         // Cache resolved data (default: true)
  logResolution: true,         // Log resolution process (default: true)
});
```

---

### Disable Runtime Config

```typescript
// Force using only defaults (ignore runtime data)
const user = dataResolver.resolveUser(undefined, {
  useRuntimeConfig: false,
  fallbackToDefaults: true
});
```

---

### Require Runtime Data (No Fallback)

```typescript
// Throw error if no runtime data found
try {
  const user = dataResolver.resolveUser(0, {
    useRuntimeConfig: true,
    fallbackToDefaults: false
  });
} catch (error) {
  console.error('No runtime data provided!');
}
```

---

### Caching

```typescript
// First call: resolves and caches
const user1 = dataResolver.resolveUser(0, { cacheResolved: true });

// Second call: uses cache (same object)
const user2 = dataResolver.resolveUser(0, { cacheResolved: true });

console.log(user1.id === user2.id); // true

// Clear cache
dataResolver.clearCache();
```

---

## 🎯 Common Patterns

### Pattern 1: Data-Driven Testing

```bash
# Run same test with different data
npm test -- --user-role=admin
npm test -- --user-role=manager
npm test -- --user-role=viewer
```

```typescript
test('Access control test', async ({ dataResolver }) => {
  const user = dataResolver.resolveUser();
  
  // Test behaves differently based on runtime role
  if (user.role === 'admin') {
    // Test admin features
  } else if (user.role === 'manager') {
    // Test manager features
  }
});
```

---

### Pattern 2: Environment-Specific Data

```bash
# Dev environment
NODE_ENV=dev npm test

# QA environment with specific data
NODE_ENV=qa TEST_DATA_FILE='./data/qa-users.json' npm test

# Prod environment
NODE_ENV=prod npm test
```

```typescript
test('Environment test', async ({ runtimeConfig, dataResolver }) => {
  const env = process.env.NODE_ENV;
  
  // Load environment-specific data
  await runtimeConfig.loadFromSources([
    { source: 'file', path: `./data/${env}-data.json` }
  ]);
  
  const user = dataResolver.resolveUser();
  // User data specific to environment
});
```

---

### Pattern 3: Reusable Test Suites

```typescript
// testSuite.ts
export function runTestSuite(description: string) {
  test.describe(description, () => {
    test('Create user', async ({ dataResolver }) => {
      const user = dataResolver.resolveUser(); // Uses runtime data
      // Test logic
    });
    
    test('Update user', async ({ dataResolver }) => {
      const user = dataResolver.resolveUser(); // Same runtime data
      // Test logic
    });
  });
}

// Run with different data
// npm test -- --user-role=admin
// npm test -- --user-role=user
```

---

## 📁 File Organization

```
playwright-fw/
├── test-data/
│   ├── dev-data.json        # Dev environment data
│   ├── qa-data.json         # QA environment data
│   ├── staging-data.json    # Staging environment data
│   ├── smoke-test-data.json # Smoke test data
│   └── regression-data.json # Regression test data
│
└── src/tests/
    └── examples/
        └── runtime-data-demo.spec.ts
```

---

## 🎓 Best Practices

1. **Use JSON files for complex scenarios**
2. **Use CLI for quick one-off tests**
3. **Use environment variables for CI/CD**
4. **Cache resolved data for performance**
5. **Always enable fallback for flexibility**
6. **Use custom data for test-specific config**

---

## 🐛 Troubleshooting

### No runtime data loaded
```typescript
// Check if data is available
if (!runtimeConfig.hasRuntimeData()) {
  console.log('No runtime data, using defaults');
}
```

### Data not resolving
```typescript
// Enable logging to see resolution process
const user = dataResolver.resolveUser(0, { logResolution: true });
```

### Cache issues
```typescript
// Clear cache before test
dataResolver.clearCache();
```

---

## 📚 Complete Example

```bash
# test-data/qa-data.json
{
  "users": [
    {"email": "admin@qa.com", "role": "admin"},
    {"email": "user@qa.com", "role": "user"}
  ],
  "organizations": [
    {"name": "QA Corp", "type": "enterprise"}
  ]
}

# Run test
npm test src/tests/my-test.spec.ts -- --test-data-file=./test-data/qa-data.json
```

```typescript
// my-test.spec.ts
test('Complete workflow', async ({ dataResolver }) => {
  const admin = dataResolver.resolveUser(0);
  const user = dataResolver.resolveUser(1);
  const org = dataResolver.resolveOrganization(0);
  
  // Use in test
  console.log(`Admin: ${admin.email}`);
  console.log(`User: ${user.email}`);
  console.log(`Org: ${org.name}`);
  
  // All data from runtime config
});
```

---

## 🎉 Summary

Runtime data configuration provides:

✅ **Flexibility** - Change data without code changes  
✅ **Reusability** - Same tests, different data  
✅ **Maintainability** - Centralized test data  
✅ **Scalability** - Easy to add new data sources  
✅ **CI/CD Ready** - Environment-specific data  

---

**Next Steps**: Check out `src/tests/examples/runtime-data-demo.spec.ts` for working examples!

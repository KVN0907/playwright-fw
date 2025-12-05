# 🎭 Hybrid Test Generation Guide

## Overview

The Hybrid Test Generator automatically creates Playwright tests from multiple sources:

1. **Java Controllers** → API Tests
2. **Angular Components** → UI Tests  
3. **ADO Work Items** → Feature Tests
4. **OpenAPI/Swagger** → Contract Tests

All generated tests follow your existing framework patterns and use the prompt guidelines from `generate_tests.prompt.md`.

---

## 🚀 Quick Start

### Generate API Tests from Controllers

```bash
# Generate from all controllers
npm run generate:api

# Generate from specific directory
npm run generate:hybrid -- --controllers ../../../service/security/src/main/java

# Generate from multiple directories
npm run generate:hybrid -- --controllers ../../../service/gateway --controllers ../../../service/security
```

### Generate UI Tests from Components

```bash
# Generate from all components
npm run generate:ui

# Generate from specific directory
npm run generate:hybrid -- --components ../../../portal/admin/src/main/webapp/app/compliance
```

### Generate Everything

```bash
# Generate both API and UI tests
npm run generate:all
```

---

## 📊 What Gets Generated

### API Tests (from Java Controllers)

**Input:**
```java
@RestController
@RequestMapping("/api/locations")
public class LocationController {
    
    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocation(@PathVariable Long id) {
        // ...
    }
    
    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody LocationDTO dto) {
        // ...
    }
}
```

**Generated Test:**
```typescript
import { test, expect } from '../fixtures/advancedFixtures';
import { APIValidator } from '@/lib/validation/APIValidator';

test.describe('LocationController API Tests', () => {
  let validator: APIValidator;

  test.beforeAll(async () => {
    validator = new APIValidator();
  });

  test('GET /api/locations/{id} - getLocation', async ({ request }) => {
    // Given location ID
    const { id: '1' } = {};

    // When making GET request
    const response = await request.get(`/api/locations/${id}`);

    // Then should return success
    expect(response.status()).toBe(200);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();

    // Validate response schema
    validator.validateResponse(data, 'Location');
  });

  test('POST /api/locations - createLocation', async ({ request }) => {
    // Given test data
    const testData = {
      name: "Test Location",
      type: "Office"
    };

    // When making POST request
    const response = await request.post(`/api/locations`, { data: testData });

    // Then should return success
    expect(response.status()).toBe(201);

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();

    // Validate response schema
    validator.validateResponse(data, 'Location');
  });
});
```

---

### UI Tests (from Angular Components)

**Input:**
```typescript
@Component({
  selector: 'app-location-list',
  template: `
    <button (click)="createLocation()" data-testid="create-btn">Create</button>
    <table data-testid="locations-table">
      <tr *ngFor="let location of locations">
        <td>{{location.name}}</td>
      </tr>
    </table>
  `
})
export class LocationListComponent {
  locations: Location[] = [];
  
  createLocation() {
    // ...
  }
  
  deleteLocation(id: number) {
    // ...
  }
}
```

**Generated Test & Page Object:**
```typescript
// location-list.ui.spec.ts
import { test } from '../fixtures/advancedFixtures';

test.describe('LocationList Component', () => {
  test('User can view location list', async ({ locationListPage }) => {
    // Given user navigates to locations page
    await locationListPage.navigate();
    
    // When page loads
    await locationListPage.waitForLocationsToLoad();
    
    // Then locations table should be visible
    await locationListPage.verifyLocationsTableVisible();
  });
  
  test('User can create new location', async ({ locationListPage, locationBuilder }) => {
    // Given user is on locations page
    await locationListPage.navigate();
    const location = locationBuilder.create().build();
    
    // When user creates location
    await locationListPage.clickCreateButton();
    await locationListPage.fillLocationForm(location);
    
    // Then location should be created
    await locationListPage.verifyLocationCreated(location.name);
  });
});

// LocationListPage.ts (generated)
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LocationListPage extends BasePage {
  private readonly createButton = () => this.page.getByTestId('create-btn');
  private readonly locationsTable = () => this.page.getByTestId('locations-table');
  
  async navigate() {
    await this.page.goto('/locations');
    await this.waitForLocationsToLoad();
  }
  
  async clickCreateButton() {
    await this.createButton().click();
  }
  
  async verifyLocationsTableVisible() {
    await expect(this.locationsTable()).toBeVisible();
  }
}
```

---

## 🎯 Generation Strategies

### 1. API Test Generation

**What it analyzes:**
- `@RestController` classes
- HTTP method annotations (`@GetMapping`, `@PostMapping`, etc.)
- Request/Response types
- Path variables, request bodies, parameters

**What it generates:**
- Request/response validation tests
- Status code assertions
- Schema validation
- Error scenario tests

### 2. UI Test Generation

**What it analyzes:**
- Component selectors and templates
- Input/Output properties
- Service dependencies
- Method signatures

**What it generates:**
- Page Object Models
- Component interaction tests
- Navigation tests
- Form validation tests

### 3. Integration Tests

**What it combines:**
- API test flows
- UI component interactions
- End-to-end scenarios

---

## ⚙️ Configuration

### Test Script Config

Located in `HybridTestGenerator` constructor:

```typescript
const testScriptConfig: TestScriptConfig = {
  outputDirectory: './src/tests/generated',  // Output location
  testFramework: 'playwright',               // Test framework
  promptFilePath: './.github/generate_tests.prompt.md',  // Framework guidelines
  aiProvider: 'vscode',                      // AI provider (vscode/openai/anthropic)
  includePageObjects: true,                  // Generate page objects
  basePageObjectsPath: './src/pages',       // Page objects location
  testSpecsPath: './src/tests',            // Test specs location
};
```

### Source Code Paths

```typescript
const sourceCodePaths = {
  javaControllers: [
    '../../../service/security/src/main/java/com/ey/compliance/service/web/rest',
    '../../../service/gateway/src/main/java/com/ey/ct/wlms/web/rest',
    '../../../service/compliancemanager/src/main/java/com/ey/compliance/service/web/rest',
  ],
  angularComponents: [
    '../../../portal/admin/src/main/webapp/app/compliance',
    '../../../portal/admin/src/main/webapp/app/entities',
  ],
  openApiSpecs: [
    // Add OpenAPI/Swagger spec paths here
  ],
};
```

---

## 📁 Output Structure

```
tests/automation/src/tests/
├── generated/
│   ├── api/
│   │   ├── LocationController.api.spec.ts
│   │   ├── UserController.api.spec.ts
│   │   └── ClientController.api.spec.ts
│   ├── ui/
│   │   ├── LocationList.ui.spec.ts
│   │   ├── UserManagement.ui.spec.ts
│   │   └── ClientHome.ui.spec.ts
│   └── integration/
│       ├── LocationManagement.integration.spec.ts
│       └── UserWorkflow.integration.spec.ts
└── pages/
    └── generated/
        ├── LocationListPage.ts
        ├── UserManagementPage.ts
        └── ClientHomePage.ts
```

---

## 🔍 Example: Real-World Generation

### Scenario: Generate tests for Location Management feature

```bash
# Step 1: Generate API tests from LocationController
npm run generate:hybrid -- --controllers ../../../service/compliancemanager/src/main/java/com/ey/compliance/service/web/rest/LocationController.java

# Output:
# ✅ Generated: LocationController.api.spec.ts
#    - Test cases: 8
#    - Endpoints covered: 8

# Step 2: Generate UI tests from LocationListComponent
npm run generate:hybrid -- --components ../../../portal/admin/src/main/webapp/app/compliance/client-admin/locations

# Output:
# ✅ Generated: LocationList.ui.spec.ts
#    - Test cases: 6
#    - Page objects: LocationListPage.ts

# Step 3: Run generated tests
npm test -- src/tests/generated/api/LocationController.api.spec.ts
npm test -- src/tests/generated/ui/LocationList.ui.spec.ts
```

---

## 🎨 Customization

### Adding Custom Test Templates

Edit `HybridTestGenerator.ts`:

```typescript
private generateAPITestCase(endpoint: JavaEndpoint): string {
  return `
  test('${endpoint.method} ${endpoint.path}', async ({ request, dataResolver }) => {
    // Your custom template here
    // Access to all fixtures: dataResolver, userBuilder, etc.
  });
  `;
}
```

### Using AI Provider

The generator uses your existing prompt file for AI-assisted generation. To use AI:

```typescript
aiProvider: 'openai',  // or 'anthropic', 'azure', 'vscode'
apiKey: process.env.OPENAI_API_KEY,
model: 'gpt-4',
```

---

## 📈 Benefits

### Development Speed
- **Manual:** 2-3 hours per endpoint → **Generated:** 2-3 minutes for entire controller
- **Coverage:** Achieve 60-80% test coverage automatically

### Consistency
- All tests follow same patterns
- Framework guidelines enforced
- Naming conventions automated

### Maintenance
- Code changes → Regenerate tests
- API contract violations detected early
- Refactoring becomes safer

---

## ⚠️ Limitations

### What's Generated Well:
- ✅ Basic CRUD operations
- ✅ Request/response validation
- ✅ HTTP status codes
- ✅ Schema validation
- ✅ Component interactions

### What Needs Manual Work:
- ❌ Complex business logic validation
- ❌ Edge cases and error scenarios
- ❌ Authentication flows
- ❌ Multi-step user workflows
- ❌ Test data relationships

### Best Practice:
Generate the scaffolding, then enhance with business-specific assertions and edge cases.

---

## 🔧 Troubleshooting

### Issue: No controllers found
**Solution:** Check the path is correct and contains `*Controller.java` files

### Issue: Parse errors
**Solution:** Ensure Java files follow standard Spring Boot patterns

### Issue: Generated tests don't run
**Solution:** 
1. Check imports are correct
2. Ensure fixtures are available
3. Verify test data builders exist

### Issue: Type mismatches
**Solution:** Update type mappings in `generateMockValue()` method

---

## 🚀 Next Steps

1. **Generate initial test suite:**
   ```bash
   npm run generate:all
   ```

2. **Review generated tests:**
   - Check test coverage
   - Add business-specific assertions
   - Handle edge cases

3. **Run tests:**
   ```bash
   npm test -- src/tests/generated
   ```

4. **Integrate with CI/CD:**
   - Add to GitHub Actions workflow
   - Run after code changes
   - Regenerate on API changes

---

## 📚 Related Documentation

- `generate_tests.prompt.md` - Framework generation guidelines
- `INTEGRATION_GUIDE.md` - Test framework integration
- `README.md` - Test framework overview
- `TestScriptGenerator.ts` - ADO work item generation

---

**Happy Testing! 🎭**

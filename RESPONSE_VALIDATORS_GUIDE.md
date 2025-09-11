# Response Validators Pattern

This document explains how to use the new simplified API testing pattern with dedicated response validators.

## Overview

The `ResponseValidators.ts` file contains reusable validation logic for all API endpoints, keeping test spec files clean and focused on business logic.

## Structure

```
tests/
├── apiTests/
│   ├── getAccount.spec.ts          # Simple, clean test specs
│   └── endPointsDTO/
│       └── uri.json                # Endpoint URLs
└── utils/
    └── ResponseValidators.ts       # All validation logic
```

## How to Use

### 1. Simple Test Spec File

```typescript
import { test, expect } from '@playwright/test';
import { APITestHelper } from '../utils/APITestHelper';
import { AccountValidator } from '../utils/ResponseValidators';
import urls from './endPointsDTO/uri.json';

test.describe('API Tests - Account Management', () => {
  let apiHelper: APITestHelper;

  test.beforeEach(async ({ page, request }) => {
    apiHelper = new APITestHelper(request, page);
  });

  test('GET Account Details of the Logged In User', async () => {
    // Make API call
    const response = await apiHelper.get(urls.getAccountDetails);

    // Validate using dedicated validator
    const accountData = await AccountValidator.validateAccountDetails(response);

    // Simple business logic assertions (if needed)
    expect(accountData).toBeDefined();
  });
});
```

### 2. Adding New Endpoint Validators

To add validation for a new endpoint, add a new validator class to `ResponseValidators.ts`:

```typescript
export class YourEndpointValidator extends ResponseValidator {
  private static readonly YOUR_SCHEMA: ResponseSchema = {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    status: { type: 'string', required: false },
  };

  static async validateYourEndpoint(response: APIResponse): Promise<YourDataType> {
    const data = await this.validateAndExtractJson<YourDataType>(response, 200);
    this.validateAgainstSchema(data, this.YOUR_SCHEMA);
    
    // Add any custom validations here
    if (data.id) {
      expect(data.id).toBeTruthy();
    }

    this.logValidationSuccess('Your Endpoint Name');
    return data;
  }
}
```

### 3. Using the New Validator

```typescript
import { YourEndpointValidator } from '../utils/ResponseValidators';

test('Your endpoint test', async () => {
  const response = await apiHelper.get(urls.yourEndpoint);
  const data = await YourEndpointValidator.validateYourEndpoint(response);
  expect(data).toBeDefined();
});
```

## Benefits

1. **Clean Test Files**: Spec files focus on business logic, not validation details
2. **Reusable Validation**: Same validation logic can be used across multiple tests
3. **Centralized Schemas**: All response schemas are defined in one place
4. **Better Maintainability**: Changes to validation logic only need to be made in one place
5. **Consistent Error Messages**: Standardized error reporting across all endpoints
6. **Type Safety**: Full TypeScript support with proper typing

## Available Validators

- `AccountValidator.validateAccountDetails()` - Validates account details response
- `OrganizationValidator.validateCreateOrganization()` - Example for organization creation
- `OrganizationValidator.validateGetOrganization()` - Example for organization retrieval
- `UserValidator.validateCreateUser()` - Example for user creation
- `UserValidator.validateGetUser()` - Example for user retrieval

## Response Schema Format

```typescript
const SCHEMA: ResponseSchema = {
  fieldName: { type: 'string' | 'number' | 'boolean' | 'object' | 'array', required: true | false },
  // ... more fields
};
```

## Base Validation Methods

- `validateAndExtractJson<T>()` - Validates status code and extracts JSON response
- `validateAgainstSchema()` - Validates response against defined schema
- `logValidationSuccess()` - Logs successful validation
- `logValidationError()` - Logs validation errors

This pattern makes API tests much easier to read, write, and maintain!

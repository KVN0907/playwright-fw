# Swagger Helper - Auto-Generate API Tests

Automatically generate API test helpers from Swagger/OpenAPI specifications.

## Quick Start

```bash
# Generate from Swagger URL
npm run swagger:generate -- https://api.example.com/swagger.json

# With custom output directory
npm run swagger:generate -- https://petstore.swagger.io/v2/swagger.json --output ./src/tests/api/petstore
```

## What It Does

✅ Fetches Swagger/OpenAPI spec from URL  
✅ Extracts all endpoints with methods (GET, POST, PUT, etc.)  
✅ Generates TypeScript interfaces for request/response  
✅ Creates ready-to-use API helper classes  
✅ Includes example data from spec  
✅ Groups endpoints by tags

## Usage

### CLI Command

```bash
npm run swagger:generate -- <swagger-url> [options]

Options:
  --output <dir>        Output directory (default: ./src/tests/api/generated)
  --no-examples         Don't include examples
  --no-types            Don't generate TypeScript interfaces
```

### Examples

```bash
# Basic usage
npm run swagger:generate -- https://api.myapp.com/swagger.json

# Custom output location
npm run swagger:generate -- http://localhost:3000/api-docs --output ./api-helpers

# Without examples
npm run swagger:generate -- https://api.myapp.com/swagger.json --no-examples
```

### Environment Variables

```bash
# Set via env vars
export SWAGGER_URL=https://api.myapp.com/swagger.json
export SWAGGER_OUTPUT_DIR=./src/tests/api/generated
npm run swagger:generate
```

## Generated Output

### Structure

```
src/tests/api/generated/
├── index.ts                    # Exports all helpers
├── users-api.ts                # Users endpoints
├── products-api.ts             # Products endpoints
└── orders-api.ts               # Orders endpoints
```

### Generated Helper Example

**Input Swagger:**

```json
{
  "paths": {
    "/users/{id}": {
      "get": {
        "tags": ["Users"],
        "operationId": "getUserById",
        "parameters": [{ "name": "id", "in": "path" }],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "email": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Generated Code (`users-api.ts`):**

```typescript
import { APIRequestContext } from '@playwright/test';
import { APITestHelper } from '../../lib/APITestHelper';

/* ===== TYPES ===== */

interface GetUserByIdResponse {
  id: string;
  name: string;
  email: string;
}

/* ===== API HELPER ===== */

export class UsersAPI extends APITestHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * Get user by ID
   * GET /users/{id}
   */
  async getUserById(
    pathParams: Record<string, string>
  ): Promise<{ status: number; body: GetUserByIdResponse }> {
    let url = '/users/{id}';
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });

    const response = await this.get(url);
    return response;
  }

  /* Example Usage:
   * Response: {
   *   "id": "123",
   *   "name": "John Doe",
   *   "email": "john@example.com"
   * }
   */
}
```

## Using Generated Helpers

### In Your Tests

```typescript
import { test } from '@playwright/test';
import { UsersAPI } from './api/generated/users-api';

test('Get user by ID', async ({ request }) => {
  const usersApi = new UsersAPI(request);

  const response = await usersApi.getUserById({ id: '123' });

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('name');
  expect(response.body).toHaveProperty('email');
});
```

### With POST Request

```typescript
import { ProductsAPI } from './api/generated/products-api';

test('Create product', async ({ request }) => {
  const productsApi = new ProductsAPI(request);

  const newProduct = {
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
  };

  const response = await productsApi.createProduct(newProduct);

  expect(response.status).toBe(201);
  expect(response.body.id).toBeDefined();
});
```

### With Query Parameters

```typescript
const response = await usersApi.getUsers(
  {}, // path params
  { page: '1', limit: '10' } // query params
);
```

## Programmatic Usage

```typescript
import { SwaggerHelper, generateFromSwagger } from './lib/SwaggerHelper';

// Quick generate
await generateFromSwagger({
  swaggerUrl: 'https://api.example.com/swagger.json',
  outputDir: './api-helpers',
  includeExamples: true,
  generateTypes: true,
});

// Or use the class directly
const helper = new SwaggerHelper({
  swaggerUrl: 'https://api.example.com/swagger.json',
  outputDir: './api-helpers',
});

await helper.fetchSwaggerSpec();
const endpoints = helper.parseEndpoints();
await helper.generateApiHelpers();
```

## Features

### TypeScript Type Generation

Automatically generates TypeScript interfaces from Swagger schemas:

```typescript
interface CreateUserRequest {
  name: string;
  email: string;
  age?: number;
}

interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
```

### Example Data Extraction

Extracts example data from Swagger spec or generates sensible defaults:

```typescript
/* Example Usage:
 * Request: {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "age": 30
 * }
 * Response: {
 *   "id": "123e4567-e89b-12d3-a456-426614174000",
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "createdAt": "2024-01-01T00:00:00Z"
 * }
 */
```

### Automatic Grouping

Endpoints are grouped by Swagger tags into separate files for better organization.

### Path & Query Parameters

Handles path parameters, query parameters, headers automatically:

```typescript
async getUserOrders(
  pathParams: Record<string, string>,  // {id: "123"}
  queryParams?: Record<string, string> // {status: "active"}
): Promise<Response> {
  // Handles /users/{id}/orders?status=active
}
```

## Benefits

✅ **Save Time** - No manual API helper writing  
✅ **Type Safety** - TypeScript interfaces generated  
✅ **Documentation** - Comments include endpoint details  
✅ **Examples** - Request/response examples included  
✅ **Organized** - Grouped by tags/features  
✅ **Up-to-date** - Regenerate when API changes

## Tips

### Re-generate on API Changes

```bash
# Add to your CI/CD or pre-test scripts
npm run swagger:generate -- $SWAGGER_URL
npm test
```

### Multiple APIs

```bash
# Generate for multiple services
npm run swagger:generate -- https://users-api.com/swagger.json --output ./api/users
npm run swagger:generate -- https://products-api.com/swagger.json --output ./api/products
npm run swagger:generate -- https://orders-api.com/swagger.json --output ./api/orders
```

### Custom Base URL

The generated helpers extend `APITestHelper`, so you can configure base URL:

```typescript
const api = new UsersAPI(request);
// Base URL comes from your test configuration
```

## Troubleshooting

### Swagger URL Not Accessible

```bash
# Check if URL is accessible
curl https://api.example.com/swagger.json

# Or use local file
npm run swagger:generate -- file://./swagger.json
```

### Invalid Swagger Format

Ensure your API provides valid OpenAPI 2.0 or 3.0 specification.

### TypeScript Errors

Generated types might need manual adjustment for complex schemas. Edit the generated files as needed.

---

**That's it! Your API tests just got 10x faster to write.** 🚀

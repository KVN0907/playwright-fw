# API Tests Structure

This directory contains all API tests organized for maintainability and sprint-based execution.

## Directory Structure

```
api/
├── Sprint1/              # Sprint 1 API tests (ADO stories)
│   ├── 197259-login-api.spec.ts
│   ├── 197265-create-reg-area.spec.ts
│   ├── 197265-questions-api.spec.ts
│   ├── 197269-upload-questions.spec.ts
│   ├── 197273-edit-reg-area.spec.ts
│   ├── 197275-delete-reg-area-questions.spec.ts
│   ├── 197592-create-users.spec.ts
│   ├── 197598-edit-users.spec.ts
│   ├── 197601-deactivate-users.spec.ts
│   ├── 197607-create-client.spec.ts
│   ├── 197609-view-client-list.spec.ts
│   ├── 198251-deactivate-client.spec.ts
│   └── master-questionnaire-api.spec.ts
│
├── Sprint2/              # Sprint 2 API tests (ADO stories)
│   ├── 206272-assign-client-admin-countries.spec.ts
│   └── debug-auth.spec.ts
│
├── e2e/                  # End-to-End workflow tests
│   ├── client-onboarding-flow.spec.ts
│   ├── questionnaire-workflow.spec.ts
│   └── user-management-flow.spec.ts
│
├── domains/              # Domain-specific generated tests
│   ├── RegArea/
│   │   ├── generated.spec.ts
│   │   ├── network.spec.ts
│   │   └── rbac.spec.ts
│   ├── Questions/
│   │   └── generated.spec.ts
│   ├── QuestionnaireResponses/
│   │   └── generated.spec.ts
│   └── CountryQuestionsMapping/
│       └── generated.spec.ts
│
└── shared/               # Shared test resources
    ├── endPointsDTO/     # API endpoint URIs
    ├── requestJson/      # Sample request payloads
    ├── responseJson/     # Expected response schemas
    ├── testFiles/        # Test data files (Excel, etc.)
    └── index.ts          # Shared exports
```

## Running Tests

### Run all API tests

```bash
npx playwright test src/tests/api
```

### Run Sprint-specific tests

```bash
# Sprint 1 tests only
npx playwright test src/tests/api/Sprint1

# Sprint 2 tests only
npx playwright test src/tests/api/Sprint2
```

### Run E2E workflow tests

```bash
npx playwright test src/tests/api/e2e
```

### Run domain-specific tests

```bash
# All domain tests
npx playwright test src/tests/api/domains

# Specific domain
npx playwright test src/tests/api/domains/RegArea
```

### Run by tags

```bash
# Smoke tests only
npx playwright test --grep "@smoke"

# Regression tests
npx playwright test --grep "@regression"

# E2E tests
npx playwright test --grep "@e2e"

# Security tests
npx playwright test --grep "@security"

# RBAC tests
npx playwright test --grep "@rbac"
```

## Test Naming Convention

- Sprint tests: `{ADO-ID}-{feature-name}.spec.ts`
- E2E tests: `{workflow-name}-flow.spec.ts`
- Domain tests: `{type}.spec.ts` (generated, rbac, network)

## ADO Traceability

Each test file includes ADO story references in the file header:

- Story ID: Links to ADO work item
- Test Case IDs: Referenced in test annotations with `@ADO-{ID}`

## Fixtures

Tests use role-based fixtures from `../fixtures/apiRoleFixtures.ts`:

- `request` - Unauthenticated requests
- `superAdminRequest` - Super Admin authenticated
- `eyAdminRequest` - EY Admin authenticated
- `clientAdminRequest` - Client Admin authenticated

## CI/CD Integration

The GitHub Actions workflow (`qa-automation.yml`) supports running specific test suites:

### Manual Trigger Options

- `api` - All API tests
- `api-sprint1` - Sprint 1 tests only
- `api-sprint2` - Sprint 2 tests only
- `api-e2e` - E2E workflow tests only
- `api-domains` - Domain-specific tests only

### npm Scripts

```bash
npm run test:api           # All API tests
npm run test:api:sprint1   # Sprint 1 only
npm run test:api:sprint2   # Sprint 2 only
npm run test:api:e2e       # E2E workflows
npm run test:api:domains   # Domain tests
npm run test:e2e           # Tests tagged @e2e
```

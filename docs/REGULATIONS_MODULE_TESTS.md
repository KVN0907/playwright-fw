# Regulations Module Configuration - Automated Tests

## Overview

Automated E2E and API tests for User Story **#241593**: Reg module enablement and assignment of reg areas, countries and states (EY Admin UI)

## Test Coverage

### E2E Tests (`regulations-module-config.spec.ts`)

Covers all 10 test cases and 8 acceptance criteria:

**Test Cases:**

- TC-262244: Enable Regulations Module and Assign Regulatory Scope
- TC-262245: Fetch and Display Regulatory Areas, Countries, and States
- TC-262247: Save Multiple Selections in Configuration Panel
- TC-262248: Pre-populate Configuration Panel with Saved Selections
- TC-262249: Update and Save Changes to Regulatory Scope
- TC-262250: Disable Regulations Module and Verify Read-Only State
- TC-262251: Audit Logging for All Configuration Actions
- TC-262252: Handle Empty Questionnaire Module
- TC-262254: Prevent Saving Configuration with No Selections
- TC-262255: Network Failure During Fetch

**Acceptance Criteria:**

- AC1: Enable Regulations Module via Toggle
- AC2: Fetch Reg Areas, Countries, States from Questionnaire Module
- AC3: Display Lists for Selection
- AC4: Save Selected Regulatory Areas, Countries, and States
- AC5: Display Saved Configuration
- AC6: Updating Selections
- AC7: Module Toggle Off Behaviour
- AC8: Audit Logging for Configuration Changes

### API Tests (`regulation-config.api.spec.ts`)

Backend API validation:

- CRUD operations for regulation configuration
- Regulation assignment endpoints
- Validation and error handling
- Integration with Questionnaire module
- Audit logging verification

## Prerequisites

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with test credentials
```

## Running Tests

### Run All Regulation Tests

```bash
# E2E Tests
npm run test:ui -- regulations-module-config

# API Tests
npm run test:api -- regulation-config.api

# All Regulation Tests
npm test -- regulations
```

### Run Specific Test Cases

```bash
# Run only TC-262244 (Enable Module)
npm test -- regulations-module-config -g "TC-262244"

# Run only Audit Logging tests
npm test -- regulations-module-config -g "AC8"

# Run full workflow integration test
npm test -- regulations-module-config -g "Full workflow"
```

### Run in Different Modes

```bash
# Headed mode (see browser)
npm test -- regulations-module-config --headed

# Debug mode
npm test -- regulations-module-config --debug

# Specific browser
npm test -- regulations-module-config --project=chromium
```

## Test Data

Test data is configured in the spec files:

- Test Client: "Test Client - Regulations Module"
- EY Admin: eyadmin@test.com
- Countries: India, United States
- States: Karnataka, California
- Regulatory Areas: Environmental Compliance, Data Privacy

**Note:** Update these values based on your test environment data.

## Test Reports

Test results are available in multiple formats:

```bash
# HTML Report
npm run report

# Enhanced Report
npm run report:enhanced

# Trace Viewer (for failures)
npm run trace
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Regulation Module Tests
  run: npm test -- regulations

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: regulation-test-results
    path: test-results/
```

## Troubleshooting

### Tests Failing?

1. **Authentication Issues**
   - Verify credentials in `.env` file
   - Ensure test user has EY Admin permissions

2. **Element Not Found**
   - Check if UI selectors match your application version
   - Update selectors in page object methods

3. **API Endpoint Errors**
   - Verify `API_URL` in environment variables
   - Check backend server is running
   - Confirm API endpoints match documentation

4. **Test Data Issues**
   - Ensure test data exists in database
   - Check client subscription is configured
   - Verify Questionnaire module has data

## Maintenance

When updating the Regulations Module feature:

1. **Add New Test Cases**: Add new tests to cover new functionality
2. **Update Selectors**: If UI changes, update page object methods
3. **Update API Tests**: If endpoints change, update API test suite
4. **Review Coverage**: Ensure all acceptance criteria remain covered

## Related Documentation

- User Story: #241593
- Implementation Plan: `docs/ADO-MCP-Integration-Guide.md`
- API Documentation: `service/compliancemanager/README.md`
- Frontend Components: `portal/admin/src/main/webapp/app/compliance/client/configure-regulations/`

## Contact

For questions or issues with these tests:

- Review Implementation Plan in `docs/`
- Check Test Execution Logs
- Contact QA Team or Test Automation Lead

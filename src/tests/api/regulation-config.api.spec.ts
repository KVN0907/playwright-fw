/**
 * Regulations Module Configuration - API Tests
 *
 * User Story: #241593 - Reg module enablement and assignment of reg areas, countries and states
 *
 * Tests backend API endpoints for regulation configuration
 * Complements E2E tests with API-level validation
 */

import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:8080';
const API_BASE = '/api/v1/regulation-config';

// Test data
const testData = {
  clientSubscriptionId: 1,
  regAreaIds: [1, 2, 3],
  countryIds: [1, 2],
  stateIds: [1, 2, 3, 4],
  regulationIds: [100, 101, 102, 103, 104],
};

let authToken: string;
let apiContext: APIRequestContext;

test.describe('Regulation Config API - CRUD Operations', () => {
  test.beforeAll(async ({ playwright }) => {
    // Create API context with authentication
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Login and get auth token
    const loginResponse = await apiContext.post('/api/auth/signin', {
      data: {
        username: 'eyadmin@test.com',
        password: 'Test@123',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token || loginData.accessToken;

    // Update context with auth token
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('POST /regulation-config - Save new regulation configuration', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'POST /api/v1/regulation-config' },
        { type: 'acceptance_criteria', description: 'AC4' }
      );

    const payload = {
      clientSubscriptionId: testData.clientSubscriptionId,
      regAreaIds: testData.regAreaIds,
      countryIds: testData.countryIds,
      stateIds: testData.stateIds,
    };

    const response = await apiContext.post(API_BASE, { data: payload });

    // Assertions
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('clientSubscriptionId', testData.clientSubscriptionId);
    expect(responseData).toHaveProperty('countries');
    expect(responseData).toHaveProperty('states');
    expect(Array.isArray(responseData.countries)).toBeTruthy();
    expect(Array.isArray(responseData.states)).toBeTruthy();
  });

  test('GET /regulation-config/{clientSubscriptionId} - Retrieve existing configuration', async () => {
    test.info().annotations.push(
      {
        type: 'api_endpoint',
        description: 'GET /api/v1/regulation-config/{clientSubscriptionId}',
      },
      { type: 'acceptance_criteria', description: 'AC5' }
    );

    const response = await apiContext.get(`${API_BASE}/${testData.clientSubscriptionId}`);

    // Assertions
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('clientSubscriptionId');
    expect(responseData).toHaveProperty('countries');
    expect(responseData).toHaveProperty('states');

    // Verify saved configuration matches
    expect(responseData.countries.length).toBeGreaterThan(0);
    expect(responseData.states.length).toBeGreaterThan(0);
  });

  test('POST /regulation-config - Update existing configuration', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'POST /api/v1/regulation-config' },
        { type: 'acceptance_criteria', description: 'AC6' }
      );

    // Update with different selections
    const updatedPayload = {
      clientSubscriptionId: testData.clientSubscriptionId,
      regAreaIds: [1, 2], // Fewer reg areas
      countryIds: [1, 2, 3], // More countries
      stateIds: [1, 2, 3, 4, 5, 6], // More states
    };

    const response = await apiContext.post(API_BASE, { data: updatedPayload });

    // Assertions
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.countries.length).toBe(3);
    expect(responseData.states.length).toBe(6);
  });

  test('POST /regulation-config/publish - Publish configuration', async () => {
    test.info().annotations.push({
      type: 'api_endpoint',
      description: 'POST /api/v1/regulation-config/publish',
    });

    const payload = {
      clientSubscriptionId: testData.clientSubscriptionId,
      configType: null,
    };

    const response = await apiContext.post(`${API_BASE}/publish`, { data: payload });

    // Assertions
    expect(response.status()).toBe(200);
  });

  test('GET /regulation-config/{clientSubscriptionId}/is-published - Check publish status', async () => {
    test.info().annotations.push({
      type: 'api_endpoint',
      description: 'GET /api/v1/regulation-config/{clientSubscriptionId}/is-published',
    });

    const response = await apiContext.get(
      `${API_BASE}/${testData.clientSubscriptionId}/is-published`
    );

    // Assertions
    expect(response.status()).toBe(200);

    const isPublished = await response.json();
    expect(typeof isPublished).toBe('boolean');
    expect(isPublished).toBeTruthy(); // Should be true after publishing
  });
});

test.describe('Regulation Assignment API', () => {
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
  });

  test('POST /regulation-config/regulations/assign - Assign regulations', async () => {
    test.info().annotations.push({
      type: 'api_endpoint',
      description: 'POST /api/v1/regulation-config/regulations/assign',
    });

    const payload = {
      clientSubscriptionId: testData.clientSubscriptionId,
      regulationIds: testData.regulationIds,
    };

    const response = await apiContext.post(`${API_BASE}/regulations/assign`, { data: payload });

    // Assertions
    expect(response.status()).toBe(200);
  });

  test('GET /regulation-config/regulations/applicable/{clientSubscriptionId} - Get applicable regulations', async () => {
    test.info().annotations.push({
      type: 'api_endpoint',
      description: 'GET /api/v1/regulation-config/regulations/applicable/{clientSubscriptionId}',
    });

    const response = await apiContext.get(
      `${API_BASE}/regulations/applicable/${testData.clientSubscriptionId}`
    );

    // Assertions
    expect(response.status()).toBe(200);

    const regulations = await response.json();
    expect(Array.isArray(regulations)).toBeTruthy();
    // Should return regulations filtered by client's configured countries/states
  });

  test('GET /regulation-config/regulations/assigned/{clientSubscriptionId} - Get assigned regulations', async () => {
    test.info().annotations.push({
      type: 'api_endpoint',
      description: 'GET /api/v1/regulation-config/regulations/assigned/{clientSubscriptionId}',
    });

    const response = await apiContext.get(
      `${API_BASE}/regulations/assigned/${testData.clientSubscriptionId}`
    );

    // Assertions
    expect(response.status()).toBe(200);

    const assignedRegulations = await response.json();
    expect(Array.isArray(assignedRegulations)).toBeTruthy();
    expect(assignedRegulations.length).toBe(testData.regulationIds.length);
  });

  test('POST /regulation-config/regulations/publish/{clientSubscriptionId} - Publish regulations', async () => {
    test.info().annotations.push({
      type: 'api_endpoint',
      description: 'POST /api/v1/regulation-config/regulations/publish/{clientSubscriptionId}',
    });

    const response = await apiContext.post(
      `${API_BASE}/regulations/publish/${testData.clientSubscriptionId}`
    );

    // Assertions
    expect(response.status()).toBe(200);
  });
});

test.describe('Regulation Config API - Validation & Error Handling', () => {
  test('POST /regulation-config - Reject invalid clientSubscriptionId', async () => {
    test.info().annotations.push({ type: 'test_case', description: 'Validation Test' });

    const invalidPayload = {
      clientSubscriptionId: -1, // Invalid ID
      regAreaIds: testData.regAreaIds,
      countryIds: testData.countryIds,
      stateIds: testData.stateIds,
    };

    const response = await apiContext.post(API_BASE, { data: invalidPayload });

    // Should return 400 or 422 for validation error
    expect([400, 422]).toContain(response.status());
  });

  test('POST /regulation-config - Reject empty arrays', async () => {
    test
      .info()
      .annotations.push(
        { type: 'test_case', description: '#262254' },
        { type: 'validation', description: 'Prevent saving with no selections' }
      );

    const emptyPayload = {
      clientSubscriptionId: testData.clientSubscriptionId,
      regAreaIds: [],
      countryIds: [],
      stateIds: [],
    };

    const response = await apiContext.post(API_BASE, { data: emptyPayload });

    // Should return 400 for validation error
    expect([400, 422]).toContain(response.status());

    const errorData = await response.json();
    expect(errorData).toHaveProperty('message');
  });

  test('GET /regulation-config/{clientSubscriptionId} - Handle non-existent configuration', async () => {
    test.info().annotations.push({ type: 'test_case', description: 'Error Handling' });

    const nonExistentId = 999999;
    const response = await apiContext.get(`${API_BASE}/${nonExistentId}`);

    // Should return 404 or empty configuration
    if (response.status() === 404) {
      expect(response.status()).toBe(404);
    } else {
      // Or return empty config
      const responseData = await response.json();
      expect(responseData.countries).toEqual([]);
      expect(responseData.states).toEqual([]);
    }
  });

  test('POST /regulation-config - Handle duplicate country/state selections', async () => {
    test.info().annotations.push({ type: 'test_case', description: 'Validation Test' });

    const duplicatePayload = {
      clientSubscriptionId: testData.clientSubscriptionId,
      regAreaIds: [1, 1, 1], // Duplicates
      countryIds: [1, 1, 2],
      stateIds: [1, 2, 2, 3],
    };

    const response = await apiContext.post(API_BASE, { data: duplicatePayload });

    // Should either accept (backend deduplicates) or reject (validation error)
    if (response.status() === 200) {
      const responseData = await response.json();
      // Backend should have deduplicated
      expect(responseData).toBeDefined();
    } else {
      expect([400, 422]).toContain(response.status());
    }
  });
});

test.describe('Regulation Config API - Integration with Questionnaire Module', () => {
  test('Verify regulatory areas fetched from Questionnaire module', async () => {
    test
      .info()
      .annotations.push(
        { type: 'acceptance_criteria', description: 'AC2' },
        { type: 'integration', description: 'Questionnaire Module' }
      );

    const response = await apiContext.get('/reg-area');

    // Assertions
    expect(response.status()).toBe(200);

    const regAreas = await response.json();
    expect(Array.isArray(regAreas)).toBeTruthy();
    expect(regAreas.length).toBeGreaterThan(0);

    // Verify structure
    const firstArea = regAreas[0];
    expect(firstArea).toHaveProperty('id');
    expect(firstArea).toHaveProperty('name');
  });

  test('Verify countries fetched from Questionnaire module', async () => {
    test
      .info()
      .annotations.push(
        { type: 'acceptance_criteria', description: 'AC2' },
        { type: 'integration', description: 'Questionnaire Module' }
      );

    const response = await apiContext.get('/geography/countries');

    // Assertions
    expect(response.status()).toBe(200);

    const countries = await response.json();
    expect(Array.isArray(countries)).toBeTruthy();
    expect(countries.length).toBeGreaterThan(0);

    // Verify structure
    const firstCountry = countries[0];
    expect(firstCountry).toHaveProperty('id');
    expect(firstCountry).toHaveProperty('name');
  });

  test('Verify states fetched for a country from Questionnaire module', async () => {
    test
      .info()
      .annotations.push(
        { type: 'acceptance_criteria', description: 'AC2' },
        { type: 'integration', description: 'Questionnaire Module' }
      );

    const countryId = 1; // India
    const response = await apiContext.get(`/geography/countries/${countryId}/states`);

    // Assertions
    expect(response.status()).toBe(200);

    const states = await response.json();
    expect(Array.isArray(states)).toBeTruthy();
    expect(states.length).toBeGreaterThan(0);

    // Verify structure
    const firstState = states[0];
    expect(firstState).toHaveProperty('id');
    expect(firstState).toHaveProperty('name');
  });
});

test.describe('Regulation Config API - Audit Logging', () => {
  test('Verify audit logs are created for configuration changes', async () => {
    test
      .info()
      .annotations.push(
        { type: 'test_case', description: '#262251' },
        { type: 'acceptance_criteria', description: 'AC8' }
      );

    // Perform configuration action
    const configPayload = {
      clientSubscriptionId: testData.clientSubscriptionId,
      regAreaIds: [1],
      countryIds: [1],
      stateIds: [1],
    };

    await apiContext.post(API_BASE, { data: configPayload });

    // Check audit logs
    const auditResponse = await apiContext.get('/api/v1/audit-logs', {
      params: {
        entityType: 'REGULATION_CONFIG',
        entityId: testData.clientSubscriptionId.toString(),
        page: 0,
        size: 10,
      },
    });

    // Assertions
    expect(auditResponse.status()).toBe(200);

    const auditLogs = await auditResponse.json();
    expect(auditLogs.content || auditLogs).toBeDefined();

    const logs = Array.isArray(auditLogs) ? auditLogs : auditLogs.content || [];
    expect(logs.length).toBeGreaterThan(0);

    // Verify audit log structure (AC8 requirements)
    const recentLog = logs[0];
    expect(recentLog).toHaveProperty('userId'); // EY Admin user ID
    expect(recentLog).toHaveProperty('entityId'); // Client ID
    expect(recentLog).toHaveProperty('action'); // Action performed
    expect(recentLog).toHaveProperty('details'); // Details of changes
    expect(recentLog).toHaveProperty('timestamp'); // Timestamp
  });
});

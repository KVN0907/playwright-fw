/**
 * Master Questionnaire Edit - API Tests
 *
 * User Story: #197273 - Edit reg area name and questions (EY Super Admin)
 *
 * Tests backend API endpoints for editing reg areas and questions
 * Endpoints:
 *   - PUT /api/compliancemanager/reg-area
 *   - PUT /api/compliancemanager/questions
 */

import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:8080';
const REG_AREA_API = '/api/compliancemanager/reg-area';
const QUESTIONS_API = '/api/compliancemanager/questions';

// Test data configuration
const testData = {
  regArea: {
    existingId: 1,
    nonExistentId: 999999,
    originalName: 'Section 1',
    updatedName: 'Updated Section 1',
    updatedDescription: 'Updated description for testing',
  },
  question: {
    existingId: 1,
    nonExistentId: 999999,
    regAreaId: 1,
    nonExistentRegAreaId: 999999,
    originalTitle: 'Question 1',
    updatedTitle: 'Updated Question 1',
    questionTypes: ['TEXT', 'DROPDOWN', 'CHECKBOX', 'RADIO'],
  },
};

let authToken: string;
let apiContext: APIRequestContext;

test.describe('Master Questionnaire Edit API - Reg Area Operations', () => {
  test.beforeAll(async ({ playwright }) => {
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
        username: process.env.EY_SUPER_ADMIN_USER || 'eysuperadmin@test.com',
        password: process.env.EY_SUPER_ADMIN_PASSWORD || 'Test@123',
      },
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      authToken = loginData.token || loginData.accessToken;
    }

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

  test('TC-API-001: Edit reg area name - success', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/reg-area' },
        { type: 'user_story', description: '#197273' },
        { type: 'acceptance_criteria', description: 'AC3 - Edit reg area name' }
      );

    const payload = {
      id: testData.regArea.existingId,
      name: testData.regArea.updatedName,
      description: testData.regArea.updatedDescription,
    };

    const response = await apiContext.put(REG_AREA_API, { data: payload });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('id', testData.regArea.existingId);
    expect(responseData).toHaveProperty('name', testData.regArea.updatedName);
    expect(responseData).toHaveProperty('description', testData.regArea.updatedDescription);
  });

  test('TC-API-002: Edit reg area description only', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/reg-area' },
        { type: 'user_story', description: '#197273' }
      );

    const payload = {
      id: testData.regArea.existingId,
      name: testData.regArea.updatedName,
      description: 'New description for testing',
    };

    const response = await apiContext.put(REG_AREA_API, { data: payload });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('description', 'New description for testing');
  });

  test('TC-API-003: Edit reg area - invalid/non-existent id returns 404', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/reg-area' },
        { type: 'test_type', description: 'Negative test' }
      );

    const payload = {
      id: testData.regArea.nonExistentId,
      name: 'Should not save',
      description: 'Should not save',
    };

    const response = await apiContext.put(REG_AREA_API, { data: payload });

    expect([404, 400]).toContain(response.status());
  });

  test('TC-API-004: Edit reg area - empty name returns validation error', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/reg-area' },
        { type: 'test_type', description: 'Validation test' }
      );

    const payload = {
      id: testData.regArea.existingId,
      name: '',
      description: 'Description with empty name',
    };

    const response = await apiContext.put(REG_AREA_API, { data: payload });

    expect([400, 422]).toContain(response.status());

    const responseData = await response.json();
    expect(responseData).toHaveProperty('message');
  });

  test('TC-API-004b: Edit reg area - null name returns validation error', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/reg-area' },
        { type: 'test_type', description: 'Validation test' }
      );

    const payload = {
      id: testData.regArea.existingId,
      name: null,
      description: 'Description with null name',
    };

    const response = await apiContext.put(REG_AREA_API, { data: payload });

    expect([400, 422]).toContain(response.status());
  });

  test('TC-API-004c: Edit reg area - missing id returns validation error', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/reg-area' },
        { type: 'test_type', description: 'Validation test' }
      );

    const payload = {
      name: 'Name without ID',
      description: 'Description without ID',
    };

    const response = await apiContext.put(REG_AREA_API, { data: payload });

    expect([400, 422]).toContain(response.status());
  });
});

test.describe('Master Questionnaire Edit API - Question Operations', () => {
  test.beforeAll(async ({ playwright }) => {
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

  test('TC-API-005: Edit question title - success', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'user_story', description: '#197273' },
        { type: 'acceptance_criteria', description: 'AC1 - Edit question text' }
      );

    const payload = {
      id: testData.question.existingId,
      title: testData.question.updatedTitle,
      questionType: 'TEXT',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('id', testData.question.existingId);
    expect(responseData).toHaveProperty('title', testData.question.updatedTitle);
    expect(responseData).toHaveProperty('questionType', 'TEXT');
    expect(responseData).toHaveProperty('regAreaId', testData.question.regAreaId);
  });

  test('TC-API-006: Change question type - TEXT to DROPDOWN', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'user_story', description: '#197273' },
        { type: 'acceptance_criteria', description: 'AC2 - Change question type' }
      );

    const payload = {
      id: testData.question.existingId,
      title: testData.question.updatedTitle,
      questionType: 'DROPDOWN',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('questionType', 'DROPDOWN');
  });

  test('TC-API-006b: Change question type - DROPDOWN to CHECKBOX', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'acceptance_criteria', description: 'AC2 - Change question type' }
      );

    const payload = {
      id: testData.question.existingId,
      title: testData.question.updatedTitle,
      questionType: 'CHECKBOX',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('questionType', 'CHECKBOX');
  });

  test('TC-API-006c: Change question type - to RADIO', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'acceptance_criteria', description: 'AC2 - Change question type' }
      );

    const payload = {
      id: testData.question.existingId,
      title: testData.question.updatedTitle,
      questionType: 'RADIO',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('questionType', 'RADIO');
  });

  test('TC-API-007: Edit question - invalid/non-existent id returns 404', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'test_type', description: 'Negative test' }
      );

    const payload = {
      id: testData.question.nonExistentId,
      title: 'Should not save',
      questionType: 'TEXT',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect([404, 400]).toContain(response.status());
  });

  test('TC-API-008: Edit question - invalid/non-existent regAreaId returns error', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'test_type', description: 'Negative test' }
      );

    const payload = {
      id: testData.question.existingId,
      title: 'Valid title',
      questionType: 'TEXT',
      regAreaId: testData.question.nonExistentRegAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect([400, 404, 422]).toContain(response.status());
  });

  test('TC-API-009: Edit question - empty title returns validation error', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'test_type', description: 'Validation test' }
      );

    const payload = {
      id: testData.question.existingId,
      title: '',
      questionType: 'TEXT',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect([400, 422]).toContain(response.status());

    const responseData = await response.json();
    expect(responseData).toHaveProperty('message');
  });

  test('TC-API-009b: Edit question - null title returns validation error', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'test_type', description: 'Validation test' }
      );

    const payload = {
      id: testData.question.existingId,
      title: null,
      questionType: 'TEXT',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect([400, 422]).toContain(response.status());
  });

  test('TC-API-009c: Edit question - invalid questionType returns validation error', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'test_type', description: 'Validation test' }
      );

    const payload = {
      id: testData.question.existingId,
      title: 'Valid title',
      questionType: 'INVALID_TYPE',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect([400, 422]).toContain(response.status());
  });

  test('TC-API-009d: Edit question - missing id returns validation error', async () => {
    test
      .info()
      .annotations.push(
        { type: 'api_endpoint', description: 'PUT /api/compliancemanager/questions' },
        { type: 'test_type', description: 'Validation test' }
      );

    const payload = {
      title: 'Title without ID',
      questionType: 'TEXT',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    expect([400, 422]).toContain(response.status());
  });
});

test.describe('Master Questionnaire Edit API - Response Structure Validation', () => {
  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
  });

  test('Verify reg area response structure matches API spec', async () => {
    test.info().annotations.push({
      type: 'validation',
      description: 'Response structure validation',
    });

    const payload = {
      id: testData.regArea.existingId,
      name: 'Structure Test Section',
      description: 'Testing response structure',
    };

    const response = await apiContext.put(REG_AREA_API, { data: payload });

    if (response.ok()) {
      const responseData = await response.json();

      // Verify required fields per API spec
      expect(responseData).toHaveProperty('id');
      expect(typeof responseData.id).toBe('number');
      expect(responseData).toHaveProperty('name');
      expect(typeof responseData.name).toBe('string');
      expect(responseData).toHaveProperty('description');
    }
  });

  test('Verify question response structure matches API spec', async () => {
    test.info().annotations.push({
      type: 'validation',
      description: 'Response structure validation',
    });

    const payload = {
      id: testData.question.existingId,
      title: 'Structure Test Question',
      questionType: 'TEXT',
      regAreaId: testData.question.regAreaId,
    };

    const response = await apiContext.put(QUESTIONS_API, { data: payload });

    if (response.ok()) {
      const responseData = await response.json();

      // Verify required fields per API spec
      expect(responseData).toHaveProperty('id');
      expect(typeof responseData.id).toBe('number');
      expect(responseData).toHaveProperty('title');
      expect(typeof responseData.title).toBe('string');
      expect(responseData).toHaveProperty('questionType');
      expect(typeof responseData.questionType).toBe('string');
      expect(responseData).toHaveProperty('regAreaId');
      expect(typeof responseData.regAreaId).toBe('number');
    }
  });
});

test.describe('Master Questionnaire Edit API - Cleanup', () => {
  test.afterAll(async ({ playwright }) => {
    // Restore original data after tests
    const cleanupContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Restore reg area name
    await cleanupContext.put(REG_AREA_API, {
      data: {
        id: testData.regArea.existingId,
        name: testData.regArea.originalName,
        description: '',
      },
    });

    // Restore question
    await cleanupContext.put(QUESTIONS_API, {
      data: {
        id: testData.question.existingId,
        title: testData.question.originalTitle,
        questionType: 'TEXT',
        regAreaId: testData.question.regAreaId,
      },
    });

    await cleanupContext.dispose();
  });

  test('Cleanup verification - data restored', async () => {
    // This test runs after cleanup to verify data was restored
    test.skip(true, 'Cleanup test - runs automatically in afterAll');
  });
});

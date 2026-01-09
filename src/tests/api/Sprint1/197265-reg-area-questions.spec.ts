/**
 * @fileoverview API Tests for Story 197265 - Master questionnaire - Create reg area and questions
 * @description Tests for RegArea and Questions CRUD operations
 * @story 197265 - Master questionnaire - Create reg area and questions: EY Super Admin (Backend)
 *
 * Acceptance Criteria:
 * - Create a new section with a name
 * - Add a manual question to a section
 * - Question text: 3 to 500 characters, special characters allowed
 * - Question types: text, yes/no
 */

import { test, expect } from '../../fixtures/advancedFixtures';
import { faker } from '@faker-js/faker';
import Log from '../../../lib/utils/Log';

const BASE_PATH = '/api/compliancemanager';

// Test data helpers
const generateRegAreaName = (): string => {
  return `RegArea_${faker.company.buzzNoun()}_${Date.now()}`;
};

const generateQuestionText = (length: number = 50): string => {
  if (length <= 10) {
    return faker.lorem.word().substring(0, length);
  }
  return faker.lorem.sentence().substring(0, length);
};

test.describe('Story 197265 - RegArea and Questions API Tests @api', () => {
  let createdRegAreaId: number | null = null;
  let createdQuestionId: number | null = null;

  test.afterEach(async ({ authenticatedApi }) => {
    // Cleanup created resources
    if (createdQuestionId) {
      try {
        await authenticatedApi.delete(`${BASE_PATH}/questions/${createdQuestionId}`);
        Log.info(`Cleaned up question: ${createdQuestionId}`);
      } catch (e) {
        Log.warn(`Failed to cleanup question: ${createdQuestionId}`);
      }
      createdQuestionId = null;
    }

    if (createdRegAreaId) {
      try {
        await authenticatedApi.delete(`${BASE_PATH}/reg-area/${createdRegAreaId}`);
        Log.info(`Cleaned up reg area: ${createdRegAreaId}`);
      } catch (e) {
        Log.warn(`Failed to cleanup reg area: ${createdRegAreaId}`);
      }
      createdRegAreaId = null;
    }
  });

  test.describe('RegArea API - POST /reg-area @smoke', () => {
    test('@api @smoke @ADO-202614 should create a new reg area with valid unique name', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /reg-area - Create with valid unique name');

      // Given valid reg area data
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: faker.lorem.sentence(),
      };

      // When creating the reg area
      const response = await authenticatedApi.post(`${BASE_PATH}/reg-area`, regAreaData);

      // Then should return 201 with created reg area
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe(regAreaData.name);
      expect(data.description).toBe(regAreaData.description);

      createdRegAreaId = data.id;
      Log.info(`Created reg area with ID: ${createdRegAreaId}`);
    });

    test('@api @regression @ADO-202615 should reject duplicate reg area name', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /reg-area - Duplicate name rejection');

      // Given an existing reg area
      const regAreaName = generateRegAreaName();
      const firstRegArea = {
        id: null,
        name: regAreaName,
        description: 'First reg area',
      };

      const firstResponse = await authenticatedApi.post(`${BASE_PATH}/reg-area`, firstRegArea);
      expect(firstResponse.status()).toBe(201);
      const firstData = await firstResponse.json();
      createdRegAreaId = firstData.id;

      // When attempting to create with same name
      const duplicateRegArea = {
        id: null,
        name: regAreaName,
        description: 'Duplicate reg area',
      };

      const response = await authenticatedApi.post(`${BASE_PATH}/reg-area`, duplicateRegArea);

      // Then should return error (400 or 409)
      expect([400, 409, 422]).toContain(response.status());
      Log.info(`Duplicate rejection returned status: ${response.status()}`);
    });

    test('@api @regression should reject reg area with empty name', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /reg-area - Empty name rejection');

      // Given reg area with empty name
      const invalidData = {
        id: null,
        name: '',
        description: 'Test description',
      };

      // When creating with empty name
      const response = await authenticatedApi.post(`${BASE_PATH}/reg-area`, invalidData);

      // Then should return validation error
      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe('RegArea API - GET /reg-area @smoke', () => {
    test('@api @smoke should fetch all reg areas', async ({ authenticatedApi }) => {
      Log.info('Testing GET /reg-area - Fetch all');

      // When fetching all reg areas
      const response = await authenticatedApi.get(`${BASE_PATH}/reg-area`);

      // Then should return 200 with array
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      Log.info(`Retrieved ${data.length} reg areas`);
    });
  });

  test.describe('Questions API - POST /questions @smoke', () => {
    test.beforeEach(async ({ authenticatedApi }) => {
      // Create a reg area for question tests
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test reg area for questions',
      };
      const response = await authenticatedApi.post(`${BASE_PATH}/reg-area`, regAreaData);
      const data = await response.json();
      createdRegAreaId = data.id;
      Log.info(`Created test reg area: ${createdRegAreaId}`);
    });

    test('@api @smoke @ADO-202616 should add valid manual text question to section', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /questions - Add valid text question');

      // Given valid question data
      const questionData = {
        id: null,
        title: generateQuestionText(50),
        questionType: 'TEXT',
        regAreaId: createdRegAreaId,
      };

      // When creating the question
      const response = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);

      // Then should return 201 with created question
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.title).toBe(questionData.title);
      expect(data.questionType).toBe('TEXT');
      expect(data.regAreaId).toBe(createdRegAreaId);

      createdQuestionId = data.id;
      Log.info(`Created question with ID: ${createdQuestionId}`);
    });

    test('@api @smoke @ADO-202617 should add valid yes/no question with special characters', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /questions - Add YES_NO question with special chars');

      // Given question with special characters
      const questionData = {
        id: null,
        title: `Is this compliant? (Yes/No) - ${faker.lorem.word()} @#$%`,
        questionType: 'YES_NO',
        regAreaId: createdRegAreaId,
      };

      // When creating the question
      const response = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);

      // Then should return 201
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.questionType).toBe('YES_NO');

      createdQuestionId = data.id;
    });

    test('@api @regression @ADO-202618 should accept question with minimum allowed length (3 characters)', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /questions - Minimum length (3 chars)');

      // Given question with exactly 3 characters
      const questionData = {
        id: null,
        title: 'ABC',
        questionType: 'TEXT',
        regAreaId: createdRegAreaId,
      };

      // When creating the question
      const response = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);

      // Then should return 201
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.title.length).toBe(3);

      createdQuestionId = data.id;
    });

    test('@api @regression @ADO-202619 should accept question with maximum allowed length (500 characters)', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /questions - Maximum length (500 chars)');

      // Given question with exactly 500 characters
      const questionText = 'A'.repeat(500);
      const questionData = {
        id: null,
        title: questionText,
        questionType: 'TEXT',
        regAreaId: createdRegAreaId,
      };

      // When creating the question
      const response = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);

      // Then should return 201
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.title.length).toBe(500);

      createdQuestionId = data.id;
    });

    test('@api @regression @ADO-202620 should reject question with too short text (<3 characters)', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /questions - Reject too short text');

      // Given question with only 2 characters
      const questionData = {
        id: null,
        title: 'AB',
        questionType: 'TEXT',
        regAreaId: createdRegAreaId,
      };

      // When creating the question
      const response = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);

      // Then should return validation error
      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-202621 should reject question with too long text (>500 characters)', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /questions - Reject too long text');

      // Given question with 501 characters
      const questionText = 'A'.repeat(501);
      const questionData = {
        id: null,
        title: questionText,
        questionType: 'TEXT',
        regAreaId: createdRegAreaId,
      };

      // When creating the question
      const response = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);

      // Then should return validation error
      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-202622 should reject question with unsupported type', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /questions - Reject unsupported type');

      // Given question with invalid type
      const questionData = {
        id: null,
        title: generateQuestionText(50),
        questionType: 'INVALID_TYPE',
        regAreaId: createdRegAreaId,
      };

      // When creating the question
      const response = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);

      // Then should return validation error
      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-202624 should reject question with non-existent reg area', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing POST /questions - Non-existent reg area');

      // Given question with non-existent reg area ID
      const questionData = {
        id: null,
        title: generateQuestionText(50),
        questionType: 'TEXT',
        regAreaId: 999999999,
      };

      // When creating the question
      const response = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);

      // Then should return error (404 or 400)
      expect([400, 404, 422]).toContain(response.status());
    });
  });

  test.describe('Questions API - GET /questions @smoke', () => {
    test('@api @smoke should fetch all questions', async ({ authenticatedApi }) => {
      Log.info('Testing GET /questions - Fetch all');

      // When fetching all questions
      const response = await authenticatedApi.get(`${BASE_PATH}/questions`);

      // Then should return 200 with array
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      Log.info(`Retrieved ${data.length} questions`);
    });

    test('@api @smoke should fetch questions by reg area ID', async ({ authenticatedApi }) => {
      Log.info('Testing GET /questions/{regAreaId}');

      // Given a reg area with a question
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test reg area',
      };
      const regAreaResponse = await authenticatedApi.post(`${BASE_PATH}/reg-area`, regAreaData);
      const regArea = await regAreaResponse.json();
      createdRegAreaId = regArea.id;

      const questionData = {
        id: null,
        title: generateQuestionText(50),
        questionType: 'TEXT',
        regAreaId: createdRegAreaId,
      };
      const questionResponse = await authenticatedApi.post(`${BASE_PATH}/questions`, questionData);
      const question = await questionResponse.json();
      createdQuestionId = question.id;

      // When fetching questions by reg area ID
      const response = await authenticatedApi.get(`${BASE_PATH}/questions/${createdRegAreaId}`);

      // Then should return 200 with questions for that reg area
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.some((q: { id: number }) => q.id === createdQuestionId)).toBe(true);
    });
  });
});

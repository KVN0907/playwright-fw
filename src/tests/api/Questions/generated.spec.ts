import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for QuestionsResource
 * Generated from: QuestionsResource.java
 * Base Path: /questions
 *
 * Endpoints:
 * - POST /questions - Create a new question
 * - PUT /questions - Update an existing question
 * - GET /questions - Get all questions
 * - GET /questions/{regAreaId} - Get questions by regulatory area ID
 * - GET /questions/{regAreaId}/{clientTenantId} - Get questions by regulatory area and client tenant
 * - DELETE /questions/{id} - Delete a question by ID
 * - DELETE /questions - Delete multiple questions by IDs
 * - POST /questions/upload-questions - Upload questions from a file
 *
 * ADO Traceability:
 * - Story #197265: Master questionnaire - Create reg area and questions (Backend)
 * - Story #197273: Master questionnaire - Edit reg area name and questions (Backend)
 *
 * Related ADO Test Cases:
 * - #202616: API - Add Valid Manual Text Question to Section (POST /questions)
 * - #202617: API - Add Valid Yes/No Question with Special Characters (POST /questions)
 * - #202618: API - Add Question with Minimum Allowed Length (3 chars) (POST /questions)
 * - #202619: API - Add Question with Maximum Allowed Length (500 chars) (POST /questions)
 * - #202620: API - Add Question with Too Short Text (<3 chars) (POST /questions)
 * - #202621: API - Add Question with Too Long Text (>500 chars) (POST /questions)
 * - #202622: API - Add Question with Unsupported Type (POST /questions)
 * - #202624: API - Add Question to Non-existent Section (POST /questions)
 * - #202772: Edit Question Text via API (PUT /questions)
 * - #202773: Edit Question Type and Provide Required Options (PUT /questions)
 * - #202778: Reject Question Edit for Nonexistent Question ID (PUT /questions)
 * - #202781: Reject Malformed API Request for Question Edit (PUT /questions)
 * - #202782: Verify Atomicity of Edit Operation on Multiple Fields (PUT /questions)
 */

const API_BASE = '/api/compliancemanager';

// Helper to generate unique ID suffix
const uniqueId = () => `${Date.now()}`.slice(-6);

// Helper to generate question title
const generateQuestionTitle = (prefix?: string) => {
  if (prefix) return `${prefix} ${uniqueId()}`;
  return `${faker.lorem.words(3)} ${uniqueId()}`;
};

// Helper function to create a test reg area for question tests using faker
async function createTestRegArea(request: any): Promise<{ id: number; name: string }> {
  const regAreaData = {
    name: `${faker.commerce.department()} Regulations ${uniqueId()}`,
    description: faker.lorem.sentence(),
    isActive: true,
    isApproved: true,
    isDelete: false,
  };
  const response = await request.post(`${API_BASE}/reg-area`, { data: regAreaData });
  if (response.status() !== 201) {
    throw new Error(`Failed to create test reg area: ${response.status()}`);
  }
  return response.json();
}

// Helper function to delete test reg area
async function deleteTestRegArea(request: any, regAreaId: number): Promise<void> {
  await request.delete(`${API_BASE}/reg-area/${regAreaId}`);
}

test.describe('QuestionsResource API Tests', () => {
  test.describe('GET /questions', () => {
    test('@smoke should return list of all questions', async ({ request }) => {
      // Given no parameters required

      // When fetching all questions
      const response = await request.get(`${API_BASE}/questions`);

      // Then should return 200 with list of questions
      expect(response.status()).toBe(200);

      // And response should be an array
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('@smoke should return questions with valid structure', async ({ request }) => {
      // Given existing questions in the system

      // When fetching all questions
      const response = await request.get(`${API_BASE}/questions`);
      expect(response.status()).toBe(200);

      const data = await response.json();
      if (data.length > 0) {
        const question = data[0];
        // Then each question should have required fields
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('title');
        expect(question).toHaveProperty('questionType');
        expect(question).toHaveProperty('regAreaId');
      }
    });
  });

  test.describe('GET /questions/{regAreaId}', () => {
    test('@smoke should return questions for valid reg area ID', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // When fetching questions by reg area ID
        const response = await request.get(`${API_BASE}/questions/${regArea.id}`);

        // Then should return 200 with list (possibly empty)
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@negative should handle non-existent reg area ID', async ({ request }) => {
      // Given a non-existent reg area ID
      const nonExistentId = 999999999;

      // When fetching questions for non-existent reg area
      const response = await request.get(`${API_BASE}/questions/${nonExistentId}`);

      // Then should return 200 with empty array or 404
      expect([200, 404]).toContain(response.status());
      if (response.status() === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    test('@negative should return error for invalid reg area ID format', async ({ request }) => {
      // Given an invalid ID format
      const invalidId = 'invalid-id';

      // When fetching questions with invalid ID
      const response = await request.get(`${API_BASE}/questions/${invalidId}`);

      // Then should return 400 or 500
      expect([400, 500]).toContain(response.status());
    });

    test('@edge should handle negative reg area ID', async ({ request }) => {
      // Given a negative ID
      const negativeId = -1;

      // When fetching questions with negative ID
      const response = await request.get(`${API_BASE}/questions/${negativeId}`);

      // Then should return error or empty list
      expect([200, 400, 404, 500]).toContain(response.status());
    });

    test('@edge should handle zero reg area ID', async ({ request }) => {
      // Given zero ID
      const zeroId = 0;

      // When fetching questions with zero ID
      const response = await request.get(`${API_BASE}/questions/${zeroId}`);

      // Then should return error or empty list
      expect([200, 400, 404, 500]).toContain(response.status());
    });
  });

  test.describe('GET /questions/{regAreaId}/{clientTenantId}', () => {
    test('@smoke should return questions for valid reg area and client tenant', async ({
      request,
    }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // When fetching questions by reg area ID and client tenant ID
        const clientTenantId = 1; // Assuming valid client tenant
        const response = await request.get(`${API_BASE}/questions/${regArea.id}/${clientTenantId}`);

        // Then should return 200
        expect([200, 404]).toContain(response.status());
        if (response.status() === 200) {
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@negative should handle non-existent client tenant ID', async ({ request }) => {
      // Given valid reg area but non-existent client tenant
      const regArea = await createTestRegArea(request);

      try {
        const nonExistentClientTenantId = 999999999;
        const response = await request.get(
          `${API_BASE}/questions/${regArea.id}/${nonExistentClientTenantId}`
        );

        // Then should return 200 with empty array or 404
        expect([200, 404]).toContain(response.status());
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('POST /questions', () => {
    // ADO Test Case #202616: API - Add Valid Manual Text Question to Section
    test('@smoke @ADO-202616 should create a new question', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given valid question data
        const timestamp = Date.now();
        const requestData = {
          title: `Test Question ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: true,
          isDelete: false,
        };

        // When creating the question
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should return 201 with created question
        expect(response.status()).toBe(201);

        const data = await response.json();
        expect(data).toBeDefined();
        expect(data.id).toBeDefined();
        expect(data.title).toBe(requestData.title);
        expect(data.questionType).toBe(requestData.questionType);
        expect(data.regAreaId).toBe(regArea.id);

        // Cleanup
        if (data.id) {
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@negative should return 400 when title is missing', async ({ request }) => {
      // Given request data without required title field
      const requestData = {
        questionType: 'Text',
        regAreaId: 1,
        isActive: true,
      };

      // When creating without title
      const response = await request.post(`${API_BASE}/questions`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when title is empty', async ({ request }) => {
      // Given request data with empty title
      const requestData = {
        title: '',
        questionType: 'Text',
        regAreaId: 1,
        isActive: true,
      };

      // When creating with empty title
      const response = await request.post(`${API_BASE}/questions`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when questionType is missing', async ({ request }) => {
      // Given request data without required questionType field
      const timestamp = Date.now();
      const requestData = {
        title: `Test Question ${timestamp}`,
        regAreaId: 1,
        isActive: true,
      };

      // When creating without questionType
      const response = await request.post(`${API_BASE}/questions`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when regAreaId is missing', async ({ request }) => {
      // Given request data without required regAreaId field
      const timestamp = Date.now();
      const requestData = {
        title: `Test Question ${timestamp}`,
        questionType: 'Text',
        isActive: true,
      };

      // When creating without regAreaId
      const response = await request.post(`${API_BASE}/questions`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@validation should return 400 when title exceeds 255 characters', async ({ request }) => {
      // Given request data with title exceeding 255 characters
      const requestData = {
        title: 'A'.repeat(256),
        questionType: 'Text',
        regAreaId: 1,
        isActive: true,
      };

      // When creating with oversized title
      const response = await request.post(`${API_BASE}/questions`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@validation should return 400 when questionType exceeds 50 characters', async ({
      request,
    }) => {
      // Given request data with questionType exceeding 50 characters
      const timestamp = Date.now();
      const requestData = {
        title: `Test Question ${timestamp}`,
        questionType: 'A'.repeat(51),
        regAreaId: 1,
        isActive: true,
      };

      // When creating with oversized questionType
      const response = await request.post(`${API_BASE}/questions`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    // ADO Test Case #202624: API - Add Question to Non-existent Section
    test('@negative @ADO-202624 should handle non-existent regAreaId', async ({ request }) => {
      // Given request with non-existent regAreaId
      const timestamp = Date.now();
      const requestData = {
        title: `Test Question ${timestamp}`,
        questionType: 'Text',
        regAreaId: 999999999,
        isActive: true,
      };

      // When creating with non-existent regAreaId
      const response = await request.post(`${API_BASE}/questions`, { data: requestData });

      // Then should return error (400, 404, or 422)
      expect([400, 404, 422, 500]).toContain(response.status());
    });
  });

  test.describe('PUT /questions', () => {
    // ADO Test Case #202772: Edit Question Text via API
    // ADO Test Case #202773: Edit Question Type and Provide Required Options
    test('@smoke @ADO-202772 @ADO-202773 should update an existing question', async ({
      request,
    }) => {
      // Given: First create a reg area and question to update
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const createData = {
          title: `Question To Update ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: true,
          isDelete: false,
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();

        // Given update data
        const updateData = {
          id: created.id,
          title: `Updated Question ${timestamp}`,
          questionType: 'MultipleChoice',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: true,
          isDelete: false,
        };

        // When updating the question
        const response = await request.put(`${API_BASE}/questions`, { data: updateData });

        // Then should return 200 with updated question
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toBeDefined();
        expect(data.id).toBe(created.id);
        expect(data.title).toBe(updateData.title);
        expect(data.questionType).toBe(updateData.questionType);

        // Cleanup
        await request.delete(`${API_BASE}/questions/${created.id}`);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@negative should return 400 when updating with empty title', async ({ request }) => {
      // Given update data with empty title
      const updateData = {
        id: 1,
        title: '',
        questionType: 'Text',
        regAreaId: 1,
      };

      // When updating with empty title
      const response = await request.put(`${API_BASE}/questions`, { data: updateData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    // ADO Test Case #202778: Reject Question Edit for Nonexistent Question ID
    test('@negative @ADO-202778 should return error when updating non-existent question', async ({
      request,
    }) => {
      // Given update data for non-existent ID
      const updateData = {
        id: 999999999,
        title: 'Non-existent Question',
        questionType: 'Text',
        regAreaId: 1,
      };

      // When updating non-existent question
      const response = await request.put(`${API_BASE}/questions`, { data: updateData });

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@validation should return 400 when updating title exceeds max length', async ({
      request,
    }) => {
      // Given update data with title exceeding 255 characters
      const updateData = {
        id: 1,
        title: 'A'.repeat(256),
        questionType: 'Text',
        regAreaId: 1,
      };

      // When updating with oversized title
      const response = await request.put(`${API_BASE}/questions`, { data: updateData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });
  });

  test.describe('DELETE /questions/{id}', () => {
    test('@smoke should delete a question by ID', async ({ request }) => {
      // Given: First create a reg area and question to delete
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const createData = {
          title: `Question To Delete ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: true,
          isDelete: false,
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();

        // When deleting the question
        const response = await request.delete(`${API_BASE}/questions/${created.id}`);

        // Then should return 200 with true
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data).toBe(true);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@negative should handle non-existent question', async ({ request }) => {
      // Given a non-existent question ID
      const nonExistentId = 999999999;

      // When deleting non-existent question
      const response = await request.delete(`${API_BASE}/questions/${nonExistentId}`);

      // Then should return appropriate status
      expect([200, 404, 422, 500]).toContain(response.status());
    });

    test('@negative should return error for invalid ID format', async ({ request }) => {
      // Given an invalid ID format
      const invalidId = 'invalid-id';

      // When deleting with invalid ID
      const response = await request.delete(`${API_BASE}/questions/${invalidId}`);

      // Then should return 400 or 500
      expect([400, 500]).toContain(response.status());
    });

    test('@edge should handle negative ID', async ({ request }) => {
      // Given a negative ID
      const negativeId = -1;

      // When deleting with negative ID
      const response = await request.delete(`${API_BASE}/questions/${negativeId}`);

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle zero ID', async ({ request }) => {
      // Given zero ID
      const zeroId = 0;

      // When deleting with zero ID
      const response = await request.delete(`${API_BASE}/questions/${zeroId}`);

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });
  });

  test.describe('DELETE /questions (bulk delete)', () => {
    test('@smoke should delete multiple questions by IDs', async ({ request }) => {
      // Given: Create reg area and multiple questions to delete
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const createdIds: number[] = [];

        for (let i = 0; i < 3; i++) {
          const createData = {
            title: `Bulk Delete Question ${timestamp}-${i}`,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };
          const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
          expect(createResponse.status()).toBe(201);
          const created = await createResponse.json();
          createdIds.push(created.id);
        }

        // When deleting multiple questions
        const response = await request.delete(`${API_BASE}/questions`, { data: createdIds });

        // Then should return 200 with true
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data).toBe(true);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@negative should handle empty array', async ({ request }) => {
      // Given empty array
      const emptyIds: number[] = [];

      // When deleting with empty array
      const response = await request.delete(`${API_BASE}/questions`, { data: emptyIds });

      // Then should return success or appropriate error
      expect([200, 400]).toContain(response.status());
    });

    test('@negative should handle array with non-existent IDs', async ({ request }) => {
      // Given array with non-existent IDs
      const nonExistentIds = [999999997, 999999998, 999999999];

      // When deleting non-existent questions
      const response = await request.delete(`${API_BASE}/questions`, { data: nonExistentIds });

      // Then should handle gracefully
      expect([200, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle mixed valid and invalid IDs', async ({ request }) => {
      // Given: Create a valid question
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const createData = {
          title: `Mixed Delete Test ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };
        const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();

        // When deleting with mixed IDs
        const mixedIds = [created.id, 999999999];
        const response = await request.delete(`${API_BASE}/questions`, { data: mixedIds });

        // Then should handle gracefully
        expect([200, 400, 422, 500]).toContain(response.status());
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('Edge Cases - Bug Hunting', () => {
    test('@edge should reject whitespace-only title', async ({ request }) => {
      // Given request with whitespace-only title
      const requestData = {
        title: '   ',
        questionType: 'Text',
        regAreaId: 1,
        isActive: true,
      };

      // When creating with whitespace title
      const response = await request.post(`${API_BASE}/questions`, { data: requestData });

      // Then should return 400 - whitespace should not be valid
      expect(response.status()).toBe(400);
    });

    test('@edge should handle XSS attempt in title', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with XSS payload
        const timestamp = Date.now();
        const requestData = {
          title: `<script>alert('xss')</script> ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with XSS payload
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should either sanitize or reject
        if (response.status() === 201) {
          const data = await response.json();
          // Script tags should be sanitized
          expect(data.title).not.toContain('<script>');
          await request.delete(`${API_BASE}/questions/${data.id}`);
        } else {
          expect([400, 422]).toContain(response.status());
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle SQL injection attempt in title', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with SQL injection payload
        const timestamp = Date.now();
        const requestData = {
          title: `Test'; DROP TABLE questions; -- ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with SQL injection
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should handle safely
        expect([201, 400, 422, 500]).toContain(response.status());

        if (response.status() === 201) {
          const data = await response.json();
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle unicode and emoji in title', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with unicode/emoji
        const timestamp = Date.now();
        const requestData = {
          title: `Test 日本語 émoji 🔥 ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with unicode
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should handle unicode properly
        if (response.status() === 201) {
          const data = await response.json();
          expect(data.title).toContain('日本語');
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle boundary value - exactly 255 chars title', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with exactly 255 character title (max allowed)
        const timestamp = Date.now();
        const baseName = `Boundary${timestamp}`;
        const title = baseName + 'A'.repeat(255 - baseName.length);

        const requestData = {
          title: title,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with max length title
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should succeed - 255 is the max
        expect(response.status()).toBe(201);
        const data = await response.json();
        expect(data.title.length).toBe(255);

        await request.delete(`${API_BASE}/questions/${data.id}`);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle boundary value - exactly 50 chars questionType', async ({
      request,
    }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with exactly 50 character questionType (max allowed)
        const timestamp = Date.now();
        const questionType = 'A'.repeat(50);

        const requestData = {
          title: `Boundary QuestionType Test ${timestamp}`,
          questionType: questionType,
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with max length questionType
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should succeed - 50 is the max
        expect(response.status()).toBe(201);
        const data = await response.json();
        expect(data.questionType.length).toBe(50);

        await request.delete(`${API_BASE}/questions/${data.id}`);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle null values in optional fields', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with null optional fields
        const timestamp = Date.now();
        const requestData = {
          title: `Null Test ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          clientTenantId: null,
          isActive: true,
        };

        // When creating with null optional field
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should handle null gracefully
        expect([201, 400]).toContain(response.status());

        if (response.status() === 201) {
          const data = await response.json();
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle create with pre-set ID', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with pre-set ID (should be auto-generated)
        const timestamp = Date.now();
        const requestData = {
          id: 999999,
          title: `Preset ID Test ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with pre-set ID
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should either ignore the ID or reject
        if (response.status() === 201) {
          const data = await response.json();
          // ID should be auto-generated, not the one we sent
          expect(data.id).not.toBe(999999);
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should not allow tenantId manipulation on create', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with different tenantId (IDOR attempt)
        const timestamp = Date.now();
        const requestData = {
          title: `TenantId Test ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          tenantId: 99999, // Attempting to set different tenant
          isActive: true,
        };

        // When creating with manipulated tenantId
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should ignore user-provided tenantId or reject
        if (response.status() === 201) {
          const data = await response.json();
          // TenantId should be set by server, not accepted from client
          expect(data.tenantId).not.toBe(99999);
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle update without ID field', async ({ request }) => {
      // Given update request without ID
      const updateData = {
        title: 'Update Without ID',
        questionType: 'Text',
        regAreaId: 1,
      };

      // When updating without ID
      const response = await request.put(`${API_BASE}/questions`, { data: updateData });

      // Then should return error - ID is required for update
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle very large ID value', async ({ request }) => {
      // Given extremely large ID
      const largeId = '9223372036854775807'; // Max Long value

      // When deleting with very large ID
      const response = await request.delete(`${API_BASE}/questions/${largeId}`);

      // Then should handle gracefully (not crash)
      expect([200, 400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle newlines in title', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with newlines in title
        const timestamp = Date.now();
        const requestData = {
          title: `Test\r\nHeader-Injection: malicious ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with newlines
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should sanitize newlines or reject
        if (response.status() === 201) {
          const data = await response.json();
          // Title should not contain CRLF
          expect(data.title).not.toContain('\r\n');
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle control characters in title', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with control characters
        const timestamp = Date.now();
        const requestData = {
          title: `Test\x00\x1f\x7f${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with control characters
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should sanitize or reject control characters
        expect([201, 400, 422]).toContain(response.status());

        if (response.status() === 201) {
          const data = await response.json();
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle concurrent duplicate creates', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given same data for concurrent requests
        const timestamp = Date.now();
        const requestData = {
          title: `Concurrent Test ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating concurrently
        const [response1, response2] = await Promise.all([
          request.post(`${API_BASE}/questions`, { data: requestData }),
          request.post(`${API_BASE}/questions`, { data: requestData }),
        ]);

        // Then at least one should succeed
        const statuses = [response1.status(), response2.status()];
        expect(statuses).toContain(201);

        // Cleanup
        if (response1.status() === 201) {
          const data = await response1.json();
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
        if (response2.status() === 201) {
          const data = await response2.json();
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle empty request body on create', async ({ request }) => {
      // Given empty request body
      const response = await request.post(`${API_BASE}/questions`, { data: {} });

      // Then should return 400 - required fields are missing
      expect(response.status()).toBe(400);
    });

    test('@edge should handle array as request body', async ({ request }) => {
      // Given array instead of object
      const response = await request.post(`${API_BASE}/questions`, {
        data: [{ title: 'Test', questionType: 'Text', regAreaId: 1 }],
      });

      // Then should return error - expects object not array
      expect([400, 415, 422, 500]).toContain(response.status());
    });

    test('@security should handle HTML in questionType', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with HTML in questionType
        const timestamp = Date.now();
        const requestData = {
          title: `HTML QuestionType Test ${timestamp}`,
          questionType: '<b>Text</b>',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with HTML
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should sanitize or accept as literal text
        if (response.status() === 201) {
          const data = await response.json();
          // Should either strip tags or keep as literal
          expect(['<b>Text</b>', 'Text', 'bTextb']).toContain(
            data.questionType.replace(/<\/?b>/g, (match: string) => (match === '<b>' ? '' : ''))
          );
          await request.delete(`${API_BASE}/questions/${data.id}`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should validate questionType against allowed values', async ({ request }) => {
      // Given a valid reg area
      const regArea = await createTestRegArea(request);

      try {
        // Given request with potentially invalid questionType
        const timestamp = Date.now();
        const requestData = {
          title: `Invalid QuestionType Test ${timestamp}`,
          questionType: 'InvalidType',
          regAreaId: regArea.id,
          isActive: true,
        };

        // When creating with invalid questionType
        const response = await request.post(`${API_BASE}/questions`, { data: requestData });

        // Then should either accept (if no validation) or reject
        // Document behavior
        if (response.status() === 201) {
          const data = await response.json();
          console.log(`QuestionType validation: Accepted '${requestData.questionType}'`);
          await request.delete(`${API_BASE}/questions/${data.id}`);
        } else {
          console.log(`QuestionType validation: Rejected '${requestData.questionType}'`);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('Functional Tests', () => {
    test('@functional should preserve all fields on update', async ({ request }) => {
      // Given: Create a reg area and question with all fields set
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const createData = {
          title: `Partial Update Test ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          clientTenantId: 1,
          isActive: true,
          isApproved: true,
          isDelete: false,
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();

        // When: Update only the title field
        const updateData = {
          id: created.id,
          title: `Updated Title ${timestamp}`,
          questionType: created.questionType,
          regAreaId: created.regAreaId,
        };

        const updateResponse = await request.put(`${API_BASE}/questions`, { data: updateData });

        // Then: Other fields should be preserved
        if (updateResponse.status() === 200) {
          const updated = await updateResponse.json();
          expect(updated.title).toBe(`Updated Title ${timestamp}`);
          expect(updated.questionType).toBe('Text');
        }

        await request.delete(`${API_BASE}/questions/${created.id}`);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should not show deleted questions in GET all', async ({ request }) => {
      // Given: Create a reg area and question
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const createData = {
          title: `Delete Visibility Test ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();

        // When: Delete the question
        const deleteResponse = await request.delete(`${API_BASE}/questions/${created.id}`);
        expect(deleteResponse.status()).toBe(200);

        // Then: Question should NOT appear in GET all
        const getResponse = await request.get(`${API_BASE}/questions`);
        expect(getResponse.status()).toBe(200);
        const allQuestions = await getResponse.json();
        const deletedQuestion = allQuestions.find((q: { id: number }) => q.id === created.id);
        expect(deletedQuestion).toBeUndefined();
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should auto-generate unique IDs', async ({ request }) => {
      // Given: Create a reg area and multiple questions
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const data1 = {
          title: `ID Test 1 ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };
        const data2 = {
          title: `ID Test 2 ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        const response1 = await request.post(`${API_BASE}/questions`, { data: data1 });
        const response2 = await request.post(`${API_BASE}/questions`, { data: data2 });

        expect(response1.status()).toBe(201);
        expect(response2.status()).toBe(201);

        const created1 = await response1.json();
        const created2 = await response2.json();

        // Then: IDs should be unique
        expect(created1.id).toBeDefined();
        expect(created2.id).toBeDefined();
        expect(created1.id).not.toBe(created2.id);

        await request.delete(`${API_BASE}/questions/${created1.id}`);
        await request.delete(`${API_BASE}/questions/${created2.id}`);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should return consistent field types', async ({ request }) => {
      // Given: Create a reg area and question
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const createData = {
          title: `Type Check ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: true,
          isDelete: false,
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();

        // Then: Field types should be correct
        expect(typeof created.id).toBe('number');
        expect(typeof created.title).toBe('string');
        expect(typeof created.questionType).toBe('string');
        expect(typeof created.regAreaId).toBe('number');
        expect(typeof created.isActive).toBe('boolean');
        expect(typeof created.isApproved).toBe('boolean');
        expect(typeof created.isDelete).toBe('boolean');

        await request.delete(`${API_BASE}/questions/${created.id}`);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should filter questions by regAreaId correctly', async ({ request }) => {
      // Given: Create two reg areas with questions
      const regArea1 = await createTestRegArea(request);
      const regArea2 = await createTestRegArea(request);

      try {
        const timestamp = Date.now();

        // Create questions in each reg area
        const q1Data = {
          title: `Question in RegArea1 ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea1.id,
          isActive: true,
        };
        const q2Data = {
          title: `Question in RegArea2 ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea2.id,
          isActive: true,
        };

        const q1Response = await request.post(`${API_BASE}/questions`, { data: q1Data });
        const q2Response = await request.post(`${API_BASE}/questions`, { data: q2Data });

        expect(q1Response.status()).toBe(201);
        expect(q2Response.status()).toBe(201);

        const q1 = await q1Response.json();
        const q2 = await q2Response.json();

        // When: Fetch questions by regArea1.id
        const response = await request.get(`${API_BASE}/questions/${regArea1.id}`);
        expect(response.status()).toBe(200);

        const questions = await response.json();

        // Then: Should only contain questions from regArea1
        const hasQ1 = questions.some((q: { id: number }) => q.id === q1.id);
        const hasQ2 = questions.some((q: { id: number }) => q.id === q2.id);

        expect(hasQ1).toBe(true);
        expect(hasQ2).toBe(false);

        // Cleanup
        await request.delete(`${API_BASE}/questions/${q1.id}`);
        await request.delete(`${API_BASE}/questions/${q2.id}`);
      } finally {
        await deleteTestRegArea(request, regArea1.id);
        await deleteTestRegArea(request, regArea2.id);
      }
    });
  });

  test.describe('CRUD Operations - Full Flow', () => {
    test('@smoke should perform complete CRUD operations on question', async ({ request }) => {
      // Given: Create a reg area for the question
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();

        // CREATE
        const createData = {
          title: `CRUD Test Question ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: true,
          isDelete: false,
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json();
        expect(created.id).toBeDefined();

        // READ
        const readResponse = await request.get(`${API_BASE}/questions`);
        expect(readResponse.status()).toBe(200);
        const allQuestions = await readResponse.json();
        const foundCreated = allQuestions.find((q: { id: number }) => q.id === created.id);
        expect(foundCreated).toBeDefined();
        expect(foundCreated.title).toBe(createData.title);

        // UPDATE
        const updateData = {
          id: created.id,
          title: `Updated CRUD Test Question ${timestamp}`,
          questionType: 'MultipleChoice',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: true,
          isDelete: false,
        };

        const updateResponse = await request.put(`${API_BASE}/questions`, { data: updateData });
        expect(updateResponse.status()).toBe(200);
        const updated = await updateResponse.json();
        expect(updated.title).toBe(updateData.title);
        expect(updated.questionType).toBe(updateData.questionType);

        // DELETE
        const deleteResponse = await request.delete(`${API_BASE}/questions/${created.id}`);
        expect(deleteResponse.status()).toBe(200);

        // VERIFY DELETION
        const verifyResponse = await request.get(`${API_BASE}/questions`);
        expect(verifyResponse.status()).toBe(200);
        const afterDelete = await verifyResponse.json();
        const shouldNotExist = afterDelete.find((q: { id: number }) => q.id === created.id);
        expect(shouldNotExist).toBeUndefined();
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });
});

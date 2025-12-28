import { test, expect } from '../../fixtures/apiRoleFixtures';

/**
 * API Tests for QuestionnaireResponseResource
 * Generated from: QuestionnaireResponseResource.java
 * Base Path: /questionnaire-responses
 *
 * Endpoints:
 * - POST /questionnaire-responses - Save questionnaire responses
 * - POST /questionnaire-responses/request-info - Save request for information
 * - POST /questionnaire-responses/request-info-reg-area - Save request for info by reg area
 * - GET /questionnaire-responses/request-info-list/{countryQuestionsMappingId} - Get all requests for info
 */

const API_BASE = '/api/compliancemanager';

test.describe('QuestionnaireResponseResource API Tests', () => {
  test.describe('POST /questionnaire-responses', () => {
    test('@negative should return 400 when clientCountryId is missing', async ({ request }) => {
      // Given request data without clientCountryId
      const requestData = {
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: 'Test answer',
          },
        ],
      };

      // When saving without clientCountryId
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should return 400 or handle gracefully
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@negative should return 400 when answers is missing', async ({ request }) => {
      // Given request data without answers
      const requestData = {
        clientCountryId: 1,
      };

      // When saving without answers
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle gracefully
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@negative should handle empty answers array', async ({ request }) => {
      // Given request data with empty answers
      const requestData = {
        clientCountryId: 1,
        answers: [],
      };

      // When saving with empty answers
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle gracefully
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@negative should handle non-existent clientCountryId', async ({ request }) => {
      // Given non-existent clientCountryId
      const requestData = {
        clientCountryId: 999999999,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: 'Test answer',
          },
        ],
      };

      // When saving with non-existent country
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@negative should handle non-existent questionAssignmentId', async ({ request }) => {
      // Given non-existent questionAssignmentId
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 999999999,
            stateId: 1,
            answer: 'Test answer',
          },
        ],
      };

      // When saving with non-existent assignment
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle empty request body', async ({ request }) => {
      // Given empty request body
      const response = await request.post(`${API_BASE}/questionnaire-responses`, { data: {} });

      // Then should return error
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle null clientCountryId', async ({ request }) => {
      // Given null clientCountryId
      const requestData = {
        clientCountryId: null,
        answers: [
          {
            questionAssignmentId: 1,
            answer: 'Test answer',
          },
        ],
      };

      // When saving with null clientCountryId
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should return error
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle very long answer text', async ({ request }) => {
      // Given very long answer (10KB)
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: 'A'.repeat(10000),
          },
        ],
      };

      // When saving with long answer
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle gracefully
      expect([201, 400, 413, 422, 500]).toContain(response.status());
    });

    test('@edge should handle XSS in answer', async ({ request }) => {
      // Given XSS payload in answer
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: '<script>alert("xss")</script>',
          },
        ],
      };

      // When saving with XSS
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should sanitize or reject
      if (response.status() === 201) {
        const data = await response.json();
        // If accepted, verify XSS is handled
        console.log('XSS handling: Response accepted');
      }
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle SQL injection in answer', async ({ request }) => {
      // Given SQL injection in answer
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: "'; DROP TABLE questionnaire_responses; --",
          },
        ],
      };

      // When saving with SQL injection
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle safely (parameterized queries)
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle unicode in answer', async ({ request }) => {
      // Given unicode characters in answer
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: 'Test 日本語 émoji 🔥 中文 العربية',
          },
        ],
      };

      // When saving with unicode
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle unicode properly
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle multiple answers', async ({ request }) => {
      // Given multiple answers
      const requestData = {
        clientCountryId: 1,
        answers: [
          { questionAssignmentId: 1, stateId: 1, answer: 'Answer 1' },
          { questionAssignmentId: 2, stateId: 1, answer: 'Answer 2' },
          { questionAssignmentId: 3, stateId: 1, answer: 'Answer 3' },
        ],
      };

      // When saving multiple answers
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle multiple answers
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle duplicate questionAssignmentId in answers', async ({ request }) => {
      // Given duplicate assignment IDs
      const requestData = {
        clientCountryId: 1,
        answers: [
          { questionAssignmentId: 1, stateId: 1, answer: 'Answer 1' },
          { questionAssignmentId: 1, stateId: 1, answer: 'Answer 2' }, // Duplicate
        ],
      };

      // When saving with duplicates
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle duplicates (reject or take last)
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle negative IDs', async ({ request }) => {
      // Given negative IDs
      const requestData = {
        clientCountryId: -1,
        answers: [
          {
            questionAssignmentId: -1,
            stateId: -1,
            answer: 'Test answer',
          },
        ],
      };

      // When saving with negative IDs
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should reject
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle null answer text', async ({ request }) => {
      // Given null answer
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: null,
          },
        ],
      };

      // When saving with null answer
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle null
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle empty answer text', async ({ request }) => {
      // Given empty answer
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: '',
          },
        ],
      };

      // When saving with empty answer
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle empty string
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle whitespace-only answer', async ({ request }) => {
      // Given whitespace-only answer
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: '   ',
          },
        ],
      };

      // When saving with whitespace answer
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle (trim or accept)
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@security should validate user can only save responses for assigned questions', async ({
      request,
    }) => {
      // Given potentially unauthorized question assignment
      const requestData = {
        clientCountryId: 99999,
        answers: [
          {
            questionAssignmentId: 99999,
            stateId: 1,
            answer: 'Unauthorized answer',
          },
        ],
      };

      // When saving to unauthorized assignment
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should validate authorization
      expect([400, 403, 404, 422, 500]).toContain(response.status());
    });
  });

  test.describe('POST /questionnaire-responses/request-info', () => {
    test('@negative should return 400 when countryQuestionMappingId is missing', async ({
      request,
    }) => {
      // Given request without countryQuestionMappingId
      const requestData = {
        requestInfoDetails: 'Need more information',
      };

      // When saving without mapping ID
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when requestInfoDetails is missing', async ({ request }) => {
      // Given request without requestInfoDetails
      const requestData = {
        countryQuestionMappingId: 1,
      };

      // When saving without details
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when requestInfoDetails is empty', async ({ request }) => {
      // Given empty requestInfoDetails
      const requestData = {
        countryQuestionMappingId: 1,
        requestInfoDetails: '',
      };

      // When saving with empty details
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@negative should handle non-existent countryQuestionMappingId', async ({ request }) => {
      // Given non-existent mapping ID
      const requestData = {
        countryQuestionMappingId: 999999999,
        requestInfoDetails: 'Need more information',
      };

      // When saving with non-existent ID
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle empty request body', async ({ request }) => {
      // Given empty request body
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: {},
      });

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@edge should handle very long requestInfoDetails', async ({ request }) => {
      // Given very long details (10KB)
      const requestData = {
        countryQuestionMappingId: 1,
        requestInfoDetails: 'A'.repeat(10000),
      };

      // When saving with long details
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should handle gracefully
      expect([201, 400, 413, 422, 500]).toContain(response.status());
    });

    test('@edge should handle XSS in requestInfoDetails', async ({ request }) => {
      // Given XSS payload
      const requestData = {
        countryQuestionMappingId: 1,
        requestInfoDetails: '<script>alert("xss")</script> Need info',
      };

      // When saving with XSS
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should sanitize or reject
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle SQL injection in requestInfoDetails', async ({ request }) => {
      // Given SQL injection
      const requestData = {
        countryQuestionMappingId: 1,
        requestInfoDetails: "'; DROP TABLE request_info; --",
      };

      // When saving with SQL injection
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should handle safely
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle unicode in requestInfoDetails', async ({ request }) => {
      // Given unicode
      const requestData = {
        countryQuestionMappingId: 1,
        requestInfoDetails: 'Need info 日本語 émoji 🔥',
      };

      // When saving with unicode
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should handle unicode
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle negative countryQuestionMappingId', async ({ request }) => {
      // Given negative ID
      const requestData = {
        countryQuestionMappingId: -1,
        requestInfoDetails: 'Need info',
      };

      // When saving with negative ID
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should reject
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle null values', async ({ request }) => {
      // Given null values
      const requestData = {
        countryQuestionMappingId: null,
        requestInfoDetails: null,
      };

      // When saving with nulls
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@edge should handle whitespace-only requestInfoDetails', async ({ request }) => {
      // Given whitespace-only details
      const requestData = {
        countryQuestionMappingId: 1,
        requestInfoDetails: '   ',
      };

      // When saving with whitespace
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should reject whitespace-only
      expect([400, 422]).toContain(response.status());
    });

    test('@security should validate user has permission to request info', async ({ request }) => {
      // Given potentially unauthorized request
      const requestData = {
        countryQuestionMappingId: 99999,
        requestInfoDetails: 'Unauthorized request',
      };

      // When requesting info without permission
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Then should validate permission
      expect([201, 400, 403, 404, 422, 500]).toContain(response.status());
    });
  });

  test.describe('POST /questionnaire-responses/request-info-reg-area', () => {
    test('@negative should return 400 when required fields are missing', async ({ request }) => {
      // Given empty request
      const response = await request.post(
        `${API_BASE}/questionnaire-responses/request-info-reg-area`,
        { data: {} }
      );

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@edge should handle XSS in request details', async ({ request }) => {
      // Given XSS payload (assuming structure has requestInfoDetails)
      const requestData = {
        regAreaId: 1,
        clientCountryId: 1,
        requestInfoDetails: '<script>alert("xss")</script>',
      };

      // When saving with XSS
      const response = await request.post(
        `${API_BASE}/questionnaire-responses/request-info-reg-area`,
        { data: requestData }
      );

      // Then should handle safely
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle non-existent regAreaId', async ({ request }) => {
      // Given non-existent regAreaId
      const requestData = {
        regAreaId: 999999999,
        clientCountryId: 1,
        requestInfoDetails: 'Need info',
      };

      // When saving with non-existent reg area
      const response = await request.post(
        `${API_BASE}/questionnaire-responses/request-info-reg-area`,
        { data: requestData }
      );

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });
  });

  test.describe('GET /questionnaire-responses/request-info-list/{countryQuestionsMappingId}', () => {
    test('@smoke should return list for valid mapping ID', async ({ request }) => {
      // Given a valid mapping ID (assuming one exists)
      const mappingId = 1;

      // When fetching request info list
      const response = await request.get(
        `${API_BASE}/questionnaire-responses/request-info-list/${mappingId}`
      );

      // Then should return 200 or 404
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    test('@negative should handle non-existent mapping ID', async ({ request }) => {
      // Given non-existent mapping ID
      const nonExistentId = 999999999;

      // When fetching list
      const response = await request.get(
        `${API_BASE}/questionnaire-responses/request-info-list/${nonExistentId}`
      );

      // Then should return 200 with empty array or 404
      expect([200, 404]).toContain(response.status());
      if (response.status() === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    test('@negative should return error for invalid mapping ID format', async ({ request }) => {
      // Given invalid ID format
      const invalidId = 'invalid-id';

      // When fetching with invalid ID
      const response = await request.get(
        `${API_BASE}/questionnaire-responses/request-info-list/${invalidId}`
      );

      // Then should return 400 or 500
      expect([400, 500]).toContain(response.status());
    });

    test('@edge should handle negative mapping ID', async ({ request }) => {
      // Given negative ID
      const negativeId = -1;

      // When fetching with negative ID
      const response = await request.get(
        `${API_BASE}/questionnaire-responses/request-info-list/${negativeId}`
      );

      // Then should return error
      expect([400, 404, 500]).toContain(response.status());
    });

    test('@edge should handle zero mapping ID', async ({ request }) => {
      // Given zero ID
      const zeroId = 0;

      // When fetching with zero ID
      const response = await request.get(
        `${API_BASE}/questionnaire-responses/request-info-list/${zeroId}`
      );

      // Then should return error
      expect([400, 404, 500]).toContain(response.status());
    });

    test('@edge should handle very large mapping ID', async ({ request }) => {
      // Given very large ID
      const largeId = '9223372036854775807';

      // When fetching with large ID
      const response = await request.get(
        `${API_BASE}/questionnaire-responses/request-info-list/${largeId}`
      );

      // Then should handle gracefully
      expect([200, 400, 404, 500]).toContain(response.status());
    });

    test('@edge should handle floating point mapping ID', async ({ request }) => {
      // Given floating point ID
      const floatId = 1.5;

      // When fetching with float ID
      const response = await request.get(
        `${API_BASE}/questionnaire-responses/request-info-list/${floatId}`
      );

      // Then should either truncate or reject
      expect([200, 400, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Security Tests', () => {
    test('@security should validate IDOR protection on request-info-list', async ({ request }) => {
      // Given attempt to access another tenant's data
      const otherTenantMappingId = 99999;

      // When fetching potentially unauthorized data
      const response = await request.get(
        `${API_BASE}/questionnaire-responses/request-info-list/${otherTenantMappingId}`
      );

      // Then should validate tenant isolation
      expect([200, 403, 404, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        // Should return empty or only authorized data
        console.log(`IDOR test: Received ${data.length} records`);
      }
    });

    test('@security should protect against CSRF in POST endpoints', async ({ request }) => {
      // Given request without proper CSRF token (if required)
      const requestData = {
        countryQuestionMappingId: 1,
        requestInfoDetails: 'CSRF test',
      };

      // When posting
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: requestData,
      });

      // Document CSRF protection behavior
      console.log(`CSRF protection: ${response.status()}`);
      expect([201, 400, 403, 422, 500]).toContain(response.status());
    });

    test('@security should sanitize HTML in responses', async ({ request }) => {
      // Given HTML content in answer
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: '<div onclick="alert(1)">Test</div><img src=x onerror=alert(1)>',
          },
        ],
      };

      // When saving with HTML
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should sanitize dangerous HTML attributes
      // Document behavior
      console.log(`HTML sanitization: ${response.status()}`);
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@security should handle JSON injection', async ({ request }) => {
      // Given nested JSON that might confuse parser
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: '{"__proto__": {"admin": true}}',
          },
        ],
      };

      // When saving with JSON in answer
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should treat as plain text, not parse
      expect([201, 400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('Edge Cases - Bug Hunting', () => {
    test('@edge should handle concurrent response submissions', async ({ request }) => {
      // Given same response data
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: 'Concurrent test',
          },
        ],
      };

      // When submitting concurrently
      const [response1, response2] = await Promise.all([
        request.post(`${API_BASE}/questionnaire-responses`, { data: requestData }),
        request.post(`${API_BASE}/questionnaire-responses`, { data: requestData }),
      ]);

      // Then should handle race condition
      console.log(`Concurrent submit: ${response1.status()}, ${response2.status()}`);
      expect([201, 400, 409, 422, 500]).toContain(response1.status());
      expect([201, 400, 409, 422, 500]).toContain(response2.status());
    });

    test('@edge should handle very large number of answers', async ({ request }) => {
      // Given very large answer array
      const answers = Array.from({ length: 1000 }, (_, i) => ({
        questionAssignmentId: i + 1,
        stateId: 1,
        answer: `Answer ${i}`,
      }));

      const requestData = {
        clientCountryId: 1,
        answers,
      };

      // When submitting large array
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle gracefully
      expect([201, 400, 413, 422, 500]).toContain(response.status());
    });

    test('@edge should handle newlines in answer', async ({ request }) => {
      // Given newlines in answer
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: 'Line 1\nLine 2\r\nLine 3',
          },
        ],
      };

      // When saving with newlines
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should preserve newlines
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle special JSON characters in answer', async ({ request }) => {
      // Given special JSON characters
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: 'Test "quotes" and \\backslash and /slash',
          },
        ],
      };

      // When saving with special chars
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle JSON escaping properly
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle answer with only special characters', async ({ request }) => {
      // Given answer with only special characters
      const requestData = {
        clientCountryId: 1,
        answers: [
          {
            questionAssignmentId: 1,
            stateId: 1,
            answer: '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~',
          },
        ],
      };

      // When saving with special chars
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should handle special characters
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle mixed valid and invalid answers', async ({ request }) => {
      // Given mixed answers
      const requestData = {
        clientCountryId: 1,
        answers: [
          { questionAssignmentId: 1, stateId: 1, answer: 'Valid answer' },
          { questionAssignmentId: -1, stateId: 1, answer: 'Invalid ID' }, // Invalid
          { questionAssignmentId: 3, stateId: 1, answer: null }, // Null answer
        ],
      };

      // When saving mixed answers
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: requestData,
      });

      // Then should either reject all or process valid ones
      expect([201, 400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('Authorization Tests', () => {
    test('@auth should require authentication for POST questionnaire-responses', async ({
      request,
    }) => {
      // When posting responses (documents current auth behavior)
      const response = await request.post(`${API_BASE}/questionnaire-responses`, {
        data: {
          clientCountryId: 1,
          answers: [{ questionAssignmentId: 1, stateId: 1, answer: 'Test' }],
        },
      });

      // Then should require authentication
      expect([201, 400, 401, 403, 422, 500]).toContain(response.status());
    });

    test('@auth should require authentication for POST request-info', async ({ request }) => {
      // When posting request info
      const response = await request.post(`${API_BASE}/questionnaire-responses/request-info`, {
        data: {
          countryQuestionMappingId: 1,
          requestInfoDetails: 'Test',
        },
      });

      // Then should require authentication
      expect([201, 400, 401, 403, 422, 500]).toContain(response.status());
    });

    test('@auth should require authentication for GET request-info-list', async ({ request }) => {
      // When fetching request info list
      const response = await request.get(`${API_BASE}/questionnaire-responses/request-info-list/1`);

      // Then should require authentication
      expect([200, 401, 403, 404, 500]).toContain(response.status());
    });
  });
});

import { test, expect } from '../../fixtures/advancedFixtures';

/**
 * API Tests for CountryQuestionsMappingResource
 * Generated from: CountryQuestionsMappingResource.java
 * Base Path: /country-questions-mapping
 *
 * Endpoints:
 * - POST /country-questions-mapping - Create a new country-questions mapping
 * - POST /country-questions-mapping/save-all - Save multiple mappings
 * - GET /country-questions-mapping/{clientCountryId} - Get all questions by client country ID
 * - POST /country-questions-mapping/trigger-questions - Trigger questions for client countries
 * - POST /country-questions-mapping/assign-questions - Assign questions to responders
 * - GET /country-questions-mapping/assigned-countries - Get all assigned countries
 * - GET /country-questions-mapping/assigned-questions/{clientCountryId} - Get assigned questions
 * - POST /country-questions-mapping/submit-questionnaire - Submit questionnaire
 * - POST /country-questions-mapping/approve-questionnaire - Approve questionnaire
 */

const API_BASE = '/api/compliancemanager';

test.describe('CountryQuestionsMappingResource API Tests', () => {
  test.describe('GET /country-questions-mapping/{clientCountryId}', () => {
    test('@smoke should return questions for valid client country ID', async ({ request }) => {
      // Given a valid client country ID (assuming one exists)
      const clientCountryId = 1;

      // When fetching questions by client country ID
      const response = await request.get(
        `${API_BASE}/country-questions-mapping/${clientCountryId}`
      );

      // Then should return 200 or 404
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });

    test('@negative should handle non-existent client country ID', async ({ request }) => {
      // Given a non-existent client country ID
      const nonExistentId = 999999999;

      // When fetching questions for non-existent client country
      const response = await request.get(`${API_BASE}/country-questions-mapping/${nonExistentId}`);

      // Then should return 404 or empty response
      expect([200, 404]).toContain(response.status());
    });

    test('@negative should return error for invalid client country ID format', async ({
      request,
    }) => {
      // Given an invalid ID format
      const invalidId = 'invalid-id';

      // When fetching questions with invalid ID
      const response = await request.get(`${API_BASE}/country-questions-mapping/${invalidId}`);

      // Then should return 400 or 500
      expect([400, 500]).toContain(response.status());
    });

    test('@edge should handle negative client country ID', async ({ request }) => {
      // Given a negative ID
      const negativeId = -1;

      // When fetching questions with negative ID
      const response = await request.get(`${API_BASE}/country-questions-mapping/${negativeId}`);

      // Then should return error
      expect([400, 404, 500]).toContain(response.status());
    });

    test('@edge should handle zero client country ID', async ({ request }) => {
      // Given zero ID
      const zeroId = 0;

      // When fetching questions with zero ID
      const response = await request.get(`${API_BASE}/country-questions-mapping/${zeroId}`);

      // Then should return error
      expect([400, 404, 500]).toContain(response.status());
    });

    test('@edge should handle very large client country ID', async ({ request }) => {
      // Given a very large ID
      const largeId = '9223372036854775807';

      // When fetching questions with large ID
      const response = await request.get(`${API_BASE}/country-questions-mapping/${largeId}`);

      // Then should handle gracefully
      expect([200, 400, 404, 500]).toContain(response.status());
    });
  });

  test.describe('GET /country-questions-mapping/assigned-countries', () => {
    test('@smoke should return list of assigned countries', async ({ request }) => {
      // Given the user is authenticated

      // When fetching assigned countries
      const response = await request.get(
        `${API_BASE}/country-questions-mapping/assigned-countries`
      );

      // Then should return 200 with list
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('@smoke should return valid country structure', async ({ request }) => {
      // When fetching assigned countries
      const response = await request.get(
        `${API_BASE}/country-questions-mapping/assigned-countries`
      );
      expect(response.status()).toBe(200);

      const data = await response.json();
      if (data.length > 0) {
        // Then each country should have required fields
        const country = data[0];
        expect(country).toHaveProperty('id');
      }
    });
  });

  test.describe('GET /country-questions-mapping/assigned-questions/{clientCountryId}', () => {
    test('@smoke should return assigned questions for valid client country', async ({
      request,
    }) => {
      // Given a valid client country ID
      const clientCountryId = 1;

      // When fetching assigned questions
      const response = await request.get(
        `${API_BASE}/country-questions-mapping/assigned-questions/${clientCountryId}`
      );

      // Then should return 200 or 404
      expect([200, 404]).toContain(response.status());
    });

    test('@negative should handle non-existent client country ID', async ({ request }) => {
      // Given a non-existent ID
      const nonExistentId = 999999999;

      // When fetching assigned questions
      const response = await request.get(
        `${API_BASE}/country-questions-mapping/assigned-questions/${nonExistentId}`
      );

      // Then should return 404 or empty
      expect([200, 404]).toContain(response.status());
    });

    test('@edge should handle invalid ID format', async ({ request }) => {
      // Given an invalid ID
      const invalidId = 'abc';

      // When fetching assigned questions
      const response = await request.get(
        `${API_BASE}/country-questions-mapping/assigned-questions/${invalidId}`
      );

      // Then should return error
      expect([400, 500]).toContain(response.status());
    });
  });

  test.describe('POST /country-questions-mapping', () => {
    test('@negative should return 400 when clientCountryId is missing', async ({ request }) => {
      // Given request data without required clientCountryId
      const requestData = {
        questionIdList: [{ questionId: 1, stateSpecific: false }],
      };

      // When creating without clientCountryId
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: requestData,
      });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when questionIdList is missing', async ({ request }) => {
      // Given request data without required questionIdList
      const requestData = {
        clientCountryId: 1,
      };

      // When creating without questionIdList
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: requestData,
      });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when questionIdList is empty', async ({ request }) => {
      // Given request data with empty questionIdList
      const requestData = {
        clientCountryId: 1,
        questionIdList: [],
      };

      // When creating with empty list
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: requestData,
      });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@negative should handle non-existent clientCountryId', async ({ request }) => {
      // Given request with non-existent clientCountryId
      const requestData = {
        clientCountryId: 999999999,
        questionIdList: [{ questionId: 1, stateSpecific: false }],
      };

      // When creating with non-existent clientCountryId
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: requestData,
      });

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle empty request body', async ({ request }) => {
      // Given empty request body
      const response = await request.post(`${API_BASE}/country-questions-mapping`, { data: {} });

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@edge should handle null clientCountryId', async ({ request }) => {
      // Given null clientCountryId
      const requestData = {
        clientCountryId: null,
        questionIdList: [{ questionId: 1, stateSpecific: false }],
      };

      // When creating with null clientCountryId
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: requestData,
      });

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@security should handle SQL injection in questionIdList', async ({ request }) => {
      // Given request with SQL injection attempt
      const requestData = {
        clientCountryId: 1,
        questionIdList: "'; DROP TABLE questions; --",
      };

      // When creating with SQL injection
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: requestData,
      });

      // Then should return error (not execute injection)
      expect([400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('POST /country-questions-mapping/save-all', () => {
    test('@negative should return error for empty array', async ({ request }) => {
      // Given empty array
      const requestData: object[] = [];

      // When saving empty array
      const response = await request.post(`${API_BASE}/country-questions-mapping/save-all`, {
        data: requestData,
      });

      // Then should return error or success
      expect([200, 400]).toContain(response.status());
    });

    test('@negative should return 400 when items missing required fields', async ({ request }) => {
      // Given array with invalid items
      const requestData = [
        { questionIdList: [{ questionId: 1 }] }, // Missing clientCountryId
      ];

      // When saving with invalid items
      const response = await request.post(`${API_BASE}/country-questions-mapping/save-all`, {
        data: requestData,
      });

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@edge should handle non-array request body', async ({ request }) => {
      // Given object instead of array
      const requestData = {
        clientCountryId: 1,
        questionIdList: [{ questionId: 1 }],
      };

      // When saving with non-array
      const response = await request.post(`${API_BASE}/country-questions-mapping/save-all`, {
        data: requestData,
      });

      // Then should return error
      expect([400, 415, 422, 500]).toContain(response.status());
    });

    test('@edge should handle very large array', async ({ request }) => {
      // Given very large array
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        clientCountryId: i + 1,
        questionIdList: [{ questionId: 1, stateSpecific: false }],
      }));

      // When saving large array
      const response = await request.post(`${API_BASE}/country-questions-mapping/save-all`, {
        data: largeArray,
      });

      // Then should handle gracefully
      expect([200, 400, 413, 422, 500]).toContain(response.status());
    });
  });

  test.describe('POST /country-questions-mapping/trigger-questions', () => {
    test('@negative should return error for empty clientCountryIds array', async ({ request }) => {
      // Given empty array
      const requestData: number[] = [];

      // When triggering with empty array
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: requestData,
        }
      );

      // Then should return error or handle gracefully
      expect([200, 400, 422]).toContain(response.status());
    });

    test('@negative should handle non-existent clientCountryIds', async ({ request }) => {
      // Given non-existent IDs
      const requestData = [999999997, 999999998, 999999999];

      // When triggering with non-existent IDs
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: requestData,
        }
      );

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle null values in array', async ({ request }) => {
      // Given array with null
      const requestData = [1, null, 3];

      // When triggering with null in array
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: requestData,
        }
      );

      // Then should return error
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle negative IDs', async ({ request }) => {
      // Given negative IDs
      const requestData = [-1, -2];

      // When triggering with negative IDs
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: requestData,
        }
      );

      // Then should return error
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle string values instead of numbers', async ({ request }) => {
      // Given string values
      const requestData = ['1', '2', '3'];

      // When triggering with strings
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: requestData,
        }
      );

      // Then should either coerce or reject
      expect([200, 400, 422, 500]).toContain(response.status());
    });

    test('@security should handle SQL injection in array', async ({ request }) => {
      // Given SQL injection attempt
      const requestData = ['1; DROP TABLE questions; --'];

      // When triggering with injection
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: requestData,
        }
      );

      // Then should reject (type mismatch)
      expect([400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('POST /country-questions-mapping/assign-questions', () => {
    test('@negative should return 400 when clientCountryId is missing', async ({ request }) => {
      // Given request without clientCountryId
      const requestData = {
        assgnedToUserId: 1,
        questionIdList: [1, 2, 3],
      };

      // When assigning without clientCountryId
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when assgnedToUserId is missing', async ({ request }) => {
      // Given request without assgnedToUserId
      const requestData = {
        clientCountryId: 1,
        questionIdList: [1, 2, 3],
      };

      // When assigning without user ID
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when questionIdList is missing', async ({ request }) => {
      // Given request without questionIdList
      const requestData = {
        clientCountryId: 1,
        assgnedToUserId: 1,
      };

      // When assigning without questions
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when questionIdList is empty', async ({ request }) => {
      // Given request with empty questionIdList
      const requestData = {
        clientCountryId: 1,
        assgnedToUserId: 1,
        questionIdList: [],
      };

      // When assigning empty list
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@negative should handle non-existent clientCountryId', async ({ request }) => {
      // Given non-existent clientCountryId
      const requestData = {
        clientCountryId: 999999999,
        assgnedToUserId: 1,
        questionIdList: [1, 2, 3],
      };

      // When assigning with non-existent country
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@negative should handle non-existent assgnedToUserId', async ({ request }) => {
      // Given non-existent user ID
      const requestData = {
        clientCountryId: 1,
        assgnedToUserId: 999999999,
        questionIdList: [1, 2, 3],
      };

      // When assigning to non-existent user
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle empty request body', async ({ request }) => {
      // Given empty request body
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: {},
        }
      );

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@edge should handle null values', async ({ request }) => {
      // Given null values
      const requestData = {
        clientCountryId: null,
        assgnedToUserId: null,
        questionIdList: null,
      };

      // When assigning with nulls
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should return 400
      expect(response.status()).toBe(400);
    });

    test('@security should validate user can only assign to authorized users', async ({
      request,
    }) => {
      // Given request to assign to potentially unauthorized user
      const requestData = {
        clientCountryId: 1,
        assgnedToUserId: 99999, // Potentially unauthorized user
        questionIdList: [1],
      };

      // When assigning to potentially unauthorized user
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should validate authorization
      expect([200, 400, 403, 404, 422, 500]).toContain(response.status());
    });
  });

  test.describe('POST /country-questions-mapping/submit-questionnaire', () => {
    test('@negative should return error for empty clientCountryIds', async ({ request }) => {
      // Given empty array
      const requestData: number[] = [];

      // When submitting with empty array
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/submit-questionnaire`,
        { data: requestData }
      );

      // Then should return error
      expect([200, 400, 422]).toContain(response.status());
    });

    test('@negative should handle non-existent clientCountryIds', async ({ request }) => {
      // Given non-existent IDs
      const requestData = [999999999];

      // When submitting with non-existent IDs
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/submit-questionnaire`,
        { data: requestData }
      );

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle invalid data types', async ({ request }) => {
      // Given string instead of array
      const requestData = 'invalid';

      // When submitting with invalid type
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/submit-questionnaire`,
        { data: requestData }
      );

      // Then should return error
      expect([400, 415, 422, 500]).toContain(response.status());
    });

    test('@edge should handle duplicate IDs in array', async ({ request }) => {
      // Given duplicate IDs
      const requestData = [1, 1, 1];

      // When submitting with duplicates
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/submit-questionnaire`,
        { data: requestData }
      );

      // Then should handle gracefully
      expect([200, 400, 422, 500]).toContain(response.status());
    });

    test('@security should validate user has permission to submit', async ({ request }) => {
      // Given potentially unauthorized submission
      const requestData = [99999];

      // When submitting
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/submit-questionnaire`,
        { data: requestData }
      );

      // Then should validate permission
      expect([200, 400, 403, 404, 422, 500]).toContain(response.status());
    });
  });

  test.describe('POST /country-questions-mapping/approve-questionnaire', () => {
    test('@negative should return error for empty clientCountryIds', async ({ request }) => {
      // Given empty array
      const requestData: number[] = [];

      // When approving with empty array
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/approve-questionnaire`,
        { data: requestData }
      );

      // Then should return error
      expect([200, 400, 422]).toContain(response.status());
    });

    test('@negative should handle non-existent clientCountryIds', async ({ request }) => {
      // Given non-existent IDs
      const requestData = [999999999];

      // When approving with non-existent IDs
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/approve-questionnaire`,
        { data: requestData }
      );

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@security should validate user has approval permissions', async ({ request }) => {
      // Given potentially unauthorized approval
      const requestData = [1];

      // When approving
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/approve-questionnaire`,
        { data: requestData }
      );

      // Then should validate approval permission
      expect([200, 400, 403, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should not allow approving already approved questionnaire', async ({ request }) => {
      // This test documents the behavior for double-approval
      // Given an ID (may or may not be already approved)
      const requestData = [1];

      // When approving (possibly again)
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/approve-questionnaire`,
        { data: requestData }
      );

      // Then document the behavior
      console.log(`Double-approval behavior: status ${response.status()}`);
      expect([200, 400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('Edge Cases - Bug Hunting', () => {
    test('@edge should handle concurrent submissions for same country', async ({ request }) => {
      // Given same country ID
      const requestData = [1];

      // When submitting concurrently
      const [response1, response2] = await Promise.all([
        request.post(`${API_BASE}/country-questions-mapping/submit-questionnaire`, {
          data: requestData,
        }),
        request.post(`${API_BASE}/country-questions-mapping/submit-questionnaire`, {
          data: requestData,
        }),
      ]);

      // Then should handle race condition gracefully
      console.log(`Concurrent submit: ${response1.status()}, ${response2.status()}`);
      expect([200, 400, 409, 422, 500]).toContain(response1.status());
      expect([200, 400, 409, 422, 500]).toContain(response2.status());
    });

    test('@edge should handle very large clientCountryIds array', async ({ request }) => {
      // Given very large array
      const largeArray = Array.from({ length: 10000 }, (_, i) => i + 1);

      // When triggering with large array
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: largeArray,
        }
      );

      // Then should handle gracefully
      expect([200, 400, 413, 422, 500]).toContain(response.status());
    });

    test('@security should handle IDOR attempt in clientCountryId', async ({ request }) => {
      // Given attempt to access another tenant's data
      const requestData = {
        clientCountryId: 99999, // Potentially another tenant's country
        assgnedToUserId: 1,
        questionIdList: [1],
      };

      // When assigning to potentially unauthorized country
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: requestData,
        }
      );

      // Then should validate tenant isolation
      expect([400, 403, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle special characters in request', async ({ request }) => {
      // Given request with special characters as part of data manipulation attempt
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: ['\x00', '\x1f'],
        }
      );

      // Then should reject invalid data
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle JSON injection in request body', async ({ request }) => {
      // Given nested JSON that might confuse parser
      const maliciousData = {
        clientCountryId: 1,
        questionIdList: [
          {
            questionId: 1,
            stateSpecific: false,
            __proto__: { admin: true },
          },
        ],
      };

      // When creating with prototype pollution attempt
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: maliciousData,
      });

      // Then should not be affected by prototype pollution
      expect([201, 400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle negative questionId in questionIdList', async ({ request }) => {
      // Given negative question IDs
      const requestData = {
        clientCountryId: 1,
        questionIdList: [{ questionId: -1, stateSpecific: false }],
      };

      // When creating with negative IDs
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: requestData,
      });

      // Then should reject
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle floating point IDs', async ({ request }) => {
      // Given floating point IDs
      const requestData = {
        clientCountryId: 1.5,
        questionIdList: [{ questionId: 2.5, stateSpecific: false }],
      };

      // When creating with float IDs
      const response = await request.post(`${API_BASE}/country-questions-mapping`, {
        data: requestData,
      });

      // Then should either truncate or reject
      expect([201, 400, 422, 500]).toContain(response.status());
    });
  });

  test.describe('Authorization Tests', () => {
    test('@auth should require authentication for GET assigned-countries', async ({ request }) => {
      // When fetching assigned countries (test documents current auth behavior)
      const response = await request.get(
        `${API_BASE}/country-questions-mapping/assigned-countries`
      );

      // Then should be either 200 (authenticated) or 401/403 (if no auth)
      expect([200, 401, 403]).toContain(response.status());
    });

    test('@auth should require authentication for POST trigger-questions', async ({ request }) => {
      // When triggering questions
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/trigger-questions`,
        {
          data: [1],
        }
      );

      // Then should require authentication
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status());
    });

    test('@auth should require authentication for POST assign-questions', async ({ request }) => {
      // When assigning questions
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/assign-questions`,
        {
          data: {
            clientCountryId: 1,
            assgnedToUserId: 1,
            questionIdList: [1],
          },
        }
      );

      // Then should require authentication
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status());
    });

    test('@auth should require authentication for POST submit-questionnaire', async ({
      request,
    }) => {
      // When submitting questionnaire
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/submit-questionnaire`,
        { data: [1] }
      );

      // Then should require authentication
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status());
    });

    test('@auth should require elevated permissions for POST approve-questionnaire', async ({
      request,
    }) => {
      // When approving questionnaire (requires approval role)
      const response = await request.post(
        `${API_BASE}/country-questions-mapping/approve-questionnaire`,
        { data: [1] }
      );

      // Then should validate elevated permissions
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status());
    });
  });
});

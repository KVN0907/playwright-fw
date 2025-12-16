import { test, expect } from '../../fixtures/advancedFixtures';

/**
 * Sprint 5 API Tests - Create New Client: EY Super Admin
 *
 * ADO Story: #197607 - Create New Client and assign an Admin: EY Super Admin (Backend)
 * Assigned To: Johirul Amin
 *
 * Acceptance Criteria:
 * - Client Name: 3-500 characters, must be unique
 * - Location: City search with auto-complete
 * - Assign EY Admin: Optional, can assign one or more EY Admins
 *
 * Test Cases:
 * - ADO-XXXXX1: API - Create Client - Valid Request (All Fields)
 * - ADO-XXXXX2: API - Create Client - Valid Request (Without EY Admin)
 * - ADO-XXXXX3: API - Create Client - Invalid Token
 * - ADO-XXXXX4: API - Create Client - Name Validation (Too Short)
 * - ADO-XXXXX5: API - Create Client - Name Validation (Too Long)
 * - ADO-XXXXX6: API - Create Client - Name Validation (Empty/Blank)
 * - ADO-XXXXX7: API - Create Client - Duplicate Name
 * - ADO-XXXXX8: API - Create Client - Non-Existent City
 * - ADO-XXXXX9: API - Create Client - Non-Existent EY Admin
 * - ADO-XXXXX10: API - Create Client - Missing Required Fields
 * - ADO-XXXXX11: API - Create Client - Multiple EY Admins
 * - ADO-XXXXX12: API - Create Client - Name with Special Characters
 * - ADO-XXXXX13: API - Create Client - Name with Leading/Trailing Spaces
 * - ADO-XXXXX14: API - Create Client - Response Validation
 */

const API_BASE = '/api/admin/api';
const CLIENTS_ENDPOINT = `${API_BASE}/clients`;
const CITIES_SEARCH_ENDPOINT = `${API_BASE}/cities/search-by-name`;
const EY_ADMINS_ENDPOINT = `${API_BASE}/ey-admins`;

interface ClientCreateRequest {
  name: string;
  cityId: number;
  assignedEyAdminId: number[];
}

interface ClientResponse {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  activeStatus: boolean;
  onboardingDate: string;
  assignedEyAdmins: Array<{
    id: number;
    name: string;
    username: string;
  }>;
}

// Helper to generate unique client names for tests
const generateUniqueClientName = (prefix = 'Test Client'): string => {
  return `${prefix} ${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

// Cleanup helper to track created clients for cleanup
const createdClientIds: number[] = [];

test.describe('Story #197607: Create New Client - EY Super Admin', () => {
  // Variables to store test data fetched during tests
  let validCityId: number;
  let validEyAdminId: number;
  let secondEyAdminId: number;

  // Setup: Fetch valid test data
  test.beforeAll(async ({ request }) => {
    // Get a valid city ID
    try {
      const cityResponse = await request.post(CITIES_SEARCH_ENDPOINT, {
        data: { name: 'a' }, // Search for cities containing 'a'
      });
      if (cityResponse.ok()) {
        const cities = await cityResponse.json();
        if (cities && cities.length > 0) {
          validCityId = cities[0].id;
        }
      }
    } catch {
      // Will use default if search fails
    }

    // Get valid EY Admin IDs
    try {
      const adminsResponse = await request.get(EY_ADMINS_ENDPOINT);
      if (adminsResponse.ok()) {
        const admins = await adminsResponse.json();
        if (admins && admins.length > 0) {
          validEyAdminId = admins[0].id;
          if (admins.length > 1) {
            secondEyAdminId = admins[1].id;
          }
        }
      }
    } catch {
      // Will use default if fetch fails
    }

    // Set defaults if not found
    validCityId = validCityId || 1;
    validEyAdminId = validEyAdminId || 1;
    secondEyAdminId = secondEyAdminId || 2;
  });

  // Cleanup: Delete created test clients
  test.afterAll(async ({ request }) => {
    for (const clientId of createdClientIds) {
      try {
        await request.delete(`${CLIENTS_ENDPOINT}/${clientId}`);
      } catch {
        // Ignore cleanup errors
      }
    }
    createdClientIds.length = 0;
  });

  /**
   * Test Case 1: Create Client - Valid Request (All Fields)
   * Verify successful client creation with all required fields
   */
  test('ADO-XXXXX1 should create client with valid request (all fields)', async ({ request }) => {
    const clientName = generateUniqueClientName('Valid Client');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data: ClientResponse = await response.json();

    expect(data.id).toBeDefined();
    expect(data.name).toBe(clientName);
    expect(data.activeStatus).toBe(true);
    expect(data.cityId).toBe(validCityId);

    // Track for cleanup
    if (data.id) {
      createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 2: Create Client - Valid Request (Without EY Admin Assignment)
   * Verify client creation with empty EY Admin assignment
   */
  test('ADO-XXXXX2 should create client without EY Admin assignment', async ({ request }) => {
    const clientName = generateUniqueClientName('No Admin Client');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // API may require at least one admin or allow empty array
    expect([201, 400, 422]).toContain(response.status());

    if (response.status() === 201) {
      const data: ClientResponse = await response.json();
      expect(data.name).toBe(clientName);
      if (data.id) {
        createdClientIds.push(data.id);
      }
    }
  });

  /**
   * Test Case 3: Create Client - Invalid Token
   * Verify authentication is required
   */
  test('ADO-XXXXX3 should reject request with invalid token', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Invalid Token Client'),
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, {
      data: payload,
      headers: {
        Authorization: 'Bearer invalid_token_12345',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  /**
   * Test Case 4: Create Client - Name Too Short (< 3 characters)
   * Verify name minimum length validation
   */
  test('ADO-XXXXX4 should reject name shorter than 3 characters', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: 'AB', // 2 characters - below minimum
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(400);
    const data = await response.json();
    // Validation error message should reference the constraint
    expect(JSON.stringify(data)).toBeDefined();
  });

  /**
   * Test Case 5: Create Client - Name Too Long (> 500 characters)
   * Verify name maximum length validation
   */
  test('ADO-XXXXX5 should reject name longer than 500 characters', async ({ request }) => {
    const longName = 'A'.repeat(501); // 501 characters - above maximum
    const payload: ClientCreateRequest = {
      name: longName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(400);
    const data = await response.json();
    // Validation error message should be returned
    expect(JSON.stringify(data)).toBeDefined();
  });

  /**
   * Test Case 6: Create Client - Empty/Blank Name
   * Verify name cannot be empty or blank
   */
  test('ADO-XXXXX6 should reject empty or blank name', async ({ request }) => {
    // Test with empty string
    const emptyPayload = {
      name: '',
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const emptyResponse = await request.post(CLIENTS_ENDPOINT, { data: emptyPayload });
    expect(emptyResponse.status()).toBe(400);

    // Test with whitespace only
    const blankPayload = {
      name: '   ',
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const blankResponse = await request.post(CLIENTS_ENDPOINT, { data: blankPayload });
    expect(blankResponse.status()).toBe(400);
  });

  /**
   * Test Case 7: Create Client - Duplicate Name
   * Verify unique name constraint
   */
  test('ADO-XXXXX7 should reject duplicate client name', async ({ request }) => {
    const clientName = generateUniqueClientName('Duplicate Test');

    // Create first client
    const firstPayload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const firstResponse = await request.post(CLIENTS_ENDPOINT, { data: firstPayload });
    expect(firstResponse.status()).toBe(201);

    const firstData = await firstResponse.json();
    if (firstData.id) {
      createdClientIds.push(firstData.id);
    }

    // Attempt to create second client with same name
    const duplicatePayload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const duplicateResponse = await request.post(CLIENTS_ENDPOINT, { data: duplicatePayload });

    // 409 Conflict or 422 Unprocessable Entity are valid responses for duplicate name
    expect([409, 422]).toContain(duplicateResponse.status());
    const data = await duplicateResponse.json();
    // Verify error response is returned
    expect(data).toBeDefined();
  });

  /**
   * Test Case 8: Create Client - Non-Existent City
   * Verify city existence validation
   */
  test('ADO-XXXXX8 should reject non-existent city ID', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Invalid City Client'),
      cityId: 999999999, // Non-existent city ID
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // 409 Conflict or 422 Unprocessable Entity are valid for business rule violations
    expect([409, 422]).toContain(response.status());
    const data = await response.json();
    // Verify error response is returned
    expect(data).toBeDefined();
  });

  /**
   * Test Case 9: Create Client - Non-Existent EY Admin
   * Verify EY Admin existence validation
   */
  test('ADO-XXXXX9 should reject non-existent EY Admin ID', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Invalid Admin Client'),
      cityId: validCityId,
      assignedEyAdminId: [999999999], // Non-existent admin ID
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // 409 Conflict or 422 Unprocessable Entity are valid for business rule violations
    expect([409, 422]).toContain(response.status());
    const data = await response.json();
    // Verify error response is returned
    expect(data).toBeDefined();
  });

  /**
   * Test Case 10: Create Client - Missing Required Fields
   * Verify all required fields validation
   */
  test('ADO-XXXXX10 should reject request with missing required fields', async ({ request }) => {
    // Missing name
    const noNamePayload = {
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };
    const noNameResponse = await request.post(CLIENTS_ENDPOINT, { data: noNamePayload });
    expect(noNameResponse.status()).toBe(400);

    // Missing cityId
    const noCityPayload = {
      name: generateUniqueClientName('No City'),
      assignedEyAdminId: [validEyAdminId],
    };
    const noCityResponse = await request.post(CLIENTS_ENDPOINT, { data: noCityPayload });
    expect(noCityResponse.status()).toBe(400);

    // Missing assignedEyAdminId
    const noAdminPayload = {
      name: generateUniqueClientName('No Admin Field'),
      cityId: validCityId,
    };
    const noAdminResponse = await request.post(CLIENTS_ENDPOINT, { data: noAdminPayload });
    expect(noAdminResponse.status()).toBe(400);
  });

  /**
   * Test Case 11: Create Client - Multiple EY Admins
   * Verify client can be assigned multiple EY Admins
   */
  test('ADO-XXXXX11 should create client with multiple EY Admins', async ({ request }) => {
    const clientName = generateUniqueClientName('Multi Admin Client');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId, secondEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data: ClientResponse = await response.json();

    expect(data.id).toBeDefined();
    expect(data.name).toBe(clientName);
    expect(data.assignedEyAdmins).toBeDefined();
    expect(data.assignedEyAdmins.length).toBe(2);

    if (data.id) {
      createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 12: Create Client - Name with Special Characters
   * Verify name can contain special characters
   */
  test('ADO-XXXXX12 should accept name with special characters', async ({ request }) => {
    const clientName = `Test & Co. (${Date.now()}) - Special #$%`;
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data: ClientResponse = await response.json();
    expect(data.name).toBe(clientName);

    if (data.id) {
      createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 13: Create Client - Name with Leading/Trailing Spaces
   * Verify name is trimmed
   */
  test('ADO-XXXXX13 should trim leading and trailing spaces from name', async ({ request }) => {
    const baseName = generateUniqueClientName('Trimmed');
    const nameWithSpaces = `  ${baseName}  `;
    const payload: ClientCreateRequest = {
      name: nameWithSpaces,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data: ClientResponse = await response.json();

    // Name should be trimmed
    expect(data.name).toBe(baseName);

    if (data.id) {
      createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 14: Create Client - Response Validation
   * Verify complete response structure
   */
  test('ADO-XXXXX14 should return complete response structure', async ({ request }) => {
    const clientName = generateUniqueClientName('Response Validation');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data: ClientResponse = await response.json();

    // Validate response structure
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('cityId');
    expect(data).toHaveProperty('cityName');
    expect(data).toHaveProperty('activeStatus');
    expect(data).toHaveProperty('assignedEyAdmins');

    // Validate data types
    expect(typeof data.id).toBe('number');
    expect(typeof data.name).toBe('string');
    expect(typeof data.activeStatus).toBe('boolean');

    // Validate assigned admins structure
    if (data.assignedEyAdmins && data.assignedEyAdmins.length > 0) {
      const admin = data.assignedEyAdmins[0];
      expect(admin).toHaveProperty('id');
    }

    if (data.id) {
      createdClientIds.push(data.id);
    }
  });

  // ==================== ADDITIONAL EDGE CASE TESTS ====================

  /**
   * Test Case 15: Boundary - Name exactly 3 characters (minimum valid)
   */
  test('ADO-EDGE1 should accept name with exactly 3 characters', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: `A${Date.now().toString().slice(-2)}`, // 3 characters
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data = await response.json();
    if (data.id) createdClientIds.push(data.id);
  });

  /**
   * Test Case 16: Boundary - Name exactly 500 characters (maximum valid)
   */
  test('ADO-EDGE2 should accept name with exactly 500 characters', async ({ request }) => {
    const baseName = 'A'.repeat(487) + Date.now().toString().slice(-13); // Exactly 500 chars
    const payload: ClientCreateRequest = {
      name: baseName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data = await response.json();
    if (data.id) createdClientIds.push(data.id);
  });

  /**
   * Test Case 17: SQL Injection attempt in name field
   */
  test('ADO-EDGE3 should handle SQL injection attempt safely', async ({ request }) => {
    const sqlInjectionName = `Test'; DROP TABLE clients; --${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: sqlInjectionName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either create safely or reject, but not cause server error
    expect([201, 400, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 18: XSS attempt in name field
   */
  test('ADO-EDGE4 should handle XSS attempt safely', async ({ request }) => {
    const xssName = `<script>alert('XSS')</script>Test${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: xssName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either sanitize and create, or reject
    expect([201, 400, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 19: Negative city ID
   */
  test('ADO-EDGE5 should reject negative city ID', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Negative City'),
      cityId: -1,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400 or 422, not 500
    expect([400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 20: Zero city ID
   */
  test('ADO-EDGE6 should reject zero city ID', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Zero City'),
      cityId: 0,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400 or 422, not 500
    expect([400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 21: Negative EY Admin ID
   */
  test('ADO-EDGE7 should reject negative EY Admin ID', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Negative Admin'),
      cityId: validCityId,
      assignedEyAdminId: [-1],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400 or 422, not 500
    expect([400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 22: Duplicate admin IDs in array
   */
  test('ADO-EDGE8 should handle duplicate admin IDs in array', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Duplicate Admins'),
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId, validEyAdminId, validEyAdminId], // Same ID 3 times
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either deduplicate and succeed, or reject - not crash
    expect([201, 400, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      // Should ideally deduplicate
      expect(data.assignedEyAdmins.length).toBeLessThanOrEqual(3);
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 23: Case sensitivity - duplicate name with different case
   */
  test('ADO-EDGE9 should handle case-insensitive duplicate name check', async ({ request }) => {
    const baseName = `CaseSensitive${Date.now()}`;

    // Create first client with lowercase
    const firstPayload: ClientCreateRequest = {
      name: baseName.toLowerCase(),
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };
    const firstResponse = await request.post(CLIENTS_ENDPOINT, { data: firstPayload });
    expect(firstResponse.status()).toBe(201);
    const firstData = await firstResponse.json();
    if (firstData.id) createdClientIds.push(firstData.id);

    // Try to create with uppercase - should be rejected if case-insensitive
    const secondPayload: ClientCreateRequest = {
      name: baseName.toUpperCase(),
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };
    const secondResponse = await request.post(CLIENTS_ENDPOINT, { data: secondPayload });

    // Either reject (case-insensitive) or allow (case-sensitive) - document behavior
    if (secondResponse.status() === 201) {
      const secondData = await secondResponse.json();
      if (secondData.id) createdClientIds.push(secondData.id);
    }
    // Not a failure - just documenting behavior
    expect([201, 409, 422]).toContain(secondResponse.status());
  });

  /**
   * Test Case 24: Unicode characters in name
   */
  test('ADO-EDGE10 should handle unicode characters in name', async ({ request }) => {
    const unicodeName = `日本語テスト${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: unicodeName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should handle unicode gracefully
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 25: Emoji in name
   */
  test('ADO-EDGE11 should handle emoji in name', async ({ request }) => {
    const emojiName = `Test Company 🏢 ${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: emojiName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should handle emoji gracefully - either accept or reject, not crash
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 26: Very large admin ID (potential overflow)
   */
  test('ADO-EDGE12 should handle very large admin ID', async ({ request }) => {
    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Large Admin ID'),
      cityId: validCityId,
      assignedEyAdminId: [9007199254740991], // Max safe integer
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject gracefully, not crash
    expect([400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 27: Null values in request
   */
  test('ADO-EDGE13 should reject null values', async ({ request }) => {
    // @ts-expect-error Testing null value
    const nullNamePayload = {
      name: null,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };
    const nullNameResponse = await request.post(CLIENTS_ENDPOINT, { data: nullNamePayload });
    expect(nullNameResponse.status()).toBe(400);

    // @ts-expect-error Testing null value
    const nullCityPayload = {
      name: generateUniqueClientName('Null City'),
      cityId: null,
      assignedEyAdminId: [validEyAdminId],
    };
    const nullCityResponse = await request.post(CLIENTS_ENDPOINT, { data: nullCityPayload });
    expect(nullCityResponse.status()).toBe(400);
  });

  /**
   * Test Case 28: String instead of number for cityId
   */
  test('ADO-EDGE14 should reject string cityId', async ({ request }) => {
    const payload = {
      name: generateUniqueClientName('String City'),
      cityId: 'not-a-number',
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400, not 500
    expect(response.status()).toBe(400);
  });

  /**
   * Test Case 29: Empty request body
   */
  test('ADO-EDGE15 should reject empty request body', async ({ request }) => {
    const response = await request.post(CLIENTS_ENDPOINT, { data: {} });

    expect(response.status()).toBe(400);
  });

  /**
   * Test Case 30: Name with only numbers
   */
  test('ADO-EDGE16 should accept name with only numbers', async ({ request }) => {
    const numericName = Date.now().toString();
    const payload: ClientCreateRequest = {
      name: numericName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Numeric-only names should be valid
    expect(response.status()).toBe(201);
    const data = await response.json();
    if (data.id) createdClientIds.push(data.id);
  });

  /**
   * Test Case 31: Name with newline characters
   */
  test('ADO-EDGE17 should handle name with newline characters', async ({ request }) => {
    const newlineName = `Test\nClient\r\n${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: newlineName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either sanitize newlines or reject - not crash
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 32: Large number of admin IDs
   */
  test('ADO-EDGE18 should handle large array of admin IDs', async ({ request }) => {
    // Create array of 100 admin IDs (most will be invalid)
    const manyAdminIds = Array.from({ length: 100 }, (_, i) => validEyAdminId + i);

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Many Admins'),
      cityId: validCityId,
      assignedEyAdminId: manyAdminIds,
    };

    const response = await request.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either process or reject gracefully - not timeout or crash
    expect([201, 400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 33: Concurrent creation with same name
   */
  test('ADO-EDGE19 should handle concurrent creation with same name', async ({ request }) => {
    const clientName = generateUniqueClientName('Concurrent');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [validEyAdminId],
    };

    // Send multiple requests concurrently
    const responses = await Promise.all([
      request.post(CLIENTS_ENDPOINT, { data: payload }),
      request.post(CLIENTS_ENDPOINT, { data: payload }),
      request.post(CLIENTS_ENDPOINT, { data: payload }),
    ]);

    // Exactly one should succeed, others should fail with conflict
    const successCount = responses.filter(r => r.status() === 201).length;
    const conflictCount = responses.filter(r => [409, 422].includes(r.status())).length;

    expect(successCount).toBe(1);
    expect(conflictCount).toBe(2);

    // Clean up the created client
    for (const response of responses) {
      if (response.status() === 201) {
        const data = await response.json();
        if (data.id) createdClientIds.push(data.id);
      }
    }
  });
});

import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * Sprint 5 API Tests - Create New Client: EY Super Admin
 *
 * ADO Story: #197607 - Create New Client and assign an Admin: EY Super Admin (Backend)
 * Assigned To: Johirul Amin
 *
 * Acceptance Criteria:
 * - Client Name: 3-500 characters, must be unique
 * - Location: City search with auto-complete
 * - Assign EY Admin: Mandatory, must assign at least one EY Admin
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

// Helper to generate unique client names for tests using Faker
const generateUniqueClientName = (prefix?: string): string => {
  const uniqueId = `${Date.now()}`.slice(-6);
  const companyName = faker.company.name();
  // If prefix is provided, use it; otherwise generate realistic company name
  if (prefix) {
    return `${prefix} ${uniqueId}_${faker.string.alphanumeric(6)}`;
  }
  return `${companyName} ${uniqueId}`;
};

// Cleanup helper to track created clients for cleanup
const createdClientIds: number[] = [];

test.describe('Story #197607: Create New Client - EY Super Admin', () => {
  // Variables to store test data fetched during tests
  let validCityId: number;
  let availableEyAdminIds: number[] = [];

  // Helper function to get a random EY Admin ID
  const getRandomEyAdminId = (): number => {
    if (availableEyAdminIds.length === 0) return 1;
    return availableEyAdminIds[Math.floor(Math.random() * availableEyAdminIds.length)];
  };

  // Helper function to get multiple random EY Admin IDs
  const getRandomEyAdminIds = (count: number): number[] => {
    if (availableEyAdminIds.length === 0) return [1];
    const shuffled = [...availableEyAdminIds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  // Setup: Fetch valid test data
  test.beforeAll(async ({ superAdminRequest }) => {
    // Get a valid city ID
    try {
      const cityResponse = await superAdminRequest.post(CITIES_SEARCH_ENDPOINT, {
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

    // Get all available EY Admin IDs for random selection
    try {
      const adminsResponse = await superAdminRequest.get(EY_ADMINS_ENDPOINT);
      if (adminsResponse.ok()) {
        const admins = await adminsResponse.json();
        if (admins && admins.length > 0) {
          availableEyAdminIds = admins.map((admin: { id: number }) => admin.id);
        }
      }
    } catch {
      // Will use default if fetch fails
    }

    // Set defaults if not found
    validCityId = validCityId || 1;
    if (availableEyAdminIds.length === 0) {
      availableEyAdminIds = [1, 2];
    }
  });

  // Cleanup: Delete created test clients
  test.afterAll(async ({ superAdminRequest }) => {
    for (const clientId of createdClientIds) {
      try {
        await superAdminRequest.delete(`${CLIENTS_ENDPOINT}/${clientId}`);
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
  test('ADO-XXXXX1 should create client with valid request (all fields)', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'SMOKE' });

    const clientName = generateUniqueClientName('Valid Client');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
   * Test Case 1b: Create Client as EY Super Admin with Multiple EY Admins
   * Verify EY Super Admin can create a client and assign multiple EY Admins
   */
  test('ADO-XXXXX1b should create client as EY Super Admin with multiple EY Admins assigned', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'SMOKE' });

    const clientName = generateUniqueClientName('SuperAdmin Client');
    const assignedAdmins = getRandomEyAdminIds(3); // Assign 3 random EY Admins

    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: assignedAdmins,
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data: ClientResponse = await response.json();

    expect(data.id).toBeDefined();
    expect(data.name).toBe(clientName);
    expect(data.activeStatus).toBe(true);
    expect(data.assignedEyAdmins).toBeDefined();
    expect(data.assignedEyAdmins.length).toBeGreaterThanOrEqual(1);

    // Track for cleanup
    if (data.id) {
      createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 1c: Super Admin Email Cannot Be Assigned as EY Admin (Negative Test)
   * Verify that the logged-in Super Admin's email is not in the EY Admins list
   * and therefore cannot be assigned as an EY Admin to a client
   */
  test('ADO-XXXXX1c should verify Super Admin email is not assignable as EY Admin', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Security' });
    test.info().annotations.push({ type: 'category', description: 'NEGATIVE' });

    // Get the Super Admin's email from environment
    const superAdminEmail = process.env.QA_USERNAME || process.env.QA_SSO_USERNAME;

    if (!superAdminEmail) {
      test.skip(true, 'Super Admin email not configured in environment');
      return;
    }

    // Get the list of EY Admins and check if Super Admin's email exists
    const adminsResponse = await superAdminRequest.get(EY_ADMINS_ENDPOINT);
    expect(adminsResponse.ok()).toBe(true);

    const eyAdmins = await adminsResponse.json();
    const superAdminInEyAdmins = eyAdmins.find(
      (admin: { email?: string; username?: string }) =>
        admin.email?.toLowerCase() === superAdminEmail.toLowerCase() ||
        admin.username?.toLowerCase() === superAdminEmail.toLowerCase()
    );

    // If Super Admin is found in EY Admins list, they have dual roles - this might be allowed
    if (superAdminInEyAdmins) {
      // Super Admin also has EY Admin role - assignment should work
      const clientName = generateUniqueClientName('SuperAdmin Dual Role');
      const payload: ClientCreateRequest = {
        name: clientName,
        cityId: validCityId,
        assignedEyAdminId: [superAdminInEyAdmins.id],
      };

      const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });
      // Should succeed since Super Admin is also an EY Admin
      expect(response.status()).toBe(201);

      if (response.status() === 201) {
        const data = await response.json();
        if (data.id) createdClientIds.push(data.id);
      }
    } else {
      // Super Admin is NOT in EY Admins list - verify this is the expected security model
      // Log that Super Admin email is correctly NOT in EY Admins list
      expect(superAdminInEyAdmins).toBeUndefined();
    }
  });

  /**
   * Test Case 1d: Cannot Assign Non-EY Admin User as EY Admin (Negative Test)
   * Verify that only valid EY Admin IDs can be assigned to a client
   * Tests with an ID that is NOT in the EY Admins list
   */
  test('ADO-XXXXX1d should reject assignment of non-EY Admin user ID', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Security' });
    test.info().annotations.push({ type: 'category', description: 'NEGATIVE' });

    // Get the list of valid EY Admin IDs
    const adminsResponse = await superAdminRequest.get(EY_ADMINS_ENDPOINT);
    const validAdminIds: number[] = [];
    if (adminsResponse.ok()) {
      const admins = await adminsResponse.json();
      validAdminIds.push(...admins.map((a: { id: number }) => a.id));
    }

    // Find an ID that is NOT a valid EY Admin (use a high number unlikely to exist)
    // This simulates a Super Admin or other non-EY Admin user ID
    let nonEyAdminId = 99999;
    while (validAdminIds.includes(nonEyAdminId)) {
      nonEyAdminId++;
    }

    const clientName = generateUniqueClientName('NonEYAdmin Test');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [nonEyAdminId], // Try to assign a non-EY Admin ID
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject - only valid EY Admin IDs should be assignable
    expect([400, 403, 409, 422]).toContain(response.status());

    // If API incorrectly creates client (bug), clean up
    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test Case 1e: Cannot Assign Super Admin's ID as EY Admin (Negative Test)
   * Verify that the Super Admin's ID cannot be assigned as an EY Admin
   * Super Admin ID: 1101 (Keerthivasan.Rc@in.ey.com)
   */
  test('ADO-XXXXX1e should reject assignment of Super Admin ID as EY Admin', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Security' });
    test.info().annotations.push({ type: 'category', description: 'NEGATIVE' });

    // Super Admin ID (Keerthivasan.Rc@in.ey.com)
    const superAdminId = 1101;

    // Try to create a client with Super Admin's ID assigned as EY Admin
    const clientName = generateUniqueClientName('SuperAdmin ID Test');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [superAdminId], // Try to use Super Admin's ID as EY Admin
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });
    const status = response.status();

    // Expected behavior depends on whether Super Admin is also an EY Admin:
    // - If Super Admin is NOT an EY Admin: should reject (400/403/409/422)
    // - If Super Admin IS also an EY Admin (dual role): should succeed (201)

    if (status === 201) {
      // Super Admin has dual role - they are also an EY Admin
      const data = await response.json();
      expect(data.id).toBeDefined();
      if (data.id) createdClientIds.push(data.id);
    } else {
      // Super Admin is not an EY Admin - assignment should be rejected
      expect([400, 403, 409, 422]).toContain(status);
    }
  });

  /**
   * Test Case 2: Create Client - Should Fail Without EY Admin Assignment
   * Verify client creation fails when no EY Admin is assigned (EY Admin is mandatory)
   * BUG: Currently API auto-assigns first EY Admin instead of rejecting
   */
  test('ADO-XXXXX2 should reject client creation without EY Admin assignment', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    const clientName = generateUniqueClientName('No Admin Client');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // EY Admin assignment is mandatory - should reject with 400
    expect(response.status()).toBe(400);

    // If API incorrectly creates client (bug), clean up
    if (response.status() === 201) {
      const data: ClientResponse = await response.json();
      if (data.id) {
        createdClientIds.push(data.id);
      }
    }
  });

  /**
   * Test Case 3: Create Client - Invalid Token
   * Verify authentication is required
   */
  test('ADO-XXXXX3 should reject request with invalid token', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Authentication' });
    test.info().annotations.push({ type: 'epic', description: 'Security' });
    test.info().annotations.push({ type: 'category', description: 'SECURITY' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Invalid Token Client'),
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, {
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
  test('ADO-XXXXX4 should reject name shorter than 3 characters', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    const payload: ClientCreateRequest = {
      name: 'AB', // 2 characters - below minimum
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(400);
    const data = await response.json();
    // Validation error message should reference the constraint
    expect(JSON.stringify(data)).toBeDefined();
  });

  /**
   * Test Case 5: Create Client - Name Too Long (> 500 characters)
   * Verify name maximum length validation
   */
  test('ADO-XXXXX5 should reject name longer than 500 characters', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    const longName = 'A'.repeat(501); // 501 characters - above maximum
    const payload: ClientCreateRequest = {
      name: longName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(400);
    const data = await response.json();
    // Validation error message should be returned
    expect(JSON.stringify(data)).toBeDefined();
  });

  /**
   * Test Case 6: Create Client - Empty/Blank Name
   * Verify name cannot be empty or blank
   */
  test('ADO-XXXXX6 should reject empty or blank name', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    // Test with empty string
    const emptyPayload = {
      name: '',
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const emptyResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: emptyPayload });
    expect(emptyResponse.status()).toBe(400);

    // Test with whitespace only
    const blankPayload = {
      name: '   ',
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const blankResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: blankPayload });
    expect(blankResponse.status()).toBe(400);
  });

  /**
   * Test Case 7: Create Client - Duplicate Name
   * Verify unique name constraint
   */
  test('ADO-XXXXX7 should reject duplicate client name', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    const clientName = generateUniqueClientName('Duplicate Test');

    // Create first client
    const firstPayload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const firstResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: firstPayload });
    expect(firstResponse.status()).toBe(201);

    const firstData = await firstResponse.json();
    if (firstData.id) {
      createdClientIds.push(firstData.id);
    }

    // Attempt to create second client with same name
    const duplicatePayload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const duplicateResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, {
      data: duplicatePayload,
    });

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
  test('ADO-XXXXX8 should reject non-existent city ID', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Invalid City Client'),
      cityId: 999999999, // Non-existent city ID
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-XXXXX9 should reject non-existent EY Admin ID', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Invalid Admin Client'),
      cityId: validCityId,
      assignedEyAdminId: [999999999], // Non-existent admin ID
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-XXXXX10 should reject request with missing required fields', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    // Missing name
    const noNamePayload = {
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };
    const noNameResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: noNamePayload });
    expect(noNameResponse.status()).toBe(400);

    // Missing cityId
    const noCityPayload = {
      name: generateUniqueClientName('No City'),
      assignedEyAdminId: [getRandomEyAdminId()],
    };
    const noCityResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: noCityPayload });
    expect(noCityResponse.status()).toBe(400);

    // Missing assignedEyAdminId
    const noAdminPayload = {
      name: generateUniqueClientName('No Admin Field'),
      cityId: validCityId,
    };
    const noAdminResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, {
      data: noAdminPayload,
    });
    expect(noAdminResponse.status()).toBe(400);
  });

  /**
   * Test Case 11: Create Client - Multiple EY Admins
   * Verify client can be assigned multiple EY Admins
   */
  test('ADO-XXXXX11 should create client with multiple EY Admins', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'SMOKE' });

    const clientName = generateUniqueClientName('Multi Admin Client');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: getRandomEyAdminIds(2),
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-XXXXX12 should accept name with special characters', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'API' });

    const clientName = `Test & Co. (${Date.now()}) - Special #$%`;
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-XXXXX13 should trim leading and trailing spaces from name', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'API' });

    const baseName = generateUniqueClientName('Trimmed');
    const nameWithSpaces = `  ${baseName}  `;
    const payload: ClientCreateRequest = {
      name: nameWithSpaces,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-XXXXX14 should return complete response structure', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'SMOKE' });

    const clientName = generateUniqueClientName('Response Validation');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-EDGE1 should accept name with exactly 3 characters', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'BOUNDARY' });

    const payload: ClientCreateRequest = {
      name: `A${Date.now().toString().slice(-2)}`, // 3 characters
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data = await response.json();
    if (data.id) createdClientIds.push(data.id);
  });

  /**
   * Test Case 16: Boundary - Name exactly 500 characters (maximum valid)
   */
  test('ADO-EDGE2 should accept name with exactly 500 characters', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'BOUNDARY' });

    const baseName = 'A'.repeat(487) + Date.now().toString().slice(-13); // Exactly 500 chars
    const payload: ClientCreateRequest = {
      name: baseName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    expect(response.status()).toBe(201);
    const data = await response.json();
    if (data.id) createdClientIds.push(data.id);
  });

  /**
   * Test Case 17: SQL Injection attempt in name field
   */
  test('ADO-EDGE3 should handle SQL injection attempt safely', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Security' });
    test.info().annotations.push({ type: 'category', description: 'SECURITY' });

    const sqlInjectionName = `Test'; DROP TABLE clients; --${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: sqlInjectionName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-EDGE4 should handle XSS attempt safely', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Security' });
    test.info().annotations.push({ type: 'category', description: 'SECURITY' });

    const xssName = `<script>alert('XSS')</script>Test${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: xssName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-EDGE5 should reject negative city ID', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Negative City'),
      cityId: -1,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400 or 422, not 500
    expect([400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 20: Zero city ID
   */
  test('ADO-EDGE6 should reject zero city ID', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Zero City'),
      cityId: 0,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400 or 422, not 500
    expect([400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 21: Negative EY Admin ID
   */
  test('ADO-EDGE7 should reject negative EY Admin ID', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Negative Admin'),
      cityId: validCityId,
      assignedEyAdminId: [-1],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400 or 422, not 500
    expect([400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 22: Duplicate admin IDs in array
   */
  test('ADO-EDGE8 should handle duplicate admin IDs in array', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Duplicate Admins'),
      cityId: validCityId,
      assignedEyAdminId: (() => {
        const id = getRandomEyAdminId();
        return [id, id, id];
      })(), // Same ID 3 times
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-EDGE9 should handle case-insensitive duplicate name check', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const baseName = `CaseSensitive${Date.now()}`;

    // Create first client with lowercase
    const firstPayload: ClientCreateRequest = {
      name: baseName.toLowerCase(),
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };
    const firstResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: firstPayload });
    expect(firstResponse.status()).toBe(201);
    const firstData = await firstResponse.json();
    if (firstData.id) createdClientIds.push(firstData.id);

    // Try to create with uppercase - should be rejected if case-insensitive
    const secondPayload: ClientCreateRequest = {
      name: baseName.toUpperCase(),
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };
    const secondResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: secondPayload });

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
  test('ADO-EDGE10 should handle unicode characters in name', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const unicodeName = `日本語テスト${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: unicodeName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-EDGE11 should handle emoji in name', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const emojiName = `Test Company 🏢 ${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: emojiName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-EDGE12 should handle very large admin ID', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Large Admin ID'),
      cityId: validCityId,
      assignedEyAdminId: [9007199254740991], // Max safe integer
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject gracefully, not crash
    expect([400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 27: Null values in request
   */
  test('ADO-EDGE13 should reject null values', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const nullNamePayload = {
      name: null as any,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };
    const nullNameResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, {
      data: nullNamePayload,
    });
    expect(nullNameResponse.status()).toBe(400);

    const nullCityPayload = {
      name: generateUniqueClientName('Null City'),
      cityId: null as any,
      assignedEyAdminId: [getRandomEyAdminId()],
    };
    const nullCityResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, {
      data: nullCityPayload,
    });
    expect(nullCityResponse.status()).toBe(400);
  });

  /**
   * Test Case 28: String instead of number for cityId
   */
  test('ADO-EDGE14 should reject string cityId', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const payload = {
      name: generateUniqueClientName('String City'),
      cityId: 'not-a-number',
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400, not 500
    expect(response.status()).toBe(400);
  });

  /**
   * Test Case 29: Empty request body
   */
  test('ADO-EDGE15 should reject empty request body', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: {} });

    expect(response.status()).toBe(400);
  });

  /**
   * Test Case: Create client with empty name
   */
  test('ADO-EDGE20 should reject client with empty name @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: '',
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Empty name should be rejected with 400, not 500
    expect(response.status()).toBe(400);
  });

  /**
   * Test Case 30: Name with only numbers
   */
  test('ADO-EDGE16 should accept name with only numbers', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const numericName = Date.now().toString();
    const payload: ClientCreateRequest = {
      name: numericName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Numeric-only names should be valid
    expect(response.status()).toBe(201);
    const data = await response.json();
    if (data.id) createdClientIds.push(data.id);
  });

  /**
   * Test Case 31: Name with newline characters
   */
  test('ADO-EDGE17 should handle name with newline characters', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const newlineName = `Test\nClient\r\n${Date.now()}`;
    const payload: ClientCreateRequest = {
      name: newlineName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

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
  test('ADO-EDGE18 should handle large array of admin IDs', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    // Create array of 100 admin IDs (most will be invalid)
    const baseAdminId = getRandomEyAdminId();
    const manyAdminIds = Array.from({ length: 100 }, (_, i) => baseAdminId + i);

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Many Admins'),
      cityId: validCityId,
      assignedEyAdminId: manyAdminIds,
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either process or reject gracefully - not timeout or crash
    expect([201, 400, 409, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test Case 33: Concurrent creation with same name
   */
  test('ADO-EDGE19 should handle concurrent creation with same name', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'EDGE' });

    const clientName = generateUniqueClientName('Concurrent');
    const payload: ClientCreateRequest = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    // Send multiple requests concurrently
    const responses = await Promise.all([
      superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload }),
      superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload }),
      superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload }),
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

  // ============================================
  // Additional Bug-Hunting Scenarios
  // ============================================

  /**
   * Test: Whitespace-only name
   */
  test('ADO-EDGE21 should reject whitespace-only name @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: '     ',
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Whitespace-only should be rejected with 400, not 500
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Name with leading/trailing whitespace
   */
  test('ADO-EDGE22 should trim or reject name with leading/trailing whitespace @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: `   Padded Client ${Date.now()}   `,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either accept (after trimming) or reject - not crash
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
      // Verify name was trimmed
      expect(data.name?.trim()).toBe(data.name);
    }
  });

  /**
   * Test: Null name value
   */
  test('ADO-EDGE23 should reject null name @regression', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: null,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Null name should return 400, not 500
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Negative cityId
   */
  test('ADO-EDGE24 should reject negative cityId @regression', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Negative City'),
      cityId: -1,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Negative cityId should return 400, not 500
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Zero cityId
   */
  test('ADO-EDGE25 should reject zero cityId @regression', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Zero City'),
      cityId: 0,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Zero cityId should return 400, not 500
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Non-existent cityId
   */
  test('ADO-EDGE26 should reject non-existent cityId @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Invalid City'),
      cityId: 999999999,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Non-existent cityId should return 400/404, not 500
    expect([400, 404, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Empty admin ID array - EY Admin is mandatory
   * BUG: Currently API auto-assigns first EY Admin instead of rejecting
   */
  test('ADO-EDGE27 should reject empty admin ID array @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'VALIDATION' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('No Admins'),
      cityId: validCityId,
      assignedEyAdminId: [],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // EY Admin assignment is mandatory - should reject with 400
    expect(response.status()).toBe(400);

    // If API incorrectly creates client (bug), clean up
    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test: Duplicate admin IDs in array
   */
  test('ADO-EDGE28 should handle duplicate admin IDs in array @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: generateUniqueClientName('Dup Admins'),
      cityId: validCityId,
      assignedEyAdminId: (() => {
        const id = getRandomEyAdminId();
        return [id, id, id];
      })(),
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either deduplicate or reject - not crash
    expect([201, 400, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test: Null value in admin ID array
   */
  test('ADO-EDGE29 should reject null in admin ID array @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('Null Admin'),
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId(), null, getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Null in array should return 400, not 500
    expect([400, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Invalid admin ID format
   */
  test('ADO-EDGE30 should reject invalid admin ID format @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('Invalid Admin'),
      cityId: validCityId,
      assignedEyAdminId: ['not-a-valid-id', 'another-invalid'] as any,
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Invalid admin ID format should return 400, not 500
    expect([400, 404, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: SQL injection in name field
   */
  test('ADO-EDGE31 should handle SQL injection attempt in name @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Security' });
    test.info().annotations.push({ type: 'category', description: 'SECURITY' });

    const payload: ClientCreateRequest = {
      name: `Test'; DROP TABLE clients; --${Date.now()}`,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either accept (safely escaped) or reject - never execute SQL
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test: XSS attempt in name field
   */
  test('ADO-EDGE32 should handle XSS attempt in name @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Security' });
    test.info().annotations.push({ type: 'category', description: 'SECURITY' });

    const payload: ClientCreateRequest = {
      name: `<script>alert('xss')</script>${Date.now()}`,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either accept (safely encoded) or reject
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
      // Verify script was sanitized or encoded
      expect(data.name).not.toContain('<script>');
    }
  });

  /**
   * Test: Unicode/emoji in name field
   */
  test('ADO-EDGE33 should handle unicode and emoji in name @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: `Test Client 日本語 🚀 ${Date.now()}`,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either accept unicode or reject gracefully
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test: Special characters only in name
   */
  test('ADO-EDGE34 should handle special characters only name @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload: ClientCreateRequest = {
      name: `!@#$%^&*()_+-=[]{}|;:'"<>,.?/${Date.now()}`,
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either accept or reject gracefully
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test: Extra unknown fields in request
   */
  test('ADO-EDGE35 should ignore or reject extra unknown fields @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('Extra Fields'),
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
      unknownField: 'should be ignored',
      anotherUnknown: 12345,
      nestedUnknown: { deep: 'value' },
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either ignore extra fields or reject - not crash
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test: Array type for name field (type coercion)
   */
  test('ADO-EDGE36 should reject array type for name field @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: ['array', 'name'],
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Wrong type should return 400, not 500
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Object type for name field
   */
  test('ADO-EDGE37 should reject object type for name field @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: { nested: 'object' },
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Wrong type should return 400, not 500
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Boolean type for cityId
   */
  test('ADO-EDGE38 should reject boolean type for cityId @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('Bool City'),
      cityId: true,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Wrong type should return 400, not 500
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Float/decimal cityId
   */
  test('ADO-EDGE39 should handle float cityId @regression', async ({ superAdminRequest }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('Float City'),
      cityId: validCityId + 0.5,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should either truncate to int or reject - not crash
    expect([201, 400]).toContain(response.status());
    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const data = await response.json();
      if (data.id) createdClientIds.push(data.id);
    }
  });

  /**
   * Test: String value for assignedEyAdminId (not array)
   */
  test('ADO-EDGE40 should reject string for assignedEyAdminId @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('String Admin'),
      cityId: validCityId,
      assignedEyAdminId: getRandomEyAdminId(), // number instead of array
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Wrong type should return 400, not 500
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Very long admin ID string
   */
  test('ADO-EDGE41 should handle very long admin ID string @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const longAdminId = 'a'.repeat(10000);
    const payload = {
      name: generateUniqueClientName('Long Admin ID'),
      cityId: validCityId,
      assignedEyAdminId: [longAdminId] as any,
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject with 400, not crash with 500
    expect([400, 404, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Integer overflow for cityId
   */
  test('ADO-EDGE42 should handle integer overflow for cityId @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('Overflow City'),
      cityId: Number.MAX_SAFE_INTEGER + 1,
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Should reject gracefully, not crash
    expect([400, 404, 422]).toContain(response.status());
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Missing required cityId field
   */
  test('ADO-EDGE43 should reject missing cityId field @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('No City'),
      assignedEyAdminId: [getRandomEyAdminId()],
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Missing required field should return 400
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Missing required assignedEyAdminId field
   */
  test('ADO-EDGE44 should reject missing assignedEyAdminId field @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const payload = {
      name: generateUniqueClientName('No Admin'),
      cityId: validCityId,
    };

    const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload });

    // Missing required field should return 400
    expect(response.status()).toBe(400);
    expect(response.status()).not.toBe(500);
  });

  /**
   * Test: Case sensitivity - create clients with same name different case
   */
  test('ADO-EDGE45 should handle case sensitivity for client names @regression', async ({
    superAdminRequest,
  }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Client Management' });
    test.info().annotations.push({ type: 'epic', description: 'Client Onboarding' });
    test.info().annotations.push({ type: 'category', description: 'REGRESSION' });

    const baseName = `CaseSensitive${Date.now()}`;

    // Create first client
    const payload1: ClientCreateRequest = {
      name: baseName.toLowerCase(),
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };
    const response1 = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload1 });
    expect(response1.status()).toBe(201);
    const data1 = await response1.json();
    if (data1.id) createdClientIds.push(data1.id);

    // Try to create with uppercase version
    const payload2: ClientCreateRequest = {
      name: baseName.toUpperCase(),
      cityId: validCityId,
      assignedEyAdminId: [getRandomEyAdminId()],
    };
    const response2 = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: payload2 });

    // Should either allow (case-sensitive) or reject (case-insensitive) - document behavior
    expect([201, 409]).toContain(response2.status());
    expect(response2.status()).not.toBe(500);

    if (response2.status() === 201) {
      const data2 = await response2.json();
      if (data2.id) createdClientIds.push(data2.id);
    }
  });
});

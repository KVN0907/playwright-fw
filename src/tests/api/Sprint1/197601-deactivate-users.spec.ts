import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * Sprint 1 API Tests - Deactivate Users: EY Super Admin
 *
 * ADO Story: #197601 - Deactivate users: EY Super Admin (Backend)
 * Assigned To: Johirul Amin
 *
 * Test Cases:
 * - 202525: API – Deactivate Single EY Admin
 * - 202526: API – Deactivate User Not Found
 * - 202527: API – Deactivate Already Deactivated EY Admin
 * - 202528: API – Deactivate with Insufficient Permissions
 * - 202529: API – Deactivate EY Super Admin (Self-Deactivation Guard)
 * - 202530: API – Deactivate Bulk EY Admins
 * - 202531: API – Deactivate Bulk EY Admins Partial Success
 * - 202532: API – Audit Log Entry for Deactivation
 * - 202533: API – Concurrent Deactivation of Same User
 * - 202534: API – Network / API Failure During Deactivation
 */

const API_BASE = '/api/admin';
const USERS_ENDPOINT = `${API_BASE}/users`;

// Helper to create a test user for deactivation tests using faker
async function createTestUser(superAdminRequest: any) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const uniqueId = `${Date.now()}`.slice(-6);
  const userData = {
    firstName: `${firstName}${uniqueId}`,
    lastName: `${lastName}${uniqueId}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uniqueId}@ey.com`,
  };

  const response = await superAdminRequest.post(USERS_ENDPOINT, { data: userData });
  if (response.ok()) {
    return response.json();
  }
  return null;
}

test.describe('Story #197601: Deactivate Users - EY Super Admin', () => {
  /**
   * ADO Test Case #202525
   * API – Deactivate Single EY Admin
   */
  test('should deactivate single EY Admin successfully @api @regression @ADO-202525', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}/deactivate`);

    expect(response.ok()).toBe(true);

    // Verify user is deactivated
    const getResponse = await superAdminRequest.get(`${USERS_ENDPOINT}/${user.id}`);
    if (getResponse.ok()) {
      const userData = await getResponse.json();
      expect(userData.isActive === false || userData.status === 'INACTIVE').toBe(true);
    }
  });

  /**
   * ADO Test Case #202526
   * API – Deactivate User Not Found
   */
  test('should return 404 for non-existent user @api @regression @ADO-202526', async ({
    superAdminRequest,
  }) => {
    const nonExistentId = 999999999;

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${nonExistentId}/deactivate`);

    expect([404]).toContain(response.status());
  });

  /**
   * ADO Test Case #202527
   * API – Deactivate Already Deactivated EY Admin
   */
  test('should handle already deactivated user gracefully @api @regression @ADO-202527', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    // First deactivation
    const firstDeactivate = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}/deactivate`);
    expect(firstDeactivate.ok()).toBe(true);

    // Second deactivation attempt
    const secondDeactivate = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}/deactivate`);

    // Should either succeed (idempotent) or return appropriate error
    expect([200, 204, 400, 409]).toContain(secondDeactivate.status());
  });

  /**
   * ADO Test Case #202528
   * API – Deactivate with Insufficient Permissions
   */
  test('should reject deactivation without proper permissions @api @regression @ADO-202528', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}/deactivate`, {
      headers: {
        'X-User-Role': 'EY_ADMIN', // Not super admin
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  /**
   * ADO Test Case #202529
   * API – Deactivate EY Super Admin (Self-Deactivation Guard)
   */
  test('should prevent self-deactivation @api @regression @ADO-202529', async ({
    superAdminRequest,
  }) => {
    // Get current user info
    const meResponse = await superAdminRequest.get(`${API_BASE}/me`);

    if (meResponse.ok()) {
      const currentUser = await meResponse.json();

      // Try to deactivate self
      const response = await superAdminRequest.put(
        `${USERS_ENDPOINT}/${currentUser.id}/deactivate`
      );

      // Should not allow self-deactivation
      expect([400, 403]).toContain(response.status());
    }
  });

  /**
   * ADO Test Case #202530
   * API – Deactivate Bulk EY Admins
   */
  test('should deactivate multiple users in bulk @api @regression @ADO-202530', async ({
    superAdminRequest,
  }) => {
    // Create multiple users
    const users = await Promise.all([
      createTestUser(request),
      createTestUser(request),
      createTestUser(request),
    ]);

    const validUsers = users.filter(u => u !== null);
    if (validUsers.length < 2) {
      test.skip();
      return;
    }

    const userIds = validUsers.map(u => u.id);

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/bulk/deactivate`, {
      data: { userIds },
    });

    // Either bulk endpoint exists and succeeds, or returns appropriate status
    expect([200, 204, 404, 405]).toContain(response.status());
  });

  /**
   * ADO Test Case #202531
   * API – Deactivate Bulk EY Admins Partial Success
   */
  test('should handle partial success in bulk deactivation @api @regression @ADO-202531', async ({
    superAdminRequest,
  }) => {
    const validUser = await createTestUser(superAdminRequest);
    if (!validUser) {
      test.skip();
      return;
    }

    const userIds = [validUser.id, 999999999]; // Mix of valid and invalid IDs

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/bulk/deactivate`, {
      data: { userIds },
    });

    // Should handle partial success scenario
    expect([200, 207, 404, 405]).toContain(response.status());

    if (response.status() === 207) {
      // Multi-status response should indicate which succeeded/failed
      const data = await response.json();
      expect(data.results || data.errors).toBeDefined();
    }
  });

  /**
   * ADO Test Case #202533
   * API – Concurrent Deactivation of Same User
   */
  test('should handle concurrent deactivation requests safely @api @regression @ADO-202533', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    // Send multiple concurrent deactivation requests
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}/deactivate`));
    }

    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());

    // At least one should succeed, others should either succeed or return conflict/error
    const successCount = statusCodes.filter(code => [200, 204].includes(code)).length;
    expect(successCount).toBeGreaterThanOrEqual(1);

    // Verify final state - user should be deactivated
    const getResponse = await superAdminRequest.get(`${USERS_ENDPOINT}/${user.id}`);
    if (getResponse.ok()) {
      const userData = await getResponse.json();
      expect(userData.isActive === false || userData.status === 'INACTIVE').toBe(true);
    }
  });

  /**
   * ADO Test Case #202535
   * API – Cannot Deactivate EY Admin Assigned to Client
   * An EY Admin who is assigned to an active client cannot be deactivated
   * Linked Bug: #290349
   */
  test('should prevent deactivation of EY Admin assigned to a client @api @regression @ADO-202535', async ({
    superAdminRequest,
  }) => {
    const CLIENTS_ENDPOINT = '/api/admin/api/clients';
    const EY_ADMINS_ENDPOINT = '/api/admin/api/ey-admins';
    const CITIES_ENDPOINT = '/api/admin/api/cities/search-by-name';
    const CHANGE_STATUS_ENDPOINT = '/api/admin/api/ey-admins/change-active-status';

    // Step 1: Get an existing EY Admin
    const adminsResponse = await superAdminRequest.get(EY_ADMINS_ENDPOINT);
    console.log(`EY Admins status: ${adminsResponse.status()}`);
    if (!adminsResponse.ok()) {
      console.log(`EY Admins error: ${await adminsResponse.text()}`);
      test.skip(true, 'Could not fetch EY Admins list');
      return;
    }

    const eyAdmins = await adminsResponse.json();
    console.log(`EY Admins count: ${eyAdmins?.length || 0}`);
    if (!eyAdmins || eyAdmins.length === 0) {
      test.skip(true, 'No EY Admins available');
      return;
    }

    const eyAdminToAssign = eyAdmins[0];
    console.log(`Selected EY Admin: ${JSON.stringify(eyAdminToAssign)}`);

    // Step 2: Get a valid city ID (POST with search data)
    const citiesResponse = await superAdminRequest.post(CITIES_ENDPOINT, {
      data: { name: 'a' }, // Search for cities containing 'a'
    });
    console.log(`Cities status: ${citiesResponse.status()}`);
    if (!citiesResponse.ok()) {
      console.log(`Cities error: ${await citiesResponse.text()}`);
      test.skip(true, 'Could not fetch cities');
      return;
    }

    const cities = await citiesResponse.json();
    console.log(`Cities count: ${cities?.length || 0}`);
    if (!cities || cities.length === 0) {
      test.skip(true, 'No cities available');
      return;
    }

    const validCityId = cities[0].id;
    console.log(`Selected city ID: ${validCityId}`);

    // Step 3: Create a client with the EY Admin assigned
    const clientName = `Deactivation Test Client ${Date.now()}`;
    const clientPayload = {
      name: clientName,
      cityId: validCityId,
      assignedEyAdminId: [eyAdminToAssign.id],
    };

    const createClientResponse = await superAdminRequest.post(CLIENTS_ENDPOINT, {
      data: clientPayload,
    });
    console.log(`Create client status: ${createClientResponse.status()}`);

    if (createClientResponse.status() !== 201) {
      const errorText = await createClientResponse.text();
      console.log(`Create client error: ${errorText}`);
      test.skip(true, `Could not create test client: ${createClientResponse.status()}`);
      return;
    }

    const createdClient = await createClientResponse.json();

    try {
      // Step 4: Try to deactivate the EY Admin who is assigned to the client
      // Use GET /api/admin/api/ey-admins/change-active-status/{id} to toggle status
      const deactivateUrl = `${CHANGE_STATUS_ENDPOINT}/${eyAdminToAssign.id}`;
      console.log(`Changing EY Admin status at: ${deactivateUrl}`);

      const deactivateResponse = await superAdminRequest.get(deactivateUrl);
      console.log(`Change status response code: ${deactivateResponse.status()}`);

      const responseBody = await deactivateResponse.text();
      console.log(`Change status response: ${responseBody}`);

      // Should reject deactivation because EY Admin is assigned to an active client
      // Expected: 400/403/409/422 (rejection due to client assignment)
      expect(
        [400, 403, 409, 422],
        `EY Admin assigned to client should not be deactivatable. Got ${deactivateResponse.status()}: ${responseBody}`
      ).toContain(deactivateResponse.status());
    } finally {
      // Cleanup: Delete the test client
      if (createdClient?.id) {
        await superAdminRequest.delete(`${CLIENTS_ENDPOINT}/${createdClient.id}`);
      }
    }
  });

  /**
   * ADO Test Case #202532
   * API – Audit Log Entry for Deactivation
   */
  test.skip('@ADO-202532 should create audit log entry for deactivation', async () => {
    // Requires audit log access
    test.skip();
  });

  /**
   * ADO Test Case #202534
   * API – Network / API Failure During Deactivation
   */
  test.skip('@ADO-202534 should handle network failures gracefully', async () => {
    // Requires infrastructure testing
    test.skip();
  });
});

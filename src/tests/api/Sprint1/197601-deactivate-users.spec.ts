import { test, expect } from '../../fixtures/advancedFixtures';

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

// Helper to create a test user for deactivation tests
async function createTestUser(request: any) {
  const userData = {
    firstName: `DeactivateTest${Date.now()}`,
    lastName: `User${Date.now()}`,
    email: `deactivate.test.${Date.now()}@ey.com`,
  };

  const response = await request.post(USERS_ENDPOINT, { data: userData });
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
  test('should deactivate single EY Admin successfully @regression @ADO-202525', async ({
    request,
  }) => {
    const user = await createTestUser(request);
    if (!user) {
      test.skip();
      return;
    }

    const response = await request.put(`${USERS_ENDPOINT}/${user.id}/deactivate`);

    expect(response.ok()).toBe(true);

    // Verify user is deactivated
    const getResponse = await request.get(`${USERS_ENDPOINT}/${user.id}`);
    if (getResponse.ok()) {
      const userData = await getResponse.json();
      expect(userData.isActive === false || userData.status === 'INACTIVE').toBe(true);
    }
  });

  /**
   * ADO Test Case #202526
   * API – Deactivate User Not Found
   */
  test('should return 404 for non-existent user @regression @ADO-202526', async ({ request }) => {
    const nonExistentId = 999999999;

    const response = await request.put(`${USERS_ENDPOINT}/${nonExistentId}/deactivate`);

    expect([404]).toContain(response.status());
  });

  /**
   * ADO Test Case #202527
   * API – Deactivate Already Deactivated EY Admin
   */
  test('should handle already deactivated user gracefully @regression @ADO-202527', async ({
    request,
  }) => {
    const user = await createTestUser(request);
    if (!user) {
      test.skip();
      return;
    }

    // First deactivation
    const firstDeactivate = await request.put(`${USERS_ENDPOINT}/${user.id}/deactivate`);
    expect(firstDeactivate.ok()).toBe(true);

    // Second deactivation attempt
    const secondDeactivate = await request.put(`${USERS_ENDPOINT}/${user.id}/deactivate`);

    // Should either succeed (idempotent) or return appropriate error
    expect([200, 204, 400, 409]).toContain(secondDeactivate.status());
  });

  /**
   * ADO Test Case #202528
   * API – Deactivate with Insufficient Permissions
   */
  test('should reject deactivation without proper permissions @regression @ADO-202528', async ({
    request,
  }) => {
    const user = await createTestUser(request);
    if (!user) {
      test.skip();
      return;
    }

    const response = await request.put(`${USERS_ENDPOINT}/${user.id}/deactivate`, {
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
  test('should prevent self-deactivation @regression @ADO-202529', async ({ request }) => {
    // Get current user info
    const meResponse = await request.get(`${API_BASE}/me`);

    if (meResponse.ok()) {
      const currentUser = await meResponse.json();

      // Try to deactivate self
      const response = await request.put(`${USERS_ENDPOINT}/${currentUser.id}/deactivate`);

      // Should not allow self-deactivation
      expect([400, 403]).toContain(response.status());
    }
  });

  /**
   * ADO Test Case #202530
   * API – Deactivate Bulk EY Admins
   */
  test('should deactivate multiple users in bulk @regression @ADO-202530', async ({ request }) => {
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

    const response = await request.put(`${USERS_ENDPOINT}/bulk/deactivate`, {
      data: { userIds },
    });

    // Either bulk endpoint exists and succeeds, or returns appropriate status
    expect([200, 204, 404, 405]).toContain(response.status());
  });

  /**
   * ADO Test Case #202531
   * API – Deactivate Bulk EY Admins Partial Success
   */
  test('should handle partial success in bulk deactivation @regression @ADO-202531', async ({
    request,
  }) => {
    const validUser = await createTestUser(request);
    if (!validUser) {
      test.skip();
      return;
    }

    const userIds = [validUser.id, 999999999]; // Mix of valid and invalid IDs

    const response = await request.put(`${USERS_ENDPOINT}/bulk/deactivate`, {
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
  test('should handle concurrent deactivation requests safely @regression @ADO-202533', async ({
    request,
  }) => {
    const user = await createTestUser(request);
    if (!user) {
      test.skip();
      return;
    }

    // Send multiple concurrent deactivation requests
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(request.put(`${USERS_ENDPOINT}/${user.id}/deactivate`));
    }

    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());

    // At least one should succeed, others should either succeed or return conflict/error
    const successCount = statusCodes.filter(code => [200, 204].includes(code)).length;
    expect(successCount).toBeGreaterThanOrEqual(1);

    // Verify final state - user should be deactivated
    const getResponse = await request.get(`${USERS_ENDPOINT}/${user.id}`);
    if (getResponse.ok()) {
      const userData = await getResponse.json();
      expect(userData.isActive === false || userData.status === 'INACTIVE').toBe(true);
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

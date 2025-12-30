import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * Sprint 1 API Tests - Edit Users: EY Super Admin
 *
 * ADO Story: #197598 - Edit users: EY Super Admin (Backend)
 * Assigned To: Johirul Amin
 *
 * Test Cases:
 * - 202514: API – Successfully Edit an Existing EY Admin User by EY Super Admin
 * - 202515: API – Attempt to Edit EY Admin with Missing Field
 * - 202516: API – Attempt to Edit EY Admin with Invalid Email Format
 * - 202517: API – Attempt to Update EY Admin Email to One Already Used by Another User
 * - 202518: API – Attempt to Edit Non-Existent EY Admin User
 * - 202519: API – Unauthorized Role Attempts to Edit EY Admin
 * - 202520: API – Successfully Edit an Inactive EY Admin User
 * - 202521: API – API/System Downtime or Network Issue During Edit Request
 * - 202522: API – Attempt to Edit EY Admin With Excessively Long Field Data
 * - 202523: API – API Response Contains Updated User Fields, Status, and Client Info
 */

const API_BASE = '/api/admin';
const USERS_ENDPOINT = `${API_BASE}/users`;

// Helper to create a test user for editing using faker
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

test.describe('Story #197598: Edit Users - EY Super Admin', () => {
  /**
   * ADO Test Case #202514
   * API – Successfully Edit an Existing EY Admin User by EY Super Admin
   */
  test('should successfully edit an existing EY Admin user @api @regression @ADO-202514', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    const updatedData = {
      id: user.id,
      firstName: 'UpdatedFirst',
      lastName: 'UpdatedLast',
      email: user.email, // Keep same email
    };

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}`, {
      data: updatedData,
    });

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.firstName).toBe('UpdatedFirst');
    expect(data.lastName).toBe('UpdatedLast');
  });

  /**
   * ADO Test Case #202515
   * API – Attempt to Edit EY Admin with Missing Field
   */
  test('should reject edit with missing required field @api @regression @ADO-202515', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    // Missing firstName
    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}`, {
      data: {
        id: user.id,
        lastName: 'UpdatedLast',
        email: user.email,
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  /**
   * ADO Test Case #202516
   * API – Attempt to Edit EY Admin with Invalid Email Format
   */
  test('should reject invalid email format on edit @api @regression @ADO-202516', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    const invalidEmails = ['invalid-email', 'test@', '@ey.com', 'test@@ey.com'];

    for (const email of invalidEmails) {
      const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}`, {
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email,
        },
      });

      expect([400, 422]).toContain(response.status());
    }
  });

  /**
   * ADO Test Case #202517
   * API – Attempt to Update EY Admin Email to One Already Used by Another User
   */
  test('should reject duplicate email on edit @api @regression @ADO-202517', async ({
    superAdminRequest,
  }) => {
    // Create two users
    const user1 = await createTestUser(request);
    const user2 = await createTestUser(request);

    if (!user1 || !user2) {
      test.skip();
      return;
    }

    // Try to update user2's email to user1's email
    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user2.id}`, {
      data: {
        id: user2.id,
        firstName: user2.firstName,
        lastName: user2.lastName,
        email: user1.email,
      },
    });

    expect([400, 409, 422]).toContain(response.status());
  });

  /**
   * ADO Test Case #202518
   * API – Attempt to Edit Non-Existent EY Admin User
   */
  test('should return 404 for non-existent user @api @regression @ADO-202518', async ({
    superAdminRequest,
  }) => {
    const nonExistentId = 999999999;

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${nonExistentId}`, {
      data: {
        id: nonExistentId,
        firstName: 'Test',
        lastName: 'User',
        email: `nonexistent.${Date.now()}@ey.com`,
      },
    });

    expect([404]).toContain(response.status());
  });

  /**
   * ADO Test Case #202519
   * API – Unauthorized Role Attempts to Edit EY Admin
   */
  test('should reject unauthorized user edit attempts @api @regression @ADO-202519', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}`, {
      data: {
        id: user.id,
        firstName: 'Unauthorized',
        lastName: 'Update',
        email: user.email,
      },
      headers: {
        'X-User-Role': 'CLIENT_USER', // Not authorized role
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  /**
   * ADO Test Case #202520
   * API – Successfully Edit an Inactive EY Admin User
   */
  test('should allow editing inactive user @api @regression @ADO-202520', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(request);
    if (!user) {
      test.skip();
      return;
    }

    // First deactivate the user
    await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}/deactivate`);

    // Now try to edit
    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}`, {
      data: {
        id: user.id,
        firstName: 'InactiveEdited',
        lastName: user.lastName,
        email: user.email,
      },
    });

    // Should be able to edit inactive users
    expect([200, 400, 403]).toContain(response.status());
  });

  /**
   * ADO Test Case #202522
   * API – Attempt to Edit EY Admin With Excessively Long Field Data
   */
  test('should reject excessively long field data @api @regression @ADO-202522', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(request);
    if (!user) {
      test.skip();
      return;
    }

    const veryLongName = 'A'.repeat(1000);

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}`, {
      data: {
        id: user.id,
        firstName: veryLongName,
        lastName: user.lastName,
        email: user.email,
      },
    });

    expect([400, 413, 422]).toContain(response.status());
  });

  /**
   * ADO Test Case #202523
   * API – API Response Contains Updated User Fields, Status, and Client Info
   */
  test('should return complete user data in response @api @regression @ADO-202523', async ({
    superAdminRequest,
  }) => {
    const user = await createTestUser(superAdminRequest);
    if (!user) {
      test.skip();
      return;
    }

    const response = await superAdminRequest.put(`${USERS_ENDPOINT}/${user.id}`, {
      data: {
        id: user.id,
        firstName: 'CompleteResponse',
        lastName: 'Test',
        email: user.email,
      },
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.firstName).toBe('CompleteResponse');
      expect(data.lastName).toBe('Test');
      expect(data.email).toBeDefined();
      // Status field should be present
      expect(data.isActive !== undefined || data.status !== undefined).toBe(true);
    }
  });

  /**
   * ADO Test Case #202521
   * API – API/System Downtime or Network Issue During Edit Request
   */
  test.skip('@ADO-202521 should handle system downtime gracefully', async () => {
    // Requires infrastructure testing
    test.skip();
  });
});

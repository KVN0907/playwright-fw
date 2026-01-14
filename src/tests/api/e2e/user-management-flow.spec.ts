import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * E2E Test: User Management Full Flow
 *
 * This test covers the complete user lifecycle:
 * 1. Create EY Admin user
 * 2. Create Client Admin user
 * 3. Edit user details
 * 4. Deactivate user
 * 5. Reactivate user
 *
 * Related ADO Stories:
 * - #197596: Create EY Admin User
 * - #197592: Create Users
 * - #197598: Edit Users
 * - #197601: Deactivate Users
 */

const API_BASE = '/api/admin/api';

// Cleanup tracker
const cleanup: {
  userIds: number[];
} = {
  userIds: [],
};

test.describe('E2E: User Management Full Flow', () => {
  let createdEyAdminId: number;
  let createdClientAdminId: number;
  let validClientId: number;

  test.beforeAll(async ({ superAdminRequest }) => {
    // Get a valid client ID for client admin creation
    try {
      const clientsResponse = await superAdminRequest.get(`${API_BASE}/clients`);
      if (clientsResponse.ok()) {
        const clients = await clientsResponse.json();
        if (clients?.length > 0) {
          validClientId = clients[0].id;
        }
      }
    } catch {
      // Will skip client admin tests if no client found
    }
  });

  test.afterAll(async ({ superAdminRequest }) => {
    // Cleanup created users
    for (const userId of cleanup.userIds) {
      try {
        await superAdminRequest.delete(`${API_BASE}/users/${userId}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  test('@e2e @smoke Step 1: Create EY Admin user', async ({ superAdminRequest }) => {
    const userEmail = `e2e.eyadmin.${Date.now()}@ey.com`;
    const userName = faker.person.fullName();

    const response = await superAdminRequest.post(`${API_BASE}/ey-admins`, {
      data: {
        email: userEmail,
        name: userName,
        isActive: true,
      },
    });

    expect([200, 201]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      if (data.id) {
        createdEyAdminId = data.id;
        cleanup.userIds.push(data.id);
        expect(data.email).toBe(userEmail);
      }
    }
  });

  test('@e2e @smoke Step 2: Verify EY Admin appears in list', async ({ superAdminRequest }) => {
    test.skip(!createdEyAdminId, 'EY Admin not created');

    const response = await superAdminRequest.get(`${API_BASE}/ey-admins`);
    expect(response.status()).toBe(200);

    const admins = await response.json();
    const ourAdmin = admins.find((a: { id: number }) => a.id === createdEyAdminId);

    expect(ourAdmin).toBeDefined();
  });

  test('@e2e @smoke Step 3: Create Client Admin user', async ({ superAdminRequest }) => {
    test.skip(!validClientId, 'No valid client ID available');

    const userEmail = `e2e.clientadmin.${Date.now()}@test.com`;
    const userName = faker.person.fullName();

    const response = await superAdminRequest.post(`${API_BASE}/users`, {
      data: {
        email: userEmail,
        name: userName,
        clientId: validClientId,
        roleId: 3, // Client Admin role
        isActive: true,
      },
    });

    expect([200, 201]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      if (data.id) {
        createdClientAdminId = data.id;
        cleanup.userIds.push(data.id);
      }
    }
  });

  test('@e2e @smoke Step 4: Edit EY Admin user details', async ({ superAdminRequest }) => {
    test.skip(!createdEyAdminId, 'EY Admin not created');

    const updatedName = `Updated E2E Admin ${Date.now()}`;

    const response = await superAdminRequest.put(`${API_BASE}/ey-admins/${createdEyAdminId}`, {
      data: {
        id: createdEyAdminId,
        name: updatedName,
        isActive: true,
      },
    });

    expect([200, 204]).toContain(response.status());
  });

  test('@e2e @smoke Step 5: Deactivate EY Admin user', async ({ superAdminRequest }) => {
    test.skip(!createdEyAdminId, 'EY Admin not created');

    const response = await superAdminRequest.put(
      `${API_BASE}/ey-admins/${createdEyAdminId}/status`,
      {
        data: {
          isActive: false,
        },
      }
    );

    expect([200, 204]).toContain(response.status());
  });

  test('@e2e @smoke Step 6: Reactivate EY Admin user', async ({ superAdminRequest }) => {
    test.skip(!createdEyAdminId, 'EY Admin not created');

    const response = await superAdminRequest.put(
      `${API_BASE}/ey-admins/${createdEyAdminId}/status`,
      {
        data: {
          isActive: true,
        },
      }
    );

    expect([200, 204]).toContain(response.status());
  });

  test('@e2e @smoke Step 7: Deactivate Client Admin user', async ({ superAdminRequest }) => {
    test.skip(!createdClientAdminId, 'Client Admin not created');

    const response = await superAdminRequest.put(
      `${API_BASE}/users/${createdClientAdminId}/status`,
      {
        data: {
          isActive: false,
        },
      }
    );

    expect([200, 204]).toContain(response.status());
  });
});

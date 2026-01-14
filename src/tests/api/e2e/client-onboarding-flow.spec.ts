import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * E2E Test: Client Onboarding Full Flow
 *
 * This test covers the complete client onboarding workflow:
 * 1. Create a new client with EY Admin assignment
 * 2. Create Client Admin user for the client
 * 3. Assign countries to the client
 * 4. Verify client setup is complete
 *
 * Prerequisites:
 * - Super Admin authentication
 * - Valid city and EY Admin IDs available
 *
 * Related ADO Stories:
 * - #197607: Create New Client
 * - #197592: Create Users
 * - #206272: Assign Client Admin Countries
 */

const API_BASE = '/api/admin/api';
const COMPLIANCE_API = '/api/compliancemanager';

// Test data cleanup tracker
const cleanup: {
  clientIds: number[];
  userIds: number[];
} = {
  clientIds: [],
  userIds: [],
};

test.describe('E2E: Client Onboarding Full Flow', () => {
  let validCityId: number;
  let availableEyAdminIds: number[] = [];
  let createdClientId: number;
  let createdClientAdminId: number;

  test.beforeAll(async ({ superAdminRequest }) => {
    // Fetch valid city ID
    try {
      const cityResponse = await superAdminRequest.post(`${API_BASE}/cities/search-by-name`, {
        data: { name: 'a' },
      });
      if (cityResponse.ok()) {
        const cities = await cityResponse.json();
        if (cities?.length > 0) {
          validCityId = cities[0].id;
        }
      }
    } catch {
      validCityId = 1;
    }

    // Fetch available EY Admin IDs
    try {
      const adminsResponse = await superAdminRequest.get(`${API_BASE}/ey-admins`);
      if (adminsResponse.ok()) {
        const admins = await adminsResponse.json();
        if (admins?.length > 0) {
          availableEyAdminIds = admins.map((admin: { id: number }) => admin.id);
        }
      }
    } catch {
      availableEyAdminIds = [1];
    }

    validCityId = validCityId || 1;
    if (availableEyAdminIds.length === 0) {
      availableEyAdminIds = [1];
    }
  });

  test.afterAll(async ({ superAdminRequest }) => {
    // Cleanup created test data in reverse order
    for (const userId of cleanup.userIds) {
      try {
        await superAdminRequest.delete(`${API_BASE}/users/${userId}`);
      } catch {
        // Ignore cleanup errors
      }
    }
    for (const clientId of cleanup.clientIds) {
      try {
        await superAdminRequest.delete(`${API_BASE}/clients/${clientId}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  test('@e2e @smoke Step 1: Create new client with EY Admin', async ({ superAdminRequest }) => {
    const clientName = `E2E Test Client ${faker.company.name()} ${Date.now()}`;

    const response = await superAdminRequest.post(`${API_BASE}/clients`, {
      data: {
        name: clientName,
        cityId: validCityId,
        assignedEyAdminId: [availableEyAdminIds[0]],
      },
    });

    expect(response.status()).toBe(201);
    const data = await response.json();

    expect(data.id).toBeDefined();
    expect(data.name).toBe(clientName);
    expect(data.activeStatus).toBe(true);
    expect(data.assignedEyAdmins.length).toBeGreaterThanOrEqual(1);

    createdClientId = data.id;
    cleanup.clientIds.push(data.id);
  });

  test('@e2e @smoke Step 2: Create Client Admin user for the client', async ({
    superAdminRequest,
  }) => {
    test.skip(!createdClientId, 'Client not created in previous step');

    const userEmail = `e2e.clientadmin.${Date.now()}@test.ey.com`;
    const userName = faker.person.fullName();

    const response = await superAdminRequest.post(`${API_BASE}/users`, {
      data: {
        email: userEmail,
        name: userName,
        clientId: createdClientId,
        roleId: 3, // Client Admin role
        isActive: true,
      },
    });

    // User creation might return 201 or 200
    expect([200, 201]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      if (data.id) {
        createdClientAdminId = data.id;
        cleanup.userIds.push(data.id);
      }
    }
  });

  test('@e2e @smoke Step 3: Verify client appears in client list', async ({
    superAdminRequest,
  }) => {
    test.skip(!createdClientId, 'Client not created');

    const response = await superAdminRequest.get(`${API_BASE}/clients`);

    expect(response.status()).toBe(200);
    const clients = await response.json();

    const foundClient = clients.find((c: { id: number }) => c.id === createdClientId);
    expect(foundClient).toBeDefined();
    expect(foundClient.activeStatus).toBe(true);
  });

  test('@e2e @smoke Step 4: Assign countries to client admin', async ({ superAdminRequest }) => {
    test.skip(!createdClientId || !createdClientAdminId, 'Client or Client Admin not created');

    // Get available countries first
    const countriesResponse = await superAdminRequest.get(`${COMPLIANCE_API}/countries`);

    if (countriesResponse.ok()) {
      const countries = await countriesResponse.json();
      if (countries?.length > 0) {
        const countryIds = countries.slice(0, 2).map((c: { id: number }) => c.id);

        const assignResponse = await superAdminRequest.post(
          `${API_BASE}/client-admins/${createdClientAdminId}/countries`,
          {
            data: {
              countryIds: countryIds,
            },
          }
        );

        // Country assignment might return 200 or 201
        expect([200, 201, 204]).toContain(assignResponse.status());
      }
    }
  });

  test('@e2e @smoke Step 5: Deactivate client (cleanup verification)', async ({
    superAdminRequest,
  }) => {
    test.skip(!createdClientId, 'Client not created');

    const response = await superAdminRequest.put(`${API_BASE}/clients/${createdClientId}/status`, {
      data: {
        activeStatus: false,
      },
    });

    expect([200, 204]).toContain(response.status());

    // Verify deactivation
    const verifyResponse = await superAdminRequest.get(`${API_BASE}/clients/${createdClientId}`);
    if (verifyResponse.ok()) {
      const client = await verifyResponse.json();
      expect(client.activeStatus).toBe(false);
    }
  });
});

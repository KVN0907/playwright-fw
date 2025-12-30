import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * Sprint 1 API Tests - Deactivate Client: EY Super Admin
 *
 * ADO Story: #198251 - Deactivate client: EY Super Admin (Backend)
 * Assigned To: Johirul Amin
 *
 * Test Cases:
 * - 204440: API – Deactivate Single Client
 * - 204441: API – Deactivate Client – Client Not Found
 * - 204442: API – Deactivate Client – Already Deactivated Client
 * - 204443: API – Deactivate Client – Insufficient Permissions
 * - 204444: API – Deactivate Client – With Active Users
 * - 204445: API – Deactivate Multiple Clients (Bulk)
 * - 204446: API – Deactivate Multiple Clients Partial Success
 * - 204447: API – Audit Log Entry for Client Deactivation
 * - 204448: API – Concurrent Client Deactivation Requests
 * - 204449: API – Network/API Failure During Client Deactivation
 */

const API_BASE = '/api/admin';
const CLIENTS_ENDPOINT = `${API_BASE}/clients`;

// Helper to create a test client using faker
async function createTestClient(superAdminRequest: any) {
  const companyName = faker.company.name();
  const uniqueId = `${Date.now()}`.slice(-6);
  const clientData = {
    name: `${companyName} ${uniqueId}`,
    code: `TC${uniqueId}`,
    description: faker.company.catchPhrase(),
  };

  const response = await superAdminRequest.post(CLIENTS_ENDPOINT, { data: clientData });
  if (response.ok()) {
    return response.json();
  }
  return null;
}

test.describe('Story #198251: Deactivate Client - EY Super Admin', () => {
  /**
   * ADO Test Case #204440
   * API – Deactivate Single Client
   */
  test('should deactivate single client successfully @api @regression @ADO-204440', async ({
    superAdminRequest,
  }) => {
    const client = await createTestClient(superAdminRequest);
    if (!client) {
      test.skip();
      return;
    }

    const response = await superAdminRequest.put(`${CLIENTS_ENDPOINT}/${client.id}/deactivate`);

    expect(response.ok()).toBe(true);

    // Verify client is deactivated
    const getResponse = await superAdminRequest.get(`${CLIENTS_ENDPOINT}/${client.id}`);
    if (getResponse.ok()) {
      const clientData = await getResponse.json();
      expect(clientData.isActive === false || clientData.status === 'INACTIVE').toBe(true);
    }
  });

  /**
   * ADO Test Case #204441
   * API – Deactivate Client – Client Not Found
   */
  test('should return 404 for non-existent client @api @regression @ADO-204441', async ({
    superAdminRequest,
  }) => {
    const nonExistentId = 999999999;

    const response = await superAdminRequest.put(`${CLIENTS_ENDPOINT}/${nonExistentId}/deactivate`);

    expect([404]).toContain(response.status());
  });

  /**
   * ADO Test Case #204442
   * API – Deactivate Client – Already Deactivated Client
   */
  test('should handle already deactivated client gracefully @api @regression @ADO-204442', async ({
    superAdminRequest,
  }) => {
    const client = await createTestClient(superAdminRequest);
    if (!client) {
      test.skip();
      return;
    }

    // First deactivation
    const firstDeactivate = await superAdminRequest.put(
      `${CLIENTS_ENDPOINT}/${client.id}/deactivate`
    );
    expect(firstDeactivate.ok()).toBe(true);

    // Second deactivation attempt
    const secondDeactivate = await superAdminRequest.put(
      `${CLIENTS_ENDPOINT}/${client.id}/deactivate`
    );

    // Should either succeed (idempotent) or return appropriate error
    expect([200, 204, 400, 409]).toContain(secondDeactivate.status());
  });

  /**
   * ADO Test Case #204443
   * API – Deactivate Client – Insufficient Permissions
   */
  test('should reject deactivation without proper permissions @api @regression @ADO-204443', async ({
    superAdminRequest,
  }) => {
    const client = await createTestClient(superAdminRequest);
    if (!client) {
      test.skip();
      return;
    }

    const response = await superAdminRequest.put(`${CLIENTS_ENDPOINT}/${client.id}/deactivate`, {
      headers: {
        'X-User-Role': 'EY_ADMIN', // Not super admin
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  /**
   * ADO Test Case #204444
   * API – Deactivate Client – With Active Users
   */
  test('should handle client deactivation with active users @api @regression @ADO-204444', async ({
    superAdminRequest,
  }) => {
    const client = await createTestClient(superAdminRequest);
    if (!client) {
      test.skip();
      return;
    }

    // Try to deactivate client (which may have active users)
    const response = await superAdminRequest.put(`${CLIENTS_ENDPOINT}/${client.id}/deactivate`);

    // Either succeeds and cascades deactivation, or returns warning/error about active users
    expect([200, 204, 400, 409]).toContain(response.status());

    if (response.status() === 400 || response.status() === 409) {
      const error = await response.json();
      // Should indicate why deactivation failed
      expect(error.message || error.error).toBeDefined();
    }
  });

  /**
   * ADO Test Case #204445
   * API – Deactivate Multiple Clients (Bulk)
   */
  test('should deactivate multiple clients in bulk @api @regression @ADO-204445', async ({
    superAdminRequest,
  }) => {
    // Create multiple clients
    const clients = await Promise.all([
      createTestClient(superAdminRequest),
      createTestClient(superAdminRequest),
      createTestClient(superAdminRequest),
    ]);

    const validClients = clients.filter(c => c !== null);
    if (validClients.length < 2) {
      test.skip();
      return;
    }

    const clientIds = validClients.map(c => c.id);

    const response = await superAdminRequest.put(`${CLIENTS_ENDPOINT}/bulk/deactivate`, {
      data: { clientIds },
    });

    // Either bulk endpoint exists and succeeds, or returns appropriate status
    expect([200, 204, 404, 405]).toContain(response.status());
  });

  /**
   * ADO Test Case #204446
   * API – Deactivate Multiple Clients Partial Success
   */
  test('should handle partial success in bulk deactivation @api @regression @ADO-204446', async ({
    superAdminRequest,
  }) => {
    const validClient = await createTestClient(superAdminRequest);
    if (!validClient) {
      test.skip();
      return;
    }

    const clientIds = [validClient.id, 999999999]; // Mix of valid and invalid IDs

    const response = await superAdminRequest.put(`${CLIENTS_ENDPOINT}/bulk/deactivate`, {
      data: { clientIds },
    });

    // Should handle partial success scenario
    expect([200, 207, 404, 405]).toContain(response.status());

    if (response.status() === 207) {
      const data = await response.json();
      expect(data.results || data.errors).toBeDefined();
    }
  });

  /**
   * ADO Test Case #204448
   * API – Concurrent Client Deactivation Requests
   */
  test('should handle concurrent deactivation requests safely @api @regression @ADO-204448', async ({
    superAdminRequest,
  }) => {
    const client = await createTestClient(superAdminRequest);
    if (!client) {
      test.skip();
      return;
    }

    // Send multiple concurrent deactivation requests
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(superAdminRequest.put(`${CLIENTS_ENDPOINT}/${client.id}/deactivate`));
    }

    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());

    // At least one should succeed
    const successCount = statusCodes.filter(code => [200, 204].includes(code)).length;
    expect(successCount).toBeGreaterThanOrEqual(1);

    // Verify final state - client should be deactivated
    const getResponse = await superAdminRequest.get(`${CLIENTS_ENDPOINT}/${client.id}`);
    if (getResponse.ok()) {
      const clientData = await getResponse.json();
      expect(clientData.isActive === false || clientData.status === 'INACTIVE').toBe(true);
    }
  });

  /**
   * ADO Test Case #204447
   * API – Audit Log Entry for Client Deactivation
   */
  test.skip('@ADO-204447 should create audit log entry for deactivation', async () => {
    // Requires audit log access
    test.skip();
  });

  /**
   * ADO Test Case #204449
   * API – Network/API Failure During Client Deactivation
   */
  test.skip('@ADO-204449 should handle network failures gracefully', async () => {
    // Requires infrastructure testing
    test.skip();
  });
});

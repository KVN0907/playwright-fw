import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';
import { generateClientName, getUniqueId } from '../shared/testUtils';
import { ADMIN_API, API } from '../shared/apiEndpoints';

/**
 * API Tests for Stories 197607, 197609 - Client Management
 * @description Tests for creating and viewing clients
 * @story 197607 - Create New Client and assign an Admin: EY Super Admin (Backend)
 * @story 197609 - View Client List Screen (Backend)
 *
 * Related ADO Test Cases:
 * - #209981: API - Fetch all clients
 * - #209973: API - Create client with valid data
 * - #209975: API - Reject client with missing name
 * - #209988: API - Reject duplicate client name
 * - #209996: API - Fetch client by ID
 * - #209998: API - Return 404 for non-existent client
 * - #210005: API - Update client name
 * - #210012: API - Reject update with empty name
 * - #210019: API - Reject update for non-existent client
 */

const API_BASE = `${ADMIN_API}${API.admin.clients.base}`;

test.describe('Stories #197607, #197609: Client Management - API Tests', () => {
  test.describe('Story 197609 - GET /clients - View Client List', () => {
    test('@api @smoke @ADO-209981 should fetch all clients', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'story', description: '197609' },
          { type: 'testcase', description: '209981' }
        );

      const response = await superAdminRequest.get(API_BASE);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('@api @smoke should return client list with expected fields', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'category', description: 'SMOKE' }
        );

      const response = await superAdminRequest.get(API_BASE);

      expect(response.status()).toBe(200);
      const data = await response.json();

      if (data.length > 0) {
        const client = data[0];
        expect(client).toHaveProperty('id');
        expect(client).toHaveProperty('name');
      }
    });
  });

  test.describe('Story 197607 - POST /clients - Create Client', () => {
    test('@api @smoke @ADO-209973 should create client with valid data', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'story', description: '197607' },
          { type: 'testcase', description: '209973' }
        );

      const clientData = {
        name: generateClientName(),
        description: faker.company.catchPhrase(),
        active: true,
      };

      const response = await superAdminRequest.post(API_BASE, { data: clientData });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe(clientData.name);

      // Cleanup
      if (data.id) {
        await superAdminRequest.delete(`${API_BASE}/${data.id}`);
      }
    });

    test('@api @regression @ADO-209975 should reject client with missing name', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '209975' },
          { type: 'category', description: 'VALIDATION' }
        );

      const clientData = {
        description: 'Test description',
        active: true,
      };

      const response = await superAdminRequest.post(API_BASE, { data: clientData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression should reject client with empty name', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'category', description: 'VALIDATION' }
        );

      const clientData = {
        name: '',
        description: 'Test description',
        active: true,
      };

      const response = await superAdminRequest.post(API_BASE, { data: clientData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-209988 should reject duplicate client name', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '209988' },
          { type: 'category', description: 'VALIDATION' }
        );

      const clientName = generateClientName();
      const clientData = {
        name: clientName,
        description: 'First client',
        active: true,
      };

      // Create first client
      const firstResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect([200, 201]).toContain(firstResponse.status());
      const firstData = await firstResponse.json();

      // Attempt duplicate
      const duplicateResponse = await superAdminRequest.post(API_BASE, {
        data: { name: clientName, description: 'Duplicate client', active: true },
      });

      expect([400, 409, 422]).toContain(duplicateResponse.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${firstData.id}`);
    });

    test('@api @regression should handle special characters in client name', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Client Management' },
          { type: 'category', description: 'EDGE' }
        );

      const clientData = {
        name: `Test & Co. (${getUniqueId()})`,
        description: 'Client with special chars',
        active: true,
      };

      const response = await superAdminRequest.post(API_BASE, { data: clientData });

      expect([200, 201, 400, 422]).toContain(response.status());

      if ([200, 201].includes(response.status())) {
        const data = await response.json();
        await superAdminRequest.delete(`${API_BASE}/${data.id}`);
      }
    });
  });

  test.describe('GET /clients/{id} - Get Client by ID', () => {
    test('@api @smoke @ADO-209996 should fetch client by ID', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '209996' }
        );

      // Create client first
      const clientData = {
        name: generateClientName(),
        description: 'Test client for fetch',
        active: true,
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      const createdClient = await createResponse.json();

      // Fetch by ID
      const response = await superAdminRequest.get(`${API_BASE}/${createdClient.id}`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(createdClient.id);
      expect(data.name).toBe(clientData.name);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdClient.id}`);
    });

    test('@api @regression @ADO-209998 should return 404 for non-existent client', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '209998' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.get(`${API_BASE}/999999999`);

      expect([404, 422]).toContain(response.status());
    });
  });

  test.describe('PUT /clients - Update Client', () => {
    test('@api @smoke @ADO-210005 should update client name', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '210005' }
        );

      // Create client first
      const clientData = {
        name: generateClientName(),
        description: 'Original description',
        active: true,
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      const createdClient = await createResponse.json();

      // Update
      const updatedName = `Updated_${generateClientName()}`;
      const updateData = {
        id: createdClient.id,
        name: updatedName,
        description: 'Updated description',
        active: true,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.name).toBe(updatedName);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdClient.id}`);
    });

    test('@api @regression @ADO-210012 should reject update with empty name', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '210012' },
          { type: 'category', description: 'VALIDATION' }
        );

      // Create client first
      const clientData = {
        name: generateClientName(),
        description: 'Test client',
        active: true,
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      const createdClient = await createResponse.json();

      // Update with empty name
      const updateData = {
        id: createdClient.id,
        name: '',
        description: 'Updated',
        active: true,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdClient.id}`);
    });

    test('@api @regression @ADO-210019 should reject update for non-existent client', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '210019' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const updateData = {
        id: 999999999,
        name: 'Test',
        description: 'Test',
        active: true,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect([404, 422]).toContain(response.status());
    });
  });

  test.describe('Client Deactivation', () => {
    test('@api @smoke should deactivate client', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'category', description: 'SMOKE' }
        );

      // Create active client
      const clientData = {
        name: generateClientName(),
        description: 'Test client for deactivation',
        active: true,
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      const createdClient = await createResponse.json();

      // Deactivate (update with active: false)
      const updateData = {
        id: createdClient.id,
        name: createdClient.name,
        description: createdClient.description,
        active: false,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(false);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdClient.id}`);
    });

    test('@api @regression should reactivate deactivated client', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Create and deactivate client
      const clientData = {
        name: generateClientName(),
        description: 'Test client',
        active: true,
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      const createdClient = await createResponse.json();

      // Deactivate
      await superAdminRequest.put(API_BASE, { data: { ...createdClient, active: false } });

      // Reactivate
      const response = await superAdminRequest.put(API_BASE, {
        data: { ...createdClient, active: true },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(true);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdClient.id}`);
    });
  });
});

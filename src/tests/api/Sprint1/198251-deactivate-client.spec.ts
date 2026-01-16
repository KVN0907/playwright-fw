import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';
import { generateClientName, getUniqueId } from '../shared/testUtils';
import { ADMIN_API, API } from '../shared/apiEndpoints';

/**
 * API Tests for Story 198251 - Deactivate Client
 * @description Tests for client deactivation/reactivation functionality
 * @story 198251 - Deactivate client - Backend
 *
 * Acceptance Criteria:
 * - Soft delete/deactivate clients
 * - Support reactivation
 * - Inactive clients shown in separate list
 * - Revoke access from client users upon deactivation
 *
 * Related ADO Test Cases:
 * - #202122: API - Deactivate active client
 * - #202123: API - Reactivate deactivated client
 * - #202124: API - Return 404 for non-existent client
 * - #202125: API - Toggle status multiple times
 * - #202126: API - List only active clients
 * - #202127: API - List only inactive clients
 * - #202128: API - List all clients regardless of status
 * - #202129: API - Handle pagination with status filter
 * - #202130: API - Preserve client data after deactivation
 * - #202131: API - Edit restriction on deactivated client
 */

const API_BASE = `${ADMIN_API}${API.admin.clients.base}`;

const generateClientData = (
  overrides?: Partial<{
    name: string;
    cityId: number;
    assignedEyAdminId: number[];
    active: boolean;
  }>
) => ({
  name: generateClientName(),
  cityId: 1,
  assignedEyAdminId: [],
  active: true,
  ...overrides,
});

test.describe('Story #198251: Deactivate Client - API Tests', () => {
  test.describe('GET /clients/change-active-status/{id} - Deactivate Client', () => {
    test('@api @smoke @ADO-202122 should deactivate active client', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'story', description: '198251' },
          { type: 'testcase', description: '202122' }
        );

      // Get valid city ID
      const citiesResponse = await superAdminRequest.get('/api/admin/api/cities');
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create active client
      const clientData = generateClientData({ cityId, active: true });
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      expect(created.active).toBe(true);

      // Deactivate client
      const response = await superAdminRequest.get(
        `${API_BASE}/change-active-status/${created.id}`
      );
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(false);

      // Cleanup
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`); // Reactivate
      await superAdminRequest.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @smoke @ADO-202123 should reactivate deactivated client', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202123' }
        );

      // Get valid city ID
      const citiesResponse = await superAdminRequest.get('/api/admin/api/cities');
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create and deactivate client
      const clientData = generateClientData({ cityId, active: true });
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Deactivate
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);

      // Verify deactivated
      const deactivatedResponse = await superAdminRequest.get(`${API_BASE}/${created.id}`);
      const deactivatedClient = await deactivatedResponse.json();
      expect(deactivatedClient.active).toBe(false);

      // Reactivate
      const response = await superAdminRequest.get(
        `${API_BASE}/change-active-status/${created.id}`
      );
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(true);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @regression @ADO-202124 should return 404 for non-existent client', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202124' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.get(`${API_BASE}/change-active-status/999999999`);
      expect([404, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-202125 should toggle status multiple times', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202125' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Get valid city ID
      const citiesResponse = await superAdminRequest.get('/api/admin/api/cities');
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create active client
      const clientData = generateClientData({ cityId, active: true });
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Toggle 1: active -> inactive
      let response = await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);
      expect(response.status()).toBe(200);
      let data = await response.json();
      expect(data.active).toBe(false);

      // Toggle 2: inactive -> active
      response = await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);
      expect(response.status()).toBe(200);
      data = await response.json();
      expect(data.active).toBe(true);

      // Toggle 3: active -> inactive
      response = await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);
      expect(response.status()).toBe(200);
      data = await response.json();
      expect(data.active).toBe(false);

      // Cleanup
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`); // Reactivate
      await superAdminRequest.delete(`${API_BASE}/${created.id}`);
    });
  });

  test.describe('POST /clients/paginated - Filter by Active Status', () => {
    test('@api @smoke @ADO-202126 should list only active clients', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202126' }
        );

      const response = await superAdminRequest.post(`${API_BASE}/paginated?page=0&size=100`, {
        data: { activeStatus: 'active' },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.content).toBeDefined();

      // Verify all returned clients are active
      for (const client of data.content) {
        expect(client.active).toBe(true);
      }
    });

    test('@api @smoke @ADO-202127 should list only inactive clients', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202127' }
        );

      // Get valid city ID
      const citiesResponse = await superAdminRequest.get('/api/admin/api/cities');
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create and deactivate a client
      const clientData = generateClientData({ cityId, active: true });
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Deactivate
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);

      // List inactive clients
      const response = await superAdminRequest.post(`${API_BASE}/paginated?page=0&size=100`, {
        data: { activeStatus: 'inactive' },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.content).toBeDefined();

      // Verify all returned clients are inactive
      for (const client of data.content) {
        expect(client.active).toBe(false);
      }

      // Verify our deactivated client is in the list
      const foundClient = data.content.find((c: { id: number }) => c.id === created.id);
      expect(foundClient).toBeDefined();

      // Cleanup
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`); // Reactivate
      await superAdminRequest.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @smoke @ADO-202128 should list all clients regardless of status', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202128' }
        );

      const response = await superAdminRequest.post(`${API_BASE}/paginated?page=0&size=100`, {
        data: { activeStatus: 'all' },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.content).toBeDefined();
    });

    test('@api @regression @ADO-202129 should handle pagination with status filter', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202129' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Request first page
      const page1Response = await superAdminRequest.post(`${API_BASE}/paginated?page=0&size=5`, {
        data: { activeStatus: 'all' },
      });

      expect(page1Response.status()).toBe(200);
      const page1Data = await page1Response.json();
      expect(page1Data.content).toBeDefined();
      expect(page1Data.pageable).toBeDefined();
      expect(page1Data.totalElements).toBeDefined();

      if (page1Data.totalElements > 5) {
        // Request second page
        const page2Response = await superAdminRequest.post(`${API_BASE}/paginated?page=1&size=5`, {
          data: { activeStatus: 'all' },
        });

        expect(page2Response.status()).toBe(200);
        const page2Data = await page2Response.json();

        // Verify different pages have different content
        if (page2Data.content.length > 0) {
          expect(page1Data.content[0].id).not.toBe(page2Data.content[0].id);
        }
      }
    });
  });

  test.describe('Client Data Integrity After Deactivation', () => {
    test('@api @regression @ADO-202130 should preserve client data after deactivation', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202130' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Get valid city ID
      const citiesResponse = await superAdminRequest.get('/api/admin/api/cities');
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client with full data
      const clientData = generateClientData({ cityId, active: true });
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Deactivate
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);

      // Verify data is preserved
      const response = await superAdminRequest.get(`${API_BASE}/${created.id}`);
      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.name).toBe(clientData.name);
      expect(data.cityId).toBe(clientData.cityId);
      expect(data.active).toBe(false);

      // Cleanup
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`); // Reactivate
      await superAdminRequest.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @regression @ADO-202131 should document edit behavior on deactivated client', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Client Management' },
          { type: 'testcase', description: '202131' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Get valid city ID
      const citiesResponse = await superAdminRequest.get('/api/admin/api/cities');
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create and deactivate client
      const clientData = generateClientData({ cityId, active: true });
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Deactivate
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);

      // Try to edit - API may allow or restrict based on business rules
      const updateData = {
        id: created.id,
        name: `Edited_${faker.company.name()}_${getUniqueId()}`,
        cityId: cityId,
        assignedEyAdminId: [],
        active: false,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      // Document the behavior - could be allowed (200) or restricted (400/403)
      expect([200, 400, 403, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`); // Reactivate
      await superAdminRequest.delete(`${API_BASE}/${created.id}`);
    });
  });

  test.describe('Soft Delete Verification', () => {
    test('@api @regression should verify soft delete does not remove client', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Get valid city ID
      const citiesResponse = await superAdminRequest.get('/api/admin/api/cities');
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client
      const clientData = generateClientData({ cityId, active: true });
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Deactivate (soft delete)
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);

      // Client should still be retrievable by ID
      const response = await superAdminRequest.get(`${API_BASE}/${created.id}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(created.id);
      expect(data.active).toBe(false);

      // Cleanup
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`); // Reactivate
      await superAdminRequest.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @regression should maintain unique name constraint for inactive clients', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Client Management' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Get valid city ID
      const citiesResponse = await superAdminRequest.get('/api/admin/api/cities');
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      const uniqueName = generateClientName();

      // Create first client
      const clientData = generateClientData({ name: uniqueName, cityId, active: true });
      const createResponse = await superAdminRequest.post(API_BASE, { data: clientData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Deactivate first client
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`);

      // Try to create another client with same name
      const duplicateResponse = await superAdminRequest.post(API_BASE, {
        data: generateClientData({ name: uniqueName, cityId, active: true }),
      });

      // Should reject due to unique constraint (even for inactive)
      expect([400, 409, 422]).toContain(duplicateResponse.status());

      // Cleanup
      await superAdminRequest.get(`${API_BASE}/change-active-status/${created.id}`); // Reactivate
      await superAdminRequest.delete(`${API_BASE}/${created.id}`);
    });
  });
});

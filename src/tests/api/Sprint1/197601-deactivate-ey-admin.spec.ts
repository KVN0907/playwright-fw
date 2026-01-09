import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for Story 197601 - Deactivate users: EY Super Admin (Backend)
 * @description Tests for EY Admin user deactivation
 * @story 197601 - Deactivate users: EY Super Admin (Backend)
 *
 * Related ADO Test Cases:
 * - #207823: API - Toggle active status of EY Admin
 * - #207838: API - Return 404 for non-existent admin
 * - #201699: API - Delete EY Admin
 * - #201700: API - Return 404 for deleting non-existent admin
 * - #201701: API - Not find deleted admin
 * - #201702: API - Handle double deletion gracefully
 */

const API_BASE = '/api/admin/api/ey-admins';

const generateEyEmail = (): string => {
  return `test.${faker.person.firstName().toLowerCase()}.${Date.now()}@ey.com`;
};

test.describe('Story #197601: Deactivate EY Admin - API Tests', () => {
  test.describe('GET /ey-admins/change-active-status/{id} - Deactivate Admin', () => {
    test('@api @smoke @ADO-207823 should toggle active status of EY Admin', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'story', description: '197601' },
          { type: 'testcase', description: '207823' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      expect(createResponse.status()).toBe(200);
      const createdAdmin = await createResponse.json();

      // Get initial status
      const getResponse = await superAdminRequest.get(`${API_BASE}/${createdAdmin.id}`);
      const initialData = await getResponse.json();
      const initialStatus = initialData.active;

      // Toggle status
      const response = await superAdminRequest.get(
        `${API_BASE}/change-active-status/${createdAdmin.id}`
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(!initialStatus);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-207838 should return 404 for non-existent admin', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '207838' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.get(`${API_BASE}/change-active-status/999999999`);

      expect([404, 422]).toContain(response.status());
    });

    test('@api @smoke should deactivate and reactivate admin', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'category', description: 'SMOKE' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // First toggle (deactivate if active)
      const firstToggle = await superAdminRequest.get(
        `${API_BASE}/change-active-status/${createdAdmin.id}`
      );
      expect(firstToggle.status()).toBe(200);
      const firstData = await firstToggle.json();

      // Second toggle (reactivate)
      const secondToggle = await superAdminRequest.get(
        `${API_BASE}/change-active-status/${createdAdmin.id}`
      );
      expect(secondToggle.status()).toBe(200);
      const secondData = await secondToggle.json();

      expect(secondData.active).toBe(!firstData.active);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression should verify deactivated admin appears in inactive list', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Get current status
      const getResponse = await superAdminRequest.get(`${API_BASE}/${createdAdmin.id}`);
      const currentData = await getResponse.json();

      // If active, deactivate first
      if (currentData.active) {
        await superAdminRequest.get(`${API_BASE}/change-active-status/${createdAdmin.id}`);
      }

      // Fetch paginated list with inactive filter
      const paginatedResponse = await superAdminRequest.post(
        `${API_BASE}/paginated?page=0&size=100`,
        { data: { activeStatus: false } }
      );

      expect(paginatedResponse.status()).toBe(200);
      const data = await paginatedResponse.json();

      const foundAdmin = data.content?.find(
        (admin: { id: number }) => admin.id === createdAdmin.id
      );
      expect(foundAdmin).toBeDefined();
      expect(foundAdmin?.active).toBe(false);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });
  });

  test.describe('DELETE /ey-admins/{id} - Delete Admin', () => {
    test('@api @smoke @ADO-201699 should delete EY Admin', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201699' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Delete
      const response = await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);

      expect(response.status()).toBe(200);
    });

    test('@api @regression @ADO-201700 should return 404 for deleting non-existent admin', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201700' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.delete(`${API_BASE}/999999999`);

      expect([404, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201701 should not find deleted admin', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201701' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Delete
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);

      // Try to fetch deleted admin
      const response = await superAdminRequest.get(`${API_BASE}/${createdAdmin.id}`);

      expect([404, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201702 should handle double deletion gracefully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201702' },
          { type: 'category', description: 'EDGE' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // First deletion
      const firstDelete = await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
      expect(firstDelete.status()).toBe(200);

      // Second deletion attempt
      const secondDelete = await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);

      expect([404, 422]).toContain(secondDelete.status());
    });
  });

  test.describe('POST /ey-admins/paginated - Pagination with Active Status', () => {
    test('@api @smoke should fetch active EY Admins with pagination', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'category', description: 'SMOKE' }
        );

      const response = await superAdminRequest.post(`${API_BASE}/paginated?page=0&size=10`, {
        data: { activeStatus: true },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.content).toBeDefined();
      expect(Array.isArray(data.content)).toBe(true);
    });

    test('@api @smoke should fetch inactive EY Admins with pagination', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'category', description: 'SMOKE' }
        );

      const response = await superAdminRequest.post(`${API_BASE}/paginated?page=0&size=10`, {
        data: { activeStatus: false },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.content).toBeDefined();
      expect(Array.isArray(data.content)).toBe(true);
    });

    test('@api @regression should return pagination metadata', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const response = await superAdminRequest.post(`${API_BASE}/paginated?page=0&size=5`, {
        data: { activeStatus: true },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.totalElements).toBeDefined();
      expect(data.totalPages).toBeDefined();
      expect(data.size).toBe(5);
      expect(data.number).toBe(0);
    });
  });
});

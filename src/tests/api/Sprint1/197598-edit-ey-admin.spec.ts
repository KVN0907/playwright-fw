import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for Story 197598 - Edit users: EY Super Admin (Backend)
 * @description Tests for EY Admin user editing
 * @story 197598 - Edit users: EY Super Admin (Backend)
 *
 * Related ADO Test Cases:
 * - #202514: API - Update firstName successfully
 * - #202515: API - Update lastName successfully
 * - #202516: API - Reject update with empty firstName
 * - #202517: API - Reject update with empty lastName
 * - #202518: API - Reject update for non-existent admin
 * - #202519: API - Update both firstName and lastName
 * - #202520: API - Validate firstName max length on update
 * - #202521: API - Validate lastName max length on update
 * - #202522: API - Preserve email on name update
 * - #202523: API - Reject missing id on update
 */

const API_BASE = '/api/admin/api/ey-admins';

let testCounter = 0;
const getUniqueId = () => (++testCounter).toString(36);

const generateEyEmail = (): string => {
  const firstName = faker.person.firstName().toLowerCase();
  const lastName = faker.person.lastName().toLowerCase();
  return `${firstName}.${lastName}.${getUniqueId()}@ey.com`;
};

test.describe('Story #197598: Edit EY Admin - API Tests', () => {
  test.describe('PUT /ey-admins - Edit EY Admin', () => {
    test('@api @smoke @ADO-202514 should update firstName successfully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'story', description: '197598' },
          { type: 'testcase', description: '202514' }
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

      // Update firstName
      const updatedFirstName = `Updated${faker.person.firstName()}`;
      const updateData = {
        id: createdAdmin.id,
        firstName: updatedFirstName,
        lastName: createdAdmin.lastName,
        username: createdAdmin.username,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.firstName).toBe(updatedFirstName);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @smoke @ADO-202515 should update lastName successfully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202515' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Update lastName
      const updatedLastName = `Updated${faker.person.lastName()}`;
      const updateData = {
        id: createdAdmin.id,
        firstName: createdAdmin.firstName,
        lastName: updatedLastName,
        username: createdAdmin.username,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.lastName).toBe(updatedLastName);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-202516 should reject update with empty firstName', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202516' },
          { type: 'category', description: 'VALIDATION' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Update with empty firstName
      const updateData = {
        id: createdAdmin.id,
        firstName: '',
        lastName: createdAdmin.lastName,
        username: createdAdmin.username,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-202517 should reject update with empty lastName', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202517' },
          { type: 'category', description: 'VALIDATION' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Update with empty lastName
      const updateData = {
        id: createdAdmin.id,
        firstName: createdAdmin.firstName,
        lastName: '',
        username: createdAdmin.username,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-202518 should reject update for non-existent admin', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202518' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const updateData = {
        id: 999999999,
        firstName: 'Test',
        lastName: 'User',
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect([404, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-202519 should update both firstName and lastName', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202519' },
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

      // Update both names
      const updateData = {
        id: createdAdmin.id,
        firstName: `New${faker.person.firstName()}`,
        lastName: `New${faker.person.lastName()}`,
        username: createdAdmin.username,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.firstName).toBe(updateData.firstName);
      expect(data.lastName).toBe(updateData.lastName);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-202520 should validate firstName max length on update', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202520' },
          { type: 'category', description: 'BOUNDARY' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Update with long firstName
      const updateData = {
        id: createdAdmin.id,
        firstName: 'A'.repeat(256),
        lastName: createdAdmin.lastName,
        username: createdAdmin.username,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-202521 should validate lastName max length on update', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202521' },
          { type: 'category', description: 'BOUNDARY' }
        );

      // Create admin
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Update with long lastName
      const updateData = {
        id: createdAdmin.id,
        firstName: createdAdmin.firstName,
        lastName: 'A'.repeat(256),
        username: createdAdmin.username,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-202522 should preserve email on name update', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202522' },
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

      // Update name only
      const updateData = {
        id: createdAdmin.id,
        firstName: `Updated${faker.person.firstName()}`,
        lastName: createdAdmin.lastName,
        username: createdAdmin.username,
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.username).toBe(createdAdmin.username);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-202523 should reject missing id on update', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '202523' },
          { type: 'category', description: 'VALIDATION' }
        );

      const updateData = {
        firstName: 'Test',
        lastName: 'User',
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.put(API_BASE, { data: updateData });

      expect([400, 422]).toContain(response.status());
    });
  });
});

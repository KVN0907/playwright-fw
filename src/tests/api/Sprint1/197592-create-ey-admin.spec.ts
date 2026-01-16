import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';
import { generateEmail, getUniqueId } from '../shared/testUtils';
import { ADMIN_API, API, buildUrl } from '../shared/apiEndpoints';

/**
 * API Tests for Story 197592 - Create users: EY Super Admin (Backend)
 * @description Tests for EY Admin user creation
 * @story 197592 - Create users: EY Super Admin (Backend)
 *
 * Acceptance Criteria:
 * - Successfully add new EY Admin with first name, last name, email
 * - All fields mandatory, EY email IDs only
 * - Fail with missing required fields
 * - Fail with duplicate email
 *
 * Related ADO Test Cases:
 * - #201683: API - Create EY Admin with valid data
 * - #201684: API - Reject creation with missing firstName
 * - #201685: API - Reject creation with missing lastName
 * - #201686: API - Reject creation with missing email
 * - #201687: API - Reject creation with invalid email format
 * - #201688: API - Reject creation with duplicate email
 * - #201689-201693: Validation tests
 * - #201694-201698: Fetch and search tests
 */

const API_BASE = `${ADMIN_API}${API.admin.eyAdmins.base}`;

const generateEyEmail = (): string => generateEmail('ey.com');

test.describe('Story #197592: Create EY Admin - API Tests', () => {
  test.describe('POST /ey-admins - Create EY Admin', () => {
    test('@api @smoke @ADO-201683 should create EY Admin with valid data', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'story', description: '197592' },
          { type: 'testcase', description: '201683' }
        );

      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.firstName).toBe(adminData.firstName);
      expect(data.lastName).toBe(adminData.lastName);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${data.id}`);
    });

    test('@api @regression @ADO-201684 should reject creation with missing firstName', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201684' },
          { type: 'category', description: 'VALIDATION' }
        );

      const adminData = {
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201685 should reject creation with missing lastName', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201685' },
          { type: 'category', description: 'VALIDATION' }
        );

      const adminData = {
        firstName: faker.person.firstName(),
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201686 should reject creation with missing email', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201686' },
          { type: 'category', description: 'VALIDATION' }
        );

      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201687 should reject creation with invalid email format', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201687' },
          { type: 'category', description: 'VALIDATION' }
        );

      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: 'invalid-email-format',
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201688 should reject creation with duplicate email', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201688' },
          { type: 'category', description: 'VALIDATION' }
        );

      const email = generateEyEmail();
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: email,
      };

      // Create first admin
      const firstResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      expect(firstResponse.status()).toBe(200);
      const firstData = await firstResponse.json();

      // Attempt duplicate
      const duplicateData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: email,
      };

      const response = await superAdminRequest.post(API_BASE, { data: duplicateData });

      expect([400, 409, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${firstData.id}`);
    });

    test('@api @regression @ADO-201689 should reject creation with empty firstName', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201689' },
          { type: 'category', description: 'VALIDATION' }
        );

      const adminData = {
        firstName: '',
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201690 should reject creation with empty lastName', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201690' },
          { type: 'category', description: 'VALIDATION' }
        );

      const adminData = {
        firstName: faker.person.firstName(),
        lastName: '',
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201691 should handle special characters in names', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201691' },
          { type: 'category', description: 'EDGE' }
        );

      const adminData = {
        firstName: "O'Brien",
        lastName: 'Smith-Jones',
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([200, 400, 422]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        await superAdminRequest.delete(`${API_BASE}/${data.id}`);
      }
    });

    test('@api @regression @ADO-201692 should validate firstName max length', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201692' },
          { type: 'category', description: 'BOUNDARY' }
        );

      const adminData = {
        firstName: 'A'.repeat(256),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([400, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-201693 should validate lastName max length', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201693' },
          { type: 'category', description: 'BOUNDARY' }
        );

      const adminData = {
        firstName: faker.person.firstName(),
        lastName: 'A'.repeat(256),
        username: generateEyEmail(),
      };

      const response = await superAdminRequest.post(API_BASE, { data: adminData });

      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe('GET /ey-admins - Fetch EY Admins', () => {
    test('@api @smoke @ADO-201694 should fetch all EY Admins', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201694' }
        );

      const response = await superAdminRequest.get(API_BASE);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('@api @smoke @ADO-201695 should fetch EY Admin by ID', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201695' }
        );

      // Create admin first
      const adminData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Fetch by ID
      const response = await superAdminRequest.get(`${API_BASE}/${createdAdmin.id}`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(createdAdmin.id);
      expect(data.firstName).toBe(adminData.firstName);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-201696 should return 404 for non-existent EY Admin', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201696' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.get(`${API_BASE}/999999999`);

      expect([404, 422]).toContain(response.status());
    });
  });

  test.describe('POST /ey-admins/search-active-by-name - Search', () => {
    test('@api @smoke @ADO-201697 should search active EY Admins by name', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201697' }
        );

      // Create admin first with a searchable name
      const searchableName = `SearchTest${getUniqueId()}`;
      const adminData = {
        firstName: searchableName,
        lastName: faker.person.lastName(),
        username: generateEyEmail(),
      };
      const createResponse = await superAdminRequest.post(API_BASE, { data: adminData });
      const createdAdmin = await createResponse.json();

      // Search by the unique name prefix
      const searchData = { name: searchableName };
      const response = await superAdminRequest.post(`${API_BASE}/search-active-by-name`, {
        data: searchData,
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/${createdAdmin.id}`);
    });

    test('@api @regression @ADO-201698 should return empty array for no matches', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'EY Admin Management' },
          { type: 'testcase', description: '201698' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const searchData = { name: 'NonExistentName999999' };
      const response = await superAdminRequest.post(`${API_BASE}/search-active-by-name`, {
        data: searchData,
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });
});

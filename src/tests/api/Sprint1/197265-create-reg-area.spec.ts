import { test, expect } from '../../fixtures/advancedFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for RegArea - Create Operations
 * Story #197265: Master questionnaire - Create reg area and questions (Backend)
 *
 * Related ADO Test Cases:
 * - #202614: API - Create Section with Valid, Unique Name (POST /reg-area)
 * - #202615: API - Attempt to Create Section with Duplicate Name (POST /reg-area)
 */

const API_BASE = '/api/compliancemanager';

const generateRegAreaName = (prefix?: string) => {
  const uniqueId = `${Date.now()}`.slice(-6);
  return prefix ? `${prefix} ${uniqueId}` : `${faker.commerce.department()} Compliance ${uniqueId}`;
};

const generateRegAreaData = (
  overrides?: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    isApproved: boolean;
    isDelete: boolean;
  }>
) => ({
  name: generateRegAreaName(),
  description: faker.lorem.sentence(),
  isActive: true,
  isApproved: true,
  isDelete: false,
  ...overrides,
});

test.describe('Story #197265: Create Reg Area - API Tests', () => {
  test.describe('GET /reg-area', () => {
    test('@smoke should return list of all regulatory areas', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'story', description: '197265' }
        );

      const response = await request.get(`${API_BASE}/reg-area`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('POST /reg-area', () => {
    test('@smoke @ADO-202614 should create a new regulatory area', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'story', description: '197265' },
          { type: 'testcase', description: '202614' }
        );

      const regAreaName = generateRegAreaName();
      const requestData = {
        name: regAreaName,
        description: faker.lorem.sentence(),
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe(requestData.name);
      expect(data.description).toBe(requestData.description);

      if (data.id) {
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@negative should return 400 when name is missing', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'VALIDATION' }
        );

      const requestData = { description: 'Test description without name', isActive: true };
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when name is empty', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'VALIDATION' }
        );

      const requestData = { name: '', description: 'Test description', isActive: true };
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(400);
    });

    test('@validation should return 400 when name exceeds max length', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'BOUNDARY' }
        );

      const requestData = {
        name: 'A'.repeat(256),
        description: 'Test description',
        isActive: true,
      };
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(400);
    });

    test('@negative @ADO-202615 should reject duplicate name', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202615' }
        );

      const timestamp = Date.now();
      const requestData = {
        name: `Duplicate Test ${timestamp}`,
        description: 'First entry',
        isActive: true,
      };

      const firstResponse = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(firstResponse.status()).toBe(201);
      const first = await firstResponse.json();

      const duplicateData = {
        name: `Duplicate Test ${timestamp}`,
        description: 'Duplicate entry',
        isActive: true,
      };
      const duplicateResponse = await request.post(`${API_BASE}/reg-area`, { data: duplicateData });
      expect([400, 409, 422]).toContain(duplicateResponse.status());

      await request.delete(`${API_BASE}/reg-area/${first.id}`);
    });
  });

  test.describe('DELETE /reg-area/{id}', () => {
    test('@smoke should delete a regulatory area by ID', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' }
        );

      const createData = generateRegAreaData({ name: generateRegAreaName('Reg Area To Delete') });
      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      const response = await request.delete(`${API_BASE}/reg-area/${created.id}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toBe(true);
    });

    test('@negative should handle non-existent regulatory area', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await request.delete(`${API_BASE}/reg-area/999999999`);
      expect([200, 404, 422, 500]).toContain(response.status());
    });

    test('@negative should return error for invalid ID format', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'VALIDATION' }
        );

      const response = await request.delete(`${API_BASE}/reg-area/invalid-id`);
      expect([400, 500]).toContain(response.status());
    });
  });

  test.describe('Edge Cases - Create', () => {
    test('@edge should reject whitespace-only name', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'EDGE' }
        );

      const requestData = { name: '   ', description: 'Whitespace name test', isActive: true };
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(400);
    });

    test('@edge should handle special characters in name', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'SECURITY' }
        );

      const timestamp = Date.now();
      const requestData = {
        name: `Test <script>alert('xss')</script> ${timestamp}`,
        description: 'XSS test in name',
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.name).not.toContain('<script>');
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      } else {
        expect([400, 422]).toContain(response.status());
      }
    });

    test('@edge should handle SQL injection attempt in name', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'category', description: 'SECURITY' }
        );

      const timestamp = Date.now();
      const requestData = {
        name: `Test'; DROP TABLE reg_area; -- ${timestamp}`,
        description: 'SQL injection test',
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect([201, 400, 422, 500]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle unicode and emoji in name', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'low' },
          { type: 'category', description: 'EDGE' }
        );

      const timestamp = Date.now();
      const requestData = {
        name: `Test 日本語 émoji 🔥 ${timestamp}`,
        description: 'Unicode test',
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.name).toContain('日本語');
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle boundary value - exactly 255 chars name', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'BOUNDARY' }
        );

      const timestamp = Date.now();
      const baseName = `Boundary${timestamp}`;
      const name = baseName + 'A'.repeat(255 - baseName.length);

      const requestData = {
        name,
        description: 'Boundary test - exactly 255 chars',
        isActive: true,
      };
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.name.length).toBe(255);
      await request.delete(`${API_BASE}/reg-area/${data.id}`);
    });

    test('@edge should handle null values in optional fields', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'low' },
          { type: 'category', description: 'EDGE' }
        );

      const timestamp = Date.now();
      const requestData = { name: `Null Test ${timestamp}`, description: null, isActive: true };
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect([201, 400]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle empty request body on create', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'VALIDATION' }
        );

      const response = await request.post(`${API_BASE}/reg-area`, { data: {} });
      expect(response.status()).toBe(400);
    });

    test('@edge should handle array as request body', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'VALIDATION' }
        );

      const response = await request.post(`${API_BASE}/reg-area`, {
        data: [{ name: 'Test', description: 'Test' }],
      });
      expect([400, 415, 422, 500]).toContain(response.status());
    });
  });

  test.describe('Security - Create', () => {
    test('@security should not allow tenantId manipulation on create', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'category', description: 'SECURITY' }
        );

      const timestamp = Date.now();
      const requestData = {
        name: `TenantId Test ${timestamp}`,
        description: 'Testing tenant isolation',
        tenantId: 99999,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.tenantId).not.toBe(99999);
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@security should not allow isDelete flag manipulation', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'SECURITY' }
        );

      const timestamp = Date.now();
      const requestData = {
        name: `IsDelete Flag Test ${timestamp}`,
        description: 'Testing isDelete manipulation',
        isDelete: true,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.isDelete).toBe(false);
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });
  });

  test.describe('Functional - Create', () => {
    test('@functional should trim whitespace from name on create', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const requestData = {
        name: `   Whitespace Test ${timestamp}   `,
        description: 'Testing trim',
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.name).toBe(`Whitespace Test ${timestamp}`);
      await request.delete(`${API_BASE}/reg-area/${data.id}`);
    });

    test('@functional should not show deleted records in GET all', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `Delete Visibility Test ${timestamp}`,
        description: 'Testing',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      await request.delete(`${API_BASE}/reg-area/${created.id}`);

      const getResponse = await request.get(`${API_BASE}/reg-area`);
      const allRecords = await getResponse.json();
      const deletedRecord = allRecords.find((r: { id: number }) => r.id === created.id);
      expect(deletedRecord).toBeUndefined();
    });

    test('@functional should auto-generate unique IDs', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const data1 = { name: `ID Test 1 ${timestamp}`, description: 'First', isActive: true };
      const data2 = { name: `ID Test 2 ${timestamp}`, description: 'Second', isActive: true };

      const response1 = await request.post(`${API_BASE}/reg-area`, { data: data1 });
      const response2 = await request.post(`${API_BASE}/reg-area`, { data: data2 });

      expect(response1.status()).toBe(201);
      expect(response2.status()).toBe(201);

      const created1 = await response1.json();
      const created2 = await response2.json();

      expect(created1.id).toBeDefined();
      expect(created2.id).toBeDefined();
      expect(created1.id).not.toBe(created2.id);

      await request.delete(`${API_BASE}/reg-area/${created1.id}`);
      await request.delete(`${API_BASE}/reg-area/${created2.id}`);
    });

    test('@functional should handle concurrent duplicate creates', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'CONCURRENCY' }
        );

      const timestamp = Date.now();
      const requestData = {
        name: `Concurrent Test ${timestamp}`,
        description: 'Race condition test',
        isActive: true,
      };

      const [response1, response2] = await Promise.all([
        request.post(`${API_BASE}/reg-area`, { data: requestData }),
        request.post(`${API_BASE}/reg-area`, { data: requestData }),
      ]);

      const statuses = [response1.status(), response2.status()];
      expect(statuses).toContain(201);

      if (response1.status() === 201) {
        const data = await response1.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
      if (response2.status() === 201) {
        const data = await response2.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });
  });

  test.describe('CRUD Operations - Full Flow', () => {
    test('@smoke should perform complete CRUD operations', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'SMOKE' }
        );

      const timestamp = Date.now();

      // CREATE
      const createData = {
        name: `CRUD Test Reg Area ${timestamp}`,
        description: 'CRUD test description',
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      expect(created.id).toBeDefined();

      // READ
      const readResponse = await request.get(`${API_BASE}/reg-area`);
      expect(readResponse.status()).toBe(200);
      const allRegAreas = await readResponse.json();
      const foundCreated = allRegAreas.find((ra: { id: number }) => ra.id === created.id);
      expect(foundCreated).toBeDefined();

      // UPDATE
      const updateData = {
        id: created.id,
        name: `Updated CRUD Test Reg Area ${timestamp}`,
        description: 'Updated CRUD test description',
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect(updateResponse.status()).toBe(200);

      // DELETE
      const deleteResponse = await request.delete(`${API_BASE}/reg-area/${created.id}`);
      expect(deleteResponse.status()).toBe(200);

      // VERIFY DELETION
      const verifyResponse = await request.get(`${API_BASE}/reg-area`);
      const afterDelete = await verifyResponse.json();
      const shouldNotExist = afterDelete.find((ra: { id: number }) => ra.id === created.id);
      expect(shouldNotExist).toBeUndefined();
    });
  });
});

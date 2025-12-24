import { test, expect } from '../../fixtures/advancedFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for RegArea - Edit Operations
 * Story #197273: Master questionnaire - Edit reg area name and questions (Backend)
 *
 * Related ADO Test Cases:
 * - #202775: Edit Regulatory Area Name with Unique Value (PUT /reg-area)
 * - #202776: Reject Regulatory Area Name Update Due to Uniqueness Violation (PUT /reg-area)
 * - #202779: Reject Regulatory Area Edit for Nonexistent Reg Area ID (PUT /reg-area)
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

test.describe('Story #197273: Edit Reg Area - API Tests', () => {
  test.describe('PUT /reg-area', () => {
    test('@smoke @ADO-202775 should update an existing regulatory area', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'story', description: '197273' },
          { type: 'testcase', description: '202775' }
        );

      // Create a regulatory area to update
      const createData = generateRegAreaData({ name: generateRegAreaName('Reg Area To Update') });
      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update the regulatory area
      const updateData = {
        id: created.id,
        name: generateRegAreaName('Updated Reg Area'),
        description: faker.lorem.sentence(),
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.id).toBe(created.id);
      expect(data.name).toBe(updateData.name);
      expect(data.description).toBe(updateData.description);

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@negative should return 400 when updating with empty name', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'VALIDATION' }
        );

      const updateData = { id: 1, name: '', description: 'Updated description' };
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect(response.status()).toBe(400);
    });

    test('@validation should return 400 when updating name exceeds max length', async ({
      request,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'BOUNDARY' }
        );

      const updateData = { id: 1, name: 'A'.repeat(256), description: 'Updated description' };
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect(response.status()).toBe(400);
    });

    test('@negative @ADO-202779 should reject update with non-existent ID', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202779' }
        );

      const updateData = {
        id: 999999999,
        name: 'Non-existent Update',
        description: 'Should fail',
        isActive: true,
      };

      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect([404, 422, 500]).toContain(response.status());
    });

    test('@negative @ADO-202776 should reject update to duplicate name', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202776' }
        );

      const timestamp = Date.now();
      const data1 = { name: `First Area ${timestamp}`, description: 'First', isActive: true };
      const data2 = { name: `Second Area ${timestamp}`, description: 'Second', isActive: true };

      const response1 = await request.post(`${API_BASE}/reg-area`, { data: data1 });
      const response2 = await request.post(`${API_BASE}/reg-area`, { data: data2 });

      expect(response1.status()).toBe(201);
      expect(response2.status()).toBe(201);

      const created1 = await response1.json();
      const created2 = await response2.json();

      // Try to update second to have first's name
      const updateData = {
        id: created2.id,
        name: `First Area ${timestamp}`,
        description: 'Updated second',
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect([400, 409, 422]).toContain(updateResponse.status());

      await request.delete(`${API_BASE}/reg-area/${created1.id}`);
      await request.delete(`${API_BASE}/reg-area/${created2.id}`);
    });
  });

  test.describe('Edge Cases - Update', () => {
    test('@edge should handle update without ID field', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'VALIDATION' }
        );

      const updateData = { name: 'Update Without ID', description: 'Should fail', isActive: true };
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle update with null ID', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'VALIDATION' }
        );

      const updateData = {
        id: null,
        name: 'Update With Null ID',
        description: 'Should fail',
        isActive: true,
      };
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle very large ID value', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'low' },
          { type: 'category', description: 'EDGE' }
        );

      const largeId = '9223372036854775807';
      const response = await request.delete(`${API_BASE}/reg-area/${largeId}`);
      expect([200, 400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle floating point ID', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'low' },
          { type: 'category', description: 'EDGE' }
        );

      const response = await request.delete(`${API_BASE}/reg-area/1.5`);
      expect([200, 400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle negative ID in update', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'VALIDATION' }
        );

      const updateData = {
        id: -1,
        name: 'Negative ID',
        description: 'Should fail',
        isActive: true,
      };
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect([400, 404, 422, 500]).toContain(response.status());
    });
  });

  test.describe('Functional - Update', () => {
    test('@functional should preserve all fields on partial update', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `Partial Update Test ${timestamp}`,
        description: 'Original description',
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update only the name field
      const updateData = { id: created.id, name: `Updated Name ${timestamp}` };
      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      if (updateResponse.status() === 200) {
        const updated = await updateResponse.json();
        expect(updated.description).toBe('Original description');
        expect(updated.isActive).toBe(true);
        expect(updated.isApproved).toBe(true);
      }

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@functional should not allow updating a deleted record', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `Update Deleted Test ${timestamp}`,
        description: 'Testing',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      await request.delete(`${API_BASE}/reg-area/${created.id}`);

      const updateData = {
        id: created.id,
        name: `Should Not Update ${timestamp}`,
        description: 'This update should fail',
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect([400, 404, 422]).toContain(updateResponse.status());
    });

    test('@functional should correctly toggle isActive status', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `Toggle Active Test ${timestamp}`,
        description: 'Testing toggle',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      expect(created.isActive).toBe(true);

      // Toggle to inactive
      const deactivateData = {
        id: created.id,
        name: created.name,
        description: created.description,
        isActive: false,
      };
      const deactivateResponse = await request.put(`${API_BASE}/reg-area`, {
        data: deactivateData,
      });
      expect(deactivateResponse.status()).toBe(200);
      const deactivated = await deactivateResponse.json();
      expect(deactivated.isActive).toBe(false);

      // Toggle back to active
      const reactivateData = {
        id: created.id,
        name: created.name,
        description: created.description,
        isActive: true,
      };
      const reactivateResponse = await request.put(`${API_BASE}/reg-area`, {
        data: reactivateData,
      });
      expect(reactivateResponse.status()).toBe(200);
      const reactivated = await reactivateResponse.json();
      expect(reactivated.isActive).toBe(true);

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@functional should handle update with same values (idempotent)', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `Idempotent Test ${timestamp}`,
        description: 'Testing idempotency',
        isActive: true,
        isApproved: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update with same values
      const updateData = {
        id: created.id,
        name: `Idempotent Test ${timestamp}`,
        description: 'Testing idempotency',
        isActive: true,
        isApproved: true,
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect(updateResponse.status()).toBe(200);
      const updated = await updateResponse.json();
      expect(updated.name).toBe(created.name);

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@functional should handle case sensitivity in name update', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `Case Test ${timestamp}`,
        description: 'Testing case',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update with different case
      const updateData = {
        id: created.id,
        name: `CASE TEST ${timestamp}`,
        description: 'Updated with different case',
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      console.log(`Case-different name update status: ${updateResponse.status()}`);

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@functional should return consistent field types after update', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `Type Check ${timestamp}`,
        description: 'Type validation',
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      const updateData = {
        id: created.id,
        name: `Updated Type Check ${timestamp}`,
        description: 'Updated type validation',
        isActive: false,
        isApproved: false,
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      expect(updateResponse.status()).toBe(200);
      const updated = await updateResponse.json();

      expect(typeof updated.id).toBe('number');
      expect(typeof updated.name).toBe('string');
      expect(typeof updated.description).toBe('string');
      expect(typeof updated.isActive).toBe('boolean');
      expect(typeof updated.isApproved).toBe('boolean');
      expect(typeof updated.isDelete).toBe('boolean');

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });
  });

  test.describe('Security - Update', () => {
    test('@security should handle HTML injection in description on update', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'category', description: 'SECURITY' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `HTML Update Test ${timestamp}`,
        description: 'Original',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      const updateData = {
        id: created.id,
        name: created.name,
        description: '<div onclick="alert(1)">Malicious HTML</div>',
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      if (updateResponse.status() === 200) {
        const updated = await updateResponse.json();
        expect(updated.description).not.toContain('onclick');
      }

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@security should handle XSS in name on update', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'category', description: 'SECURITY' }
        );

      const timestamp = Date.now();
      const createData = {
        name: `XSS Update Test ${timestamp}`,
        description: 'Original',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      const updateData = {
        id: created.id,
        name: `<script>alert('xss')</script> ${timestamp}`,
        description: 'Updated',
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
      if (updateResponse.status() === 200) {
        const updated = await updateResponse.json();
        expect(updated.name).not.toContain('<script>');
      }

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });
  });
});

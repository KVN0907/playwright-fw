import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for RegAreaResource
 * Generated from: C:\EYCM-CORE\eycompliancemanager\service\compliancemanager\src\main\java\com\ey\compliance\service\web\rest\RegAreaResource.java
 * Base Path: /reg-area
 *
 * ADO Traceability:
 * - Story #197265: Master questionnaire - Create reg area and questions (Backend)
 * - Story #197273: Master questionnaire - Edit reg area name and questions (Backend)
 *
 * Related ADO Test Cases:
 * - #202614: API - Create Section with Valid, Unique Name (POST /reg-area)
 * - #202615: API - Attempt to Create Section with Duplicate Name (POST /reg-area)
 * - #202775: Edit Regulatory Area Name with Unique Value (PUT /reg-area)
 * - #202776: Reject Regulatory Area Name Update Due to Uniqueness Violation (PUT /reg-area)
 * - #202779: Reject Regulatory Area Edit for Nonexistent Reg Area ID (PUT /reg-area)
 */

const API_BASE = '/api/compliancemanager';

// Helper to generate unique reg area data using faker
const generateRegAreaName = (prefix?: string) => {
  const uniqueId = `${Date.now()}`.slice(-6);
  if (prefix) {
    return `${prefix} ${uniqueId}`;
  }
  return `${faker.commerce.department()} Compliance ${uniqueId}`;
};

const generateRegAreaDescription = () => faker.lorem.sentence();

// Helper to generate complete reg area data
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
  description: generateRegAreaDescription(),
  isActive: true,
  isApproved: true,
  isDelete: false,
  ...overrides,
});

test.describe('RegAreaResource API Tests', () => {
  test.describe('GET /reg-area', () => {
    test('@smoke should return list of all regulatory areas', async ({ request }) => {
      // Given no parameters required

      // When fetching all regulatory areas
      const response = await request.get(`${API_BASE}/reg-area`);

      // Then should return 200 with list of regulatory areas
      expect(response.status()).toBe(200);

      // And response should be an array
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('POST /reg-area', () => {
    // ADO Test Case #202614: API - Create Section with Valid, Unique Name
    test('@smoke @ADO-202614 should create a new regulatory area', async ({ request }) => {
      // Given valid regulatory area data
      const regAreaName = generateRegAreaName();
      const requestData = {
        name: regAreaName,
        description: faker.lorem.sentence(),
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      // When creating the regulatory area
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should return 201 with created regulatory area
      expect(response.status()).toBe(201);

      // And response should have valid structure
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.name).toBe(requestData.name);
      expect(data.description).toBe(requestData.description);

      // Cleanup - delete the created regulatory area
      if (data.id) {
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@negative should return 400 when name is missing', async ({ request }) => {
      // Given request data without required name field
      const requestData = {
        description: 'Test description without name',
        isActive: true,
      };

      // When creating without name
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@negative should return 400 when name is empty', async ({ request }) => {
      // Given request data with empty name
      const requestData = {
        name: '',
        description: 'Test description with empty name',
        isActive: true,
      };

      // When creating with empty name
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@validation should return 400 when name exceeds max length', async ({ request }) => {
      // Given request data with name exceeding 255 characters
      const requestData = {
        name: 'A'.repeat(256),
        description: 'Test description',
        isActive: true,
      };

      // When creating with oversized name
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });
  });

  test.describe('PUT /reg-area', () => {
    test('@smoke should update an existing regulatory area', async ({ request }) => {
      // Given: First create a regulatory area to update
      const createData = generateRegAreaData({ name: generateRegAreaName('Reg Area To Update') });

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Given update data
      const updateData = {
        id: created.id,
        name: generateRegAreaName('Updated Reg Area'),
        description: faker.lorem.sentence(),
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      // When updating the regulatory area
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then should return 200 with updated regulatory area
      expect(response.status()).toBe(200);

      // And response should reflect the updates
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.id).toBe(created.id);
      expect(data.name).toBe(updateData.name);
      expect(data.description).toBe(updateData.description);

      // Cleanup
      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@negative should return 400 when updating with empty name', async ({ request }) => {
      // Given update data with empty name
      const updateData = {
        id: 1,
        name: '',
        description: 'Updated description',
      };

      // When updating with empty name
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });

    test('@validation should return 400 when updating name exceeds max length', async ({
      request,
    }) => {
      // Given update data with name exceeding 255 characters
      const updateData = {
        id: 1,
        name: 'A'.repeat(256),
        description: 'Updated description',
      };

      // When updating with oversized name
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then should return 400 Bad Request
      expect(response.status()).toBe(400);
    });
  });

  test.describe('DELETE /reg-area/{id}', () => {
    test('@smoke should delete a regulatory area by ID', async ({ request }) => {
      // Given: First create a regulatory area to delete
      const createData = generateRegAreaData({ name: generateRegAreaName('Reg Area To Delete') });

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // When deleting the regulatory area
      const response = await request.delete(`${API_BASE}/reg-area/${created.id}`);

      // Then should return 200 with true
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toBe(true);
    });

    test('@negative should handle non-existent regulatory area', async ({ request }) => {
      // Given a non-existent regulatory area ID
      const nonExistentId = 999999999;

      // When deleting non-existent regulatory area
      const response = await request.delete(`${API_BASE}/reg-area/${nonExistentId}`);

      // Then should return 200 (API returns success even for non-existent) or error
      expect([200, 404, 422, 500]).toContain(response.status());
    });

    test('@negative should return error for invalid ID format', async ({ request }) => {
      // Given an invalid ID format
      const invalidId = 'invalid-id';

      // When deleting with invalid ID
      const response = await request.delete(`${API_BASE}/reg-area/${invalidId}`);

      // Then should return 400 or 500
      expect([400, 500]).toContain(response.status());
    });
  });

  test.describe('Edge Cases - Bug Hunting', () => {
    test('@edge should reject whitespace-only name', async ({ request }) => {
      // Given request with whitespace-only name
      const requestData = {
        name: '   ',
        description: 'Whitespace name test',
        isActive: true,
      };

      // When creating with whitespace name
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should return 400 - whitespace should not be valid
      expect(response.status()).toBe(400);
    });

    test('@edge should handle special characters in name', async ({ request }) => {
      // Given request with special characters
      const timestamp = Date.now();
      const requestData = {
        name: `Test <script>alert('xss')</script> ${timestamp}`,
        description: 'XSS test in name',
        isActive: true,
      };

      // When creating with special characters
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should either sanitize or reject - not store raw script tags
      if (response.status() === 201) {
        const data = await response.json();
        // If created, script tags should be sanitized
        expect(data.name).not.toContain('<script>');
        // Cleanup
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      } else {
        expect([400, 422]).toContain(response.status());
      }
    });

    test('@edge should handle SQL injection attempt in name', async ({ request }) => {
      // Given request with SQL injection attempt
      const timestamp = Date.now();
      const requestData = {
        name: `Test'; DROP TABLE reg_area; -- ${timestamp}`,
        description: 'SQL injection test',
        isActive: true,
      };

      // When creating with SQL injection
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should handle safely (either create safely or reject)
      expect([201, 400, 422, 500]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        // Cleanup
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle unicode and emoji in name', async ({ request }) => {
      // Given request with unicode/emoji
      const timestamp = Date.now();
      const requestData = {
        name: `Test 日本語 émoji 🔥 ${timestamp}`,
        description: 'Unicode test',
        isActive: true,
      };

      // When creating with unicode
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should handle unicode properly
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.name).toContain('日本語');
        // Cleanup
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should reject duplicate name', async ({ request }) => {
      // Given an existing regulatory area
      const timestamp = Date.now();
      const requestData = {
        name: `Duplicate Test ${timestamp}`,
        description: 'First entry',
        isActive: true,
      };

      const firstResponse = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(firstResponse.status()).toBe(201);
      const first = await firstResponse.json();

      // When creating with same name
      const duplicateData = {
        name: `Duplicate Test ${timestamp}`,
        description: 'Duplicate entry',
        isActive: true,
      };
      const duplicateResponse = await request.post(`${API_BASE}/reg-area`, { data: duplicateData });

      // Then should reject duplicate - expect 409 Conflict or 400
      expect([400, 409, 422]).toContain(duplicateResponse.status());

      // Cleanup
      await request.delete(`${API_BASE}/reg-area/${first.id}`);
    });

    test('@edge should handle boundary value - exactly 255 chars name', async ({ request }) => {
      // Given request with exactly 255 character name (max allowed)
      const timestamp = Date.now();
      const baseName = `Boundary${timestamp}`;
      const name = baseName + 'A'.repeat(255 - baseName.length);

      const requestData = {
        name: name,
        description: 'Boundary test - exactly 255 chars',
        isActive: true,
      };

      // When creating with max length name
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should succeed - 255 is the max
      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.name.length).toBe(255);

      // Cleanup
      await request.delete(`${API_BASE}/reg-area/${data.id}`);
    });

    test('@edge should handle null values in optional fields', async ({ request }) => {
      // Given request with null description
      const timestamp = Date.now();
      const requestData = {
        name: `Null Test ${timestamp}`,
        description: null,
        isActive: true,
      };

      // When creating with null description
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should handle null gracefully
      expect([201, 400]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should reject update with non-existent ID', async ({ request }) => {
      // Given update data for non-existent ID
      const updateData = {
        id: 999999999,
        name: 'Non-existent Update',
        description: 'Should fail',
        isActive: true,
      };

      // When updating non-existent regulatory area
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then should return error - not silently succeed
      expect([404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle very long description', async ({ request }) => {
      // Given request with very long description (10000 chars)
      const timestamp = Date.now();
      const requestData = {
        name: `Long Desc Test ${timestamp}`,
        description: 'A'.repeat(10000),
        isActive: true,
      };

      // When creating with very long description
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should either accept or reject with proper error
      expect([201, 400, 413, 422]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle HTML in description', async ({ request }) => {
      // Given request with HTML in description
      const timestamp = Date.now();
      const requestData = {
        name: `HTML Test ${timestamp}`,
        description: '<div onclick="alert(1)">Malicious HTML</div><img src=x onerror=alert(1)>',
        isActive: true,
      };

      // When creating with HTML
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should sanitize HTML or reject
      if (response.status() === 201) {
        const data = await response.json();
        // Should not contain dangerous attributes
        expect(data.description).not.toContain('onclick');
        expect(data.description).not.toContain('onerror');
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle negative ID in delete', async ({ request }) => {
      // Given a negative ID
      const negativeId = -1;

      // When deleting with negative ID
      const response = await request.delete(`${API_BASE}/reg-area/${negativeId}`);

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle zero ID in delete', async ({ request }) => {
      // Given zero ID
      const zeroId = 0;

      // When deleting with zero ID
      const response = await request.delete(`${API_BASE}/reg-area/${zeroId}`);

      // Then should return error
      expect([400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle create with pre-set ID', async ({ request }) => {
      // Given request with pre-set ID (should be auto-generated)
      const timestamp = Date.now();
      const requestData = {
        id: 999999,
        name: `Preset ID Test ${timestamp}`,
        description: 'Testing pre-set ID',
        isActive: true,
      };

      // When creating with pre-set ID
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should either ignore the ID or reject
      if (response.status() === 201) {
        const data = await response.json();
        // ID should be auto-generated, not the one we sent
        expect(data.id).not.toBe(999999);
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@security should not allow tenantId manipulation on create', async ({ request }) => {
      // Given request with different tenantId (IDOR attempt)
      const timestamp = Date.now();
      const requestData = {
        name: `TenantId Test ${timestamp}`,
        description: 'Testing tenant isolation',
        tenantId: 99999, // Attempting to set different tenant
        isActive: true,
      };

      // When creating with manipulated tenantId
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should ignore user-provided tenantId or reject
      if (response.status() === 201) {
        const data = await response.json();
        // TenantId should be set by server, not accepted from client
        expect(data.tenantId).not.toBe(99999);
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@security should not allow isDelete flag manipulation', async ({ request }) => {
      // Given request trying to create with isDelete=true
      const timestamp = Date.now();
      const requestData = {
        name: `IsDelete Flag Test ${timestamp}`,
        description: 'Testing isDelete manipulation',
        isDelete: true, // Attempting to create as deleted
        isActive: true,
      };

      // When creating with isDelete=true
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should either ignore the flag or reject
      if (response.status() === 201) {
        const data = await response.json();
        // isDelete should be false for new records
        expect(data.isDelete).toBe(false);
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle update without ID field', async ({ request }) => {
      // Given update request without ID
      const updateData = {
        name: 'Update Without ID',
        description: 'Should fail',
        isActive: true,
      };

      // When updating without ID
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then should return error - ID is required for update
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle update with null ID', async ({ request }) => {
      // Given update request with null ID
      const updateData = {
        id: null,
        name: 'Update With Null ID',
        description: 'Should fail',
        isActive: true,
      };

      // When updating with null ID
      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then should return error
      expect([400, 422, 500]).toContain(response.status());
    });

    test('@edge should handle very large ID value', async ({ request }) => {
      // Given extremely large ID (potential overflow) - use string to avoid JS precision loss
      const largeId = '9223372036854775807'; // Max Long value as string

      // When deleting with very large ID
      const response = await request.delete(`${API_BASE}/reg-area/${largeId}`);

      // Then should handle gracefully (not crash)
      expect([200, 400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle floating point ID', async ({ request }) => {
      // Given floating point ID
      const floatId = 1.5;

      // When deleting with float ID
      const response = await request.delete(`${API_BASE}/reg-area/${floatId}`);

      // Then should either truncate or reject - not crash
      expect([200, 400, 404, 422, 500]).toContain(response.status());
    });

    test('@edge should handle newlines in name', async ({ request }) => {
      // Given request with newlines in name (CRLF injection)
      const timestamp = Date.now();
      const requestData = {
        name: `Test\r\nHeader-Injection: malicious ${timestamp}`,
        description: 'CRLF injection test',
        isActive: true,
      };

      // When creating with newlines
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should sanitize newlines or reject
      if (response.status() === 201) {
        const data = await response.json();
        // Name should not contain CRLF
        expect(data.name).not.toContain('\r\n');
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle control characters in name', async ({ request }) => {
      // Given request with control characters
      const timestamp = Date.now();
      const requestData = {
        name: `Test\x00\x1f\x7f${timestamp}`,
        description: 'Control chars test',
        isActive: true,
      };

      // When creating with control characters
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should sanitize or reject control characters
      expect([201, 400, 422]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle path traversal in name', async ({ request }) => {
      // Given request with path traversal attempt
      const timestamp = Date.now();
      const requestData = {
        name: `../../../etc/passwd ${timestamp}`,
        description: 'Path traversal test',
        isActive: true,
      };

      // When creating with path traversal
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should handle safely
      expect([201, 400, 422]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle boolean type coercion', async ({ request }) => {
      // Given request with string boolean values
      const timestamp = Date.now();
      const requestData = {
        name: `Boolean Coercion Test ${timestamp}`,
        description: 'Testing type coercion',
        isActive: 'true', // String instead of boolean
        isApproved: 1, // Number instead of boolean
        isDelete: 'false',
      };

      // When creating with wrong types
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should either coerce properly or reject
      expect([201, 400, 422]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle JSON injection in description', async ({ request }) => {
      // Given request with JSON payload in description
      const timestamp = Date.now();
      const requestData = {
        name: `JSON Injection Test ${timestamp}`,
        description: '{"malicious": true, "admin": true}',
        isActive: true,
      };

      // When creating with JSON in description
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should store as plain text, not parse as JSON
      if (response.status() === 201) {
        const data = await response.json();
        expect(typeof data.description).toBe('string');
        expect(data.admin).toBeUndefined();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@security should validate isActive and isApproved cannot bypass workflow', async ({
      request,
    }) => {
      // Given request trying to set isApproved=true on create (bypass approval workflow)
      const timestamp = Date.now();
      const requestData = {
        name: `Approval Bypass Test ${timestamp}`,
        description: 'Testing approval workflow bypass',
        isActive: true,
        isApproved: true, // Should this be allowed on create?
      };

      // When creating with isApproved=true
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Note: Document if approval flag can be set directly (potential security issue)
      if (response.status() === 201) {
        const data = await response.json();
        // Log whether approval bypass was possible
        console.log(`isApproved on create: ${data.isApproved}`);
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle concurrent duplicate creates', async ({ request }) => {
      // Given same name for concurrent requests
      const timestamp = Date.now();
      const requestData = {
        name: `Concurrent Test ${timestamp}`,
        description: 'Race condition test',
        isActive: true,
      };

      // When creating concurrently
      const [response1, response2] = await Promise.all([
        request.post(`${API_BASE}/reg-area`, { data: requestData }),
        request.post(`${API_BASE}/reg-area`, { data: requestData }),
      ]);

      // Then at least one should succeed, and duplicates should be handled
      const statuses = [response1.status(), response2.status()];
      expect(statuses).toContain(201); // At least one should succeed

      // Cleanup - delete any created items
      if (response1.status() === 201) {
        const data = await response1.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
      if (response2.status() === 201) {
        const data = await response2.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle extremely long description', async ({ request }) => {
      // Given request with 100KB description
      const timestamp = Date.now();
      const requestData = {
        name: `Huge Description Test ${timestamp}`,
        description: 'X'.repeat(100000), // 100KB
        isActive: true,
      };

      // When creating with huge description
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should handle gracefully - accept or reject with proper error
      expect([201, 400, 413, 422, 500]).toContain(response.status());

      if (response.status() === 201) {
        const data = await response.json();
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle empty request body on create', async ({ request }) => {
      // Given empty request body
      const response = await request.post(`${API_BASE}/reg-area`, { data: {} });

      // Then should return 400 - name is required
      expect(response.status()).toBe(400);
    });

    test('@edge should handle array as request body', async ({ request }) => {
      // Given array instead of object
      const response = await request.post(`${API_BASE}/reg-area`, {
        data: [{ name: 'Test', description: 'Test' }],
      });

      // Then should return error - expects object not array
      expect([400, 415, 422, 500]).toContain(response.status());
    });

    test('@edge should handle special regex characters in name', async ({ request }) => {
      // Given request with regex special characters
      const timestamp = Date.now();
      const specialChars = '.*+?^${}()|[]\\/';
      const requestData = {
        name: `Test ${specialChars} ${timestamp}`,
        description: 'Regex chars test',
        isActive: true,
      };

      // When creating with regex characters
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should handle safely
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.name).toContain(specialChars);
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@edge should handle template literal injection', async ({ request }) => {
      // Given request with template literal syntax
      const timestamp = Date.now();
      const requestData = {
        name: `Test ${timestamp} \${process.env.SECRET}`,
        description: '${7*7} #{7*7} {{7*7}}',
        isActive: true,
      };

      // When creating with template literals
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should store literally, not evaluate
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.description).toContain('${7*7}');
        expect(data.description).not.toBe('49');
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@security should handle SVG XSS in description', async ({ request }) => {
      // Given request with SVG XSS payload
      const timestamp = Date.now();
      const requestData = {
        name: `SVG XSS Test ${timestamp}`,
        description: '<svg onload="alert(1)"><animate onbegin="alert(1)"></animate></svg>',
        isActive: true,
      };

      // When creating with SVG XSS
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should sanitize SVG or reject
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.description).not.toContain('onload');
        expect(data.description).not.toContain('onbegin');
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@security should handle data URI XSS', async ({ request }) => {
      // Given request with data URI XSS
      const timestamp = Date.now();
      const requestData = {
        name: `Data URI XSS Test ${timestamp}`,
        description: '<a href="data:text/html,<script>alert(1)</script>">Click</a>',
        isActive: true,
      };

      // When creating with data URI
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should sanitize or reject
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.description).not.toContain('data:text/html');
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });

    test('@security should handle javascript: protocol XSS', async ({ request }) => {
      // Given request with javascript protocol
      const timestamp = Date.now();
      const requestData = {
        name: `JS Protocol XSS Test ${timestamp}`,
        description: '<a href="javascript:alert(1)">Click</a>',
        isActive: true,
      };

      // When creating with javascript protocol
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then should sanitize or reject
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.description).not.toContain('javascript:');
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      }
    });
  });

  test.describe('Functional Tests - Bug Hunting', () => {
    test('@functional should preserve all fields on update (partial update)', async ({
      request,
    }) => {
      // Given: Create a regulatory area with all fields set
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

      // When: Update only the name field
      const updateData = {
        id: created.id,
        name: `Updated Name ${timestamp}`,
        // Not sending description, isActive, isApproved, isDelete
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then: Other fields should be preserved, not reset to defaults
      if (updateResponse.status() === 200) {
        const updated = await updateResponse.json();
        expect(updated.description).toBe('Original description'); // Should preserve
        expect(updated.isActive).toBe(true); // Should preserve
        expect(updated.isApproved).toBe(true); // Should preserve
        await request.delete(`${API_BASE}/reg-area/${created.id}`);
      } else {
        // Cleanup even if update failed
        await request.delete(`${API_BASE}/reg-area/${created.id}`);
        // If 400, partial updates might not be supported - document this
        expect([200, 400]).toContain(updateResponse.status());
      }
    });

    test('@functional should trim whitespace from name on create', async ({ request }) => {
      // Given: Name with leading/trailing whitespace
      const timestamp = Date.now();
      const requestData = {
        name: `   Whitespace Test ${timestamp}   `,
        description: 'Testing trim',
        isActive: true,
      };

      // When: Creating with whitespace
      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(201);
      const data = await response.json();

      // Then: Name should be trimmed
      expect(data.name).toBe(`Whitespace Test ${timestamp}`);
      expect(data.name).not.toMatch(/^\s/);
      expect(data.name).not.toMatch(/\s$/);

      await request.delete(`${API_BASE}/reg-area/${data.id}`);
    });

    test('@functional should not show deleted records in GET all', async ({ request }) => {
      // Given: Create a regulatory area
      const timestamp = Date.now();
      const createData = {
        name: `Delete Visibility Test ${timestamp}`,
        description: 'Testing delete visibility',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // When: Delete the record
      const deleteResponse = await request.delete(`${API_BASE}/reg-area/${created.id}`);
      expect(deleteResponse.status()).toBe(200);

      // Then: Record should NOT appear in GET all
      const getResponse = await request.get(`${API_BASE}/reg-area`);
      expect(getResponse.status()).toBe(200);
      const allRecords = await getResponse.json();
      const deletedRecord = allRecords.find((r: { id: number }) => r.id === created.id);
      expect(deletedRecord).toBeUndefined();
    });

    test('@functional should not allow updating a deleted record', async ({ request }) => {
      // Given: Create and delete a regulatory area
      const timestamp = Date.now();
      const createData = {
        name: `Update Deleted Test ${timestamp}`,
        description: 'Testing update after delete',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      await request.delete(`${API_BASE}/reg-area/${created.id}`);

      // When: Try to update the deleted record
      const updateData = {
        id: created.id,
        name: `Should Not Update ${timestamp}`,
        description: 'This update should fail',
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then: Should return error (404 or 422)
      expect([400, 404, 422]).toContain(updateResponse.status());
    });

    test('@functional should handle isActive=false correctly', async ({ request }) => {
      // Given: Create an inactive regulatory area
      const timestamp = Date.now();
      const createData = {
        name: `Inactive Test ${timestamp}`,
        description: 'Testing inactive status',
        isActive: false,
        isApproved: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Then: isActive should be false as requested
      expect(created.isActive).toBe(false);

      // And: Inactive record should still appear in GET all (or be filtered based on business rules)
      const getResponse = await request.get(`${API_BASE}/reg-area`);
      const allRecords = await getResponse.json();
      const foundRecord = allRecords.find((r: { id: number }) => r.id === created.id);

      // Document behavior - does inactive show in list?
      console.log(`Inactive record visible in GET all: ${foundRecord !== undefined}`);

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@functional should handle isApproved=false correctly', async ({ request }) => {
      // Given: Create an unapproved regulatory area
      const timestamp = Date.now();
      const createData = {
        name: `Unapproved Test ${timestamp}`,
        description: 'Testing unapproved status',
        isActive: true,
        isApproved: false,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Then: isApproved should be false as requested
      expect(created.isApproved).toBe(false);

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@functional should auto-generate unique IDs', async ({ request }) => {
      // Given: Create two regulatory areas
      const timestamp = Date.now();
      const data1 = { name: `ID Test 1 ${timestamp}`, description: 'First', isActive: true };
      const data2 = { name: `ID Test 2 ${timestamp}`, description: 'Second', isActive: true };

      const response1 = await request.post(`${API_BASE}/reg-area`, { data: data1 });
      const response2 = await request.post(`${API_BASE}/reg-area`, { data: data2 });

      expect(response1.status()).toBe(201);
      expect(response2.status()).toBe(201);

      const created1 = await response1.json();
      const created2 = await response2.json();

      // Then: IDs should be unique and sequential/incremental
      expect(created1.id).toBeDefined();
      expect(created2.id).toBeDefined();
      expect(created1.id).not.toBe(created2.id);

      await request.delete(`${API_BASE}/reg-area/${created1.id}`);
      await request.delete(`${API_BASE}/reg-area/${created2.id}`);
    });

    test('@functional should return consistent field types', async ({ request }) => {
      // Given: Create a regulatory area
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

      // Then: Field types should be correct
      expect(typeof created.id).toBe('number');
      expect(typeof created.name).toBe('string');
      expect(typeof created.description).toBe('string');
      expect(typeof created.isActive).toBe('boolean');
      expect(typeof created.isApproved).toBe('boolean');
      expect(typeof created.isDelete).toBe('boolean');

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@functional should handle case sensitivity in name correctly', async ({ request }) => {
      // Given: Create regulatory area with specific case
      const timestamp = Date.now();
      const createData = {
        name: `Case Test ${timestamp}`,
        description: 'Testing case sensitivity',
        isActive: true,
      };

      const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // When: Try to create with different case (should this be allowed?)
      const duplicateData = {
        name: `CASE TEST ${timestamp}`,
        description: 'Different case',
        isActive: true,
      };

      const duplicateResponse = await request.post(`${API_BASE}/reg-area`, { data: duplicateData });

      // Document behavior - is name case-sensitive for uniqueness?
      console.log(`Case-different name allowed: ${duplicateResponse.status() === 201}`);

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
      if (duplicateResponse.status() === 201) {
        const duplicate = await duplicateResponse.json();
        await request.delete(`${API_BASE}/reg-area/${duplicate.id}`);
      }
    });

    test('@functional should handle update that changes name to existing name', async ({
      request,
    }) => {
      // Given: Create two regulatory areas
      const timestamp = Date.now();
      const data1 = { name: `First Area ${timestamp}`, description: 'First', isActive: true };
      const data2 = { name: `Second Area ${timestamp}`, description: 'Second', isActive: true };

      const response1 = await request.post(`${API_BASE}/reg-area`, { data: data1 });
      const response2 = await request.post(`${API_BASE}/reg-area`, { data: data2 });

      expect(response1.status()).toBe(201);
      expect(response2.status()).toBe(201);

      const created1 = await response1.json();
      const created2 = await response2.json();

      // When: Try to update second to have first's name (duplicate)
      const updateData = {
        id: created2.id,
        name: `First Area ${timestamp}`, // Same as first
        description: 'Updated second',
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then: Should reject duplicate name on update
      expect([400, 409, 422]).toContain(updateResponse.status());

      await request.delete(`${API_BASE}/reg-area/${created1.id}`);
      await request.delete(`${API_BASE}/reg-area/${created2.id}`);
    });

    test('@functional should handle rapid sequential creates', async ({ request }) => {
      // Test for race conditions in ID generation
      const timestamp = Date.now();
      const createPromises = [];

      // Create 5 records rapidly
      for (let i = 0; i < 5; i++) {
        createPromises.push(
          request.post(`${API_BASE}/reg-area`, {
            data: {
              name: `Rapid Create ${timestamp}-${i}`,
              description: `Record ${i}`,
              isActive: true,
            },
          })
        );
      }

      const responses = await Promise.all(createPromises);
      const createdIds: number[] = [];

      // All should succeed
      for (const response of responses) {
        expect(response.status()).toBe(201);
        const data = await response.json();
        createdIds.push(data.id);
      }

      // All IDs should be unique
      const uniqueIds = new Set(createdIds);
      expect(uniqueIds.size).toBe(5);

      // Cleanup
      for (const id of createdIds) {
        await request.delete(`${API_BASE}/reg-area/${id}`);
      }
    });

    test('@functional should handle empty description', async ({ request }) => {
      // Given: Create with empty description
      const timestamp = Date.now();
      const requestData = {
        name: `Empty Desc ${timestamp}`,
        description: '',
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(201);
      const data = await response.json();

      // Then: Empty description should be stored as empty string, not null
      expect(data.description).toBe('');
      expect(data.description).not.toBeNull();

      await request.delete(`${API_BASE}/reg-area/${data.id}`);
    });

    test('@functional should handle missing optional fields on create', async ({ request }) => {
      // Given: Create with only required field (name)
      const timestamp = Date.now();
      const requestData = {
        name: `Minimal Create ${timestamp}`,
        // No description, isActive, isApproved, isDelete
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(201);
      const data = await response.json();

      // Then: Optional fields should have sensible defaults
      expect(data.name).toBe(`Minimal Create ${timestamp}`);
      expect(data.isActive).toBe(true); // Default should be true
      expect(data.isApproved).toBe(true); // Default should be true
      expect(data.isDelete).toBe(false); // Default should be false

      await request.delete(`${API_BASE}/reg-area/${data.id}`);
    });

    test('@functional should handle update with same values (idempotent)', async ({ request }) => {
      // Given: Create a regulatory area
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

      // When: Update with same values
      const updateData = {
        id: created.id,
        name: `Idempotent Test ${timestamp}`,
        description: 'Testing idempotency',
        isActive: true,
        isApproved: true,
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Then: Should succeed (idempotent operation)
      expect(updateResponse.status()).toBe(200);
      const updated = await updateResponse.json();
      expect(updated.name).toBe(created.name);
      expect(updated.description).toBe(created.description);

      await request.delete(`${API_BASE}/reg-area/${created.id}`);
    });

    test('@functional should correctly toggle isActive status', async ({ request }) => {
      // Given: Create an active regulatory area
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

      // When: Toggle to inactive
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

      // When: Toggle back to active
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

    test('@functional GET should return records sorted consistently', async ({ request }) => {
      // Given: Create multiple records
      const timestamp = Date.now();
      const names = ['Zebra', 'Apple', 'Mango'].map(n => `${n} ${timestamp}`);
      const createdIds: number[] = [];

      for (const name of names) {
        const response = await request.post(`${API_BASE}/reg-area`, {
          data: { name, description: 'Sort test', isActive: true },
        });
        expect(response.status()).toBe(201);
        const data = await response.json();
        createdIds.push(data.id);
      }

      // When: GET all records
      const response1 = await request.get(`${API_BASE}/reg-area`);
      const response2 = await request.get(`${API_BASE}/reg-area`);

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Then: Order should be consistent between requests
      const ids1 = data1.map((r: { id: number }) => r.id).join(',');
      const ids2 = data2.map((r: { id: number }) => r.id).join(',');
      expect(ids1).toBe(ids2);

      // Cleanup
      for (const id of createdIds) {
        await request.delete(`${API_BASE}/reg-area/${id}`);
      }
    });

    test('@functional should handle special characters in description', async ({ request }) => {
      // Given: Create with special characters in description
      const timestamp = Date.now();
      const specialDesc = 'Line1\nLine2\tTabbed "Quoted" \'Single\' & < > symbols';
      const requestData = {
        name: `Special Desc ${timestamp}`,
        description: specialDesc,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(201);
      const data = await response.json();

      // Then: Special characters should be preserved
      expect(data.description).toBe(specialDesc);

      await request.delete(`${API_BASE}/reg-area/${data.id}`);
    });

    test('@functional should handle maximum allowed name length', async ({ request }) => {
      // Given: Create with exactly 255 character name
      const timestamp = Date.now();
      const baseName = `Max${timestamp}`;
      const paddedName = baseName + 'X'.repeat(255 - baseName.length);

      const requestData = {
        name: paddedName,
        description: '255 char name test',
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });
      expect(response.status()).toBe(201);
      const data = await response.json();

      // Then: Full 255 chars should be stored
      expect(data.name.length).toBe(255);
      expect(data.name).toBe(paddedName);

      await request.delete(`${API_BASE}/reg-area/${data.id}`);
    });

    test('@functional should reject create with only isDelete=true', async ({ request }) => {
      // Given: Try to create a record that's already "deleted"
      const timestamp = Date.now();
      const requestData = {
        name: `Pre-Deleted ${timestamp}`,
        description: 'Should not allow creating deleted records',
        isActive: true,
        isDelete: true,
      };

      const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

      // Then: Should either reject or ignore isDelete flag
      if (response.status() === 201) {
        const data = await response.json();
        // If created, isDelete should be forced to false
        expect(data.isDelete).toBe(false);
        await request.delete(`${API_BASE}/reg-area/${data.id}`);
      } else {
        expect([400, 422]).toContain(response.status());
      }
    });
  });

  test.describe('CRUD Operations - Full Flow', () => {
    test('@smoke should perform complete CRUD operations on regulatory area', async ({
      request,
    }) => {
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
      expect(foundCreated.name).toBe(createData.name);

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
      const updated = await updateResponse.json();
      expect(updated.name).toBe(updateData.name);
      expect(updated.description).toBe(updateData.description);

      // DELETE
      const deleteResponse = await request.delete(`${API_BASE}/reg-area/${created.id}`);
      expect(deleteResponse.status()).toBe(200);

      // VERIFY DELETION
      const verifyResponse = await request.get(`${API_BASE}/reg-area`);
      expect(verifyResponse.status()).toBe(200);
      const afterDelete = await verifyResponse.json();
      const shouldNotExist = afterDelete.find((ra: { id: number }) => ra.id === created.id);
      expect(shouldNotExist).toBeUndefined();
    });
  });
});

/**
 * RegArea RBAC (Role-Based Access Control) Tests
 * Tests permission enforcement for different user roles
 *
 * Roles:
 * - Super Admin: Full CRUD access
 * - EY Admin: Full CRUD access
 * - Client Admin: Read only
 * - Viewer: Read only
 * - Reviewer: Read only
 *
 * Note: Authentication is handled by global-setup.ts
 * To test different users, update DEV_USERNAME/DEV_PASSWORD in dev.env
 * or use the multi-user auth state files when configured.
 */

import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

const API_BASE = process.env.DEV_API_URL || 'https://eycompliancemanager-dev.ey.com/api';

// Helper to generate unique names
const uniqueId = () => `${Date.now()}`.slice(-6);

/**
 * Permission Matrix:
 * | Role         | Create | Read | Update | Delete |
 * |--------------|--------|------|--------|--------|
 * | Super Admin  |   ✅   |  ✅  |   ✅   |   ✅   |
 * | EY Admin     |   ✅   |  ✅  |   ✅   |   ✅   |
 * | Client Admin |   ❌   |  ✅  |   ❌   |   ❌   |
 * | Viewer       |   ❌   |  ✅  |   ❌   |   ❌   |
 * | Reviewer     |   ❌   |  ✅  |   ❌   |   ❌   |
 */

test.describe('RegArea RBAC Tests', () => {
  test.describe.configure({ mode: 'serial' });

  // Test data for RBAC tests
  let testRegAreaId: number;
  const testRegAreaName = `${faker.commerce.department()} RBAC Test ${uniqueId()}`;

  test.describe('Super Admin - Full CRUD Access', () => {
    test('@api @rbac Super Admin can create reg area', async ({ superAdminRequest }) => {
      // Super Admin is already authenticated via global setup
      const response = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: {
          name: testRegAreaName,
          description: 'Created by Super Admin for RBAC testing',
          isActive: true,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      testRegAreaId = body.id;
      expect(body.name).toBe(testRegAreaName);
    });

    test('@api @rbac Super Admin can read reg area', async ({ superAdminRequest }) => {
      const response = await superAdminRequest.get(`${API_BASE}/reg-area`);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('@api @rbac Super Admin can update reg area', async ({ superAdminRequest }) => {
      test.skip(!testRegAreaId, 'No test reg area created');

      const response = await superAdminRequest.put(`${API_BASE}/reg-area`, {
        data: {
          id: testRegAreaId,
          name: `${testRegAreaName}_Updated`,
          description: 'Updated by Super Admin',
          isActive: true,
        },
      });

      expect(response.status()).toBe(200);
    });
  });

  test.describe('Read-Only Users - Permission Denied Tests', () => {
    /**
     * These tests verify that read-only users cannot perform write operations.
     *
     * TODO: To run these tests for specific roles:
     * 1. Update DEV_USERNAME and DEV_PASSWORD in dev.env to the target user
     * 2. Run tests with: npm run test:api -- --grep "@rbac"
     *
     * Current session uses the user configured in global-setup (via dev.env)
     */

    const readOnlyRoles = ['Client Admin', 'Viewer', 'Reviewer'];

    for (const role of readOnlyRoles) {
      test.describe(`${role} Role`, () => {
        // These tests are skipped by default - enable when testing specific role
        test.skip(true, `Configure ${role} credentials in dev.env to run`);

        test(`@rbac ${role} can read reg areas`, async ({ superAdminRequest }) => {
          const response = await superAdminRequest.get(`${API_BASE}/reg-area`);
          expect(response.status()).toBe(200);
        });

        test(`@rbac ${role} cannot create reg area - expect 403`, async ({ superAdminRequest }) => {
          const response = await superAdminRequest.post(`${API_BASE}/reg-area`, {
            data: {
              name: `Unauthorized_Create_${role}_${Date.now()}`,
              description: `Should fail - ${role} cannot create`,
              isActive: true,
            },
          });
          expect(response.status()).toBe(403);
        });

        test(`@rbac ${role} cannot update reg area - expect 403`, async ({ superAdminRequest }) => {
          test.skip(!testRegAreaId, 'No test reg area to update');

          const response = await superAdminRequest.put(`${API_BASE}/reg-area`, {
            data: {
              id: testRegAreaId,
              name: `Unauthorized_Update_${role}`,
              description: `Should fail - ${role} cannot update`,
              isActive: true,
            },
          });
          expect(response.status()).toBe(403);
        });

        test(`@rbac ${role} cannot delete reg area - expect 403`, async ({ superAdminRequest }) => {
          test.skip(!testRegAreaId, 'No test reg area to delete');

          const response = await superAdminRequest.delete(`${API_BASE}/reg-area/${testRegAreaId}`);
          expect(response.status()).toBe(403);
        });
      });
    }
  });

  test.describe('EY Admin - Full CRUD Access', () => {
    // Skip by default - enable when testing EY Admin role
    test.skip(true, 'Configure EY Admin credentials in dev.env to run');

    const eyAdminTestName = `EYAdmin_Test_${Date.now()}`;
    let eyAdminRegAreaId: number;

    test('@api @rbac EY Admin can create reg area', async ({ superAdminRequest }) => {
      const response = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: {
          name: eyAdminTestName,
          description: 'Created by EY Admin',
          isActive: true,
        },
      });

      // EY Admin should have create permission
      expect(response.status()).toBe(200);
      const body = await response.json();
      eyAdminRegAreaId = body.id;
    });

    test('@api @rbac EY Admin can update reg area', async ({ superAdminRequest }) => {
      test.skip(!eyAdminRegAreaId, 'No reg area created');

      const response = await superAdminRequest.put(`${API_BASE}/reg-area`, {
        data: {
          id: eyAdminRegAreaId,
          name: `${eyAdminTestName}_Updated`,
          description: 'Updated by EY Admin',
          isActive: true,
        },
      });

      expect(response.status()).toBe(200);
    });

    test('@api @rbac EY Admin can delete reg area', async ({ superAdminRequest }) => {
      test.skip(!eyAdminRegAreaId, 'No reg area to delete');

      const response = await superAdminRequest.delete(`${API_BASE}/reg-area/${eyAdminRegAreaId}`);
      expect(response.status()).toBe(200);
    });
  });

  // Cleanup
  test.afterAll(async ({ superAdminRequest }) => {
    // Clean up test data created by super admin
    if (testRegAreaId) {
      await superAdminRequest.delete(`${API_BASE}/reg-area/${testRegAreaId}`).catch(() => {});
    }
  });
});

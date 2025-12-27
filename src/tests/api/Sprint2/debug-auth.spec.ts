import { test, expect } from '../../fixtures/apiRoleFixtures';

/**
 * Debug test to verify role-based authentication
 */
test.describe('Debug: Verify Authentication', () => {
  test('Check Super Admin auth', async ({ superAdminRequest }) => {
    console.log('\n🔍 Testing Super Admin authentication...');

    // Try to get clients - Super Admin should have access
    const response = await superAdminRequest.get('/api/admin/api/clients');
    console.log(`   GET /api/admin/api/clients: ${response.status()}`);

    if (response.status() === 401) {
      console.log('   ❌ Super Admin got 401 - auth not working');
    } else {
      console.log('   ✅ Super Admin authenticated successfully');
    }

    expect(response.status()).not.toBe(401);
  });

  test('Check EY Admin auth', async ({ eyAdminRequest }) => {
    console.log('\n🔍 Testing EY Admin authentication...');

    // Try to get clients - check if EY Admin has access
    const response = await eyAdminRequest.get('/api/admin/api/clients');
    console.log(`   GET /api/admin/api/clients: ${response.status()}`);

    if (response.status() === 401) {
      console.log('   ❌ EY Admin got 401 - either auth not working OR no permission');
    } else if (response.status() === 403) {
      console.log('   ⚠️ EY Admin got 403 - authenticated but no permission');
    } else {
      console.log('   ✅ EY Admin has access');
    }

    // Also try client-admins endpoint
    const clientAdminsResponse = await eyAdminRequest.get('/api/admin/api/client-admins');
    console.log(`   GET /api/admin/api/client-admins: ${clientAdminsResponse.status()}`);

    // Log response body if error
    if (clientAdminsResponse.status() >= 400) {
      const body = await clientAdminsResponse.text();
      console.log(`   Response body: ${body.substring(0, 200)}`);
    }
  });

  test('Compare Super Admin vs EY Admin access', async ({ superAdminRequest, eyAdminRequest }) => {
    console.log('\n🔍 Comparing access levels...');

    const endpoints = [
      '/api/admin/api/clients',
      '/api/admin/api/client-admins',
      '/api/admin/api/ey-admins',
    ];

    for (const endpoint of endpoints) {
      const superAdminRes = await superAdminRequest.get(endpoint);
      const eyAdminRes = await eyAdminRequest.get(endpoint);

      console.log(`\n   ${endpoint}:`);
      console.log(`      Super Admin: ${superAdminRes.status()}`);
      console.log(`      EY Admin:    ${eyAdminRes.status()}`);

      if (superAdminRes.status() === 200 && eyAdminRes.status() === 401) {
        console.log(`      ⚠️ BUG: EY Admin should have access but got 401`);
      }
    }
  });
});

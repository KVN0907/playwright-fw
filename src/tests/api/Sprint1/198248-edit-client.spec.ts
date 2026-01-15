import { test, expect } from '../../fixtures/advancedFixtures';
import { faker } from '@faker-js/faker';
import Log from '../../../lib/utils/Log';

/**
 * API Tests for Story 198248 - Edit Client Details
 * @description Tests for editing client details including name, location, and EY admin assignment
 * @story 198248 - Edit client details - Backend
 *
 * Acceptance Criteria:
 * - Edit client name
 * - Edit client location (city)
 * - Edit EY admin assignment
 * - Validate required fields
 *
 * Related ADO Test Cases:
 * - #202476: API - Update client name successfully
 * - #202477: API - Reject empty client name
 * - #202478: API - Reject duplicate client name on update
 * - #202479: API - Update client city/location
 * - #202480: API - Reject invalid city ID
 * - #202481: API - Update EY admin assignment
 * - #202482: API - Assign multiple EY admins to client
 * - #202483: API - Reject invalid EY admin ID
 * - #202484: API - Reject update for non-existent client
 * - #202485: API - Handle special characters in client name
 */

const API_BASE = '/api/admin/api/clients';
const CITIES_API = '/api/admin/api/cities';
const EY_ADMINS_API = '/api/admin/api/ey-admins/paginated?page=0&size=10';

let testCounter = 0;
const getUniqueId = () => (++testCounter).toString(36);

const generateClientName = (): string => {
  return `${faker.company.name()} ${getUniqueId()}`;
};

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

test.describe('Story #198248: Edit Client Details - API Tests @api', () => {
  test.describe('PUT /clients - Edit Client Name', () => {
    test('@api @smoke @ADO-202476 should update client name successfully', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Update client name successfully');

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Get EY admin ID
      const eyAdminsResponse = await authenticatedApi.post(EY_ADMINS_API, { activeStatus: 'all' });
      const eyAdmins = await eyAdminsResponse.json();
      const eyAdminId = eyAdmins.content?.length > 0 ? eyAdmins.content[0].id : null;

      // Create client
      const clientData = generateClientData({
        cityId,
        assignedEyAdminId: eyAdminId ? [eyAdminId] : [],
      });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update client name
      const updatedName = `Updated_${generateClientName()}`;
      const updateData = {
        id: created.id,
        name: updatedName,
        cityId: created.cityId || cityId,
        assignedEyAdminId: created.assignedEyAdminId || [],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.name).toBe(updatedName);

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @regression @ADO-202477 should reject empty client name', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Reject empty client name');

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client
      const clientData = generateClientData({ cityId });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update with empty name
      const updateData = {
        id: created.id,
        name: '',
        cityId: created.cityId || cityId,
        assignedEyAdminId: created.assignedEyAdminId || [],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect([400, 422]).toContain(response.status());

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @regression @ADO-202478 should reject duplicate client name on update', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Reject duplicate client name');

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create first client
      const firstName = generateClientName();
      const firstClientData = generateClientData({ name: firstName, cityId });
      const firstResponse = await authenticatedApi.post(API_BASE, firstClientData);
      expect(firstResponse.status()).toBe(201);
      const firstClient = await firstResponse.json();

      // Create second client
      const secondClientData = generateClientData({ cityId });
      const secondResponse = await authenticatedApi.post(API_BASE, secondClientData);
      expect(secondResponse.status()).toBe(201);
      const secondClient = await secondResponse.json();

      // Try to update second client with first client's name
      const updateData = {
        id: secondClient.id,
        name: firstName,
        cityId: secondClient.cityId || cityId,
        assignedEyAdminId: secondClient.assignedEyAdminId || [],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect([400, 409, 422]).toContain(response.status());

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${firstClient.id}`);
      await authenticatedApi.delete(`${API_BASE}/${secondClient.id}`);
    });
  });

  test.describe('PUT /clients - Edit Client Location', () => {
    test('@api @smoke @ADO-202479 should update client city/location', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Update client location');

      // Get available cities
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();

      if (cities.length < 2) {
        test.skip();
        return;
      }

      // Create client with first city
      const clientData = generateClientData({ cityId: cities[0].id });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update to second city
      const updateData = {
        id: created.id,
        name: created.name,
        cityId: cities[1].id,
        assignedEyAdminId: created.assignedEyAdminId || [],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.cityId).toBe(cities[1].id);

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @regression @ADO-202480 should reject invalid city ID', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Reject invalid city ID');

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client
      const clientData = generateClientData({ cityId });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update with invalid city ID
      const updateData = {
        id: created.id,
        name: created.name,
        cityId: 999999999,
        assignedEyAdminId: created.assignedEyAdminId || [],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect([400, 404, 422]).toContain(response.status());

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });
  });

  test.describe('PUT /clients - Edit EY Admin Assignment', () => {
    test('@api @smoke @ADO-202481 should update EY admin assignment', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Update EY admin assignment');

      // Get available EY admins
      const eyAdminsResponse = await authenticatedApi.post(EY_ADMINS_API, { activeStatus: 'all' });
      const eyAdmins = await eyAdminsResponse.json();

      if (!eyAdmins.content || eyAdmins.content.length < 2) {
        test.skip();
        return;
      }

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client with first EY admin
      const clientData = generateClientData({
        cityId,
        assignedEyAdminId: [eyAdmins.content[0].id],
      });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update to second EY admin
      const updateData = {
        id: created.id,
        name: created.name,
        cityId: created.cityId || cityId,
        assignedEyAdminId: [eyAdmins.content[1].id],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect(response.status()).toBe(200);

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @smoke @ADO-202482 should assign multiple EY admins to client', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Assign multiple EY admins');

      // Get available EY admins
      const eyAdminsResponse = await authenticatedApi.post(EY_ADMINS_API, { activeStatus: 'all' });
      const eyAdmins = await eyAdminsResponse.json();

      if (!eyAdmins.content || eyAdmins.content.length < 2) {
        test.skip();
        return;
      }

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client with single EY admin
      const clientData = generateClientData({
        cityId,
        assignedEyAdminId: [eyAdmins.content[0].id],
      });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update to multiple EY admins
      const updateData = {
        id: created.id,
        name: created.name,
        cityId: created.cityId || cityId,
        assignedEyAdminId: [eyAdmins.content[0].id, eyAdmins.content[1].id],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect(response.status()).toBe(200);

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });

    test('@api @regression @ADO-202483 should reject invalid EY admin ID', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Reject invalid EY admin ID');

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client
      const clientData = generateClientData({ cityId });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update with invalid EY admin ID
      const updateData = {
        id: created.id,
        name: created.name,
        cityId: created.cityId || cityId,
        assignedEyAdminId: [999999999],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect([400, 404, 422]).toContain(response.status());

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });
  });

  test.describe('PUT /clients - Edit Validation', () => {
    test('@api @regression @ADO-202484 should reject update for non-existent client', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Reject non-existent client');

      const updateData = {
        id: 999999999,
        name: generateClientName(),
        cityId: 1,
        assignedEyAdminId: [],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect([404, 422]).toContain(response.status());
    });

    test('@api @regression @ADO-202485 should handle special characters in client name', async ({
      authenticatedApi,
    }) => {
      Log.info('Testing PUT /clients - Handle special characters');

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client
      const clientData = generateClientData({ cityId });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update with special characters
      const specialName = `Test & Co. (${getUniqueId()}) "Special"`;
      const updateData = {
        id: created.id,
        name: specialName,
        cityId: created.cityId || cityId,
        assignedEyAdminId: created.assignedEyAdminId || [],
        active: true,
      };

      const response = await authenticatedApi.put(API_BASE, updateData);
      expect([200, 400, 422]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.name).toBe(specialName);
      }

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });
  });

  test.describe('GET /clients/{id} - Verify Edit Results', () => {
    test('@api @smoke should verify client details after edit', async ({ authenticatedApi }) => {
      Log.info('Testing GET /clients/{id} - Verify after edit');

      // Get valid city ID
      const citiesResponse = await authenticatedApi.get(CITIES_API);
      const cities = await citiesResponse.json();
      const cityId = cities.length > 0 ? cities[0].id : 1;

      // Create client
      const clientData = generateClientData({ cityId });
      const createResponse = await authenticatedApi.post(API_BASE, clientData);
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      // Update client
      const updatedName = `Verified_${faker.company.name()}_${getUniqueId()}`;
      const updateData = {
        id: created.id,
        name: updatedName,
        cityId: created.cityId || cityId,
        assignedEyAdminId: created.assignedEyAdminId || [],
        active: true,
      };
      await authenticatedApi.put(API_BASE, updateData);

      // Verify by fetching
      const response = await authenticatedApi.get(`${API_BASE}/${created.id}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.name).toBe(updatedName);

      // Cleanup
      await authenticatedApi.delete(`${API_BASE}/${created.id}`);
    });
  });
});

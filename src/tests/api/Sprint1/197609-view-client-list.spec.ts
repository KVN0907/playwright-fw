import { test, expect } from '../../fixtures/apiRoleFixtures';

/**
 * Sprint 1 API Tests - View Client List: EY Super Admin
 *
 * ADO Story: #197609 - View client list: EY Super Admin (Backend)
 * Assigned To: Johirul Amin
 *
 * Test Cases:
 * - 202535: API – Get Clients – Valid Token (EY Super Admin)
 * - 202536: API – Get Clients – Invalid/Missing Token
 * - 202537: API – Get Clients – Unauthorized Role
 * - 202538: API – Get Clients – Empty Client List
 * - 202539: API – Get Clients – Default Pagination
 * - 202540: API – Get Clients – Custom Pagination
 * - 202541: API – Get Clients – Search Filter (by Name)
 * - 202542: API – Get Clients – Search Filter (No Match)
 * - 202543: API – Get Clients – Filter by Status (Active)
 * - 202544: API – Get Clients – Filter by Status (Inactive)
 * - 202545: API – Get Clients – Sort by Name
 * - 202546: API – Get Clients – Sort by Created Date
 * - 202547: API – Get Clients – Combined Filters (Search + Status + Sort)
 * - 202548: API – Get Clients – Large Dataset Performance
 */

const API_BASE = '/api/admin';
const CLIENTS_ENDPOINT = `${API_BASE}/clients`;

test.describe('Story #197609: View Client List - EY Super Admin', () => {
  /**
   * ADO Test Case #202535
   * API – Get Clients – Valid Token (EY Super Admin)
   */
  test('should return client list for EY Super Admin @regression @ADO-202535', async ({
    request,
  }) => {
    const response = await superAdminRequest.get(CLIENTS_ENDPOINT);

    expect(response.ok()).toBe(true);
    const data = await response.json();

    // Should return array or paginated response
    expect(data.content || data.data || Array.isArray(data)).toBeTruthy();
  });

  /**
   * ADO Test Case #202536
   * API – Get Clients – Invalid/Missing Token
   */
  test('should reject requests with invalid token @regression @ADO-202536', async ({
    superAdminRequest,
  }) => {
    const response = await superAdminRequest.get(CLIENTS_ENDPOINT, {
      headers: {
        Authorization: 'Bearer invalid_token_12345',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  /**
   * ADO Test Case #202537
   * API – Get Clients – Unauthorized Role
   */
  test('should reject unauthorized role access @regression @ADO-202537', async ({
    superAdminRequest,
  }) => {
    const response = await superAdminRequest.get(CLIENTS_ENDPOINT, {
      headers: {
        'X-User-Role': 'CLIENT_USER', // Not EY Super Admin
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  /**
   * ADO Test Case #202539
   * API – Get Clients – Default Pagination
   */
  test('should return paginated results by default @regression @ADO-202539', async ({
    request,
  }) => {
    const response = await superAdminRequest.get(CLIENTS_ENDPOINT);

    expect(response.ok()).toBe(true);
    const data = await response.json();

    // Paginated response should have pagination metadata
    if (data.content) {
      expect(data.totalElements || data.total).toBeDefined();
      expect(data.totalPages || data.pages).toBeDefined();
      expect(data.number !== undefined || data.page !== undefined).toBe(true);
      expect(data.size || data.pageSize).toBeDefined();
    }
  });

  /**
   * ADO Test Case #202540
   * API – Get Clients – Custom Pagination
   */
  test('should support custom pagination parameters @regression @ADO-202540', async ({
    request,
  }) => {
    const page = 0;
    const size = 5;

    const response = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?page=${page}&size=${size}`);

    expect(response.ok()).toBe(true);
    const data = await response.json();

    const clients = data.content || data.data || data;
    if (Array.isArray(clients)) {
      expect(clients.length).toBeLessThanOrEqual(size);
    }
  });

  /**
   * ADO Test Case #202541
   * API – Get Clients – Search Filter (by Name)
   */
  test('should filter clients by search term @regression @ADO-202541', async ({
    superAdminRequest,
  }) => {
    const searchTerm = 'Test';

    const response = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?searchTerm=${searchTerm}`);

    expect(response.ok()).toBe(true);
    const data = await response.json();

    const clients = data.content || data.data || data;
    if (Array.isArray(clients) && clients.length > 0) {
      clients.forEach((client: any) => {
        const matchesSearch =
          client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
        expect(matchesSearch).toBe(true);
      });
    }
  });

  /**
   * ADO Test Case #202542
   * API – Get Clients – Search Filter (No Match)
   */
  test('should return empty results for non-matching search @regression @ADO-202542', async ({
    request,
  }) => {
    const searchTerm = 'ZZZZNONEXISTENT12345';

    const response = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?searchTerm=${searchTerm}`);

    expect(response.ok()).toBe(true);
    const data = await response.json();

    const clients = data.content || data.data || data;
    expect(Array.isArray(clients) && clients.length === 0).toBe(true);
  });

  /**
   * ADO Test Case #202543
   * API – Get Clients – Filter by Status (Active)
   */
  test('should filter active clients only @regression @ADO-202543', async ({
    superAdminRequest,
  }) => {
    const response = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?status=ACTIVE`);

    expect(response.ok()).toBe(true);
    const data = await response.json();

    const clients = data.content || data.data || data;
    if (Array.isArray(clients) && clients.length > 0) {
      clients.forEach((client: any) => {
        expect(client.isActive === true || client.status === 'ACTIVE').toBe(true);
      });
    }
  });

  /**
   * ADO Test Case #202544
   * API – Get Clients – Filter by Status (Inactive)
   */
  test('should filter inactive clients only @regression @ADO-202544', async ({
    superAdminRequest,
  }) => {
    const response = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?status=INACTIVE`);

    expect(response.ok()).toBe(true);
    const data = await response.json();

    const clients = data.content || data.data || data;
    if (Array.isArray(clients) && clients.length > 0) {
      clients.forEach((client: any) => {
        expect(client.isActive === false || client.status === 'INACTIVE').toBe(true);
      });
    }
  });

  /**
   * ADO Test Case #202545
   * API – Get Clients – Sort by Name
   */
  test('should sort clients by name @regression @ADO-202545', async ({ superAdminRequest }) => {
    // Ascending
    const ascResponse = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?sort=name,asc`);
    expect(ascResponse.ok()).toBe(true);

    const ascData = await ascResponse.json();
    const ascClients = ascData.content || ascData.data || ascData;

    if (Array.isArray(ascClients) && ascClients.length > 1) {
      for (let i = 1; i < ascClients.length; i++) {
        const prevName = (
          ascClients[i - 1].name ||
          ascClients[i - 1].clientName ||
          ''
        ).toLowerCase();
        const currName = (ascClients[i].name || ascClients[i].clientName || '').toLowerCase();
        expect(prevName.localeCompare(currName)).toBeLessThanOrEqual(0);
      }
    }

    // Descending
    const descResponse = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?sort=name,desc`);
    expect(descResponse.ok()).toBe(true);
  });

  /**
   * ADO Test Case #202546
   * API – Get Clients – Sort by Created Date
   */
  test('should sort clients by created date @regression @ADO-202546', async ({
    superAdminRequest,
  }) => {
    const response = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?sort=createdAt,desc`);

    expect(response.ok()).toBe(true);
    const data = await response.json();

    const clients = data.content || data.data || data;
    if (Array.isArray(clients) && clients.length > 1) {
      for (let i = 1; i < clients.length; i++) {
        const prevDate = new Date(clients[i - 1].createdAt || clients[i - 1].createdDate);
        const currDate = new Date(clients[i].createdAt || clients[i].createdDate);

        if (prevDate && currDate && !isNaN(prevDate.getTime()) && !isNaN(currDate.getTime())) {
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      }
    }
  });

  /**
   * ADO Test Case #202547
   * API – Get Clients – Combined Filters (Search + Status + Sort)
   */
  test('should support combined filters @regression @ADO-202547', async ({ superAdminRequest }) => {
    const response = await superAdminRequest.get(
      `${CLIENTS_ENDPOINT}?searchTerm=Test&status=ACTIVE&sort=name,asc&page=0&size=10`
    );

    expect(response.ok()).toBe(true);
    const data = await response.json();

    // Should return valid paginated response
    expect(data.content || data.data || Array.isArray(data)).toBeTruthy();
  });

  /**
   * ADO Test Case #202548
   * API – Get Clients – Large Dataset Performance
   */
  test('should handle large dataset requests within acceptable time @regression @ADO-202548', async ({
    request,
  }) => {
    const startTime = Date.now();

    const response = await superAdminRequest.get(`${CLIENTS_ENDPOINT}?size=100`);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.ok()).toBe(true);
    // Response should be within 5 seconds
    expect(responseTime).toBeLessThan(5000);
  });

  /**
   * ADO Test Case #202538
   * API – Get Clients – Empty Client List
   */
  test('should handle empty client list gracefully @regression @ADO-202538', async ({
    request,
  }) => {
    // Use a filter that likely returns no results
    const response = await superAdminRequest.get(
      `${CLIENTS_ENDPOINT}?searchTerm=DEFINITELY_NO_CLIENT_12345`
    );

    expect(response.ok()).toBe(true);
    const data = await response.json();

    const clients = data.content || data.data || data;
    expect(Array.isArray(clients)).toBe(true);
    expect(clients.length).toBe(0);
  });
});

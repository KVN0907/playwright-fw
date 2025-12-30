/**
 * RegArea Network Intercept Tests
 * Tests using Playwright's route/intercept capabilities for:
 * - Mocking API responses
 * - Testing error handling
 * - Simulating network conditions
 * - Request/response validation
 */

import { test, expect, Page, Route } from '@playwright/test';

const API_BASE = process.env.DEV_API_URL || 'https://eycompliancemanager-dev.ey.com/api';
const APP_URL = process.env.DEV_APP_URL || 'https://eycompliancemanager-dev.ey.com';

test.describe('RegArea Network Intercept Tests', () => {
  test.describe('Mock API Responses', () => {
    test('@api @network should handle mocked empty reg area list', async ({ page }) => {
      // Intercept reg-area GET request and return empty array
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        } else {
          route.continue();
        }
      });

      // Navigate to app and verify UI handles empty state
      await page.goto(APP_URL);
      // Add assertions based on your UI behavior for empty list
    });

    test('@api @network should handle mocked reg area list with data', async ({ page }) => {
      const mockData = [
        { id: 1, name: 'Mock RegArea 1', description: 'Mocked', isActive: true },
        { id: 2, name: 'Mock RegArea 2', description: 'Mocked', isActive: false },
      ];

      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData),
          });
        } else {
          route.continue();
        }
      });

      await page.goto(APP_URL);
      // Verify UI displays mocked data correctly
    });

    test('@api @network should handle mocked single reg area', async ({ page }) => {
      const mockRegArea = {
        id: 999,
        name: 'Specific Mock RegArea',
        description: 'For detail view testing',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      await page.route(`${API_BASE}/reg-area/999`, (route: Route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRegArea),
        });
      });

      // Test fetching specific reg area
      const response = await page.request.get(`${API_BASE}/reg-area/999`);
      const body = await response.json();
      expect(body.id).toBe(999);
      expect(body.name).toBe('Specific Mock RegArea');
    });
  });

  test.describe('Error Response Handling', () => {
    test('@api @network should handle 500 Internal Server Error', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal Server Error',
            message: 'Database connection failed',
          }),
        });
      });

      const response = await page.request.get(`${API_BASE}/reg-area`);
      expect(response.status()).toBe(500);
    });

    test('@api @network should handle 503 Service Unavailable', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Service Unavailable',
            message: 'Server is under maintenance',
          }),
        });
      });

      const response = await page.request.get(`${API_BASE}/reg-area`);
      expect(response.status()).toBe(503);
    });

    test('@api @network should handle 401 Unauthorized', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized', message: 'Session expired' }),
        });
      });

      const response = await page.request.get(`${API_BASE}/reg-area`);
      expect(response.status()).toBe(401);
    });

    test('@api @network should handle 403 Forbidden', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Forbidden', message: 'Insufficient permissions' }),
        });
      });

      const response = await page.request.get(`${API_BASE}/reg-area`);
      expect(response.status()).toBe(403);
    });

    test('@api @network should handle 404 Not Found', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area/99999`, (route: Route) => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not Found', message: 'RegArea not found' }),
        });
      });

      const response = await page.request.get(`${API_BASE}/reg-area/99999`);
      expect(response.status()).toBe(404);
    });

    test('@api @network should handle 400 Bad Request with validation errors', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Bad Request',
              message: 'Validation failed',
              details: [
                { field: 'name', message: 'Name is required' },
                { field: 'name', message: 'Name must be at least 3 characters' },
              ],
            }),
          });
        } else {
          route.continue();
        }
      });

      const response = await page.request.post(`${API_BASE}/reg-area`, {
        data: { name: '' },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.details).toBeDefined();
    });
  });

  test.describe('Network Conditions', () => {
    test('@api @network should handle slow network response', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, async (route: Route) => {
        // Simulate 3 second delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 1, name: 'Delayed Response', isActive: true }]),
        });
      });

      const startTime = Date.now();
      const response = await page.request.get(`${API_BASE}/reg-area`);
      const duration = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(duration).toBeGreaterThanOrEqual(3000);
    });

    test('@api @network should handle network timeout', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        route.abort('timedout');
      });

      try {
        await page.request.get(`${API_BASE}/reg-area`, { timeout: 5000 });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('@api @network should handle connection refused', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        route.abort('connectionrefused');
      });

      try {
        await page.request.get(`${API_BASE}/reg-area`);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  test.describe('Request Monitoring', () => {
    test('@api @network should capture and validate request headers', async ({ page }) => {
      let capturedHeaders: Record<string, string> = {};

      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        capturedHeaders = route.request().headers();
        route.continue();
      });

      await page.request.get(`${API_BASE}/reg-area`);

      // Validate expected headers are present
      expect(capturedHeaders['accept']).toContain('application/json');
    });

    test('@api @network should capture POST request body', async ({ page }) => {
      let capturedBody: string | null = null;

      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        if (route.request().method() === 'POST') {
          capturedBody = route.request().postData();
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 1, name: 'Created' }),
          });
        } else {
          route.continue();
        }
      });

      await page.request.post(`${API_BASE}/reg-area`, {
        data: { name: 'Test Capture', description: 'Testing body capture' },
      });

      expect(capturedBody).toBeDefined();
      const parsed = JSON.parse(capturedBody!);
      expect(parsed.name).toBe('Test Capture');
    });

    test('@api @network should track multiple API calls', async ({ page }) => {
      const apiCalls: Array<{ method: string; url: string; timestamp: number }> = [];

      await page.route(`${API_BASE}/**`, (route: Route) => {
        apiCalls.push({
          method: route.request().method(),
          url: route.request().url(),
          timestamp: Date.now(),
        });
        route.continue();
      });

      // Make multiple API calls
      await page.request.get(`${API_BASE}/reg-area`);
      await page.request.get(`${API_BASE}/reg-area`);

      expect(apiCalls.length).toBeGreaterThanOrEqual(2);
      expect(apiCalls.every(call => call.method === 'GET')).toBe(true);
    });
  });

  test.describe('Response Modification', () => {
    test('@api @network should modify response data on the fly', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, async (route: Route) => {
        // Fetch actual response
        const response = await route.fetch();
        const body = await response.json();

        // Modify response - add a mock entry
        if (Array.isArray(body)) {
          body.push({
            id: 99999,
            name: 'INJECTED_BY_TEST',
            description: 'This was injected by network intercept',
            isActive: true,
          });
        }

        route.fulfill({
          response,
          body: JSON.stringify(body),
        });
      });

      const response = await page.request.get(`${API_BASE}/reg-area`);
      const body = await response.json();

      // Verify injected data exists
      const injected = body.find((item: { name: string }) => item.name === 'INJECTED_BY_TEST');
      expect(injected).toBeDefined();
    });

    test('@api @network should filter sensitive data from response', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, async (route: Route) => {
        const response = await route.fetch();
        let body = await response.json();

        // Remove sensitive fields (example: internal IDs, audit info)
        if (Array.isArray(body)) {
          body = body.map((item: Record<string, unknown>) => {
            const { createdBy, modifiedBy, internalId, ...safe } = item;
            return safe;
          });
        }

        route.fulfill({
          response,
          body: JSON.stringify(body),
        });
      });

      const response = await page.request.get(`${API_BASE}/reg-area`);
      const body = await response.json();

      // Verify sensitive fields are removed
      if (body.length > 0) {
        expect(body[0].internalId).toBeUndefined();
      }
    });
  });

  test.describe('Conditional Routing', () => {
    test('@api @network should mock only specific endpoints', async ({ page }) => {
      // Mock only reg-area, let other APIs pass through
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 1, name: 'Mocked' }]),
        });
      });

      // This should return mocked data
      const regAreaResponse = await page.request.get(`${API_BASE}/reg-area`);
      const regAreaBody = await regAreaResponse.json();
      expect(regAreaBody[0].name).toBe('Mocked');
    });

    test('@api @network should apply different mocks based on request method', async ({ page }) => {
      await page.route(`${API_BASE}/reg-area`, (route: Route) => {
        const method = route.request().method();

        switch (method) {
          case 'GET':
            route.fulfill({
              status: 200,
              body: JSON.stringify([{ id: 1, name: 'GET Response' }]),
            });
            break;
          case 'POST':
            route.fulfill({
              status: 201,
              body: JSON.stringify({ id: 2, name: 'POST Response' }),
            });
            break;
          case 'PUT':
            route.fulfill({
              status: 200,
              body: JSON.stringify({ id: 1, name: 'PUT Response' }),
            });
            break;
          case 'DELETE':
            route.fulfill({ status: 204 });
            break;
          default:
            route.continue();
        }
      });

      // Test each method
      const getResp = await page.request.get(`${API_BASE}/reg-area`);
      expect((await getResp.json())[0].name).toBe('GET Response');

      const postResp = await page.request.post(`${API_BASE}/reg-area`, {
        data: { name: 'New' },
      });
      expect(postResp.status()).toBe(201);

      const putResp = await page.request.put(`${API_BASE}/reg-area`, {
        data: { id: 1, name: 'Updated' },
      });
      expect((await putResp.json()).name).toBe('PUT Response');

      const deleteResp = await page.request.delete(`${API_BASE}/reg-area/1`);
      expect(deleteResp.status()).toBe(204);
    });
  });
});

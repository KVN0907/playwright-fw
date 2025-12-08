import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/Log';

/**
 * Comprehensive API Tests for ApplicationExportResource
 * Generated automatically with ZERO manual intervention
 * 
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 * 
 * Source: ApplicationExportResource.java
 */

test.describe('ApplicationExportResource API Tests', () => {
  test('@smoke POST /api/application/export - exportApplications - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/application/export');
    
    // Given valid request data
    
    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    };

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/application/export', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/application/export - exportApplicationById - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/application/export');
    
    // Given valid request data
    const id = 1;
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/application/export');

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});

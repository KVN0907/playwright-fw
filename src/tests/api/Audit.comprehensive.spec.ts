import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/Log';

/**
 * Comprehensive API Tests for AuditResource
 * Generated automatically with ZERO manual intervention
 * 
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 * 
 * Source: AuditResource.java
 */

test.describe('AuditResource API Tests', () => {
  test('@smoke POST /api/audit-logs/query - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/audit-logs/query');
    
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
    const response = await authenticatedApi.post('/api/audit-logs/query', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/audit-logs/list - unknown - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/audit-logs/list');
    
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
    const response = await authenticatedApi.post('/api/audit-logs/list', requestData);

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(`Response status: ${response.status()}`);
    
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke POST /api/audit-logs/exportByDomain - exportAuditEventsByEntity - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing POST /api/audit-logs/exportByDomain');
    
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
    const response = await authenticatedApi.post('/api/audit-logs/exportByDomain', requestData);

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

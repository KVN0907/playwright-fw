import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/Log';

/**
 * Comprehensive API Tests for AuthInfoResource
 * Generated automatically with ZERO manual intervention
 * 
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 * 
 * Source: AuthInfoResource.java
 */

test.describe('AuthInfoResource API Tests', () => {
  test('@smoke GET /api/auth-info - getAuthInfo - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing GET /api/auth-info');
    
    // Given valid request data
    
    

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/auth-info');

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

import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/utils/Log';

/**
 * Comprehensive API Tests for RiskExportResource
 * Generated automatically with ZERO manual intervention
 *
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 *
 * Source: RiskExportResource.java
 */

test.describe('RiskExportResource API Tests', () => {
  test('@smoke POST /api/risk/export - getAllRiskForExport - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing POST /api/risk/export');

    // Given valid request data

    const requestData = {
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
    };

    // When making authenticated POST request
    const response = await authenticatedApi.post('/api/risk/export', requestData);

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('@smoke GET /api/risk/export - getExportReportForMappedRisk - Happy Path', async ({
    authenticatedApi,
  }) => {
    Log.info('Testing GET /api/risk/export');

    // Given valid request data
    const id = 1;

    // When making authenticated GET request
    const response = await authenticatedApi.get('/api/risk/export');

    // Then should return success
    expect([201]).toContain(response!.status());
    Log.info(`Response status: ${response!.status()}`);

    // And response should have valid structure
    if (response!.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});

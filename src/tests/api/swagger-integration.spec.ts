import { test, expect } from '../fixtures/advancedFixtures';
import { SwaggerHelper } from '../../lib/SwaggerHelper';
import Log from '../../lib/Log';

/**
 * Swagger/OpenAPI Integration Tests
 * Tests for fetching and using OpenAPI documentation
 */
test.describe('Swagger/OpenAPI Documentation Integration', () => {
  let swaggerHelper: SwaggerHelper;

  test.beforeAll(() => {
    Log.info('=== Swagger Integration Test Suite ===');
  });

  test.beforeEach(({ request }) => {
    swaggerHelper = new SwaggerHelper(request);
  });

  test('@smoke @critical Fetch OpenAPI spec for Security service', async () => {
    Log.info('=== Fetching Security Service OpenAPI Spec ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');

    // Verify spec was fetched
    expect(spec).not.toBeNull();
    expect(spec?.openapi).toBeDefined();
    expect(spec?.info).toBeDefined();
    expect(spec?.paths).toBeDefined();

    Log.info('✅ OpenAPI spec fetched successfully');
    Log.info(`   OpenAPI Version: ${spec?.openapi}`);
    Log.info(`   API Title: ${spec?.info?.title}`);
    Log.info(`   API Version: ${spec?.info?.version}`);
  });

  test('@smoke Fetch OpenAPI spec for ComplianceManager service', async () => {
    Log.info('=== Fetching ComplianceManager Service OpenAPI Spec ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('compliancemanager');

    // Verify spec was fetched
    expect(spec).not.toBeNull();
    expect(spec?.openapi).toBeDefined();

    if (spec) {
      Log.info('✅ ComplianceManager OpenAPI spec fetched successfully');
      Log.info(`   API Title: ${spec.info?.title}`);
    }
  });

  test('@regression List all endpoints from OpenAPI spec', async () => {
    Log.info('=== Listing All API Endpoints ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');
    expect(spec).not.toBeNull();

    if (spec) {
      const endpoints = swaggerHelper.getAllEndpoints(spec);

      expect(endpoints.length).toBeGreaterThan(0);

      Log.info(`✅ Found ${endpoints.length} endpoints`);

      // Print summary
      swaggerHelper.printEndpointsSummary(spec);

      // Verify endpoint structure
      const firstEndpoint = endpoints[0];
      expect(firstEndpoint).toHaveProperty('path');
      expect(firstEndpoint).toHaveProperty('method');

      Log.info(`   Sample endpoint: ${firstEndpoint.method} ${firstEndpoint.path}`);
    }
  });

  test('@regression Find endpoints by tag', async () => {
    Log.info('=== Finding Endpoints by Tag ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');
    expect(spec).not.toBeNull();

    if (spec) {
      // Try to find Client endpoints
      const clientEndpoints = swaggerHelper.getEndpointsByTag(spec, 'Client');

      Log.info(`✅ Found ${clientEndpoints.length} endpoints with 'Client' tag`);

      clientEndpoints.slice(0, 5).forEach(endpoint => {
        Log.info(`   ${endpoint.method} ${endpoint.path} - ${endpoint.summary || 'No summary'}`);
      });
    }
  });

  test('@regression Find endpoint by operation ID', async () => {
    Log.info('=== Finding Endpoint by Operation ID ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');
    expect(spec).not.toBeNull();

    if (spec) {
      const allEndpoints = swaggerHelper.getAllEndpoints(spec);

      // Get first endpoint with an operation ID
      const endpointWithOpId = allEndpoints.find(e => e.operationId);

      if (endpointWithOpId) {
        const foundEndpoint = swaggerHelper.getEndpointByOperationId(
          spec,
          endpointWithOpId.operationId!
        );

        expect(foundEndpoint).not.toBeNull();
        expect(foundEndpoint?.operationId).toBe(endpointWithOpId.operationId);

        Log.info(`✅ Found endpoint by operation ID: ${endpointWithOpId.operationId}`);
        Log.info(`   ${foundEndpoint?.method} ${foundEndpoint?.path}`);
      }
    }
  });

  test('@regression Find endpoints by path pattern', async () => {
    Log.info('=== Finding Endpoints by Path Pattern ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');
    expect(spec).not.toBeNull();

    if (spec) {
      // Find all client-related endpoints
      const clientEndpoints = swaggerHelper.getEndpointsByPath(spec, '/clients');

      Log.info(`✅ Found ${clientEndpoints.length} endpoints matching '/clients'`);

      clientEndpoints.forEach(endpoint => {
        Log.info(`   ${endpoint.method} ${endpoint.path}`);
      });
    }
  });

  test('@regression Get endpoint documentation', async () => {
    Log.info('=== Getting Endpoint Documentation ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');
    expect(spec).not.toBeNull();

    if (spec) {
      const endpoints = swaggerHelper.getAllEndpoints(spec);
      const endpoint = endpoints[0];

      const documentation = swaggerHelper.getEndpointDocumentation(endpoint);

      expect(documentation).toBeDefined();
      expect(documentation).toContain(endpoint.path);
      expect(documentation).toContain(endpoint.method);

      Log.info('✅ Endpoint documentation generated:');
      Log.info(documentation);
    }
  });

  test('@regression Get security schemes from spec', async () => {
    Log.info('=== Getting Security Schemes ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');
    expect(spec).not.toBeNull();

    if (spec) {
      const securitySchemes = swaggerHelper.getSecuritySchemes(spec);

      expect(securitySchemes).toBeDefined();

      const schemeNames = Object.keys(securitySchemes);
      Log.info(`✅ Found ${schemeNames.length} security schemes:`);
      schemeNames.forEach(name => {
        Log.info(`   - ${name}`);
      });

      // Verify bearer auth is configured
      expect(schemeNames).toContain('bearerAuth');
      Log.info('   ✅ Bearer authentication scheme configured');
    }
  });

  test('@regression Get servers from spec', async () => {
    Log.info('=== Getting Server Information ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');
    expect(spec).not.toBeNull();

    if (spec) {
      const servers = swaggerHelper.getServers(spec);

      expect(servers).toBeDefined();
      expect(servers.length).toBeGreaterThan(0);

      Log.info(`✅ Found ${servers.length} server(s):`);
      servers.forEach(server => {
        Log.info(`   - ${server.url}`);
        if (server.description) {
          Log.info(`     ${server.description}`);
        }
      });
    }
  });

  test('@utility Export endpoints to JSON', async () => {
    Log.info('=== Exporting Endpoints to JSON ===');

    const spec = await swaggerHelper.fetchOpenAPISpec('admin');
    expect(spec).not.toBeNull();

    if (spec) {
      const jsonExport = swaggerHelper.exportEndpointsToJSON(spec, 'admin');

      expect(jsonExport).toBeDefined();

      const parsedExport = JSON.parse(jsonExport);
      expect(parsedExport).toHaveProperty('service');
      expect(parsedExport).toHaveProperty('endpoints');
      expect(parsedExport.service).toBe('admin');

      Log.info('✅ Endpoints exported to JSON successfully');
      Log.info(`   Total endpoints: ${parsedExport.totalEndpoints}`);
      Log.info(`   Service: ${parsedExport.service}`);

      // Optionally save to file (commented out to avoid file system operations in tests)
      // const fs = require('fs');
      // fs.writeFileSync('./test-results/api-endpoints.json', jsonExport);
    }
  });

  test('@integration Verify Swagger spec caching works', async () => {
    Log.info('=== Testing OpenAPI Spec Caching ===');

    // First fetch
    const startTime1 = Date.now();
    const spec1 = await swaggerHelper.fetchOpenAPISpec('admin', false);
    const duration1 = Date.now() - startTime1;

    expect(spec1).not.toBeNull();
    Log.info(`✅ First fetch completed in ${duration1}ms`);

    // Second fetch (should use cache)
    const startTime2 = Date.now();
    const spec2 = await swaggerHelper.fetchOpenAPISpec('admin', false);
    const duration2 = Date.now() - startTime2;

    expect(spec2).not.toBeNull();
    Log.info(`✅ Second fetch (cached) completed in ${duration2}ms`);

    // Cached fetch should be faster
    expect(duration2).toBeLessThan(duration1);
    Log.info('   ✅ Cache is working - second fetch was faster');

    // Clear cache
    swaggerHelper.clearCache();
    Log.info('   ✅ Cache cleared');

    // Third fetch (should fetch fresh)
    const startTime3 = Date.now();
    const spec3 = await swaggerHelper.fetchOpenAPISpec('admin', false);
    const duration3 = Date.now() - startTime3;

    expect(spec3).not.toBeNull();
    Log.info(`✅ Third fetch (after cache clear) completed in ${duration3}ms`);
  });
});

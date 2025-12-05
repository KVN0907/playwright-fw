/**
 * Swagger/OpenAPI Helper
 * Fetches and parses OpenAPI documentation for API testing automation
 */

import { APIRequestContext } from '@playwright/test';
import Log from './Log';
import { ConfigManager } from './config/ConfigManager';

export interface OpenAPIEndpoint {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses?: Record<string, OpenAPIResponse>;
  security?: Record<string, string[]>[];
}

export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required?: boolean;
  schema?: Record<string, unknown>;
  description?: string;
  example?: unknown;
}

export interface OpenAPIRequestBody {
  required?: boolean;
  content?: Record<string, { schema?: Record<string, unknown> }>;
}

export interface OpenAPIResponse {
  description?: string;
  content?: Record<string, { schema?: Record<string, unknown> }>;
}

export interface OpenAPISpec {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths?: Record<string, Record<string, unknown>>;
  components?: {
    securitySchemes?: Record<string, unknown>;
    schemas?: Record<string, unknown>;
  };
}

export class SwaggerHelper {
  private apiContext: APIRequestContext;
  private baseURL: string;
  private cachedSpecs: Map<string, OpenAPISpec> = new Map();

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
    this.baseURL = ConfigManager.getInstance().getApiURL();
  }

  /**
   * Fetch OpenAPI specification from the service
   * @param service Service name (e.g., 'admin', 'compliancemanager')
   * @param skipCache Skip cache and fetch fresh spec
   */
  async fetchOpenAPISpec(
    service: string = 'admin',
    skipCache: boolean = false
  ): Promise<OpenAPISpec | null> {
    const cacheKey = service;

    if (!skipCache && this.cachedSpecs.has(cacheKey)) {
      Log.info(`Using cached OpenAPI spec for ${service}`);
      return this.cachedSpecs.get(cacheKey) || null;
    }

    try {
      const apiDocsUrl = `${this.baseURL}/${service}/v3/api-docs`;
      Log.info(`Fetching OpenAPI spec from: ${apiDocsUrl}`);

      const response = await this.apiContext.get(apiDocsUrl, {
        ignoreHTTPSErrors: true,
        timeout: 10000,
      });

      if (!response.ok()) {
        Log.error(`Failed to fetch OpenAPI spec: ${response.status()} ${response.statusText()}`);
        return null;
      }

      const spec = (await response.json()) as OpenAPISpec;
      this.cachedSpecs.set(cacheKey, spec);

      Log.info(`✅ OpenAPI spec fetched successfully for ${service}`);
      Log.info(`   Title: ${spec.info?.title || 'N/A'}`);
      Log.info(`   Version: ${spec.info?.version || 'N/A'}`);
      Log.info(`   Endpoints: ${Object.keys(spec.paths || {}).length}`);

      return spec;
    } catch (error) {
      Log.error(`Error fetching OpenAPI spec: ${error}`);
      return null;
    }
  }

  /**
   * Get all endpoints from OpenAPI spec
   */
  getAllEndpoints(spec: OpenAPISpec): OpenAPIEndpoint[] {
    const endpoints: OpenAPIEndpoint[] = [];

    if (!spec.paths) {
      return endpoints;
    }

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      const pathObj = pathItem as Record<string, unknown>;

      for (const [method, operation] of Object.entries(pathObj)) {
        // Skip non-HTTP methods
        if (
          !['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(
            method.toLowerCase()
          )
        ) {
          continue;
        }

        const op = operation as Record<string, unknown>;

        endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: op.operationId as string,
          summary: op.summary as string,
          description: op.description as string,
          tags: op.tags as string[],
          parameters: op.parameters as OpenAPIParameter[],
          requestBody: op.requestBody as OpenAPIRequestBody,
          responses: op.responses as Record<string, OpenAPIResponse>,
          security: op.security as Record<string, string[]>[],
        });
      }
    }

    return endpoints;
  }

  /**
   * Find endpoints by tag
   */
  getEndpointsByTag(spec: OpenAPISpec, tag: string): OpenAPIEndpoint[] {
    const allEndpoints = this.getAllEndpoints(spec);
    return allEndpoints.filter(endpoint =>
      endpoint.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  /**
   * Find endpoint by operation ID
   */
  getEndpointByOperationId(spec: OpenAPISpec, operationId: string): OpenAPIEndpoint | null {
    const allEndpoints = this.getAllEndpoints(spec);
    return allEndpoints.find(endpoint => endpoint.operationId === operationId) || null;
  }

  /**
   * Find endpoints by path pattern
   */
  getEndpointsByPath(spec: OpenAPISpec, pathPattern: string): OpenAPIEndpoint[] {
    const allEndpoints = this.getAllEndpoints(spec);
    return allEndpoints.filter(endpoint => endpoint.path.includes(pathPattern));
  }

  /**
   * Get endpoint documentation as formatted string
   */
  getEndpointDocumentation(endpoint: OpenAPIEndpoint): string {
    let doc = `\n=== ${endpoint.method} ${endpoint.path} ===\n`;

    if (endpoint.operationId) {
      doc += `Operation ID: ${endpoint.operationId}\n`;
    }

    if (endpoint.summary) {
      doc += `Summary: ${endpoint.summary}\n`;
    }

    if (endpoint.description) {
      doc += `Description: ${endpoint.description}\n`;
    }

    if (endpoint.tags && endpoint.tags.length > 0) {
      doc += `Tags: ${endpoint.tags.join(', ')}\n`;
    }

    if (endpoint.parameters && endpoint.parameters.length > 0) {
      doc += '\nParameters:\n';
      endpoint.parameters.forEach(param => {
        const required = param.required ? ' (required)' : '';
        doc += `  - ${param.name} (${param.in})${required}: ${param.description || 'No description'}\n`;
        if (param.example) {
          doc += `    Example: ${JSON.stringify(param.example)}\n`;
        }
      });
    }

    if (endpoint.requestBody) {
      doc += '\nRequest Body: ';
      doc += endpoint.requestBody.required ? 'Required\n' : 'Optional\n';
    }

    if (endpoint.responses) {
      doc += '\nResponses:\n';
      for (const [status, response] of Object.entries(endpoint.responses)) {
        doc += `  ${status}: ${response.description || 'No description'}\n`;
      }
    }

    return doc;
  }

  /**
   * Print all endpoints summary
   */
  printEndpointsSummary(spec: OpenAPISpec): void {
    const endpoints = this.getAllEndpoints(spec);

    Log.info(`\n========== API Endpoints Summary (Total: ${endpoints.length}) ==========`);

    // Group by tags
    const groupedByTag = new Map<string, OpenAPIEndpoint[]>();

    endpoints.forEach(endpoint => {
      const tag = endpoint.tags?.[0] || 'Untagged';
      if (!groupedByTag.has(tag)) {
        groupedByTag.set(tag, []);
      }
      groupedByTag.get(tag)?.push(endpoint);
    });

    // Print grouped endpoints
    for (const [tag, tagEndpoints] of groupedByTag) {
      Log.info(`\n[${tag}] (${tagEndpoints.length} endpoints)`);
      tagEndpoints.forEach(endpoint => {
        const summary = endpoint.summary || endpoint.operationId || 'No summary';
        Log.info(`  ${endpoint.method.padEnd(7)} ${endpoint.path} - ${summary}`);
      });
    }

    Log.info('\n' + '='.repeat(80) + '\n');
  }

  /**
   * Get security schemes from spec
   */
  getSecuritySchemes(spec: OpenAPISpec): Record<string, unknown> {
    return spec.components?.securitySchemes || {};
  }

  /**
   * Get servers from spec
   */
  getServers(spec: OpenAPISpec): Array<{ url: string; description?: string }> {
    return spec.servers || [];
  }

  /**
   * Export endpoints to JSON file (useful for test generation)
   */
  exportEndpointsToJSON(spec: OpenAPISpec, service: string): string {
    const endpoints = this.getAllEndpoints(spec);

    const exportData = {
      service,
      timestamp: new Date().toISOString(),
      info: spec.info,
      servers: spec.servers,
      totalEndpoints: endpoints.length,
      endpoints: endpoints.map(e => ({
        path: e.path,
        method: e.method,
        operationId: e.operationId,
        summary: e.summary,
        tags: e.tags,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clear cached specs
   */
  clearCache(): void {
    this.cachedSpecs.clear();
    Log.info('OpenAPI spec cache cleared');
  }
}

/**
 * Create a singleton instance helper
 */
export class SwaggerHelperFactory {
  private static instance: SwaggerHelper | null = null;

  static getInstance(apiContext: APIRequestContext): SwaggerHelper {
    if (!SwaggerHelperFactory.instance) {
      SwaggerHelperFactory.instance = new SwaggerHelper(apiContext);
    }
    return SwaggerHelperFactory.instance;
  }

  static resetInstance(): void {
    SwaggerHelperFactory.instance = null;
  }
}

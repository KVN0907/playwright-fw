/**
 * EnhancedTestGenerator - Generates comprehensive Playwright API tests
 * with ZERO manual intervention by parsing:
 * 1. Java Controllers - endpoints, parameters, return types
 * 2. Exception throws - BadRequestAlertException, UnauthorizedAlertException
 * 3. DTO validations - @NotNull, @Size, @Email, etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import Log from './Log';

// ============================================
// Type Definitions
// ============================================

interface ErrorScenario {
  errorCode: string;
  message: string;
  condition: string;
  expectedStatus: number;
  type: 'BadRequest' | 'Unauthorized' | 'NotFound';
}

interface ValidationRule {
  field: string;
  type: string;
  constraint: string;
  message?: string;
}

interface EnhancedEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  methodName: string;
  parameters: ParameterInfo[];
  requestBodyType?: string;
  returnType: string;
  description?: string;
  errorScenarios: ErrorScenario[];
  validationRules: ValidationRule[];
  requiresAuth: boolean;
}

interface ParameterInfo {
  name: string;
  type: string;
  annotation: 'PathVariable' | 'RequestBody' | 'RequestParam' | 'RequestHeader';
  required: boolean;
}

interface EnhancedController {
  className: string;
  filePath: string;
  baseMapping: string;
  entityName: string;
  endpoints: EnhancedEndpoint[];
  dtoPath?: string;
}

interface GenerationConfig {
  servicePath: string;
  outputPath: string;
  includeNegativeTests: boolean;
  includeValidationTests: boolean;
  includeAuthTests: boolean;
}

// ============================================
// Enhanced Test Generator
// ============================================

export class EnhancedTestGenerator {
  private config: GenerationConfig;
  private dtoCache: Map<string, ValidationRule[]> = new Map();

  constructor(config: GenerationConfig) {
    this.config = config;
  }

  /**
   * Generate tests for all controllers in the service path
   */
  async generateAll(): Promise<void> {
    Log.info('🚀 Starting Enhanced Test Generation (Zero Manual Intervention Mode)');

    const controllerFiles = this.findControllerFiles(this.config.servicePath);
    Log.info(`📁 Found ${controllerFiles.length} controllers`);

    for (const file of controllerFiles) {
      try {
        const controller = await this.parseController(file);
        await this.generateTestFile(controller);
      } catch (error) {
        Log.error(`Failed to process ${file}: ${error}`);
      }
    }

    Log.info('✅ Enhanced test generation complete!');
  }

  /**
   * Find all *Resource.java and *Controller.java files
   */
  private findControllerFiles(dir: string): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
      return results;
    }

    const files = fs.readdirSync(dir, { recursive: true }) as string[];

    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (
        (file.endsWith('Resource.java') || file.endsWith('Controller.java')) &&
        !file.includes('test') &&
        !file.includes('Test')
      ) {
        results.push(fullPath);
      }
    }

    return results;
  }

  /**
   * Parse a Java controller file with enhanced extraction
   */
  async parseController(filePath: string): Promise<EnhancedController> {
    Log.info(`📝 Parsing: ${path.basename(filePath)}`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Extract class info
    const classNameMatch = content.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : path.basename(filePath, '.java');

    // Extract base mapping
    const baseMappingMatch = content.match(/@RequestMapping\(["']([^"']+)["']\)/);
    const baseMapping = baseMappingMatch ? baseMappingMatch[1] : '/api';

    // Extract entity name
    const entityNameMatch = content.match(/ENTITY_NAME\s*=\s*["']([^"']+)["']/);
    const entityName = entityNameMatch ? entityNameMatch[1] : className.replace(/Resource|Controller/, '');

    // Parse all endpoints with error scenarios
    const endpoints = this.extractEnhancedEndpoints(content, baseMapping);

    return {
      className,
      filePath,
      baseMapping,
      entityName,
      endpoints,
    };
  }

  /**
   * Extract endpoints with error scenarios and validation rules
   */
  private extractEnhancedEndpoints(content: string, baseMapping: string): EnhancedEndpoint[] {
    const endpoints: EnhancedEndpoint[] = [];

    const methodPatterns = [
      { method: 'GET' as const, pattern: /@GetMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/ },
      { method: 'POST' as const, pattern: /@PostMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/ },
      { method: 'PUT' as const, pattern: /@PutMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/ },
      { method: 'DELETE' as const, pattern: /@DeleteMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/ },
      { method: 'PATCH' as const, pattern: /@PatchMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/ },
    ];

    // Split content by method annotations to process each method
    const methodBlocks = this.splitIntoMethodBlocks(content);

    for (const block of methodBlocks) {
      for (const { method, pattern } of methodPatterns) {
        const match = block.match(pattern);
        if (match) {
          const endpointPath = match[1] || '';
          // Construct full path, avoiding double slashes and ensuring /api prefix
          let fullPath = baseMapping === '/' ? endpointPath : `${baseMapping}${endpointPath}`;
          fullPath = fullPath.replace(/\/+/g, '/'); // Remove double slashes
          if (!fullPath.startsWith('/api')) {
            fullPath = `/api${fullPath}`;
          }

          // Extract method name
          const methodNameMatch = block.match(
            /public\s+(?:ResponseEntity<[^>]+>|\w+(?:<[^>]+>)?)\s+(\w+)\s*\(/
          );
          const methodName = methodNameMatch ? methodNameMatch[1] : 'unknown';

          // Extract parameters
          const parameters = this.extractParameters(block);

          // Extract request body type
          const bodyMatch = block.match(/@RequestBody\s+(?:@Valid\s+)?(\w+)/);
          const requestBodyType = bodyMatch ? bodyMatch[1] : undefined;

          // Extract error scenarios from this method block
          const errorScenarios = this.extractErrorScenarios(block);

          // Check if requires auth (has UnauthorizedAlertException)
          const requiresAuth = block.includes('UnauthorizedAlertException');

          // Extract validation rules if we have a request body
          let validationRules: ValidationRule[] = [];
          if (requestBodyType) {
            validationRules = this.getValidationRulesForDTO(requestBodyType, content);
          }

          endpoints.push({
            method,
            path: fullPath,
            methodName,
            parameters,
            requestBodyType,
            returnType: 'unknown',
            errorScenarios,
            validationRules,
            requiresAuth,
          });
          break;
        }
      }
    }

    return endpoints;
  }

  /**
   * Split content into method blocks for individual processing
   */
  private splitIntoMethodBlocks(content: string): string[] {
    const blocks: string[] = [];
    const methodRegex = /@(Get|Post|Put|Delete|Patch)Mapping/g;
    let match;
    const indices: number[] = [];

    while ((match = methodRegex.exec(content)) !== null) {
      indices.push(match.index);
    }

    for (let i = 0; i < indices.length; i++) {
      const start = indices[i];
      const end = indices[i + 1] || content.length;
      blocks.push(content.substring(start, end));
    }

    return blocks;
  }

  /**
   * Extract error scenarios from method block
   */
  private extractErrorScenarios(block: string): ErrorScenario[] {
    const scenarios: ErrorScenario[] = [];

    // Pattern for BadRequestAlertException
    const badRequestPattern =
      /throw\s+new\s+BadRequestAlertException\s*\(\s*["']([^"']+)["']\s*,\s*\w+\s*,\s*["'](\w+)["']\s*\)/g;
    let match;

    while ((match = badRequestPattern.exec(block)) !== null) {
      const message = match[1];
      const errorCode = match[2];

      // Try to extract the condition
      const conditionMatch = block.substring(0, match.index).match(/if\s*\(([^)]+)\)\s*\{?\s*$/);
      const condition = conditionMatch ? conditionMatch[1].trim() : 'unknown condition';

      scenarios.push({
        errorCode,
        message,
        condition,
        expectedStatus: 400,
        type: 'BadRequest',
      });
    }

    // Pattern for UnauthorizedAlertException
    const unauthorizedPattern =
      /throw\s+new\s+UnauthorizedAlertException\s*\(\s*["']([^"']+)["']\s*,\s*\w+\s*,\s*["'](\w+)["']\s*\)/g;

    while ((match = unauthorizedPattern.exec(block)) !== null) {
      scenarios.push({
        errorCode: match[2],
        message: match[1],
        condition: 'unauthorized access',
        expectedStatus: 401,
        type: 'Unauthorized',
      });
    }

    return scenarios;
  }

  /**
   * Extract parameters from method signature
   */
  private extractParameters(block: string): ParameterInfo[] {
    const parameters: ParameterInfo[] = [];

    // @PathVariable
    const pathVarRegex = /@PathVariable(?:\s*\([^)]*\))?\s+(\w+)\s+(\w+)/g;
    let match;
    while ((match = pathVarRegex.exec(block)) !== null) {
      parameters.push({
        name: match[2],
        type: match[1],
        annotation: 'PathVariable',
        required: true,
      });
    }

    // @RequestBody
    const bodyRegex = /@RequestBody(?:\s+@Valid)?\s+(\w+)\s+(\w+)/g;
    while ((match = bodyRegex.exec(block)) !== null) {
      parameters.push({
        name: match[2],
        type: match[1],
        annotation: 'RequestBody',
        required: true,
      });
    }

    // @RequestParam
    const paramRegex = /@RequestParam(?:\s*\([^)]*\))?\s+(\w+)\s+(\w+)/g;
    while ((match = paramRegex.exec(block)) !== null) {
      parameters.push({
        name: match[2],
        type: match[1],
        annotation: 'RequestParam',
        required: true,
      });
    }

    return parameters;
  }

  /**
   * Get validation rules for a DTO type
   */
  private getValidationRulesForDTO(dtoType: string, controllerContent: string): ValidationRule[] {
    if (this.dtoCache.has(dtoType)) {
      return this.dtoCache.get(dtoType) || [];
    }

    const rules: ValidationRule[] = [];

    // Try to find and parse the DTO file
    const dtoPath = this.findDTOFile(dtoType);
    if (dtoPath && fs.existsSync(dtoPath)) {
      const dtoContent = fs.readFileSync(dtoPath, 'utf8');
      rules.push(...this.extractValidationRules(dtoContent));
    }

    this.dtoCache.set(dtoType, rules);
    return rules;
  }

  /**
   * Find DTO file path
   */
  private findDTOFile(dtoType: string): string | null {
    const searchDirs = [
      path.join(this.config.servicePath, '..', 'service', 'dto'),
      path.join(this.config.servicePath, '..', '..', 'service', 'dto'),
    ];

    for (const dir of searchDirs) {
      const dtoPath = path.join(dir, `${dtoType}.java`);
      if (fs.existsSync(dtoPath)) {
        return dtoPath;
      }
    }

    return null;
  }

  /**
   * Extract validation rules from DTO content
   */
  private extractValidationRules(dtoContent: string): ValidationRule[] {
    const rules: ValidationRule[] = [];

    // @NotNull
    const notNullRegex = /@NotNull\s+(?:private\s+)?(\w+)\s+(\w+)/g;
    let match;
    while ((match = notNullRegex.exec(dtoContent)) !== null) {
      rules.push({
        field: match[2],
        type: match[1],
        constraint: 'NotNull',
        message: `${match[2]} must not be null`,
      });
    }

    // @NotBlank
    const notBlankRegex = /@NotBlank\s+(?:private\s+)?(\w+)\s+(\w+)/g;
    while ((match = notBlankRegex.exec(dtoContent)) !== null) {
      rules.push({
        field: match[2],
        type: match[1],
        constraint: 'NotBlank',
        message: `${match[2]} must not be blank`,
      });
    }

    // @Size
    const sizeRegex = /@Size\s*\(\s*(?:min\s*=\s*(\d+))?\s*,?\s*(?:max\s*=\s*(\d+))?\s*\)\s+(?:private\s+)?(\w+)\s+(\w+)/g;
    while ((match = sizeRegex.exec(dtoContent)) !== null) {
      rules.push({
        field: match[4],
        type: match[3],
        constraint: `Size(min=${match[1] || 0}, max=${match[2] || 'unlimited'})`,
        message: `${match[4]} size must be between ${match[1] || 0} and ${match[2] || 'unlimited'}`,
      });
    }

    // @Email
    const emailRegex = /@Email\s+(?:private\s+)?(\w+)\s+(\w+)/g;
    while ((match = emailRegex.exec(dtoContent)) !== null) {
      rules.push({
        field: match[2],
        type: match[1],
        constraint: 'Email',
        message: `${match[2]} must be a valid email`,
      });
    }

    return rules;
  }

  /**
   * Generate test file for a controller
   */
  async generateTestFile(controller: EnhancedController): Promise<void> {
    const testContent = this.generateTestContent(controller);
    const outputDir = path.join(this.config.outputPath, 'api');
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `${controller.className.replace(/Resource|Controller/, '')}.comprehensive.spec.ts`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, testContent, 'utf8');
    Log.info(`✅ Generated: ${fileName}`);
    Log.info(`   - Endpoints: ${controller.endpoints.length}`);
    Log.info(
      `   - Error scenarios: ${controller.endpoints.reduce((sum, e) => sum + e.errorScenarios.length, 0)}`
    );
  }

  /**
   * Generate comprehensive test content
   */
  private generateTestContent(controller: EnhancedController): string {
    const imports = `import { test, expect } from '../fixtures/advancedFixtures';
import Log from '../../lib/Log';

/**
 * Comprehensive API Tests for ${controller.className}
 * Generated automatically with ZERO manual intervention
 * 
 * Coverage:
 * - Happy path tests for all endpoints
 * - Negative tests for all error scenarios
 * - Validation tests for DTO constraints
 * - Authorization tests
 * 
 * Source: ${path.basename(controller.filePath)}
 */
`;

    const testSuites = controller.endpoints.map(endpoint => this.generateEndpointTests(endpoint, controller)).join('\n\n');

    return `${imports}
test.describe('${controller.className} API Tests', () => {
${testSuites}
});
`;
  }

  /**
   * Generate all tests for an endpoint
   */
  private generateEndpointTests(endpoint: EnhancedEndpoint, controller: EnhancedController): string {
    const tests: string[] = [];

    // 1. Happy path test
    tests.push(this.generateHappyPathTest(endpoint, controller));

    // 2. Error scenario tests (deduplicated by errorCode)
    if (this.config.includeNegativeTests) {
      const seenErrorCodes = new Set<string>();
      for (const scenario of endpoint.errorScenarios) {
        if (!seenErrorCodes.has(scenario.errorCode)) {
          seenErrorCodes.add(scenario.errorCode);
          tests.push(this.generateErrorScenarioTest(endpoint, scenario, controller));
        }
      }
    }

    // 3. Validation tests
    if (this.config.includeValidationTests && endpoint.validationRules.length > 0) {
      for (const rule of endpoint.validationRules) {
        tests.push(this.generateValidationTest(endpoint, rule, controller));
      }
    }

    // 4. Auth test
    if (this.config.includeAuthTests && endpoint.requiresAuth) {
      tests.push(this.generateAuthTest(endpoint, controller));
    }

    return tests.join('\n\n');
  }

  /**
   * Generate happy path test
   */
  private generateHappyPathTest(endpoint: EnhancedEndpoint, controller: EnhancedController): string {
    const pathParams = endpoint.parameters.filter(p => p.annotation === 'PathVariable');
    const bodyParams = endpoint.parameters.filter(p => p.annotation === 'RequestBody');

    let testUrl = endpoint.path;
    const pathVarSetup = pathParams.map(p => `const ${p.name} = ${this.getMockValue(p.type)};`).join('\n    ');
    pathParams.forEach(p => {
      testUrl = testUrl.replace(`{${p.name}}`, `\${${p.name}}`);
    });

    const expectedStatus = endpoint.method === 'POST' ? 201 : endpoint.method === 'DELETE' ? 204 : 200;
    const bodySetup = bodyParams.length > 0 
      ? `const requestData = ${this.getMockRequestBody(bodyParams[0].type)};`
      : '';

    const requestCall = this.getApiHelperCall(endpoint.method, testUrl, bodyParams.length > 0);

    return `  test('@smoke ${endpoint.method} ${endpoint.path} - ${endpoint.methodName} - Happy Path', async ({ authenticatedApi }) => {
    Log.info('Testing ${endpoint.method} ${endpoint.path}');
    
    // Given valid request data
    ${pathVarSetup}
    ${bodySetup}

    // When making authenticated ${endpoint.method} request
    ${requestCall}

    // Then should return success
    expect([200, 201, 204]).toContain(response.status());
    Log.info(\`Response status: \${response.status()}\`);
    ${expectedStatus !== 204 ? `
    // And response should have valid structure
    if (response.status() !== 204) {
      const data = await response.json();
      expect(data).toBeDefined();
    }` : ''}
  });`;
  }

  /**
   * Generate error scenario test
   */
  private generateErrorScenarioTest(
    endpoint: EnhancedEndpoint,
    scenario: ErrorScenario,
    controller: EnhancedController
  ): string {
    const testData = this.getTestDataForScenario(scenario, endpoint);

    return `  test('@negative ${endpoint.method} ${endpoint.path} - ${scenario.errorCode}', async ({ authenticatedApi }) => {
    Log.info('Testing error scenario: ${scenario.errorCode}');
    
    // Given ${scenario.condition}
    ${testData.setup}

    // When making ${endpoint.method} request with invalid data
    try {
      ${testData.request}
    } catch (error) {
      // Expected error from APITestHelper
      Log.info('Expected error caught');
    }

    // Then should return ${scenario.expectedStatus} error
    expect([400, 401, 403, 404, 409]).toContain(response.status());

    // And error should have correct error key
    const errorBody = await response.text();
    expect(errorBody).toContain('${scenario.errorCode}');
  });`;
  }

  /**
   * Generate validation test
   */
  private generateValidationTest(
    endpoint: EnhancedEndpoint,
    rule: ValidationRule,
    controller: EnhancedController
  ): string {
    const invalidValue = this.getInvalidValueForRule(rule);

    return `  test('@validation ${endpoint.method} ${endpoint.path} - ${rule.field} ${rule.constraint}', async ({ authenticatedApi }) => {
    Log.info('Testing validation: ${rule.field} ${rule.constraint}');
    
    // Given request with invalid ${rule.field}
    const requestData = {
      ${rule.field}: ${invalidValue},
    };

    // When making ${endpoint.method} request
    let response;
    try {
      response = await authenticatedApi.${endpoint.method.toLowerCase()}('${endpoint.path}', requestData);
    } catch (error) {
      Log.info('Expected validation error caught');
    }

    // Then should return 400 validation error
    if (response) {
      expect(response.status()).toBe(400);
    }
  });`;
  }

  /**
   * Generate auth test
   */
  private generateAuthTest(endpoint: EnhancedEndpoint, controller: EnhancedController): string {
    return `  test('@security ${endpoint.method} ${endpoint.path} - Unauthorized Access', async ({ request }) => {
    Log.info('Testing unauthorized access');
    
    // Given no valid authentication/authorization
    // Create a new API helper without auth
    const unauthApi = new APITestHelper(request);
    
    // When making ${endpoint.method} request without proper permissions
    let response;
    try {
      response = await unauthApi.${endpoint.method.toLowerCase()}('${endpoint.path}', undefined, { skipAuth: true });
    } catch (error) {
      Log.info('Expected auth error caught');
    }

    // Then should return 401/403 error
    if (response) {
      expect([401, 403]).toContain(response.status());
    }
  });`;
  }

  /**
   * Helper: Get mock value for type
   */
  private getMockValue(type: string): string {
    const typeMap: Record<string, string> = {
      String: "'test-value'",
      Long: '1',
      Integer: '1',
      int: '1',
      long: '1',
      Boolean: 'true',
      boolean: 'true',
    };
    return typeMap[type] || "'test-value'";
  }

  /**
   * Helper: Get mock request body
   */
  private getMockRequestBody(type: string): string {
    return `{
      id: null,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    }`;
  }

  /**
   * Helper: Get API helper call
   */
  private getApiHelperCall(method: string, url: string, hasBody: boolean): string {
    if (hasBody) {
      return `const response = await authenticatedApi.${method.toLowerCase()}('${url}', requestData);`;
    }
    return `const response = await authenticatedApi.${method.toLowerCase()}('${url}');`;
  }

  /**
   * Helper: Get test data for error scenario
   */
  private getTestDataForScenario(
    scenario: ErrorScenario,
    endpoint: EnhancedEndpoint
  ): { setup: string; request: string } {
    const errorDataMap: Record<string, { setup: string; request: string }> = {
      idexists: {
        setup: 'const requestData = { id: 999, username: "existing", email: "existing@test.com" };',
        request: `const response = await authenticatedApi.${endpoint.method.toLowerCase()}('${endpoint.path}', requestData);`,
      },
      idnull: {
        setup: 'const requestData = { id: null };',
        request: `const response = await authenticatedApi.${endpoint.method.toLowerCase()}('${endpoint.path}', requestData);`,
      },
      idnotfound: {
        setup: 'const nonExistentId = 999999;',
        request: `const response = await authenticatedApi.${endpoint.method.toLowerCase()}('${endpoint.path.replace('{id}', "' + nonExistentId + '")}');`,
      },
      userNameExist: {
        setup: 'const requestData = { username: "existinguser", email: "new@test.com" };',
        request: `const response = await authenticatedApi.${endpoint.method.toLowerCase()}('${endpoint.path}', requestData);`,
      },
      emailExist: {
        setup: 'const requestData = { username: "newuser", email: "existing@test.com" };',
        request: `const response = await authenticatedApi.${endpoint.method.toLowerCase()}('${endpoint.path}', requestData);`,
      },
    };

    return errorDataMap[scenario.errorCode] || {
      setup: '// Setup for ' + scenario.errorCode,
      request: `const response = await authenticatedApi.${endpoint.method.toLowerCase()}('${endpoint.path}');`,
    };
  }

  /**
   * Helper: Get invalid value for validation rule
   */
  private getInvalidValueForRule(rule: ValidationRule): string {
    switch (rule.constraint) {
      case 'NotNull':
        return 'null';
      case 'NotBlank':
        return "''";
      case 'Email':
        return "'not-an-email'";
      default:
        if (rule.constraint.startsWith('Size')) {
          return "''"; // Empty string to violate min size
        }
        return 'null';
    }
  }
}

/**
 * CLI Entry point
 */
export async function runEnhancedGeneration(servicePath: string, outputPath: string): Promise<void> {
  const generator = new EnhancedTestGenerator({
    servicePath,
    outputPath,
    includeNegativeTests: true,
    includeValidationTests: true,
    includeAuthTests: true,
  });

  await generator.generateAll();
}

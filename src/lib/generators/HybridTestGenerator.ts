/**
 * HybridTestGenerator - Generates Playwright tests from multiple sources
 *
 * Sources:
 * 1. Java Controllers (REST APIs) - Generates API tests
 * 2. Angular Components - Generates UI tests
 * 3. ADO Work Items - Generates tests from acceptance criteria
 * 4. OpenAPI/Swagger - Generates API contract tests
 *
 * Uses existing framework prompt and patterns
 */

import {
  TestScriptGenerator,
  TestScriptConfig,
  GeneratedTestScript,
  GeneratedTestCase,
} from './TestScriptGenerator';
import Log from '../utils/Log';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Type Definitions
// ============================================

export interface JavaController {
  className: string;
  filePath: string;
  packageName: string;
  baseMapping: string;
  endpoints: JavaEndpoint[];
}

export interface JavaEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  methodName: string;
  parameters: JavaParameter[];
  returnType: string;
  description?: string;
}

export interface JavaParameter {
  name: string;
  type: string;
  annotation: 'PathVariable' | 'RequestBody' | 'RequestParam' | 'RequestHeader';
  required: boolean;
}

export interface AngularComponent {
  className: string;
  filePath: string;
  selector: string;
  template: string;
  inputs: AngularInput[];
  outputs: AngularOutput[];
  services: string[];
  methods: AngularMethod[];
}

export interface AngularInput {
  name: string;
  type: string;
}

export interface AngularOutput {
  name: string;
  type: string;
}

export interface AngularMethod {
  name: string;
  returnType: string;
  parameters: { name: string; type: string }[];
}

export interface HybridGenerationResult {
  apiTests: GeneratedTestScript[];
  uiTests: GeneratedTestScript[];
  integrationTests: GeneratedTestScript[];
  summary: GenerationSummary;
}

export interface GenerationSummary {
  totalTests: number;
  apiTestsCount: number;
  uiTestsCount: number;
  integrationTestsCount: number;
  controllers: number;
  components: number;
  workItems: number;
}

// ============================================
// Main Generator Class
// ============================================

interface SourceCodePaths {
  javaControllers: string[];
  angularComponents: string[];
  openApiSpecs: string[];
}

export class HybridTestGenerator extends TestScriptGenerator {
  private sourceCodePaths: SourceCodePaths;

  constructor(config: TestScriptConfig, sourceCodePaths?: SourceCodePaths) {
    super(config);
    this.sourceCodePaths = sourceCodePaths || {
      javaControllers: [],
      angularComponents: [],
      openApiSpecs: [],
    };
  }

  /**
   * Generate all tests - Hybrid approach
   */
  async generateAll(): Promise<HybridGenerationResult> {
    Log.info('🚀 Starting Hybrid Test Generation');

    const result: HybridGenerationResult = {
      apiTests: [],
      uiTests: [],
      integrationTests: [],
      summary: {
        totalTests: 0,
        apiTestsCount: 0,
        uiTestsCount: 0,
        integrationTestsCount: 0,
        controllers: 0,
        components: 0,
        workItems: 0,
      },
    };

    // Generate API tests from Java controllers
    if (this.sourceCodePaths.javaControllers.length > 0) {
      Log.info('📡 Generating API tests from Java controllers...');
      result.apiTests = await this.generateAPITestsFromControllers();
      result.summary.controllers = this.sourceCodePaths.javaControllers.length;
    }

    // Generate UI tests from Angular components
    if (this.sourceCodePaths.angularComponents.length > 0) {
      Log.info('🎨 Generating UI tests from Angular components...');
      result.uiTests = await this.generateUITestsFromComponents();
      result.summary.components = this.sourceCodePaths.angularComponents.length;
    }

    // Generate integration tests (API + UI flow)
    Log.info('🔗 Generating integration tests...');
    result.integrationTests = await this.generateIntegrationTests(result.apiTests, result.uiTests);

    // Calculate summary
    result.summary.apiTestsCount = result.apiTests.length;
    result.summary.uiTestsCount = result.uiTests.length;
    result.summary.integrationTestsCount = result.integrationTests.length;
    result.summary.totalTests =
      result.summary.apiTestsCount +
      result.summary.uiTestsCount +
      result.summary.integrationTestsCount;

    Log.info(`✅ Hybrid generation complete: ${result.summary.totalTests} tests generated`);
    return result;
  }

  /**
   * Generate API tests from Java controllers
   */
  async generateAPITestsFromControllers(): Promise<GeneratedTestScript[]> {
    const generatedTests: GeneratedTestScript[] = [];

    for (const controllerPath of this.sourceCodePaths.javaControllers) {
      try {
        const controller = await this.parseJavaController(controllerPath);
        const testScript = await this.generateAPITestFromController(controller);
        generatedTests.push(testScript);
      } catch (error) {
        Log.error(`Failed to generate tests for controller ${controllerPath}: ${error}`);
      }
    }

    return generatedTests;
  }

  /**
   * Parse Java controller file
   */
  async parseJavaController(filePath: string): Promise<JavaController> {
    Log.info(`Parsing Java controller: ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Extract class name
    const classNameMatch = content.match(/public\s+class\s+(\w+Controller)/);
    const className = classNameMatch ? classNameMatch[1] : path.basename(filePath, '.java');

    // Extract package
    const packageMatch = content.match(/package\s+([\w.]+);/);
    const packageName = packageMatch ? packageMatch[1] : '';

    // Extract base mapping
    const baseMappingMatch = content.match(/@RequestMapping\("([^"]+)"\)/);
    const baseMapping = baseMappingMatch ? baseMappingMatch[1] : '/api';

    // Extract endpoints
    const endpoints = this.extractEndpoints(content, baseMapping);

    return {
      className,
      filePath,
      packageName,
      baseMapping,
      endpoints,
    };
  }

  /**
   * Extract REST endpoints from controller content
   */
  private extractEndpoints(content: string, baseMapping: string): JavaEndpoint[] {
    const endpoints: JavaEndpoint[] = [];

    // Regex patterns for different HTTP methods (also match empty mappings)
    const methodPatterns = [
      { method: 'GET' as const, pattern: /@GetMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/g },
      {
        method: 'POST' as const,
        pattern: /@PostMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/g,
      },
      { method: 'PUT' as const, pattern: /@PutMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/g },
      {
        method: 'DELETE' as const,
        pattern: /@DeleteMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/g,
      },
      {
        method: 'PATCH' as const,
        pattern: /@PatchMapping(?:\((?:value\s*=\s*)?["']([^"']*)["']\))?/g,
      },
    ];

    for (const { method, pattern } of methodPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const path = match[1] || '';
        const methodStartIndex = match.index;

        // Find method name - look ahead for method signature
        const methodSignature = content.substring(methodStartIndex, methodStartIndex + 800);

        // Better method name extraction - look for public methods after annotation
        const methodNameMatch = methodSignature.match(
          /public\s+(?:ResponseEntity<[^>]+>|\w+(?:<[^>]+>)?)\s+(\w+)\s*\(/
        );
        const methodName = methodNameMatch ? methodNameMatch[1] : 'unknown';

        // Extract Swagger/OpenAPI description
        const descriptionMatch = methodSignature.match(/@Operation\s*\(\s*summary\s*=\s*"([^"]+)"/);
        const description = descriptionMatch ? descriptionMatch[1] : undefined;

        // Extract parameters
        const parameters = this.extractParameters(methodSignature);

        // Extract return type - handle ResponseEntity wrapper
        const returnTypeMatch = methodSignature.match(
          /public\s+(ResponseEntity<([^>]+)>|[\w<>,\s]+)\s+\w+\s*\(/
        );
        let returnType = 'void';
        if (returnTypeMatch) {
          if (returnTypeMatch[2]) {
            // Has ResponseEntity wrapper
            returnType = returnTypeMatch[2].trim();
          } else {
            returnType = returnTypeMatch[1].trim();
          }
        }

        endpoints.push({
          method,
          path: `${baseMapping}${path}`,
          methodName,
          parameters,
          returnType,
          description,
        });
      }
    }

    return endpoints;
  }

  /**
   * Extract method parameters
   */
  private extractParameters(methodSignature: string): JavaParameter[] {
    const parameters: JavaParameter[] = [];

    // @PathVariable - use string replace method instead of matchAll
    const pathVarRegex = /@PathVariable(?:\("[^"]+"\))?\s+(\w+)\s+(\w+)/g;
    let pathVarMatch;
    while ((pathVarMatch = pathVarRegex.exec(methodSignature)) !== null) {
      parameters.push({
        name: pathVarMatch[2],
        type: pathVarMatch[1],
        annotation: 'PathVariable',
        required: true,
      });
    }

    // @RequestBody
    const bodyRegex = /@RequestBody\s+(\w+)\s+(\w+)/g;
    let bodyMatch;
    while ((bodyMatch = bodyRegex.exec(methodSignature)) !== null) {
      parameters.push({
        name: bodyMatch[2],
        type: bodyMatch[1],
        annotation: 'RequestBody',
        required: true,
      });
    }

    // @RequestParam
    const paramRegex = /@RequestParam(?:\([^)]+\))?\s+(\w+)\s+(\w+)/g;
    let paramMatch;
    while ((paramMatch = paramRegex.exec(methodSignature)) !== null) {
      parameters.push({
        name: paramMatch[2],
        type: paramMatch[1],
        annotation: 'RequestParam',
        required: true,
      });
    }

    return parameters;
  }

  /**
   * Generate API test from controller
   */
  async generateAPITestFromController(controller: JavaController): Promise<GeneratedTestScript> {
    Log.info(`Generating API tests for ${controller.className}`);

    const testCases: GeneratedTestCase[] = [];

    for (const endpoint of controller.endpoints) {
      testCases.push({
        testName: `${endpoint.method} ${endpoint.path} - ${endpoint.methodName}`,
        description: `Test ${endpoint.method} endpoint for ${endpoint.methodName}`,
        testSteps: [
          `Send ${endpoint.method} request to ${endpoint.path}`,
          'Verify response status code',
          'Validate response schema',
          'Check response data',
        ],
        pageObjectMethods: [],
      });
    }

    // Generate test spec content
    const testSpecContent = this.generateAPITestSpec(controller, testCases);
    const testSpecFile = await this.saveAPITestSpec(controller, testSpecContent);

    return {
      testSpecFile,
      workItemId: 0,
      testCases,
    };
  }

  /**
   * Generate API test spec content
   */
  private generateAPITestSpec(controller: JavaController, testCases: GeneratedTestCase[]): string {
    const imports = `import { test, expect } from '../fixtures/advancedFixtures';
`;

    const testSuite = `/**
 * API Tests for ${controller.className}
 * Generated from: ${controller.filePath}
 * Base Path: ${controller.baseMapping}
 */
test.describe('${controller.className} API Tests', () => {
${this.generateAPITestCases(controller, testCases)}
});
`;

    return imports + testSuite;
  }

  /**
   * Generate individual API test cases
   */
  private generateAPITestCases(controller: JavaController, testCases: GeneratedTestCase[]): string {
    return controller.endpoints
      .map((endpoint, index) => {
        const testCase = testCases[index];
        return this.generateAPITestCase(endpoint, testCase);
      })
      .join('\n\n');
  }

  /**
   * Generate single API test case
   */
  private generateAPITestCase(endpoint: JavaEndpoint, _testCase: GeneratedTestCase): string {
    const pathParamsList = endpoint.parameters.filter(p => p.annotation === 'PathVariable');
    const bodyParams = endpoint.parameters.filter(p => p.annotation === 'RequestBody');
    const queryParams = endpoint.parameters.filter(p => p.annotation === 'RequestParam');

    let testUrl = endpoint.path;
    const testDescription = endpoint.description || `Test ${endpoint.methodName}`;

    // Prepare path variables
    const pathVarDeclarations = pathParamsList
      .map(p => `    const ${p.name} = ${this.generateMockValue(p.type)};`)
      .join('\n');

    // Replace path variables in URL
    pathParamsList.forEach(p => {
      testUrl = testUrl.replace(`{${p.name}}`, `\${${p.name}}`);
    });

    // Build request
    let givenStep = '';
    let requestCode = '';
    let expectedStatus = 200;

    switch (endpoint.method) {
      case 'GET':
        givenStep =
          pathParamsList.length > 0
            ? `valid ${pathParamsList.map(p => p.name).join(', ')}`
            : 'no parameters required';

        if (queryParams.length > 0) {
          const queryParamsObj = queryParams
            .map(p => `${p.name}: '${this.generateMockValue(p.type)}'`)
            .join(', ');
          requestCode = `const response = await request.get(\`${testUrl}\`, { params: { ${queryParamsObj} } });`;
        } else {
          requestCode = `const response = await request.get(\`${testUrl}\`);`;
        }
        break;

      case 'POST': {
        expectedStatus = 201;
        givenStep = 'valid request data';
        const postData =
          bodyParams.length > 0
            ? this.generateMockRequestBody(bodyParams[0].type)
            : "{ name: 'Test Location', address: 'Test Address' }";
        requestCode = `const requestData = ${postData};\n    const response = await request.post(\`${testUrl}\`, { data: requestData });`;
        break;
      }

      case 'PUT': {
        givenStep =
          bodyParams.length > 0
            ? 'valid update data'
            : `valid ${pathParamsList.map(p => p.name).join(', ')}`;
        const putData =
          bodyParams.length > 0 ? this.generateMockRequestBody(bodyParams[0].type) : null;
        requestCode = putData
          ? `const requestData = ${putData};\n    const response = await request.put(\`${testUrl}\`, { data: requestData });`
          : `const response = await request.put(\`${testUrl}\`);`;
        break;
      }

      case 'DELETE':
        expectedStatus = endpoint.returnType === 'Void' ? 204 : 200;
        givenStep =
          pathParamsList.length > 0
            ? `valid ${pathParamsList.map(p => p.name).join(', ')}`
            : 'valid resource ID';
        requestCode = `const response = await request.delete(\`${testUrl}\`);`;
        break;

      default:
        requestCode = `const response = await request.${endpoint.method.toLowerCase()}(\`${testUrl}\`);`;
    }

    // Build validation based on return type
    const validationCode =
      endpoint.returnType === 'Void' || expectedStatus === 204
        ? `// Then should return success with no content
    expect(response.status()).toBe(${expectedStatus});`
        : `// Then should return success
    expect(response.status()).toBe(${expectedStatus});

    // And response should have valid structure
    const data = await response.json();
    expect(data).toBeDefined();`;

    const pathVarsSection = pathVarDeclarations ? `\n${pathVarDeclarations}\n` : '';

    return `  test('${endpoint.method} ${endpoint.path} - ${endpoint.methodName}', async ({ request }) => {
    // Given ${givenStep}${pathVarsSection}
    // When ${testDescription.toLowerCase()}
    ${requestCode}

    ${validationCode}
  });`;
  }

  /**
   * Generate mock value based on type
   */
  private generateMockValue(type: string): string {
    const typeMap: { [key: string]: string } = {
      String: 'test-string',
      Long: '1',
      Integer: '1',
      int: '1',
      long: '1',
      Boolean: 'true',
      boolean: 'true',
      Double: '1.0',
      double: '1.0',
    };

    return typeMap[type] || 'test-value';
  }

  /**
   * Generate mock request body
   */
  private generateMockRequestBody(type: string): string {
    return `{
      // TODO: Add ${type} structure
      id: 1,
      name: "Test ${type}"
    }`;
  }

  /**
   * Save API test spec
   */
  private async saveAPITestSpec(controller: JavaController, content: string): Promise<string> {
    // Access config through type assertion to bypass private access
    const config = (this as unknown as { config: TestScriptConfig }).config;
    // Save in api folder directly (not api/generated) for Playwright discovery
    const outputDir = path.join(config.outputDirectory, 'api');
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `${controller.className.replace('Controller', '')}.generated.spec.ts`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, content, 'utf8');
    Log.info(`✅ Saved API test: ${filePath}`);

    return filePath;
  }

  /**
   * Generate UI tests from Angular components
   */
  async generateUITestsFromComponents(): Promise<GeneratedTestScript[]> {
    const generatedTests: GeneratedTestScript[] = [];

    for (const componentPath of this.sourceCodePaths.angularComponents) {
      try {
        const component = await this.parseAngularComponent(componentPath);
        const testScript = await this.generateUITestFromComponent(component);
        generatedTests.push(testScript);
      } catch (error) {
        Log.error(`Failed to generate tests for component ${componentPath}: ${error}`);
      }
    }

    return generatedTests;
  }

  /**
   * Parse Angular component
   */
  async parseAngularComponent(filePath: string): Promise<AngularComponent> {
    Log.info(`Parsing Angular component: ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Extract component metadata
    const selectorMatch = content.match(/selector:\s*['"]([^'"]+)['"]/);
    const selector = selectorMatch ? selectorMatch[1] : '';

    const classNameMatch = content.match(/export\s+class\s+(\w+Component)/);
    const className = classNameMatch ? classNameMatch[1] : path.basename(filePath, '.component.ts');

    // Extract template ([\s\S] instead of . with /s flag for ES5 compatibility)
    const templateMatch = content.match(/template:\s*`([\s\S]*?)`/);
    const template = templateMatch ? templateMatch[1] : '';

    // Extract inputs - use exec instead of matchAll
    const inputs: AngularInput[] = [];
    const inputRegex = /@Input\(\)\s+(\w+)(?::\s*(\w+))?/g;
    let inputMatch;
    while ((inputMatch = inputRegex.exec(content)) !== null) {
      inputs.push({
        name: inputMatch[1],
        type: inputMatch[2] || 'any',
      });
    }

    // Extract outputs
    const outputs: AngularOutput[] = [];
    const outputRegex = /@Output\(\)\s+(\w+):\s*EventEmitter<(\w+)>/g;
    let outputMatch;
    while ((outputMatch = outputRegex.exec(content)) !== null) {
      outputs.push({
        name: outputMatch[1],
        type: outputMatch[2],
      });
    }

    // Extract methods
    const methods: AngularMethod[] = [];
    const methodRegex = /(\w+)\s*\([^)]*\):\s*(\w+)\s*{/g;
    let methodMatch;
    while ((methodMatch = methodRegex.exec(content)) !== null) {
      if (methodMatch[1] !== 'constructor' && methodMatch[1] !== 'ngOnInit') {
        methods.push({
          name: methodMatch[1],
          returnType: methodMatch[2],
          parameters: [],
        });
      }
    }

    // Extract services
    const services: string[] = [];
    const serviceRegex = /private\s+(\w+Service):\s*\w+Service/g;
    let serviceMatch;
    while ((serviceMatch = serviceRegex.exec(content)) !== null) {
      services.push(serviceMatch[1]);
    }

    return {
      className,
      filePath,
      selector,
      template,
      inputs,
      outputs,
      services,
      methods,
    };
  }

  /**
   * Generate UI test from component (placeholder)
   */
  async generateUITestFromComponent(component: AngularComponent): Promise<GeneratedTestScript> {
    Log.info(`Generating UI tests for ${component.className}`);

    // TODO: Implement UI test generation
    return {
      testSpecFile: '',
      workItemId: 0,
      testCases: [],
    };
  }

  /**
   * Generate integration tests
   */
  async generateIntegrationTests(
    _apiTests: GeneratedTestScript[],
    _uiTests: GeneratedTestScript[]
  ): Promise<GeneratedTestScript[]> {
    // TODO: Combine API + UI tests into integration scenarios
    return [];
  }
}

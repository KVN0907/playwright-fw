/**
 * RAGTestGenerator - Enhances test generation using Retrieval-Augmented Generation
 *
 * Uses vector similarity search to find relevant existing tests and
 * incorporates them as context for generating higher-quality, consistent tests.
 *
 * Benefits:
 * - Generates tests consistent with existing codebase style
 * - Provides realistic test data based on similar tests
 * - Suggests appropriate assertions from similar endpoints
 * - Reduces duplicate/redundant tests
 * - Learns patterns from existing successful tests
 */

import OpenAI from 'openai';
import { VectorStoreHelper } from './VectorStoreHelper';
import Log from '../utils/Log';
import * as fs from 'fs';
import * as path from 'path';

// RAG-specific types (independent from TestScriptGenerator)
export interface RAGTestScript {
  name: string;
  description: string;
  testCases: RAGTestCase[];
  imports: string[];
  code: string;
}

export interface RAGTestCase {
  name: string;
  description: string;
  steps: string[];
  assertions: string[];
  tags: string[];
}

export interface RAGConfig {
  openAIApiKey?: string;
  model?: string;
  vectorStoreConfig?: {
    collectionName?: string;
    persistDirectory?: string;
  };
  temperature?: number;
  maxTokens?: number;
}

export interface EndpointInfo {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  operationId?: string;
  description?: string;
  parameters?: ParameterInfo[];
  requestBody?: RequestBodyInfo;
  responses?: Record<string, ResponseInfo>;
  tags?: string[];
}

export interface ParameterInfo {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  type: string;
  description?: string;
}

export interface RequestBodyInfo {
  contentType: string;
  schema: Record<string, unknown>;
  required: boolean;
}

export interface ResponseInfo {
  description: string;
  schema?: Record<string, unknown>;
}

export interface RAGGenerationResult {
  testScript: RAGTestScript;
  context: string;
  similarTests: string[];
  confidence: number;
}

export class RAGTestGenerator {
  private openai: OpenAI;
  private vectorStore: VectorStoreHelper;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private initialized = false;

  constructor(config: RAGConfig = {}) {
    const apiKey = config.openAIApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key is required for RAGTestGenerator');
    }

    this.openai = new OpenAI({ apiKey });
    this.model = config.model || 'gpt-4o';
    this.temperature = config.temperature || 0.3;
    this.maxTokens = config.maxTokens || 4096;

    this.vectorStore = new VectorStoreHelper({
      openAIApiKey: apiKey,
      ...config.vectorStoreConfig,
    });

    Log.info(`RAGTestGenerator initialized with model: ${this.model}`);
  }

  /**
   * Initialize the generator and index existing tests
   */
  async initialize(testDirectory?: string): Promise<void> {
    if (this.initialized) return;

    await this.vectorStore.initialize();

    if (testDirectory) {
      Log.info(`Indexing existing tests from: ${testDirectory}`);
      const count = await this.vectorStore.indexTestDirectory(testDirectory);
      Log.info(`Indexed ${count} existing tests`);
    }

    this.initialized = true;
  }

  /**
   * Generate a test with RAG enhancement
   */
  async generateTest(endpoint: EndpointInfo): Promise<RAGGenerationResult> {
    await this.initialize();

    // Get relevant context from existing tests
    const context = await this.vectorStore.getContextForGeneration(
      endpoint.path,
      endpoint.method,
      endpoint.description
    );

    // Build the prompt with context
    const prompt = this.buildPrompt(endpoint, context);

    // Generate test using LLM
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt },
      ],
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    const generatedCode = completion.choices[0]?.message?.content || '';
    const testScript = this.parseGeneratedTest(endpoint, generatedCode);

    // Get similar test names for reference
    const similarResults = await this.vectorStore.searchByEndpoint(
      endpoint.path,
      endpoint.method,
      3
    );
    const similarTests = similarResults.map(
      r => (r.metadata as { testName?: string }).testName || 'Unknown'
    );

    return {
      testScript,
      context,
      similarTests,
      confidence: this.calculateConfidence(similarResults.length, context.length),
    };
  }

  /**
   * Generate tests for multiple endpoints
   */
  async generateTests(endpoints: EndpointInfo[]): Promise<RAGGenerationResult[]> {
    const results: RAGGenerationResult[] = [];

    for (const endpoint of endpoints) {
      try {
        const result = await this.generateTest(endpoint);
        results.push(result);
        Log.info(`Generated RAG-enhanced test for ${endpoint.method} ${endpoint.path}`);
      } catch (error) {
        Log.error(`Failed to generate test for ${endpoint.method} ${endpoint.path}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Build the generation prompt with RAG context
   */
  private buildPrompt(endpoint: EndpointInfo, context: string): string {
    const parameterInfo =
      endpoint.parameters
        ?.map(p => `  - ${p.name} (${p.in}): ${p.type}${p.required ? ' [required]' : ''}`)
        .join('\n') || 'None';

    const requestBodyInfo = endpoint.requestBody
      ? `Content-Type: ${endpoint.requestBody.contentType}\nSchema: ${JSON.stringify(endpoint.requestBody.schema, null, 2)}`
      : 'None';

    return `
Generate a comprehensive Playwright API test for the following endpoint:

## Endpoint Information
- Method: ${endpoint.method}
- Path: ${endpoint.path}
- Operation ID: ${endpoint.operationId || 'N/A'}
- Description: ${endpoint.description || 'N/A'}
- Tags: ${endpoint.tags?.join(', ') || 'N/A'}

## Parameters
${parameterInfo}

## Request Body
${requestBodyInfo}

## Expected Responses
${Object.entries(endpoint.responses || {})
  .map(([code, info]) => `- ${code}: ${info.description}`)
  .join('\n')}

${context}

## Requirements
1. Follow the framework's Given/When/Then pattern
2. Include happy path test
3. Include negative tests for error scenarios
4. Include validation tests for required fields
5. Use realistic test data (not generic placeholders)
6. Include appropriate assertions based on similar tests
7. Follow TypeScript best practices
8. Use the authenticatedApi fixture for authenticated requests

Generate the complete test file code:
`;
  }

  /**
   * Get the system prompt for the LLM
   */
  private getSystemPrompt(): string {
    return `You are an expert Playwright test generator for the EY Infinity testing framework.

You generate high-quality, comprehensive API tests following these patterns:

1. **Test Structure**: Use test.describe blocks with meaningful names
2. **Test Cases**: Include @smoke, @regression tags as appropriate
3. **Fixtures**: Use authenticatedApi from advancedFixtures
4. **Assertions**: Use expect() with appropriate matchers
5. **Logging**: Use Log.info() for important steps
6. **Error Handling**: Test both success and failure scenarios
7. **Data Generation**: Use realistic, contextual test data

Your generated tests should:
- Be immediately runnable without modifications
- Follow existing codebase patterns (from context)
- Include comments explaining test intent
- Handle async operations properly
- Clean up test data when necessary

Output only valid TypeScript code that can be saved directly as a .spec.ts file.`;
  }

  /**
   * Parse the generated test into a structured format
   */
  private parseGeneratedTest(endpoint: EndpointInfo, generatedCode: string): RAGTestScript {
    // Extract test name from describe block
    const describeMatch = generatedCode.match(/test\.describe\(['"`]([^'"`]+)['"`]/);
    const testName = describeMatch ? describeMatch[1] : `${endpoint.method} ${endpoint.path} Tests`;

    // Extract individual test cases
    const testCases: RAGTestCase[] = [];
    const testRegex = /test\(['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = testRegex.exec(generatedCode)) !== null) {
      testCases.push({
        name: match[1],
        description: match[1],
        steps: [],
        assertions: [],
        tags: match[1].includes('@smoke') ? ['smoke'] : ['regression'],
      });
    }

    // Clean up code block markers if present
    const cleanCode = generatedCode.replace(/^```typescript\n?/, '').replace(/\n?```$/, '');

    return {
      name: testName,
      description: endpoint.description || `API tests for ${endpoint.method} ${endpoint.path}`,
      testCases,
      imports: [
        "import { test, expect } from '../fixtures/advancedFixtures';",
        "import Log from '../../lib/Log';",
      ],
      code: cleanCode,
    };
  }

  /**
   * Calculate confidence score based on available context
   */
  private calculateConfidence(similarTestCount: number, contextLength: number): number {
    let confidence = 0.5; // Base confidence

    // More similar tests = higher confidence
    if (similarTestCount >= 3) confidence += 0.2;
    else if (similarTestCount >= 1) confidence += 0.1;

    // More context = higher confidence
    if (contextLength > 1000) confidence += 0.2;
    else if (contextLength > 500) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Save generated test to file
   */
  async saveTest(result: RAGGenerationResult, outputDir: string): Promise<string> {
    const fileName = this.generateFileName(result.testScript.name);
    const filePath = path.join(outputDir, fileName);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Add header comment with generation metadata
    const header = `/**
 * ${result.testScript.name}
 * 
 * Generated by RAGTestGenerator
 * Confidence: ${(result.confidence * 100).toFixed(1)}%
 * Similar tests referenced: ${result.similarTests.length}
 * 
 * ${result.testScript.description}
 */

`;

    const fullCode = header + result.testScript.code;
    fs.writeFileSync(filePath, fullCode, 'utf-8');

    Log.info(`Saved RAG-enhanced test to: ${filePath}`);
    return filePath;
  }

  /**
   * Generate a safe file name from test name
   */
  private generateFileName(testName: string): string {
    return (
      testName
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase() + '.rag.spec.ts'
    );
  }

  /**
   * Re-index tests after changes
   */
  async reindexTests(testDirectory: string): Promise<number> {
    await this.vectorStore.clearCollection();
    return this.vectorStore.indexTestDirectory(testDirectory);
  }

  /**
   * Check for potential duplicate tests
   */
  async checkForDuplicates(endpoint: EndpointInfo, threshold = 0.9): Promise<boolean> {
    const results = await this.vectorStore.searchByEndpoint(endpoint.path, endpoint.method, 1);

    if (results.length > 0 && results[0].score > threshold) {
      Log.warn(`Potential duplicate test found for ${endpoint.method} ${endpoint.path}`);
      return true;
    }

    return false;
  }
}

export default RAGTestGenerator;

/**
 * VectorStoreHelper - Manages vector storage and retrieval using ChromaDB
 *
 * Provides semantic search capabilities for:
 * - Existing test cases
 * - API documentation
 * - Code snippets
 * - Historical test data
 */

import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import * as fs from 'fs';
import * as path from 'path';
import Log from '../utils/Log';

export interface VectorStoreConfig {
  collectionName?: string;
  persistDirectory?: string;
  openAIApiKey?: string;
  embeddingModel?: string;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

export interface TestDocument {
  id: string;
  testName: string;
  testCode: string;
  endpoint?: string;
  method?: string;
  description?: string;
  tags?: string[];
  filePath?: string;
}

export class VectorStoreHelper {
  private vectorStore: Chroma | null = null;
  private embeddings: OpenAIEmbeddings;
  private collectionName: string;
  private persistDirectory: string;
  private initialized = false;

  constructor(config: VectorStoreConfig = {}) {
    const apiKey = config.openAIApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key is required for VectorStoreHelper');
    }

    this.collectionName = config.collectionName || 'playwright_tests';
    this.persistDirectory = config.persistDirectory || './.chroma_db';

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: config.embeddingModel || 'text-embedding-3-small',
    });

    Log.info(`VectorStoreHelper configured with collection: ${this.collectionName}`);
  }

  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure persist directory exists
      if (!fs.existsSync(this.persistDirectory)) {
        fs.mkdirSync(this.persistDirectory, { recursive: true });
      }

      this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
        collectionName: this.collectionName,
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      });

      this.initialized = true;
      Log.info('VectorStoreHelper initialized successfully');
    } catch {
      // Collection doesn't exist, create it
      Log.info('Creating new vector store collection...');
      this.vectorStore = new Chroma(this.embeddings, {
        collectionName: this.collectionName,
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      });
      this.initialized = true;
    }
  }

  /**
   * Add test documents to the vector store
   */
  async addTestDocuments(tests: TestDocument[]): Promise<void> {
    await this.initialize();

    const documents = tests.map(
      test =>
        new Document({
          pageContent: this.formatTestForEmbedding(test),
          metadata: {
            id: test.id,
            testName: test.testName,
            endpoint: test.endpoint || '',
            method: test.method || '',
            tags: test.tags?.join(',') || '',
            filePath: test.filePath || '',
          },
        })
    );

    if (this.vectorStore) {
      await this.vectorStore.addDocuments(documents);
      Log.info(`Added ${documents.length} test documents to vector store`);
    }
  }

  /**
   * Format a test document for embedding
   */
  private formatTestForEmbedding(test: TestDocument): string {
    const parts = [
      `Test: ${test.testName}`,
      test.description ? `Description: ${test.description}` : '',
      test.endpoint ? `Endpoint: ${test.method || 'GET'} ${test.endpoint}` : '',
      test.tags?.length ? `Tags: ${test.tags.join(', ')}` : '',
      `Code:\n${test.testCode}`,
    ];

    return parts.filter(Boolean).join('\n');
  }

  /**
   * Search for similar tests
   */
  async searchSimilarTests(query: string, topK = 5): Promise<SearchResult[]> {
    await this.initialize();

    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    // Use similarity search - returns documents with scores
    const queryEmbedding = await this.embeddings.embedQuery(query);
    const results = await this.vectorStore.similaritySearchVectorWithScore(queryEmbedding, topK);

    return results.map(result => ({
      content: result[0].pageContent,
      metadata: result[0].metadata as Record<string, unknown>,
      score: result[1],
    }));
  }

  /**
   * Search for tests by endpoint
   */
  async searchByEndpoint(endpoint: string, method?: string, topK = 5): Promise<SearchResult[]> {
    const query = method ? `${method} ${endpoint}` : endpoint;
    return this.searchSimilarTests(query, topK);
  }

  /**
   * Search for tests by description/intent
   */
  async searchByIntent(intent: string, topK = 5): Promise<SearchResult[]> {
    return this.searchSimilarTests(intent, topK);
  }

  /**
   * Index existing test files from a directory
   */
  async indexTestDirectory(testDir: string): Promise<number> {
    const testFiles = this.findTestFiles(testDir);
    const tests: TestDocument[] = [];

    for (const filePath of testFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsedTests = this.parseTestFile(filePath, content);
      tests.push(...parsedTests);
    }

    if (tests.length > 0) {
      await this.addTestDocuments(tests);
    }

    Log.info(`Indexed ${tests.length} tests from ${testFiles.length} files`);
    return tests.length;
  }

  /**
   * Find all test files in a directory
   */
  private findTestFiles(dir: string): string[] {
    const files: string[] = [];

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory() && !entry.name.includes('node_modules')) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.match(/\.spec\.ts$/)) {
          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  /**
   * Parse a test file to extract individual tests
   */
  private parseTestFile(filePath: string, content: string): TestDocument[] {
    const tests: TestDocument[] = [];
    const testRegex =
      /test\(['"`]([^'"`]+)['"`],\s*async\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)^\s*\}\);/gm;

    let match;
    let index = 0;

    while ((match = testRegex.exec(content)) !== null) {
      const testName = match[1];
      const testCode = match[0];

      // Extract endpoint from test code
      const endpointMatch = testCode.match(/\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/i);
      const method = endpointMatch ? endpointMatch[1].toUpperCase() : undefined;
      const endpoint = endpointMatch ? endpointMatch[2] : undefined;

      // Extract tags
      const tagMatch = testName.match(/@(\w+)/g);
      const tags = tagMatch ? tagMatch.map(t => t.slice(1)) : [];

      tests.push({
        id: `${path.basename(filePath)}-${index++}`,
        testName,
        testCode,
        endpoint,
        method,
        tags,
        filePath,
        description: testName,
      });
    }

    return tests;
  }

  /**
   * Get relevant context for test generation
   */
  async getContextForGeneration(
    endpoint: string,
    method: string,
    description?: string
  ): Promise<string> {
    const queries = [`${method} ${endpoint}`, description || `API test for ${endpoint}`];

    const allResults: SearchResult[] = [];

    for (const query of queries) {
      const results = await this.searchSimilarTests(query, 3);
      allResults.push(...results);
    }

    // Deduplicate and sort by score
    const uniqueResults = allResults
      .filter((result, index, self) => index === self.findIndex(r => r.content === result.content))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (uniqueResults.length === 0) {
      return '';
    }

    const context = uniqueResults
      .map(r => `--- Similar Test (score: ${r.score.toFixed(3)}) ---\n${r.content}`)
      .join('\n\n');

    return `
## Relevant Existing Tests for Context

The following similar tests exist in the codebase. Use them as reference for style, patterns, and assertions:

${context}
`;
  }

  /**
   * Clear all documents from the collection
   */
  async clearCollection(): Promise<void> {
    await this.initialize();

    if (this.vectorStore) {
      // ChromaDB doesn't have a direct clear method, so we recreate the collection
      this.vectorStore = new Chroma(this.embeddings, {
        collectionName: this.collectionName,
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      });
      Log.info('Vector store collection cleared');
    }
  }
}

export default VectorStoreHelper;

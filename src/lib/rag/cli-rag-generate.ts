#!/usr/bin/env ts-node
/**
 * CLI Tool for RAG-Enhanced Test Generation
 *
 * Usage:
 *   npx ts-node src/lib/rag/cli-rag-generate.ts [options]
 *
 * Options:
 *   --index          Index existing tests into vector store
 *   --generate       Generate tests for endpoints
 *   --swagger <url>  Swagger/OpenAPI URL to generate tests from
 *   --endpoint <path> Single endpoint to generate tests for
 *   --method <method> HTTP method for single endpoint (default: GET)
 *   --output <dir>   Output directory for generated tests
 *   --reindex        Clear and re-index all tests
 *   --check-duplicates  Check for duplicate tests before generating
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { RAGTestGenerator, EndpointInfo } from './RAGTestGenerator';
import Log from '../utils/Log';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), 'config/environments/qa.env') });
dotenv.config();

interface CLIOptions {
  index: boolean;
  generate: boolean;
  swagger?: string;
  endpoint?: string;
  method: string;
  output: string;
  reindex: boolean;
  checkDuplicates: boolean;
  testDir: string;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    index: false,
    generate: false,
    method: 'GET',
    output: 'src/tests/api',
    reindex: false,
    checkDuplicates: false,
    testDir: 'src/tests',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--index':
        options.index = true;
        break;
      case '--generate':
        options.generate = true;
        break;
      case '--swagger':
        options.swagger = nextArg;
        i++;
        break;
      case '--endpoint':
        options.endpoint = nextArg;
        i++;
        break;
      case '--method':
        options.method = nextArg?.toUpperCase() || 'GET';
        i++;
        break;
      case '--output':
        options.output = nextArg;
        i++;
        break;
      case '--reindex':
        options.reindex = true;
        break;
      case '--check-duplicates':
        options.checkDuplicates = true;
        break;
      case '--test-dir':
        options.testDir = nextArg;
        i++;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
RAG-Enhanced Test Generator CLI

Usage: npx ts-node src/lib/rag/cli-rag-generate.ts [options]

Options:
  --index              Index existing tests into vector store
  --generate           Generate tests for endpoints
  --swagger <url>      Swagger/OpenAPI URL to parse endpoints from
  --endpoint <path>    Single endpoint path to generate tests for
  --method <method>    HTTP method for single endpoint (default: GET)
  --output <dir>       Output directory for generated tests (default: src/tests/api)
  --reindex            Clear and re-index all tests
  --check-duplicates   Check for duplicate tests before generating
  --test-dir <dir>     Directory containing existing tests (default: src/tests)
  --help, -h           Show this help message

Examples:
  # Index existing tests
  npx ts-node src/lib/rag/cli-rag-generate.ts --index

  # Generate test for single endpoint
  npx ts-node src/lib/rag/cli-rag-generate.ts --generate --endpoint /api/users --method GET

  # Generate tests from Swagger
  npx ts-node src/lib/rag/cli-rag-generate.ts --generate --swagger https://api.example.com/swagger.json

  # Re-index and generate
  npx ts-node src/lib/rag/cli-rag-generate.ts --reindex --generate --endpoint /api/products --method POST

Environment Variables:
  OPENAI_API_KEY       OpenAI API key (required)
  OPENAI_MODEL         Model to use (default: gpt-4o)
  CHROMA_URL           ChromaDB URL (default: http://localhost:8000)
`);
}

async function fetchSwaggerEndpoints(swaggerUrl: string): Promise<EndpointInfo[]> {
  Log.info(`Fetching Swagger from: ${swaggerUrl}`);

  const response = await fetch(swaggerUrl);
  const swagger = await response.json();

  const endpoints: EndpointInfo[] = [];

  for (const [pathKey, pathItem] of Object.entries(swagger.paths || {})) {
    const pathObj = pathItem as Record<string, unknown>;

    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      if (pathObj[method]) {
        const operation = pathObj[method] as Record<string, unknown>;

        endpoints.push({
          method: method.toUpperCase() as EndpointInfo['method'],
          path: pathKey,
          operationId: operation.operationId as string,
          description: (operation.summary || operation.description) as string,
          tags: operation.tags as string[],
          parameters: (operation.parameters as ParameterInfo[]) || [],
          requestBody: operation.requestBody as RequestBodyInfo,
          responses: operation.responses as Record<string, ResponseInfo>,
        });
      }
    }
  }

  Log.info(`Found ${endpoints.length} endpoints in Swagger`);
  return endpoints;
}

interface ParameterInfo {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  type: string;
}

interface RequestBodyInfo {
  contentType: string;
  schema: Record<string, unknown>;
  required: boolean;
}

interface ResponseInfo {
  description: string;
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (!options.index && !options.generate && !options.reindex) {
    console.log('No action specified. Use --help for usage information.');
    process.exit(1);
  }

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    console.error('Set it in your .env file or environment');
    process.exit(1);
  }

  try {
    const generator = new RAGTestGenerator({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    });

    // Initialize with test directory for indexing
    const testDirPath = path.join(process.cwd(), options.testDir);

    if (options.reindex) {
      Log.info('Re-indexing tests...');
      const count = await generator.reindexTests(testDirPath);
      Log.info(`Re-indexed ${count} tests`);
    } else if (options.index) {
      Log.info('Indexing existing tests...');
      await generator.initialize(testDirPath);
      Log.info('Indexing complete');
    } else {
      await generator.initialize();
    }

    // Generate tests
    if (options.generate) {
      let endpoints: EndpointInfo[] = [];

      if (options.swagger) {
        endpoints = await fetchSwaggerEndpoints(options.swagger);
      } else if (options.endpoint) {
        endpoints = [
          {
            method: options.method as EndpointInfo['method'],
            path: options.endpoint,
            description: `API endpoint ${options.method} ${options.endpoint}`,
          },
        ];
      } else {
        console.error('Error: Specify --swagger or --endpoint for generation');
        process.exit(1);
      }

      // Check for duplicates if requested
      if (options.checkDuplicates) {
        const filteredEndpoints: EndpointInfo[] = [];

        for (const endpoint of endpoints) {
          const isDuplicate = await generator.checkForDuplicates(endpoint);
          if (!isDuplicate) {
            filteredEndpoints.push(endpoint);
          } else {
            Log.warn(`Skipping duplicate: ${endpoint.method} ${endpoint.path}`);
          }
        }

        endpoints = filteredEndpoints;
        Log.info(`${endpoints.length} endpoints after duplicate check`);
      }

      // Generate tests
      const outputDir = path.join(process.cwd(), options.output);
      let generatedCount = 0;

      for (const endpoint of endpoints) {
        try {
          Log.info(`Generating test for ${endpoint.method} ${endpoint.path}...`);
          const result = await generator.generateTest(endpoint);
          await generator.saveTest(result, outputDir);
          generatedCount++;

          Log.info(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
          Log.info(`  Similar tests: ${result.similarTests.join(', ') || 'None'}`);
        } catch (error) {
          Log.error(`Failed to generate test for ${endpoint.method} ${endpoint.path}: ${error}`);
        }
      }

      Log.info(`\nGenerated ${generatedCount} RAG-enhanced tests`);
      Log.info(`Output directory: ${outputDir}`);
    }

    Log.info('Done!');
  } catch (error) {
    Log.error(`Error: ${error}`);
    process.exit(1);
  }
}

main().catch(console.error);

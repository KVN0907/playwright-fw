#!/usr/bin/env node
/**
 * Swagger CLI Tool
 * Generate API helpers from Swagger/OpenAPI specification
 *
 * Note: This is a standalone CLI tool that fetches swagger specs directly
 * without requiring Playwright's APIRequestContext.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';

const args = process.argv.slice(2);

interface OpenAPISpec {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  paths?: Record<string, Record<string, unknown>>;
}

function printUsage() {
  console.log(`
📖 Swagger API Helper Generator

Usage:
  npm run swagger:generate -- <swagger-url> [options]

Options:
  --output <dir>        Output directory (default: ./src/tests/api)
  --service <name>      Service name (default: auto-detected from URL)
  --help                Show this help message

Examples:
  npm run swagger:generate -- https://api.example.com/swagger.json
  npm run swagger:generate -- http://localhost:8091/security-service-api.yaml
  npm run swagger:generate -- https://api.example.com/swagger.json --service myservice
  npm run swagger:generate -- http://localhost:3000/api-docs

Environment Variables:
  SWAGGER_URL          Swagger/OpenAPI specification URL
  SWAGGER_OUTPUT_DIR   Output directory for generated files
`);
}

async function fetchSwaggerSpec(url: string): Promise<OpenAPISpec> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client
      .get(url, { rejectUnauthorized: false }, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Failed to parse swagger spec: ${data.substring(0, 100)}`));
          }
        });
      })
      .on('error', reject);
  });
}

function generateApiHelpers(spec: OpenAPISpec, outputDir: string, serviceName: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const endpoints: Array<{ path: string; method: string; operationId?: string; summary?: string }> =
    [];

  if (spec.paths) {
    for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem as Record<string, unknown>)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          const op = operation as Record<string, unknown>;
          endpoints.push({
            path: pathStr,
            method: method.toUpperCase(),
            operationId: op.operationId as string,
            summary: op.summary as string,
          });
        }
      }
    }
  }

  // Generate endpoints JSON file
  const outputFile = path.join(outputDir, `${serviceName}-endpoints.json`);
  const exportData = {
    service: serviceName,
    timestamp: new Date().toISOString(),
    info: spec.info,
    totalEndpoints: endpoints.length,
    endpoints,
  };

  fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));
  console.log(`📄 Generated: ${outputFile}`);
  console.log(`   Total endpoints: ${endpoints.length}`);
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const swaggerUrl = args[0] || process.env.SWAGGER_URL;
  if (!swaggerUrl) {
    console.error('❌ Error: Swagger URL is required\n');
    printUsage();
    process.exit(1);
  }

  const outputIndex = args.indexOf('--output');
  const outputDir =
    (outputIndex !== -1 && args[outputIndex + 1]) ||
    process.env.SWAGGER_OUTPUT_DIR ||
    path.resolve(process.cwd(), 'src/tests/api');

  const serviceIndex = args.indexOf('--service');
  const serviceName =
    serviceIndex !== -1 && args[serviceIndex + 1] ? args[serviceIndex + 1] : 'api-service';

  console.log('🚀 Starting Swagger API File Generation\n');
  console.log(`📍 Swagger URL: ${swaggerUrl}`);
  console.log(`📂 Output Directory: ${outputDir}`);
  console.log(`🏷️  Service Name: ${serviceName}\n`);

  try {
    console.log('📥 Fetching swagger specification...');
    const spec = await fetchSwaggerSpec(swaggerUrl);

    console.log(`✅ Spec fetched: ${spec.info?.title || 'Unknown'} v${spec.info?.version || '?'}`);

    generateApiHelpers(spec, outputDir, serviceName);

    console.log('\n✅ API helpers generated successfully!');
    console.log(`\n📂 Check output: ${outputDir}`);
  } catch (error) {
    console.error('\n❌ Error generating API helpers:', error);
    process.exit(1);
  }
}

main();

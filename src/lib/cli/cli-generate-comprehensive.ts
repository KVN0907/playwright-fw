#!/usr/bin/env ts-node

/**
 * CLI for Enhanced Comprehensive Test Generation
 * Generates API tests with ZERO manual intervention
 *
 * Features:
 * - Happy path tests for all endpoints
 * - Negative tests from BadRequestAlertException
 * - Validation tests from DTO annotations
 * - Authorization tests from UnauthorizedAlertException
 *
 * Usage:
 *   npm run generate:comprehensive
 *   npm run generate:comprehensive -- --service security
 *   npm run generate:comprehensive -- --service gateway --service security
 */

import * as path from 'path';
import { EnhancedTestGenerator } from '../generators/EnhancedTestGenerator';

const args = process.argv.slice(2);

interface Config {
  services: string[];
  outputDir: string;
}

const config: Config = {
  services: [],
  outputDir: './src/tests',
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--service' || arg === '-s') {
    const value = args[i + 1];
    if (value && !value.startsWith('--')) {
      config.services.push(value);
      i++;
    }
  } else if (arg === '--output' || arg === '-o') {
    config.outputDir = args[i + 1];
    i++;
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }
}

// Default services if none specified
if (config.services.length === 0) {
  config.services = ['security', 'gateway', 'infinityService', 'infinityConnector'];
}

function printHelp() {
  console.log(`
🎯 Enhanced Comprehensive Test Generator
========================================
Generates API tests with ZERO manual intervention by parsing:
- Java Controllers (endpoints, parameters)
- BadRequestAlertException (negative tests)  
- UnauthorizedAlertException (auth tests)
- DTO validation annotations (@NotNull, @Size, etc.)

USAGE:
  npm run generate:comprehensive [OPTIONS]

OPTIONS:
  --service, -s <name>    Service to generate tests for (can be repeated)
                          Available: security, gateway, infinityService, infinityConnector
                          Default: all services

  --output, -o <path>     Output directory for generated tests
                          Default: ./src/tests

  --help, -h              Show this help message

EXAMPLES:
  # Generate for all services
  npm run generate:comprehensive

  # Generate for specific service
  npm run generate:comprehensive -- --service security

  # Generate for multiple services
  npm run generate:comprehensive -- --service security --service gateway

OUTPUT:
  For each controller, generates:
  - Happy path tests (all endpoints)
  - Negative tests (from exceptions)
  - Validation tests (from DTO annotations)
  - Auth tests (unauthorized scenarios)

  Files: src/tests/api/{EntityName}.comprehensive.spec.ts
`);
}

async function main() {
  console.log('🚀 Enhanced Comprehensive Test Generator\n');
  console.log(`Services: ${config.services.join(', ')}`);
  console.log(`Output: ${config.outputDir}\n`);

  const baseServicePath = path.resolve(__dirname, '../../../../service');

  for (const service of config.services) {
    const servicePath = path.join(baseServicePath, service, 'src/main/java');
    const outputPath = path.resolve(__dirname, '..', config.outputDir.replace('./src/', 'src/'));

    console.log(`\n📦 Processing service: ${service}`);
    console.log(`   Path: ${servicePath}`);

    const generator = new EnhancedTestGenerator({
      servicePath,
      outputPath,
      includeNegativeTests: true,
      includeValidationTests: true,
      includeAuthTests: true,
    });

    try {
      await generator.generateAll();
    } catch (error) {
      console.error(`❌ Error processing ${service}: ${error}`);
    }
  }

  console.log('\n✅ Generation complete!');
  console.log('\nNext steps:');
  console.log('  1. Review generated tests in src/tests/api/');
  console.log('  2. Configure environment variables in config/environments/');
  console.log('  3. Run tests: npm run test:api');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

#!/usr/bin/env ts-node

/**
 * CLI for Hybrid Test Generation
 * Generates Playwright tests from Java controllers, Angular components, and ADO work items
 *
 * Usage:
 *   npm run generate:hybrid -- --controllers --components --workitems
 *   npm run generate:hybrid -- --controllers ../../../service/security/src/main/java/com/ey/compliance/service/web/rest
 *   npm run generate:hybrid -- --component ../../../portal/admin/src/main/webapp/app/compliance
 */

import { HybridTestGenerator } from './HybridTestGenerator';
import { TestScriptConfig } from './TestScriptGenerator';
import * as fs from 'fs';
import * as path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const config: {
  controllers: string[];
  components: string[];
  workItems: boolean;
  outputDir: string;
} = {
  controllers: [],
  components: [],
  workItems: false,
  outputDir: './src/tests/generated',
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--controllers' || arg === '-c') {
    const value = args[i + 1];
    if (value && !value.startsWith('--')) {
      config.controllers.push(value);
      i++;
    } else {
      // Use default path
      config.controllers.push('../../../service');
    }
  } else if (arg === '--components' || arg === '-comp') {
    const value = args[i + 1];
    if (value && !value.startsWith('--')) {
      config.components.push(value);
      i++;
    } else {
      // Use default path
      config.components.push('../../../portal/admin');
    }
  } else if (arg === '--workitems' || arg === '-w') {
    config.workItems = true;
  } else if (arg === '--output' || arg === '-o') {
    config.outputDir = args[i + 1];
    i++;
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }
}

function printHelp() {
  console.log(`
🎭 Hybrid Test Generator - Generate Playwright tests from multiple sources

USAGE:
  npm run generate:hybrid [OPTIONS]

OPTIONS:
  --controllers, -c [path]    Generate API tests from Java controllers
                              Default: ../../../service
                              
  --components, -comp [path]  Generate UI tests from Angular components  
                              Default: ../../../portal/admin
                              
  --workitems, -w            Generate tests from ADO work items
                              Requires ADO configuration
  
  --output, -o <path>        Output directory for generated tests
                              Default: ./src/tests/generated
  
  --help, -h                 Show this help message

EXAMPLES:
  # Generate API tests from all controllers
  npm run generate:hybrid -- --controllers

  # Generate from specific controller directory
  npm run generate:hybrid -- --controllers ../../../service/security/src/main/java

  # Generate UI tests from components
  npm run generate:hybrid -- --components

  # Generate both API and UI tests
  npm run generate:hybrid -- --controllers --components

  # Specify custom output directory
  npm run generate:hybrid -- --controllers --output ./src/tests/my-generated-tests

FRAMEWORK:
  Generated tests follow the existing Playwright framework patterns:
  - Test specs use Given/When/Then format
  - Page objects handle technical implementation
  - Advanced fixtures for dependency injection
  - Runtime data system support

OUTPUT:
  API Tests: {output}/api/generated/*.api.spec.ts
  UI Tests: {output}/ui/generated/*.ui.spec.ts  
  Integration: {output}/integration/generated/*.integration.spec.ts
`);
}

async function main() {
  console.log('🚀 Hybrid Test Generator\n');

  if (config.controllers.length === 0 && config.components.length === 0 && !config.workItems) {
    console.log('❌ No generation options specified. Use --help for usage information.');
    process.exit(1);
  }

  // Find Java controller files
  const controllerFiles: string[] = [];
  for (const controllerPath of config.controllers) {
    const absolutePath = path.resolve(__dirname, controllerPath);
    console.log(`🔍 Searching for Java controllers in: ${absolutePath}`);

    const files = findFiles(absolutePath, 'Controller.java', ['test', 'target']);
    controllerFiles.push(...files);
    console.log(`   Found ${files.length} controllers`);
  }

  // Find Angular component files
  const componentFiles: string[] = [];
  for (const componentPath of config.components) {
    const absolutePath = path.resolve(__dirname, componentPath);
    console.log(`🔍 Searching for Angular components in: ${absolutePath}`);

    const files = findFiles(absolutePath, '.component.ts', ['node_modules', 'dist', '.spec.ts']);
    componentFiles.push(...files);
    console.log(`   Found ${files.length} components`);
  }

  /**
   * Recursively find files matching pattern
   */
  function findFiles(dir: string, pattern: string, excludePatterns: string[] = []): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
      return results;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Check if should be excluded
      const shouldExclude = excludePatterns.some(
        pattern => filePath.includes(pattern) || file.includes(pattern)
      );

      if (shouldExclude) {
        continue;
      }

      if (stat.isDirectory()) {
        results.push(...findFiles(filePath, pattern, excludePatterns));
      } else if (file.endsWith(pattern) || file.includes(pattern)) {
        results.push(filePath);
      }
    }

    return results;
  }

  // Initialize generator
  const testScriptConfig: TestScriptConfig = {
    outputDirectory: path.resolve(__dirname, config.outputDir),
    testFramework: 'playwright',
    promptFilePath: path.resolve(__dirname, '../.github/generate_tests.prompt.md'),
    aiProvider: 'vscode',
    includePageObjects: true,
    basePageObjectsPath: './src/pages',
    testSpecsPath: './src/tests',
  };

  const generator = new HybridTestGenerator(testScriptConfig, {
    javaControllers: controllerFiles,
    angularComponents: componentFiles,
    openApiSpecs: [],
  });

  // Generate tests
  console.log('\n📝 Generating tests...\n');
  const result = await generator.generateAll();

  // Print summary
  console.log('\n✅ Generation Complete!\n');
  console.log('Summary:');
  console.log(`  Total Tests: ${result.summary.totalTests}`);
  console.log(`  API Tests: ${result.summary.apiTestsCount}`);
  console.log(`  UI Tests: ${result.summary.uiTestsCount}`);
  console.log(`  Integration Tests: ${result.summary.integrationTestsCount}`);
  console.log(`  Controllers Processed: ${result.summary.controllers}`);
  console.log(`  Components Processed: ${result.summary.components}`);
  console.log(`\nOutput Directory: ${testScriptConfig.outputDirectory}`);

  // List generated files
  if (result.apiTests.length > 0) {
    console.log('\n📡 API Test Files:');
    result.apiTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ${path.basename(test.testSpecFile)}`);
    });
  }

  if (result.uiTests.length > 0) {
    console.log('\n🎨 UI Test Files:');
    result.uiTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ${path.basename(test.testSpecFile)}`);
    });
  }

  console.log('\n✨ Done! Run tests with: npm test');
}

// Run CLI
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

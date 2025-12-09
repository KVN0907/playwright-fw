#!/usr/bin/env ts-node

/**
 * Generate API tests from ALL controllers in the project
 * Scans gateway, security, and compliancemanager services
 */

import { HybridTestGenerator } from './HybridTestGenerator';
import { TestScriptConfig } from './TestScriptGenerator';
import * as path from 'path';
import * as fs from 'fs';

async function findAllControllers(): Promise<string[]> {
  const controllers: string[] = [];

  const servicePaths = [
    '../../../../service/gateway/src/main/java/com/ey/ct/wlms/web/rest',
    '../../../../service/security/src/main/java/com/ey/compliance/service/web/rest',
    '../../../../service/compliancemanager/src/main/java/com/ey/compliance/service/web/rest',
  ];

  for (const servicePath of servicePaths) {
    const absolutePath = path.resolve(__dirname, servicePath);

    if (!fs.existsSync(absolutePath)) {
      console.log(`⚠️  Path not found: ${absolutePath}`);
      continue;
    }

    const files = fs.readdirSync(absolutePath);
    const controllerFiles = files
      .filter(f => f.endsWith('Controller.java'))
      .map(f => path.join(absolutePath, f));

    controllers.push(...controllerFiles);
  }

  return controllers;
}

async function main() {
  console.log('🎭 Hybrid Test Generator - Generate All Controllers\n');

  // Configuration
  const testScriptConfig: TestScriptConfig = {
    outputDirectory: path.resolve(__dirname, '../tests'),
    testFramework: 'playwright',
    promptFilePath: path.resolve(__dirname, '../../.github/generate_tests.prompt.md'),
    aiProvider: 'vscode',
    includePageObjects: true,
    basePageObjectsPath: '../pages',
    testSpecsPath: '../tests',
  };

  // Find all controllers
  console.log('🔍 Scanning for controllers...\n');
  const controllers = await findAllControllers();

  if (controllers.length === 0) {
    console.log('❌ No controllers found!');
    process.exit(1);
  }

  console.log(`📦 Found ${controllers.length} controllers:\n`);
  controllers.forEach((c, i) => {
    const name = path.basename(c);
    const service = c.includes('gateway')
      ? '[Gateway]'
      : c.includes('security')
        ? '[Security]'
        : '[Compliance]';
    console.log(`   ${i + 1}. ${service} ${name}`);
  });

  console.log('\n⚙️  Generating tests...\n');

  // Initialize generator
  const generator = new HybridTestGenerator(testScriptConfig, {
    javaControllers: controllers,
    angularComponents: [],
    openApiSpecs: [],
  });

  // Generate tests
  const result = await generator.generateAll();

  // Show results
  console.log('\n✅ Generation Complete!\n');
  console.log('📊 Summary:');
  console.log(`   Controllers Processed: ${result.summary.controllers}`);
  console.log(`   API Test Files: ${result.summary.apiTestsCount}`);
  console.log(`   Total Test Cases: ${result.summary.totalTests}`);

  if (result.apiTests.length > 0) {
    console.log('\n📡 Generated API Test Files:');
    result.apiTests.forEach((test, index) => {
      const fileName = path.basename(test.testSpecFile);
      console.log(`   ${index + 1}. ${fileName} (${test.testCases.length} tests)`);
    });
  }

  console.log('\n✨ Done! All tests generated successfully.\n');
  console.log('📝 To run tests:');
  console.log('   npm test -- --project=api');
  console.log('   npm test -- --project=api --grep="LocationController"');
}

// Run
main().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

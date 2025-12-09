#!/usr/bin/env ts-node

/**
 * POC Test - Generate tests from LocationController.java
 * Simple demonstration of hybrid test generation
 */

import { HybridTestGenerator } from '../generators/HybridTestGenerator';
import { TestScriptConfig } from '../generators/TestScriptGenerator';
import * as path from 'path';

async function main() {
  console.log('🎭 Hybrid Test Generator - POC\n');
  console.log('📝 Generating API tests from LocationController.java\n');

  // Configuration
  const testScriptConfig: TestScriptConfig = {
    outputDirectory: path.resolve(__dirname, '../tests'), // Generate directly in tests folder
    testFramework: 'playwright',
    promptFilePath: path.resolve(__dirname, '../../.github/generate_tests.prompt.md'),
    aiProvider: 'vscode',
    includePageObjects: true,
    basePageObjectsPath: '../pages',
    testSpecsPath: '../tests',
  };

  // Path to LocationController.java
  const locationControllerPath = path.resolve(
    __dirname,
    '../../../../service/compliancemanager/src/main/java/com/ey/compliance/service/web/rest/LocationController.java'
  );

  console.log(`📁 Controller: ${locationControllerPath}\n`);

  // Initialize generator
  const generator = new HybridTestGenerator(testScriptConfig, {
    javaControllers: [locationControllerPath],
    angularComponents: [],
    openApiSpecs: [],
  });

  // Generate tests
  console.log('⚙️  Parsing controller and generating tests...\n');
  const result = await generator.generateAll();

  // Show results
  console.log('✅ Generation Complete!\n');
  console.log('📊 Summary:');
  console.log(`   Total Tests Generated: ${result.summary.totalTests}`);
  console.log(`   API Test Files: ${result.summary.apiTestsCount}`);
  console.log(`   Controllers Processed: ${result.summary.controllers}\n`);

  if (result.apiTests.length > 0) {
    console.log('📡 Generated API Test File:');
    result.apiTests.forEach(test => {
      console.log(`   ✓ ${test.testSpecFile}`);
      console.log(`     Test Cases: ${test.testCases.length}`);
      console.log(`     Endpoints covered:`);
      test.testCases.forEach((tc, index) => {
        console.log(`       ${index + 1}. ${tc.testName}`);
      });
    });
  }

  console.log('\n✨ Done! Check the generated file to see the tests.\n');
}

// Run POC
main().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

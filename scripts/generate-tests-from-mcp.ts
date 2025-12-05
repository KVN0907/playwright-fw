#!/usr/bin/env ts-node
/**
 * MCP-Assisted Test Generation
 *
 * Use this after discovering work items via Droid MCP
 *
 * Workflow:
 * 1. Use Droid: "Find work items in eycompliancemanager with acceptance criteria"
 * 2. Copy work item IDs from the results
 * 3. Run this script: npm run generate:from-mcp -- 12345 67890 11223
 *
 * Example:
 *   npm run generate:from-mcp -- 252423 240490 240426
 */

import { ADOHelper, createADOHelperFromEnv } from '../src/lib/ADOHelper';
import * as path from 'path';

const workItemIds = process.argv.slice(2).map(id => parseInt(id, 10));

if (workItemIds.length === 0 || workItemIds.some(isNaN)) {
  console.log('❌ Please provide valid work item IDs\n');
  console.log('Usage: npm run generate:from-mcp -- <workItemId1> <workItemId2> ...\n');
  console.log('📋 MCP Discovery Workflow:');
  console.log('  1. Open Droid CLI');
  console.log('  2. Ask: "Find work items with acceptance criteria in eycompliancemanager"');
  console.log('  3. Copy work item IDs from the results');
  console.log('  4. Run: npm run generate:from-mcp -- <IDs>\n');
  console.log('Example:');
  console.log('  npm run generate:from-mcp -- 252423 240490 240426\n');
  process.exit(1);
}

async function main() {
  console.log('🚀 MCP-Assisted Test Generation\n');
  console.log('═'.repeat(60));
  console.log(`📋 Work Item IDs: ${workItemIds.join(', ')}`);
  console.log(`📁 Organization: ${process.env.ADO_ORGANIZATION || 'Not set'}`);
  console.log(`📂 Project: ${process.env.ADO_PROJECT || 'Not set'}`);
  console.log('═'.repeat(60));
  console.log();

  // Validate environment variables
  if (!process.env.ADO_ORGANIZATION || !process.env.ADO_PROJECT || !process.env.ADO_PAT) {
    console.error('❌ Missing ADO environment variables!');
    console.error('   Required: ADO_ORGANIZATION, ADO_PROJECT, ADO_PAT');
    console.error('   Check your .env file or config/environments/ado.env');
    process.exit(1);
  }

  try {
    // Create ADO helper from environment
    const helper = createADOHelperFromEnv();

    // Test connection
    console.log('🔌 Testing Azure DevOps connection...');
    const connected = await helper.testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to Azure DevOps');
      process.exit(1);
    }

    // Initialize test generator
    console.log('⚙️  Initializing test generator...');
    helper.initializeGenerator({
      outputDirectory: path.resolve(__dirname, '../src/tests/generated'),
      testFramework: 'playwright',
      promptFilePath: path.resolve(__dirname, '../.github/generate_tests.prompt.md'),
      includePageObjects: true,
      basePageObjectsPath: './src/pages',
      testSpecsPath: './src/tests',
    });

    // Generate tests
    console.log(`\n📝 Generating tests for ${workItemIds.length} work items...\n`);
    const results = await helper.generateTestsFromWorkItems(workItemIds);

    // Display results
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Generation Results:');
    console.log('═'.repeat(60) + '\n');

    let successCount = 0;
    let failCount = 0;

    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const state = result.workItem.state;
      const type = result.workItem.workItemType;

      console.log(`${status} Work Item #${result.workItem.id}`);
      console.log(`   Title: ${result.workItem.title}`);
      console.log(`   Type: ${type} | State: ${state}`);

      if (result.success) {
        console.log(`   Output: ${result.generatedScript.filePath}`);
        successCount++;
      } else {
        console.log(`   Error: ${result.error}`);
        failCount++;
      }
      console.log();
    });

    console.log('═'.repeat(60));
    console.log('📈 Summary:');
    console.log(`   Total: ${results.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log('═'.repeat(60));

    if (successCount > 0) {
      console.log('\n✨ Next Steps:');
      console.log('  1. Review generated tests in src/tests/generated/');
      console.log('  2. Update page objects if needed in src/pages/');
      console.log('  3. Run tests: npm test');
      console.log('  4. Commit changes to version control');
    }

    if (failCount > 0) {
      console.log('\n⚠️  Some work items failed:');
      console.log('   - Check if they have acceptance criteria defined');
      console.log('   - Verify work item IDs are correct');
      console.log('   - Ensure you have read permissions');
    }
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    console.error('\nTroubleshooting:');
    console.error('  - Verify your PAT token has correct permissions');
    console.error('  - Check work item IDs exist in the project');
    console.error('  - Ensure network connectivity to Azure DevOps');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

#!/usr/bin/env ts-node
/**
 * Sprint Test Coverage Analysis
 *
 * Analyzes work items to determine test automation coverage readiness
 *
 * Workflow:
 * 1. Use Droid MCP: "Get current sprint work items for eycompliancemanager"
 * 2. Copy work item IDs from results
 * 3. Run: npm run sprint:coverage -- 12345 67890 ...
 *
 * Or analyze work items assigned to you:
 *   npm run sprint:coverage -- --my-items
 *
 * Example:
 *   npm run sprint:coverage -- 252423 240490 240426 232185 232117
 */

import { ADOHelper, createADOHelperFromEnv, ADOWorkItem } from '../src/lib/ADOHelper';

const args = process.argv.slice(2);

async function main() {
  console.log('📊 Sprint Test Coverage Analysis\n');
  console.log('═'.repeat(70));
  console.log(`📁 Organization: ${process.env.ADO_ORGANIZATION || 'Not set'}`);
  console.log(`📂 Project: ${process.env.ADO_PROJECT || 'Not set'}`);
  console.log('═'.repeat(70));
  console.log();

  // Validate environment
  if (!process.env.ADO_ORGANIZATION || !process.env.ADO_PROJECT || !process.env.ADO_PAT) {
    console.error('❌ Missing ADO environment variables!');
    console.error('   Required: ADO_ORGANIZATION, ADO_PROJECT, ADO_PAT');
    process.exit(1);
  }

  try {
    const helper = createADOHelperFromEnv();

    // Test connection
    console.log('🔌 Testing Azure DevOps connection...');
    const connected = await helper.testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to Azure DevOps');
      process.exit(1);
    }

    // Get work item IDs
    let workItemIds: number[] = [];

    if (args.includes('--my-items') || args.length === 0) {
      console.log('📋 Using sample work items (assigned to current user)...');
      console.log('   Tip: Use Droid MCP to get sprint-specific work items!\n');
      // These are from the "my work items" query
      workItemIds = [252423, 240490, 240426, 232185, 232117];
    } else {
      workItemIds = args.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    }

    if (workItemIds.length === 0) {
      console.error('❌ No valid work item IDs provided\n');
      console.error('Usage:');
      console.error('  npm run sprint:coverage -- <workItemId1> <workItemId2> ...');
      console.error('  npm run sprint:coverage -- --my-items\n');
      console.error('Discovery with MCP:');
      console.error('  1. Use Droid: "Get current sprint work items"');
      console.error('  2. Copy work item IDs');
      console.error('  3. Run: npm run sprint:coverage -- <IDs>');
      process.exit(1);
    }

    console.log(`🔍 Analyzing ${workItemIds.length} work items...\n`);

    // Fetch all work items
    const workItems = await helper.fetchWorkItems(workItemIds);

    // Categorize work items
    const withCriteria = workItems.filter(
      wi => wi.acceptanceCriteria && wi.acceptanceCriteria.trim() !== ''
    );

    const withoutCriteria = workItems.filter(
      wi => !wi.acceptanceCriteria || wi.acceptanceCriteria.trim() === ''
    );

    // Group by type
    const byType = workItems.reduce(
      (acc, wi) => {
        acc[wi.workItemType] = (acc[wi.workItemType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by state
    const byState = workItems.reduce(
      (acc, wi) => {
        acc[wi.state] = (acc[wi.state] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Display results
    console.log('═'.repeat(70));
    console.log('📈 COVERAGE SUMMARY');
    console.log('═'.repeat(70));
    console.log();

    console.log('📊 Overall Statistics:');
    console.log(`   Total Work Items: ${workItems.length}`);
    console.log(
      `   With Acceptance Criteria: ${withCriteria.length} (${Math.round((withCriteria.length / workItems.length) * 100)}%)`
    );
    console.log(
      `   Missing Criteria: ${withoutCriteria.length} (${Math.round((withoutCriteria.length / workItems.length) * 100)}%)`
    );
    console.log();

    console.log('📋 By Work Item Type:');
    Object.entries(byType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    console.log();

    console.log('📌 By State:');
    Object.entries(byState)
      .sort(([, a], [, b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count}`);
      });
    console.log();

    // Show work items ready for test generation
    if (withCriteria.length > 0) {
      console.log('═'.repeat(70));
      console.log('✅ READY FOR TEST GENERATION');
      console.log('═'.repeat(70));
      console.log();

      withCriteria.forEach(wi => {
        console.log(`📝 #${wi.id} - ${wi.title}`);
        console.log(`   Type: ${wi.workItemType} | State: ${wi.state}`);
        if (wi.assignedTo) {
          console.log(`   Assigned: ${wi.assignedTo}`);
        }
        if (wi.tags && wi.tags.length > 0) {
          console.log(`   Tags: ${wi.tags.join(', ')}`);
        }
        console.log();
      });

      console.log('🚀 Next Step:');
      console.log(`   npm run generate:from-mcp -- ${withCriteria.map(wi => wi.id).join(' ')}`);
      console.log();
    }

    // Show work items needing attention
    if (withoutCriteria.length > 0) {
      console.log('═'.repeat(70));
      console.log('⚠️  NEEDS ACCEPTANCE CRITERIA');
      console.log('═'.repeat(70));
      console.log();

      withoutCriteria.forEach(wi => {
        console.log(`❌ #${wi.id} - ${wi.title}`);
        console.log(`   Type: ${wi.workItemType} | State: ${wi.state}`);
        console.log(
          `   URL: https://dev.azure.com/${process.env.ADO_ORGANIZATION}/${process.env.ADO_PROJECT}/_workitems/edit/${wi.id}`
        );
        console.log();
      });

      console.log('💡 Action Required:');
      console.log('   1. Add acceptance criteria to these work items');
      console.log('   2. Re-run this analysis');
      console.log('   3. Generate tests for items with criteria');
      console.log();
    }

    // Calculate automation readiness score
    const readinessScore = Math.round((withCriteria.length / workItems.length) * 100);
    const readinessEmoji = readinessScore >= 80 ? '🟢' : readinessScore >= 50 ? '🟡' : '🔴';

    console.log('═'.repeat(70));
    console.log(`${readinessEmoji} AUTOMATION READINESS SCORE: ${readinessScore}%`);
    console.log('═'.repeat(70));
    console.log();

    if (readinessScore < 80) {
      console.log('📌 Recommendations:');
      console.log(`   - Add acceptance criteria to ${withoutCriteria.length} work items`);
      console.log('   - Target: 80%+ coverage for effective sprint automation');
      console.log('   - Use Droid MCP to explore and update work items efficiently');
    } else {
      console.log('🎉 Great job! Your sprint has excellent test automation readiness.');
    }
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    console.error('\nTroubleshooting:');
    console.error('  - Verify your PAT token permissions');
    console.error('  - Check work item IDs exist in the project');
    console.error('  - Ensure network connectivity to Azure DevOps');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

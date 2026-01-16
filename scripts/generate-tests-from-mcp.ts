#!/usr/bin/env ts-node
/**
 * MCP-Assisted Test Generation
 *
 * DEPRECATED: This script is no longer needed as MCP provides direct ADO integration.
 *
 * Instead, use Droid MCP directly:
 *
 * 1. Get work item details:
 *    "Get work item #12345 from eycompliancemanager"
 *
 * 2. Generate tests from acceptance criteria:
 *    "Generate Playwright tests for work item #12345"
 *
 * 3. Batch operations:
 *    "Find all user stories in Sprint 5 and generate test specs"
 *
 * MCP Tools Available:
 * - ado___wit_get_work_item: Get single work item
 * - ado___wit_get_work_items_batch_by_ids: Get multiple work items
 * - ado___wit_my_work_items: Get items assigned to you
 * - ado___search_workitem: Search work items
 * - ado___wit_get_query_results_by_id: Run saved queries
 *
 * Example MCP Commands:
 *   "Get work items 252423, 240490, 240426 from eycompliancemanager"
 *   "Show acceptance criteria for work item #252423"
 *   "Generate API tests for story #252423 based on its acceptance criteria"
 */

console.log('═'.repeat(60));
console.log('📋 MCP-Assisted Test Generation');
console.log('═'.repeat(60));
console.log();
console.log('This script has been deprecated in favor of direct MCP usage.');
console.log();
console.log('🚀 Use Droid MCP directly instead:');
console.log();
console.log('  1. Get work item details:');
console.log('     "Get work item #12345 from eycompliancemanager"');
console.log();
console.log('  2. Generate tests from acceptance criteria:');
console.log('     "Generate Playwright tests for work item #12345"');
console.log();
console.log('  3. Batch operations:');
console.log('     "Find all user stories in Sprint 5 and generate test specs"');
console.log();
console.log('═'.repeat(60));
console.log('📖 Available MCP Tools:');
console.log('═'.repeat(60));
console.log('  • ado___wit_get_work_item        - Get single work item');
console.log('  • ado___wit_get_work_items_batch - Get multiple work items');
console.log('  • ado___wit_my_work_items        - Get your assigned items');
console.log('  • ado___search_workitem          - Search work items');
console.log('  • ado___wit_get_query_results    - Run saved queries');
console.log('═'.repeat(60));

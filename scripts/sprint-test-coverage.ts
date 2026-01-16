#!/usr/bin/env ts-node
/**
 * Sprint Test Coverage Analysis
 *
 * DEPRECATED: This script is no longer needed as MCP provides direct ADO integration.
 *
 * Instead, use Droid MCP directly:
 *
 * 1. Get sprint work items:
 *    "Get current sprint work items for eycompliancemanager"
 *
 * 2. Analyze coverage:
 *    "Which work items in Sprint 5 have acceptance criteria?"
 *
 * 3. Find items missing criteria:
 *    "Find user stories without acceptance criteria in current sprint"
 *
 * MCP Tools Available:
 * - ado___wit_get_work_items_for_iteration: Get sprint work items
 * - ado___work_list_team_iterations: List sprints
 * - ado___wit_my_work_items: Get items assigned to you
 * - ado___search_workitem: Search work items
 *
 * Example MCP Commands:
 *   "Get all work items for current iteration in eycompliancemanager"
 *   "Show me stories assigned to me with acceptance criteria"
 *   "List all bugs in Sprint 5 that need test coverage"
 */

console.log('═'.repeat(70));
console.log('📊 Sprint Test Coverage Analysis');
console.log('═'.repeat(70));
console.log();
console.log('This script has been deprecated in favor of direct MCP usage.');
console.log();
console.log('🚀 Use Droid MCP directly instead:');
console.log();
console.log('  1. Get sprint work items:');
console.log('     "Get current sprint work items for eycompliancemanager"');
console.log();
console.log('  2. Analyze coverage:');
console.log('     "Which work items in Sprint 5 have acceptance criteria?"');
console.log();
console.log('  3. Find items missing criteria:');
console.log('     "Find user stories without acceptance criteria in current sprint"');
console.log();
console.log('═'.repeat(70));
console.log('📖 Available MCP Tools:');
console.log('═'.repeat(70));
console.log('  • ado___wit_get_work_items_for_iteration - Get sprint work items');
console.log('  • ado___work_list_team_iterations        - List sprints/iterations');
console.log('  • ado___wit_my_work_items                - Get your assigned items');
console.log('  • ado___search_workitem                  - Search work items');
console.log('  • ado___wit_get_work_item                - Get work item details');
console.log('═'.repeat(70));

/**
 * ADOTestGenerator - Main orchestrator to fetch AC from ADO and generate test scripts
 * Simplified utility focused on real-world ADO integration
 */

import { ADOIntegration, ADOWorkItem, ADOConfig } from './ADOIntegration';
import { TestScriptGenerator, TestScriptConfig, GeneratedTestScript } from '../TestScriptGenerator';
import Log from '../Log';
import * as path from 'path';

export interface ADOTestGeneratorConfig {
  ado: ADOConfig;
  testScript: TestScriptConfig;
}

export interface GenerationResult {
  workItems: readonly ADOWorkItem[];
  generatedScripts: GeneratedTestScript[];
  summary: GenerationSummary;
}

export interface GenerationSummary {
  totalWorkItems: number;
  successfulGenerations: number;
  skippedNoAcceptanceCriteria: number;
  failedGenerations: number;
  generatedFiles: string[];
  processingTime: number;
}

export class ADOTestGenerator {
  private adoIntegration: ADOIntegration;
  private testGenerator: TestScriptGenerator;

  constructor(config: ADOTestGeneratorConfig) {
    this.adoIntegration = new ADOIntegration(config.ado);
    this.testGenerator = new TestScriptGenerator(config.testScript);
  }

  /**
   * Generate test scripts from a single work item ID
   */
  async generateFromWorkItemId(workItemId: number): Promise<GeneratedTestScript> {
    Log.info(`Starting test generation for work item ${workItemId}`);

    try {
      // Fetch work item from ADO
      const workItem = await this.adoIntegration.fetchWorkItem(workItemId);
      
      // Generate test scripts
      const result = await this.testGenerator.generateFromWorkItem(workItem);
      
      Log.info(`Successfully generated test scripts for work item ${workItemId}`);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle "no acceptance criteria" as a special case
      if (errorMessage.includes('No acceptance criteria')) {
        Log.info(`Work item ${workItemId} skipped: No acceptance criteria found`);
        throw new Error(`SKIP:${errorMessage}`);
      } else {
        Log.error(`Failed to generate test scripts for work item ${workItemId}: ${errorMessage}`);
        throw new Error(`Test generation failed: ${errorMessage}`);
      }
    }
  }

  /**
   * Generate test scripts from multiple work item IDs
   */
  async generateFromWorkItemIds(workItemIds: number[]): Promise<GenerationResult> {
    const startTime = Date.now();
    Log.info(`Starting batch test generation for ${workItemIds.length} work items`);

    try {
      // Fetch all work items from ADO
      const workItems = await this.adoIntegration.fetchMultipleWorkItems(workItemIds);
      
      // Generate test scripts for each work item
      const generatedScripts: GeneratedTestScript[] = [];
      const generatedFiles: string[] = [];
      let successfulGenerations = 0;
      let skippedNoAcceptanceCriteria = 0;
      let failedGenerations = 0;

      for (const workItem of workItems) {
        try {
          const result = await this.testGenerator.generateFromWorkItem(workItem);
          generatedScripts.push(result);
          generatedFiles.push(result.testSpecFile);
          if (result.pageObjectFile) {
            generatedFiles.push(result.pageObjectFile);
          }
          successfulGenerations++;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('No acceptance criteria')) {
            Log.info(`Skipped work item ${workItem.id}: No acceptance criteria found`);
            skippedNoAcceptanceCriteria++;
          } else {
            Log.error(`Failed to generate test for work item ${workItem.id}: ${errorMessage}`);
            failedGenerations++;
          }
        }
      }

      const processingTime = Date.now() - startTime;

      const result: GenerationResult = {
        workItems,
        generatedScripts,
        summary: {
          totalWorkItems: workItems.length,
          successfulGenerations,
          skippedNoAcceptanceCriteria,
          failedGenerations,
          generatedFiles,
          processingTime
        }
      };

      Log.info(`Batch generation completed: ${successfulGenerations} successful, ${failedGenerations} failed in ${processingTime}ms`);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Log.error(`Batch test generation failed: ${errorMessage}`);
      throw new Error(`Batch generation failed: ${errorMessage}`);
    }
  }

  /**
   * Generate test scripts from work items in a specific iteration
   */
  async generateFromIteration(iterationPath: string): Promise<GenerationResult> {
    Log.info(`Generating tests for iteration: ${iterationPath}`);

    try {
      // Get work items from iteration
      const workItems = await this.adoIntegration.getWorkItemsByIteration(iterationPath);
      
      if (workItems.length === 0) {
        Log.info(`No work items found in iteration: ${iterationPath}`);
        return {
          workItems: [],
          generatedScripts: [],
          summary: {
            totalWorkItems: 0,
            successfulGenerations: 0,
            skippedNoAcceptanceCriteria: 0,
            failedGenerations: 0,
            generatedFiles: [],
            processingTime: 0
          }
        };
      }

      // Extract work item IDs and generate tests
      const workItemIds = workItems.map((wi: ADOWorkItem) => wi.id);
      return await this.generateFromWorkItemIds(workItemIds);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Log.error(`Failed to generate tests for iteration ${iterationPath}: ${errorMessage}`);
      throw new Error(`Iteration generation failed: ${errorMessage}`);
    }
  }

  /**
   * Generate test scripts for work items assigned to a specific person
   */
  async generateFromAssignee(assignedTo: string): Promise<GenerationResult> {
    Log.info(`Generating tests for assignee: ${assignedTo}`);

    try {
      // Get work items for assignee
      const workItems = await this.adoIntegration.getWorkItemsByAssignee(assignedTo);
      
      if (workItems.length === 0) {
        Log.info(`No work items found for assignee: ${assignedTo}`);
        return {
          workItems: [],
          generatedScripts: [],
          summary: {
            totalWorkItems: 0,
            successfulGenerations: 0,
            skippedNoAcceptanceCriteria: 0,
            failedGenerations: 0,
            generatedFiles: [],
            processingTime: 0
          }
        };
      }

      // Extract work item IDs and generate tests
      const workItemIds = workItems.map((wi: ADOWorkItem) => wi.id);
      return await this.generateFromWorkItemIds(workItemIds);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Log.error(`Failed to generate tests for assignee ${assignedTo}: ${errorMessage}`);
      throw new Error(`Assignee generation failed: ${errorMessage}`);
    }
  }

  /**
   * Generate test scripts using custom WIQL query
   */
  async generateFromQuery(wiqlQuery: string): Promise<GenerationResult> {
    Log.info(`Generating tests from custom query`);

    try {
      // Search work items using query
      const workItems = await this.adoIntegration.searchWorkItems(wiqlQuery);
      
      if (workItems.length === 0) {
        Log.info('No work items found matching the query');
        return {
          workItems: [],
          generatedScripts: [],
          summary: {
            totalWorkItems: 0,
            successfulGenerations: 0,
            skippedNoAcceptanceCriteria: 0,
            failedGenerations: 0,
            generatedFiles: [],
            processingTime: 0
          }
        };
      }

      // Extract work item IDs and generate tests
      const workItemIds = workItems.map((wi: ADOWorkItem) => wi.id);
      return await this.generateFromWorkItemIds(workItemIds);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Log.error(`Failed to generate tests from query: ${errorMessage}`);
      throw new Error(`Query generation failed: ${errorMessage}`);
    }
  }

  /**
   * Test ADO connection
   */
  async testConnection(): Promise<boolean> {
    Log.info('Testing ADO connection...');
    return await this.adoIntegration.testConnection();
  }

  /**
   * Preview work items without generating tests (for validation)
   */
  async previewWorkItems(workItemIds: number[]): Promise<readonly ADOWorkItem[]> {
    Log.info(`Previewing ${workItemIds.length} work items`);
    return await this.adoIntegration.fetchMultipleWorkItems(workItemIds);
  }

  /**
   * Get summary of work items by iteration (for planning)
   */
  async getIterationSummary(iterationPath: string): Promise<{
    workItems: readonly ADOWorkItem[];
    summary: {
      totalItems: number;
      byType: Record<string, number>;
      byState: Record<string, number>;
      withAcceptanceCriteria: number;
    };
  }> {
    Log.info(`Getting summary for iteration: ${iterationPath}`);

    try {
      const workItems = await this.adoIntegration.getWorkItemsByIteration(iterationPath);
      
      const summary = {
        totalItems: workItems.length,
        byType: {} as Record<string, number>,
        byState: {} as Record<string, number>,
        withAcceptanceCriteria: 0
      };

      workItems.forEach((wi: ADOWorkItem) => {
        // Count by type
        summary.byType[wi.workItemType] = (summary.byType[wi.workItemType] || 0) + 1;
        
        // Count by state
        summary.byState[wi.state] = (summary.byState[wi.state] || 0) + 1;
        
        // Count items with acceptance criteria
        if (wi.acceptanceCriteria && wi.acceptanceCriteria !== 'No acceptance criteria found') {
          summary.withAcceptanceCriteria++;
        }
      });

      return { workItems, summary };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Log.error(`Failed to get iteration summary: ${errorMessage}`);
      throw new Error(`Iteration summary failed: ${errorMessage}`);
    }
  }

  /**
   * Generate summary report of generation results
   */
  generateSummaryReport(result: GenerationResult): string {
    const { summary, workItems, generatedScripts } = result;
    
    let report = `# Test Generation Summary Report\n\n`;
    report += `**Generation Date**: ${new Date().toISOString()}\n`;
    report += `**Processing Time**: ${summary.processingTime}ms\n\n`;
    
    report += `## Overview\n`;
    report += `- **Total Work Items**: ${summary.totalWorkItems}\n`;
    report += `- **Successful Generations**: ${summary.successfulGenerations}\n`;
    report += `- **Failed Generations**: ${summary.failedGenerations}\n`;
    report += `- **Generated Files**: ${summary.generatedFiles.length}\n\n`;
    
    report += `## Work Items Processed\n`;
    workItems.forEach((wi: ADOWorkItem) => {
      const generated = generatedScripts.find(gs => gs.workItemId === wi.id);
      const status = generated ? '✅ Generated' : '❌ Failed';
      report += `- **${wi.id}**: ${wi.title} (${wi.workItemType}) - ${status}\n`;
    });
    
    report += `\n## Generated Files\n`;
    summary.generatedFiles.forEach(file => {
      report += `- ${file}\n`;
    });
    
    return report;
  }
}
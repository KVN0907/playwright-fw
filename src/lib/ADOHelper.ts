/**
 * Consolidated ADO Helper
 * Single file for all Azure DevOps integration functionality
 */

import Log from './Log';
import { TestScriptGenerator, TestScriptConfig, GeneratedTestScript } from './TestScriptGenerator';

/* ===== TYPES & INTERFACES ===== */

export interface ADOConfig {
  organization: string;
  project: string;
  personalAccessToken: string;
  apiVersion?: string;
}

export interface ADOWorkItem {
  id: number;
  title: string;
  description: string;
  acceptanceCriteria: string;
  workItemType: string;
  state: string;
  assignedTo?: string;
  tags?: string[];
}

export interface ADOGenerationResult {
  workItem: ADOWorkItem;
  generatedScript: GeneratedTestScript;
  success: boolean;
  error?: string;
}

/* ===== ADO INTEGRATION ===== */

export class ADOHelper {
  private readonly config: Required<ADOConfig>;
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private testGenerator?: TestScriptGenerator;

  constructor(config: ADOConfig) {
    this.config = { apiVersion: '7.0', ...config };
    this.baseUrl = `https://dev.azure.com/${this.config.organization}/${this.config.project}/_apis`;
    this.authHeader = `Basic ${Buffer.from(`:${this.config.personalAccessToken}`).toString('base64')}`;
  }

  /**
   * Initialize test script generator
   */
  initializeGenerator(testConfig: TestScriptConfig): void {
    this.testGenerator = new TestScriptGenerator(testConfig);
  }

  /**
   * Test ADO connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `https://dev.azure.com/${this.config.organization}/_apis/projects?api-version=${this.config.apiVersion}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Log.info('✅ ADO connection successful');
        return true;
      }

      Log.error(`❌ ADO connection failed: ${response.status} ${response.statusText}`);
      return false;
    } catch (error) {
      Log.error(`❌ ADO connection error: ${error}`);
      return false;
    }
  }

  /**
   * Fetch work item by ID
   */
  async fetchWorkItem(workItemId: number): Promise<ADOWorkItem> {
    Log.info(`📥 Fetching work item ${workItemId} from ADO`);

    try {
      const url = `${this.baseUrl}/wit/workitems/${workItemId}?api-version=${this.config.apiVersion}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch work item: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseWorkItem(data);
    } catch (error) {
      Log.error(`❌ Error fetching work item ${workItemId}: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch multiple work items by IDs
   */
  async fetchWorkItems(workItemIds: number[]): Promise<ADOWorkItem[]> {
    Log.info(`📥 Fetching ${workItemIds.length} work items from ADO`);

    const workItems: ADOWorkItem[] = [];
    for (const id of workItemIds) {
      try {
        const workItem = await this.fetchWorkItem(id);
        workItems.push(workItem);
      } catch (error) {
        Log.error(`Failed to fetch work item ${id}: ${error}`);
      }
    }

    return workItems;
  }

  /**
   * Generate test script from work item ID
   */
  async generateTestFromWorkItem(workItemId: number): Promise<ADOGenerationResult> {
    if (!this.testGenerator) {
      throw new Error('Test generator not initialized. Call initializeGenerator() first.');
    }

    try {
      // Fetch work item
      const workItem = await this.fetchWorkItem(workItemId);

      // Check if work item has acceptance criteria
      if (!workItem.acceptanceCriteria || workItem.acceptanceCriteria.trim() === '') {
        Log.warn(`⚠️ Work item ${workItemId} has no acceptance criteria`);
        return {
          workItem,
          generatedScript: { filePath: '', content: '', metadata: {} as any },
          success: false,
          error: 'No acceptance criteria found',
        };
      }

      // Generate test script
      Log.info(`🔧 Generating test script for work item ${workItemId}`);
      const generatedScript = await this.testGenerator.generateFromAcceptanceCriteria(
        workItem.acceptanceCriteria,
        {
          testName: workItem.title,
          featureName: workItem.workItemType,
          workItemId: workItem.id.toString(),
        }
      );

      Log.info(`✅ Test script generated successfully for work item ${workItemId}`);
      return {
        workItem,
        generatedScript,
        success: true,
      };
    } catch (error) {
      Log.error(`❌ Failed to generate test for work item ${workItemId}: ${error}`);
      throw error;
    }
  }

  /**
   * Generate tests from multiple work items
   */
  async generateTestsFromWorkItems(workItemIds: number[]): Promise<ADOGenerationResult[]> {
    if (!this.testGenerator) {
      throw new Error('Test generator not initialized. Call initializeGenerator() first.');
    }

    Log.info(`🚀 Starting batch test generation for ${workItemIds.length} work items`);

    const results: ADOGenerationResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const workItemId of workItemIds) {
      try {
        const result = await this.generateTestFromWorkItem(workItemId);
        results.push(result);

        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        Log.error(`Failed to process work item ${workItemId}: ${error}`);
        failCount++;
      }
    }

    Log.info(
      `✅ Batch generation complete: ${successCount} successful, ${failCount} failed out of ${workItemIds.length}`
    );

    return results;
  }

  /**
   * Parse ADO work item response
   */
  private parseWorkItem(data: any): ADOWorkItem {
    const fields = data.fields || {};

    // Try multiple field names for acceptance criteria
    const acceptanceCriteria =
      fields['Microsoft.VSTS.Common.AcceptanceCriteria'] ||
      fields['System.AcceptanceCriteria'] ||
      fields['Custom.AcceptanceCriteria'] ||
      fields['System.Description'] ||
      '';

    return {
      id: data.id,
      title: fields['System.Title'] || '',
      description: fields['System.Description'] || '',
      acceptanceCriteria: this.cleanHtml(acceptanceCriteria),
      workItemType: fields['System.WorkItemType'] || '',
      state: fields['System.State'] || '',
      assignedTo: fields['System.AssignedTo']?.displayName,
      tags: fields['System.Tags']?.split(';').map((t: string) => t.trim()) || [],
    };
  }

  /**
   * Clean HTML from ADO fields
   */
  private cleanHtml(html: string): string {
    if (!html) return '';

    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Get ADO configuration
   */
  getConfig(): Required<ADOConfig> {
    return { ...this.config };
  }
}

/* ===== CONVENIENCE FUNCTIONS ===== */

/**
 * Create ADO helper from environment variables
 */
export function createADOHelperFromEnv(): ADOHelper {
  const config: ADOConfig = {
    organization: process.env.ADO_ORGANIZATION || '',
    project: process.env.ADO_PROJECT || '',
    personalAccessToken: process.env.ADO_PAT || '',
  };

  if (!config.organization || !config.project || !config.personalAccessToken) {
    throw new Error(
      'Missing ADO configuration. Set ADO_ORGANIZATION, ADO_PROJECT, and ADO_PAT environment variables.'
    );
  }

  return new ADOHelper(config);
}

/**
 * Quick test ADO connection
 */
export async function testADOConnection(config: ADOConfig): Promise<boolean> {
  const helper = new ADOHelper(config);
  return helper.testConnection();
}

export default ADOHelper;

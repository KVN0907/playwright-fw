/**
 * @fileoverview Advanced TypeScript ADO Integration with modern patterns
 * @description Utility to fetch acceptance criteria from Azure DevOps using advanced TypeScript features
 * @version 2.0
 */

import Log from '../Log';

/** Type-safe field mapping for ADO work items */
type ADOFieldMap = {
  readonly id: 'id';
  readonly title: 'System.Title';
  readonly description: 'System.Description';
  readonly workItemType: 'System.WorkItemType';
  readonly state: 'System.State';
  readonly assignedTo: 'System.AssignedTo';
  readonly tags: 'System.Tags';
};

/** Union type for acceptance criteria field names */
type AcceptanceCriteriaField = 
  | 'Microsoft.VSTS.Common.AcceptanceCriteria'
  | 'System.AcceptanceCriteria'
  | 'Custom.AcceptanceCriteria'
  | 'System.Description';

/** Utility type for extracting field values */
type FieldExtractor<T> = (fields: Record<string, any>) => T;

/** ADO Work Item interface with strict typing */
export interface ADOWorkItem {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly acceptanceCriteria: string;
  readonly workItemType: string;
  readonly state: string;
  readonly assignedTo?: string;
  readonly tags?: readonly string[];
}

/** Configuration interface with default values */
export interface ADOConfig {
  readonly organization: string;
  readonly project: string;
  readonly personalAccessToken: string;
  readonly apiVersion?: string;
}

/** Response type for ADO API calls */
type ADOResponse<T> = Promise<T>;

/**
 * @class ADOIntegration
 * @description Advanced ADO integration using modern TypeScript patterns
 */
export class ADOIntegration {
  private readonly config: Required<ADOConfig>;
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(config: ADOConfig) {
    this.config = { apiVersion: '7.0', ...config };
    this.baseUrl = `https://dev.azure.com/${this.config.organization}/${this.config.project}/_apis`;
    this.authHeader = `Basic ${Buffer.from(`:${this.config.personalAccessToken}`).toString('base64')}`;
  }

  /**
   * @description Fetch work item by ID using advanced error handling and type safety
   * @param workItemId - The ID of the work item to fetch
   * @returns Promise resolving to typed ADO work item
   */
  async fetchWorkItem(workItemId: number): ADOResponse<ADOWorkItem> {
    Log.info(`📥 Fetching work item ${workItemId}`);
    
    return this.safeApiCall(async () => {
      const response = await this.makeRequest(`wit/workitems/${workItemId}`);
      return this.parseWorkItem(response);
    }, `fetch work item ${workItemId}`);
  }

  /**
   * @description Test ADO connection with enhanced error handling
   * @returns Promise<boolean> indicating connection success
   */
  async testConnection(): Promise<boolean> {
    return this.safeApiCall(async () => {
      await this.makeRequest(`https://dev.azure.com/${this.config.organization}/_apis/projects`, true);
      Log.info('✅ ADO connection successful');
      return true;
    }, 'test connection').catch(() => false);
  }

  /**
   * @description Generic API call wrapper with error handling and logging
   * @param operation - Async operation to execute
   * @param context - Context for error messages
   * @returns Promise with typed result
   */
  private async safeApiCall<T>(operation: () => Promise<T>, context: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Log.error(`❌ Failed to ${context}: ${message}`);
      throw new Error(`ADO ${context} failed: ${message}`);
    }
  }

  /**
   * @description Make HTTP request to ADO API with consistent headers
   * @param endpoint - API endpoint (relative or absolute)
   * @param isAbsolute - Whether endpoint is absolute URL
   * @returns Promise with parsed JSON response
   */
  private async makeRequest(endpoint: string, isAbsolute = false): Promise<any> {
    const url = isAbsolute ? `${endpoint}?api-version=${this.config.apiVersion}` 
                           : `${this.baseUrl}/${endpoint}?api-version=${this.config.apiVersion}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * @description Fetch multiple work items using batch API with type safety
   * @param workItemIds - Array of work item IDs to fetch
   * @returns Promise resolving to array of typed work items
   */
  async fetchMultipleWorkItems(workItemIds: readonly number[]): ADOResponse<readonly ADOWorkItem[]> {
    Log.info(`📥 Batch fetching ${workItemIds.length} work items`);
    
    return this.safeApiCall(async () => {
      const ids = workItemIds.join(',');
      const response = await this.makeRequest(`wit/workitems?ids=${ids}`);
      return response.value?.map((item: any) => this.parseWorkItem(item)) ?? [];
    }, `fetch ${workItemIds.length} work items`);
  }

  /**
   * @description Get work items by iteration path using WIQL
   * @param iterationPath - The iteration path to filter by
   * @returns Promise resolving to readonly array of work items
   */
  async getWorkItemsByIteration(iterationPath: string): ADOResponse<readonly ADOWorkItem[]> {
    const wiql = `SELECT [System.Id] FROM WorkItems WHERE [System.IterationPath] = '${iterationPath}'`;
    return this.safeApiCall(() => this.executeWiqlQuery(wiql), `fetch items for iteration ${iterationPath}`);
  }

  /**
   * @description Get work items by assignee using WIQL
   * @param assignedTo - The assignee to filter by
   * @returns Promise resolving to readonly array of work items
   */
  async getWorkItemsByAssignee(assignedTo: string): ADOResponse<readonly ADOWorkItem[]> {
    const wiql = `SELECT [System.Id] FROM WorkItems WHERE [System.AssignedTo] = '${assignedTo}'`;
    return this.safeApiCall(() => this.executeWiqlQuery(wiql), `fetch items for assignee ${assignedTo}`);
  }

  /**
   * @description Search work items using custom WIQL query
   * @param wiqlQuery - Custom WIQL query string
   * @returns Promise resolving to readonly array of work items
   */
  async searchWorkItems(wiqlQuery: string): ADOResponse<readonly ADOWorkItem[]> {
    return this.safeApiCall(() => this.executeWiqlQuery(wiqlQuery), 'execute WIQL search');
  }



  /**
   * Execute WIQL query and return work items
   */
  private async executeWiqlQuery(wiql: string): Promise<readonly ADOWorkItem[]> {
    try {
      // First, execute the WIQL query to get work item IDs
      const wiqlUrl = `${this.baseUrl}/wit/wiql?api-version=${this.config.apiVersion}`;
      
      const wiqlResponse = await fetch(wiqlUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`:${this.config.personalAccessToken}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: wiql })
      });

      if (!wiqlResponse.ok) {
        throw new Error(`WIQL query failed: HTTP ${wiqlResponse.status}: ${wiqlResponse.statusText}`);
      }

      const wiqlData = await wiqlResponse.json();
      const workItemIds = wiqlData.workItems.map((item: any) => item.id);

      if (workItemIds.length === 0) {
        return [];
      }

      // Then fetch the actual work items
      return await this.fetchMultipleWorkItems(workItemIds);

    } catch (error) {
      Log.error(`Failed to execute WIQL query: ${error}`);
      throw error;
    }
  }

  /**
   * @description Parse ADO work item using advanced TypeScript patterns and field extractors
   * @param workItem - Raw ADO work item response
   * @returns Typed and validated work item object
   */
  private parseWorkItem(workItem: any): ADOWorkItem {
    const fields = workItem.fields ?? {};
    
    const extractors: Record<keyof Omit<ADOWorkItem, 'id'>, FieldExtractor<any>> = {
      title: (f) => f['System.Title'] ?? 'Untitled',
      description: (f) => f['System.Description'] ?? '',
      acceptanceCriteria: (f) => this.extractAcceptanceCriteria(f),
      workItemType: (f) => f['System.WorkItemType'] ?? 'Unknown',
      state: (f) => f['System.State'] ?? 'Unknown',
      assignedTo: (f) => f['System.AssignedTo']?.displayName,
      tags: (f) => f['System.Tags']?.split(';').map((tag: string) => tag.trim()).filter(Boolean) ?? []
    };

    return {
      id: workItem.id,
      ...Object.fromEntries(
        Object.entries(extractors).map(([key, extractor]) => [key, extractor(fields)])
      ) as Omit<ADOWorkItem, 'id'>
    };
  }

  /**
   * @description Extract acceptance criteria using functional approach with field prioritization
   * @param fields - ADO work item fields
   * @returns Cleaned acceptance criteria text
   */
  private extractAcceptanceCriteria(fields: Record<string, any>): string {
    const criteriaFields: readonly AcceptanceCriteriaField[] = [
      'Microsoft.VSTS.Common.AcceptanceCriteria',
      'System.AcceptanceCriteria', 
      'Custom.AcceptanceCriteria',
      'System.Description'
    ] as const;

    const compose = <T>(...fns: ((x: T) => T)[]) => (value: T): T =>
      fns.reduce((acc, fn) => fn(acc), value);

    const cleanHtml = compose(
      (text: string) => text.replace(/<[^>]*>/g, ''),           // Remove HTML tags
      (text: string) => text.replace(/&nbsp;/g, ' '),          // Non-breaking spaces
      (text: string) => text.replace(/&(amp|lt|gt);/g, (match) => // HTML entities
        ({ '&amp;': '&', '&lt;': '<', '&gt;': '>' }[match] ?? match)),
      (text: string) => text.trim()
    );

    const rawValue = criteriaFields
      .map(field => fields[field])
      .find((value): value is string => typeof value === 'string' && value.length > 0);

    return rawValue ? cleanHtml(rawValue) || 'No acceptance criteria found' : 'No acceptance criteria found';
  }
}
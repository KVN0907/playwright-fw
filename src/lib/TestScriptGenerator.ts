/**
 * TestScriptGenerator - Generates actual Playwright test scripts from acceptance criteria
 * Uses existing framework patterns and prompt file guidelines
 */

import { ADOWorkItem } from './ado/ADOIntegration';
import Log from './Log';
import * as fs from 'fs';
import * as path from 'path';

export interface TestScriptConfig {
  outputDirectory: string;
  testFramework: 'playwright';
  promptFilePath: string;
  aiProvider: 'openai' | 'anthropic' | 'azure' | 'vscode' | 'local';
  apiKey?: string;
  model?: string;
  includePageObjects: boolean;
  basePageObjectsPath: string;
  testSpecsPath: string;
}

export interface GeneratedTestScript {
  testSpecFile: string;
  pageObjectFile?: string;
  workItemId: number;
  testCases: GeneratedTestCase[];
}

export interface GeneratedTestCase {
  testName: string;
  description: string;
  testSteps: string[];
  pageObjectMethods: string[];
}

export class TestScriptGenerator {
  private config: TestScriptConfig;
  private frameworkPrompt: string = '';

  constructor(config: TestScriptConfig) {
    this.config = config;
    this.loadFrameworkPrompt();
  }

  /**
   * Generate test scripts from ADO work item
   */
  async generateFromWorkItem(workItem: ADOWorkItem): Promise<GeneratedTestScript> {
    Log.info(`Generating test scripts for work item ${workItem.id}: ${workItem.title}`);

    try {
      // Check if work item has acceptance criteria
      if (!workItem.acceptanceCriteria || workItem.acceptanceCriteria === 'No acceptance criteria found') {
        Log.info(`Skipping work item ${workItem.id} - no acceptance criteria found`);
        throw new Error(`No acceptance criteria found for work item ${workItem.id}. Skipping test generation.`);
      }

      // Extract acceptance criteria as array
      const acceptanceCriteria = this.extractAcceptanceCriteria(workItem.acceptanceCriteria);
      
      if (acceptanceCriteria.length === 0) {
        Log.info(`Skipping work item ${workItem.id} - no valid acceptance criteria could be extracted`);
        throw new Error(`No valid acceptance criteria found for work item ${workItem.id}. Skipping test generation.`);
      }

      // Generate test cases using AI
      const testCases = await this.generateTestCases(workItem, acceptanceCriteria);

      // Generate test spec file
      const testSpecContent = this.generateTestSpec(workItem, testCases);
      const testSpecFile = await this.saveTestSpec(workItem, testSpecContent);

      // Generate page object if needed
      let pageObjectFile: string | undefined;
      if (this.config.includePageObjects) {
        const pageObjectContent = this.generatePageObject(workItem, testCases);
        pageObjectFile = await this.savePageObject(workItem, pageObjectContent);
      }

      const result: GeneratedTestScript = {
        testSpecFile,
        pageObjectFile,
        workItemId: workItem.id,
        testCases
      };

      Log.info(`Successfully generated test scripts for work item ${workItem.id}`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Log.error(`Error generating test scripts for work item ${workItem.id}: ${errorMessage}`);
      throw new Error(`Failed to generate test scripts: ${errorMessage}`);
    }
  }

  /**
   * Generate multiple test scripts from multiple work items
   */
  async generateFromMultipleWorkItems(workItems: ADOWorkItem[]): Promise<GeneratedTestScript[]> {
    Log.info(`Generating test scripts for ${workItems.length} work items`);

    const results: GeneratedTestScript[] = [];
    
    for (const workItem of workItems) {
      try {
        const result = await this.generateFromWorkItem(workItem);
        results.push(result);
      } catch (error) {
        Log.error(`Failed to generate tests for work item ${workItem.id}: ${error}`);
        // Continue with other work items
      }
    }

    Log.info(`Generated test scripts for ${results.length} out of ${workItems.length} work items`);
    return results;
  }

  /**
   * Extract acceptance criteria from work item
   */
  private extractAcceptanceCriteria(acceptanceCriteria: string): string[] {
    if (!acceptanceCriteria || acceptanceCriteria === 'No acceptance criteria found') {
      return [];
    }

    // Split by various patterns
    const patterns = [
      /(?:^|\n)\s*(?:AC\d*|Acceptance Criteria?\s*\d*)\s*[:\-]\s*/gim,
      /(?:^|\n)\s*(?:Given|When|Then)\s+/gim,
      /(?:^|\n)\s*(?:Scenario|Test Case)\s*[:\-]?\s*/gim,
      /(?:^|\n)\s*[-•*]\s+/gm,
      /(?:^|\n)\s*\d+\.\s+/gm
    ];

    let criteria: string[] = [];
    
    for (const pattern of patterns) {
      const matches = acceptanceCriteria.split(pattern);
      if (matches.length > 1) {
        criteria = matches.filter(item => item.trim().length > 10);
        break;
      }
    }

    // Fallback to line-based splitting
    if (criteria.length === 0) {
      criteria = acceptanceCriteria
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 10);
    }

    return criteria.slice(0, 8); // Limit number of criteria
  }

  /**
   * Load framework prompt from file
   */
  private loadFrameworkPrompt(): void {
    try {
      if (fs.existsSync(this.config.promptFilePath)) {
        this.frameworkPrompt = fs.readFileSync(this.config.promptFilePath, 'utf8');
        Log.info(`Loaded framework prompt from ${this.config.promptFilePath}`);
      } else {
        // Use default prompt if file not found
        this.frameworkPrompt = this.getDefaultFrameworkPrompt();
        Log.info('Using default framework prompt');
      }
    } catch (error) {
      Log.error(`Error loading prompt file: ${error}`);
      this.frameworkPrompt = this.getDefaultFrameworkPrompt();
    }
  }

  /**
   * Generate test cases using AI
   */
  private async generateTestCases(workItem: ADOWorkItem, acceptanceCriteria: string[]): Promise<GeneratedTestCase[]> {
    const prompt = this.buildPrompt(workItem, acceptanceCriteria);
    
    try {
      const response = await this.callAI(prompt);
      return this.parseTestCasesFromResponse(response);
    } catch (error) {
      Log.error(`AI generation failed, using fallback method: ${error}`);
      return this.generateFallbackTestCases(workItem, acceptanceCriteria);
    }
  }

  /**
   * Build AI prompt using framework guidelines
   */
  private buildPrompt(workItem: ADOWorkItem, acceptanceCriteria: string[]): string {
    return `${this.frameworkPrompt}

## Work Item Details
**ID**: ${workItem.id}
**Title**: ${workItem.title}
**Type**: ${workItem.workItemType}
**Description**: ${workItem.description}

## Acceptance Criteria
${acceptanceCriteria.map((ac, index) => `${index + 1}. ${ac}`).join('\n')}

## Task
Generate comprehensive Playwright test scripts following the framework patterns shown above.

### Requirements:
1. Create readable test specs using Given/When/Then format
2. Generate corresponding page object methods
3. Use role-based selectors and proper locators
4. Include proper logging and assertions
5. Follow the existing BasePage pattern
6. Create tests for both positive and negative scenarios

### Output Format:
Please provide the response in this JSON format:
\`\`\`json
{
  "testCases": [
    {
      "testName": "descriptive test name",
      "description": "what the test validates",
      "testSteps": [
        "// Given user is authenticated and on the page",
        "await page.navigateToFeature();",
        "// When user performs action",
        "await page.performAction();",
        "// Then verify expected outcome",
        "await page.verifyResult();"
      ],
      "pageObjectMethods": [
        "async navigateToFeature(): Promise<void> { /* implementation */ }",
        "async performAction(): Promise<void> { /* implementation */ }",
        "async verifyResult(): Promise<void> { /* implementation */ }"
      ]
    }
  ]
}
\`\`\`

Generate tests that cover all acceptance criteria with proper error handling and edge cases.`;
  }

  /**
   * Call AI service based on configured provider
   */
  private async callAI(prompt: string): Promise<string> {
    Log.info(`Calling AI service (${this.config.aiProvider}) for test generation`);
    
    switch (this.config.aiProvider) {
      case 'vscode':
        return await this.callVSCodeAI(prompt);
      case 'openai':
        return await this.callOpenAI(prompt);
      case 'anthropic':
        return await this.callAnthropic(prompt);
      default:
        Log.info('Using mock AI response for testing');
        return this.getMockAIResponse();
    }
  }

  /**
   * Use VS Code's built-in AI capabilities
   */
  private async callVSCodeAI(prompt: string): Promise<string> {
    try {
      // Check if running in VS Code context
      if (typeof process !== 'undefined' && process.env.VSCODE_PID) {
        Log.info('Detected VS Code environment - using Copilot Chat');
        
        // For now, return enhanced mock response
        // In real implementation, you would use VS Code extension API
        Log.info('Simulating VS Code AI integration - returning enhanced mock response');
        return this.getEnhancedMockResponse();
      } else {
        Log.info('Not in VS Code environment - using fallback');
        return this.getMockAIResponse();
      }
    } catch (error) {
      Log.error(`VS Code AI call failed: ${error}`);
      return this.getMockAIResponse();
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    // Placeholder for OpenAI integration
    Log.info('OpenAI integration not implemented yet - using mock');
    return this.getMockAIResponse();
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(prompt: string): Promise<string> {
    // Placeholder for Anthropic integration
    Log.info('Anthropic integration not implemented yet - using mock');
    return this.getMockAIResponse();
  }

  /**
   * Mock AI response for testing purposes
   */
  private getMockAIResponse(): string {
    return `{
  "testCases": [
    {
      "testName": "User can successfully complete the main workflow",
      "description": "Validates that user can complete the primary use case successfully",
      "testSteps": [
        "// Given user is authenticated and on the main page", 
        "await page.navigateToMainFeature();",
        "// When user completes the workflow",
        "await page.fillRequiredFields();",
        "await page.submitForm();",
        "// Then verify successful completion",
        "await page.verifyWorkflowCompletion();"
      ],
      "pageObjectMethods": [
        "async navigateToMainFeature(): Promise<void> { await this.navigateTo('/main-feature'); await this.waitForLoadState(); }",
        "async fillRequiredFields(): Promise<void> { /* Fill form fields based on acceptance criteria */ }",
        "async submitForm(): Promise<void> { await this.clickElement(this.submitButton, 'Submit form'); }",
        "async verifyWorkflowCompletion(): Promise<void> { await expect(this.successMessage).toBeVisible(); }"
      ]
    }
  ]
}`;
  }

  /**
   * Enhanced mock response for VS Code AI simulation
   */
  private getEnhancedMockResponse(): string {
    return `{
  "testCases": [
    {
      "testName": "User can successfully complete the main workflow with valid data",
      "description": "Validates successful completion of primary user workflow with valid inputs",
      "testSteps": [
        "// Given user is authenticated and on the main page",
        "await page.navigateToMainFeature();",
        "await page.waitForPageReady();",
        "// When user enters valid data and submits",
        "await page.fillRequiredFields();",
        "await page.submitForm();",
        "// Then verify successful completion",
        "await page.verifyWorkflowCompletion();"
      ],
      "pageObjectMethods": [
        "async navigateToMainFeature(): Promise<void> { Log.info('Navigating to main feature'); await this.navigateTo('/main-feature'); await this.waitForLoadState(); }",
        "async fillRequiredFields(): Promise<void> { Log.info('Filling required fields'); /* Implementation based on acceptance criteria */ }",
        "async submitForm(): Promise<void> { Log.info('Submitting form'); await this.clickElement(this.submitButton, 'Submit form'); }",
        "async verifyWorkflowCompletion(): Promise<void> { Log.info('Verifying workflow completion'); await expect(this.successMessage).toBeVisible(); }"
      ]
    },
    {
      "testName": "System handles invalid input with proper error messaging",
      "description": "Validates error handling for invalid user inputs",
      "testSteps": [
        "// Given user is on the main page",
        "await page.navigateToMainFeature();",
        "// When user enters invalid data",
        "await page.fillInvalidData();",
        "await page.submitForm();",
        "// Then verify error message is displayed",
        "await page.verifyErrorMessage();"
      ],
      "pageObjectMethods": [
        "async fillInvalidData(): Promise<void> { Log.info('Filling invalid data'); /* Fill with invalid test data */ }",
        "async verifyErrorMessage(): Promise<void> { Log.info('Verifying error message'); await expect(this.errorMessage).toBeVisible(); }"
      ]
    }
  ]
}`;
  }

  /**
   * Parse test cases from AI response
   */
  private parseTestCasesFromResponse(response: string): GeneratedTestCase[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.testCases || [];
    } catch (error) {
      Log.error(`Error parsing AI response: ${error}`);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Generate fallback test cases when AI fails
   */
  private generateFallbackTestCases(workItem: ADOWorkItem, acceptanceCriteria: string[]): GeneratedTestCase[] {
    Log.info('Generating fallback test cases');
    
    return acceptanceCriteria.map((ac, index) => ({
      testName: `Test acceptance criteria ${index + 1}`,
      description: `Validates: ${ac.substring(0, 100)}...`,
      testSteps: [
        '// Given user is authenticated and ready',
        'await page.navigateToFeature();',
        '// When user performs the required action', 
        'await page.performAction();',
        '// Then verify the expected outcome',
        'await page.verifyResult();'
      ],
      pageObjectMethods: [
        'async navigateToFeature(): Promise<void> { /* Navigate to feature page */ }',
        'async performAction(): Promise<void> { /* Perform required action */ }',
        'async verifyResult(): Promise<void> { /* Verify expected result */ }'
      ]
    }));
  }

  /**
   * Generate test spec file content
   */
  private generateTestSpec(workItem: ADOWorkItem, testCases: GeneratedTestCase[]): string {
    const className = this.sanitizeClassName(workItem.title);
    const pageObjectName = `${className}Page`;
    
    return `import { test } from '@playwright/test';
import { ${pageObjectName} } from '../pageObjects/${pageObjectName}';

/**
 * Test Suite: ${workItem.title}
 * Work Item ID: ${workItem.id}
 * Generated from acceptance criteria
 */
test.describe('${workItem.title}', () => {
  let page: ${pageObjectName};

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = new ${pageObjectName}(playwrightPage);
  });

${testCases.map((testCase, index) => `
  test('${testCase.testName}', async () => {
    // ${testCase.description}
    
${testCase.testSteps.map(step => `    ${step}`).join('\n')}
  });`).join('\n')}
});`;
  }

  /**
   * Generate page object file content
   */
  private generatePageObject(workItem: ADOWorkItem, testCases: GeneratedTestCase[]): string {
    const className = this.sanitizeClassName(workItem.title);
    const pageObjectName = `${className}Page`;

    // Collect all unique methods
    const allMethods = new Set<string>();
    testCases.forEach(testCase => {
      testCase.pageObjectMethods.forEach(method => {
        allMethods.add(method);
      });
    });

    return `import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../lib/Log';

/**
 * Page Object: ${workItem.title}
 * Work Item ID: ${workItem.id}
 * Generated from acceptance criteria
 */
export class ${pageObjectName} extends BasePage {
  // Locators - Update these based on actual page elements
  private readonly mainContainer: Locator;
  private readonly submitButton: Locator;
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators - Update selectors based on actual DOM
    this.mainContainer = this.page.locator('[data-testid="main-container"]');
    this.submitButton = this.page.locator('button:has-text("Submit")');
    this.successMessage = this.page.locator('[data-testid="success-message"]');
    this.errorMessage = this.page.locator('[data-testid="error-message"]');
  }

${Array.from(allMethods).map(method => `  ${method}`).join('\n\n')}

  /**
   * Wait for page to be ready
   */
  async waitForPageReady(): Promise<void> {
    Log.info('Waiting for page to be ready');
    await this.waitForElement(this.mainContainer);
    await this.waitForLoadState();
    Log.info('Page is ready');
  }

  /**
   * Verify page is loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    Log.info('Verifying page is loaded');
    await expect(this.mainContainer).toBeVisible();
    Log.info('Page loaded successfully');
  }
}`;
  }

  /**
   * Save test spec file
   */
  private async saveTestSpec(workItem: ADOWorkItem, content: string): Promise<string> {
    const fileName = `${this.sanitizeFileName(workItem.title)}.spec.ts`;
    const filePath = path.join(this.config.testSpecsPath, fileName);

    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

    await fs.promises.writeFile(filePath, content, 'utf8');
    Log.info(`Saved test spec: ${filePath}`);

    return filePath;
  }

  /**
   * Save page object file
   */
  private async savePageObject(workItem: ADOWorkItem, content: string): Promise<string> {
    const className = this.sanitizeClassName(workItem.title);
    const fileName = `${className}Page.ts`;
    const filePath = path.join(this.config.basePageObjectsPath, fileName);

    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

    await fs.promises.writeFile(filePath, content, 'utf8');
    Log.info(`Saved page object: ${filePath}`);

    return filePath;
  }

  /**
   * Sanitize work item title for class name
   */
  private sanitizeClassName(title: string): string {
    return title
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/\s+/g, ''); // Remove any remaining spaces
  }

  /**
   * Sanitize work item title for file name
   */
  private sanitizeFileName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 50); // Limit length
  }

  /**
   * Get default framework prompt if file not found
   */
  private getDefaultFrameworkPrompt(): string {
    return `You are a playwright test generator for the EY Infinity portal testing framework.

## Framework Guidelines
- Use readable business language in test descriptions
- Keep tests focused on user scenarios and acceptance criteria
- Use Given/When/Then structure for clarity
- Avoid technical Playwright code in test specs
- All assertions should be handled in page object methods
- Extend BasePage class for page objects
- Use role-based selectors when possible
- Include proper logging using Log utility

Generate comprehensive test scripts following these patterns.`;
  }
}
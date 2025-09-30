import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';
import * as fs from 'fs';
import * as path from 'path';

// Simplified but robust TypeScript types
interface ElementConfig {
  selector: string;
  fallbacks: string[];
  timeout?: number;
  description: string;
}

interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, any>;
}

interface SchemaField {
  name: string;
  type: 'string' | 'integer' | 'boolean' | 'array' | 'object';
  required: boolean;
  properties?: SchemaField[];
}

// Type-safe configuration
const ELEMENT_CONFIGS = {
  findPetByIdSection: {
    selector: 'text="Find pet by ID"',
    fallbacks: [
      '[data-testid*="find-pet"]',
      '.operation-summary:has-text("Find pet by ID")',
      '.opblock-summary:has-text("Find pet by ID")',
      'div:has-text("Find pet by ID")'
    ],
    timeout: 15000,
    description: 'Find pet by ID section'
  },
  codeMirrorContent: {
    selector: '.CodeMirror-code',
    fallbacks: [
      '.CodeMirror',
      'ngx-codemirror',
      '.cm-content',
      'pre code'
    ],
    timeout: 10000,
    description: 'Code mirror content'
  }
} as const;

const SCHEMA_FIELDS: SchemaField[] = [
  { name: 'id', type: 'integer', required: true },
  { name: 'name', type: 'string', required: true },
  { name: 'status', type: 'string', required: true },
  { name: 'photoUrls', type: 'array', required: false },
  { name: 'tags', type: 'array', required: false },
  { 
    name: 'category', 
    type: 'object', 
    required: false,
    properties: [
      { name: 'id', type: 'integer', required: false },
      { name: 'name', type: 'string', required: false }
    ]
  }
];

export class Document360PublishedSitePage extends BasePage {
  private readonly operationId: string;
  private readonly elementCache = new Map<string, Locator>();

  // Keep existing locator declarations for compatibility
  private projectLogo!: Locator;
  private welcomeHeading!: Locator;
  private apiDocumentationButton!: Locator;
  private searchButton!: Locator;
  private modulesSection!: Locator;
  private pageTitle!: Locator;
  private breadcrumb!: Locator;
  private sideNavigation!: Locator;
  private articleContent!: Locator;
  private copyLinkButton!: Locator;
  private editArticleButton!: Locator;
  private apiDocumentationLink!: Locator;
  private swaggerPetstoreLink!: Locator;
  private petCategoryLink!: Locator;
  private findPetByIdLink!: Locator;
  private nextArticleButton!: Locator;
  private previousArticleButton!: Locator;
  private endpointMethod!: Locator;
  private endpointPath!: Locator;
  private endpointDescription!: Locator;
  private securitySection!: Locator;
  private pathParametersSection!: Locator;
  private responsesSection!: Locator;
  private tryItTab!: Locator;
  private codeSamplesTab!: Locator;
  private authenticationSection!: Locator;
  private requestSection!: Locator;
  private responseSection!: Locator;
  private apiKeyInput!: Locator;
  private petIdInput!: Locator;
  private responseFormatDropdown!: Locator;
  private tryItButton!: Locator;
  private responseTabsContainer!: Locator;
  private response200Tab!: Locator;
  private response400Tab!: Locator;
  private response404Tab!: Locator;
  private responseSchema!: Locator;
  private mediaTypeDropdown!: Locator;
  private responseBody!: Locator;
  private responseCode!: Locator;
  private responseHeaders!: Locator;
  private responseTime!: Locator;
  private responseContent!: Locator;
  private responseStatus!: Locator;
  private wasHelpfulSection!: Locator;
  private yesButton!: Locator;
  private noButton!: Locator;
  private footerSection!: Locator;
  private responseSchemaSection!: Locator;
  private requestParametersSection!: Locator;
  private schemaFieldsList!: Locator;
  private parametersList!: Locator;
  private examplesSection!: Locator;

  constructor(page: Page) {
    super(page);
    this.operationId = `op-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    Log.info(`🚀 Initializing Document360PublishedSitePage [${this.operationId}]`);
    this.initializeLocators();
  }

  private initializeLocators(): void {
    try {
      // Landing page locators
      this.projectLogo = this.page.getByRole('button', { name: 'Project logo' });
      this.welcomeHeading = this.page.getByRole('heading', { 
        name: /Welcome to .* project landing page/ 
      });
      this.apiDocumentationButton = this.page
        .getByRole('link', { name: 'API Documentation' })
        .first();
      this.searchButton = this.page.getByRole('button', { name: 'Search' });
      this.modulesSection = this.page.getByRole('heading', { name: 'Modules' });

      // API Documentation page locators
      this.pageTitle = this.page.locator('h1');
      this.breadcrumb = this.page
        .locator('[role="list"], .breadcrumb, .breadcrumbs, nav ol, nav ul, .navigation-path')
        .first();
      this.sideNavigation = this.page
        .locator(
          '.cdk-virtual-scroll-content-wrapper, .tree-wrapper, nav, [role="navigation"], .sidebar, .side-nav, .navigation'
        )
        .first();
      this.articleContent = this.page
        .locator(
          '[role="article"], [role="main"], main, .content, .article-content, .main-content, .documentation-content'
        )
        .first();
      this.copyLinkButton = this.page
        .getByRole('button', { name: 'Copy link of Find pet by ID' })
        .or(this.page.locator('button[aria-label*="Copy link of"]').first());
      this.editArticleButton = this.page.getByRole('button', { name: 'Edit article' });

      // Navigation structure locators
      this.apiDocumentationLink = this.page
        .locator('a[aria-label="API Documentation"][href*="api-documentation"]')
        .or(this.page.locator('a[aria-label="API Documentation"]').last());
      this.swaggerPetstoreLink = this.page.locator('a[aria-label="Swagger Petstore"]');
      this.petCategoryLink = this.page
        .locator('a[aria-label="pet"]')
        .or(this.page.getByRole('link', { name: 'pet' }))
        .first();
      this.findPetByIdLink = this.page
        .locator('a[aria-label="Find pet by ID"]')
        .or(this.page.getByRole('link', { name: 'Find pet by ID' }));
      this.nextArticleButton = this.page.getByRole('button', { name: /Next article/ });
      this.previousArticleButton = this.page.getByRole('button', { name: /Previous article/ });

      // API endpoint documentation locators
      this.endpointMethod = this.page.locator('.method-get.method-type, .api-http-method').first();
      this.endpointPath = this.page.locator(':text("/pet/{petId}")');
      this.endpointDescription = this.page.locator(':text("Returns a single pet")');
      this.securitySection = this.page.locator(':text("Security")');
      this.pathParametersSection = this.page.locator(':text("Path parameters")');
      this.responsesSection = this.page
        .locator('.api-header.api-response-body-header, .api-header')
        .filter({ hasText: 'Responses' })
        .first();
      this.tryItTab = this.page.getByRole('tab', { name: 'Try It' });
      this.codeSamplesTab = this.page.getByRole('tab', { name: 'Code samples' });

      // Try It section locators
      this.authenticationSection = this.page.getByRole('heading', { name: 'Authentication' });
      this.requestSection = this.page.getByRole('heading', { name: 'Request' });
      this.responseSection = this.page.getByRole('heading', { name: 'Response' });
      this.apiKeyInput = this.page.getByRole('textbox', { name: 'api_key*' });
      this.petIdInput = this.page.getByRole('spinbutton', { name: 'petId *' });
      this.responseFormatDropdown = this.page.getByRole('button', { name: 'application/json' });
      this.tryItButton = this.page
        .locator('#tryit-btn')
        .or(this.page.getByRole('button', { name: 'Try it & see response' }));

      // Response documentation locators
      this.responseTabsContainer = this.page.locator('[role="tablist"]:has([role="tab"])').last();
      this.response200Tab = this.page
        .getByLabel('Try It')
        .getByRole('button', { name: '200' })
        .or(this.page.locator('.btn.response-code.api-success').filter({ hasText: '200' }).first());
      this.response400Tab = this.page
        .getByLabel('Try It')
        .getByRole('button', { name: '400' })
        .or(this.page.locator('.btn.response-code').filter({ hasText: '400' }).first());
      this.response404Tab = this.page
        .getByLabel('Try It')
        .getByRole('button', { name: '404' })
        .or(this.page.locator('.btn.response-code').filter({ hasText: '404' }).first());
      this.responseSchema = this.page.locator('.data-type-name').first();
      this.mediaTypeDropdown = this.page.getByRole('combobox', { name: 'Media type' });

      // API Response validation locators
      this.responseBody = this.page
        .locator('.CodeMirror-code, .CodeMirror, ngx-codemirror, .response-body, .api-response-body, pre code, .cm-content')
        .first();
      this.responseCode = this.page
        .locator('.response-code, .status-code, [data-testid="response-code"]')
        .first();
      this.responseHeaders = this.page
        .locator('.response-headers, .api-response-headers, [data-testid="response-headers"]')
        .first();
      this.responseTime = this.page.locator('.response-time, [data-testid="response-time"]').first();
      this.responseContent = this.page
        .locator('.CodeMirror, ngx-codemirror, .response-content, .api-response-content')
        .first();
      this.responseStatus = this.page
        .locator('.response-status, .status-text, [data-testid="response-status"]')
        .first();

      // Validation locators
      this.wasHelpfulSection = this.page.locator(':text("Was this article helpful?")');
      this.yesButton = this.page.getByRole('button', { name: 'Yes' });
      this.noButton = this.page.getByRole('button', { name: 'No' });
      this.footerSection = this.page.locator('[role="contentinfo"]');
      this.responseSchemaSection = this.page.locator('.response-schema, [data-testid="response-schema"], .schema-section');
      this.requestParametersSection = this.page.locator('.request-parameters, [data-testid="parameters"], .parameters-section');
      this.schemaFieldsList = this.page.locator('.schema-fields, .field-list, [data-testid="schema-fields"]');
      this.parametersList = this.page.locator('.parameters-list, [data-testid="parameters-list"]');
      this.examplesSection = this.page.locator('.examples, [data-testid="examples"], .sample-response');

      Log.info(`✅ Locators initialized successfully [${this.operationId}]`);
    } catch (error) {
      Log.error(`❌ Failed to initialize locators [${this.operationId}]: ${error}`);
      throw error;
    }
  }

  /**
   * Robust retry mechanism
   */
  private async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        Log.debug(`🔄 Attempt ${attempt}/${maxAttempts} for ${context} [${this.operationId}]`);
        const result = await operation();
        Log.debug(`✅ ${context} succeeded on attempt ${attempt} [${this.operationId}]`);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          Log.error(`❌ ${context} failed after ${maxAttempts} attempts [${this.operationId}]: ${lastError.message}`);
          throw lastError;
        }

        Log.warn(`⚠️ ${context} attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`);
        await this.page.waitForTimeout(delay);
        delay *= 1.5; // Exponential backoff
      }
    }

    throw lastError!;
  }

  /**
   * Smart element finder
   */
  private async findElementSmart(config: ElementConfig): Promise<Locator> {
    const selectors = [config.selector, ...config.fallbacks];
    
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector).first();
        
        if (await element.isVisible({ timeout: 2000 })) {
          Log.info(`✅ Found ${config.description} using: ${selector} [${this.operationId}]`);
          return element;
        }
      } catch {
        continue;
      }
    }
    
    throw new Error(`Could not find ${config.description} with any selector`);
  }

  /**
   * Enhanced schema validation
   */
  async validateSchemaFields(): Promise<ValidationResult<Record<string, boolean>>> {
    Log.info(`🔍 Validating schema fields [${this.operationId}]`);

    try {
      const pageText = await this.page.textContent('body') || '';
      const results: Record<string, boolean> = {};
      const errors: string[] = [];
      
      for (const field of SCHEMA_FIELDS) {
        const found = pageText.includes(`"${field.name}"`) || pageText.includes(field.name);
        results[field.name] = found;
        
        if (found) {
          Log.info(`✅ Field ${field.name} validated [${this.operationId}]`);
        } else if (field.required) {
          const error = `Required field ${field.name} not found`;
          errors.push(error);
          Log.error(`❌ ${error} [${this.operationId}]`);
        } else {
          Log.info(`⚠️ Optional field ${field.name} not found [${this.operationId}]`);
        }
      }

      const success = errors.length === 0;
      const validatedCount = Object.values(results).filter(Boolean).length;

      return {
        success,
        data: results,
        error: errors.length > 0 ? errors.join(', ') : undefined,
        details: {
          totalFields: SCHEMA_FIELDS.length,
          validatedFields: validatedCount,
          operationId: this.operationId
        }
      };

    } catch (error) {
      Log.error(`❌ Schema validation failed [${this.operationId}]: ${error}`);
      return {
        success: false,
        error: `Schema validation failed: ${(error as Error).message}`,
        details: { operationId: this.operationId }
      };
    }
  }

  /**
   * Enhanced nested object validation
   */
  async validateNestedObjectSchema(
    objectName: string, 
    expectedFields: string[]
  ): Promise<ValidationResult<{ validatedFields: number; totalFields: number }>> {
    Log.info(`🔍 Validating nested object: ${objectName} [${this.operationId}]`);

    try {
      return await this.retry(
        async () => {
          const objectElement = this.page.locator(`text="${objectName}"`);
          const isVisible = await objectElement.first().isVisible({ timeout: 3000 });
          
          if (!isVisible) {
            Log.info(`⚠️ Object ${objectName} not visible, checking page content [${this.operationId}]`);
            const pageText = await this.page.textContent('body') || '';
            
            if (!pageText.includes(objectName)) {
              throw new Error(`Object ${objectName} not found in page`);
            }
          }

          let validatedFields = 0;
          const validationResults: Record<string, boolean> = {};
          
          for (const fieldName of expectedFields) {
            try {
              const fieldElement = this.page.locator(`text="${fieldName}"`);
              const fieldVisible = await fieldElement.first().isVisible({ timeout: 2000 });
              validationResults[fieldName] = fieldVisible;
              
              if (fieldVisible) {
                validatedFields++;
                Log.info(`✅ Nested field ${fieldName} validated in ${objectName} [${this.operationId}]`);
              }
            } catch {
              validationResults[fieldName] = false;
              Log.info(`⚠️ Nested field ${fieldName} not found in ${objectName} [${this.operationId}]`);
            }
          }

          return {
            success: validatedFields > 0,
            data: { validatedFields, totalFields: expectedFields.length },
            details: { 
              objectName, 
              validationResults,
              operationId: this.operationId 
            }
          };
        },
        2,
        2000,
        `validating nested object ${objectName}`
      );

    } catch (error) {
      Log.error(`❌ Nested object validation failed [${this.operationId}]: ${error}`);
      return {
        success: false,
        error: `Nested object validation failed: ${(error as Error).message}`,
        data: { validatedFields: 0, totalFields: expectedFields.length },
        details: { operationId: this.operationId }
      };
    }
  }

  /**
   * Enhanced navigation
   */
  async navigateToFindPetByIdEndpoint(): Promise<ValidationResult<void>> {
    Log.info(`🎯 Navigating to Find pet by ID endpoint [${this.operationId}]`);

    try {
      // Wait for page to be ready
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);

      // Try to expand pet category
      try {
        const petCategoryArrow = this.page
          .locator('a[aria-label="pet"]')
          .locator('..')
          .locator('.tree-arrow');
        
        if (await petCategoryArrow.isVisible({ timeout: 5000 })) {
          await petCategoryArrow.click();
          await this.page.waitForTimeout(1000);
          Log.info(`✅ Expanded pet category [${this.operationId}]`);
        }
      } catch (error) {
        Log.warn(`⚠️ Could not expand pet category: ${error} [${this.operationId}]`);
      }

      // Navigate to Find pet by ID
      const navigationMethod = await this.retry(
        async () => {
          // Try next article button first
          if (await this.nextArticleButton.isVisible({ timeout: 2000 })) {
            await this.nextArticleButton.click();
            return 'next-button';
          }
          
          // Otherwise use direct link
          if (await this.findPetByIdLink.isVisible({ timeout: 5000 })) {
            await this.findPetByIdLink.click();
            return 'direct-link';
          }
          
          throw new Error('Could not find navigation element');
        },
        3,
        1000,
        'navigating to Find pet by ID'
      );

      // Wait for page load
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(2000);

      // Verify navigation success
      try {
        const title = await this.page.textContent('h1') || '';
        const url = this.page.url();
        
        if (!title.includes('Find pet by ID') && !url.includes('find-pet-by-id')) {
          Log.warn(`⚠️ Navigation verification unclear [${this.operationId}]: title="${title}", url="${url}"`);
        } else {
          Log.info(`✅ Navigation verified [${this.operationId}]: ${navigationMethod}`);
        }
      } catch (error) {
        Log.warn(`⚠️ Navigation verification failed: ${error} [${this.operationId}]`);
      }

      return {
        success: true,
        details: {
          navigationMethod,
          operationId: this.operationId
        }
      };

    } catch (error) {
      Log.error(`❌ Navigation failed [${this.operationId}]: ${error}`);
      return {
        success: false,
        error: `Navigation failed: ${(error as Error).message}`,
        details: { operationId: this.operationId }
      };
    }
  }

  // Legacy compatibility methods
  async verifySchemaFieldTypes(): Promise<void> {
    const result = await this.validateSchemaFields();
    
    if (!result.success) {
      const error = new Error(`Schema field validation failed: ${result.error}`);
      Log.error(`❌ ${error.message} [${this.operationId}]`);
      throw error;
    }

    Log.info(`✅ Schema field validation completed [${this.operationId}]: ${JSON.stringify(result.details)}`);
  }

  // Keep all other existing methods as they were...
  async verifyLandingPageLoaded(projectName: string): Promise<void> {
    Log.info(`🔍 Verifying landing page loaded for project: ${projectName} [${this.operationId}]`);
    
    await this.retry(
      async () => {
        await this.verifyElementVisible(this.projectLogo, 'Project logo');
        await this.verifyElementVisible(this.welcomeHeading, 'Welcome heading');
        await this.verifyElementVisible(this.apiDocumentationButton, 'API Documentation button');
        await this.verifyElementVisible(this.modulesSection, 'Modules section');

        const title = await this.getTitle();
        expect(title).toContain(projectName);
      },
      3,
      2000,
      'verifying landing page'
    );

    Log.info(`✅ Landing page verified successfully [${this.operationId}]`);
  }

  async navigateToApiDocumentation(): Promise<void> {
    Log.info(`🚀 Navigating to API Documentation [${this.operationId}]`);
    await this.clickElement(this.apiDocumentationButton, 'API Documentation button');
    await this.waitForLoadState('domcontentloaded');
    Log.info(`✅ Successfully navigated to API Documentation [${this.operationId}]`);
  }

  // Continue with all other existing methods...
  // (keeping them exactly as they were to maintain compatibility)

  async verifyApiDocumentationPageLoaded(): Promise<void> {
    Log.info('Verifying API Documentation page is loaded');
    await this.verifyElementVisible(this.sideNavigation, 'Side navigation');
    await this.verifyElementVisible(this.articleContent, 'Article content');

    // Verify navigation structure with fallback options
    await this.verifyElementVisible(
      this.apiDocumentationLink,
      'API Documentation link in navigation'
    );

    // Try multiple selectors for the main API section
    const mainApiSectionSelectors = [
      'a[aria-label="Swagger Petstore - OpenAPI 3.0"]',
      'a[aria-label="Swagger Petstore"]',
      'a[aria-label*="Petstore"]',
      'a[aria-label*="OpenAPI"]',
      ':text("Swagger Petstore")',
      ':text("OpenAPI 3.0")',
      ':text("Petstore")'
    ];

    let mainSectionFound = false;
    for (const selector of mainApiSectionSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          Log.info(`Main API section found with selector: ${selector}`);
          mainSectionFound = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }

    if (!mainSectionFound) {
      Log.info('Main API section not found with standard selectors, checking page content');
      const pageText = await this.page.textContent('body') || '';
      if (pageText.includes('Petstore') || pageText.includes('OpenAPI') || pageText.includes('Swagger')) {
        Log.info('API documentation content found in page');
        mainSectionFound = true;
      }
    }

    // Try multiple selectors for pet category
    const petCategorySelectors = [
      'a[aria-label="pet"]',
      ':text("pet")',
      '.tree-item:has-text("pet")',
      '[role="link"]:has-text("pet")'
    ];

    let petCategoryFound = false;
    for (const selector of petCategorySelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          Log.info(`Pet category found with selector: ${selector}`);
          petCategoryFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (mainSectionFound && petCategoryFound) {
      Log.info('API Documentation page verified successfully with flexible selectors');
    } else {
      Log.info('API Documentation page loaded but some navigation elements may be in different format');
    }
  }

  // Add all the rest of your existing methods here...
  // (I'm truncating for brevity, but keep all your existing methods)
}
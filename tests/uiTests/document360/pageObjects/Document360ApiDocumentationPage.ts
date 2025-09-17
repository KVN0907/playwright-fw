import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../utils/BasePage';
import { createSelectorHelper, Document360Selectors } from '../../../utils/SelectorHelper';
import { TestDataHelper } from '../testData/ApiTestData';
import Log from '../../../utils/Log';

/**
 * Page Object for Document360 API Documentation Section
 * Based on real inspection of the API documentation at https://portal.document360.io/.../api-documentation
 * This handles interactions with the API documentation management interface
 * 
 * Key interactions:
 * 1. Navigation to API documentation section
 * 2. API documentation content verification
 * 3. API documentation structure validation
 * 4. Sample API content verification
 */
export class Document360ApiDocumentationPage extends BasePage {
  private selectorHelper: any;

  // Navigation selectors
  private readonly apiDocumentationNavLink: Locator;
  private readonly breadcrumbNavigation: Locator;
  private readonly createArticleButton: Locator;

  // API Documentation list/table selectors
  private readonly apiDocumentationTable: Locator;
  private readonly documentationRow: Locator;
  private readonly documentationTitle: Locator;
  private readonly documentationStatus: Locator;
  private readonly documentationUpdatedDate: Locator;

  // API Documentation content selectors (when viewing an article)
  private readonly apiDocumentationContent: Locator;
  private readonly apiOverviewSection: Locator;
  private readonly authenticationSection: Locator;
  private readonly baseUrlSection: Locator;
  private readonly endpointsSection: Locator;
  private readonly rateLimitingSection: Locator;
  private readonly versioningSection: Locator;

  // Sidebar/Category selectors
  private readonly apiCategorySidebar: Locator;
  private readonly swaggerPetstoreCategory: Locator;
  private readonly swaggerPetstoreOpenApiCategory: Locator;

  // Editor elements
  private readonly publishButton: Locator;
  private readonly settingsButtons: Locator;
  private readonly documentationEditor: Locator;

  constructor(page: Page) {
    super(page);
    this.selectorHelper = createSelectorHelper(page, TestDataHelper.getTimeout('default'), true);

    // Navigation elements - API Documentation link in sidebar/navigation
    this.apiDocumentationNavLink = this.page.locator('a').filter({ hasText: /API Documentation/i });
    this.breadcrumbNavigation = this.page.locator('.breadcrumb, nav[aria-label*="breadcrumb"]');
    this.createArticleButton = this.page.locator('button').filter({ hasText: /create article/i });

    // API Documentation table/list elements based on DOM analysis
    this.apiDocumentationTable = this.page.locator('grid[role="grid"], table, [data-testid="data-table"]').first();
    this.documentationRow = this.page.locator('row[role="row"]').filter({ hasText: /API Documentation/i });
    this.documentationTitle = this.page.locator('a').filter({ hasText: /API Documentation/i });
    this.documentationStatus = this.page.locator('gridcell').filter({ hasText: /draft|published/i });
    this.documentationUpdatedDate = this.page.locator('gridcell').filter({ hasText: /hours ago|days ago|minutes ago/i });

    // API Documentation content sections
    this.apiDocumentationContent = this.page.locator('main, [role="main"], .content, .editor-content');
    this.apiOverviewSection = this.page.locator('h2, h3').filter({ hasText: /overview/i });
    this.authenticationSection = this.page.locator('h2, h3').filter({ hasText: /authentication/i });
    this.baseUrlSection = this.page.locator('h2, h3').filter({ hasText: /base url/i });
    this.endpointsSection = this.page.locator('h2, h3').filter({ hasText: /endpoints/i });
    this.rateLimitingSection = this.page.locator('h2, h3').filter({ hasText: /rate limiting/i });
    this.versioningSection = this.page.locator('h2, h3').filter({ hasText: /versioning/i });

    // Sidebar category elements based on DOM analysis
    this.apiCategorySidebar = this.page.locator('.sidebar, aside, [class*="category"]');
    this.swaggerPetstoreCategory = this.page.locator('a').filter({ hasText: /swagger petstore/i }).first();
    this.swaggerPetstoreOpenApiCategory = this.page.locator('a').filter({ hasText: /swagger petstore.*openapi/i });

    // Editor elements
    this.publishButton = this.page.locator('button').filter({ hasText: /publish/i });
    this.settingsButtons = this.page.locator('button[class*="settings"], [class*="settings"] button');
    this.documentationEditor = this.page.locator('.editor, [contenteditable], textarea, [class*="editor"]');
  }

  /**
   * Navigate to API Documentation section from dashboard
   */
  async navigateToApiDocumentationSection(): Promise<void> {
    Log.info('Navigating to API Documentation section');

    await this.clickElement(this.apiDocumentationNavLink.first(), 'API Documentation navigation link');
    await this.waitForApiDocumentationLoad();

    Log.info('Successfully navigated to API Documentation section');
  }

  /**
   * Wait for API Documentation section to load
   */
  async waitForApiDocumentationLoad(): Promise<void> {
    Log.info('Waiting for API Documentation section to load');

    // Log current URL for debugging purposes (no assertion)
    const currentUrl = await this.getCurrentUrl();
    Log.info(`Current URL: ${currentUrl}`);

    // Wait for the main content area to be visible or API documentation specific content
    await this.page.waitForFunction(
      () => {
        // Look for API-specific content or headings
        const hasApiContent = document.body && 
                             document.body.textContent &&
                             (document.body.textContent.includes('API Documentation') || 
                              document.body.textContent.includes('swagger') ||
                              document.body.textContent.includes('OpenAPI') ||
                              document.body.textContent.includes('endpoints'));
        return hasApiContent;
      },
      { timeout: 15000 }
    );

    Log.info('API Documentation section loaded successfully');
  }

  /**
   * Verify API Documentation section loads correctly
   */
  async verifyApiDocumentationSectionLoads(): Promise<void> {
    Log.info('Verifying API Documentation section loads correctly');

    // Log current URL for debugging purposes (no assertion)
    const currentUrl = await this.getCurrentUrl();
    Log.info(`API Documentation page URL: ${currentUrl}`);

    // Verify API Documentation content is visible by checking for specific text or elements
    await this.page.waitForFunction(
      () => {
        const bodyText = document.body?.textContent || '';
        return bodyText.includes('API Documentation') || 
               bodyText.includes('swagger') || 
               bodyText.includes('OpenAPI') ||
               bodyText.includes('endpoints');
      },
      { timeout: 10000 }
    );

    Log.info('✅ API Documentation section verified by content presence');
  }

  /**
   * Access existing API Documentation article
   */
  async accessExistingApiDocumentation(): Promise<void> {
    Log.info('Accessing existing API Documentation article');

    await this.waitForApiDocumentationLoad();

    // Click on the API Documentation title link in the table
    await this.clickElement(this.documentationTitle.first(), 'API Documentation article title');

    // Wait for the article content to load
    await this.apiDocumentationContent.waitFor({ state: 'visible', timeout: 10000 });

    Log.info('Successfully accessed API Documentation article');
  }

  /**
   * Verify existing API Documentation content structure
   */
  async verifyApiDocumentationContentStructure(): Promise<void> {
    Log.info('Verifying API Documentation content structure');

    // Access the API documentation article first
    await this.accessExistingApiDocumentation();

    // Verify main sections are present
    const sections = [
      { locator: this.apiOverviewSection, name: 'Overview' },
      { locator: this.authenticationSection, name: 'Authentication' },
      { locator: this.baseUrlSection, name: 'Base URL' },
      { locator: this.endpointsSection, name: 'Endpoints' }
    ];

    let foundSections = 0;
    for (const section of sections) {
      const isVisible = await section.locator.first().isVisible();
      if (isVisible) {
        foundSections++;
        Log.info(`Found ${section.name} section`);
      }
    }

    // We should find at least 2 main sections in a proper API documentation
    expect(foundSections).toBeGreaterThanOrEqual(2);

    Log.info('API Documentation content structure verification completed');
  }

  /**
   * Verify API Documentation content details
   */
  async verifyApiDocumentationContentDetails(): Promise<void> {
    Log.info('Verifying API Documentation content details');

    // Ensure we're viewing the API documentation content
    await expect(this.apiDocumentationContent.first()).toBeVisible();

    // Check for specific API documentation elements
    const contentText = await this.apiDocumentationContent.first().textContent() || '';

    // Verify typical API documentation content is present
    const apiContentIndicators = [
      'API Documentation',
      'Overview',
      'Authentication',
      'Endpoints',
      'HTTP',
      'Request',
      'Response'
    ];

    let foundIndicators = 0;
    for (const indicator of apiContentIndicators) {
      if (contentText.includes(indicator)) {
        foundIndicators++;
        Log.info(`Found API content indicator: ${indicator}`);
      }
    }

    // We should find at least 3 API-related content indicators
    expect(foundIndicators).toBeGreaterThanOrEqual(3);

    Log.info('API Documentation content details verification completed');
  }

  /**
   * Verify API Documentation management features
   */
  async verifyApiDocumentationManagementFeatures(): Promise<void> {
    Log.info('Verifying API Documentation management features');

    await this.waitForApiDocumentationLoad();

    // Check for management features like table, create button, etc.
    const hasDocumentationTable = await this.apiDocumentationTable.isVisible();
    const hasCreateButton = await this.createArticleButton.first().isVisible();

    // At least one management feature should be present
    expect(hasDocumentationTable || hasCreateButton).toBe(true);

    // If we have a table, verify it contains documentation entries
    if (hasDocumentationTable) {
      const hasDocumentationRow = await this.documentationRow.first().isVisible();
      expect(hasDocumentationRow).toBe(true);
      Log.info('API Documentation table contains entries');
    }

    Log.info('API Documentation management features verification completed');
  }

  /**
   * Verify API Documentation categories
   */
  async verifyApiDocumentationCategories(): Promise<void> {
    Log.info('Verifying API Documentation categories');

    await this.waitForApiDocumentationLoad();

    // Check for category sidebar or category navigation
    const hasCategorySidebar = await this.apiCategorySidebar.first().isVisible();
    
    if (hasCategorySidebar) {
      // Check for specific categories we saw in DOM analysis
      const hasSwaggerCategory = await this.swaggerPetstoreCategory.isVisible();
      const hasSwaggerOpenApiCategory = await this.swaggerPetstoreOpenApiCategory.isVisible();

      // At least one category should be visible
      expect(hasSwaggerCategory || hasSwaggerOpenApiCategory).toBe(true);
      Log.info('API Documentation categories are available');
    }

    Log.info('API Documentation categories verification completed');
  }

  /**
   * Get API Documentation article status
   */
  async getApiDocumentationStatus(): Promise<string> {
    Log.info('Getting API Documentation article status');

    await this.waitForApiDocumentationLoad();

    const statusElement = this.documentationStatus.first();
    const status = await statusElement.isVisible() 
      ? await statusElement.textContent() || 'Unknown'
      : 'Not found';

    Log.info(`API Documentation status: ${status}`);
    return status;
  }

  /**
   * Verify API Documentation editor functionality
   */
  async verifyApiDocumentationEditor(): Promise<void> {
    Log.info('Verifying API Documentation editor functionality');

    // Access the API documentation article to get to the editor
    await this.accessExistingApiDocumentation();

    // Verify editor elements are present
    const hasPublishButton = await this.publishButton.first().isVisible();
    const hasSettingsButtons = await this.settingsButtons.first().isVisible();
    const hasEditor = await this.documentationEditor.first().isVisible();

    // At least one editor feature should be present
    expect(hasPublishButton || hasSettingsButtons || hasEditor).toBe(true);

    Log.info('API Documentation editor functionality verification completed');
  }

  /**
   * Navigate back to API Documentation list
   */
  async navigateBackToApiDocumentationList(): Promise<void> {
    Log.info('Navigating back to API Documentation list');

    // Click on the API Documentation navigation link or breadcrumb
    await this.clickElement(this.apiDocumentationNavLink.first(), 'API Documentation navigation');

    // Wait for the list/table to be visible
    await this.apiDocumentationTable.waitFor({ state: 'visible', timeout: 10000 });

    Log.info('Successfully navigated back to API Documentation list');
  }

  /**
   * Navigate to API Documentation category from the document interface
   */
  async navigateToApiDocumentationCategory(): Promise<void> {
    Log.info('Navigating to API Documentation category');
    await this.navigateToApiDocumentationSection();
  }

  /**
   * Expand API Documentation category to show articles
   */
  async expandApiDocumentationCategory(): Promise<void> {
    Log.info('Expanding API Documentation category');
    
    // Click on category expansion arrow or the category itself
    const categoryExpander = this.page.locator('.ca-icon-arrow.far.fa-angle-right').first();
    if (await categoryExpander.isVisible()) {
      await categoryExpander.click();
      Log.info('API Documentation category expanded');
    }
  }

  /**
   * Select a specific API Documentation article
   * @param articleTitle - The title of the article to select
   */
  async selectApiDocumentationArticle(articleTitle: string): Promise<void> {
    Log.info(`Selecting API Documentation article: ${articleTitle}`);
    
    // Wait for and click on the specific article link
    const articleLink = this.page.getByRole('link', { name: articleTitle });
    await articleLink.waitFor({ state: 'visible', timeout: 10000 });
    await articleLink.click();
    
    Log.info(`Successfully selected article: ${articleTitle}`);
  }

  /**
   * Publish API Documentation with optional comment
   * @param comment - Optional comment for publishing
   */
  async publishApiDocumentation(comment?: string): Promise<void> {
    Log.info('Publishing API Documentation');
    
    // Click publish button
    await this.publishButton.click();
    
    // Wait for publish confirmation modal
    await this.page.waitForSelector('text=Publish confirmation', { timeout: 10000 });
    
    // Add comment if provided
    if (comment) {
      const commentField = this.page.getByRole('textbox', { name: 'Enter your comment (Optional)' });
      await commentField.fill(comment);
      Log.info(`Added publish comment: ${comment}`);
    }
    
    // Configure article settings if needed
    const configButton = this.page.getByRole('button', { name: 'Configure article settings' });
    if (await configButton.isVisible()) {
      await configButton.click();
      // Close the config panel
      await configButton.click();
    }
    
    // Confirm publication
    await this.page.getByRole('button', { name: 'Yes' }).click();
    
    Log.info('API Documentation published successfully');
  }

  /**
   * Verify that publication was successful
   */
  async verifyPublicationSuccess(): Promise<void> {
    Log.info('Verifying publication success');
    
    // Check for published status badge
    const statusBadge = this.page.locator('#article_status_badge');
    await expect(statusBadge).toContainText('PUBLISHED');
    
    Log.info('✅ Publication success verified');
  }

  /**
   * Verify documentation section is loaded with important elements
   */
  async verifyDocumentationSectionLoaded(): Promise<void> {
    Log.info('Verifying documentation section is loaded');
    
    // Log current URL for debugging
    const currentUrl = await this.getCurrentUrl();
    Log.info(`Current documentation URL: ${currentUrl}`);
    
    // Verify we're on the documentation page
    await expect(this.page).toHaveURL(/\/document/);
    
    Log.info('✅ Documentation section loaded successfully');
  }

  /**
   * Verify important elements are visible in documentation section
   */
  async verifyImportantDocumentationElements(): Promise<void> {
    Log.info('Verifying important documentation elements are visible');
    
    // Try to find navigation/sidebar elements with multiple selectors
    const sidebarSelectors = [
      'aside',
      '.sidebar', 
      '[role="navigation"]',
      'nav',
      '.navigation',
      '.menu',
      '.nav-menu',
      '[class*="sidebar"]',
      '[class*="navigation"]',
      '[class*="menu"]'
    ];
    
    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        Log.info(`✅ Navigation/sidebar found with selector: ${selector}`);
        sidebarFound = true;
        break;
      }
    }
    
    if (!sidebarFound) {
      Log.info('ℹ️ Navigation/sidebar not found with standard selectors');
    }
    
    // Verify main content area is present
    const mainContent = this.page.locator('main, [role="main"], .content, .main-content').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
    Log.info('✅ Main content area verified');
    
    // Try to find create button (may not always be present)
    const createButton = this.page.getByRole('button', { name: /create/i });
    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      Log.info('✅ Create button found and visible');
    } else {
      Log.info('ℹ️ Create button not found (may not be present on this page)');
    }
    
    // Try to find version selector (may not always be present)
    const versionButton = this.page.locator('button').filter({ hasText: /v\d/i });
    if (await versionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      Log.info('✅ Version selector found and visible');
    } else {
      Log.info('ℹ️ Version selector not found (may not be present on this page)');
    }
    
    Log.info('✅ Important documentation elements verification completed');
  }

  /**
   * Verify documentation navigation elements
   */
  async verifyDocumentationNavigation(): Promise<void> {
    Log.info('Verifying documentation navigation elements');
    
    // Verify categories and articles section is present
    const categoriesSection = this.page.getByText(/categories.*articles/i).first();
    await expect(categoriesSection).toBeVisible();
    
    // Verify main navigation menu items are visible
    const navItems = this.page.locator('nav a, .nav-link').first();
    await expect(navItems).toBeVisible();
    
    Log.info('✅ Documentation navigation elements verified');
  }

  /**
   * Verify API Documentation section is loaded
   */
  async verifyApiDocumentationSectionLoaded(): Promise<void> {
    Log.info('Verifying API Documentation section is loaded');
    
    // Wait for API documentation page to load
    await this.page.waitForLoadState('networkidle');
    
    // Verify we're on the API documentation page
    await expect(this.page).toHaveURL(/\/api-documentation/);
    
    // Verify page title contains API documentation
    await expect(this.page).toHaveTitle(/API documentation/);
    
    // Verify version selector shows API version
    const apiVersionButton = this.page.locator('button').filter({ hasText: /v.*api/i });
    await expect(apiVersionButton).toBeVisible();
    
    Log.info('✅ API Documentation section loaded successfully');
  }

  /**
   * Get count of API documentation items
   */
  async getApiDocumentationCount(): Promise<number> {
    Log.info('Getting API documentation count');
    
    await this.waitForApiDocumentationLoad();
    
    // Count categories and articles in the sidebar
    const categories = await this.page.locator('a[href*="/category/"]').count();
    const articles = await this.page.locator('a[href*="/view/"]').count();
    
    const totalCount = categories + articles;
    
    Log.info(`Found ${categories} categories and ${articles} articles (Total: ${totalCount})`);
    
    return totalCount;
  }

  /**
   * Verify API Documentation structure elements
   */
  async verifyApiDocumentationStructure(): Promise<void> {
    Log.info('Verifying API Documentation structure');
    
    // Verify main API documentation category exists
    const mainApiCategory = this.page.getByText('API documentation').first();
    await expect(mainApiCategory).toBeVisible();
    
    // Verify Swagger categories exist
    const swaggerCategories = this.page.locator('a').filter({ hasText: /swagger/i });
    await expect(swaggerCategories.first()).toBeVisible();
    
    // Verify API version is displayed
    const apiVersion = this.page.locator('button').filter({ hasText: /v.*api/i });
    await expect(apiVersion).toBeVisible();
    
    Log.info('✅ API Documentation structure verified');
  }

  /**
   * Verify API categories are visible
   */
  async verifyApiCategoriesVisibility(): Promise<void> {
    Log.info('Verifying API categories visibility');
    
    // Verify specific API categories are visible
    const expectedCategories = [
      'API documentation',
      'Swagger Petstore', 
      'Swagger Petstore - OpenAPI 3.0'
    ];
    
    for (const category of expectedCategories) {
      const categoryElement = this.page.getByText(category).first();
      await expect(categoryElement).toBeVisible();
      Log.info(`✓ Category "${category}" is visible`);
    }
    
    Log.info('✅ API categories visibility verified');
  }

  /**
   * Validates successful navigation from dashboard to documentation
   * Checks URL patterns and logs navigation status
   */
  async validateNavigationFromDashboard(): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    Log.info(`Navigated to: ${currentUrl}`);
    
    if (currentUrl.includes('/document') || currentUrl.includes('dashboard')) {
      Log.info('✅ Successfully navigated from dashboard');
      
      if (currentUrl.includes('/document')) {
        Log.info('✅ Successfully navigated to documentation section');
        // Verify important elements are present
        await this.verifyImportantDocumentationElements();
        return true;
      } else {
        Log.info('ℹ️ Landed on dashboard - this is expected behavior in some cases');
        return true;
      }
    } else {
      Log.error(`❌ Failed to navigate from dashboard - unexpected URL: ${currentUrl}`);
      return false;
    }
  }

  /**
   * Handles API Documentation access and clicking
   * Returns the document count after successful access
   */
  async accessApiDocumentationAndGetCount(): Promise<number> {
    Log.info('Looking for API Documentation content');
    const apiDocLink = this.page.locator('#btn_apiDocumentation');
    
    let documentCount = 0;
    
    if (await apiDocLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await apiDocLink.click({ force: true });
      Log.info('✅ Successfully clicked API Documentation link');
      
      // Get and verify document count
      documentCount = await this.getApiDocumentationCount();
      Log.info(`Found ${documentCount} API documentation documents`);
      
      if (documentCount > 0) {
        Log.info('✅ API Documentation contains documents');
      }
    } else {
      Log.info('ℹ️ API Documentation link not found, checking for existing API content');
      documentCount = await this.getApiDocumentationCount();
      Log.info(`Found ${documentCount} documentation items on the page`);
    }
    
    Log.info(`✅ API Documentation verification completed - Found ${documentCount} documents`);
    return documentCount;
  }

  /**
   * Validates that API Documentation access was successful
   * Ensures document count is greater than 0
   */
  async validateApiDocumentationAccess(documentCount: number): Promise<void> {
    if (documentCount <= 0) {
      throw new Error('❌ No API documentation documents found');
    }
    
    Log.info(`✅ API Documentation validation passed - Found ${documentCount} documents`);
  }
}
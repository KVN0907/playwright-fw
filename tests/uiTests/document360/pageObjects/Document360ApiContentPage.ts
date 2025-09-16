import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../utils/BasePage';
import { createSelectorHelper } from '../../../utils/SelectorHelper';
import { ApiTestData, TestDataHelper } from '../testData/ApiTestData';
import Log from '../../../utils/Log';

/**
 * Page Object for Document360 API Documentation Content Management
 * Handles API documentation viewing, editing, and management features
 */
export class Document360ApiContentPage extends BasePage {
  private selectorHelper: any;

  // Content navigation
  private readonly sidebar: Locator;
  private readonly categoryList: Locator;
  private readonly endpointList: Locator;
  private readonly searchBox: Locator;

  // Content display
  private readonly contentArea: Locator;
  private readonly apiTitle: Locator;
  private readonly apiDescription: Locator;
  private readonly endpointDetails: Locator;
  private readonly codeExamples: Locator;
  private readonly responseExamples: Locator;

  // Interactive elements
  private readonly tryItButton: Locator;
  private readonly copyCodeButton: Locator;
  private readonly expandCollapseButtons: Locator;
  private readonly filterDropdown: Locator;

  // Edit mode elements
  private readonly editButton: Locator;
  private readonly saveButton: Locator;
  private readonly cancelEditButton: Locator;
  private readonly previewButton: Locator;

  // Category management
  private readonly addCategoryButton: Locator;
  private readonly categoryContextMenu: Locator;
  private readonly reorderButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.selectorHelper = createSelectorHelper(page, TestDataHelper.getTimeout('default'), true);

    // Content navigation
    this.sidebar = this.selectorHelper.getByRole('navigation', { name: 'API navigation' });
    this.categoryList = this.selectorHelper.getByRole('list', { name: 'API categories' });
    this.endpointList = this.selectorHelper.getByRole('list', { name: 'API endpoints' });
    this.searchBox = this.selectorHelper.getByPlaceholder('Search API documentation');

    // Content display
    this.contentArea = this.selectorHelper.getByRole('main');
    this.apiTitle = this.selectorHelper.getByRole('heading', { level: 1 });
    this.apiDescription = this.selectorHelper.getByText(/API Description|Overview/);
    this.endpointDetails = this.selectorHelper.getByRole('article', { name: /endpoint|method/ });
    this.codeExamples = this.selectorHelper.getByRole('region', { name: 'Code example' });
    this.responseExamples = this.selectorHelper.getByRole('region', { name: 'Response example' });

    // Interactive elements
    this.tryItButton = this.selectorHelper.getByRole('button', { name: 'Try it' });
    this.copyCodeButton = this.selectorHelper.getByRole('button', { name: 'Copy code' });
    this.expandCollapseButtons = this.selectorHelper.getByRole('button', {
      name: /expand|collapse/i,
    });
    this.filterDropdown = this.selectorHelper.getByRole('combobox', { name: 'Filter' });

    // Edit mode elements
    this.editButton = this.selectorHelper.getByRole('button', { name: 'Edit' });
    this.saveButton = this.selectorHelper.getByRole('button', { name: 'Save' });
    this.cancelEditButton = this.selectorHelper.getByRole('button', { name: 'Cancel' });
    this.previewButton = this.selectorHelper.getByRole('button', { name: 'Preview' });

    // Category management
    this.addCategoryButton = this.selectorHelper.getByRole('button', { name: 'Add category' });
    this.categoryContextMenu = this.selectorHelper.getByRole('menu');
    this.reorderButtons = this.selectorHelper.getByRole('button', { name: /move|reorder/ });
  }

  /**
   * Verify we are on API content page (called after dashboard navigation)
   */
  async verifyNavigatedToApiContent(): Promise<void> {
    Log.info('Verifying we are on API content page after dashboard navigation');
    await this.waitForPageLoadState('networkidle');
    await this.verifyApiContentLoaded();
    Log.info('Successfully verified API content page after navigation');
  }

  /**
   * Verify API content page is loaded
   */
  async verifyApiContentLoaded(): Promise<void> {
    Log.info('Verifying API content page is loaded');

    await expect(this.contentArea).toBeVisible();
    await expect(this.sidebar).toBeVisible();

    // Verify URL contains API documentation path
    await expect(this.page).toHaveURL(TestDataHelper.getUrlPattern('apiDocumentation'));

    Log.info('API content page loaded successfully');
  }

  /**
   * Search for specific API content
   */
  async searchApiContent(searchTerm: string): Promise<void> {
    Log.info(`Searching for API content: ${searchTerm}`);
    await this.fillElement(this.searchBox, searchTerm, 'API search box');
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Navigate to specific API category
   */
  async navigateToCategory(categoryName: string): Promise<void> {
    Log.info(`Navigating to category: ${categoryName}`);

    const categoryLink = this.selectorHelper.getByRole('link', { name: categoryName });
    await this.clickElement(categoryLink, `Category: ${categoryName}`);
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Navigate to specific API endpoint
   */
  async navigateToEndpoint(endpointName: string): Promise<void> {
    Log.info(`Navigating to endpoint: ${endpointName}`);

    const endpointLink = this.selectorHelper.getByRole('link', { name: endpointName });
    await this.clickElement(endpointLink, `Endpoint: ${endpointName}`);
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Verify API title is displayed
   */
  async verifyApiTitle(expectedTitle: string): Promise<void> {
    Log.info(`Verifying API title: ${expectedTitle}`);
    await expect(this.apiTitle).toContainText(expectedTitle);
  }

  /**
   * Verify API categories are visible in sidebar
   */
  async verifyCategoriesVisible(): Promise<void> {
    Log.info('Verifying API categories are visible');
    await expect(this.categoryList).toBeVisible();

    const categoryCount = await this.categoryList.locator('li').count();
    expect(categoryCount).toBeGreaterThan(0);

    Log.info(`Found ${categoryCount} categories in sidebar`);
  }

  /**
   * Verify endpoints are listed under categories
   */
  async verifyEndpointsVisible(): Promise<void> {
    Log.info('Verifying API endpoints are visible');
    await expect(this.endpointList).toBeVisible();

    const endpointCount = await this.endpointList.locator('li').count();
    expect(endpointCount).toBeGreaterThan(0);

    Log.info(`Found ${endpointCount} endpoints listed`);
  }

  /**
   * Verify endpoint details are displayed
   */
  async verifyEndpointDetailsVisible(): Promise<void> {
    Log.info('Verifying endpoint details are visible');
    await expect(this.endpointDetails).toBeVisible();
    await expect(this.codeExamples).toBeVisible();
  }

  /**
   * Click "Try it" button for interactive testing
   */
  async clickTryIt(): Promise<void> {
    Log.info('Clicking Try it button for interactive testing');
    await this.clickElement(this.tryItButton, 'Try it button');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Copy code example
   */
  async copyCodeExample(): Promise<void> {
    Log.info('Copying code example');
    await this.clickElement(this.copyCodeButton, 'Copy code button');

    // Verify copy action (could check clipboard if needed)
    Log.info('Code example copied');
  }

  /**
   * Expand/collapse content sections
   */
  async toggleContentSection(sectionName?: string): Promise<void> {
    Log.info('Toggling content section');

    if (sectionName) {
      const sectionButton = this.selectorHelper.getByRole('button', {
        name: new RegExp(`${sectionName}.*expand|collapse`, 'i'),
      });
      await this.clickElement(sectionButton, `Toggle ${sectionName} section`);
    } else {
      await this.clickElement(this.expandCollapseButtons.first(), 'Toggle section');
    }
  }

  /**
   * Filter API content by type or category
   */
  async filterContent(filterValue: string): Promise<void> {
    Log.info(`Filtering content by: ${filterValue}`);
    await this.clickElement(this.filterDropdown, 'Filter dropdown');

    const filterOption = this.selectorHelper.getByRole('option', { name: filterValue });
    await this.clickElement(filterOption, `Filter option: ${filterValue}`);

    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Enter edit mode for API documentation
   */
  async enterEditMode(): Promise<void> {
    Log.info('Entering edit mode');
    await this.clickElement(this.editButton, 'Edit button');

    // Verify edit mode is active
    await expect(this.saveButton).toBeVisible();
    await expect(this.cancelEditButton).toBeVisible();

    Log.info('Edit mode activated');
  }

  /**
   * Save changes in edit mode
   */
  async saveChanges(): Promise<void> {
    Log.info('Saving changes');
    await this.clickElement(this.saveButton, 'Save button');
    await this.waitForPageLoadState('networkidle');

    // Verify save completed (edit buttons should disappear)
    await expect(this.saveButton).not.toBeVisible();
    Log.info('Changes saved successfully');
  }

  /**
   * Cancel edit mode without saving
   */
  async cancelEdit(): Promise<void> {
    Log.info('Canceling edit mode');
    await this.clickElement(this.cancelEditButton, 'Cancel edit button');

    // Verify edit mode is exited
    await expect(this.saveButton).not.toBeVisible();
    Log.info('Edit mode canceled');
  }

  /**
   * Preview changes before saving
   */
  async previewChanges(): Promise<void> {
    Log.info('Previewing changes');
    await this.clickElement(this.previewButton, 'Preview button');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Add new category
   */
  async addCategory(categoryName: string): Promise<void> {
    Log.info(`Adding new category: ${categoryName}`);
    await this.clickElement(this.addCategoryButton, 'Add category button');

    const categoryInput = this.selectorHelper.getByPlaceholder('Category name');
    await this.fillElement(categoryInput, categoryName, 'Category name input');

    const confirmButton = this.selectorHelper.getByRole('button', { name: 'Add' });
    await this.clickElement(confirmButton, 'Confirm add category');

    await this.waitForPageLoadState('networkidle');
    Log.info(`Category '${categoryName}' added successfully`);
  }

  /**
   * Verify category exists in sidebar
   */
  async verifyCategoryExists(categoryName: string): Promise<void> {
    Log.info(`Verifying category exists: ${categoryName}`);

    const categoryItem = this.selectorHelper.getByRole('link', { name: categoryName });
    await expect(categoryItem).toBeVisible();

    Log.info(`Category '${categoryName}' found in sidebar`);
  }

  /**
   * Verify endpoint exists under category
   */
  async verifyEndpointExists(endpointName: string): Promise<void> {
    Log.info(`Verifying endpoint exists: ${endpointName}`);

    const endpointItem = this.selectorHelper.getByRole('link', { name: endpointName });
    await expect(endpointItem).toBeVisible();

    Log.info(`Endpoint '${endpointName}' found`);
  }

  /**
   * Get list of all categories
   */
  async getAllCategories(): Promise<string[]> {
    Log.info('Getting all category names');

    const categoryLinks = this.categoryList.locator('a');
    const categoryCount = await categoryLinks.count();
    const categories: string[] = [];

    for (let i = 0; i < categoryCount; i++) {
      const categoryText = await categoryLinks.nth(i).textContent();
      if (categoryText) {
        categories.push(categoryText.trim());
      }
    }

    Log.info(`Found categories: ${categories.join(', ')}`);
    return categories;
  }

  /**
   * Verify search results are displayed
   */
  async verifySearchResults(searchTerm: string): Promise<void> {
    Log.info(`Verifying search results for: ${searchTerm}`);

    // Wait for search results to load
    await this.waitForPageLoadState('networkidle');

    // Check that content area shows search results
    const resultsText = await this.contentArea.textContent();
    expect(resultsText).toContain(searchTerm.toLowerCase());

    Log.info('Search results verified');
  }
}

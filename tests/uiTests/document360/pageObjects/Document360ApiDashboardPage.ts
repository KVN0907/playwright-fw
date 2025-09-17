import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../utils/BasePage';
import { createSelectorHelper } from '../../../utils/SelectorHelper';
import { ApiTestData, TestDataHelper } from '../testData/ApiTestData';
import { Document360ProjectDashboardPage } from './Document360ProjectDashboardPage';
import Log from '../../../utils/Log';

/**
 * Page Object for Document360 API Documentation Dashboard
 * Handles the main API documentation landing page and navigation
 */
export class Document360ApiDashboardPage extends BasePage {
  private selectorHelper: any;

  // Main navigation locators
  private readonly apiDocumentationMenu: Locator;
  private readonly contributorDashboardMenu: Locator;
  private readonly documentsMenu: Locator;
  private readonly settingsMenu: Locator;

  // Project info locators
  private readonly projectName: Locator;
  private readonly versionButton: Locator;
  private readonly openSiteButton: Locator;

  // Main action buttons
  private readonly createButton: Locator;
  private readonly importButton: Locator;
  private readonly searchInput: Locator;

  // Content area locators
  private readonly apiCategories: Locator;
  private readonly apiArticles: Locator;
  private readonly dataTable: Locator;
  private readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.selectorHelper = createSelectorHelper(page, TestDataHelper.getTimeout('default'), true);

    // Initialize locators using SelectorHelper priority
    // Use URL-based selectors for navigation links since they're icon-only
    this.apiDocumentationMenu = this.page.locator('a[href*="/api-documentation"]');
    this.contributorDashboardMenu = this.page.locator('a[href*="/contributor-dashboard"]');
    this.documentsMenu = this.page.locator('a[href*="/document"]');
    this.settingsMenu = this.page.locator('a[href*="/settings"]');

    this.projectName = this.selectorHelper.getByText(ApiTestData.project.testProjectPattern);
    this.versionButton = this.selectorHelper.getByRole('button', { name: /v1/ });
    this.openSiteButton = this.selectorHelper.getByRole('link', { name: 'OPEN SITE' });

    this.createButton = this.selectorHelper.getByRole('button', { name: 'Create' });
    this.importButton = this.selectorHelper.getByRole('button', { name: 'Import' });
    this.searchInput = this.selectorHelper.getByPlaceholder('Search documentation...');

    this.apiCategories = this.selectorHelper.getByRole('list').first();
    this.apiArticles = this.selectorHelper.getByRole('article');
    this.dataTable = this.selectorHelper.getByRole('table');
    this.emptyState = this.selectorHelper.getByText('No API documentation found');
  }

  /**
   * Navigate to the API Documentation dashboard through menu navigation
   * This method assumes we're already on a page with the API documentation menu visible
   * For complete navigation from scratch, use navigateToApiDashboardFromMain()
   */
  async navigateToApiDashboard(): Promise<void> {
    Log.info('Navigating to API Documentation dashboard through menu navigation');

    // Verify the API documentation menu is available
    await expect(this.apiDocumentationMenu).toBeVisible();

    // Click on API Documentation menu item to navigate properly
    await this.clickElement(this.apiDocumentationMenu, 'API Documentation menu');
    await this.waitForPageLoadState('networkidle');

    // Verify we've successfully navigated to the API dashboard
    await this.verifyApiDashboardLoaded();
    Log.info('Successfully navigated to API Documentation dashboard through menu');
  }

  /**
   * Navigate to the main landing page/dashboard as a starting point
   * This ensures users start from the proper authenticated landing page before using menu navigation
   */
  async navigateToMainDashboard(): Promise<void> {
    Log.info('Navigating to main project dashboard as starting point');

    const projectDashboard = new Document360ProjectDashboardPage(this.page);
    await projectDashboard.navigateToProjectDashboard();

    Log.info('Successfully navigated to main project dashboard');
  }

  /**
   * Complete navigation flow: Start from project dashboard, then navigate to API documentation
   * This is the proper way to navigate to API dashboard in tests
   */
  async navigateToApiDashboardFromMain(): Promise<void> {
    Log.info('Starting complete navigation flow to API documentation');

    const projectDashboard = new Document360ProjectDashboardPage(this.page);

    // First ensure we're on the project dashboard and it's ready
    await projectDashboard.navigateToProjectDashboard();
    await projectDashboard.waitForDashboardToLoad();

    // Then navigate to API documentation through menu navigation
    await this.navigateToApiDashboard();

    // Verify we've successfully navigated to the API dashboard
    await this.verifyApiDashboardLoaded();

    Log.info('Completed navigation flow to API documentation');
  }

  /**
   * Verify API Documentation dashboard is properly loaded
   */
  async verifyApiDashboardLoaded(): Promise<void> {
    Log.info('Verifying API Documentation dashboard is loaded');

    // Verify key elements that should be visible on the API documentation dashboard
    await expect(this.projectName).toBeVisible();
    await expect(this.createButton).toBeVisible();
    await expect(this.versionButton).toBeVisible();

    // Verify URL contains API documentation path
    await expect(this.page).toHaveURL(TestDataHelper.getUrlPattern('apiDocumentation'));

    Log.info('API Documentation dashboard loaded successfully');
  }

  /**
   * Click the Create button to start API creation workflow
   */
  async clickCreateButton(): Promise<void> {
    Log.info('Clicking Create button');
    await this.clickElement(this.createButton, 'Create button');
  }

  /**
   * Search for API documentation
   */
  async searchApiDocumentation(searchTerm: string): Promise<void> {
    Log.info(`Searching for API documentation: ${searchTerm}`);
    await this.fillElement(this.searchInput, searchTerm, 'Search input');
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Verify API categories are visible
   */
  async verifyApiCategoriesVisible(): Promise<void> {
    Log.info('Verifying API categories are visible');
    await expect(this.apiCategories).toBeVisible();
  }

  /**
   * Navigate to project settings
   */
  async navigateToSettings(): Promise<void> {
    Log.info('Navigating to project settings');
    await this.clickElement(this.settingsMenu, 'Settings menu');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Open external site in new tab
   */
  async openExternalSite(): Promise<void> {
    Log.info('Opening external site');
    await this.clickElement(this.openSiteButton, 'Open site button');
  }

  /**
   * Switch version using version selector
   */
  async switchVersion(version: string): Promise<void> {
    Log.info(`Switching to version: ${version}`);
    await this.clickElement(this.versionButton, 'Version button');

    const versionOption = this.selectorHelper.getByRole('option', { name: version });
    await this.clickElement(versionOption, `Version ${version}`);

    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Verify empty state when no APIs exist
   */
  async verifyEmptyState(): Promise<void> {
    Log.info('Verifying empty state');
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Get current project name
   */
  async getCurrentProjectName(): Promise<string> {
    Log.info('Getting current project name');
    const projectName = await this.projectName.textContent();
    return projectName || '';
  }

  /**
   * Verify API documentation list is populated
   */
  async verifyApiListPopulated(): Promise<void> {
    Log.info('Verifying API documentation list is populated');
    await expect(this.dataTable).toBeVisible();

    const rows = await this.dataTable.locator('tr').count();
    expect(rows).toBeGreaterThan(1); // Header row + at least one data row

    Log.info(`Found ${rows - 1} API documentation entries`);
  }

  /**
   * Navigate to API content through the dashboard interface
   * This method properly navigates to API content via dashboard menu instead of direct URL
   */
  async navigateToApiContent(): Promise<void> {
    Log.info('Navigating to API content through dashboard menu');
    await this.clickElement(this.apiDocumentationMenu, 'API Documentation menu');
    await this.waitForPageLoadState('networkidle');

    // Verify we're in the API content area
    await expect(this.page).toHaveURL(/api-documentation/);
    Log.info('Successfully navigated to API content through dashboard');
  }

  /**
   * Open first available API documentation from the dashboard list
   */
  async openFirstApiDocumentation(): Promise<void> {
    Log.info('Opening first available API documentation');
    await this.verifyApiDashboardLoaded();

    // Wait for and click the first API documentation entry
    const firstApiRow = this.dataTable.locator('tr').nth(1); // Skip header row
    await expect(firstApiRow).toBeVisible();
    await this.clickElement(firstApiRow, 'First API documentation entry');

    await this.waitForPageLoadState('networkidle');
    Log.info('Successfully opened first API documentation');
  }

  /**
   * Select and open API documentation by name
   */
  async selectApiDocumentationByName(apiName: string): Promise<void> {
    Log.info(`Selecting API documentation: ${apiName}`);

    const apiRow = this.dataTable.locator('tr').filter({ hasText: apiName });
    await expect(apiRow).toBeVisible();
    await this.clickElement(apiRow, `API documentation: ${apiName}`);

    await this.waitForPageLoadState('networkidle');
    Log.info(`Successfully opened API documentation: ${apiName}`);
  }

  /**
   * Navigate to API content after API creation
   */
  async navigateToCreatedApiContent(): Promise<void> {
    Log.info('Navigating to created API content');
    // After API creation, we should be redirected to the content page
    // Or we need to navigate through the dashboard
    await this.verifyApiDashboardLoaded();

    // Try to open the most recently created API (usually first in the list)
    try {
      await this.openFirstApiDocumentation();
    } catch (error) {
      Log.info('No APIs found, staying on dashboard');
      // If no APIs exist, we remain on the dashboard
    }
  }
}

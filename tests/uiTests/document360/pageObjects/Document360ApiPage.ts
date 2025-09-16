import { expect, Locator, Page } from '@playwright/test';

export class Document360ApiPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly newApiOption: Locator;
  readonly urlRadioButton: Locator;
  readonly urlInput: Locator;
  readonly uploadRadioButton: Locator;
  readonly cicdRadioButton: Locator;
  readonly samplePetStoreRadioButton: Locator;
  readonly newApiReferenceButton: Locator;
  readonly cancelButton: Locator;
  readonly publishButton: Locator;
  readonly closeButton: Locator;
  readonly apiCategories: Locator;
  readonly apiArticles: Locator;
  readonly successAlert: Locator;
  readonly breadcrumb: Locator;
  readonly dataTable: Locator;

  // Navigation menu locators
  readonly apiDocumentationMenu: Locator;
  readonly contributorDashboardMenu: Locator;
  readonly documentsMenu: Locator;
  readonly settingsMenu: Locator;

  // Project info locators
  readonly projectName: Locator;
  readonly versionButton: Locator;
  readonly openSiteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main action buttons
    this.createButton = page.getByRole('button', { name: 'Create', exact: true });
    this.newApiOption = page.getByRole('button', { name: ' New API' });

    // Modal form elements
    this.urlRadioButton = page.getByRole('radio', { name: 'Create from URL' });
    this.uploadRadioButton = page.getByRole('radio', { name: 'Upload API definition' });
    this.cicdRadioButton = page.getByRole('radio', { name: 'CI/CD Flow' });
    this.samplePetStoreRadioButton = page.getByRole('radio', {
      name: 'Try sample pet store API file',
    });
    this.urlInput = page.locator('#api-reference-url');
    this.newApiReferenceButton = page.getByRole('button', { name: 'New API reference' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.publishButton = page.getByRole('button', { name: 'Publish' });
    this.closeButton = page.getByRole('button', { name: 'Close' });

    // Content area locators
    this.apiCategories = page.locator('[data-testid="api-categories"]');
    this.apiArticles = page.locator('[data-testid="api-articles"]');
    this.successAlert = page.locator('text=API reference published.');
    this.breadcrumb = page.locator('text=/\\//');
    this.dataTable = page.getByRole('grid', { name: 'Data table' });

    // Navigation menu
    this.apiDocumentationMenu = page.getByRole('link').filter({ hasText: /API documentation/i });
    this.contributorDashboardMenu = page
      .getByRole('link')
      .filter({ hasText: /contributor dashboard/i });
    this.documentsMenu = page.getByRole('link').filter({ hasText: /document/i });
    this.settingsMenu = page.getByRole('link').filter({ hasText: /settings/i });

    // Project info
    this.projectName = page.locator('.project-name');
    this.versionButton = page.locator('button:has-text("v1-api")');
    this.openSiteButton = page.getByRole('link', { name: 'OPEN SITE' });
  }

  /**
   * Navigate to API Documentation section (use DashboardPage.navigateToApiDocumentation() instead)
   */
  async navigateToApiDocumentation() {
    // This navigation is handled by Document360DashboardPage
    // await this.apiDocumentationMenu.click();
    // await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click Create button to open creation options
   */
  async clickCreate() {
    await this.createButton.click();
  }

  /**
   * Select New API option from dropdown
   */
  async selectNewApi() {
    await this.newApiOption.click();
    await this.page.waitForSelector('dialog');
  }

  /**
   * Create API documentation from URL
   * @param url - OpenAPI specification URL
   */
  async createApiFromUrl(url: string) {
    // Select Create from URL option
    await this.urlRadioButton.click();

    // Enter URL
    await this.urlInput.fill(url);

    // Click Create button
    await this.newApiReferenceButton.click();

    // Wait for success dialog
    await expect(
      this.page.locator('text=Your API reference has been successfully added')
    ).toBeVisible();
  }

  /**
   * Create API documentation by uploading file
   * @param filePath - Path to the API definition file
   */
  async createApiFromUpload(filePath: string) {
    // Select Upload option (default)
    await this.uploadRadioButton.click();

    // Upload file
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Upload from my device' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    // Click Create button
    await this.newApiReferenceButton.click();

    // Wait for success dialog
    await expect(
      this.page.locator('text=Your API reference has been successfully added')
    ).toBeVisible();
  }

  /**
   * Create API documentation using sample Pet Store file
   */
  async createApiFromSample() {
    // Select sample Pet Store option
    await this.samplePetStoreRadioButton.click();

    // Click Create button
    await this.newApiReferenceButton.click();

    // Wait for success dialog
    await expect(
      this.page.locator('text=Your API reference has been successfully added')
    ).toBeVisible();
  }

  /**
   * Publish the created API documentation
   */
  async publishApi() {
    await this.publishButton.click();

    // Wait for success alert
    await expect(this.successAlert).toBeVisible();

    // Wait for page to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancel API creation process
   */
  async cancelApiCreation() {
    await this.cancelButton.click();
  }

  /**
   * Close success dialog
   */
  async closeSuccessDialog() {
    await this.closeButton.click();
  }

  /**
   * Verify API documentation was created successfully
   * @param expectedCategoriesCount - Expected number of categories created
   * @param expectedArticlesCount - Expected number of articles created
   */
  async verifyApiCreationSuccess(expectedCategoriesCount: number, expectedArticlesCount: number) {
    const successMessage = this.page.locator('text=Your API reference has been successfully added');
    await expect(successMessage).toBeVisible();

    const detailMessage = this.page.locator(
      `text=${expectedCategoriesCount} categories and ${expectedArticlesCount} articles have been created`
    );
    await expect(detailMessage).toBeVisible();
  }

  /**
   * Verify API documentation appears in sidebar
   * @param apiName - Name of the API documentation category
   */
  async verifyApiInSidebar(apiName: string) {
    const apiLink = this.page.getByRole('link', { name: apiName });
    await expect(apiLink).toBeVisible();
  }

  /**
   * Verify API documentation is published
   */
  async verifyApiPublished() {
    await expect(this.successAlert).toBeVisible();

    // Verify data table shows content
    await expect(this.dataTable).toBeVisible();

    // Verify published status in table
    const publishedCell = this.page.getByRole('gridcell', { name: 'Published' });
    await expect(publishedCell).toBeVisible();
  }

  /**
   * Navigate to specific API category
   * @param categoryName - Name of the category to navigate to
   */
  async navigateToCategory(categoryName: string) {
    const categoryLink = this.page.getByRole('link', { name: categoryName });
    await categoryLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to specific API article
   * @param articleName - Name of the article to navigate to
   */
  async navigateToArticle(articleName: string) {
    const articleLink = this.page.getByRole('link', { name: articleName });
    await articleLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get list of API categories from sidebar
   */
  async getApiCategories(): Promise<string[]> {
    const categories = await this.page.locator('[data-testid="api-category"]').allTextContents();
    return categories.filter(cat => cat.trim() !== '');
  }

  /**
   * Get list of API articles from data table
   */
  async getApiArticles(): Promise<string[]> {
    await expect(this.dataTable).toBeVisible();
    const articleCells = this.page.locator('gridcell a');
    return await articleCells.allTextContents();
  }

  /**
   * Verify page URL contains expected path
   * @param expectedPath - Expected path in URL
   */
  async verifyUrl(expectedPath: string) {
    expect(this.page.url()).toContain(expectedPath);
  }

  /**
   * Wait for API creation modal to appear
   */
  async waitForCreationModal() {
    await this.page.waitForSelector('dialog');
    await expect(this.page.locator('text=New API reference')).toBeVisible();
  }

  /**
   * Wait for success dialog after API creation
   */
  async waitForSuccessDialog() {
    await expect(
      this.page.locator('text=Your API reference has been successfully added')
    ).toBeVisible();
  }
}

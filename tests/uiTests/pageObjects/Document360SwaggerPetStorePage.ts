import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';
import { PageContextHandler } from '../../utils/PageContextHandler';

export class Document360SwaggerPetStorePage extends BasePage {
  private pageContextHandler!: PageContextHandler;

  // Navigation locators
  private swaggerPetstoreLink!: Locator;
  private petCategoryLink!: Locator;
  private storeCategoryLink!: Locator;
  private userCategoryLink!: Locator;
  private openSiteLink!: Locator;

  // Endpoint management locators
  private endpointCheckboxes!: Locator;
  private endpointRows!: Locator;
  private bulkActionToolbar!: Locator;
  private publishButton!: Locator;
  private hideButton!: Locator;
  private deleteButton!: Locator;
  private moveButton!: Locator;
  private addLabelsButton!: Locator;
  private createArticleButton!: Locator;
  private toggleDropdownButton!: Locator;

  // Endpoint list locators
  private endpointTable!: Locator;
  private endpointTitleCells!: Locator;
  private endpointStatusCells!: Locator;
  private selectAllCheckbox!: Locator;
  private selectedRowsIndicator!: Locator;

  // Specific endpoint locators
  private findPetByIdRow!: Locator;
  private findPetByIdCheckbox!: Locator;
  private findPetByIdLink!: Locator;
  private addPetToStoreRow!: Locator;
  private updatePetRow!: Locator;
  private deletePetRow!: Locator;

  // Publish dialog locators
  private publishDialog!: Locator;
  private publishDialogTitle!: Locator;
  private publishCommentTextbox!: Locator;
  private publishYesButton!: Locator;
  private publishNoButton!: Locator;
  private publishCloseButton!: Locator;

  // Success/validation locators
  private successAlert!: Locator;
  private publishedStatus!: Locator;
  private draftStatus!: Locator;

  constructor(page: Page) {
    super(page);
    this.pageContextHandler = new PageContextHandler(page);
    this.initializeLocators();
  }

  private initializeLocators(): void {
    // Navigation locators
    this.swaggerPetstoreLink = this.page.getByRole('link', { name: 'Swagger Petstore' });
    this.petCategoryLink = this.page
      .locator('a.ca-text.article-title[title="pet"]')
      .or(this.page.getByRole('link', { name: 'pet', exact: true }).first());
    this.storeCategoryLink = this.page.getByRole('link', { name: 'store', exact: true }).first();
    this.userCategoryLink = this.page.getByRole('link', { name: 'user', exact: true }).first();
    this.openSiteLink = this.page.getByRole('link', { name: 'OPEN SITE' });

    // Endpoint management locators
    this.endpointCheckboxes = this.page.locator('tbody [type="checkbox"]');
    this.endpointRows = this.page.locator('tbody [role="row"]');
    this.bulkActionToolbar = this.page
      .locator('div.category-link-view')
      .filter({ hasText: /\d+ row selected/ });
    this.publishButton = this.page
      .locator('div.category-link-view button')
      .filter({ hasText: 'Publish' })
      .first();
    this.hideButton = this.page
      .locator('div.category-link-view button')
      .filter({ hasText: 'Hide' })
      .first();
    this.deleteButton = this.page
      .locator('div.category-link-view button')
      .filter({ hasText: 'Delete' })
      .first();
    this.moveButton = this.page
      .locator('div.category-link-view button')
      .filter({ hasText: 'Move' })
      .first();
    this.addLabelsButton = this.page
      .locator('div.category-link-view button')
      .filter({ hasText: 'Add labels' })
      .first();
    this.createArticleButton = this.page.getByRole('button', { name: 'Create article' });
    this.toggleDropdownButton = this.page.getByRole('button', { name: 'Toggle Dropdown' });

    // Endpoint list locators
    this.endpointTable = this.page.getByRole('grid', { name: 'Data table' });
    this.endpointTitleCells = this.page.locator('[role="gridcell"]:has(a)');
    this.endpointStatusCells = this.page.locator(
      '[role="gridcell"]:has-text("Draft"), [role="gridcell"]:has-text("Published")'
    );
    this.selectAllCheckbox = this.page.locator('th [type="checkbox"]');
    this.selectedRowsIndicator = this.page.locator(':text-matches("\\\\d+ row selected")');

    // Specific endpoint locators
    this.findPetByIdRow = this.page.locator('[role="row"]:has-text("Find pet by ID")');
    this.findPetByIdCheckbox = this.findPetByIdRow.locator('[type="checkbox"]');
    this.findPetByIdLink = this.page
      .getByRole('grid', { name: 'Data table' })
      .getByRole('link', { name: 'Find pet by ID' });
    this.addPetToStoreRow = this.page.locator(
      '[role="row"]:has-text("Add a new pet to the store")'
    );
    this.updatePetRow = this.page.locator('[role="row"]:has-text("Update an existing pet")');
    this.deletePetRow = this.page.locator('[role="row"]:has-text("Deletes a pet")');

    // Publish dialog locators
    this.publishDialog = this.page.getByRole('dialog');
    this.publishDialogTitle = this.publishDialog.getByRole('heading', { name: 'Publish' });
    this.publishCommentTextbox = this.publishDialog.getByRole('textbox', {
      name: 'Enter your comment (Optional)',
    });
    this.publishYesButton = this.publishDialog.getByRole('button', { name: 'Yes' });
    this.publishNoButton = this.publishDialog.getByRole('button', { name: 'No' });
    this.publishCloseButton = this.publishDialog.getByRole('button', { name: 'Close' });

    // Success/validation locators
    this.successAlert = this.page.getByRole('alert');
    this.publishedStatus = this.page.locator(':text("Published")');
    this.draftStatus = this.page.locator(':text("Draft")');
  }

  /**
   * Navigates to the Swagger Petstore category page
   */
  async navigateToSwaggerPetstore(): Promise<void> {
    Log.info('Navigating to Swagger Petstore category');
    await this.clickElement(this.swaggerPetstoreLink, 'Swagger Petstore link');
    await this.waitForLoadState('domcontentloaded');
    Log.info('Successfully navigated to Swagger Petstore category');
  }

  /**
   * Navigates to the pet endpoints category
   */
  async navigateToPetCategory(): Promise<void> {
    Log.info('Navigating to pet category endpoints');
    await this.clickElement(this.petCategoryLink, 'Pet category link');
    await this.waitForLoadState('domcontentloaded');
    Log.info('Successfully navigated to pet category');
  }

  /**
   * Verifies that the Swagger Petstore page is loaded correctly
   */
  async verifySwaggerPetstorePageLoaded(): Promise<void> {
    Log.info('Verifying Swagger Petstore page is loaded');
    await this.verifyElementVisible(this.swaggerPetstoreLink, 'Swagger Petstore link');
    await this.verifyElementVisible(this.petCategoryLink, 'Pet category link');
    await this.verifyElementVisible(this.storeCategoryLink, 'Store category link');
    await this.verifyElementVisible(this.userCategoryLink, 'User category link');
    Log.info('Swagger Petstore page verified successfully');
  }

  /**
   * Verifies that the pet endpoints are displayed in the table
   */
  async verifyPetEndpointsDisplayed(): Promise<void> {
    Log.info('Verifying pet endpoints are displayed');
    await this.verifyElementVisible(this.endpointTable, 'Endpoint table');
    await this.verifyElementVisible(this.findPetByIdLink, 'Find pet by ID endpoint');

    // Verify at least 8 endpoints are present (from our exploration)
    const endpointCount = await this.endpointTitleCells.count();
    expect(endpointCount).toBeGreaterThanOrEqual(8);
    Log.info(`Verified ${endpointCount} endpoints are displayed`);
  }

  /**
   * Captures and returns the list of all available endpoints
   */
  async captureEndpointsList(): Promise<string[]> {
    Log.info('Capturing list of available endpoints');

    await this.verifyElementVisible(this.endpointTable, 'Endpoint table');

    const endpoints: string[] = [];
    const endpointLinks = this.endpointTitleCells.locator('a');
    const count = await endpointLinks.count();

    for (let i = 0; i < count; i++) {
      const endpointText = await endpointLinks.nth(i).textContent();
      if (endpointText) {
        endpoints.push(endpointText.trim());
      }
    }

    Log.info(`Captured ${endpoints.length} endpoints: ${endpoints.join(', ')}`);
    return endpoints;
  }

  /**
   * Selects a specific endpoint by name
   */
  async selectEndpoint(endpointName: string): Promise<void> {
    Log.info(`Selecting endpoint: ${endpointName}`);

    const endpointRow = this.page.locator(`[role="row"]:has-text("${endpointName}")`);
    const endpointCheckbox = endpointRow.locator('[type="checkbox"]');

    await this.verifyElementVisible(endpointRow, `${endpointName} row`);
    await this.clickElement(endpointCheckbox, `${endpointName} checkbox`);

    // Verify selection and bulk action toolbar appears
    await this.verifyElementVisible(this.selectedRowsIndicator, 'Selected rows indicator');
    await this.verifyElementVisible(this.bulkActionToolbar, 'Bulk action toolbar');

    Log.info(`Successfully selected endpoint: ${endpointName}`);
  }

  /**
   * Selects the Find pet by ID endpoint specifically
   */
  async selectFindPetByIdEndpoint(): Promise<void> {
    Log.info('Selecting Find pet by ID endpoint');
    await this.selectEndpoint('Find pet by ID');
  }

  /**
   * Verifies the bulk action toolbar is visible with expected actions
   */
  async verifyBulkActionToolbarVisible(): Promise<void> {
    Log.info('Verifying bulk action toolbar is visible');

    // Debug: Check if any elements match our toolbar selector
    const allToolbarElements = this.page.locator('div:has-text("row selected"):has(button)');
    const toolbarCount = await allToolbarElements.count();
    Log.info(`Found ${toolbarCount} elements matching toolbar selector`);

    if (toolbarCount === 0) {
      Log.info('No toolbar elements found. Checking for "row selected" text...');
      const rowSelectedElements = this.page.locator('div:has-text("row selected")');
      const rowSelectedCount = await rowSelectedElements.count();
      Log.info(`Found ${rowSelectedCount} elements with "row selected" text`);

      for (let i = 0; i < Math.min(rowSelectedCount, 5); i++) {
        const elementText = await rowSelectedElements.nth(i).textContent();
        Log.info(`Row selected element ${i}: "${elementText?.trim()}"`);
      }
    }

    await this.verifyElementVisible(this.bulkActionToolbar, 'Bulk action toolbar');

    // Debug: Log all available buttons in the toolbar
    const allButtons = this.bulkActionToolbar.locator('button');
    const buttonCount = await allButtons.count();
    Log.info(`Found ${buttonCount} buttons in bulk action toolbar`);

    for (let i = 0; i < buttonCount; i++) {
      const buttonText = await allButtons.nth(i).textContent();
      Log.info(`Button ${i}: "${buttonText?.trim()}"`);
    }

    await this.verifyElementVisible(this.publishButton, 'Publish button');
    await this.verifyElementVisible(this.hideButton, 'Hide button');
    await this.verifyElementVisible(this.deleteButton, 'Delete button');
    await this.verifyElementVisible(this.moveButton, 'Move button');
    await this.verifyElementVisible(this.addLabelsButton, 'Add labels button');
    Log.info('Bulk action toolbar verified successfully');
  }

  /**
   * Publishes the selected endpoint(s)
   */
  async publishSelectedEndpoint(comment?: string): Promise<void> {
    Log.info('Publishing selected endpoint');

    // Click publish button
    await this.clickElement(this.publishButton, 'Publish button');

    // Wait for publish dialog
    await this.verifyElementVisible(this.publishDialog, 'Publish dialog');
    await this.verifyElementVisible(this.publishDialogTitle, 'Publish dialog title');

    // Add comment if provided
    if (comment) {
      await this.fillElement(this.publishCommentTextbox, comment, 'Publish comment');
    }

    // Confirm publish
    await this.clickElement(this.publishYesButton, 'Publish Yes button');

    // Wait for dialog to close
    await expect(this.publishDialog).not.toBeVisible();

    Log.info('Successfully published selected endpoint');
  }

  /**
   * Verifies that an endpoint has been published successfully
   */
  async verifyEndpointPublished(endpointName: string): Promise<void> {
    Log.info(`Verifying endpoint "${endpointName}" is published`);

    // Look for success alert
    await this.verifyElementVisible(this.successAlert, 'Success alert');

    // Verify the endpoint row shows Published status
    const endpointRow = this.page.locator(`[role="row"]:has-text("${endpointName}")`);
    const publishedStatusInRow = endpointRow.locator(':text("Published")');
    const justNowText = endpointRow.locator(':text("Just now")');

    await this.verifyElementVisible(publishedStatusInRow, `Published status for ${endpointName}`);
    await this.verifyElementVisible(justNowText, `Just now timestamp for ${endpointName}`);

    Log.info(`Successfully verified endpoint "${endpointName}" is published`);
  }

  /**
   * Opens the published site in a new tab and returns the new page
   */
  async openPublishedSite(): Promise<Page> {
    Log.info('Opening published site in new tab');

    const newPage = await this.pageContextHandler.switchToNewPage(async () => {
      await this.clickElement(this.openSiteLink, 'Open Site link');
    });

    Log.info(`Successfully opened published site: ${newPage.url()}`);
    return newPage;
  }

  /**
   * Returns the current page context handler
   */
  getPageContextHandler(): PageContextHandler {
    return this.pageContextHandler;
  }

  /**
   * Gets all endpoints with their current status
   */
  async getEndpointsWithStatus(): Promise<Array<{ name: string; status: string }>> {
    Log.info('Getting all endpoints with their status');

    const endpoints: Array<{ name: string; status: string }> = [];
    const rows = await this.endpointRows.count();

    for (let i = 1; i < rows; i++) {
      // Skip header row
      const row = this.endpointRows.nth(i);
      const nameCell = row.locator('[role="gridcell"] a').first();
      const statusCell = row
        .locator('[role="gridcell"]:has-text("Draft"), [role="gridcell"]:has-text("Published")')
        .first();

      const name = await nameCell.textContent();
      const status = await statusCell.textContent();

      if (name && status) {
        endpoints.push({
          name: name.trim(),
          status: status.trim(),
        });
      }
    }

    Log.info(`Retrieved ${endpoints.length} endpoints with status`);
    return endpoints;
  }

  /**
   * Verifies specific endpoint exists and has expected status
   */
  async verifyEndpointStatus(endpointName: string, expectedStatus: string): Promise<void> {
    Log.info(`Verifying endpoint "${endpointName}" has status "${expectedStatus}"`);

    const endpointRow = this.page.locator(`[role="row"]:has-text("${endpointName}")`);
    const statusCell = endpointRow.locator(`[role="gridcell"]:has-text("${expectedStatus}")`);

    await this.verifyElementVisible(endpointRow, `${endpointName} row`);
    await this.verifyElementVisible(statusCell, `${expectedStatus} status for ${endpointName}`);

    Log.info(`Successfully verified endpoint "${endpointName}" has status "${expectedStatus}"`);
  }

  /**
   * Cancels publish operation
   */
  async cancelPublish(): Promise<void> {
    Log.info('Cancelling publish operation');
    await this.verifyElementVisible(this.publishDialog, 'Publish dialog');
    await this.clickElement(this.publishNoButton, 'Publish No button');
    await expect(this.publishDialog).not.toBeVisible();
    Log.info('Publish operation cancelled successfully');
  }

  /**
   * Verifies no endpoints are selected
   */
  async verifyNoEndpointsSelected(): Promise<void> {
    Log.info('Verifying no endpoints are selected');
    await expect(this.bulkActionToolbar).not.toBeVisible();
    await expect(this.selectedRowsIndicator).not.toBeVisible();
    Log.info('Verified no endpoints are selected');
  }

  /**
   * Selects multiple endpoints by names
   */
  async selectMultipleEndpoints(endpointNames: string[]): Promise<void> {
    Log.info(`Selecting multiple endpoints: ${endpointNames.join(', ')}`);

    for (const endpointName of endpointNames) {
      const endpointRow = this.page.locator(`[role="row"]:has-text("${endpointName}")`);
      const endpointCheckbox = endpointRow.locator('[type="checkbox"]');
      await this.clickElement(endpointCheckbox, `${endpointName} checkbox`);
    }

    // Verify selection count
    const expectedText = `${endpointNames.length} row${endpointNames.length > 1 ? 's' : ''} selected`;
    await expect(this.page.locator(`:text("${expectedText}")`)).toBeVisible();

    Log.info(`Successfully selected ${endpointNames.length} endpoints`);
  }
}

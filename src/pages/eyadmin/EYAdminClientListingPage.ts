/**
 * @fileoverview EYAdminClientListingPage - EY Admin Client Management
 * @description Manages client listing and regulations module configuration for EY Admins
 */

import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import Log from '../../lib/utils/Log';

export class EYAdminClientListingPage extends BasePage<EYAdminClientListingPage> {
  // Page heading and navigation
  readonly pageHeading: Locator;
  readonly clientsTab: Locator;

  // Client table elements
  readonly clientTable: Locator;
  readonly clientNameColumn: Locator;
  readonly clientStatusColumn: Locator;
  readonly regulationModuleColumn: Locator;
  readonly actionsColumn: Locator;

  // Action buttons
  readonly searchField: Locator;
  readonly refreshButton: Locator;
  readonly filterButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements
    this.pageHeading = page.getByRole('heading', { name: 'Client Management', level: 1 });
    this.clientsTab = page.getByRole('link', { name: 'Clients' });

    // Table elements
    this.clientTable = page.locator('table.clients-table, table[data-testid="clients-table"]');
    this.clientNameColumn = page.getByRole('columnheader', { name: 'Client Name' });
    this.clientStatusColumn = page.getByRole('columnheader', { name: 'Status' });
    this.regulationModuleColumn = page.getByRole('columnheader', {
      name: 'Regulations Module',
    });
    this.actionsColumn = page.getByRole('columnheader', { name: 'Actions' });

    // Action buttons
    this.searchField = page.getByRole('textbox', { name: 'Search clients' });
    this.refreshButton = page.getByRole('button', { name: 'Refresh' });
    this.filterButton = page.getByRole('button', { name: 'Filter' });
  }

  /**
   * Navigate to Client Listing page
   * @returns Fluent interface for method chaining
   */
  async navigateToClientListing(): Promise<EYAdminClientListingPage> {
    Log.info('Navigating to EY Admin Client Listing');

    await this.navigateTo('/ey-admin/clients');
    await this.waitForNetworkIdle();

    Log.info('Successfully navigated to Client Listing page');
    return this;
  }

  /**
   * Find client row by name
   * @param clientName - Name of the client to find
   * @returns Locator for the client row
   */
  findClientRow(clientName: string): Locator {
    return this.page.locator(`tr:has-text("${clientName}")`);
  }

  /**
   * Get regulations module toggle for a client
   * @param clientName - Name of the client
   * @returns Locator for the toggle
   */
  getRegulationModuleToggle(clientName: string): Locator {
    const clientRow = this.findClientRow(clientName);
    return clientRow.locator('mat-slide-toggle, [role="switch"]');
  }

  /**
   * Get configure button for a client
   * @param clientName - Name of the client
   * @returns Locator for the configure button
   */
  getConfigureButton(clientName: string): Locator {
    const clientRow = this.findClientRow(clientName);
    return clientRow.getByRole('button', { name: 'Configure' });
  }

  /**
   * Enable regulations module for a client
   * @param clientName - Name of the client
   * @returns Fluent interface for method chaining
   */
  async enableRegulationModule(clientName: string): Promise<EYAdminClientListingPage> {
    Log.info(`Enabling Regulations Module for client: ${clientName}`);

    const toggle = this.getRegulationModuleToggle(clientName);
    const isEnabled = await toggle.isChecked();

    if (!isEnabled) {
      await this.click(toggle, { description: `Regulations Module toggle for ${clientName}` });
      await this.waitForResponse('/api/v1/regulation-config', 200);
    }

    Log.info(`Regulations Module enabled for ${clientName}`);
    return this;
  }

  /**
   * Disable regulations module for a client
   * @param clientName - Name of the client
   * @returns Fluent interface for method chaining
   */
  async disableRegulationModule(clientName: string): Promise<EYAdminClientListingPage> {
    Log.info(`Disabling Regulations Module for client: ${clientName}`);

    const toggle = this.getRegulationModuleToggle(clientName);
    const isEnabled = await toggle.isChecked();

    if (isEnabled) {
      await this.click(toggle, { description: `Regulations Module toggle for ${clientName}` });
      await this.waitForResponse('/api/v1/regulation-config', 200);
    }

    Log.info(`Regulations Module disabled for ${clientName}`);
    return this;
  }

  /**
   * Open regulation configuration panel for a client
   * @param clientName - Name of the client
   * @returns Fluent interface for method chaining
   */
  async openRegulationConfigPanel(clientName: string): Promise<EYAdminClientListingPage> {
    Log.info(`Opening Regulation Config Panel for client: ${clientName}`);

    const configButton = this.getConfigureButton(clientName);
    await this.click(configButton, {
      description: `Configure button for ${clientName}`,
    });

    // Wait for modal/panel to open
    await this.page.waitForSelector(
      'app-configure-regulations, [data-testid="regulation-config-panel"]',
      {
        state: 'visible',
      }
    );
    await this.waitForNetworkIdle();

    Log.info('Regulation Config Panel opened successfully');
    return this;
  }

  /**
   * Search for a client by name
   * @param clientName - Name of the client to search
   * @returns Fluent interface for method chaining
   */
  async searchClient(clientName: string): Promise<EYAdminClientListingPage> {
    Log.info(`Searching for client: ${clientName}`);

    await this.fill(this.searchField, clientName, {
      description: 'Client search field',
    });
    await this.waitForNetworkIdle();

    Log.info(`Search completed for: ${clientName}`);
    return this;
  }

  /**
   * Verify regulations module is enabled for a client
   * @param clientName - Name of the client
   */
  async verifyRegulationModuleEnabled(clientName: string): Promise<void> {
    Log.info(`Verifying Regulations Module is enabled for: ${clientName}`);

    const toggle = this.getRegulationModuleToggle(clientName);
    await expect(toggle).toBeChecked();

    Log.info('Regulations Module is enabled');
  }

  /**
   * Verify regulations module is disabled for a client
   * @param clientName - Name of the client
   */
  async verifyRegulationModuleDisabled(clientName: string): Promise<void> {
    Log.info(`Verifying Regulations Module is disabled for: ${clientName}`);

    const toggle = this.getRegulationModuleToggle(clientName);
    await expect(toggle).not.toBeChecked();

    Log.info('Regulations Module is disabled');
  }

  /**
   * Verify configure button is visible for a client
   * @param clientName - Name of the client
   */
  async verifyConfigureButtonVisible(clientName: string): Promise<void> {
    Log.info(`Verifying Configure button is visible for: ${clientName}`);

    const configButton = this.getConfigureButton(clientName);
    await expect(configButton).toBeVisible();

    Log.info('Configure button is visible');
  }

  /**
   * Verify configure button is not visible for a client
   * @param clientName - Name of the client
   */
  async verifyConfigureButtonNotVisible(clientName: string): Promise<void> {
    Log.info(`Verifying Configure button is not visible for: ${clientName}`);

    const configButton = this.getConfigureButton(clientName);
    await expect(configButton).not.toBeVisible();

    Log.info('Configure button is not visible');
  }

  /**
   * Verify client exists in the table
   * @param clientName - Name of the client
   */
  async verifyClientExists(clientName: string): Promise<void> {
    Log.info(`Verifying client exists: ${clientName}`);

    const clientRow = this.findClientRow(clientName);
    await expect(clientRow).toBeVisible();

    Log.info(`Client ${clientName} exists in the table`);
  }

  /**
   * Verify page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    Log.info('Verifying Client Listing page is loaded');

    await expect(this.pageHeading).toBeVisible();
    await expect(this.clientTable).toBeVisible();

    Log.info('Client Listing page loaded successfully');
  }
}

/**
 * @fileoverview RegulationConfigPanelPage - Regulation Configuration Management
 * @description Manages regulation configuration panel for selecting regulatory scope
 */

import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import Log from '../../lib/Log';

export class RegulationConfigPanelPage extends BasePage<RegulationConfigPanelPage> {
  // Panel container
  readonly configPanel: Locator;
  readonly panelHeader: Locator;

  // Sidebar sections
  readonly regulationSidebar: Locator;
  readonly regulatoryCategoriesSection: Locator;
  readonly countriesSection: Locator;
  readonly statesSection: Locator;

  // Main content area
  readonly regulationTable: Locator;
  readonly regulationTableHeader: Locator;
  readonly regulationTableBody: Locator;

  // Action buttons
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  // Messages and modals
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly confirmationModal: Locator;
  readonly confirmButton: Locator;
  readonly noDataMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Panel container
    this.configPanel = page.locator(
      'app-configure-regulations, [data-testid="regulation-config-panel"]'
    );
    this.panelHeader = page.getByRole('heading', {
      name: /Configure Regulations|Regulation Configuration/i,
    });

    // Sidebar sections
    this.regulationSidebar = page.locator(
      '.regulation-sidebar, [data-testid="regulation-sidebar"]'
    );
    this.regulatoryCategoriesSection = page.locator(
      '.regulation-categories-section, [data-testid="regulatory-categories"]'
    );
    this.countriesSection = page.locator('.countries-section, [data-testid="countries-section"]');
    this.statesSection = page.locator('.states-section, [data-testid="states-section"]');

    // Main content
    this.regulationTable = page.locator(
      '.regulation-table, table[data-testid="regulations-table"]'
    );
    this.regulationTableHeader = this.regulationTable.locator('thead');
    this.regulationTableBody = this.regulationTable.locator('tbody');

    // Action buttons
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.closeButton = page.getByRole('button', { name: 'Close' });

    // Messages and modals
    this.successMessage = page.locator(
      '.success-message, .mat-snack-bar-container, [role="alert"]:has-text("success")'
    );
    this.errorMessage = page.locator(
      '.error-message, .mat-error, [role="alert"]:has-text("error")'
    );
    this.confirmationModal = page.locator(
      'app-save-confirmation-modal, [data-testid="confirmation-modal"]'
    );
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.noDataMessage = page.locator('.no-data-message, .empty-state');
  }

  /**
   * Wait for config panel to load
   * @returns Fluent interface for method chaining
   */
  async waitForPanelLoad(): Promise<RegulationConfigPanelPage> {
    Log.info('Waiting for Regulation Config Panel to load');

    await expect(this.configPanel).toBeVisible();
    await expect(this.regulationSidebar).toBeVisible();
    await this.waitForNetworkIdle();

    Log.info('Regulation Config Panel loaded successfully');
    return this;
  }

  /**
   * Select a regulatory area/category
   * @param areaName - Name of the regulatory area
   * @returns Fluent interface for method chaining
   */
  async selectRegulatoryArea(areaName: string): Promise<RegulationConfigPanelPage> {
    Log.info(`Selecting regulatory area: ${areaName}`);

    const area = this.page.locator(
      `.regulation-category:has-text("${areaName}"), [data-testid="reg-area"]:has-text("${areaName}")`
    );
    await this.click(area, { description: `Regulatory area: ${areaName}` });

    Log.info(`Regulatory area selected: ${areaName}`);
    return this;
  }

  /**
   * Expand a country to show states
   * @param countryName - Name of the country
   * @returns Fluent interface for method chaining
   */
  async expandCountry(countryName: string): Promise<RegulationConfigPanelPage> {
    Log.info(`Expanding country: ${countryName}`);

    const country = this.page.locator(
      `.country-item:has-text("${countryName}"), [data-testid="country"]:has-text("${countryName}")`
    );

    const isExpanded = await country.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await this.click(country, { description: `Country: ${countryName}` });
      await this.page.waitForTimeout(500); // Wait for expansion animation
    }

    Log.info(`Country expanded: ${countryName}`);
    return this;
  }

  /**
   * Select a state
   * @param stateName - Name of the state
   * @returns Fluent interface for method chaining
   */
  async selectState(stateName: string): Promise<RegulationConfigPanelPage> {
    Log.info(`Selecting state: ${stateName}`);

    const state = this.page.locator(
      `.state-item:has-text("${stateName}"), [data-testid="state"]:has-text("${stateName}")`
    );
    await this.click(state, { description: `State: ${stateName}` });

    Log.info(`State selected: ${stateName}`);
    return this;
  }

  /**
   * Select regulations from the table
   * @param count - Number of regulations to select
   * @returns Fluent interface for method chaining
   */
  async selectRegulationsFromTable(count: number = 5): Promise<RegulationConfigPanelPage> {
    Log.info(`Selecting ${count} regulations from table`);

    for (let i = 0; i < count; i++) {
      const checkbox = this.regulationTableBody.locator(
        `tr:nth-child(${i + 1}) mat-checkbox, tr:nth-child(${i + 1}) input[type="checkbox"]`
      );

      if (await checkbox.isVisible()) {
        await this.click(checkbox, { description: `Regulation checkbox ${i + 1}` });
        await this.page.waitForTimeout(100); // Small delay between selections
      }
    }

    Log.info(`Selected ${count} regulations`);
    return this;
  }

  /**
   * Click save button
   * @returns Fluent interface for method chaining
   */
  async clickSave(): Promise<RegulationConfigPanelPage> {
    Log.info('Clicking Save button');

    await this.click(this.saveButton, { description: 'Save button' });

    Log.info('Save button clicked');
    return this;
  }

  /**
   * Confirm save action in modal
   * @returns Fluent interface for method chaining
   */
  async confirmSave(): Promise<RegulationConfigPanelPage> {
    Log.info('Confirming save action');

    await expect(this.confirmationModal).toBeVisible({ timeout: 5000 });
    await this.click(this.confirmButton, { description: 'Confirm button' });

    // Wait for save API call
    await this.waitForResponse('/api/v1/regulation-config', 200);

    Log.info('Save action confirmed');
    return this;
  }

  /**
   * Close the config panel
   * @returns Fluent interface for method chaining
   */
  async closePanel(): Promise<RegulationConfigPanelPage> {
    Log.info('Closing Regulation Config Panel');

    const closeBtn = await this.closeButton.or(this.cancelButton).first();
    await this.click(closeBtn, { description: 'Close/Cancel button' });

    Log.info('Config panel closed');
    return this;
  }

  /**
   * Get selected countries count
   * @returns Number of selected countries
   */
  async getSelectedCountriesCount(): Promise<number> {
    const selected = await this.page.locator('.country-item.selected').count();
    return selected;
  }

  /**
   * Get selected states count
   * @returns Number of selected states
   */
  async getSelectedStatesCount(): Promise<number> {
    const selected = await this.page.locator('.state-item.selected').count();
    return selected;
  }

  /**
   * Get selected regulations count
   * @returns Number of selected regulations
   */
  async getSelectedRegulationsCount(): Promise<number> {
    const selected = await this.regulationTableBody
      .locator('mat-checkbox:checked, input[type="checkbox"]:checked')
      .count();
    return selected;
  }

  /**
   * Verify panel is open
   */
  async verifyPanelOpen(): Promise<void> {
    Log.info('Verifying Regulation Config Panel is open');

    await expect(this.configPanel).toBeVisible();
    await expect(this.panelHeader).toBeVisible();

    Log.info('Config panel is open');
  }

  /**
   * Verify regulatory options are displayed
   */
  async verifyRegulatoryOptionsDisplayed(): Promise<void> {
    Log.info('Verifying regulatory options are displayed');

    await expect(this.regulatoryCategoriesSection).toBeVisible();
    await expect(this.countriesSection).toBeVisible();
    await expect(this.regulationTable).toBeVisible();

    // Verify lists contain items
    const regAreasCount = await this.page.locator('.regulation-category').count();
    const countriesCount = await this.page.locator('.country-item').count();

    expect(regAreasCount).toBeGreaterThan(0);
    expect(countriesCount).toBeGreaterThan(0);

    Log.info('Regulatory options are displayed with data');
  }

  /**
   * Verify configuration saved successfully
   */
  async verifyConfigurationSaved(): Promise<void> {
    Log.info('Verifying configuration was saved successfully');

    await expect(this.successMessage).toBeVisible({ timeout: 10000 });

    Log.info('Configuration saved successfully');
  }

  /**
   * Verify saved selections are pre-populated
   */
  async verifySavedSelectionsLoaded(): Promise<void> {
    Log.info('Verifying saved selections are pre-populated');

    const selectedCountries = await this.getSelectedCountriesCount();
    const selectedStates = await this.getSelectedStatesCount();

    expect(selectedCountries).toBeGreaterThan(0);
    expect(selectedStates).toBeGreaterThan(0);

    Log.info('Saved selections are pre-populated');
  }

  /**
   * Verify no data message is displayed
   */
  async verifyNoDataMessageDisplayed(): Promise<void> {
    Log.info('Verifying no data message is displayed');

    await expect(this.noDataMessage).toBeVisible();
    await expect(this.saveButton).toBeDisabled();

    Log.info('No data message is displayed and save is disabled');
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessageDisplayed(): Promise<void> {
    Log.info('Verifying error message is displayed');

    await expect(this.errorMessage).toBeVisible();

    const errorText = await this.errorMessage.textContent();
    expect(errorText?.toLowerCase()).toContain('error');

    Log.info('Error message is displayed');
  }

  /**
   * Verify save button is disabled
   */
  async verifySaveButtonDisabled(): Promise<void> {
    Log.info('Verifying save button is disabled');

    await expect(this.saveButton).toBeDisabled();

    Log.info('Save button is disabled');
  }
}

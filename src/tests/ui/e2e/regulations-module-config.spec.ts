/**
 * @fileovervieslations Module Configuration Tests
 * @description E2E tests for User Story #241593 - Reg module enablement and assignment
 * @testCases TC-262244, TC-262245, TC-262247, TC-262248, TC-262249, TC-262250, TC-262251, TC-262252, TC-262254, TC-262255
 */

import { test, expect } from '../../fixtures/advancedFixtures';

/**
 * Test Data Configuration
 */
const testConfig = {
  clientName: 'Test Client - Regulations Module',
  regulatoryAreas: ['Environmental Compliance', 'Data Privacy'],
  countries: ['India', 'United States'],
  states: ['Karnataka', 'California'],
};

test.describe('Regulations Module Configuration - EY Admin', () => {
  test('EY Admin enables Regulations Module for client @regression @smoke @TC-262244 @AC1', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-262244');
    testContext.addMetadata('userStory', '#241593');
    testContext.addMetadata('acceptanceCriteria', 'AC1');

    // Given EY Admin is on Client Listing page
    await eyAdminClientListingPage.navigateToClientListing();
    await eyAdminClientListingPage.verifyPageLoaded();

    // When EY Admin enables Regulations Module for a client
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);

    // Then Regulations Module should be enabled
    await eyAdminClientListingPage.verifyRegulationModuleEnabled(testConfig.clientName);

    // And Configure button should be visible
    await eyAdminClientListingPage.verifyConfigureButtonVisible(testConfig.clientName);

    // And Configuration panel should be accessible
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.verifyPanelOpen();
  });

  test('Fetch and display regulatory options from Questionnaire module @regression @smoke @TC-262245 @AC2-AC3', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
  }) => {
    // Given Regulations Module is enabled
    await eyAdminClientListingPage.navigateToClientListing();
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);

    // When Configuration panel is opened
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();

    // Then Regulatory areas, countries, and states should be displayed
    await regulationConfigPanelPage.verifyRegulatoryOptionsDisplayed();

    // And User should be able to select multiple items
    await regulationConfigPanelPage.selectRegulatoryArea(testConfig.regulatoryAreas[0]);
    await regulationConfigPanelPage.expandCountry(testConfig.countries[0]);
    await regulationConfigPanelPage.selectState(testConfig.states[0]);
  });

  test('Save multiple selections in configuration panel @regression @TC-262247 @AC4', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
    dataResolver,
  }) => {
    // Given EY Admin has selected regulatory scope
    await eyAdminClientListingPage.navigateToClientListing();
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();

    // And Multiple items are selected
    await regulationConfigPanelPage.selectRegulatoryArea(testConfig.regulatoryAreas[0]);
    await regulationConfigPanelPage.expandCountry(testConfig.countries[0]);
    await regulationConfigPanelPage.selectState(testConfig.states[0]);
    await regulationConfigPanelPage.selectRegulationsFromTable(5);

    // When EY Admin saves the configuration
    await regulationConfigPanelPage.clickSave();
    await regulationConfigPanelPage.confirmSave();

    // Then Configuration should be saved successfully
    await regulationConfigPanelPage.verifyConfigurationSaved();
  });

  test('Pre-populate configuration panel with saved selections @regression @TC-262248 @AC5', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
  }) => {
    // Given Configuration has been saved previously
    await eyAdminClientListingPage.navigateToClientListing();

    // When EY Admin reopens the configuration panel
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();

    // Then Previously saved selections should be pre-populated
    await regulationConfigPanelPage.verifySavedSelectionsLoaded();

    // And User should see selected items
    const selectedCountries = await regulationConfigPanelPage.getSelectedCountriesCount();
    const selectedStates = await regulationConfigPanelPage.getSelectedStatesCount();

    expect(selectedCountries).toBeGreaterThan(0);
    expect(selectedStates).toBeGreaterThan(0);
  });

  test('Update and save changes to regulatory scope @regression @TC-262249 @AC6', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
  }) => {
    // Given A saved configuration exists
    await eyAdminClientListingPage.navigateToClientListing();
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();

    // When EY Admin modifies the selections
    await regulationConfigPanelPage.expandCountry(testConfig.countries[1]);
    await regulationConfigPanelPage.selectState('Maharashtra');
    await regulationConfigPanelPage.selectRegulationsFromTable(3);

    // And Saves the changes
    await regulationConfigPanelPage.clickSave();
    await regulationConfigPanelPage.confirmSave();

    // Then Configuration should be updated successfully
    await regulationConfigPanelPage.verifyConfigurationSaved();
  });

  test('Disable module and verify read-only state @regression @TC-262250 @AC7', async ({
    eyAdminClientListingPage,
  }) => {
    // Given Regulations Module is enabled with saved configuration
    await eyAdminClientListingPage.navigateToClientListing();
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);

    // When EY Admin disables the module
    await eyAdminClientListingPage.disableRegulationModule(testConfig.clientName);

    // Then Module should be disabled
    await eyAdminClientListingPage.verifyRegulationModuleDisabled(testConfig.clientName);

    // And Configure button should not be visible
    await eyAdminClientListingPage.verifyConfigureButtonNotVisible(testConfig.clientName);
  });

  test('Audit logging for configuration actions @regression @TC-262251 @AC8', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
    page,
  }) => {
    // Given EY Admin performs configuration actions
    await eyAdminClientListingPage.navigateToClientListing();

    // When Enable module
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);

    // And Save configuration
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();
    await regulationConfigPanelPage.selectRegulationsFromTable(2);
    await regulationConfigPanelPage.clickSave();
    await regulationConfigPanelPage.confirmSave();
    await regulationConfigPanelPage.closePanel();

    // And Update configuration
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.selectRegulationsFromTable(1);
    await regulationConfigPanelPage.clickSave();
    await regulationConfigPanelPage.confirmSave();
    await regulationConfigPanelPage.closePanel();

    // And Disable module
    await eyAdminClientListingPage.disableRegulationModule(testConfig.clientName);

    // Then Audit logs should contain all actions
    await page.goto('/ey-admin/audit-logs');
    await page.fill('input[name="search"]', testConfig.clientName);
    await page.selectOption('select[name="action"]', 'regulation_config');
    await page.click('button:has-text("Search")');

    // Verify audit log entries
    const auditRows = page.locator('table.audit-logs tbody tr');
    const count = await auditRows.count();

    expect(count).toBeGreaterThanOrEqual(4);

    // Verify first entry has required fields
    const firstRow = auditRows.first();
    await expect(firstRow.locator('td.user-id')).not.toBeEmpty();
    await expect(firstRow.locator('td.client-id')).not.toBeEmpty();
    await expect(firstRow.locator('td.action')).not.toBeEmpty();
    await expect(firstRow.locator('td.timestamp')).not.toBeEmpty();
  });

  test('Handle empty Questionnaire module gracefully @regression @TC-262252', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
    page,
  }) => {
    // Given Questionnaire module has no data (mock empty responses)
    await page.route('**/reg-area', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([]),
      })
    );
    await page.route('**/geography/countries', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([]),
      })
    );

    await eyAdminClientListingPage.navigateToClientListing();
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);

    // When Configuration panel loads
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();

    // Then System should display no-data message
    await regulationConfigPanelPage.verifyNoDataMessageDisplayed();
  });

  test('Prevent saving configuration with no selections @regression @TC-262254', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
  }) => {
    // Given Configuration panel is open with no selections
    await eyAdminClientListingPage.navigateToClientListing();
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();

    // When User attempts to save without selections
    // Then Save button should be disabled
    await regulationConfigPanelPage.verifySaveButtonDisabled();
  });

  test('Handle network failure during fetch of regulatory options @regression @TC-262255', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
    page,
  }) => {
    // Given Network connection fails for regulatory options
    await page.route('**/reg-area', route => route.abort('failed'));

    await eyAdminClientListingPage.navigateToClientListing();
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);

    // When Configuration panel attempts to load
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);

    // Wait for API timeout
    await page.waitForTimeout(3000);

    // Then System should display error message
    await regulationConfigPanelPage.verifyErrorMessageDisplayed();

    // And Retry option should be available
    await expect(
      page.locator('button:has-text("Retry"), button:has-text("Refresh")')
    ).toBeVisible();
  });
});

test.describe('Regulations Module - Full Workflow Integration', () => {
  test('Complete workflow: Enable -> Configure -> Save -> Update -> Disable', async ({
    eyAdminClientListingPage,
    regulationConfigPanelPage,
    dataResolver,
  }) => {
    // Given EY Admin is logged in
    await eyAdminClientListingPage.navigateToClientListing();

    // When Enable Regulations Module
    await eyAdminClientListingPage.enableRegulationModule(testConfig.clientName);
    await eyAdminClientListingPage.verifyRegulationModuleEnabled(testConfig.clientName);

    // And Configure and save regulatory scope
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();
    await regulationConfigPanelPage.selectRegulatoryArea(testConfig.regulatoryAreas[0]);
    await regulationConfigPanelPage.expandCountry(testConfig.countries[0]);
    await regulationConfigPanelPage.selectState(testConfig.states[0]);
    await regulationConfigPanelPage.selectRegulationsFromTable(3);
    await regulationConfigPanelPage.clickSave();
    await regulationConfigPanelPage.confirmSave();
    await regulationConfigPanelPage.closePanel();

    // And Verify configuration was saved
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.waitForPanelLoad();
    await regulationConfigPanelPage.verifySavedSelectionsLoaded();
    await regulationConfigPanelPage.closePanel();

    // And Update configuration
    await eyAdminClientListingPage.openRegulationConfigPanel(testConfig.clientName);
    await regulationConfigPanelPage.selectRegulationsFromTable(2);
    await regulationConfigPanelPage.clickSave();
    await regulationConfigPanelPage.confirmSave();
    await regulationConfigPanelPage.closePanel();

    // And Disable module
    await eyAdminClientListingPage.disableRegulationModule(testConfig.clientName);

    // Then Module should be disabled
    await eyAdminClientListingPage.verifyRegulationModuleDisabled(testConfig.clientName);
    await eyAdminClientListingPage.verifyConfigureButtonNotVisible(testConfig.clientName);
  });
});

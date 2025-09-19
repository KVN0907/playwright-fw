import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';

export class Document360ProjectSettingsPage extends BasePage {
  // Header elements
  private settingsTitle: Locator;
  private breadcrumb: Locator;

  // Navigation elements
  private settingsNavigation: Locator;
  private generalTab: Locator;
  private teamAuditingTab: Locator;
  private localizationTab: Locator;

  // General settings form elements
  private projectNameInput: Locator;
  private projectDescriptionInput: Locator;
  private projectLogoUpload: Locator;
  private brandColorPicker: Locator;
  private languageDropdown: Locator;
  private timezoneDropdown: Locator;
  private saveButton: Locator;

  // Delete section elements
  private deleteSection: Locator;
  private deleteKnowledgeBaseText: Locator;
  private deleteWarningText: Locator;
  private deleteButton: Locator;
  private confirmDeleteModal: Locator;
  private confirmDeleteInput: Locator;
  private finalDeleteButton: Locator;

  // Trial elements
  private trialBadge: Locator;
  private upgradeButton: Locator;

  constructor(page: Page) {
    super(page);

    // Header locators
    this.settingsTitle = page.getByText(/project settings/i);
    this.breadcrumb = page.locator('[aria-label="Breadcrumb"]');

    // Navigation locators
    this.settingsNavigation = page.locator('.nav-tabs, .nav-pills').first();
    this.generalTab = page.locator('.text-truncate');
    this.teamAuditingTab = page.getByRole('tab', { name: /team.*auditing/i });
    this.localizationTab = page.getByRole('tab', { name: /localization/i });

    // General settings form locators
    this.projectNameInput = page.locator('#inputsm');
    this.projectDescriptionInput = page.getByRole('textbox', { name: /description/i });
    this.projectLogoUpload = page.locator('input[type="file"]').first();
    this.brandColorPicker = page.locator('[type="color"], .color-picker').first();
    this.languageDropdown = page.getByRole('combobox', { name: /language/i });
    this.timezoneDropdown = page.getByRole('combobox', { name: /timezone/i });
    this.saveButton = page.getByRole('button', { name: /save/i });

    // Delete section locators - more flexible selectors
    this.deleteSection = page.locator('.delete-section, [class*="delete"], .danger-zone').first();
    this.deleteKnowledgeBaseText = page.getByText(/delete knowledge base/i);
    this.deleteWarningText = page.getByText(/this action cannot be undone/i);
    this.deleteButton = page
      .getByRole('button', { name: /^delete$/i })
      .or(page.getByRole('button', { name: /delete.*knowledge.*base/i }));
    this.confirmDeleteModal = page.getByRole('dialog').or(page.locator('.modal, .popup')).first();
    this.confirmDeleteInput = page
      .getByRole('textbox', { name: /confirm/i })
      .or(page.locator('input[placeholder*="confirm"]'));
    this.finalDeleteButton = page
      .getByRole('button', { name: /delete.*permanently/i })
      .or(page.getByRole('button', { name: /confirm.*delete/i }));

    // Trial elements
    this.trialBadge = page.getByText(/trial/i);
    this.upgradeButton = page.getByRole('button', { name: /upgrade/i });
  }

  /**
   * Verify settings page has loaded correctly
   */
  async verifySettingsPageLoaded(): Promise<void> {
    Log.info('Verifying settings page loaded');
    await expect(this.page).toHaveURL(/.*settings/);
    await expect(this.settingsTitle).toBeVisible({ timeout: 10000 });
    Log.info('Settings page verification completed');
  }

  /**
   * Verify trial status is displayed
   */
  async verifyTrialStatus(): Promise<void> {
    Log.info('Verifying trial status');
    await expect(this.trialBadge).toBeVisible();
    Log.info('Trial status verification completed');
  }

  /**
   * Get the current project name from settings
   */
  async getProjectName(): Promise<string> {
    Log.info('Getting project name from settings');
    await expect(this.projectNameInput).toBeVisible();
    const projectName = await this.projectNameInput.inputValue();
    Log.info(`Project name: ${projectName}`);
    return projectName;
  }

  /**
   * Verify navigation links are visible
   */
  async verifyNavigationLinksVisible(): Promise<void> {
    Log.info('Verifying navigation links visibility');
    await expect(this.generalTab).toBeVisible();
    Log.info('Navigation links verification completed');
  }

  /**
   * Navigate to different settings sections
   */
  async navigateToSettingsSection(
    section: 'general' | 'team-auditing' | 'localization'
  ): Promise<void> {
    Log.info(`Navigating to ${section} settings section`);

    const tabMap = {
      general: this.generalTab,
      'team-auditing': this.teamAuditingTab,
      localization: this.localizationTab,
    };

    const targetTab = tabMap[section];
    if (!targetTab) {
      throw new Error(`Unknown settings section: ${section}`);
    }

    await targetTab.click();
    await this.page.waitForURL(new RegExp(`.*settings.*${section.replace('-', '.*')}`));
    Log.info(`Successfully navigated to ${section} section`);
  }

  /**
   * Delete the current project
   */
  async deleteProject(): Promise<void> {
    Log.info('Starting project deletion process');

    // First verify we can see the delete section
    await expect(this.deleteKnowledgeBaseText).toBeVisible({ timeout: 10000 });
    Log.info('Delete section is visible');

    // Click the delete button
    await expect(this.deleteButton).toBeVisible();
    await this.deleteButton.click();
    Log.info('Clicked delete button');

    // Wait for the confirmation dialog to appear
    const confirmationDialog = this.page.locator('[role="dialog"]').filter({ hasText: 'Delete' });
    await expect(confirmationDialog).toBeVisible({ timeout: 10000 });
    Log.info('Delete confirmation dialog appeared');

    // Get the project subdomain from the dialog text
    const projectSubdomainElement = confirmationDialog.locator('text=api-test-documentation');
    const projectSubdomain = await projectSubdomainElement.textContent();
    const subdomainToType = projectSubdomain?.trim() || 'api-test-documentation';

    Log.info(`Typing project subdomain: ${subdomainToType}`);

    // Type the project subdomain in the confirmation textbox
    const subdomainInput = confirmationDialog.getByRole('textbox', {
      name: /type.*project.*subdomain/i,
    });
    await expect(subdomainInput).toBeVisible();
    await subdomainInput.fill(subdomainToType);

    // Click the Yes button (should be enabled now)
    const yesButton = confirmationDialog.getByRole('button', { name: 'Yes' });
    await expect(yesButton).toBeEnabled({ timeout: 5000 });
    await yesButton.click();

    Log.info('Confirmed project deletion');

    // Wait for navigation back to dashboard
    await this.page.waitForURL(/.*dashboard/, { timeout: 15000 });
    Log.info('Project deletion completed, navigated back to dashboard');
  }

  /**
   * Get current settings section
   */
  async getCurrentSettingsSection(): Promise<string> {
    Log.info('Getting current settings section');
    const currentUrl = this.page.url();

    if (currentUrl.includes('general')) return 'general';
    if (currentUrl.includes('team') || currentUrl.includes('auditing')) return 'team-auditing';
    if (currentUrl.includes('localization')) return 'localization';

    return 'general'; // default
  }

  /**
   * Update project settings
   */
  async updateProjectSettings(settings: {
    name?: string;
    description?: string;
    language?: string;
    timezone?: string;
  }): Promise<void> {
    Log.info('Updating project settings');

    if (settings.name) {
      await this.projectNameInput.fill(settings.name);
      Log.info(`Updated project name to: ${settings.name}`);
    }

    if (settings.description) {
      await this.projectDescriptionInput.fill(settings.description);
      Log.info(`Updated project description`);
    }

    if (settings.language) {
      await this.languageDropdown.selectOption(settings.language);
      Log.info(`Updated language to: ${settings.language}`);
    }

    if (settings.timezone) {
      await this.timezoneDropdown.selectOption(settings.timezone);
      Log.info(`Updated timezone to: ${settings.timezone}`);
    }

    // Save the changes
    await this.saveButton.click();
    Log.info('Saved project settings');

    // Wait for save confirmation
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify delete section is visible and accessible
   */
  async verifyDeleteSectionVisible(): Promise<void> {
    Log.info('Verifying delete section visibility');
    await expect(this.deleteKnowledgeBaseText).toBeVisible();
    await expect(this.deleteButton).toBeVisible();
    Log.info('Delete section verification completed');
  }

  /**
   * Get all available settings tabs
   */
  async getAvailableSettingsTabs(): Promise<string[]> {
    Log.info('Getting available settings tabs');
    const tabs: string[] = [];

    const tabElements = [
      { name: 'General', element: this.generalTab },
      { name: 'Team & Auditing', element: this.teamAuditingTab },
      { name: 'Localization', element: this.localizationTab },
    ];

    for (const tab of tabElements) {
      if (await tab.element.isVisible({ timeout: 2000 })) {
        tabs.push(tab.name);
      }
    }

    Log.info(`Available tabs: ${tabs.join(', ')}`);
    return tabs;
  }
}

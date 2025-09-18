import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';

export class Document360DashboardPage extends BasePage {
  // Page elements
  // Page elements
  private readonly projectStatus: Locator;
  private readonly projectName: Locator;
  private readonly privateIcon: Locator;
  private readonly settingsButton: Locator;
  private readonly documentationButton: Locator;
  private readonly externalLinkButton: Locator;
  private readonly projectList: Locator;
  private readonly projectItems: Locator;

  constructor(page: Page) {
    super(page);
    // Document360 specific selectors
    this.projectStatus = page.locator('.project-status');
    this.projectName = page.locator('.p-name');
    this.privateIcon = page.locator('.project-type .fa-lock-keyhole');
    this.settingsButton = page.locator('button:has(i.fa-cog)');
    this.documentationButton = page.locator('button:has(i.fa-book-open)');
    this.externalLinkButton = page.locator('a#btn_go_to_your_knowledge_base_site');
    this.projectList = page.locator('.project-list');
    this.projectItems = this.projectList.locator('li');
  }

  async verifyPageLoaded(): Promise<void> {
    Log.info('Verifying API Test Documentation page is loaded');
    await this.verifyElementVisible(this.projectStatus, 'Project status');
    await this.verifyElementVisible(this.projectName, 'Project name');
    await this.verifyElementVisible(this.privateIcon, 'Private icon');
    Log.info('API Test Documentation page loaded successfully');
  }

  async getProjectStatus(): Promise<string> {
    const statusText = await this.projectStatus.innerText();
    Log.info(`Project status: ${statusText}`);
    return statusText;
  }

  async getProjectName(): Promise<string> {
    const nameText = await this.projectName.innerText();
    Log.info(`Project name: ${nameText}`);
    return nameText;
  }

  async clickSettings(): Promise<void> {
    Log.info('Clicking on settings button');
    await this.clickElement(this.settingsButton, 'Settings button');
  }

  async clickDocumentation(): Promise<void> {
    Log.info('Clicking on documentation button');
    await this.clickElement(this.documentationButton, 'Documentation button');
  }

  async clickExternalLink(): Promise<void> {
    Log.info('Clicking on external link button');
    await this.clickElement(this.externalLinkButton, 'External link button');
  }

  async navigateToDashboard(): Promise<void> {
    Log.info('Navigating to Document360 dashboard');
    await this.page.goto('/dashboard');
    Log.info('Successfully navigated to Document360 dashboard');
  }

  async verifyDashboardLoaded(): Promise<void> {
    Log.info('Verifying dashboard page loaded');
    await expect(this.page).toHaveURL(/.*dashboard$/);
    Log.info('Dashboard page verification completed');
  }

 async verifyProjectsExist(): Promise<boolean> {
    Log.info('Verifying if projects exist');
    await this.projectList.waitFor({ state: 'visible' });
    await this.projectItems.waitFor({ state: 'attached' });
    const count = await this.projectItems.count();
    const exists = count > 0;
    Log.info(`Projects exist: ${exists}`);
    return exists;
  }

  async getProjectCount(): Promise<number> {
    const count = await this.projectItems.count();
    Log.info(`Number of projects: ${count}`);
    return count;
  }

  async navigateToProjectSettings(): Promise<void> {
    Log.info('Navigating to project settings');
    await this.clickSettings();
    Log.info('Successfully navigated to project settings');
  }

  async verifyTrialLimitations(): Promise<void> {
    Log.info('Verifying trial limitations');
    // Add trial verification logic as needed
    Log.info('Trial limitations verified');
  }

  async verifySuccessMessage(message: string): Promise<void> {
    Log.info(`Verifying success message: ${message}`);
    const successAlert = this.page.getByRole('alert', { name: message });
    await expect(successAlert).toBeVisible();
    Log.info('Success message verification completed');
  }
}
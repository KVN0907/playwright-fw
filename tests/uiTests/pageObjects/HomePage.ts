import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import dotenv from 'dotenv';
dotenv.config();

export class HomePage extends BasePage {
  readonly banner: Locator;
  readonly heading: Locator;
  readonly controlDefinitionLibraries: Locator;
  readonly approval: Locator;
  readonly maintenance: Locator;

  constructor(page: Page) {
    super(page);
    // Use more specific locator for the welcome banner that contains "Good Day"
    this.banner = page.locator('h1:has-text("Good Day")'); 
    this.heading = page.locator('role=heading'); // General heading locator
    this.controlDefinitionLibraries = page.locator('text=Control Definition Libraries');
    this.approval = page.locator('text=Approval');
    this.maintenance = page.locator('text=Maintenance');
  }

  async verifyBannerText(expectedText: string) {
    console.log(this.page.url());
    // Wait for the page to load and the error state to clear
    await this.page.waitForLoadState('networkidle');
    // Wait for the specific banner to be visible
    await this.banner.waitFor({ state: 'visible', timeout: 15000 });
    await this.verifyText(this.banner, expectedText, 'Banner text');
  }

  async verifyHeadingText(expectedText: string) {
    await this.verifyText(this.heading, expectedText, 'Heading text');
  }

  /**
   * Navigate back using browser back button
   */
  async navigateBack() {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');
    console.log('Navigated back to previous page');
  }

  async navigateToControlDefinitionLibraries() {
    await this.clickElement(this.controlDefinitionLibraries, 'Control Definition Libraries');
    await this.navigateBack();
  }

  async navigateToApproval() {
    await this.clickElement(this.approval, 'Approval');
    await this.navigateBack();
  }

  async navigateToMaintenance() {
    await this.clickElement(this.maintenance, 'Maintenance');
    await this.navigateBack();
  }
}
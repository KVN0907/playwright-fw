import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import dotenv from 'dotenv';
dotenv.config();

export class HomePage extends BasePage {
  readonly banner: Locator;
  readonly heading: Locator;
  readonly menuSetup: Locator;
  readonly setupHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.banner = page.locator('b.name');
    this.heading = page.locator('role=heading');
    this.menuSetup = page.locator('#menuSetup span');
    this.setupHeading = page.locator('role=heading[name="Setup"]');
  }

  async verifyBannerText(expectedText: string) {
    await this.verifyText(this.banner, expectedText, 'Banner text');
  }

  async verifyHeadingText(expectedText: string) {
    await this.verifyText(this.heading, expectedText, 'Heading text');
  }

  async navigateToSetup() {
    await this.clickElement(this.menuSetup, 'Setup menu');
    await this.clickElement(this.setupHeading, 'Setup heading');
  }
}

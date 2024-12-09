import { expect, Locator, Page } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();


export class HomePage {
  readonly page: Page;
  readonly banner: Locator;
  readonly heading: Locator;
  readonly menuSetup: Locator;
  readonly setupHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.banner = page.locator('b.name');
    this.heading = page.locator('role=heading');
    this.menuSetup = page.locator('#menuSetup span');
    this.setupHeading = page.locator('role=heading[name="Setup"]');
  }

  async verifyBannerText(expectedText: string) {
    await expect(this.banner).toContainText(expectedText);
    console.log('Banner text verified');
  }

  async verifyHeadingText(expectedText: string) {
    await expect(this.heading).toContainText(expectedText);
    console.log('Heading text verified');
  }

  async navigateToSetup() {
    await this.menuSetup.click();
    await this.setupHeading.click();
  }
}

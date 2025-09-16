import { Locator, Page, expect } from '@playwright/test';
import Log from './Log';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || '';
  }

  // Public method to get current URL
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // Public method to reload page
  async reloadPage(): Promise<void> {
    await this.page.reload();
  }

  // Public method to wait for load state
  async waitForPageLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  // Common page operations
  async navigateTo(path: string = '') {
    const url = `${this.baseURL}${path}`;
    Log.info(`Navigating to: ${url}`);
    await this.page.goto(url);
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load') {
    await this.page.waitForLoadState(state);
  }

  async waitForElement(locator: Locator, timeout: number = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async clickElement(locator: Locator, description?: string) {
    if (description) Log.info(`Clicking: ${description}`);
    await this.waitForElement(locator);
    await locator.click();
  }

  async fillElement(locator: Locator, text: string, description?: string) {
    if (description) Log.info(`Filling ${description} with: ${text}`);
    await this.waitForElement(locator);
    await locator.fill(text);
  }

  async verifyText(locator: Locator, expectedText: string, description?: string) {
    if (description) Log.info(`Verifying ${description}: ${expectedText}`);
    await expect(locator).toContainText(expectedText);
  }

  async verifyElementVisible(locator: Locator, description?: string) {
    if (description) Log.info(`Verifying ${description} is visible`);
    await expect(locator).toBeVisible();
  }

  async takeScreenshot(name?: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = name || `screenshot-${timestamp}`;
    await this.page.screenshot({
      path: `test-results/screenshots/${screenshotName}.png`,
      fullPage: true,
    });
    Log.info(`Screenshot taken: ${screenshotName}.png`);
  }

  // Get current page title
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  // Get current URL
  getCurrentURL(): string {
    return this.page.url();
  }

  // Wait for specific URL pattern
  async waitForURL(urlPattern: string | RegExp, timeout: number = 30000) {
    await this.page.waitForURL(urlPattern, { timeout });
  }
}

/**
 * @fileoverview HomePage - Landing page after authentication
 * @description Provides fluent interface for home page interactions with method chaining
 */

import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../lib/Log';

export class HomePage extends BasePage<HomePage> {
  readonly banner: Locator;
  readonly heading: Locator;
  readonly controlDefinitionLibraries: Locator;
  readonly approval: Locator;
  readonly maintenance: Locator;

  constructor(page: Page) {
    super(page);
    // Use more specific locator for the welcome banner that contains "Good Day"
    this.banner = page.locator('h1:has-text("Good Day.")');
    this.heading = page.locator('role=heading'); // General heading locator
    this.controlDefinitionLibraries = page.locator('text=Control Definition Libraries');
    this.approval = page.locator('text=Approval');
    this.maintenance = page.locator('text=Maintenance');
  }

  /**
   * Verify banner text with fluent chaining
   * @param expectedText - Expected banner text
   * @returns Fluent interface for method chaining
   */
  async verifyBannerText(expectedText: string): Promise<HomePage> {
    Log.info(`Current URL: ${this.page.url()}`);
    await this.waitForLoad('networkidle');
    await this.waitForElement(this.banner, 'visible', 15000);
    await this.verifyText(this.banner, expectedText, 'Banner text');
    return this;
  }

  /**
   * Verify heading text with fluent chaining
   * @param expectedText - Expected heading text
   * @returns Fluent interface for method chaining
   */
  async verifyHeadingText(expectedText: string): Promise<HomePage> {
    await this.verifyText(this.heading, expectedText, 'Heading text');
    return this;
  }

  /**
   * Navigate back using browser back button
   * @returns Fluent interface for method chaining
   */
  async navigateBack(): Promise<HomePage> {
    await this.page.goBack();
    await this.waitForLoad('networkidle');
    Log.info('Navigated back to previous page');
    return this;
  }

  /**
   * Navigate to Control Definition Libraries and back
   * @returns Fluent interface for method chaining
   */
  async navigateToControlDefinitionLibraries(): Promise<HomePage> {
    await this.click(this.controlDefinitionLibraries, {
      description: 'Control Definition Libraries',
    });
    await this.navigateBack();
    return this;
  }

  /**
   * Navigate to Approval and back
   * @returns Fluent interface for method chaining
   */
  async navigateToApproval(): Promise<HomePage> {
    await this.click(this.approval, { description: 'Approval' });
    await this.navigateBack();
    return this;
  }

  /**
   * Navigate to Maintenance and back
   * @returns Fluent interface for method chaining
   */
  async navigateToMaintenance(): Promise<HomePage> {
    await this.click(this.maintenance, { description: 'Maintenance' });
    await this.navigateBack();
    return this;
  }
}

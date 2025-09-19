import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';

export class Document360DocumentationPage extends BasePage {
  private readonly documentationContainer: Locator;
  private readonly apiMenuItem: Locator;
  private readonly frame: FrameLocator;

  constructor(page: Page) {
    super(page);
    this.documentationContainer = page
      .locator('.documentation-container, [data-testid="documentation-container"]')
      .first();
    this.apiMenuItem = page.getByRole('link', { name: /api/i }).first();
    this.frame = page.frameLocator('iframe, [data-testid="doc-frame"]');
  }

  async verifyDocumentationContainerVisible(): Promise<void> {
    Log.info('Verifying documentation main container is visible');
    await expect(this.documentationContainer).toBeVisible();
    Log.info('Documentation main container is visible');
  }

  async clickApiMenu(): Promise<void> {
    Log.info('Clicking API menu item in documentation side pane');
    await this.apiMenuItem.click();
    Log.info('Clicked API menu item');
  }

  async verifyFrameLoaded(): Promise<void> {
    Log.info('Verifying documentation frame is loaded');
    const frameHeading = this.frame.locator('h1, h2, [data-testid="doc-frame-heading"]').first();
    await expect(frameHeading).toBeVisible();
    Log.info('Documentation frame loaded and heading is visible');
  }
}

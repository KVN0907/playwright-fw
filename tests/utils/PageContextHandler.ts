import { Page, BrowserContext } from '@playwright/test';
import Log from './Log';

/**
 * Utility class for handling page context switching when dealing with new tabs/windows
 */
export class PageContextHandler {
  private originalPage: Page;
  private currentPage: Page;
  private context: BrowserContext;

  constructor(page: Page) {
    this.originalPage = page;
    this.currentPage = page;
    this.context = page.context();
  }

  /**
   * Waits for a new page/tab to open and switches context to it
   * @param triggerAction - The action that will trigger the new page to open
   * @param timeout - Timeout in milliseconds to wait for the new page
   * @returns Promise<Page> - The new page instance
   */
  async switchToNewPage(
    triggerAction: () => Promise<void>,
    timeout: number = 30000
  ): Promise<Page> {
    try {
      Log.info('Waiting for new page to open...');

      // Set up promise to wait for new page
      const newPagePromise = this.context.waitForEvent('page', { timeout });

      // Execute the action that triggers the new page
      await triggerAction();

      // Wait for the new page to load
      const newPage = await newPagePromise;
      await newPage.waitForLoadState('domcontentloaded');

      // Update current page reference
      this.currentPage = newPage;

      Log.info(`Successfully switched to new page: ${newPage.url()}`);
      return newPage;
    } catch (error) {
      Log.error(`Failed to switch to new page: ${error}`);
      throw error;
    }
  }

  /**
   * Gets the current active page
   * @returns Page - The current page instance
   */
  getCurrentPage(): Page {
    return this.currentPage;
  }

  /**
   * Gets the original page
   * @returns Page - The original page instance
   */
  getOriginalPage(): Page {
    return this.originalPage;
  }

  /**
   * Switches back to the original page context
   * @returns Promise<Page> - The original page instance
   */
  async switchToOriginalPage(): Promise<Page> {
    try {
      Log.info('Switching back to original page...');

      // Bring original page to front
      await this.originalPage.bringToFront();

      // Update current page reference
      this.currentPage = this.originalPage;

      Log.info(`Successfully switched back to original page: ${this.originalPage.url()}`);
      return this.originalPage;
    } catch (error) {
      Log.error(`Failed to switch back to original page: ${error}`);
      throw error;
    }
  }

  /**
   * Closes the current page if it's not the original page and switches back to original
   * @returns Promise<Page> - The original page instance
   */
  async closeCurrentAndSwitchToOriginal(): Promise<Page> {
    try {
      if (this.currentPage !== this.originalPage) {
        Log.info(`Closing current page: ${this.currentPage.url()}`);
        await this.currentPage.close();
      }

      return await this.switchToOriginalPage();
    } catch (error) {
      Log.error(`Failed to close current page and switch to original: ${error}`);
      throw error;
    }
  }

  /**
   * Gets all pages in the browser context
   * @returns Page[] - Array of all pages
   */
  getAllPages(): Page[] {
    return this.context.pages();
  }

  /**
   * Switches to a specific page by index
   * @param index - The index of the page to switch to
   * @returns Promise<Page> - The page instance
   */
  async switchToPageByIndex(index: number): Promise<Page> {
    try {
      const pages = this.getAllPages();

      if (index < 0 || index >= pages.length) {
        throw new Error(`Page index ${index} is out of range. Available pages: ${pages.length}`);
      }

      const targetPage = pages[index];
      await targetPage.bringToFront();

      this.currentPage = targetPage;

      Log.info(`Successfully switched to page at index ${index}: ${targetPage.url()}`);
      return targetPage;
    } catch (error) {
      Log.error(`Failed to switch to page at index ${index}: ${error}`);
      throw error;
    }
  }

  /**
   * Waits for a specific number of pages to be open
   * @param expectedCount - Expected number of pages
   * @param timeout - Timeout in milliseconds
   * @returns Promise<Page[]> - Array of all pages
   */
  async waitForPageCount(expectedCount: number, timeout: number = 10000): Promise<Page[]> {
    try {
      Log.info(`Waiting for ${expectedCount} pages to be open...`);

      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        const pages = this.getAllPages();

        if (pages.length === expectedCount) {
          Log.info(`Successfully found ${expectedCount} pages`);
          return pages;
        }

        // Wait a bit before checking again
        await this.currentPage.waitForTimeout(500);
      }

      throw new Error(
        `Timeout waiting for ${expectedCount} pages. Current count: ${this.getAllPages().length}`
      );
    } catch (error) {
      Log.error(`Failed to wait for page count: ${error}`);
      throw error;
    }
  }
}

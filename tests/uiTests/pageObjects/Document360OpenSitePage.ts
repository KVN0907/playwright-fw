import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';

export class Document360OpenSitePage extends BasePage {
  private readonly openSiteLink: Locator;

  constructor(page: Page) {
    super(page);
    // Selector for the external/open site link from dashboard or project tile
    this.openSiteLink = page
      .locator(
        'a[aria-label*="open site"], a[target="_blank"], a[href*=".document360.io"], a#btn_go_to_your_knowledge_base_site'
      )
      .first();
  }

  async clickOpenSite(): Promise<void> {
    Log.info('Clicking on open site/external link');
    await this.openSiteLink.click();
    Log.info('Clicked on open site/external link');
  }
}

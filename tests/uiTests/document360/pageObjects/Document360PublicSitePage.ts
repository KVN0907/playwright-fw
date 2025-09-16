import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../utils/BasePage';
import { createSelectorHelper, Document360Selectors } from '../../../utils/SelectorHelper';
import { TestDataHelper } from '../testData/ApiTestData';
import Log from '../../../utils/Log';

/**
 * Page Object for Document360 Public Site
 * Based on real inspection of the public site at https://pet-store-api-testing---septem.document360.io/docs
 * This handles interactions with the public-facing documentation site
 * 
 * Key interactions:
 * 1. Site navigation and content verification
 * 2. Documentation section navigation
 * 3. Site content validation
 */
export class Document360PublicSitePage extends BasePage {
  private selectorHelper: any;

  // Main site selectors
  private readonly siteHeader: Locator;
  private readonly siteTitle: Locator;
  private readonly mainNavigation: Locator;

  // Documentation section selectors
  private readonly documentationLink: Locator;
  private readonly articlesSection: Locator;
  private readonly categoryNavigation: Locator;

  // Content verification selectors
  private readonly pageContent: Locator;
  private readonly articleTitle: Locator;
  private readonly breadcrumbs: Locator;

  constructor(page: Page) {
    super(page);
    this.selectorHelper = createSelectorHelper(page, TestDataHelper.getTimeout('default'), true);

    // Main site elements
    this.siteHeader = this.page.locator('header, [role="banner"], .header');
    this.siteTitle = this.page.locator('h1, .site-title, [data-testid="site-title"]');
    this.mainNavigation = this.page.locator('nav, [role="navigation"], .main-nav');

    // Documentation section elements based on DOM analysis
    this.documentationLink = this.page.locator('a').filter({ hasText: /documentation/i });
    this.articlesSection = this.page.locator('[class*="article"], [class*="content"], main');
    this.categoryNavigation = this.page.locator('[class*="category"], [class*="sidebar"], aside');

    // Content verification elements
    this.pageContent = this.page.locator('main, [role="main"], .content');
    this.articleTitle = this.page.locator('h1, h2, .article-title, [class*="title"]');
    this.breadcrumbs = this.page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]');
  }

  /**
   * Navigate to the public site from dashboard Open Site button
   * This method handles the tab switching that occurs when Open Site is clicked
   */
  async navigateToPublicSiteFromDashboard(): Promise<void> {
    Log.info('Navigating to public site from dashboard');

    // The public site should already be open in a new tab when Open Site was clicked
    // We need to switch to the public site tab
    const pages = this.page.context().pages();
    
    // Find the public site tab (should contain the public site URL)
    let publicSitePage: Page | null = null;
    for (const page of pages) {
      const url = page.url();
      if (url.includes('.document360.io/docs') || url.includes('pet-store-api-testing')) {
        publicSitePage = page;
        break;
      }
    }

    if (publicSitePage) {
      // Switch context to the public site page
      await publicSitePage.bringToFront();
      Log.info(`Switched to public site page: ${publicSitePage.url()}`);
    } else {
      throw new Error('Public site page not found. Ensure Open Site was clicked from dashboard.');
    }

    await this.waitForPublicSiteLoad();
    Log.info('Successfully navigated to public site');
  }

  /**
   * Wait for the public site to load completely
   */
  async waitForPublicSiteLoad(): Promise<void> {
    Log.info('Waiting for public site to load');

    // Wait for main content to be visible
    await this.pageContent.first().waitFor({ state: 'visible', timeout: 15000 });

    // Additional verification that site has loaded
    await this.page.waitForFunction(
      () => {
        return document.readyState === 'complete' && 
               document.body !== null &&
               document.body.textContent !== null &&
               document.body.textContent.length > 100; // Ensure content is loaded
      },
      { timeout: 10000 }
    );

    Log.info('Public site loaded successfully');
  }

  /**
   * Navigate to the Documentation section within the public site
   */
  async navigateToDocumentationSection(): Promise<void> {
    Log.info('Navigating to Documentation section');

    await this.waitForPublicSiteLoad();

    // Click the Documentation link
    await this.clickElement(this.documentationLink.first(), 'Documentation link');

    // Wait for documentation content to load
    await this.articlesSection.first().waitFor({ state: 'visible', timeout: 10000 });

    Log.info('Successfully navigated to Documentation section');
  }

  /**
   * Verify public site loads correctly
   */
  async verifyPublicSiteLoads(): Promise<void> {
    Log.info('Verifying public site loads correctly');

    // Verify site header is visible
    await expect(this.siteHeader.first()).toBeVisible({ timeout: 10000 });

    // Verify main content is present
    await expect(this.pageContent.first()).toBeVisible();

    // Verify the URL is correct
    const currentUrl = await this.getCurrentUrl();
    expect(currentUrl).toMatch(/document360\.io.*docs/);

    Log.info('Public site load verification completed successfully');
  }

  /**
   * Verify Documentation section functionality
   */
  async verifyDocumentationSectionFunctionality(): Promise<void> {
    Log.info('Verifying Documentation section functionality');

    // Verify Documentation link is available
    await expect(this.documentationLink.first()).toBeVisible({ timeout: 5000 });

    // Navigate to Documentation section
    await this.navigateToDocumentationSection();

    // Verify documentation content is loaded
    await expect(this.articlesSection.first()).toBeVisible();

    // Verify we can see article content or categories
    const hasArticleContent = await this.articleTitle.first().isVisible() ||
                              await this.categoryNavigation.first().isVisible();
    expect(hasArticleContent).toBe(true);

    Log.info('Documentation section functionality verification completed');
  }

  /**
   * Verify site navigation is working
   */
  async verifySiteNavigation(): Promise<void> {
    Log.info('Verifying site navigation functionality');

    // Verify main navigation is present
    await expect(this.mainNavigation.first()).toBeVisible({ timeout: 5000 });

    // Get current URL before navigation
    const initialUrl = await this.getCurrentUrl();

    // Try to navigate using the Documentation link if available
    const documentationLinkExists = await this.documentationLink.first().isVisible();
    if (documentationLinkExists) {
      await this.clickElement(this.documentationLink.first(), 'Documentation navigation link');
      
      // Wait for navigation to complete
      await this.page.waitForLoadState('networkidle');
      
      // Verify URL changed or content changed
      const newUrl = await this.getCurrentUrl();
      const urlChanged = newUrl !== initialUrl;
      const contentVisible = await this.articlesSection.first().isVisible();
      
      expect(urlChanged || contentVisible).toBe(true);
    }

    Log.info('Site navigation verification completed successfully');
  }

  /**
   * Get site title text
   */
  async getSiteTitle(): Promise<string> {
    Log.info('Getting site title');

    await this.waitForPublicSiteLoad();
    
    const titleElement = this.siteTitle.first();
    const titleText = await titleElement.isVisible() 
      ? await titleElement.textContent() || ''
      : await this.page.title();

    Log.info(`Site title retrieved: ${titleText}`);
    return titleText;
  }

  /**
   * Verify site content is accessible
   */
  async verifySiteContentAccessible(): Promise<void> {
    Log.info('Verifying site content is accessible');

    // Check that main content area has meaningful content
    await expect(this.pageContent.first()).toBeVisible();
    
    const contentText = await this.pageContent.first().textContent() || '';
    expect(contentText.length).toBeGreaterThan(50); // Ensure substantial content

    // Check for presence of navigation elements
    const hasNavigation = await this.mainNavigation.first().isVisible() ||
                         await this.categoryNavigation.first().isVisible();
    expect(hasNavigation).toBe(true);

    Log.info('Site content accessibility verification completed');
  }

  /**
   * Switch back to dashboard tab
   * Useful for returning to the original dashboard after public site testing
   */
  async switchBackToDashboard(): Promise<void> {
    Log.info('Switching back to dashboard tab');

    const pages = this.page.context().pages();
    
    // Find the dashboard tab
    let dashboardPage: Page | null = null;
    for (const page of pages) {
      const url = page.url();
      if (url.includes('portal.document360.io') && !url.includes('/docs')) {
        dashboardPage = page;
        break;
      }
    }

    if (dashboardPage) {
      await dashboardPage.bringToFront();
      Log.info(`Switched back to dashboard: ${dashboardPage.url()}`);
    } else {
      throw new Error('Dashboard page not found');
    }
  }
}
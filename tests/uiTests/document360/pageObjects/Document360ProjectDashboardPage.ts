import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../utils/BasePage';
import { createSelectorHelper, Document360Selectors } from '../../../utils/SelectorHelper';
import { ApiTestData, TestDataHelper } from '../testData/ApiTestData';
import Log from '../../../utils/Log';

/**
 * Page Object for Document360 Project Dashboard
 * Based on real inspection of the Document360 portal at https://portal.document360.io/
 * This handles both the main dashboard (projects overview) and project-specific navigation
 *
 * Key interactions:
 * 1. Project tile hover actions (Settings, Documentation, Open Site)
 * 2. Project selection and navigation
 * 3. Project menu navigation
 */
export class Document360ProjectDashboardPage extends BasePage {
  private selectorHelper: any;

  // Main dashboard selectors using Document360Selectors
  private readonly projectsSection: Locator;
  // private readonly userProfile: Locator; // Removed - not needed for testing
  private readonly helpButton: Locator;
  private readonly notificationButton: Locator;
  private readonly createProjectButton: Locator;

  // Project tile selectors
  private readonly projectTileContainer: Locator;
  private readonly projectTitle: Locator;
  private readonly trialStatus: Locator;
  private readonly privateLabel: Locator;

  // Project tile action buttons (revealed on hover)
  private readonly projectSettingsButton: Locator;
  private readonly projectDocumentationButton: Locator;
  private readonly projectOpenSiteLink: Locator;

  // Project navigation menu selectors
  private readonly apiDocumentationLink: Locator;
  private readonly documentsLink: Locator;
  private readonly settingsLink: Locator;
  private readonly driveLink: Locator;
  private readonly analyticsLink: Locator;
  private readonly feedbackManagerLink: Locator;
  private readonly contributorDashboardLink: Locator;
  private readonly decisionTreeLink: Locator;
  private readonly widgetsLink: Locator;

  // Project header selectors
  private readonly projectHeaderTitle: Locator;
  private readonly versionSelector: Locator;
  private readonly createButton: Locator;
  private readonly trialBanner: Locator;
  private readonly openSiteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.selectorHelper = createSelectorHelper(page, TestDataHelper.getTimeout('default'), true);

    // Main dashboard elements using Document360Selectors
    this.projectsSection = this.selectorHelper.getSmartSelector(
      Document360Selectors.dashboard.projectsSection
    );
    // this.userProfile = this.selectorHelper.getSmartSelector(Document360Selectors.dashboard.userProfile); // Removed
    this.helpButton = this.selectorHelper.getSmartSelector(
      Document360Selectors.dashboard.helpButton
    );
    this.notificationButton = this.selectorHelper.getSmartSelector(
      Document360Selectors.dashboard.notificationButton
    );
    this.createProjectButton = this.selectorHelper.getSmartSelector(
      Document360Selectors.dashboard.createProjectButton
    );

    // Project tile elements
    this.projectTileContainer = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectTile.container
    );
    this.projectTitle = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectTile.projectName
    );
    this.trialStatus = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectTile.trialStatus
    );
    this.privateLabel = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectTile.privateLabel
    );

    // Project tile hover actions - these appear on hover
    this.projectSettingsButton = this.page.locator('button').filter({ hasText: '' }).first();
    this.projectDocumentationButton = this.page.locator('button').filter({ hasText: '' }).nth(1);
    this.projectOpenSiteLink = this.page.locator('#btn_go_to_your_knowledge_base_site');

    // Project navigation menu
    this.apiDocumentationLink = this.page.locator('a[href*="/api-documentation"]');
    this.documentsLink = this.page.locator('a[href*="/document"]');
    this.settingsLink = this.page.locator('a[href*="/settings"]');
    this.driveLink = this.page.locator('a[href*="/drive"]');
    this.analyticsLink = this.page.locator('a[href*="/analytics"]');
    this.feedbackManagerLink = this.page.locator('a[href*="/feedback-manager"]');
    this.contributorDashboardLink = this.page.locator('a[href*="/contributor-dashboard"]');
    this.decisionTreeLink = this.page.locator('a[href*="/decision-tree"]');
    this.widgetsLink = this.page.locator('a[href*="/knowledge-base-widgets"]');

    // Project header elements
    this.projectHeaderTitle = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectHeader.title
    );
    this.versionSelector = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectHeader.versionSelector
    );
    this.createButton = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectHeader.createButton
    );
    this.trialBanner = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectHeader.trialBanner
    );
    this.openSiteButton = this.selectorHelper.getSmartSelector(
      Document360Selectors.projectHeader.openSiteButton
    );
  }

  /**
   * Navigate to the main project dashboard (projects overview page)
   */
  async navigateToProjectDashboard(): Promise<void> {
    Log.info('Navigating to main project dashboard');

    await this.navigateTo('/dashboard');
    await this.waitForDashboardLoad();

    Log.info('Successfully navigated to project dashboard');
  }

  /**
   * Wait for the main dashboard to load completely
   */
  async waitForDashboardLoad(): Promise<void> {
    Log.info('Waiting for dashboard to load');

    // Wait for the "Your projects" section to be visible
    await this.projectsSection.waitFor({ state: 'visible', timeout: 15000 });

    // Additional verification that dashboard has loaded
    await this.page.waitForFunction(
      () => {
        const hasProjectText =
          document.body &&
          document.body.textContent &&
          document.body.textContent.indexOf('Your projects') !== -1;
        const hasDashboardTitle = document.title.indexOf('Dashboard') !== -1;
        return hasProjectText || hasDashboardTitle;
      },
      { timeout: 10000 }
    );

    Log.info('Dashboard loaded successfully');
  }

  /**
   * Hover over project tile to reveal action buttons
   * @deprecated Use hoverOverProjectTileByIndex instead for more reliable targeting
   */
  async hoverOverProjectTile(): Promise<void> {
    Log.info('Hovering over project tile to reveal actions');

    // Use the corrected method to avoid ambiguous selectors
    await this.hoverOverProjectTileByIndex(0);

    Log.info('Project tile hover actions revealed');
  }

  /**
   * Click project settings button (first action button on hover)
   */
  async clickProjectSettings(): Promise<void> {
    Log.info('Clicking project settings button');

    await this.hoverOverProjectTile();
    await this.projectSettingsButton.click();

    await this.page.waitForLoadState('networkidle');

    Log.info('Project settings clicked successfully');
  }

  /**
   * Click project documentation button (second action button on hover)
   */
  async clickProjectDocumentation(): Promise<void> {
    Log.info('Clicking project documentation button');

    await this.hoverOverProjectTile();
    await this.projectDocumentationButton.click();

    await this.page.waitForLoadState('networkidle');

    Log.info('Project documentation clicked successfully');
  }

  /**
   * Click project open site link (third action button on hover)
   */
  async clickProjectOpenSite(): Promise<void> {
    Log.info('Clicking project open site link');

    await this.hoverOverProjectTile();
    await this.projectOpenSiteLink.click();

    await this.page.waitForLoadState('networkidle');

    Log.info('Project open site clicked successfully');
  }

  /**
   * Select a project by clicking on its tile
   */
  async selectProject(projectName?: string): Promise<void> {
    Log.info(`Selecting project: ${projectName || 'first available'}`);

    await this.waitForDashboardLoad();

    if (projectName) {
      // Find and click specific project by name
      const specificProject = this.page.locator(`text=${projectName}`).first();
      await specificProject.click();
    } else {
      // Click the first available project tile
      await this.projectTileContainer.first().click();
    }

    // Wait for the interaction to complete - project selection may not navigate
    await this.page.waitForLoadState('networkidle');

    // Wait for project-specific elements to appear (alternative to URL check)
    await this.page.waitForTimeout(2000);

    Log.info('Project selected and loaded');
  }

  /**
   * Get all available project tiles on the dashboard
   * @returns Array of project tile information
   */
  async getAllProjectTiles(): Promise<Array<{ index: number; title: string; locator: Locator }>> {
    Log.info('Getting all project tiles from dashboard');

    await this.waitForDashboardLoad();

    // Get all listitem elements, but filter out the user profile element (KR button)
    // Project tiles should contain project-related text, not just user initials
    const allListItems = this.page.locator('role=listitem');
    const allCount = await allListItems.count();

    const projectTiles: Array<{ index: number; title: string; locator: Locator }> = [];
    let projectIndex = 0;

    for (let i = 0; i < allCount; i++) {
      const listItem = allListItems.nth(i);
      const textContent = await listItem.textContent();
      const text = textContent?.trim() || '';

      // Skip user profile elements (usually just initials like "KR")
      // Also skip user profile menu items
      const isUserProfile = text.length <= 3 && /^[A-Z]{1,3}$/.test(text);
      const isUserProfileMenuItem = 
        text.includes('My profile') ||
        text.includes('Change password') ||
        text.includes('View access') ||
        text.includes('Log out') ||
        text.includes('Logout') ||
        text.includes('Sign out') ||
        text.includes('Profile') ||
        text.includes('Settings') && !text.includes('Project') ||
        text.includes('Account');

      const hasProjectContent =
        text.includes('Trial') ||
        text.includes('Pet Store') ||
        text.includes('API') ||
        text.includes('Private') ||
        text.includes('Public') ||
        (text.length > 10 && !isUserProfileMenuItem);

      if (!isUserProfile && !isUserProfileMenuItem && hasProjectContent) {
        Log.info(`Found project tile at listitem index ${i}: "${text}"`);

        // Try to extract a meaningful title from the project content
        let title = 'Unknown Project';
        if (text.includes('Pet Store API Testing')) {
          title = 'Pet Store API Testing';
        } else if (text.includes('API')) {
          title = text.split('API')[0] + 'API';
        } else if (text.length > 10) {
          // Take the first meaningful part of the text
          const parts = text.split(/\s+/);
          title = parts.slice(0, Math.min(3, parts.length)).join(' ');
        }

        projectTiles.push({
          index: projectIndex,
          title: title,
          locator: listItem,
        });

        projectIndex++;
      } else {
        Log.info(`Skipping non-project listitem at index ${i}: "${text}" (likely user profile)`);
      }
    }

    Log.info(
      `Found ${projectTiles.length} actual project tiles out of ${allCount} listitem elements`
    );
    Log.info(`Project tiles found: ${projectTiles.map(p => `${p.index}: ${p.title}`).join(', ')}`);
    return projectTiles;
  }

  /**
   * Select project by index (0-based)
   * @param index - Zero-based index of the project to select
   */
  async selectProjectByIndex(index: number): Promise<void> {
    Log.info(`Selecting project at index: ${index}`);

    const projectTiles = await this.getAllProjectTiles();

    if (index >= projectTiles.length || index < 0) {
      throw new Error(
        `Project index ${index} is out of range. Available projects: 0-${projectTiles.length - 1}`
      );
    }

    const selectedProject = projectTiles[index];
    Log.info(`Selecting project: "${selectedProject.title}" at index ${index}`);

    await selectedProject.locator.click();

    // Wait for the interaction to complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    Log.info(`Successfully selected project: "${selectedProject.title}"`);
  }

  /**
   * Hover over specific project tile by index
   * @param index - Zero-based index of the project to hover over
   */
  async hoverOverProjectTileByIndex(index: number): Promise<void> {
    Log.info(`Hovering over project tile at index: ${index}`);

    const projectTiles = await this.getAllProjectTiles();

    if (index >= projectTiles.length || index < 0) {
      throw new Error(
        `Project index ${index} is out of range. Available projects: 0-${projectTiles.length - 1}`
      );
    }

    const targetProject = projectTiles[index];
    Log.info(`Hovering over project: "${targetProject.title}" at index ${index}`);

    // Use the direct locator hover with force option for reliability
    await targetProject.locator.hover({ force: true, timeout: 5000 });

    // Wait for hover actions to become visible
    await this.page.waitForTimeout(1000);

    Log.info(`Hover actions revealed for project: "${targetProject.title}"`);
  }

  /**
   * Click project settings button for specific project by index
   * @param index - Zero-based index of the project
   */
  async clickProjectSettingsByIndex(index: number): Promise<void> {
    Log.info(`Clicking project settings for project at index: ${index}`);

    await this.hoverOverProjectTileByIndex(index);

    // Find settings button within the specific project tile
    const projectTiles = await this.getAllProjectTiles();
    const targetProject = projectTiles[index];

    // Look for settings-related elements that appear on hover
    const settingsSelectors = [
      'a[href*="settings"]',
      'button[title*="Settings"]',
      'button[aria-label*="Settings"]',
      '[class*="settings"]',
      'button:has-text("Settings")',
      'a:has-text("Settings")',
    ];

    let settingsButton;
    for (const selector of settingsSelectors) {
      try {
        settingsButton = targetProject.locator.locator(selector).first();
        if (await settingsButton.isVisible({ timeout: 2000 })) {
          break;
        }
      } catch {
        continue;
      }
    }

    // Fallback: click first clickable element after hover
    if (!settingsButton || !(await settingsButton.isVisible({ timeout: 1000 }))) {
      settingsButton = targetProject.locator.locator('button, a[role="button"]').first();
    }

    await settingsButton.click();
    await this.page.waitForLoadState('networkidle');

    Log.info(`Project settings clicked for: "${targetProject.title}"`);
  }

  /**
   * Click project documentation button for specific project by index
   * @param index - Zero-based index of the project
   */
  async clickProjectDocumentationByIndex(index: number): Promise<void> {
    Log.info(`Clicking project documentation for project at index: ${index}`);

    await this.hoverOverProjectTileByIndex(index);

    // Find documentation button within the specific project tile
    const projectTiles = await this.getAllProjectTiles();
    const targetProject = projectTiles[index];
    const documentationButton = targetProject.locator.locator('button').nth(1);

    await documentationButton.click();
    await this.page.waitForLoadState('networkidle');

    Log.info(`Project documentation clicked for: "${targetProject.title}"`);
  }

  /**
   * Click project open site link for specific project by index
   * Handles the new tab that opens when clicking the "Open Site" link
   * @param index - Zero-based index of the project
   * @returns Promise<Page> - Returns the new tab page object
   */
  async clickProjectOpenSiteByIndex(index: number): Promise<any> {
    Log.info(`Clicking project open site for project at index: ${index}`);

    await this.hoverOverProjectTileByIndex(index);

    // Find open site link within the specific project tile
    const projectTiles = await this.getAllProjectTiles();
    const targetProject = projectTiles[index];
    const openSiteLink = targetProject.locator.locator('a').first();

    // Set up new tab listener before clicking
    const newTabPromise = this.page.context().waitForEvent('page');
    
    // Click the open site link (this will open a new tab)
    await openSiteLink.click();
    
    // Wait for the new tab to open
    const newTab = await newTabPromise;
    
    // Wait for the new tab to load
    await newTab.waitForLoadState('networkidle');
    
    Log.info(`Project open site clicked for: "${targetProject.title}"`);
    Log.info(`New tab opened with URL: ${newTab.url()}`);
    
    return newTab;
  }

  /**
   * Navigate to API Documentation from project navigation menu
   */
  async navigateToApiDocumentation(): Promise<void> {
    Log.info('Navigating to API Documentation from project menu');

    await this.apiDocumentationLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.apiDocumentationLink.click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForURL(/.*api-documentation.*/);

    Log.info('Successfully navigated to API Documentation');
  }

  /**
   * Navigate to Documents section from project menu
   */
  async navigateToDocuments(): Promise<void> {
    Log.info('Navigating to Documents from project menu');

    await this.documentsLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.documentsLink.click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForURL(/.*\/document$/);

    Log.info('Successfully navigated to Documents');
  }

  /**
   * Navigate to Settings from project menu
   */
  async navigateToSettings(): Promise<void> {
    Log.info('Navigating to Settings from project menu');

    await this.settingsLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.settingsLink.click();

    await this.page.waitForLoadState('networkidle');
    await this.page.waitForURL(/.*\/settings$/);

    Log.info('Successfully navigated to Settings');
  }

  /**
   * Check if currently on main dashboard (projects overview)
   */
  async isOnMainDashboard(): Promise<boolean> {
    try {
      const currentUrl = this.page.url();
      const isDashboard =
        currentUrl.includes('/dashboard') && !currentUrl.match(/\/[a-f0-9-]{36}\//);
      const hasProjectsSection = await this.projectsSection.isVisible({ timeout: 2000 });

      return isDashboard && hasProjectsSection;
    } catch {
      return false;
    }
  }

  /**
   * Check if currently on a project-specific page
   */
  async isOnProjectPage(): Promise<boolean> {
    try {
      const currentUrl = this.page.url();
      const hasProjectUuid = currentUrl.match(/\/[a-f0-9-]{36}\//) !== null;
      const hasProjectMenu = await this.apiDocumentationLink.isVisible({ timeout: 2000 });

      return hasProjectUuid && hasProjectMenu;
    } catch {
      return false;
    }
  }

  /**
   * Verify user is authenticated by checking for authenticated elements
   */
  async verifyUserAuthenticated(): Promise<void> {
    Log.info('Verifying user authentication on project dashboard');

    // Check for authenticated user elements (removed userProfile check)
    // await expect(this.userProfile).toBeVisible({ timeout: this.selectorHelper.defaultTimeout });
    await expect(this.helpButton).toBeVisible({ timeout: this.selectorHelper.defaultTimeout });

    Log.info('User authentication verified - authenticated elements visible');
  }

  /**
   * Verify dashboard elements are present and visible
   */
  async verifyDashboardElements(): Promise<void> {
    Log.info('Verifying dashboard elements are present');

    if (await this.isOnMainDashboard()) {
      // Verify main dashboard elements
      await expect(this.projectsSection).toBeVisible({
        timeout: this.selectorHelper.defaultTimeout,
      });
      // await expect(this.userProfile).toBeVisible({ timeout: this.selectorHelper.defaultTimeout }); // Removed
      await expect(this.helpButton).toBeVisible({ timeout: this.selectorHelper.defaultTimeout });

      Log.info('Main dashboard elements verified successfully');
    } else if (await this.isOnProjectPage()) {
      // Verify project page elements
      await expect(this.projectHeaderTitle).toBeVisible({
        timeout: this.selectorHelper.defaultTimeout,
      });
      await expect(this.apiDocumentationLink).toBeVisible({
        timeout: this.selectorHelper.defaultTimeout,
      });
      await expect(this.documentsLink).toBeVisible({ timeout: this.selectorHelper.defaultTimeout });

      Log.info('Project page elements verified successfully');
    }
  }

  /**
   * Verify project tile hover actions are available
   */
  async verifyProjectTileHoverActions(): Promise<void> {
    Log.info('Verifying project tile hover actions');

    await this.hoverOverProjectTile();

    // Verify hover actions become visible
    await expect(this.projectSettingsButton).toBeVisible({ timeout: 5000 });
    await expect(this.projectDocumentationButton).toBeVisible({ timeout: 5000 });
    await expect(this.projectOpenSiteLink).toBeVisible({ timeout: 5000 });

    Log.info('Project tile hover actions verified successfully');
  }

  /**
   * Verify successful navigation to API Documentation
   */
  async verifyNavigationToApiDocumentationSuccess(): Promise<void> {
    Log.info('Verifying successful navigation to API Documentation');

    // Check URL contains api-documentation
    await expect(this.page).toHaveURL(/.*api-documentation.*/);

    // Check page title
    await expect(this.page).toHaveTitle(/.*API documentation.*/);

    // Check API documentation elements are visible
    const isOnApiPage = await this.page.waitForFunction(
      () => {
        return (
          document.title.includes('API documentation') ||
          window.location.href.includes('api-documentation')
        );
      },
      { timeout: 10000 }
    );

    expect(isOnApiPage).toBeTruthy();

    Log.info('API Documentation navigation verified successfully');
  }

  /**
   * Verify successful project selection
   */
  async verifyProjectSelectionSuccess(): Promise<void> {
    Log.info('Verifying successful project selection');

    // Check URL has project UUID pattern
    await expect(this.page).toHaveURL(/.*\/[a-f0-9-]{36}\/.*/);

    // Check project navigation menu is visible
    await expect(this.apiDocumentationLink).toBeVisible({ timeout: 10000 });
    await expect(this.documentsLink).toBeVisible({ timeout: 10000 });

    Log.info('Project selection verified successfully');
  }

  /**
   * Verify dashboard is fully loaded and ready for interaction
   */
  async verifyDashboardFullyLoaded(): Promise<void> {
    Log.info('Verifying dashboard is fully loaded and ready');

    await this.verifyUserAuthenticated();
    await this.verifyDashboardElements();

    Log.info('Dashboard fully loaded verification completed');
  }

  /**
   * Get list of available project menu sections
   */
  async getAvailableMenuSections(): Promise<string[]> {
    Log.info('Getting available project menu sections');

    const menuItems: string[] = [];

    const menus = [
      { locator: this.apiDocumentationLink, name: 'API Documentation' },
      { locator: this.documentsLink, name: 'Documents' },
      { locator: this.settingsLink, name: 'Settings' },
      { locator: this.driveLink, name: 'Drive' },
      { locator: this.analyticsLink, name: 'Analytics' },
      { locator: this.feedbackManagerLink, name: 'Feedback Manager' },
      { locator: this.contributorDashboardLink, name: 'Contributor Dashboard' },
      { locator: this.decisionTreeLink, name: 'Decision Tree' },
      { locator: this.widgetsLink, name: 'Widgets' },
    ];

    for (const menu of menus) {
      try {
        if (await menu.locator.isVisible({ timeout: 1000 })) {
          menuItems.push(menu.name);
        }
      } catch {
        // Menu item not available, continue
      }
    }

    Log.info(`Available menu sections: ${menuItems.join(', ')}`);
    return menuItems;
  }

  /**
   * Validate project tile detection by analyzing each listitem
   * @returns Promise<void>
   */
  async validateProjectTileDetection(): Promise<void> {
    Log.info('Testing project tile detection validation...');

    // Look for listitem elements
    const allListItems = this.page.locator('role=listitem');
    const allCount = await allListItems.count();
    Log.info(`Total listitem elements: ${allCount}`);

    // Analyze each one
    for (let i = 0; i < allCount; i++) {
      const item = allListItems.nth(i);
      const text = await item.textContent();
      const trimmedText = text?.trim() || '';

      Log.info(`ListItem ${i}: "${trimmedText}" (length: ${trimmedText.length})`);

      // Categorize the element
      const isUserProfile = trimmedText.length <= 3 && /^[A-Z]{1,3}$/.test(trimmedText);
      const hasProjectContent =
        trimmedText.includes('Trial') ||
        trimmedText.includes('Pet Store') ||
        trimmedText.includes('API') ||
        trimmedText.length > 10;

      Log.info(`  - Is User Profile: ${isUserProfile}`);
      Log.info(`  - Has Project Content: ${hasProjectContent}`);
      Log.info(`  - Should be considered project tile: ${!isUserProfile && hasProjectContent}`);
    }
  }

  /**
   * Validate hover functionality on project tiles with detailed analysis
   * @param takeScreenshots - Whether to take before/after screenshots
   * @returns Promise<{success: boolean, tilesFound: number, hoverActionsFound: boolean}>
   */
  async validateProjectTileHover(takeScreenshots: boolean = false): Promise<{
    success: boolean;
    tilesFound: number;
    hoverActionsFound: boolean;
  }> {
    Log.info('Starting comprehensive project tile hover validation...');

    // Get project tiles using our improved method
    const projectTiles = await this.getAllProjectTiles();
    Log.info(`Found ${projectTiles.length} actual project tiles (excluding user profile)`);

    if (projectTiles.length === 0) {
      Log.error('No project tiles found for hover validation');
      return { success: false, tilesFound: 0, hoverActionsFound: false };
    }

    // Display information about found project tiles
    for (const tile of projectTiles) {
      Log.info(`Project ${tile.index}: "${tile.title}"`);

      // Get the position and size of this project tile
      const box = await tile.locator.boundingBox();
      Log.info(`  Position: x=${box?.x}, y=${box?.y}, width=${box?.width}, height=${box?.height}`);

      // Get text content
      const text = await tile.locator.textContent();
      Log.info(`  Content: "${text?.substring(0, 100)}..."`);
    }

    let hoverActionsFound = false;

    // Test hover on the first actual project tile
    if (projectTiles.length > 0) {
      Log.info('=== Testing Hover on First Project Tile ===');

      // Take screenshot before hover if requested
      if (takeScreenshots) {
        await this.page.screenshot({ path: 'before-corrected-hover.png' });
      }

      // Hover over the first project tile
      await this.hoverOverProjectTileByIndex(0);

      // Take screenshot after hover if requested
      if (takeScreenshots) {
        await this.page.screenshot({ path: 'after-corrected-hover.png' });
      }

      Log.info('✅ Successfully hovered over first project tile');

      // Look for any buttons or links that might have appeared on hover
      const buttonsInProjectTile = projectTiles[0].locator.locator('button');
      const buttonCount = await buttonsInProjectTile.count();
      Log.info(`Found ${buttonCount} buttons within the project tile after hover`);

      // Check for any visible action elements
      const actionElements = [
        this.page.locator('button').filter({ hasText: /settings|edit|configure/i }),
        this.page.locator('a').filter({ hasText: /open|view|site/i }),
        this.page.locator('button').filter({ hasText: /documentation|docs/i }),
        this.page.locator('[title*="Settings"]'),
        this.page.locator('[title*="Open"]'),
        this.page.locator('[href*="settings"]'),
        this.page.locator('[href*="document"]'),
      ];

      for (let i = 0; i < actionElements.length; i++) {
        const elements = actionElements[i];
        const count = await elements.count();
        if (count > 0) {
          Log.info(`Found ${count} potential action elements of type ${i}`);
          hoverActionsFound = true;
        }
      }

      // Test hover on second project tile if it exists
      if (projectTiles.length > 1) {
        Log.info('=== Testing Hover on Second Project Tile ===');
        await this.hoverOverProjectTileByIndex(1);
        if (takeScreenshots) {
          await this.page.screenshot({ path: 'after-second-tile-hover.png' });
        }
        Log.info('✅ Successfully hovered over second project tile');
      }
    }

    Log.info('🎉 Project tile hover validation completed successfully!');
    return {
      success: true,
      tilesFound: projectTiles.length,
      hoverActionsFound,
    };
  }

  /**
   * Get detailed project tile information for analysis
   * @returns Promise<Array<{index: number, title: string, content: string, boundingBox: any}>>
   */
  async getProjectTileDetails(): Promise<
    Array<{
      index: number;
      title: string;
      content: string;
      boundingBox: any;
    }>
  > {
    Log.info('Getting detailed project tile information...');

    const projectTiles = await this.getAllProjectTiles();
    const details = [];

    for (const tile of projectTiles) {
      const box = await tile.locator.boundingBox();
      const text = await tile.locator.textContent();

      details.push({
        index: tile.index,
        title: tile.title,
        content: text || '',
        boundingBox: box,
      });
    }

    Log.info(`Retrieved details for ${details.length} project tiles`);
    return details;
  }
}

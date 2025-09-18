import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';

export class Document360DashboardPage extends BasePage {
  // Header elements
  private helpButton: Locator;
  private userProfileButton: Locator;
  private notificationButton: Locator;

  // Project section elements
  private projectsSection: Locator;
  private projectsTitle: Locator;
  private createProjectButton: Locator;
  private noProjectsMessage: Locator;
  private noProjectsDescription: Locator;

  // Project listing elements
  private projectsList: Locator;
  private projectItems: Locator;

  // Trial elements
  private trialBadge: Locator;

  constructor(page: Page) {
    super(page);
    
    // Header locators - more robust selectors
    this.helpButton = page.getByRole('button').filter({ hasText: /HELP/i });
    this.userProfileButton = page.getByRole('button').filter({ hasText: /^[A-Z]{1,2}$/ }); // Profile initials like "KR"
    this.notificationButton = page.getByRole('button').filter({ hasText: /^\d+$/ }); // Notification count like "3"

    // Project section locators - using more specific selectors
    this.projectsSection = page.locator('.projects-section, [data-testid="projects-section"]').or(
      page.locator('*').filter({ hasText: /your projects/i }).first()
    );
    this.projectsTitle = page.locator('.dashboard-title').filter({ hasText: /your projects/i }).or(
      page.getByText('Your projects').first()
    );
    this.createProjectButton = page.getByRole('button', { name: /\+\s*Project/i });
    this.noProjectsMessage = page.getByText(/no projects yet/i).or(page.locator('*').filter({ hasText: /no projects/i }));
    this.noProjectsDescription = page.getByText(/create a new project to get started/i);

    // Project listing locators - improved to handle actual DOM structure
    this.projectsList = page.getByRole('list').first();
    this.projectItems = page.getByRole('listitem').filter({ 
      has: page.locator('*').filter({ hasText: /trial/i })
    });

    // Trial elements
    this.trialBadge = page.locator('*').filter({ hasText: /trial/i });
  }

  /**
   * Navigate to Document360 dashboard
   */
  async navigateToDashboard(): Promise<void> {
    Log.info('Navigating to Document360 dashboard');
    await this.page.goto('/dashboard');
    await this.waitForPageLoad();
    await this.verifyDashboardLoaded();
    Log.info('Successfully navigated to Document360 dashboard');
  }

  /**
   * Verify dashboard page has loaded correctly
   */
  async verifyDashboardLoaded(): Promise<void> {
    Log.info('Verifying dashboard page loaded');
    await expect(this.page).toHaveURL(/.*dashboard$/);
    await expect(this.page).toHaveTitle(/dashboard/i);
    await expect(this.projectsTitle).toBeVisible();
    await expect(this.createProjectButton).toBeVisible();
    Log.info('Dashboard page verification completed');
  }

  /**
   * Check if any projects exist on the dashboard
   */
  async hasExistingProjects(): Promise<boolean> {
    Log.info('Checking for existing projects');
    try {
      // Wait for the dashboard content to load
      await this.page.waitForTimeout(3000);
      
      // Primary check: count project items
      const projectCount = await this.projectItems.count();
      Log.info(`Project items count: ${projectCount}`);
      
      if (projectCount > 0) {
        Log.info('Projects found via project items count');
        return true;
      }

      // Secondary check: create button disabled state (strong indicator of existing projects in trial)
      const isCreateButtonDisabled = await this.createProjectButton.isDisabled().catch(() => false);
      Log.info(`Create project button disabled: ${isCreateButtonDisabled}`);
      
      if (isCreateButtonDisabled) {
        Log.info('Create button is disabled - indicating trial limit reached (existing project)');
        return true;
      }

      // Tertiary check: look for "No projects yet" message
      const noProjectsVisible = await this.noProjectsMessage.isVisible().catch(() => false);
      Log.info(`No projects message visible: ${noProjectsVisible}`);
      
      if (noProjectsVisible) {
        Log.info('No projects message is visible - confirming no existing projects');
        return false;
      }

      // Final check: look for any element containing project name/trial info
      const hasTrialElements = await this.page.locator('*').filter({ hasText: /trial.*days|API.*Documentation/i }).count() > 0;
      Log.info(`Trial elements found: ${hasTrialElements}`);
      
      return hasTrialElements;
      
    } catch (error) {
      Log.error(`Error checking for existing projects: ${error}`);
      // Ultimate fallback: assume projects exist if create button is disabled
      const isCreateButtonDisabled = await this.createProjectButton.isDisabled().catch(() => false);
      Log.info(`Fallback - Create button disabled: ${isCreateButtonDisabled}`);
      return isCreateButtonDisabled;
    }
  }

  /**
   * Get the count of existing projects
   */
  async getProjectCount(): Promise<number> {
    Log.info('Getting project count');
    
    const hasProjects = await this.hasExistingProjects();
    if (!hasProjects) {
      Log.info('No projects found - count: 0');
      return 0;
    }

    const projectCount = await this.projectItems.count();
    Log.info(`Project count: ${projectCount}`);
    return projectCount;
  }

  /**
   * Verify trial version limitations
   */
  async verifyTrialLimitations(): Promise<void> {
    Log.info('Verifying trial version limitations');
    
    const hasProjects = await this.hasExistingProjects();
    
    if (hasProjects) {
      // Should have trial badge and disabled create button
      await expect(this.trialBadge).toBeVisible();
      await expect(this.createProjectButton).toBeDisabled();
      Log.info('Trial limitations verified - existing project found, create button disabled');
    } else {
      // No projects, create button should be enabled
      await expect(this.createProjectButton).toBeEnabled();
      Log.info('Trial limitations verified - no projects, create button enabled');
    }
  }

  /**
   * Get project names from the dashboard
   */
  async getProjectNames(): Promise<string[]> {
    Log.info('Getting project names from dashboard');
    
    const hasProjects = await this.hasExistingProjects();
    if (!hasProjects) {
      Log.info('No projects found');
      return [];
    }

    const projectNames: string[] = [];
    
    try {
      // Method 1: Look for project names in img alt attributes
      const projectImages = await this.page.locator('img[alt*="Documentation"], img[alt*="Test"], img[alt*="API"]').all();
      for (const img of projectImages) {
        const altText = await img.getAttribute('alt');
        if (altText && altText.trim() && !altText.includes('Logo')) {
          projectNames.push(altText.trim());
        }
      }
      
      if (projectNames.length > 0) {
        Log.info(`Found project names via img alt: ${projectNames.join(', ')}`);
        return projectNames;
      }

      // Method 2: Look for project names in text content
      const projectTexts = await this.page.locator('*').filter({ 
        hasText: /API.*Documentation|.*Test.*Documentation/i 
      }).and(this.page.locator('*').filter({ 
        hasNotText: /trial|private|days|help|watch|open|site/i 
      })).all();
      
      for (const element of projectTexts) {
        const textContent = await element.textContent();
        if (textContent && textContent.trim().length > 3 && textContent.trim().length < 50) {
          const cleanText = textContent.trim();
          if (!projectNames.includes(cleanText) && 
              !cleanText.match(/^[0-9]+$/) && 
              !cleanText.includes('Trial') &&
              !cleanText.includes('Private')) {
            projectNames.push(cleanText);
          }
        }
      }

      // Method 3: Use project items if available
      if (projectNames.length === 0) {
        const count = await this.projectItems.count();
        for (let i = 0; i < count; i++) {
          const projectItem = this.projectItems.nth(i);
          
          // Try to find project name in various ways
          const imgAlt = await projectItem.locator('img').first().getAttribute('alt').catch(() => null);
          if (imgAlt && !imgAlt.includes('Logo')) {
            projectNames.push(imgAlt);
            continue;
          }
          
          // Look for text elements that might contain project name
          const textElements = await projectItem.locator('*').filter({ 
            hasText: /[A-Za-z]{3,}.*[A-Za-z]{3,}/ 
          }).and(projectItem.locator('*').filter({ 
            hasNotText: /trial|private|days|\d+|help/i 
          })).all();
          
          for (const textEl of textElements) {
            const text = await textEl.textContent();
            if (text && text.trim().length > 3 && text.trim().length < 50) {
              const cleanText = text.trim();
              if (!projectNames.includes(cleanText)) {
                projectNames.push(cleanText);
                break;
              }
            }
          }
        }
      }
      
    } catch (error) {
      Log.error(`Error getting project names: ${error}`);
      // Fallback: return a generic name if we know projects exist
      if (await this.hasExistingProjects()) {
        projectNames.push('Project'); // Generic fallback
      }
    }
    
    Log.info(`Found project names: ${projectNames.join(', ')}`);
    return [...new Set(projectNames)]; // Remove duplicates
  }

  /**
   * Click on create project button
   */
  async clickCreateProject(): Promise<void> {
    Log.info('Clicking create project button');
    await expect(this.createProjectButton).toBeEnabled();
    await this.createProjectButton.click();
    Log.info('Create project button clicked');
  }

  /**
   * Hover over a project tile to reveal action buttons
   */
  async hoverOverProject(projectName?: string): Promise<Locator> {
    Log.info(`Hovering over project${projectName ? `: ${projectName}` : ''}`);
    
    const hasProjects = await this.hasExistingProjects();
    if (!hasProjects) {
      throw new Error('No projects found to hover over');
    }

    let projectItem: Locator;
    
    if (projectName) {
      projectItem = this.projectItems.filter({ hasText: projectName }).first();
      await expect(projectItem).toBeVisible();
    } else {
      projectItem = this.projectItems.first();
      await expect(projectItem).toBeVisible();
    }

    await projectItem.hover();
    await this.page.waitForTimeout(500); // Wait for hover effects
    
    Log.info('Project tile hovered, action buttons should be visible');
    return projectItem;
  }

  /**
   * Click on project tile to enter the project
   */
  async clickOnProject(projectName?: string): Promise<void> {
    Log.info(`Clicking on project${projectName ? `: ${projectName}` : ''}`);
    
    let projectItem: Locator;
    
    if (projectName) {
      projectItem = this.projectItems.filter({ hasText: projectName }).first();
      await expect(projectItem).toBeVisible();
    } else {
      projectItem = this.projectItems.first();
      await expect(projectItem).toBeVisible();
    }

    // Click on the main project area (not action buttons)
    const projectNameElement = projectItem.locator('generic').filter({ 
      hasText: /[A-Za-z0-9\s\-_]+ Documentation|[A-Za-z0-9\s\-_]+/
    }).first();
    
    await projectNameElement.click();
    await this.page.waitForLoadState('networkidle');
    
    Log.info('Successfully clicked on project');
  }

  /**
   * Get available action buttons for a project after hovering
   */
  async getProjectActionButtons(projectTile: Locator): Promise<string[]> {
    Log.info('Getting available action buttons from project tile');
    
    const actionButtons = projectTile.getByRole('button');
    const buttonCount = await actionButtons.count();
    const buttonLabels: string[] = [];
    
    for (let i = 0; i < buttonCount; i++) {
      const button = actionButtons.nth(i);
      const isVisible = await button.isVisible();
      
      if (isVisible) {
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');
        const textContent = await button.textContent();
        
        // Determine button purpose based on available attributes
        let buttonLabel = ariaLabel || title || textContent?.trim() || `Button ${i + 1}`;
        
        // Special handling for common action buttons
        if (i === buttonCount - 1) {
          buttonLabel = 'Settings'; // Last button is typically settings
        } else if (i === buttonCount - 2) {
          buttonLabel = 'More Actions'; // Second to last is typically more actions
        }
        
        buttonLabels.push(buttonLabel);
      }
    }
    
    Log.info(`Found action buttons: ${buttonLabels.join(', ')}`);
    return buttonLabels;
  }

  /**
   * Navigate to project settings by hovering and clicking settings from context menu
   */
  async navigateToProjectSettings(projectName?: string): Promise<void> {
    Log.info(`Navigating to project settings${projectName ? ` for project: ${projectName}` : ''}`);
    
    const hasProjects = await this.hasExistingProjects();
    if (!hasProjects) {
      throw new Error('No projects found to navigate to settings');
    }

    // Get the project item to hover over
    const projectItem = projectName 
      ? this.projectItems.filter({ hasText: projectName }).first()
      : this.projectItems.first();
      
    await expect(projectItem).toBeVisible({ timeout: 10000 });
    
    // Hover over the project to show context menu options
    Log.info('Hovering over project to show context menu');
    await projectItem.hover();
    
    // Wait a moment for the context menu to appear
    await this.page.waitForTimeout(1000);
    
    // Look for settings option in the context menu (could be an icon or text)
    // Try multiple selectors for settings
    const settingsSelectors = [
      'button[title*="Settings"]',
      'a[title*="Settings"]',
      '[data-tooltip*="settings"]',
      '[data-tooltip*="Settings"]',
      'button:has-text("Settings")',
      '.settings-icon',
      '[class*="settings"]'
    ];
    
    let settingsOption = null;
    for (const selector of settingsSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        settingsOption = element;
        Log.info(`Found settings option using selector: ${selector}`);
        break;
      }
    }
    
    if (!settingsOption) {
      throw new Error('Settings option not found in context menu after hovering over project');
    }
    
    // Click on the settings option
    Log.info('Clicking on settings option from context menu');
    await settingsOption.click();
    
    // Wait for settings page to load
    await this.page.waitForURL(/.*settings/, { timeout: 10000 });
    Log.info('Successfully navigated to project settings via context menu');
  }

  /**
   * Get project name from a project tile element
   */
  private async getProjectNameFromTile(projectTile: Locator): Promise<string> {
    // Find the project name within the tile (usually the main text, not trial/status text)
    const nameElements = await projectTile.locator('generic').filter({ 
      hasText: /^[A-Za-z0-9\s\-_]+$/ 
    }).allTextContents();
    
    // Filter out common status texts and find the actual project name
    const filteredNames = nameElements.filter(text => 
      text.trim() && 
      !text.includes('Trial') && 
      !text.includes('Private') && 
      !text.includes('days') &&
      text.length > 3
    );
    
    return filteredNames[0] || 'Unknown Project';
  }

  /**
   * Verify success message appears (for project deletion or creation)
   */
  async verifySuccessMessage(message: string): Promise<void> {
    Log.info(`Verifying success message: ${message}`);
    const successAlert = this.page.getByRole('alert', { name: message });
    await expect(successAlert).toBeVisible();
    Log.info('Success message verification completed');
  }

  /**
   * Get detailed dashboard state for debugging
   */
  async getDashboardState(): Promise<{
    hasProjects: boolean;
    projectCount: number;
    createButtonEnabled: boolean;
    projectNames: string[];
    url: string;
  }> {
    Log.info('Getting detailed dashboard state');
    
    const hasProjects = await this.hasExistingProjects();
    const projectCount = await this.projectItems.count();
    const createButtonEnabled = await this.createProjectButton.isEnabled().catch(() => false);
    const projectNames = await this.getProjectNames();
    const url = this.page.url();
    
    const state = {
      hasProjects,
      projectCount,
      createButtonEnabled,
      projectNames,
      url
    };
    
    Log.info(`Dashboard state: ${JSON.stringify(state, null, 2)}`);
    return state;
  }

  /**
   * Wait for page to load completely
   */
  private async waitForPageLoad(): Promise<void> {
    // Wait for the projects section to be visible
    await expect(this.projectsTitle).toBeVisible({ timeout: 15000 });
    await expect(this.createProjectButton).toBeVisible({ timeout: 15000 });
    
    // Wait for loading state to complete with a shorter timeout
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (error) {
      // If networkidle times out, just wait for domcontentloaded
      await this.page.waitForLoadState('domcontentloaded');
      Log.info('Using domcontentloaded instead of networkidle due to timeout');
    }
  }
}
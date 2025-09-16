import { expect, Page } from '@playwright/test';
import Log from '../Log';

/**
 * Document360-specific validation utilities
 * Contains common validation patterns used across Document360 test scenarios
 */
export class Document360Validator {
  
  /**
   * Validates that the current URL matches documentation-related patterns
   * @param page - The Playwright page object
   * @param expectedPattern - Optional custom pattern to match against
   */
  static async validateDocumentationUrl(page: Page, expectedPattern?: RegExp): Promise<void> {
    const currentUrl = page.url();
    const pattern = expectedPattern || /\/(document|docs|documentation)/i;
    
    Log.info(`Validating documentation URL: ${currentUrl}`);
    expect(currentUrl).toMatch(pattern);
    Log.info(`✅ Documentation URL validation passed`);
  }

  /**
   * Validates that the current URL matches API documentation patterns
   * @param page - The Playwright page object
   */
  static async validateApiDocumentationUrl(page: Page): Promise<void> {
    const currentUrl = page.url();
    Log.info(`Validating API documentation URL: ${currentUrl}`);
    expect(currentUrl).toMatch(/api-documentation/i);
    Log.info(`✅ API documentation URL validation passed`);
  }

  /**
   * Validates that the current URL matches project settings patterns
   * @param page - The Playwright page object
   */
  static async validateProjectSettingsUrl(page: Page): Promise<void> {
    const currentUrl = page.url();
    Log.info(`Validating project settings URL: ${currentUrl}`);
    expect(currentUrl).toMatch(/settings/i);
    Log.info(`✅ Project settings URL validation passed`);
  }

  /**
   * Validates page title contains expected keywords
   * @param page - The Playwright page object
   * @param expectedKeywords - Array of keywords that should be present in title
   */
  static async validatePageTitle(page: Page, expectedKeywords: string[]): Promise<void> {
    const pageTitle = await page.title();
    Log.info(`Validating page title: ${pageTitle}`);
    
    const titleLower = pageTitle.toLowerCase();
    const foundKeywords = expectedKeywords.filter(keyword => 
      titleLower.includes(keyword.toLowerCase())
    );
    
    expect(foundKeywords.length).toBeGreaterThan(0);
    Log.info(`✅ Page title contains expected keywords: ${foundKeywords.join(', ')}`);
  }

  /**
   * Validates that navigation completed successfully with proper page load
   * @param page - The Playwright page object
   * @param timeout - Optional timeout in milliseconds
   */
  static async validateNavigationComplete(page: Page, timeout: number = 10000): Promise<void> {
    Log.info('Validating navigation completion...');
    await page.waitForLoadState('networkidle', { timeout });
    await page.waitForLoadState('domcontentloaded', { timeout });
    
    // Verify page is not showing loading indicators
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('callback'); // Not stuck in auth callback
    expect(currentUrl).not.toContain('loading'); // Not showing loading page
    
    Log.info(`✅ Navigation completed successfully to: ${currentUrl}`);
  }

  /**
   * Validates that a URL follows Document360 project-specific patterns
   * @param page - The Playwright page object
   * @param expectedSection - Expected section name (e.g., 'document', 'api-documentation', 'settings')
   */
  static async validateProjectSpecificUrl(page: Page, expectedSection: string): Promise<void> {
    const currentUrl = page.url();
    Log.info(`Validating project-specific URL for section: ${expectedSection}`);
    
    // Document360 URLs typically follow pattern: portal.document360.io/[project-id]/[section]
    const projectUrlPattern = new RegExp(`/[a-f0-9-]{36}/${expectedSection}`, 'i');
    expect(currentUrl).toMatch(projectUrlPattern);
    
    Log.info(`✅ Project-specific URL validation passed for section: ${expectedSection}`);
  }

  /**
   * Validates that the page contains expected Document360 UI elements
   * @param page - The Playwright page object
   */
  static async validateDocument360Interface(page: Page): Promise<void> {
    Log.info('Validating Document360 interface elements...');
    
    // Check for common Document360 interface elements
    const hasProjectName = await page.locator('[class*="project"], [data-testid*="project"]').count() > 0;
    const hasNavigation = await page.locator('nav, [role="navigation"]').count() > 0;
    
    // At least one interface element should be present
    expect(hasProjectName || hasNavigation).toBeTruthy();
    
    Log.info('✅ Document360 interface validation passed');
  }

  /**
   * Validates workflow step completion with proper logging
   * @param stepName - Name of the workflow step
   * @param page - The Playwright page object
   * @param validationCallback - Optional custom validation function
   */
  static async validateWorkflowStep(
    stepName: string, 
    page: Page, 
    validationCallback?: (page: Page) => Promise<void>
  ): Promise<void> {
    Log.info(`🔍 Validating workflow step: ${stepName}`);
    
    // Default validation: ensure page is responsive and loaded
    await this.validateNavigationComplete(page);
    
    // Run custom validation if provided
    if (validationCallback) {
      await validationCallback(page);
    }
    
    Log.info(`✅ Workflow step validated successfully: ${stepName}`);
  }
}
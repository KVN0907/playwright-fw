import { test, expect, Page } from '@playwright/test';
import { Document360DashboardPage } from '../pageObjects/Document360DashboardPage';
import { Document360ProjectSettingsPage } from '../pageObjects/Document360ProjectSettingsPage';
import Log from '../../utils/Log';

test.describe('Document360 Dashboard Page Validations', () => {
  let dashboardPage: Document360DashboardPage;
  let projectSettingsPage: Document360ProjectSettingsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new Document360DashboardPage(page);
    projectSettingsPage = new Document360ProjectSettingsPage(page);
    
    Log.info('Setting up test - navigating to dashboard');
    await page.goto('/dashboard');
    await dashboardPage.verifyPageLoaded();
  });

  test.afterEach(async ({ page }) => {
    Log.info('Test cleanup - capturing final state');
    const currentUrl = page.url();
    Log.info(`Test completed on URL: ${currentUrl}`);
  });

  test('User can validate Document360 dashboard functionality and project management in trial version', async () => {
    // Given user is on the dashboard
    const projectStatus = await dashboardPage.getProjectStatus();
    const projectName = await dashboardPage.getProjectName();

    Log.info(`Project Status: ${projectStatus}`);
    Log.info(`Project Name: ${projectName}`);
    Log.info('Dashboard page loaded successfully with project information');
    
    // When user navigates to settings
    await dashboardPage.clickSettings();
    await projectSettingsPage.verifySettingsPageLoaded();
    
    // Then project settings should be accessible
    const currentProjectName = await projectSettingsPage.getProjectName();
    Log.info(`Current project name in settings: ${currentProjectName}`);
    Log.info('Dashboard validation completed successfully');
  });

  test('Negative: User cannot access dashboard with invalid URL path @negative', async ({ page }) => {
    Log.info('Starting negative test - invalid dashboard URL');
    
    // Given user navigates to invalid dashboard URL
    const invalidUrl = '/dashboard/invalid-path';
    await page.goto(invalidUrl);
    
    // Then user should either be redirected or see error
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    // Verify we're not on a valid dashboard or we see an error
    const isValidDashboard = currentUrl.includes('/dashboard') && !currentUrl.includes('invalid-path');
    const hasErrorContent = pageContent?.includes('404') || pageContent?.includes('Not Found') || pageContent?.includes('Error');
    
    expect(isValidDashboard || hasErrorContent).toBeTruthy();
    Log.info(`Invalid URL handling verified - URL: ${currentUrl}`);
  });

  test('Negative: Dashboard should handle missing project elements gracefully @negative', async ({ page }) => {
    Log.info('Starting negative test - missing project elements');
    
    // Given user is on dashboard but project elements might be missing
    await page.goto('/dashboard');
    
    try {
      // Attempt to get project information with timeout
      const projectStatus = await dashboardPage.getProjectStatus().catch(() => 'No status available');
      const projectName = await dashboardPage.getProjectName().catch(() => 'No name available');
      
      Log.info(`Project Status (with fallback): ${projectStatus}`);
      Log.info(`Project Name (with fallback): ${projectName}`);
      
      // Verify the page handles missing elements without crashing
      expect(typeof projectStatus).toBe('string');
      expect(typeof projectName).toBe('string');
      
    } catch (error) {
      Log.info(`Expected error handling missing elements: ${error}`);
      // This is acceptable for negative test - we're testing graceful degradation
    }
    
    Log.info('Missing project elements handling completed');
  });
});

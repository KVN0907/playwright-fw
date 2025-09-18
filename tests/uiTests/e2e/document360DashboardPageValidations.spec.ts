import { test, expect, Page } from '@playwright/test';
import { Document360DashboardPage } from '../pageObjects/Document360DashboardPage';
import { Document360ProjectSettingsPage } from '../pageObjects/Document360ProjectSettingsPage';
import Log from '../../utils/Log';

test.describe('Document360 Dashboard Page Validations', () => {

  test('User can validate Document360 dashboard functionality and project management in trial version', async ({ page }) => {
    // Initialize page objects directly
    const dashboardPage = new Document360DashboardPage(page);
    const projectSettingsPage = new Document360ProjectSettingsPage(page);
    
    // Given user navigates to Document360 dashboard
    await page.goto('/dashboard');
    await dashboardPage.verifyPageLoaded();
    const projectStatus = await dashboardPage.getProjectStatus();
    const projectName = await dashboardPage.getProjectName();
    
  Log.info(`Project Status: ${projectStatus}`);
  Log.info(`Project Name: ${projectName}`);
  Log.info('Dashboard page loaded successfully with project information');
    await dashboardPage.clickSettings();
    await projectSettingsPage.verifySettingsPageLoaded();
    const currentProjectName = await projectSettingsPage.getProjectName();
  Log.info(`Current project name in settings: ${currentProjectName}`);
  Log.info('Dashboard validation completed successfully');
  });
});
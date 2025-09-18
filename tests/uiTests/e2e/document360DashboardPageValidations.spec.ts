import { test, expect, Page } from '@playwright/test';
import { Document360DashboardPage } from '../pageObjects/Document360DashboardPage';
import { Document360ProjectSettingsPage } from '../pageObjects/Document360ProjectSettingsPage';

test.describe('Document360 Dashboard Page Validations', () => {

  test('User can validate Document360 dashboard functionality and project management in trial version', async ({ page }) => {
    // Initialize page objects directly
    const dashboardPage = new Document360DashboardPage(page);
    const projectSettingsPage = new Document360ProjectSettingsPage(page);
    
    // Given user navigates to Document360 dashboard
    await dashboardPage.navigateToDashboard();
    
    // When user checks for existing projects and trial limitations
    const hasExistingProjects = await dashboardPage.hasExistingProjects();
    const projectCount = await dashboardPage.getProjectCount();
    
    // Then trial limitations should be properly displayed
    await dashboardPage.verifyTrialLimitations();
    
    if (hasExistingProjects) {
      console.log(`Found ${projectCount} existing project(s) in trial version`);
      const projectNames = await dashboardPage.getProjectNames();
      console.log(`Project names: ${projectNames.join(', ')}`);
      
      // And user hovers over project to reveal action buttons
      const projectTile = await dashboardPage.hoverOverProject();
      const actionButtons = await dashboardPage.getProjectActionButtons(projectTile);
      console.log(`Available action buttons on hover: ${actionButtons.join(', ')}`);
      
      // When user navigates to project settings via hover action
      await dashboardPage.navigateToProjectSettings();
      
      // Then user should be able to access settings page
      await projectSettingsPage.verifySettingsPageLoaded();
      await projectSettingsPage.verifyTrialStatus();
      
      const currentProjectName = await projectSettingsPage.getProjectName();
      console.log(`Current project name in settings: ${currentProjectName}`);
      
      // And user should see all navigation options available
      await projectSettingsPage.verifyNavigationLinksVisible();
      
      // When user navigates through different settings sections
      const settingsSections = ['general', 'team-auditing', 'localization'] as const;
      
      for (const section of settingsSections) {
        await projectSettingsPage.navigateToSettingsSection(section);
        console.log(`Successfully navigated to ${section} section via user action`);
      }
      
      // And user returns to general settings for deletion
      await projectSettingsPage.navigateToSettingsSection('general');
      
      // When user initiates project deletion to make room for new project
      await projectSettingsPage.deleteProject();
      
      // Then user should be redirected to dashboard with success message
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.verifySuccessMessage('Project deleted!');
      
      const projectCountAfterDeletion = await dashboardPage.getProjectCount();
      console.log(`Projects after deletion: ${projectCountAfterDeletion}`);
      
      // And create project button should now be enabled for new project creation
      await dashboardPage.verifyTrialLimitations();
      
    } else {
      console.log('No existing projects found - trial version ready for new project creation');
      
      // Then create project button should be enabled
      await dashboardPage.verifyTrialLimitations();
    }
  });
});
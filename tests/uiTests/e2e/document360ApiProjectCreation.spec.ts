import { test } from '@playwright/test';
import { Document360DashboardPage } from '../pageObjects/Document360DashboardPage';
import { Document360ProjectCreationPage } from '../pageObjects/Document360ProjectCreationPage';
import { Document360ProjectSettingsPage } from '../pageObjects/Document360ProjectSettingsPage';
import Log from '../../utils/Log';
import * as testData from '../../data/projectCreationTestData.json';

test.describe('Document360 API Documentation Project Creation', () => {
  
  test('Create new API documentation project with pet store template @smoke @project-creation', async ({ page }) => {
    Log.info('🚀 Starting API Documentation Project Creation Test');
    
    // Initialize page objects
    const dashboardPage = new Document360DashboardPage(page);
    const projectCreationPage = new Document360ProjectCreationPage(page);
    
    // Test data
    const projectConfig = testData.projectCreation.defaultProject;
    const projectName = projectConfig.projectName;
    const websiteUrl = projectConfig.websiteUrl;
    const apiSetup = projectConfig.apiSetup as 'sample' | 'upload' | 'url';

    // GIVEN: User navigates to Document360 dashboard
    Log.info('GIVEN: User is on Document360 dashboard');
    await dashboardPage.navigateToDashboard();
    await dashboardPage.verifyDashboardLoaded();

    // AND: Check for existing projects and handle trial limitations
    const hasExistingProjects = await dashboardPage.hasExistingProjects();
    if (hasExistingProjects) {
      Log.info('Existing project found in trial mode - project deletion required');
      const projectSettingsPage = new Document360ProjectSettingsPage(page);
      
      // Navigate to settings and delete existing project
      await dashboardPage.navigateToProjectSettings();
      await projectSettingsPage.verifySettingsPageLoaded();
      await projectSettingsPage.deleteProject();
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.verifySuccessMessage('Project deleted!');
    }
    await dashboardPage.verifyTrialLimitations();

    // WHEN: User initiates project creation
    Log.info('WHEN: User creates new API documentation project');
    await projectCreationPage.clickCreateProject();

    // AND: Selects API documentation option
    await projectCreationPage.selectApiDocumentation();
    
    // THEN: Step 2 - API method selection should be visible
    await projectCreationPage.verifyStepTitle('Select a method to create an API reference');

    // WHEN: User selects API setup method from test data
    const apiUrl = apiSetup === 'url' ? testData.projectCreation.urlBasedProject.apiUrl : undefined;
    await projectCreationPage.selectApiSetupMethod(apiSetup, apiUrl);
    await projectCreationPage.proceedToNextStep('Step 2 - Template selection');
    
    // THEN: Step 3 should show personalize knowledge base
    await projectCreationPage.verifyStepTitle('Personalize your Knowledge Base');

    // WHEN: User skips website URL step (has default)
    await projectCreationPage.skipWebsiteUrlStep();

    // AND: System processes the setup (wait for step 4)
    Log.info('Waiting for knowledge base personalization to complete...');
    await page.waitForTimeout(3000); // Allow processing time

    // THEN: Step 4 should show brand guidelines
    await projectCreationPage.verifyStepTitle('Brand guidelines');

    // WHEN: User customizes project name and accepts branding defaults
    await projectCreationPage.fillProjectName(projectName);
    await projectCreationPage.acceptDefaultBrandingSettings();
    await projectCreationPage.proceedToNextStep('Step 4 - Branding');

    // THEN: Step 5 should show privacy settings
    await projectCreationPage.verifyStepTitle('Set the privacy of your documentation');

    // WHEN: User accepts private access (default for trial) and finishes
    await projectCreationPage.selectPrivateAccess();
    await projectCreationPage.finishProjectCreation();

    // THEN: Project should be created successfully
    Log.info('THEN: API documentation project should be created with all components');
    await projectCreationPage.waitForProjectCreationComplete();
    
    // Verify project creation
    await projectCreationPage.verifyProjectCreated(projectName);
    await projectCreationPage.verifyTrialBanner();
    await projectCreationPage.verifyOpenSiteLink();

    // Verify project structure
    await projectCreationPage.verifyApiDocumentationStructure();
    
    // Verify project URL contains expected pattern
    await projectCreationPage.verifyProjectUrl('api-documentation');
    
    // Verify API template content is created
    await projectCreationPage.verifyApiTemplateContent();

    // Log project details
    const projectId = await projectCreationPage.getProjectIdFromUrl();
    Log.info(`✅ API Documentation project created successfully with ID: ${projectId}`);
    Log.info(`Project Name: ${projectName}`);
    Log.info(`Website URL: ${websiteUrl}`);
    Log.info(`Project URL: ${page.url()}`);
    
    Log.info('🎉 API Documentation Project Creation Test Completed Successfully');
  });

  test('Verify API documentation project components and structure @component-verification', async ({ page }) => {
    Log.info('🔍 Starting API Documentation Project Components Verification');
    
    const dashboardPage = new Document360DashboardPage(page);
    const projectCreationPage = new Document360ProjectCreationPage(page);

    // GIVEN: User navigates to existing API documentation project
    Log.info('GIVEN: User navigates to API documentation dashboard');
    await dashboardPage.navigateToDashboard();
    
    // Find and access the API documentation project
    const apiProject = page.locator('text=API Test Documentation').first();
    if (await apiProject.count() > 0) {
      await apiProject.click(); 
      Log.info('Found existing API Test Documentation project');
    } else {
      // If no existing project, skip this test
      Log.info('No existing API documentation project found - skipping component verification');
      return;
    }

    // WHEN: User examines project structure
    Log.info('WHEN: User examines API documentation project structure');
    await projectCreationPage.waitForLoadState('domcontentloaded');

    // THEN: All project components should be present
    Log.info('THEN: All API documentation components should be verified');
    
    // Verify main project elements
    await projectCreationPage.verifyTrialBanner();
    await projectCreationPage.verifyOpenSiteLink();
    
    // Verify documentation structure
    await projectCreationPage.verifyApiDocumentationStructure();
    
    // Verify content template
    await projectCreationPage.verifyApiTemplateContent();
    
    // Verify URL structure
    await projectCreationPage.verifyProjectUrl('api-documentation');

    Log.info('✅ API Documentation Project Components Verified Successfully');
  });

  test('Verify project creation wizard flow and navigation @wizard-flow', async ({ page }) => {
    Log.info('🧭 Starting Project Creation Wizard Flow Verification');
    
    const dashboardPage = new Document360DashboardPage(page);
    const projectCreationPage = new Document360ProjectCreationPage(page);

    // GIVEN: User is on the dashboard
    Log.info('GIVEN: User starts project creation wizard');
    await dashboardPage.navigateToDashboard();
    await dashboardPage.verifyDashboardLoaded();

    // WHEN: User clicks create project
    await projectCreationPage.clickCreateProject();

    // THEN: Step 1 should be visible
    Log.info('THEN: Project creation wizard should guide through all steps');
    await projectCreationPage.verifyStepTitle('Choose your use case to get started');

    // Navigate through each step without completing
    await projectCreationPage.selectApiDocumentation();
    await projectCreationPage.verifyStepTitle('Select a method to create an API reference');

    // Use test data for API setup selection
    const wizardConfig = testData.projectCreation.customProject;
    const wizardApiUrl = wizardConfig.apiSetup === 'url' ? testData.projectCreation.urlBasedProject.apiUrl : undefined;
    await projectCreationPage.selectApiSetupMethod(wizardConfig.apiSetup as 'sample' | 'upload' | 'url', wizardApiUrl);
    await projectCreationPage.proceedToNextStep();
    await projectCreationPage.verifyStepTitle('Personalize your Knowledge Base');

    // Skip website URL step (use default)
    await projectCreationPage.skipWebsiteUrlStep();

    // Wait for processing and verify next step
    await page.waitForTimeout(2000);
    await projectCreationPage.verifyStepTitle('Brand guidelines');

    Log.info('✅ Project Creation Wizard Flow Verified Successfully');
  });
});
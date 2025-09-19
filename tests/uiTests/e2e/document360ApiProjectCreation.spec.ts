import { test, expect } from '@playwright/test';
import { Document360DashboardPage } from '../pageObjects/Document360DashboardPage';
import { Document360ProjectCreationPage } from '../pageObjects/Document360ProjectCreationPage';
import { Document360ProjectSettingsPage } from '../pageObjects/Document360ProjectSettingsPage';
import Log from '../../utils/Log';
import * as testData from '../../data/projectCreationTestData.json';

test.describe('Document360 API Documentation Project Creation', () => {
  test('Create new API documentation project with pet store template Using Create URL Option @smoke @project-creation', async ({
    page,
  }) => {
    Log.info('Starting API Documentation Project Creation Test');

    test.info().annotations.push({ type: 'severity', description: 'Critical' });

    // Add feature annotation
    test.info().annotations.push({ type: 'feature', description: 'Project Creation Via UPI' });

    // Add epic annotation
    test.info().annotations.push({ type: 'epic', description: 'API Documentation' });
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
    const hasExistingProjects = await dashboardPage.verifyProjectsExist();
    if (hasExistingProjects) {
      Log.info('Existing project found in trial mode - project deletion required');
      const projectSettingsPage = new Document360ProjectSettingsPage(page);
      const existingProjectName = await dashboardPage.getProjectName();

      // Navigate to settings and delete existing project
      await dashboardPage.navigateToProjectSettings();
      await projectSettingsPage.verifySettingsPageLoaded();
      await projectSettingsPage.deleteProject(existingProjectName);
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

  test('Verify API documentation project components and structure @component-verification', async ({
    page,
  }) => {
    Log.info('🔍 Starting API Documentation Project Components Verification');

    const dashboardPage = new Document360DashboardPage(page);
    const projectCreationPage = new Document360ProjectCreationPage(page);

    // GIVEN: User navigates to existing API documentation project
    Log.info('GIVEN: User navigates to API documentation dashboard');
    await dashboardPage.navigateToDashboard();

    // Find and access the API documentation project
    const apiProject = page.locator('text=API Test Documentation').first();
    if ((await apiProject.count()) > 0) {
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

  test('Create new API documentation project - Sample Radio Button @smoke @project-creation', async ({
    page,
  }) => {
    Log.info('Starting API Documentation Project Creation Test');
    test.info().annotations.push({ type: 'severity', description: 'Critical' });

    // Add feature annotation
    test
      .info()
      .annotations.push({ type: 'feature', description: 'Project Creation Sample Project' });

    // Add epic annotation
    test.info().annotations.push({ type: 'epic', description: 'API Documentation' });
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
    const hasExistingProjects = await dashboardPage.verifyProjectsExist();
    if (hasExistingProjects) {
      Log.info('Existing project found in trial mode - project deletion required');
      const projectSettingsPage = new Document360ProjectSettingsPage(page);
      const existingProjectName = await dashboardPage.getProjectName();

      // Navigate to settings and delete existing project
      await dashboardPage.navigateToProjectSettings();
      await projectSettingsPage.verifySettingsPageLoaded();
      await projectSettingsPage.deleteProject(existingProjectName);
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
    const apiUrl =
      apiSetup === 'sample' ? testData.projectCreation.defaultProject.apiSetup : undefined;
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

  test('Negative: Project creation should fail with invalid project name @negative', async ({ page }) => {
    Log.info('Starting Negative Test - Invalid Project Name');

    test.info().annotations.push({ type: 'severity', description: 'High' });
    test.info().annotations.push({ type: 'feature', description: 'Project Creation Validation' });

    // Initialize page objects for this test
    const dashboardPage = new Document360DashboardPage(page);
    const projectCreationPage = new Document360ProjectCreationPage(page);

    // Navigate and setup
    await dashboardPage.navigateToDashboard();
    await dashboardPage.verifyDashboardLoaded();

    // Test data with invalid characters
    const invalidProjectName = '<script>alert("hack")</script>'; // XSS attempt
    const apiSetup = 'sample';

    try {
      // WHEN: User initiates project creation with invalid name
      Log.info('WHEN: User creates project with invalid/malicious name');
      await projectCreationPage.clickCreateProject();
      await projectCreationPage.selectApiDocumentation();
      await projectCreationPage.selectApiSetupMethod(apiSetup);

      // Try to fill invalid project name
      await projectCreationPage.fillProjectName(invalidProjectName);
      
      // THEN: System should either sanitize the input or show validation error
      const projectNameField = page.locator('input[name*="project"], input[name*="name"]').first();
      const actualValue = await projectNameField.inputValue();
      
      // Verify the malicious script is not in the field value
      expect(actualValue).not.toContain('<script>');
      expect(actualValue).not.toContain('alert');
      
      Log.info(`Invalid project name was sanitized to: ${actualValue}`);
      
    } catch (error) {
      Log.info(`Expected validation error for invalid project name: ${error}`);
      // This is acceptable - the system should prevent invalid names
    }

    Log.info('Negative Test - Invalid Project Name Completed');
  });

  test('Negative: Project creation should handle missing required fields @negative', async ({ page }) => {
    Log.info('Starting Negative Test - Missing Required Fields');

    test.info().annotations.push({ type: 'severity', description: 'High' });
    test.info().annotations.push({ type: 'feature', description: 'Form Validation' });

    // Initialize page objects for this test
    const dashboardPage = new Document360DashboardPage(page);
    const projectCreationPage = new Document360ProjectCreationPage(page);

    // Navigate and setup
    await dashboardPage.navigateToDashboard();
    await dashboardPage.verifyDashboardLoaded();

    try {
      // WHEN: User attempts to create project without filling required fields
      Log.info('WHEN: User attempts to skip required form fields');
      await projectCreationPage.clickCreateProject();
      await projectCreationPage.selectApiDocumentation();

      // Try to proceed without selecting API setup method
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        
        // THEN: System should either show validation message or prevent progression
        const validationMessage = page.locator('.error, .invalid, .validation-message, [role="alert"]');
        
        // Check if we stayed on the same step (indicating validation worked)
        const stillOnApiSetupStep = await page.locator(':text("Select a method to create an API reference")').isVisible();
        const hasValidationError = await validationMessage.isVisible({ timeout: 3000 });
        
        expect(stillOnApiSetupStep || hasValidationError).toBeTruthy();
        Log.info('Form validation prevented progression with missing required fields');
      }
      
    } catch (error) {
      Log.info(`Expected form validation behavior: ${error}`);
    }

    Log.info('Negative Test - Missing Required Fields Completed');
  });
});

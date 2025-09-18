import { test } from '@playwright/test';
import { Document360DashboardPage } from '../pageObjects/Document360DashboardPage';
import { Document360ProjectCreationPage } from '../pageObjects/Document360ProjectCreationPage';
import { Document360ProjectSettingsPage } from '../pageObjects/Document360ProjectSettingsPage';
import { Document360DocumentationPage } from '../pageObjects/Document360DocumentationPage';
import { Document360SwaggerPetStorePage } from '../pageObjects/Document360SwaggerPetStorePage';
import { Document360PublishedSitePage } from '../pageObjects/Document360PublishedSitePage';

import Log from '../../utils/Log';
import * as testData from '../../data/projectCreationTestData.json';

test.describe('Document360 API Documentation Project Creation', () => {
   let documentationPage: Document360DocumentationPage;
      let swaggerPetStorePage: Document360SwaggerPetStorePage;
      let publishedSitePage: Document360PublishedSitePage;

      test.beforeEach(async () => {
          swaggerPetStorePage = new Document360SwaggerPetStorePage(page);
          publishedSitePage = new Document360PublishedSitePage(page);
      });
  test('Create new API documentation project with pet store template @smoke @project-creation', async ({ page }) => {
    Log.info('🚀 Starting API Documentation Project Creation Test');
    
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

  test('Publish API documentation project(Bluk Operation) @create-project @publish', async ({ page }) => {
    Log.info('🔍 Starting API Documentation Project Publishing Test');

    const dashboardPage = new Document360DashboardPage(page);
    const projectCreationPage = new Document360ProjectCreationPage(page);
await swaggerPetStorePage.navigateToSwaggerPetstore();
        await swaggerPetStorePage.navigateToPetCategory();
        await swaggerPetStorePage.verifySwaggerPetstorePageLoaded();

        // When user captures the available API endpoints
        const availableEndpoints = await swaggerPetStorePage.captureEndpointsList();
        await swaggerPetStorePage.verifyPetEndpointsDisplayed();

        // And user selects Find pet by ID endpoint for publishing
        await swaggerPetStorePage.selectFindPetByIdEndpoint();
        await swaggerPetStorePage.verifyBulkActionToolbarVisible();

        // And user publishes the selected endpoint
        await swaggerPetStorePage.publishSelectedEndpoint('Publishing Find pet by ID endpoint for testing');

        // Then endpoint should be published successfully
        await swaggerPetStorePage.verifyEndpointPublished('Find pet by ID');
        await swaggerPetStorePage.verifyEndpointStatus('Find pet by ID', 'Published');

        // When user opens the published documentation site
        const publishedPage = await swaggerPetStorePage.openPublishedSite();
        publishedSitePage = new Document360PublishedSitePage(publishedPage);

        // Then published site should load with proper landing page
        await publishedSitePage.verifyLandingPageLoaded();

        // When user navigates to API documentation section
        await publishedSitePage.navigateToApiDocumentation();

        // Then API documentation page should load with proper navigation structure
        await publishedSitePage.verifyApiDocumentationPageLoaded();

        // When user navigates to the published Find pet by ID endpoint
        await publishedSitePage.navigateToFindPetByIdEndpoint();

        // Then endpoint documentation should be complete and functional
        await publishedSitePage.verifyFindPetByIdEndpointDocumentation();
        await publishedSitePage.verifyTryItFunctionality();
        await publishedSitePage.verifyResponseDocumentation();
        await publishedSitePage.verifyEndpointInNavigation();
        await publishedSitePage.verifyPublishedEndpointQuality();

    Log.info('✅ API Documentation Project Components Verified Successfully');
  });
  
  test('Create new API documentation project - Sample Radio Button @smoke @project-creation', async ({ page }) => {
    Log.info('🚀 Starting API Documentation Project Creation Test');
    test.info().annotations.push({ type: 'severity', description: 'Critical' });
  
  // Add feature annotation
  test.info().annotations.push({ type: 'feature', description: 'Project Creation Sample Project' });
  
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
    const apiUrl = apiSetup === 'sample' ? testData.projectCreation.defaultProject.apiSetup : undefined;
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

});
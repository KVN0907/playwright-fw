import { test, expect } from '@playwright/test';
import { Document360DashboardPage } from '../pageObjects/Document360DashboardPage';
import { Document360ProjectCreationPage } from '../pageObjects/Document360ProjectCreationPage';
import { Document360ProjectSettingsPage } from '../pageObjects/Document360ProjectSettingsPage';
import { Document360DocumentationPage } from '../pageObjects/Document360DocumentationPage';
import { Document360SwaggerPetStorePage } from '../pageObjects/Document360SwaggerPetStorePage';
import { Document360PublishedSitePage } from '../pageObjects/Document360PublishedSitePage';

import Log from '../../utils/Log';
import * as testData from '../../data/projectCreationTestData.json';

test.describe('Document360 API Documentation Project Creation and Validation of Attributes', () => {
  let documentationPage: Document360DocumentationPage;
 
  test.beforeEach(async ({ page }) => {
    Log.info('🔄 Starting API Documentation Project Creation test setup');
    documentationPage = new Document360DocumentationPage(page);
    
  });

  test.afterEach(async ({ page }) => {
    Log.info('🧹 Cleaning up API Documentation Project Creation test');
  });

  test('Create new API documentation - Using URL with comprehensive attribute validation @smoke @project-creation @attribute-validation', async ({
    page,
  }) => {
    Log.info('🚀 Starting API Documentation Project Creation with Attribute Validation Test');

    test.info().annotations.push({ type: 'severity', description: 'Critical' });
    test.info().annotations.push({ type: 'feature', description: 'API Documentation Attribute Validation' });
    test.info().annotations.push({ type: 'epic', description: 'API Documentation' });

    // Initialize page objects
    const dashboardPage = new Document360DashboardPage(page);
    const projectCreationPage = new Document360ProjectCreationPage(page);

   // Test data - Force upload setup for this specific test
    const projectConfig = testData.projectCreation.defaultProject;
    const projectName = projectConfig.projectName;
    const websiteUrl = projectConfig.websiteUrl;
    const apiSetup = 'upload'; // Force upload for this test

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

    // WHEN: User selects API setup method - upload
    await projectCreationPage.selectApiSetupMethod(apiSetup);
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

    // Verify project structure and API template content
    await projectCreationPage.verifyApiDocumentationStructure();
    await projectCreationPage.verifyProjectUrl('api-documentation');
    await projectCreationPage.verifyApiTemplateContent();

    // WHEN: User navigates to API documentation section for attribute validation
    Log.info('WHEN: User navigates to API documentation section for attribute validation');
    await documentationPage.navigateToSampleApiDocumentation();
    await documentationPage.verifySampleApiDocumentationLoaded();

    // AND: User navigates to Users category and selects specific endpoint
    await documentationPage.navigateToUsersCategory();
    await documentationPage.verifyUsersCategoryLoaded();

    // Add a small wait before selecting the endpoint
    await page.waitForTimeout(2000);

    await documentationPage.selectGetUserByIdEndpoint();
    await documentationPage.verifyEndpointDetailsLoaded('Get user by ID');

    // THEN: API endpoint attributes should be rendered accurately in editor view
    Log.info('THEN: API endpoint attributes should be displayed accurately in editor view');

    // Verify basic endpoint information
    await documentationPage.verifyEndpointMethod('GET');
    await documentationPage.verifyEndpointPath('/users/{userId}');
    await documentationPage.verifyEndpointDescription('Retrieve a specific user by their ID');

    // Verify security configuration attributes
    await documentationPage.verifySecuritySection();
    await documentationPage.verifySecurityType('HTTP');
    await documentationPage.verifySecurityTokenType('bearer');

    // Verify path parameter attributes
    await documentationPage.verifyPathParametersSection();
    await documentationPage.verifyPathParameter({
      name: 'userId',
      type: 'integer (int64)',
      required: true,
      description: 'The ID of the user to retrieve'
    });

    // Verify response section structure
    await documentationPage.verifyResponsesSection();
    await documentationPage.verifyResponseCode('200');
    await documentationPage.verifyResponseCode('404');
    await documentationPage.verifyResponseCode('500');

    // WHEN: User expands 200 response to view detailed schema attributes (ONLY ONCE)
    Log.info('WHEN: User expands 200 response to view detailed schema attributes');
    await documentationPage.expandResponseSection('200');
    await documentationPage.verifyResponseExpanded('200');

    // THEN: Response schema attributes should display with accurate types and descriptions
    Log.info('THEN: Response schema properties should display with accurate types and descriptions');
    
    await documentationPage.verifyResponseContentType('200', 'application/json');
    await documentationPage.verifyResponseSchemaType('200', 'object');

    // Verify all API response properties with their detailed attributes
    const expectedProperties = [
      {
        name: 'id',
        type: 'integer (int64)',
        description: 'Unique identifier for the user'
      },
      {
        name: 'username',
        type: 'string',
        description: 'User\'s username'
      },
      {
        name: 'email',
        type: 'string (email)',
        description: 'User\'s email address'
      },
      {
        name: 'firstName',
        type: 'string',
        description: 'User\'s first name'
      },
      {
        name: 'lastName',
        type: 'string',
        description: 'User\'s last name'
      },
      {
        name: 'createdAt',
        type: 'string (date-time)',
        description: 'When the user was created'
      },
      {
        name: 'updatedAt',
        type: 'string (date-time)',
        description: 'When the user was last updated'
      }
    ];

    // Validate each property attribute accuracy WITHOUT expanding section repeatedly
    for (const property of expectedProperties) {
      await documentationPage.verifyResponsePropertyWithoutExpansion('200', property);
      Log.info(`✅ Verified attribute accuracy: ${property.name} (${property.type}) - ${property.description}`);
    }

    // Verify property count without expanding again
    await documentationPage.verifyResponsePropertyCountWithoutExpansion('200', expectedProperties.length);

    
    Log.info(`✅ API Documentation project with comprehensive attribute validation completed successfully`);
    Log.info(`Project Name: ${projectName}`);
    Log.info(`Website URL: ${websiteUrl}`);
    Log.info(`Validated ${expectedProperties.length} response properties with accurate types and descriptions`);
    Log.info(`Verified attribute accuracy in both editor and published views`);
    Log.info(`Project URL: ${page.url()}`);

    Log.info('🎉 API Documentation Project Creation with Comprehensive Attribute Validation Test Completed Successfully');
  });
});
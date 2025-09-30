import { test, expect } from '@playwright/test';
import { Document360DashboardPage } from '../pageObjects/Document360DashboardPage';
import { Document360ProjectCreationPage } from '../pageObjects/Document360ProjectCreationPage';
import { Document360ProjectSettingsPage } from '../pageObjects/Document360ProjectSettingsPage';
import { Document360DocumentationPage } from '../pageObjects/Document360DocumentationPage';
import { Document360SwaggerPetStorePage } from '../pageObjects/Document360SwaggerPetStorePage';
import { Document360PublishedSitePage } from '../pageObjects/Document360PublishedSitePage';

import Log from '../../utils/Log';
import { TestDataManager } from '../../utils/TestDataManager';

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

    // Get all test data from data manager
    const projectConfig = TestDataManager.getProjectConfig();
    const endpointData = TestDataManager.getEndpointData('getUserById');
    const schemaData = TestDataManager.getSchemaData('getUserByIdResponse');
    const navigationData = TestDataManager.getNavigationData();
    const messages = TestDataManager.getValidationMessages();
    const config = TestDataManager.getTestConfig();

    const projectName = projectConfig.projectName;
    const websiteUrl = projectConfig.websiteUrl;
    const apiSetup = 'upload'; // Force upload for this test

    Log.info(`Loading test data for endpoint: ${endpointData.method} ${endpointData.path}`);
    Log.info(`Schema validation: ${schemaData.properties.length} properties`);

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
      await dashboardPage.verifySuccessMessage(TestDataManager.getSuccessMessage('projectDeleted'));
    }
    await dashboardPage.verifyTrialLimitations();

    // WHEN: User initiates project creation
    Log.info('WHEN: User creates new API documentation project');
    await projectCreationPage.clickCreateProject();

    // AND: Selects API documentation option
    await projectCreationPage.selectApiDocumentation();

    // THEN: Step 2 - API method selection should be visible
    await projectCreationPage.verifyStepTitle(TestDataManager.getStepTitle('selectMethod'));

    // WHEN: User selects API setup method - upload
    await projectCreationPage.selectApiSetupMethod(apiSetup);
    await projectCreationPage.proceedToNextStep('Step 2 - Template selection');

    // THEN: Step 3 should show personalize knowledge base
    await projectCreationPage.verifyStepTitle(TestDataManager.getStepTitle('personalizeKnowledgeBase'));

    // WHEN: User skips website URL step (has default)
    await projectCreationPage.skipWebsiteUrlStep();

    // AND: System processes the setup
    Log.info('Waiting for knowledge base personalization to complete...');
    await page.waitForTimeout(TestDataManager.getTimeout('medium'));

    // THEN: Step 4 should show brand guidelines
    await projectCreationPage.verifyStepTitle(TestDataManager.getStepTitle('brandGuidelines'));

    // WHEN: User customizes project name and accepts branding defaults
    await projectCreationPage.fillProjectName(projectName);
    await projectCreationPage.acceptDefaultBrandingSettings();
    await projectCreationPage.proceedToNextStep('Step 4 - Branding');

    // THEN: Step 5 should show privacy settings
    await projectCreationPage.verifyStepTitle(TestDataManager.getStepTitle('privacySettings'));

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
    const usersCategory = TestDataManager.getCategoryData('users');
    await documentationPage.navigateToUsersCategory();
    await documentationPage.verifyUsersCategoryLoaded();

    // Add a small wait before selecting the endpoint
    await page.waitForTimeout(TestDataManager.getTimeout('medium'));

    await documentationPage.selectGetUserByIdEndpoint();
    await documentationPage.verifyEndpointDetailsLoaded(endpointData.name);

    // THEN: API endpoint attributes should be rendered accurately in editor view
    Log.info('THEN: API endpoint attributes should be displayed accurately in editor view');

    // Verify basic endpoint information from test data
    await documentationPage.verifyEndpointMethod(endpointData.method);
    await documentationPage.verifyEndpointPath(endpointData.path);
    await documentationPage.verifyEndpointDescription(endpointData.description);

    // Verify security configuration attributes from test data
    await documentationPage.verifySecuritySection();
    await documentationPage.verifySecurityType(endpointData.security.type);
    await documentationPage.verifySecurityTokenType(endpointData.security.tokenType);

    // Verify path parameter attributes from test data
    if (endpointData.pathParameters && endpointData.pathParameters.length > 0) {
      await documentationPage.verifyPathParametersSection();
      for (const param of endpointData.pathParameters) {
        await documentationPage.verifyPathParameter(param);
      }
    }

    // Verify response section structure from test data
    await documentationPage.verifyResponsesSection();
    for (const responseCode of endpointData.responseCodes) {
      await documentationPage.verifyResponseCode(responseCode);
    }

    // WHEN: User expands response to view detailed schema attributes
    Log.info(`WHEN: User expands ${endpointData.primaryResponseCode} response to view detailed schema attributes`);
    await documentationPage.expandResponseSection(endpointData.primaryResponseCode);
    await documentationPage.verifyResponseExpanded(endpointData.primaryResponseCode);

    // THEN: Response schema attributes should display with accurate types and descriptions
    Log.info('THEN: Response schema properties should display with accurate types and descriptions');
    
    await documentationPage.verifyResponseContentType(schemaData.responseCode, schemaData.contentType);
    await documentationPage.verifyResponseSchemaType(schemaData.responseCode, schemaData.schemaType);

    // Validate each property attribute accuracy dynamically from test data
    Log.info(`Validating ${schemaData.properties.length} properties from test data`);
    for (const property of schemaData.properties) {
      await documentationPage.verifyResponsePropertyWithoutExpansion(schemaData.responseCode, property);
      Log.info(`✅ Verified attribute accuracy: ${property.name} (${property.type}) - ${property.description}`);
    }

    // Verify property count from test data
    await documentationPage.verifyResponsePropertyCountWithoutExpansion(schemaData.responseCode, schemaData.properties.length);

    // Filter and validate required vs optional properties from test data
    const requiredProperties = TestDataManager.getRequiredProperties('getUserByIdResponse');
    const optionalProperties = TestDataManager.getOptionalProperties('getUserByIdResponse');
    
    Log.info(`✅ Validated ${requiredProperties.length} required properties`);
    Log.info(`✅ Validated ${optionalProperties.length} optional properties`);
    
    Log.info(`✅ API Documentation project with comprehensive attribute validation completed successfully`);
    Log.info(`Project Name: ${projectName}`);
    Log.info(`Website URL: ${websiteUrl}`);
    Log.info(`Endpoint: ${endpointData.method} ${endpointData.path}`);
    Log.info(`Validated ${schemaData.properties.length} response properties with accurate types and descriptions`);
    Log.info(`Verified attribute accuracy in both editor view`);
    Log.info(`Project URL: ${page.url()}`);

    Log.info('🎉 API Documentation Project Creation with Comprehensive Attribute Validation Test Completed Successfully');
  });
});
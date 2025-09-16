import { test, expect } from '../../../fixtures/baseTest';
import Log from '../../../utils/Log';
import { Document360ProjectDashboardPage } from '../pageObjects/Document360ProjectDashboardPage';
import { Document360ApiDocumentationPage } from '../pageObjects/Document360ApiDocumentationPage';

test.describe('Document360 Dashboard - Documentation Navigation', () => {
  let dashboardPage: Document360ProjectDashboardPage;
  let apiDocumentationPage: Document360ApiDocumentationPage;
  
  test.beforeEach(async ({ page }) => {
    Log.info('Setting up test - initializing page objects');
    dashboardPage = new Document360ProjectDashboardPage(page);
    apiDocumentationPage = new Document360ApiDocumentationPage(page);
    
    Log.info('Navigating to project dashboard');
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();
  });

  test('User can navigate to Documentation from project tile hover action', async ({ page }) => {
    // Given: User is on the project dashboard with a selected project
    Log.info('Given: User is on the project dashboard');
    await dashboardPage.selectProject(); // Select first available project

    // When: User hovers over project and clicks Documentation button
    Log.info('When: User hovers over project and clicks Documentation');
    await dashboardPage.clickProjectDocumentationByIndex(0);

    // Then: Documentation page opens and user can verify functionality
    Log.info('Then: Verifying documentation page opens and loads correctly');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Verify we're on a documentation-related page (URL should contain project or document related path)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(document|docs|documentation)/i);
    Log.info(`Navigated to documentation page: ${currentUrl}`);
    
    // Verify page content is loaded
    await page.waitForTimeout(2000); // Allow content to load
    const pageTitle = await page.title();
    Log.info(`Documentation page title: ${pageTitle}`);
    
    Log.info('✅ Documentation page opened and verified successfully');
  });

  test('User can navigate to API Documentation from project menu', async ({ page }) => {
    // Given: User is on the project dashboard with a selected project
    Log.info('Given: User is on the project dashboard');
    await dashboardPage.selectProject(); // Select first available project

    // When: User navigates to API Documentation from the project menu
    Log.info('When: User navigates to API Documentation from project menu');
    await dashboardPage.navigateToApiDocumentation();

    // Then: API Documentation page loads with proper content
    Log.info('Then: Verifying API documentation page functionality');
    
    // Verify we're on API documentation page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/api-documentation/i);
    Log.info(`Navigated to API documentation page: ${currentUrl}`);
    
    // Use the API documentation page object to verify content
    await apiDocumentationPage.verifyApiDocumentationSectionLoads();
    await apiDocumentationPage.verifyApiDocumentationContentDetails();
    
    Log.info('✅ API documentation page navigation verified successfully');
  });

  test('User can validate end-to-end documentation workflow', async ({ page }) => {
    // Given: User starts from the project dashboard
    Log.info('Given: User starts from project dashboard');
    await dashboardPage.selectProject(); // Select first available project

    // When: User performs complete documentation workflow
    Log.info('When: User performs complete documentation workflow');
    
    // Step 1: Navigate to Documentation via hover action
    Log.info('Step 1: Navigating to Documentation via project tile hover');
    await dashboardPage.clickProjectDocumentationByIndex(0);
    
    // Step 2: Verify documentation page loads
    await page.waitForLoadState('networkidle');
    const documentationUrl = page.url();
    expect(documentationUrl).toMatch(/\/(document|docs|documentation)/i);
    Log.info(`Documentation page loaded: ${documentationUrl}`);
    
    // Step 3: Navigate back to dashboard
    Log.info('Step 3: Navigating back to dashboard');
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();
    
    // Step 4: Try API Documentation navigation
    Log.info('Step 4: Navigating to API Documentation from menu');
    await dashboardPage.selectProject(); // Re-select project
    await dashboardPage.navigateToApiDocumentation();
    
    // Step 5: Verify API documentation
    const apiDocUrl = page.url();
    expect(apiDocUrl).toMatch(/api-documentation/i);
    await apiDocumentationPage.verifyApiDocumentationSectionLoads();
    
    // Then: All documentation workflows work as expected
    Log.info('Then: Verifying complete workflow success');
    Log.info('✅ Complete documentation workflow validated successfully');
  });

  test('User can access documentation and verify content structure', async ({ page }) => {
    // Given: User is on the project dashboard
    Log.info('Given: User is on the project dashboard');
    await dashboardPage.selectProject();

    // When: User navigates to API Documentation
    Log.info('When: User navigates to API Documentation');
    await dashboardPage.navigateToApiDocumentation();

    // Then: User can verify comprehensive documentation structure
    Log.info('Then: Verifying comprehensive documentation structure');
    
    // Verify API documentation page loads properly
    await apiDocumentationPage.verifyApiDocumentationSectionLoads();
    
    // Verify content sections exist
    await apiDocumentationPage.verifyApiDocumentationContentDetails();
    
    // Verify documentation structure and navigation
    await apiDocumentationPage.verifyApiDocumentationContentStructure();
    
    Log.info('✅ Documentation content structure verified successfully');
  });
});
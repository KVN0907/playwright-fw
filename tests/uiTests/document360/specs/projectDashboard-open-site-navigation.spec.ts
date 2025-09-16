import { test, expect } from '../../../fixtures/baseTest';
import Log from '../../../utils/Log';
import { Document360ProjectDashboardPage } from '../pageObjects/Document360ProjectDashboardPage';
import { Document360PublicSitePage } from '../pageObjects/Document360PublicSitePage';
import { PageContextHandler } from '../../../utils/PageContextHandler';

test.describe('Document360 Dashboard - Open Site Navigation', () => {
  let dashboardPage: Document360ProjectDashboardPage;
  let publicSitePage: Document360PublicSitePage;
  let contextHandler: PageContextHandler;
  
  test.beforeEach(async ({ page }) => {
    Log.info('Setting up test - initializing page objects');
    dashboardPage = new Document360ProjectDashboardPage(page);
    contextHandler = new PageContextHandler(page);
  });

  test('User can navigate to Open Site from project dashboard and interact with API Documentation', async ({ page }) => {
    // Step 1: Navigate to project dashboard
    Log.info('Step 1: Navigating to project dashboard');
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();

    // Step 2: Open public site from project dashboard using context handler
    Log.info('Step 2: Opening public site from project dashboard');
    const publicSiteTab = await contextHandler.switchToNewPage(async () => {
      await dashboardPage.clickProjectOpenSiteByIndex(0);
    });
    
    publicSitePage = new Document360PublicSitePage(publicSiteTab);

    // Step 3: Validate public site loads with correct content
    Log.info('Step 3: Validating public site loads with correct content');
    await publicSitePage.waitForPublicSiteLoad();
    await publicSitePage.validatePublicSiteNavigationComplete();

    // Step 4: Verify public site landing page and navigate to API Documentation
    Log.info('Step 4: Verifying public site landing page and navigating to API Documentation');
    await publicSitePage.verifyPublicSiteLandingPage();
    await publicSitePage.verifyApiDocumentationMenuExists();
    await publicSitePage.navigateToApiDocumentationFromMenu();
    
    // Step 5: Perform comprehensive API endpoint exploration
    Log.info('Step 5: Performing comprehensive API endpoint exploration');
    await publicSitePage.performApiEndpointExploration();

    // Step 6: Switch back to original dashboard context
    Log.info('Step 6: Switching back to original dashboard context');
    const originalPage = await contextHandler.switchToOriginalPage();
    await dashboardPage.validateReturnToDashboardAfterPublicSiteNavigation();

    Log.info('✅ Complete Open Site navigation and API interaction workflow validated successfully');
  });

  test('User can verify API Documentation accessibility and structure on public site', async ({ page }) => {
    // Given: User navigates to public site
    Log.info('Given: User navigates to public site from dashboard');
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();

    // When: User opens public site using context handler
    Log.info('When: User opens public site');
    const publicSiteTab = await contextHandler.switchToNewPage(async () => {
      await dashboardPage.clickProjectOpenSiteByIndex(0);
    });
    
    publicSitePage = new Document360PublicSitePage(publicSiteTab);
    await publicSitePage.waitForPublicSiteLoad();

    // Then: User can access and verify API Documentation structure
    Log.info('Then: Verifying API Documentation accessibility and structure');
    await publicSitePage.verifyPublicSiteLandingPage();
    await publicSitePage.verifyApiDocumentationMenuExists();
    await publicSitePage.navigateToApiDocumentationFromMenu();
    await publicSitePage.verifyApiDocumentationStructure();
    await publicSitePage.verifyApiCategoriesExist(['pet', 'store']);
    
    // Switch back to original dashboard context
    Log.info('Switching back to original dashboard context');
    await contextHandler.switchToOriginalPage();
    await dashboardPage.validateReturnToDashboardAfterPublicSiteNavigation();
    
    Log.info('✅ API Documentation accessibility and structure verified successfully');
  });

  test('User can perform end-to-end API testing workflow on public site', async ({ page }) => {
    // Given: User is on the public site API Documentation
    Log.info('Given: User navigates to API Documentation on public site');
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();

    const publicSiteTab = await contextHandler.switchToNewPage(async () => {
      await dashboardPage.clickProjectOpenSiteByIndex(0);
    });
    
    publicSitePage = new Document360PublicSitePage(publicSiteTab);
    await publicSitePage.waitForPublicSiteLoad();
    await publicSitePage.navigateToApiDocumentationFromMenu();

    // When: User performs comprehensive API testing
    Log.info('When: User performs comprehensive API endpoint testing');
    
    // Test multiple endpoints with different operations
    const testScenarios = [
      {
        category: 'pet',
        endpoint: 'Updates a pet in the store',
        parameters: [
          { name: 'petId', value: '12' },
          { name: 'name', value: 'pet12' },
          { name: 'status', value: 'active' }
        ]
      }
    ];

    for (const scenario of testScenarios) {
      Log.info(`Testing ${scenario.category} - ${scenario.endpoint}`);
      await publicSitePage.performCompleteApiTesting(scenario);
    }

    // Then: Verify all API testing functionality works
    Log.info('Then: Verifying API testing functionality completion');
    
    // Switch back to original dashboard context
    Log.info('Switching back to original dashboard context');
    await contextHandler.switchToOriginalPage();
    await dashboardPage.validateReturnToDashboardAfterPublicSiteNavigation();
    
    Log.info('✅ End-to-end API testing workflow completed successfully');
  });
});
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
    Log.info('Testing complete Open Site navigation and API interaction workflow');
    
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();

    const publicSiteTab = await contextHandler.switchToNewPage(async () => {
      await dashboardPage.clickProjectOpenSiteByIndex(0);
    });
    
    publicSitePage = new Document360PublicSitePage(publicSiteTab);

    await publicSitePage.waitForPublicSiteLoad();
    await publicSitePage.validatePublicSiteNavigationComplete();

    await publicSitePage.verifyPublicSiteLandingPage();
    await publicSitePage.verifyApiDocumentationMenuExists();
    await publicSitePage.navigateToApiDocumentationFromMenu();
    
    await publicSitePage.performApiEndpointExploration();

    const originalPage = await contextHandler.switchToOriginalPage();
    await dashboardPage.validateReturnToDashboardAfterPublicSiteNavigation();

    Log.info('✅ Complete Open Site navigation and API interaction workflow validated successfully');
  });

  test('User can verify API Documentation accessibility and structure on public site', async ({ page }) => {
    Log.info('Testing API Documentation accessibility and structure verification on public site');
    
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();

    const publicSiteTab = await contextHandler.switchToNewPage(async () => {
      await dashboardPage.clickProjectOpenSiteByIndex(0);
    });
    
    publicSitePage = new Document360PublicSitePage(publicSiteTab);
    await publicSitePage.waitForPublicSiteLoad();

    await publicSitePage.verifyPublicSiteLandingPage();
    await publicSitePage.verifyApiDocumentationMenuExists();
    await publicSitePage.navigateToApiDocumentationFromMenu();
    await publicSitePage.verifyApiDocumentationStructure();
    await publicSitePage.verifyApiCategoriesExist(['pet', 'store']);
    
    await contextHandler.switchToOriginalPage();
    await dashboardPage.validateReturnToDashboardAfterPublicSiteNavigation();
    
    Log.info('✅ API Documentation accessibility and structure verified successfully');
  });

  test('User can perform end-to-end API testing workflow on public site', async ({ page }) => {
    Log.info('Testing end-to-end API testing workflow on public site');
    
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();

    const publicSiteTab = await contextHandler.switchToNewPage(async () => {
      await dashboardPage.clickProjectOpenSiteByIndex(0);
    });
    
    publicSitePage = new Document360PublicSitePage(publicSiteTab);
    await publicSitePage.waitForPublicSiteLoad();
    await publicSitePage.navigateToApiDocumentationFromMenu();

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

    await contextHandler.switchToOriginalPage();
    await dashboardPage.validateReturnToDashboardAfterPublicSiteNavigation();
    
    Log.info('✅ End-to-end API testing workflow completed successfully');
  });
});
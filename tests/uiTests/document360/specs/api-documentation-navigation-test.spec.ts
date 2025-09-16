import { test, expect } from '../../../fixtures/baseTest';
import Log from '../../../utils/Log';
import { Document360ProjectDashboardPage } from '../pageObjects/Document360ProjectDashboardPage';
import { Document360PublicSitePage } from '../pageObjects/Document360PublicSitePage';
import { PageContextHandler } from '../../../utils/PageContextHandler';

test.describe('Document360 - API Documentation Navigation Test', () => {
  let dashboardPage: Document360ProjectDashboardPage;
  let publicSitePage: Document360PublicSitePage;
  let contextHandler: PageContextHandler;
  
  test.beforeEach(async ({ page }) => {
    Log.info('Setting up test - initializing page objects');
    dashboardPage = new Document360ProjectDashboardPage(page);
    contextHandler = new PageContextHandler(page);
  });

  test('Navigate to API Documentation from public site and verify functionality', async ({ page }) => {
    // Step 1: Navigate to dashboard and open public site
    Log.info('Step 1: Opening public site from dashboard');
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();

    const publicSiteTab = await contextHandler.switchToNewPage(async () => {
      await dashboardPage.clickProjectOpenSiteByIndex(0);
    });
    
    publicSitePage = new Document360PublicSitePage(publicSiteTab);
    await publicSitePage.waitForPublicSiteLoad();
    
    // Step 2: Verify we're on the public site landing page
    Log.info('Step 2: Verifying public site landing page');
    const initialUrl = publicSiteTab.url();
    Log.info(`Initial URL: ${initialUrl}`);
    
    // Step 3: Navigate to API Documentation
    Log.info('Step 3: Navigating to API Documentation');
    await publicSitePage.navigateToApiDocumentationFromMenu();
    
    // Step 4: Verify we're now on the API Documentation page
    Log.info('Step 4: Verifying API Documentation page loaded');
    const apiUrl = publicSiteTab.url();
    Log.info(`API Documentation URL: ${apiUrl}`);
    
    // Step 5: Verify API Documentation content is present
    Log.info('Step 5: Verifying API Documentation content');
    await publicSitePage.verifyApiDocumentationContent();
    
    // Step 6: Look for specific API endpoint elements
    Log.info('Step 6: Looking for API endpoint elements');
    await publicSitePage.findApiElements();
    
    // Step 7: Test basic interaction with any visible API elements
    Log.info('Step 7: Testing basic interaction with API elements');
    await publicSitePage.testApiElementsInteraction();
    
    Log.info('✅ API Documentation navigation and interaction test completed');
  });
});
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
    Log.info('Testing API Documentation navigation and verification from public site');
    
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();

    const publicSiteTab = await contextHandler.switchToNewPage(async () => {
      await dashboardPage.clickProjectOpenSiteByIndex(0);
    });
    
    publicSitePage = new Document360PublicSitePage(publicSiteTab);
    await publicSitePage.waitForPublicSiteLoad();
    
    const initialUrl = publicSiteTab.url();
    Log.info(`Initial URL: ${initialUrl}`);
    
    await publicSitePage.navigateToApiDocumentationFromMenu();
    
    const apiUrl = publicSiteTab.url();
    Log.info(`API Documentation URL: ${apiUrl}`);
    
    await publicSitePage.verifyApiDocumentationContent();
    
    await publicSitePage.findApiElements();
    
    await publicSitePage.testApiElementsInteraction();
    
    Log.info('✅ API Documentation navigation and interaction test completed');
  });
});
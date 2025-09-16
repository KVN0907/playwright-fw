import { test, expect } from '../../../fixtures/baseTest';
import Log from '../../../utils/Log';
import { Document360ProjectDashboardPage } from '../pageObjects/Document360ProjectDashboardPage';
import { Document360PublicSitePage } from '../pageObjects/Document360PublicSitePage';

test.describe('Document360 Dashboard - Open Site Functionality', () => {
  let dashboardPage: Document360ProjectDashboardPage;
  let publicSitePage: Document360PublicSitePage;
  
  test.beforeEach(async ({ page }) => {
    Log.info('Setting up test - initializing page objects');
    dashboardPage = new Document360ProjectDashboardPage(page);
    publicSitePage = new Document360PublicSitePage(page);
    
    Log.info('Navigating to project dashboard');
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();
  });

  test('User can open public site from project dashboard using hover action', async ({ page }) => {
    // Given: User is on the project dashboard with a selected project
    Log.info('Given: User is on the project dashboard');
    await dashboardPage.selectProject(); // Select first available project

    // When: User clicks on "Open Site" using the hover action from project tile
    Log.info('When: User hovers over project and clicks Open Site');
    const newTab = await dashboardPage.clickProjectOpenSiteByIndex(0);

    // Then: Public site opens in new tab and user can verify site functionality
    Log.info('Then: Verifying public site opens and loads correctly');
    
    // Create new public site page object for the new tab
    const newTabPublicSitePage = new Document360PublicSitePage(newTab);
    
    // Wait for the public site to load in the new tab
    await newTabPublicSitePage.waitForPublicSiteLoad();
    
    // Verify the public site loads correctly
    await newTabPublicSitePage.verifyPublicSiteLoads();
    
    // Verify site title and content accessibility
    const siteTitle = await newTabPublicSitePage.getSiteTitle();
    Log.info(`Public site title: ${siteTitle}`);
    
    await newTabPublicSitePage.verifySiteContentAccessible();
    
    // Close the new tab after verification
    await newTab.close();
    
    Log.info('✅ Public site opened and verified successfully');
  });

  test('User can navigate to documentation section from public site', async ({ page }) => {
    // Given: User opens the public site from dashboard
    Log.info('Given: User opens public site from dashboard');
    await dashboardPage.selectProject(); // Select first available project
    const newTab = await dashboardPage.clickProjectOpenSiteByIndex(0);
    const newTabPublicSitePage = new Document360PublicSitePage(newTab);
    await newTabPublicSitePage.waitForPublicSiteLoad();

    // When: User navigates to the Documentation section
    Log.info('When: User navigates to Documentation section');
    await newTabPublicSitePage.navigateToDocumentationSection();

    // Then: Documentation section loads and functionality is verified
    Log.info('Then: Verifying documentation section functionality');
    await newTabPublicSitePage.verifyDocumentationSectionFunctionality();
    
    // Verify site navigation works properly
    await newTabPublicSitePage.verifySiteNavigation();
    
    // Close the new tab after verification
    await newTab.close();
    
    Log.info('✅ Documentation section navigation verified successfully');
  });

  test('User can validate end-to-end open site workflow', async ({ page }) => {
    // Given: User starts from the project dashboard
    Log.info('Given: User starts from project dashboard');
    await dashboardPage.selectProject(); // Select first available project

    // When: User performs complete open site workflow
    Log.info('When: User performs complete open site workflow');
    
    // Step 1: Open the public site
    const newTab = await dashboardPage.clickProjectOpenSiteByIndex(0);
    const newTabPublicSitePage = new Document360PublicSitePage(newTab);
    await newTabPublicSitePage.waitForPublicSiteLoad();
    
    // Step 2: Verify public site loads
    await newTabPublicSitePage.verifyPublicSiteLoads();
    
    // Step 3: Navigate to documentation
    await newTabPublicSitePage.navigateToDocumentationSection();
    
    // Step 4: Verify documentation functionality
    await newTabPublicSitePage.verifyDocumentationSectionFunctionality();

    // Then: All functionality works as expected
    Log.info('Then: Verifying complete workflow success');
    
    // Verify final state and navigation
    await newTabPublicSitePage.verifySiteNavigation();
    await newTabPublicSitePage.verifySiteContentAccessible();
    
    // Close the new tab after verification
    await newTab.close();
    
    Log.info('✅ Complete open site workflow validated successfully');
  });
});
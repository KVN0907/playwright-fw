import { test, expect } from '../../../fixtures/baseTest';
import Log from '../../../utils/Log';
import { Document360ProjectDashboardPage } from '../pageObjects/Document360ProjectDashboardPage';
import { Document360ApiDocumentationPage } from '../pageObjects/Document360ApiDocumentationPage';

test.describe('Document360 - Documentation to API Documentation Navigation', () => {
  let dashboardPage: Document360ProjectDashboardPage;
  let apiDocumentationPage: Document360ApiDocumentationPage;
  
  test.beforeEach(async ({ page }) => {
    Log.info('Setting up test - initializing page objects');
    dashboardPage = new Document360ProjectDashboardPage(page);
    apiDocumentationPage = new Document360ApiDocumentationPage(page);
  });

  test('User can navigate from dashboard to documentation and verify important elements', async ({ page }) => {
    Log.info('Testing navigation from dashboard to documentation with element verification');
    
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();
    await dashboardPage.clickProjectDocumentationByIndex(0);
    
    // Validate navigation success using page object method
    const navigationSuccessful = await apiDocumentationPage.validateNavigationFromDashboard();
    if (!navigationSuccessful) {
      throw new Error('Failed to navigate from dashboard');
    }
    
    Log.info('✅ Documentation navigation and element verification completed successfully');
  });

  test('User can access API Documentation and verify document count', async ({ page }) => {
    Log.info('Testing API Documentation access and document count verification');
    
    await dashboardPage.navigateToProjectDashboard();
    await dashboardPage.verifyDashboardFullyLoaded();
    await dashboardPage.clickProjectDocumentationByIndex(0);
    
    // Access API Documentation and get count using page object method
    const documentCount = await apiDocumentationPage.accessApiDocumentationAndGetCount();
    
    // Validate the API Documentation access was successful
    await apiDocumentationPage.validateApiDocumentationAccess(documentCount);
  });
});
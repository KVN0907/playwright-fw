import { test } from '@playwright/test';
import { Document360DocumentationPage } from '../pageObjects/Document360DocumentationPage';
import { Document360OpenSitePage } from '../pageObjects/Document360OpenSitePage';
import Log from '../../utils/Log';

// Documentation Page Flows

test.describe('Document360 Documentation Page Flows', () => {
  test('User can view documentation container and API section', async ({ page }) => {
    // Given user navigates to the documentation page
    const documentationPage = new Document360DocumentationPage(page);
    await page.goto('/documentation');
    await documentationPage.verifyDocumentationContainerVisible();

    // When user clicks the API menu in the side pane
    await documentationPage.clickApiMenu();

    // Then the documentation frame should be loaded
    await documentationPage.verifyFrameLoaded();
    Log.info('Documentation container, API menu, and frame validated successfully');
  });
});

// Open Site Flows

test.describe('Document360 Open Site Flows', () => {
  test('User can open the external site from dashboard', async ({ page }) => {
    // Given user is on the dashboard
    const openSitePage = new Document360OpenSitePage(page);
    await page.goto('/dashboard');

    // When user clicks the open site/external link
    await openSitePage.clickOpenSite();

    // Then the external site should open (validation can be enhanced as needed)
    Log.info('External site link clicked from dashboard');
  });
});

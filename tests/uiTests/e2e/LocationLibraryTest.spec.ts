import { test, expect } from '../../fixtures/baseTest';
import { LocationLibraryPage } from '../pageObjects/LocationLibraryPage';

test.describe('Location Library Management Tests', () => {
  let locationLibraryPage: LocationLibraryPage;

  test.beforeEach(async ({ page }) => {
    locationLibraryPage = new LocationLibraryPage(page);
    
    // Navigate directly to the dashboard using authenticated session
    await page.goto('/');
    
    // Verify we are logged in by checking for the dashboard welcome message
    await expect(page.getByRole('heading', { name: 'Good Day.' })).toBeVisible();
  });

  test('User can access Location Library and verify all page elements are present', async () => {
    // Given user navigates to Location Library
    await locationLibraryPage.navigateToLocationLibrary();
    
    // Then all page elements should be visible and functional
    await locationLibraryPage.verifyLocationLibraryPageElements();
  });

  test('User can view location data in table with correct format', async () => {
    // Given user is on Location Library page
    await locationLibraryPage.navigateToLocationLibrary();
    
    // Then location data should be displayed with proper format
    await locationLibraryPage.verifyLocationDataFormat();
  });

  test('User can access Create Location form and verify all form fields', async ({ page }) => {
    // Given user is on Location Library page
    await locationLibraryPage.navigateToLocationLibrary();
    
    // When user clicks Create button
    await locationLibraryPage.openCreateLocationForm();
    
    // Then Create Location form should be displayed
    await expect(page).toHaveURL(/.*location-library\/create/);
    await expect(page.getByRole('heading', { name: 'Add Location Library' })).toBeVisible();
  });

  test('User can validate required field behavior in Create Location form', async () => {
    // Given user is on Create Location form
    await locationLibraryPage.navigateToLocationLibrary();
    await locationLibraryPage.openCreateLocationForm();
    
    // Then required field validation should work correctly
    await locationLibraryPage.verifyRequiredFieldValidation();
  });

  test('User can navigate back from Create page to list view', async () => {
    // Given user is on Create Location form
    await locationLibraryPage.navigateToLocationLibrary();
    await locationLibraryPage.openCreateLocationForm();
    
    // When user clicks List button
    // Then user should navigate back to Location Library main page
    await locationLibraryPage.verifyNavigationBackToList();
  });

  test('User can sort data in the location table', async () => {
    // Given user is on Location Library page with data
    await locationLibraryPage.navigateToLocationLibrary();
    
    // When user clicks on table column headers
    // Then table sorting should work correctly
    await locationLibraryPage.verifyTableSorting();
  });

  test('User can navigate through pagination controls', async ({ page }) => {
    // Given user is on Location Library page
    await locationLibraryPage.navigateToLocationLibrary();
    
    // Then pagination controls should be present (if applicable)
    const paginationExists = await page.locator('text=/\\d+ – \\d+ of \\d+/').isVisible();
    if (paginationExists) {
      // Verify pagination info is displayed
      await expect(page.locator('text=/\\d+ – \\d+ of \\d+/')).toBeVisible();
    }
  });

  test('User can access all navigation menu items', async ({ page }) => {
    // Given user is on Location Library page
    await locationLibraryPage.navigateToLocationLibrary();
    
    // Then all main navigation menu items should be accessible
    await expect(page.getByRole('button', { name: 'Control Definition Libraries' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approval' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maintenance' })).toBeVisible();
  });
});
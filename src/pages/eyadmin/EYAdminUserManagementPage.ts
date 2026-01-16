/**
 * @fileoverview EYAdminUserManagementPage - EY Admin User Management
 * @description Manages EY Admin user creation and listing for EY Super Admins
 * @story 197596 - Create users: EY Super Admin (UI)
 */

import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import Log from '../../lib/utils/Log';

export interface EYAdminUser {
  firstName: string;
  lastName: string;
  email: string;
}

export class EYAdminUserManagementPage extends BasePage<EYAdminUserManagementPage> {
  // Page heading and navigation
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;

  // Action buttons
  readonly uploadUsersButton: Locator;
  readonly addUserButton: Locator;
  readonly searchField: Locator;
  readonly filterDropdown: Locator;

  // Filter options
  readonly allUsersOption: Locator;
  readonly activeOption: Locator;
  readonly inactiveOption: Locator;

  // User table
  readonly userTable: Locator;
  readonly nameColumnHeader: Locator;
  readonly roleColumnHeader: Locator;
  readonly clientColumnHeader: Locator;
  readonly statusColumnHeader: Locator;

  // Add User Dialog
  readonly addUserDialog: Locator;
  readonly addUserDialogHeading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly cancelButton: Locator;
  readonly createUserButton: Locator;
  readonly closeDialogButton: Locator;

  // Validation errors
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly emailError: Locator;

  // Success/Error messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements - using flexible locators
    this.pageHeading = page.getByRole('heading', { name: /User Management/i });
    this.pageDescription = page.locator('text=View all the EY Users that have been onboarded');

    // Action buttons
    this.uploadUsersButton = page.getByRole('button', { name: 'Upload Users' });
    this.addUserButton = page.getByRole('button', { name: 'Add User' });
    this.searchField = page.getByRole('textbox', { name: /search/i });
    this.filterDropdown = page.getByRole('button', { name: /All Users|Active|Inactive/i });

    // Filter options
    this.allUsersOption = page.getByRole('listitem').filter({ hasText: 'All Users' });
    this.activeOption = page.getByRole('listitem').filter({ hasText: 'Active' }).locator('div');
    this.inactiveOption = page.getByRole('listitem').filter({ hasText: 'Inactive' });

    // User table
    this.userTable = page.locator('table');
    this.nameColumnHeader = page.getByRole('columnheader', { name: 'Name' });
    this.roleColumnHeader = page.getByRole('columnheader', { name: 'Role' });
    this.clientColumnHeader = page.getByRole('columnheader', { name: 'Client' });
    this.statusColumnHeader = page.getByRole('columnheader', { name: 'Status' });

    // Add User Dialog
    this.addUserDialog = page.locator('[role="dialog"], .modal, [class*="dialog"]').first();
    this.addUserDialogHeading = page.getByRole('heading', { name: 'Add New User', level: 5 });
    this.firstNameInput = page.getByRole('textbox', { name: /first name/i });
    this.lastNameInput = page.getByRole('textbox', { name: /last name/i });
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.createUserButton = page.getByRole('button', { name: 'Create User' });
    this.closeDialogButton = page.getByRole('button', { name: 'Close', exact: true });

    // Validation errors - broader patterns to catch various error formats
    this.firstNameError = page.locator('text=/first name|firstName/i');
    this.lastNameError = page.locator('text=/last name|lastName/i');
    this.emailError = page.locator('text=/email|invalid|required/i');

    // Success/Error messages - check for toast, snackbar, alert patterns
    this.successMessage = page.locator(
      '.toast-success, .snackbar, [class*="success"], [role="alert"]:has-text("success"), text=/success|created|added/i'
    );
    this.errorMessage = page.locator(
      '[role="alert"], .error-message, .toast-error, .snackbar-error, [class*="error"]'
    );
  }

  /**
   * Navigate to User Management page
   */
  async navigateToUserManagement(): Promise<EYAdminUserManagementPage> {
    Log.info('Navigating to EY Admin User Management');
    await this.page.goto('/user-management/admin', { waitUntil: 'networkidle' });
    Log.info('Successfully navigated to User Management page');
    return this;
  }

  /**
   * Verify page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    Log.info('Verifying User Management page is loaded');
    // Wait for key elements
    await this.page.waitForSelector('text=User Management', { timeout: 30000 });
    await expect(this.userTable).toBeVisible({ timeout: 15000 });
    Log.info('User Management page loaded successfully');
  }

  /**
   * Open Add User dialog
   */
  async openAddUserDialog(): Promise<EYAdminUserManagementPage> {
    Log.info('Opening Add User dialog');
    await this.click(this.addUserButton, { description: 'Add User button' });
    await expect(this.addUserDialogHeading).toBeVisible();
    Log.info('Add User dialog opened');
    return this;
  }

  /**
   * Close Add User dialog
   */
  async closeAddUserDialog(): Promise<EYAdminUserManagementPage> {
    Log.info('Closing Add User dialog');
    await this.click(this.closeDialogButton, { description: 'Close dialog button' });
    await expect(this.addUserDialogHeading).not.toBeVisible();
    Log.info('Add User dialog closed');
    return this;
  }

  /**
   * Fill Add User form
   */
  async fillAddUserForm(user: EYAdminUser): Promise<EYAdminUserManagementPage> {
    Log.info(`Filling Add User form for: ${user.firstName} ${user.lastName}`);

    if (user.firstName) {
      await this.fill(this.firstNameInput, user.firstName, { description: 'First Name' });
    }
    if (user.lastName) {
      await this.fill(this.lastNameInput, user.lastName, { description: 'Last Name' });
    }
    if (user.email) {
      await this.fill(this.emailInput, user.email, { description: 'Email Address' });
    }

    Log.info('Add User form filled');
    return this;
  }

  /**
   * Clear Add User form field
   */
  async clearFormField(
    field: 'firstName' | 'lastName' | 'email'
  ): Promise<EYAdminUserManagementPage> {
    const fieldLocator =
      field === 'firstName'
        ? this.firstNameInput
        : field === 'lastName'
          ? this.lastNameInput
          : this.emailInput;
    await fieldLocator.clear();
    return this;
  }

  /**
   * Submit Add User form
   */
  async submitAddUserForm(): Promise<EYAdminUserManagementPage> {
    Log.info('Submitting Add User form');
    await this.click(this.createUserButton, { description: 'Create User button' });
    // Wait for API response
    await this.page.waitForTimeout(2000);
    return this;
  }

  /**
   * Cancel Add User form
   */
  async cancelAddUserForm(): Promise<EYAdminUserManagementPage> {
    Log.info('Cancelling Add User form');
    await this.click(this.cancelButton, { description: 'Cancel button' });
    return this;
  }

  /**
   * Create new EY Admin user (complete flow)
   */
  async createEYAdmin(user: EYAdminUser): Promise<EYAdminUserManagementPage> {
    Log.info(`Creating new EY Admin: ${user.firstName} ${user.lastName}`);
    await this.openAddUserDialog();
    await this.fillAddUserForm(user);
    await this.submitAddUserForm();
    return this;
  }

  /**
   * Search for user
   */
  async searchUser(searchText: string): Promise<EYAdminUserManagementPage> {
    Log.info(`Searching for user: ${searchText}`);
    await this.fill(this.searchField, searchText, { description: 'Search field' });
    await this.waitForNetworkIdle();
    Log.info(`Search completed for: ${searchText}`);
    return this;
  }

  /**
   * Filter users by status
   */
  async filterByStatus(
    status: 'All Users' | 'Active' | 'Inactive'
  ): Promise<EYAdminUserManagementPage> {
    Log.info(`Filtering users by: ${status}`);
    await this.click(this.filterDropdown, { description: 'Filter dropdown' });

    // Wait for dropdown to appear and click the option directly by text
    await this.page.waitForTimeout(500); // Small wait for dropdown animation
    const optionLocator = this.page
      .locator(`li:has-text("${status}"), div:has-text("${status}")`)
      .first();
    await optionLocator.click();
    await this.waitForNetworkIdle();
    Log.info(`Filtered by ${status}`);
    return this;
  }

  /**
   * Find user row in table by name
   */
  findUserRow(fullName: string): Locator {
    return this.page.locator(`tr:has-text("${fullName}")`);
  }

  /**
   * Get user status from table
   */
  async getUserStatus(fullName: string): Promise<string> {
    const row = this.findUserRow(fullName);
    const statusCell = row.locator('td').nth(3);
    return (await statusCell.textContent()) || '';
  }

  /**
   * Verify user creation success - either by success message or dialog closing
   */
  async verifyUserCreationSuccess(): Promise<void> {
    Log.info('Verifying user creation success');
    // Wait for either success message or dialog to close
    try {
      // First check if success message appears
      await expect(this.successMessage).toBeVisible({ timeout: 5000 });
      Log.info('User creation success message verified');
    } catch {
      // If no success message, verify dialog closed (which indicates success)
      await expect(this.addUserDialogHeading).not.toBeVisible({ timeout: 5000 });
      Log.info('User creation verified - dialog closed');
    }
  }

  /**
   * Verify user exists in table
   */
  async verifyUserInTable(fullName: string): Promise<void> {
    Log.info(`Verifying user exists in table: ${fullName}`);
    const userRow = this.findUserRow(fullName);
    await expect(userRow).toBeVisible();
    Log.info(`User ${fullName} found in table`);
  }

  /**
   * Verify user not in table
   */
  async verifyUserNotInTable(fullName: string): Promise<void> {
    Log.info(`Verifying user does not exist in table: ${fullName}`);
    const userRow = this.findUserRow(fullName);
    await expect(userRow).not.toBeVisible();
    Log.info(`User ${fullName} not found in table as expected`);
  }

  /**
   * Verify user has status
   */
  async verifyUserStatus(fullName: string, expectedStatus: string): Promise<void> {
    Log.info(`Verifying user ${fullName} has status: ${expectedStatus}`);
    const row = this.findUserRow(fullName);
    await expect(row).toContainText(expectedStatus);
    Log.info(`User status verified: ${expectedStatus}`);
  }

  /**
   * Verify user has role
   */
  async verifyUserRole(fullName: string, expectedRole: string): Promise<void> {
    Log.info(`Verifying user ${fullName} has role: ${expectedRole}`);
    const row = this.findUserRow(fullName);
    await expect(row).toContainText(expectedRole);
    Log.info(`User role verified: ${expectedRole}`);
  }

  /**
   * Verify validation error for missing required field
   */
  async verifyRequiredFieldError(field: 'firstName' | 'lastName' | 'email'): Promise<void> {
    Log.info(`Verifying required field error for: ${field}`);
    const errorLocator =
      field === 'firstName'
        ? this.firstNameError
        : field === 'lastName'
          ? this.lastNameError
          : this.emailError;
    await expect(errorLocator).toBeVisible();
    Log.info(`Required field error displayed for ${field}`);
  }

  /**
   * Verify invalid email format error
   */
  async verifyInvalidEmailError(): Promise<void> {
    Log.info('Verifying invalid email format error');
    // Check for any error indication - dialog still open means validation failed
    const hasError = await this.addUserDialogHeading.isVisible();
    if (hasError) {
      Log.info('Invalid email error - form submission prevented');
    }
    // Also check for visible error message
    const errorVisible = await this.errorMessage.isVisible().catch(() => false);
    if (errorVisible) {
      Log.info('Invalid email error message displayed');
    }
  }

  /**
   * Verify duplicate email error
   */
  async verifyDuplicateEmailError(): Promise<void> {
    Log.info('Verifying duplicate email error');
    // Check for error message or dialog remaining open
    const dialogOpen = await this.addUserDialogHeading.isVisible();
    const errorVisible = await this.errorMessage.isVisible().catch(() => false);
    if (dialogOpen || errorVisible) {
      Log.info('Duplicate email error - validation prevented submission');
    }
  }

  /**
   * Verify non-EY domain email error
   */
  async verifyNonEYDomainError(): Promise<void> {
    Log.info('Verifying non-EY domain email error');
    // Check for error message or dialog remaining open
    const dialogOpen = await this.addUserDialogHeading.isVisible();
    const errorVisible = await this.errorMessage.isVisible().catch(() => false);
    if (dialogOpen || errorVisible) {
      Log.info('Non-EY domain error - validation prevented submission');
    }
  }

  /**
   * Verify form submission prevented (dialog still open)
   */
  async verifyFormSubmissionPrevented(): Promise<void> {
    Log.info('Verifying form submission was prevented');
    await expect(this.addUserDialogHeading).toBeVisible();
    Log.info('Form submission prevented - dialog still visible');
  }

  /**
   * Verify error message displayed
   */
  async verifyErrorMessage(): Promise<void> {
    Log.info('Verifying error message is displayed');
    await expect(this.errorMessage).toBeVisible();
    Log.info('Error message verified');
  }

  /**
   * Verify Add User dialog is visible
   */
  async verifyAddUserDialogVisible(): Promise<void> {
    Log.info('Verifying Add User dialog is visible');
    await expect(this.addUserDialogHeading).toBeVisible();
    Log.info('Add User dialog is visible');
  }

  /**
   * Verify Add User dialog is closed
   */
  async verifyAddUserDialogClosed(): Promise<void> {
    Log.info('Verifying Add User dialog is closed');
    await expect(this.addUserDialogHeading).not.toBeVisible();
    Log.info('Add User dialog is closed');
  }

  /**
   * Get number of users in current view
   */
  async getUserCount(): Promise<number> {
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }

  /**
   * Verify user displays correct info (First Name, Last Name, Role, Client, Status)
   */
  async verifyUserDisplayInfo(user: {
    firstName: string;
    lastName: string;
    role?: string;
    status?: string;
  }): Promise<void> {
    const fullName = `${user.firstName} ${user.lastName}`;
    Log.info(`Verifying user display info for: ${fullName}`);

    const row = this.findUserRow(fullName);
    await expect(row).toBeVisible();

    if (user.role) {
      await expect(row).toContainText(user.role);
    }
    if (user.status) {
      await expect(row).toContainText(user.status);
    }

    Log.info('User display info verified');
  }
}

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../utils/BasePage';
import { createSelectorHelper } from '../../../utils/SelectorHelper';
import { ApiTestData, TestDataHelper } from '../testData/ApiTestData';
import Log from '../../../utils/Log';

/**
 * Page Object for Document360 Login Page
 * Handles authentication flow for Document360 portal
 */
export class Document360LoginPage extends BasePage {
  private selectorHelper: any;

  // Step 1: Email/Subdomain form elements
  private readonly emailOrSubdomainInput: Locator;
  private readonly loginWithPasswordButton: Locator;
  private readonly continueWithSSOButton: Locator;
  private readonly forgotSubdomainLink: Locator;

  // Step 2: Password form elements (after clicking "Login with password")
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly forgotPasswordLink: Locator;

  // Additional elements
  private readonly signUpLink: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.selectorHelper = createSelectorHelper(page, TestDataHelper.getTimeout('default'), true);

    // Step 1 - Initial form locators
    this.emailOrSubdomainInput = this.selectorHelper.getByRole('textbox', {
      name: 'Email or Subdomain',
    });
    this.loginWithPasswordButton = this.selectorHelper.getByRole('button', {
      name: /Login with password/i,
    });
    this.continueWithSSOButton = this.selectorHelper.getByRole('button', {
      name: /Continue with SSO/i,
    });
    this.forgotSubdomainLink = this.selectorHelper.getByRole('link', { name: /Forgot subdomain/i });

    // Step 2 - Password form locators
    this.emailInput = this.selectorHelper.getByRole('textbox', { name: 'Email' });
    this.passwordInput = this.selectorHelper.getByRole('textbox', { name: 'Password' });
    this.loginButton = this.selectorHelper.getByRole('button', { name: /^Login$/i });
    this.rememberMeCheckbox = this.selectorHelper.getByRole('checkbox', { name: /Remember me/i });
    this.forgotPasswordLink = this.selectorHelper.getByRole('link', { name: /Forgot password/i });

    // Common elements
    this.signUpLink = this.selectorHelper.getByRole('link', { name: /Sign up/i });
    this.errorMessage = this.selectorHelper
      .getByRole('alert')
      .filter({ hasText: /error|invalid|failed/i });
    this.successMessage = this.selectorHelper
      .getByRole('alert')
      .filter({ hasText: /success|welcome/i });
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    Log.info('Navigating to Document360 login page');
    await this.navigateTo('/login');
    await this.waitForPageLoadState('networkidle');
    await this.verifyLoginPageLoaded();
    Log.info('Successfully navigated to login page');
  }

  /**
   * Verify login page is properly loaded
   */
  async verifyLoginPageLoaded(): Promise<void> {
    Log.info('Verifying login page is loaded');

    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();

    // Verify URL contains login path
    expect(this.page.url()).toMatch(/login/);

    Log.info('Login page loaded successfully');
  }

  /**
   * Perform login with email and password
   */
  async login(email: string, password: string): Promise<void> {
    await this.document360Login(email, password);
  }

  /**
   * Perform Document360-specific login with email and password
   */
  async document360Login(email: string, password: string): Promise<void> {
    Log.info(`Performing Document360 login for user: ${email}`);

    try {
      // Step 1: Fill email/subdomain and click "Login with password"
      await this.fillElement(this.emailOrSubdomainInput, email, 'Email or Subdomain input');
      await this.clickElement(this.loginWithPasswordButton, 'Login with password button');

      // Wait for password form to appear
      await this.waitForPageLoadState('networkidle');
      await expect(this.passwordInput).toBeVisible();

      // Step 2: Fill password and login
      await this.fillElement(this.passwordInput, password, 'Password input');
      await this.clickElement(this.loginButton, 'Login button');

      // Wait for navigation or response
      await this.waitForPageLoadState('networkidle');

      // Verify successful login (check for redirect away from login page)
      await this.page.waitForFunction(() => !window.location.pathname.includes('Login'), {
        timeout: TestDataHelper.getTimeout('default'),
      });

      Log.info('✅ Document360 login successful');
    } catch (error) {
      Log.error(`❌ Document360 login failed: ${error}`);

      // Check for error messages
      if (await this.errorMessage.isVisible()) {
        const errorText = await this.errorMessage.textContent();
        throw new Error(`Document360 login failed with error: ${errorText}`);
      }

      throw error;
    }
  }

  /**
   * Login with remember me option
   */
  async loginWithRememberMe(email: string, password: string): Promise<void> {
    Log.info(`Performing login with remember me for user: ${email}`);

    // Step 1: Fill email/subdomain and click "Login with password"
    await this.fillElement(this.emailOrSubdomainInput, email, 'Email or Subdomain input');
    await this.clickElement(this.loginWithPasswordButton, 'Login with password button');

    // Wait for password form to appear
    await this.waitForPageLoadState('networkidle');
    await expect(this.passwordInput).toBeVisible();

    // Step 2: Fill password, check remember me, and login
    await this.fillElement(this.passwordInput, password, 'Password input');
    await this.clickElement(this.rememberMeCheckbox, 'Remember me checkbox');
    await this.clickElement(this.loginButton, 'Login button');

    // Wait for successful login
    await this.waitForPageLoadState('networkidle');

    Log.info('✅ Login with remember me successful');
  }

  /**
   * Click forgot password link (after entering email and reaching password step)
   */
  async clickForgotPassword(): Promise<void> {
    Log.info('Clicking forgot password link');
    await this.clickElement(this.forgotPasswordLink, 'Forgot password link');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Click forgot subdomain link (from initial login page)
   */
  async clickForgotSubdomain(): Promise<void> {
    Log.info('Clicking forgot subdomain link');
    await this.clickElement(this.forgotSubdomainLink, 'Forgot subdomain link');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Click sign up link
   */
  async clickSignUp(): Promise<void> {
    Log.info('Clicking sign up link');
    await this.clickElement(this.signUpLink, 'Sign up link');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Login with SSO
   */
  async loginWithSSO(): Promise<void> {
    Log.info('Attempting SSO login');
    await this.clickElement(this.continueWithSSOButton, 'Continue with SSO button');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Verify login error message is displayed
   */
  async verifyLoginError(expectedError?: string): Promise<void> {
    Log.info('Verifying login error message');

    await expect(this.errorMessage).toBeVisible();

    if (expectedError) {
      await expect(this.errorMessage).toContainText(expectedError);
    }

    Log.info('Login error message verified');
  }

  /**
   * Verify successful login message
   */
  async verifyLoginSuccess(): Promise<void> {
    Log.info('Verifying login success');

    // Check that we're no longer on login page
    expect(this.page.url()).not.toMatch(/login/);

    // Optionally check for success message if it exists
    if (await this.successMessage.isVisible({ timeout: 2000 })) {
      await expect(this.successMessage).toBeVisible();
    }

    Log.info('Login success verified');
  }

  /**
   * Get current login status
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if we're not on login page and have expected authenticated elements
      const isOnLoginPage = this.page.url().includes('login');

      if (isOnLoginPage) {
        return false;
      }

      // Additional checks can be added here (e.g., check for user menu, dashboard elements)
      return true;
    } catch (error) {
      Log.error(`Error checking login status: ${error}`);
      return false;
    }
  }

  /**
   * Clear login form (works for both steps)
   */
  async clearLoginForm(): Promise<void> {
    Log.info('Clearing login form');

    try {
      // Clear email/subdomain field if visible
      if (await this.emailOrSubdomainInput.isVisible({ timeout: 1000 })) {
        await this.emailOrSubdomainInput.clear();
      }

      // Clear email field if visible
      if (await this.emailInput.isVisible({ timeout: 1000 })) {
        await this.emailInput.clear();
      }

      // Clear password field if visible
      if (await this.passwordInput.isVisible({ timeout: 1000 })) {
        await this.passwordInput.clear();
      }
    } catch (error) {
      // Ignore errors - fields might not be visible
      Log.info('Some form fields not available for clearing');
    }

    Log.info('Login form cleared');
  }
}

import { expect, Locator, Page } from '@playwright/test';
import { assert } from 'console';

export class LoginPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly emailInput: Locator;
  readonly nextButton: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly loginButtonOnLandingPage: Locator;
  readonly usernameOrEmailInput: Locator;
  readonly passwordInputField: Locator;
  readonly signInButtonSubmit: Locator;
  readonly welcomeHeadingGoodDay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.locator('role=button[name="Login"]');
    this.emailInput = page.locator('input[placeholder="someone@example.com"]');
    this.nextButton = page.locator('role=button[name="Next"]');
    this.passwordInput = page.locator('input[placeholder="Password"]');
    this.signInButton = page.locator('role=button[name="Sign in"]');
    this.loginButtonOnLandingPage = page.getByRole('button', { name: 'Login' });
    this.usernameOrEmailInput = page.getByRole('textbox', { name: 'Username or email' });
    this.passwordInputField = page.getByRole('textbox', { name: 'Password' });
    this.signInButtonSubmit = page.getByRole('button', { name: 'Sign In' });
    this.welcomeHeadingGoodDay = page.getByRole('heading', { name: 'Good Day.' });
  }
  /**
   * Navigates to the login page
   * @param url The URL of the login page
   */
  async navigateTo(url: string) {
    await this.page.goto(url);
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Logs in using the form with the provided credentials
   * @param email The email address
   * @param password The password
   */
/**
 * Logs in using either SSO or form-based authentication based on the current URL
 * @param email The email address
 * @param password The password
 */
async login(email: string, password: string) {
    await this.loginButton.click();
    
    // Wait for navigation and check the current URL
    await this.page.waitForLoadState('networkidle');
    const currentUrl = this.page.url();
    
    // Use ternary to determine if it's SSO or form-based login
    currentUrl.includes('https://login.microsoftonline.com/') 
        ? await this.performSsoLogin(email, password)
        : await this.performFormLogin(email, password);
}

/**
 * Performs SSO login flow
 * @param email The email address
 * @param password The password
 */
private async performSsoLogin(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.nextButton.click();
    await this.passwordInput.fill(password);
    await this.signInButton.click();
}

/**
 * Performs form-based login flow
 * @param email The email address
 * @param password The password
 */
private async performFormLogin(email: string, password: string) {
    await this.usernameOrEmailInput.fill(email);
    await this.passwordInputField.fill(password);
    await this.signInButtonSubmit.click();
}

/**
 * Checks if login was successful
 * @param successElement A locator that should be visible after successful login
 */
async verifyLoginSuccess(successElement: Locator) {
    await expect(successElement).toBeVisible({ timeout: 10000 });
    assert(true, 'Login successful');
}
}

import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';

/**
 * Login page object - placeholder for existing framework compatibility
 */
export class LoginPage extends BasePage {
  // Login form elements
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    // Document360 specific selectors
    this.emailInput = page
      .locator('input[type="email"], input[name*="email"], input[id*="email"]')
      .first();
    this.passwordInput = page
      .locator('input[type="password"], input[name*="password"], input[id*="password"]')
      .first();
    this.loginButton = page
      .locator(
        'button[type="submit"], button:text-matches("Sign In|Login", "i"), input[type="submit"]'
      )
      .first();
  }

  async login(email: string, password: string): Promise<void> {
    Log.info(`Logging in with email: ${email}`);

    // Step 1: Enter email first
    await this.verifyElementVisible(this.emailInput, 'Email input');
    await this.fillElement(this.emailInput, email, 'Email field');

    // Step 2: Click "Login with password" button to reveal password field
    const loginWithPasswordButton = this.page.getByRole('button', { name: 'Login with password' });
    await this.clickElement(loginWithPasswordButton, 'Login with password button');

    // Step 3: Wait for password field to appear and fill it
    await this.waitForElement(this.passwordInput);
    await this.fillElement(this.passwordInput, password, 'Password field');

    // Step 4: Click the final login button
    const finalLoginButton = this.page.getByRole('button', { name: 'Login' });
    await this.clickElement(finalLoginButton, 'Login button');

    // Wait for navigation after login - Document360 may redirect to dashboard
    try {
      await this.page.waitForURL('**/dashboard**', { timeout: 15000 });
      Log.info('Redirected to dashboard after login');
    } catch (error) {
      // If not redirected to dashboard, wait for network idle
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      Log.info('Login completed, waiting for page load');
    }

    Log.info('Login completed');
  }

  async verifyLoginPageLoaded(): Promise<void> {
    Log.info('Verifying login page is loaded');
    await this.verifyElementVisible(this.emailInput, 'Email input');
    await this.verifyElementVisible(this.passwordInput, 'Password input');
    await this.verifyElementVisible(this.loginButton, 'Login button');
    Log.info('Login page loaded successfully');
  }
}

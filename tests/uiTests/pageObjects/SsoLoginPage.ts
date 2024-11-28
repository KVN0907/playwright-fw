import { expect, Locator, Page } from '@playwright/test';

export class SsoLoginPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly emailInput: Locator;
  readonly nextButton: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.locator('role=button[name="Login"]');
    this.emailInput = page.locator('input[placeholder="someone@example.com"]');
    this.nextButton = page.locator('role=button[name="Next"]');
    this.passwordInput = page.locator('input[placeholder="Password"]');
    this.signInButton = page.locator('role=button[name="Sign in"]');
  }

   async login(email: string, password: string) {
    await this.loginButton.click();
    await this.emailInput.fill(email);
    await this.nextButton.click();
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}

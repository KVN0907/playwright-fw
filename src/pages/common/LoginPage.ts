/**
 * @fileoverview Advanced Login Page with Modern TypeScript Patterns
 * @description Type-safe login page with fluent interface, strategy pattern, and enhanced error handling
 * @version 2.0
 */

import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../lib/Log';

/* ===== ADVANCED TYPES ===== */

/** Login credentials interface with validation */
interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

/** Login strategy interface for different authentication methods */
interface LoginStrategy {
  readonly name: string;
  canHandle(url: string): boolean;
  execute(credentials: LoginCredentials, elements: LoginElements): Promise<void>;
}

/** Consolidated element selectors with type safety */
interface LoginElements {
  readonly landing: {
    readonly loginButton: Locator;
    readonly welcomeHeading: Locator;
  };
  readonly sso: {
    readonly emailInput: Locator;
    readonly nextButton: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
  };
  readonly form: {
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
  };
}

/* ===== LOGIN STRATEGIES ===== */

/** SSO login strategy for Microsoft/Azure AD */
class SSOLoginStrategy implements LoginStrategy {
  readonly name = 'SSO';

  canHandle(url: string): boolean {
    return url.includes('login.microsoftonline.com') || url.includes('azuread');
  }

  async execute(credentials: LoginCredentials, elements: LoginElements): Promise<void> {
    Log.info('🔐 Executing SSO login strategy');

    const { sso } = elements;
    await sso.emailInput.fill(credentials.email);
    await sso.nextButton.click();
    await sso.passwordInput.fill(credentials.password);
    await sso.signInButton.click();
  }
}

/** Form-based login strategy */
class FormLoginStrategy implements LoginStrategy {
  readonly name = 'Form';

  canHandle(url: string): boolean {
    return !url.includes('login.microsoftonline.com');
  }

  async execute(credentials: LoginCredentials, elements: LoginElements): Promise<void> {
    Log.info('📝 Executing form-based login strategy');

    const { form } = elements;
    await form.usernameInput.fill(credentials.email);
    await form.passwordInput.fill(credentials.password);
    await form.signInButton.click();
  }
}

/* ===== ENHANCED LOGIN PAGE CLASS ===== */

/**
 * @class LoginPage
 * @extends BasePage
 * @description Advanced login page with strategy pattern and fluent interface
 */
export class LoginPage extends BasePage<LoginPage> {
  private readonly elements: LoginElements;
  private readonly strategies: readonly LoginStrategy[];

  constructor(page: Page) {
    super(page);

    // Initialize element selectors with caching
    this.elements = {
      landing: {
        loginButton: this.getLocator('role=button[name="Login"]', 'landingLogin'),
        welcomeHeading: this.getLocator('[role="heading"][name*="Good Day"]', 'welcome'),
      },
      sso: {
        emailInput: this.getLocator('input[placeholder*="someone@example"]', 'ssoEmail'),
        nextButton: this.getLocator('role=button[name="Next"]', 'ssoNext'),
        passwordInput: this.getLocator('input[placeholder="Password"]', 'ssoPassword'),
        signInButton: this.getLocator('role=button[name="Sign in"]', 'ssoSignIn'),
      },
      form: {
        usernameInput: this.getLocator('[role="textbox"][name*="Username"]', 'formUsername'),
        passwordInput: this.getLocator('[role="textbox"][name="Password"]', 'formPassword'),
        signInButton: this.getLocator('role=button[name="Sign In"]', 'formSignIn'),
      },
    };

    // Initialize login strategies
    this.strategies = [new SSOLoginStrategy(), new FormLoginStrategy()] as const;
  }

  /* ===== PUBLIC API METHODS ===== */

  /**
   * @description Navigate to login page and verify page load with fluent interface
   * @param url - Login page URL
   * @returns Fluent interface for method chaining
   */
  async navigateToLogin(url: string): Promise<LoginPage> {
    await this.navigateTo(url);
    await this.verifyVisible(this.elements.landing.loginButton);
    return this;
  }

  /**
   * @description Execute login using strategy pattern with type-safe credentials
   * @param credentials - Login credentials object or email/password
   * @returns Fluent interface for method chaining
   */
  async login(
    credentialsOrEmail: LoginCredentials | string,
    password?: string
  ): Promise<LoginPage> {
    Log.info('🚀 Initiating login process');

    const credentials: LoginCredentials =
      typeof credentialsOrEmail === 'string'
        ? { email: credentialsOrEmail, password: password! }
        : credentialsOrEmail;

    // Click initial login button
    await this.click(this.elements.landing.loginButton, {
      description: 'Landing page login button',
    });

    // Wait for navigation and determine strategy
    await this.waitForLoad('networkidle');
    const currentUrl = this.page.url();

    // Find and execute appropriate strategy
    const strategy = this.strategies.find(s => s.canHandle(currentUrl));
    if (!strategy) {
      throw new Error(`No login strategy found for URL: ${currentUrl}`);
    }

    Log.info(`📋 Using ${strategy.name} login strategy`);
    await strategy.execute(credentials, this.elements);

    return this;
  }

  /**
   * @description Verify successful login with enhanced assertion options
   * @param successElement - Element that should be visible after login
   * @param timeout - Maximum wait time for verification
   * @returns Fluent interface for method chaining
   */
  async verifyLoginSuccess(successElement?: Locator, timeout = 10000): Promise<LoginPage> {
    const elementToVerify = successElement || this.elements.landing.welcomeHeading;

    Log.info('🔍 Verifying successful login');
    await this.waitForElement(elementToVerify, 'visible', timeout);
    await this.verifyVisible(elementToVerify);

    return this;
  }

  /**
   * @description Get current authentication state with comprehensive information
   * @returns Promise with authentication information
   */
  async getAuthState(): Promise<{
    isLoggedIn: boolean;
    currentUrl: string;
    authMethod: string;
  }> {
    const currentUrl = this.page.url();
    const strategy = this.strategies.find(s => s.canHandle(currentUrl));

    return {
      isLoggedIn: !currentUrl.includes('login'),
      currentUrl,
      authMethod: strategy?.name || 'Unknown',
    };
  }
}

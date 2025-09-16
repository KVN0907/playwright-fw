import { Page, Locator } from '@playwright/test';
import Log from './Log';

/**
 * SelectorHelper class provides methods to locate elements using Playwright's recommended locator priority.
 *
 * Priority order (as recommended by Playwright):
 * 1. getByRole() - Most accessible, recommended for interactive elements
 * 2. getByLabel() - Good for form controls with labels
 * 3. getByPlaceholder() - Useful for input fields
 * 4. getByText() - Good for text content
 * 5. getByAltText() - For images with alt text
 * 6. getByTitle() - For elements with title attributes
 * 7. getByTestId() - Last resort, but very reliable for testing
 */
export class SelectorHelper {
  private readonly page: Page;
  private readonly defaultTimeout: number;
  private readonly retryConfig: { attempts: number; delay: number };
  private readonly debugMode: boolean;

  constructor(page: Page, timeout: number = 30000, debugMode: boolean = false) {
    this.page = page;
    this.defaultTimeout = timeout;
    this.retryConfig = { attempts: 3, delay: 1000 };
    this.debugMode = debugMode;
  }

  private debug(message: string): void {
    if (this.debugMode) {
      Log.info(`[DEBUG] ${message}`);
    }
  }

  private warn(message: string): void {
    Log.info(`[WARN] ${message}`);
  }

  /**
   * 1. Get element by role (highest priority)
   * @param role - ARIA role
   * @param options - Additional options like name, level, etc.
   */
  getByRole(
    role: string,
    options?: {
      name?: string | RegExp;
      exact?: boolean;
      level?: number;
      pressed?: boolean;
      checked?: boolean;
      selected?: boolean;
      expanded?: boolean;
      includeHidden?: boolean;
    }
  ): Locator {
    this.debug(
      `Finding element by role: ${role}${options?.name ? ` with name: ${options.name}` : ''}`
    );
    return this.page.getByRole(role as any, options);
  }

  /**
   * 2. Get element by label (second priority)
   * @param text - Label text
   * @param options - Additional options
   */
  getByLabel(text: string | RegExp, options?: { exact?: boolean }): Locator {
    this.debug(`Finding element by label: ${text}`);
    return this.page.getByLabel(text, options);
  }

  /**
   * 3. Get element by placeholder (third priority)
   * @param text - Placeholder text
   * @param options - Additional options
   */
  getByPlaceholder(text: string | RegExp, options?: { exact?: boolean }): Locator {
    this.debug(`Finding element by placeholder: ${text}`);
    return this.page.getByPlaceholder(text, options);
  }

  /**
   * 4. Get element by text (fourth priority)
   * @param text - Text content
   * @param options - Additional options
   */
  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    this.debug(`Finding element by text: ${text}`);
    return this.page.getByText(text, options);
  }

  /**
   * 5. Get element by alt text (fifth priority)
   * @param text - Alt text
   * @param options - Additional options
   */
  getByAltText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    this.debug(`Finding element by alt text: ${text}`);
    return this.page.getByAltText(text, options);
  }

  /**
   * 6. Get element by title (sixth priority)
   * @param text - Title text
   * @param options - Additional options
   */
  getByTitle(text: string | RegExp, options?: { exact?: boolean }): Locator {
    this.debug(`Finding element by title: ${text}`);
    return this.page.getByTitle(text, options);
  }

  /**
   * 7. Get element by test ID (seventh priority, but reliable)
   * @param testId - Test ID
   */
  getByTestId(testId: string): Locator {
    this.debug(`Finding element by test ID: ${testId}`);
    return this.page.getByTestId(testId);
  }

  /**
   * Smart selector that tries multiple strategies in priority order
   * @param options - Selector options with different strategies
   */
  getSmartSelector(options: {
    role?: { role: string; name?: string | RegExp; [key: string]: any };
    label?: string | RegExp;
    placeholder?: string | RegExp;
    text?: string | RegExp;
    altText?: string | RegExp;
    title?: string | RegExp;
    testId?: string;
    fallbackSelector?: string;
  }): Locator {
    this.debug('Using smart selector with priority-based fallback');

    // Try in priority order
    if (options.role && options.role.role) {
      const locator = this.getByRole(options.role.role, options.role);
      this.debug('Trying role selector first (highest priority)');
      return locator;
    }

    if (options.label) {
      this.debug('Trying label selector (second priority)');
      return this.getByLabel(options.label);
    }

    if (options.placeholder) {
      this.debug('Trying placeholder selector (third priority)');
      return this.getByPlaceholder(options.placeholder);
    }

    if (options.text) {
      this.debug('Trying text selector (fourth priority)');
      return this.getByText(options.text);
    }

    if (options.altText) {
      this.debug('Trying alt text selector (fifth priority)');
      return this.getByAltText(options.altText);
    }

    if (options.title) {
      this.debug('Trying title selector (sixth priority)');
      return this.getByTitle(options.title);
    }

    if (options.testId) {
      this.debug('Trying test ID selector (seventh priority)');
      return this.getByTestId(options.testId);
    }

    if (options.fallbackSelector) {
      this.warn('Using fallback CSS/XPath selector (not recommended)');
      return this.page.locator(options.fallbackSelector);
    }

    throw new Error('No valid selector options provided');
  }

  /**
   * Find element with retry logic and multiple selector strategies
   * @param options - Selector options
   * @param action - Optional action to perform after finding element
   */
  async findElementWithRetry(
    options: Parameters<typeof this.getSmartSelector>[0],
    action?: (locator: Locator) => Promise<void>
  ): Promise<Locator> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryConfig.attempts; attempt++) {
      try {
        this.debug(`Attempt ${attempt}/${this.retryConfig.attempts} to find element`);

        const locator = this.getSmartSelector(options);

        // Wait for element to be visible
        await locator.waitFor({
          state: 'visible',
          timeout: this.defaultTimeout / this.retryConfig.attempts,
        });

        if (action) {
          await action(locator);
        }

        this.debug('Element found and action completed successfully');
        return locator;
      } catch (error) {
        lastError = error as Error;
        this.warn(`Attempt ${attempt} failed: ${error}`);

        if (attempt < this.retryConfig.attempts) {
          this.debug(`Waiting ${this.retryConfig.delay}ms before retry`);
          await this.page.waitForTimeout(this.retryConfig.delay);
        }
      }
    }

    Log.error(`Failed to find element after ${this.retryConfig.attempts} attempts`);
    throw lastError || new Error('Element not found');
  }

  /**
   * Wait for any of multiple selectors to be visible
   * @param selectors - Array of selector options
   * @param timeout - Optional timeout
   */
  async waitForAnySelector(
    selectors: Array<Parameters<typeof this.getSmartSelector>[0]>,
    timeout?: number
  ): Promise<{ locator: Locator; index: number }> {
    this.debug(`Waiting for any of ${selectors.length} selectors to be visible`);

    const promises = selectors.map((selector, index) =>
      this.getSmartSelector(selector)
        .waitFor({ state: 'visible', timeout: timeout || this.defaultTimeout })
        .then(() => ({ locator: this.getSmartSelector(selector), index }))
    );

    try {
      const result = await Promise.race(promises);
      this.debug(`Selector at index ${result.index} became visible first`);
      return result;
    } catch (error) {
      Log.error('None of the selectors became visible within timeout');
      throw new Error(
        `None of the provided selectors became visible within ${timeout || this.defaultTimeout}ms`
      );
    }
  }

  /**
   * Get multiple elements matching the selector
   * @param options - Selector options
   */
  async getAllElements(options: Parameters<typeof this.getSmartSelector>[0]): Promise<Locator[]> {
    const locator = this.getSmartSelector(options);
    const count = await locator.count();

    this.debug(`Found ${count} elements matching the selector`);

    const elements: Locator[] = [];
    for (let i = 0; i < count; i++) {
      elements.push(locator.nth(i));
    }

    return elements;
  }

  /**
   * Check if element exists (without waiting)
   * @param options - Selector options
   */
  async elementExists(options: Parameters<typeof this.getSmartSelector>[0]): Promise<boolean> {
    try {
      const locator = this.getSmartSelector(options);
      const count = await locator.count();
      const exists = count > 0;
      this.debug(`Element exists: ${exists}`);
      return exists;
    } catch (error) {
      this.debug(`Element existence check failed: ${error}`);
      return false;
    }
  }

  /**
   * Get element text content using smart selector
   * @param options - Selector options
   */
  async getElementText(options: Parameters<typeof this.getSmartSelector>[0]): Promise<string> {
    const locator = await this.findElementWithRetry(options);
    const text = (await locator.textContent()) || '';
    this.debug(`Element text: ${text}`);
    return text;
  }

  /**
   * Click element using smart selector with retry
   * @param options - Selector options
   * @param clickOptions - Click options
   */
  async clickElement(
    options: Parameters<typeof this.getSmartSelector>[0],
    clickOptions?: { force?: boolean; timeout?: number; button?: 'left' | 'right' | 'middle' }
  ): Promise<void> {
    Log.info(`Clicking element with smart selector`);
    await this.findElementWithRetry(options, async locator => {
      await locator.click(clickOptions);
    });
  }

  /**
   * Fill input using smart selector with retry
   * @param options - Selector options
   * @param value - Value to fill
   * @param fillOptions - Fill options
   */
  async fillElement(
    options: Parameters<typeof this.getSmartSelector>[0],
    value: string,
    fillOptions?: { force?: boolean; timeout?: number }
  ): Promise<void> {
    Log.info(`Filling element with value: ${value}`);
    await this.findElementWithRetry(options, async locator => {
      await locator.fill(value, fillOptions);
    });
  }

  /**
   * Hover over element using smart selector with retry
   * @param options - Selector options
   * @param hoverOptions - Hover options
   */
  async hoverElement(
    options: Parameters<typeof this.getSmartSelector>[0],
    hoverOptions?: { force?: boolean; timeout?: number }
  ): Promise<void> {
    Log.info('Hovering over element with smart selector');
    await this.findElementWithRetry(options, async locator => {
      await locator.hover(hoverOptions);
    });
  }
}

/**
 * Factory function to create SelectorHelper instance
 * @param page - Playwright page object
 * @param timeout - Default timeout for operations
 * @param debugMode - Enable debug logging
 */
export function createSelectorHelper(
  page: Page,
  timeout?: number,
  debugMode?: boolean
): SelectorHelper {
  return new SelectorHelper(page, timeout, debugMode);
}

// Export common selector patterns
export const CommonSelectors = {
  // Form elements
  submitButton: { role: { role: 'button', name: /submit|send|save/i } },
  cancelButton: { role: { role: 'button', name: /cancel|close|back/i } },
  loginButton: { role: { role: 'button', name: /login|sign in/i } },
  logoutButton: { role: { role: 'button', name: /logout|sign out/i } },

  // Navigation
  homeLink: { role: { role: 'link', name: /home/i } },
  backButton: { role: { role: 'button', name: /back|previous/i } },
  nextButton: { role: { role: 'button', name: /next|continue/i } },

  // Common inputs
  emailInput: { label: /email/i, placeholder: /email/i, testId: 'email-input' },
  passwordInput: { label: /password/i, placeholder: /password/i, testId: 'password-input' },
  searchInput: { role: { role: 'searchbox' }, placeholder: /search/i, testId: 'search-input' },

  // Modal/Dialog
  modal: { role: { role: 'dialog' } },
  modalCloseButton: { role: { role: 'button', name: /close|×/i } },

  // Loading states
  loadingSpinner: { role: { role: 'status' }, text: /loading/i, testId: 'loading-spinner' },

  // Error messages
  errorMessage: { role: { role: 'alert' }, testId: 'error-message' },
  successMessage: { role: { role: 'status' }, testId: 'success-message' },
};

// Document360 specific selectors
export const Document360Selectors = {
  // Dashboard elements
  dashboard: {
    projectsSection: { text: 'Your projects' },
    // userProfile: { role: { role: 'button', name: 'KR' } }, // Removed - not needed for testing
    helpButton: { role: { role: 'button', name: /HELP/i } },
    notificationButton: { role: { role: 'button', name: /\d+/ } }, // Button with number
    createProjectButton: { role: { role: 'button', name: '+ Project' } },
  },

  // Project tile elements - based on actual page analysis
  projectTile: {
    // Individual project tile containers - found as listitem elements
    container: { role: { role: 'listitem' } },

    // Alternative containers with c-area class (based on Pet Store analysis)
    areaContainer: { fallbackSelector: '.c-area' },

    // Project tile content elements
    projectName: { text: /Pet Store API Testing/ }, // Specific known project
    genericProjectName: { fallbackSelector: '[class*="project"] *' }, // Any project name

    trialStatus: { text: /Trial|Free|Premium|Pro/ },
    privateLabel: { text: /Private|Public/ },
    version: { role: { role: 'button', name: /v1|v1-api/ } },
    createButton: { role: { role: 'button', name: 'Create' } },
    trialInfo: { role: { role: 'button', name: /Trial Ends in \d+ days/ } },
    openSiteLink: { role: { role: 'link', name: /OPEN SITE/i } },

    // Hover actions on project tiles - these appear when hovering over the listitem
    settingsButton: {
      fallbackSelector: 'button[title*="Settings"], a[href*="settings"], [class*="settings"]',
    },
    documentationButton: {
      fallbackSelector: 'button[title*="Documentation"], a[href*="document"], [class*="document"]',
    },
    openSiteButton: {
      fallbackSelector:
        'a[title*="Open Site"], a[aria-label*="Open Site"], a[href*="document360.io"]',
    },

    // All action buttons within a project tile
    actionButtons: { fallbackSelector: 'button, a[role="button"]' },
  },

  // Project navigation menu
  projectMenu: {
    contributorDashboard: { role: { role: 'link', name: '' } },
    documents: { role: { role: 'link', name: '' } },
    decisionTree: { role: { role: 'link', name: '' } },
    apiDocumentation: { role: { role: 'link', name: '' } },
    feedbackManager: { role: { role: 'link', name: '' } },
    analytics: { role: { role: 'link', name: '' } },
    widgets: { role: { role: 'link', name: '' } },
    drive: { role: { role: 'link', name: '' } },
    settings: { role: { role: 'link', name: '' } },
  },

  // Project header elements
  projectHeader: {
    title: { text: /Pet Store API Testing/ },
    versionSelector: { role: { role: 'button', name: /v1|v1-api/ } },
    createButton: { role: { role: 'button', name: 'Create' } },
    trialBanner: { role: { role: 'button', name: /Trial Ends in \d+ days/ } },
    openSiteButton: { role: { role: 'link', name: /OPEN SITE/i } },
  },
};

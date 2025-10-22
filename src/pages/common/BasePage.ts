/**
 * @fileoverview Advanced BasePage with Modern TypeScript Patterns
 * @description Type-safe, fluent interface page object base class with decorators and generics
 * @version 2.0
 */

import { Locator, Page, expect } from '@playwright/test';
import Log from '../../lib/Log';
import { Utils } from '../../lib/Utils';

/* ===== ADVANCED TYPES & INTERFACES ===== */

/** Load state union type for better type safety */
type LoadState = 'load' | 'domcontentloaded' | 'networkidle';

/** Element state for waiting operations */
type ElementState = 'attached' | 'detached' | 'visible' | 'hidden';

/** Navigation options with advanced configuration */
interface NavigationOptions {
  readonly waitUntil?: LoadState;
  readonly timeout?: number;
  readonly referer?: string;
}

/** Interaction options for element operations */
interface InteractionOptions {
  readonly timeout?: number;
  readonly force?: boolean;
  readonly description?: string;
  readonly retries?: number;
}

/** Screenshot configuration */
interface ScreenshotConfig {
  readonly path?: string;
  readonly fullPage?: boolean;
  readonly quality?: number;
  readonly type?: 'png' | 'jpeg';
}

/** Generic assertion result type */
type AssertionResult<T = void> = Promise<T>;

/* ===== DECORATORS ===== */

/**
 * @decorator LogAction
 * @description Automatically logs method calls with parameters
 */
function LogAction(action: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const description = args.find(arg => typeof arg === 'string') || propertyKey;
      Log.info(`🎬 ${action}: ${description}`);
      
      try {
        const result = await originalMethod.apply(this, args);
        Log.info(`✅ ${action} completed successfully`);
        return result;
      } catch (error) {
        Log.error(`❌ ${action} failed: ${error}`);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * @decorator Retry
 * @description Automatically retries failed operations
 */
function Retry(maxRetries: number = 3) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      
      for (let i = 0; i <= maxRetries; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          if (i < maxRetries) {
            Log.info(`🔄 Retrying ${propertyKey} (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      throw lastError!;
    };
    
    return descriptor;
  };
}

/* ===== ADVANCED BASE PAGE CLASS ===== */

/**
 * @abstract BasePage
 * @description Advanced base class with fluent interface, type safety, and modern patterns
 * @template TPage - Generic page type for type-safe chaining
 */
export abstract class BasePage<TPage extends BasePage<any> = any> {
  protected readonly page: Page;
  protected readonly baseURL: string;
  
  /** Cache for frequently accessed elements */
  private readonly elementCache = new Map<string, Locator>();

  constructor(page: Page) {
    this.page = page;
    this.baseURL = Utils.Environment.get('BASE_URL') || 'http://localhost:3000';
  }

  /* ===== FLUENT NAVIGATION METHODS ===== */

  /**
   * @description Navigate to path with advanced options and fluent chaining
   * @param path - URL path to navigate to
   * @param options - Navigation configuration
   * @returns Fluent interface for method chaining
   */
  async navigateTo(path: string, options: NavigationOptions = {}): Promise<TPage> {
    Log.info(`🧭 Navigation: ${path}`);
    const { waitUntil = 'load', timeout = 30000, referer } = options;
    const url = `${this.baseURL}${path}`;
    
    await this.page.goto(url, { waitUntil, timeout, referer });
    return this as unknown as TPage;
  }

  /**
   * @description Wait for load state with method chaining
   * @param state - Load state to wait for
   * @param timeout - Maximum wait time
   * @returns Fluent interface
   */
  async waitForLoad(state: LoadState = 'load', timeout?: number): Promise<TPage> {
    await this.page.waitForLoadState(state, { timeout });
    return this as unknown as TPage;
  }

  /* ===== ADVANCED ELEMENT INTERACTIONS ===== */

  /**
   * @description Get cached or create new locator
   * @param selector - Element selector
   * @param cacheKey - Optional cache key
   * @returns Locator instance
   */
  protected getLocator(selector: string, cacheKey?: string): Locator {
    const key = cacheKey || selector;
    
    if (!this.elementCache.has(key)) {
      this.elementCache.set(key, this.page.locator(selector));
    }
    
    return this.elementCache.get(key)!;
  }

  /**
   * @description Enhanced element interaction with retry and error handling
   * @param locator - Element locator
   * @param options - Interaction options
   * @returns Promise for chaining
   */
  async waitForElement(
    locator: Locator, 
    state: ElementState = 'visible', 
    timeout = 10000
  ): Promise<void> {
    await locator.waitFor({ state, timeout });
  }

  /**
   * @description Type-safe click with fluent interface
   * @param locator - Element to click
   * @param options - Click options
   * @returns Fluent interface
   */
  async click(locator: Locator, options: InteractionOptions = {}): Promise<TPage> {
    Log.info(`🖱️ Click: ${options.description || 'Element click'}`);
    const { timeout = 10000, force = false } = options;
    
    await this.waitForElement(locator, 'visible', timeout);
    await locator.click({ force, timeout });
    
    return this as unknown as TPage;
  }

  /**
   * @description Type-safe fill with validation
   * @param locator - Input element
   * @param text - Text to fill
   * @param options - Fill options
   * @returns Fluent interface
   */
  async fill(locator: Locator, text: string, options: InteractionOptions = {}): Promise<TPage> {
    Log.info(`⌨️ Fill: ${options.description || 'Element fill'}`);
    const { timeout = 10000 } = options;
    
    await this.waitForElement(locator, 'visible', timeout);
    await locator.fill(text);
    
    // Verify text was actually filled
    await expect(locator).toHaveValue(text);
    
    return this as unknown as TPage;
  }

  /* ===== ADVANCED ASSERTIONS ===== */

  /**
   * @description Fluent text verification with multiple strategies
   * @param locator - Element to verify
   * @param expectedText - Expected text content
   * @param description - Optional verification description
   * @returns Assertion result
   */
  async verifyText(locator: Locator, expectedText: string | RegExp, description?: string): AssertionResult {
    const actualText = await locator.textContent();
    Log.info(`🔍 Verifying text: ${description || 'Text verification'}`);
    
    if (typeof expectedText === 'string' && actualText?.includes(expectedText)) {
      Log.info(`✅ Text verification passed: "${expectedText}"`);
    } else if (expectedText instanceof RegExp && actualText && expectedText.test(actualText)) {
      Log.info(`✅ Text verification passed: ${expectedText}`);
    } else {
      Log.error(`❌ Text verification failed. Expected: "${expectedText}", Actual: "${actualText}"`);
    }
    
    await expect(locator).toContainText(expectedText);
  }

  /**
   * @description Enhanced visibility verification
   * @param locator - Element to verify
   * @returns Assertion result
   */
  async verifyVisible(locator: Locator): AssertionResult {
    await expect(locator).toBeVisible();
  }

  /**
   * @description Batch element verification
   * @param elements - Map of description to locator
   * @returns Promise resolving when all verifications complete
   */
  async verifyElements(elements: Record<string, Locator>): Promise<void> {
    const verifications = Object.entries(elements).map(async ([desc, locator]) => {
      Log.info(`🔍 Verifying ${desc}`);
      await this.verifyVisible(locator);
    });
    
    await Promise.all(verifications);
  }

  /* ===== UTILITY METHODS ===== */

  /**
   * @description Enhanced screenshot with automatic naming and paths
   * @param config - Screenshot configuration
   * @returns Promise with screenshot path
   */
  async capture(config: ScreenshotConfig = {}): Promise<string> {
    Log.info(`📸 Taking screenshot: ${config.path || 'auto-generated'}`);
    const timestamp = Utils.DateTime.generate('YYYY-MM-DD_HH-mm-ss', {});
    const { 
      path = `test-results/screenshots/${this.constructor.name}-${timestamp}.png`,
      fullPage = true,
      quality = 90,
      type = 'png'
    } = config;
    
    await this.page.screenshot({ path, fullPage, quality, type });
    return path;
  }

  /**
   * @description Get page information with type safety
   * @returns Promise with page metadata
   */
  async getPageInfo(): Promise<{
    title: string;
    url: string;
    viewport: { width: number; height: number } | null;
  }> {
    const [title, url, viewport] = await Promise.all([
      this.page.title(),
      Promise.resolve(this.page.url()),
      this.page.viewportSize()
    ]);
    
    return { title, url, viewport };
  }

  /**
   * @description Enhanced URL waiting with pattern matching
   * @param pattern - URL pattern or regex
   * @param timeout - Maximum wait time
   * @returns Fluent interface
   */
  async waitForURL(pattern: string | RegExp, timeout = 30000): Promise<TPage> {
    await this.page.waitForURL(pattern, { timeout });
    return this as unknown as TPage;
  }

  /* ===== COMPATIBILITY METHODS ===== */

  /**
   * @description Click element with advanced options
   * @param locator - Element locator
   * @param description - Action description for logging
   * @param options - Click options
   */
  async clickElement(locator: Locator, description?: string, options?: InteractionOptions): Promise<TPage> {
    Log.info(`🎬 Click: ${description || 'Element click'}`);
    await this.click(locator, options);
    return this as unknown as TPage;
  }

  /**
   * @description Fill element with text
   * @param locator - Element locator  
   * @param text - Text to fill
   * @param description - Action description for logging
   * @param options - Fill options
   */
  async fillElement(locator: Locator, text: string, description?: string, options?: InteractionOptions): Promise<TPage> {
    Log.info(`🎬 Fill: ${description || 'Element fill'}`);
    await this.fill(locator, text, options);
    return this as unknown as TPage;
  }

  /**
   * @description Wait for load state (compatibility method)
   * @param state - Load state to wait for
   * @param timeout - Maximum wait time
   */
  async waitForLoadState(state: LoadState = 'networkidle', timeout?: number): Promise<void> {
    await this.page.waitForLoadState(state, { timeout });
  }
}

/**
 * @fileoverview Consolidated Utility Module with Advanced TypeScript Patterns
 * @description Combines date, environment, string, and common utilities using modern TS features
 * @version 2.0
 */

import { Page } from '@playwright/test';
import moment from 'moment';

/* ===== ADVANCED TYPESCRIPT TYPES ===== */

/** Template literal type for date formats */
type DateFormat = `${string}-${string}-${string}` | `${string}/${string}/${string}` | string;

/** Template literal type for time formats */
type TimeFormat = `${string}:${string}` | `${string}:${string}:${string}` | string;

/** Utility type for date/time adjustments */
type DateTimeAdjustment = {
  readonly days?: number;
  readonly months?: number;
  readonly years?: number;
  readonly hours?: number;
  readonly minutes?: number;
};

/** Generic utility type for configuration objects */
type Config<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: T[K];
};

/** Environment configuration type */
interface EnvConfig
  extends Config<{
    testEnv?: string;
    override?: boolean;
    path?: string;
  }> {}

/* ===== ADVANCED UTILITY CLASSES ===== */

/**
 * @class DateTimeUtils
 * @description Advanced date/time utilities with type safety and functional approach
 */
export class DateTimeUtils {
  /**
   * @description Generate date with fluent interface and type safety
   * @param format - Date format string
   * @param adjustments - Object containing date adjustments
   * @returns Formatted date string
   */
  static generate(format: DateFormat, adjustments: DateTimeAdjustment = {}): string {
    const { days = 0, months = 0, years = 0 } = adjustments;
    return moment().add(days, 'd').add(months, 'M').add(years, 'y').format(format);
  }

  /**
   * @description Customize existing date with functional composition
   * @param date - Base date string
   * @param format - Date format
   * @param adjustments - Adjustments to apply
   * @returns Customized date string
   */
  static customize(date: string, format: DateFormat, adjustments: DateTimeAdjustment): string {
    const { days = 0, months = 0, years = 0 } = adjustments;
    return moment(date, format).add(days, 'd').add(months, 'M').add(years, 'y').format(format);
  }

  /**
   * @description Generate time with type-safe format
   * @param format - Time format string
   * @param adjustments - Time adjustments
   * @returns Formatted time string
   */
  static generateTime(
    format: TimeFormat,
    adjustments: Pick<DateTimeAdjustment, 'hours' | 'minutes'> = {}
  ): string {
    const { hours = 0, minutes = 0 } = adjustments;
    return moment().add(minutes, 'm').add(hours, 'h').format(format);
  }
}

/**
 * @class EnvironmentUtils
 * @description Environment configuration with type safety and validation
 */
export class EnvironmentUtils {
  private static readonly DEFAULT_CONFIG: EnvConfig = {
    testEnv: process.env.TEST_ENV,
    override: Boolean(process.env.TEST_ENV),
    path: process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env',
  } as const;

  /**
   * @description Configure environment with type-safe options
   * @param config - Optional configuration overrides
   */
  static configure(config: Partial<EnvConfig> = {}): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    require('dotenv').config({
      path: finalConfig.path,
      override: finalConfig.override,
    });
  }

  /**
   * @description Get environment variable with type assertion
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   * @returns Environment variable value or default
   */
  static get<T extends string = string>(key: string, defaultValue?: T): T | undefined {
    return (process.env[key] as T) ?? defaultValue;
  }

  /**
   * @description Validate required environment variables
   * @param requiredVars - Array of required variable names
   * @throws Error if any required variables are missing
   */
  static validateRequired(requiredVars: readonly string[]): void {
    const missing = requiredVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

/**
 * @class StringUtils
 * @description Advanced string generation utilities with templates and validation
 */
export class StringUtils {
  private static readonly CHARSET = {
    ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    NUMERIC: '0123456789',
    SPECIAL: '.-_@#$%&*!',
    CUSTOM: 'AutoQAABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-',
  } as const;

  /**
   * @description Generate random string with configurable character set
   * @param length - String length
   * @param charset - Character set to use
   * @returns Random string
   */
  static generate(
    length: number,
    charset: keyof typeof StringUtils.CHARSET = 'ALPHANUMERIC'
  ): string {
    const chars = this.CHARSET[charset];
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }

  /**
   * @description Generate random integer as string
   * @param length - Number of digits
   * @returns Random integer string
   */
  static generateInteger(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }

  /**
   * @description Generate random email with customizable domain
   * @param domain - Email domain (default: gmail.com)
   * @param usernameLength - Username length (default: 8)
   * @returns Random email address
   */
  static generateEmail(domain = 'gmail.com', usernameLength = 8): string {
    const username = this.generate(usernameLength, 'ALPHANUMERIC').toLowerCase();
    return `${username}@${domain}`;
  }

  /**
   * @description Generate UUID-like string
   * @returns UUID-like string
   */
  static generateUUID(): string {
    return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * @class WebUtils
 * @description Web-specific utilities for Playwright testing
 */
export class WebUtils {
  /**
   * @description Fetch CSRF token with error handling and type safety
   * @param page - Playwright page instance
   * @param baseUrl - Base URL (defaults to APP_URL env var)
   * @param csrfEndpoint - CSRF endpoint path
   * @returns Promise resolving to CSRF token
   */
  static async fetchCSRFToken(
    page: Page,
    baseUrl?: string,
    csrfEndpoint = '/api/csrf-token'
  ): Promise<string> {
    const url =
      (baseUrl ?? EnvironmentUtils.get('APP_URL', 'https://localhost:3000')) + csrfEndpoint;

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'SESSION');

    if (!sessionCookie) {
      throw new Error('Session cookie not found. Ensure user is logged in.');
    }

    const response = await page.request.get(url, {
      headers: { Cookie: `SESSION=${sessionCookie.value}` },
    });

    if (!response.ok()) {
      throw new Error(`CSRF token fetch failed: ${response.status()} ${response.statusText()}`);
    }

    const { csrfToken } = (await response.json()) as { csrfToken: string };
    return csrfToken;
  }

  /**
   * @description Wait for network idle with customizable timeout
   * @param page - Playwright page instance
   * @param timeout - Timeout in milliseconds
   * @returns Promise that resolves when network is idle
   */
  static async waitForNetworkIdle(page: Page, timeout = 30000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * @description Safe element interaction with retry mechanism
   * @param page - Playwright page instance
   * @param selector - Element selector
   * @param action - Action to perform
   * @param retries - Number of retries
   * @returns Promise resolving to action result
   */
  static async safeInteraction<T>(
    page: Page,
    selector: string,
    action: (element: any) => Promise<T>,
    retries = 3
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const element = page.locator(selector);
        return await action(element);
      } catch (error) {
        lastError = error as Error;
        if (i < retries) {
          await page.waitForTimeout(1000); // Wait before retry
        }
      }
    }

    throw new Error(`Failed after ${retries + 1} attempts: ${lastError!.message}`);
  }
}

/* ===== EXPORTED UTILITIES NAMESPACE ===== */

/**
 * @namespace Utils
 * @description Consolidated namespace for all utility functions
 */
export const Utils = {
  DateTime: DateTimeUtils,
  Environment: EnvironmentUtils,
  String: StringUtils,
  Web: WebUtils,

  /** Legacy compatibility - use Utils.String.generate instead */
  /** @deprecated Use Utils.String.generate() */
  getRandomString: (length: number) => StringUtils.generate(length, 'CUSTOM'),

  /** @deprecated Use Utils.String.generateInteger() */
  generateRandomInteger: StringUtils.generateInteger,

  /** @deprecated Use Utils.String.generateEmail() */
  generateRandomEmail: () => StringUtils.generateEmail(),

  /** @deprecated Use Utils.Web.fetchCSRFToken() */
  fetchCSRFToken: WebUtils.fetchCSRFToken,
} as const;

export default Utils;

/**
 * @fileoverview Custom Framework Error Classes
 * @description Provides type-safe error hierarchy for better error handling and debugging
 * @version 1.0
 */

/**
 * Base error class for all framework errors
 * Extends native Error with additional context and metadata
 */
export class FrameworkError extends Error {
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;
  public readonly isFrameworkError = true;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'FrameworkError';
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get formatted error message with context
   */
  getDetailedMessage(): string {
    let details = `[${this.name}] ${this.message}\n`;
    details += `Timestamp: ${this.timestamp.toISOString()}\n`;

    if (this.context && Object.keys(this.context).length > 0) {
      details += `Context: ${JSON.stringify(this.context, null, 2)}\n`;
    }

    if (this.stack) {
      details += `\nStack Trace:\n${this.stack}`;
    }

    return details;
  }

  /**
   * Convert error to JSON format for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Page Object specific errors
 */
export class PageObjectError extends FrameworkError {
  constructor(
    message: string,
    public readonly pageName: string,
    public readonly action?: string,
    context?: Record<string, unknown>
  ) {
    super(message, { ...context, pageName, action });
    this.name = 'PageObjectError';
  }
}

/**
 * Element interaction errors
 */
export class ElementError extends PageObjectError {
  constructor(
    message: string,
    pageName: string,
    public readonly selector: string,
    public readonly interactionType: 'click' | 'fill' | 'verify' | 'wait',
    context?: Record<string, unknown>
  ) {
    super(message, pageName, interactionType, { ...context, selector, interactionType });
    this.name = 'ElementError';
  }
}

/**
 * API related errors
 */
export class APIError extends FrameworkError {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    public readonly statusCode?: number,
    public readonly responseBody?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, { ...context, endpoint, method, statusCode, responseBody });
    this.name = 'APIError';
  }

  /**
   * Check if error is a specific HTTP status
   */
  isStatus(code: number): boolean {
    return this.statusCode === code;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 500 && this.statusCode < 600;
  }
}

/**
 * Configuration related errors
 */
export class ConfigurationError extends FrameworkError {
  constructor(
    message: string,
    public readonly configKey?: string,
    public readonly configValue?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, { ...context, configKey, configValue });
    this.name = 'ConfigurationError';
  }
}

/**
 * Test data errors
 */
export class TestDataError extends FrameworkError {
  constructor(
    message: string,
    public readonly dataType: string,
    public readonly validationErrors?: string[],
    context?: Record<string, unknown>
  ) {
    super(message, { ...context, dataType, validationErrors });
    this.name = 'TestDataError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends FrameworkError {
  constructor(
    message: string,
    public readonly fieldName: string,
    public readonly expectedValue?: unknown,
    public readonly actualValue?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, { ...context, fieldName, expectedValue, actualValue });
    this.name = 'ValidationError';
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends FrameworkError {
  constructor(
    message: string,
    public readonly timeoutMs: number,
    public readonly operation: string,
    context?: Record<string, unknown>
  ) {
    super(message, { ...context, timeoutMs, operation });
    this.name = 'TimeoutError';
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends FrameworkError {
  constructor(
    message: string,
    public readonly authMethod?: string,
    public readonly username?: string,
    context?: Record<string, unknown>
  ) {
    super(message, { ...context, authMethod, username });
    this.name = 'AuthenticationError';
  }
}

/**
 * Helper function to check if an error is a framework error
 */
export function isFrameworkError(error: unknown): error is FrameworkError {
  return error instanceof FrameworkError || (error as FrameworkError).isFrameworkError === true;
}

/**
 * Helper function to wrap unknown errors into FrameworkError
 */
export function wrapError(error: unknown, context?: Record<string, unknown>): FrameworkError {
  if (isFrameworkError(error)) {
    return error;
  }

  if (error instanceof Error) {
    const wrappedError = new FrameworkError(error.message, context);
    wrappedError.stack = error.stack;
    return wrappedError;
  }

  return new FrameworkError(String(error), context);
}

/**
 * Error factory for creating specific error types
 */
export class ErrorFactory {
  static pageObject(
    message: string,
    pageName: string,
    action?: string,
    context?: Record<string, unknown>
  ): PageObjectError {
    return new PageObjectError(message, pageName, action, context);
  }

  static element(
    message: string,
    pageName: string,
    selector: string,
    interactionType: 'click' | 'fill' | 'verify' | 'wait',
    context?: Record<string, unknown>
  ): ElementError {
    return new ElementError(message, pageName, selector, interactionType, context);
  }

  static api(
    message: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    statusCode?: number,
    responseBody?: unknown,
    context?: Record<string, unknown>
  ): APIError {
    return new APIError(message, endpoint, method, statusCode, responseBody, context);
  }

  static configuration(
    message: string,
    configKey?: string,
    configValue?: unknown,
    context?: Record<string, unknown>
  ): ConfigurationError {
    return new ConfigurationError(message, configKey, configValue, context);
  }

  static testData(
    message: string,
    dataType: string,
    validationErrors?: string[],
    context?: Record<string, unknown>
  ): TestDataError {
    return new TestDataError(message, dataType, validationErrors, context);
  }

  static validation(
    message: string,
    fieldName: string,
    expectedValue?: unknown,
    actualValue?: unknown,
    context?: Record<string, unknown>
  ): ValidationError {
    return new ValidationError(message, fieldName, expectedValue, actualValue, context);
  }

  static timeout(
    message: string,
    timeoutMs: number,
    operation: string,
    context?: Record<string, unknown>
  ): TimeoutError {
    return new TimeoutError(message, timeoutMs, operation, context);
  }

  static authentication(
    message: string,
    authMethod?: string,
    username?: string,
    context?: Record<string, unknown>
  ): AuthenticationError {
    return new AuthenticationError(message, authMethod, username, context);
  }
}

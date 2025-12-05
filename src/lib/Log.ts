/**
 * @fileoverview Advanced Logging System for Playwright Test Framework
 * @description Centralized logging with Winston, test lifecycle tracking, and structured output
 * @version 2.0
 * @author Test Automation Team
 *
 * @example
 * ```typescript
 * import Log from './Log';
 *
 * // Test lifecycle logging
 * Log.testBegin('User Login Flow');
 * Log.info('Navigating to login page');
 * Log.error('Authentication failed');
 * Log.testEnd('User Login Flow', 'PASSED');
 * ```
 */

import winston from 'winston';

/**
 * @constant TEST_SEPARATOR
 * @description Visual separator for test boundaries in logs
 */
const TEST_SEPARATOR =
  '##############################################################################';

/**
 * @constant Logger
 * @description Winston logger instance with console and file transports
 * Configured with timestamps, alignment, and consistent formatting
 */
const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    /**
     * Console transport for immediate feedback during test execution
     * - Colored output for better readability
     * - Simple format for console viewing
     */
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(
          ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
        )
      ),
    }),

    /**
     * File transport for persistent logging and analysis
     * - Detailed JSON format for structured analysis
     * - Stored in test-results/logs for CI/CD integration
     */
    new winston.transports.File({
      filename: 'test-results/logs/execution.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

/**
 * @interface LogContext
 * @description Context metadata for structured logging
 */
export interface LogContext {
  testId?: string;
  testName?: string;
  browser?: string;
  environment?: string;
  tenant?: string;
  userId?: string;
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * @class Log
 * @description Static logging class providing structured test logging capabilities
 *
 * Features:
 * - Test lifecycle tracking with visual separators
 * - Structured information and error logging
 * - Console and file output with different formats
 * - Integration with Winston for advanced logging features
 * - Contextual metadata support
 */
export default class Log {
  private static context: LogContext = {};
  private static readonly contextStack: LogContext[] = [];

  /**
   * @method testBegin
   * @description Mark the beginning of a test scenario with visual emphasis
   * @param {string} scenario - Name of the test scenario starting
   *
   * @example
   * ```typescript
   * Log.testBegin('User Authentication Workflow');
   * // Output:
   * // ##############################################################################
   * // SCENARIO: USER AUTHENTICATION WORKFLOW - STARTED
   * // ##############################################################################
   * ```
   */
  public static testBegin(scenario: string): void {
    this.printLogs(`Scenario: ${scenario} - Started`, TEST_SEPARATOR);
  }

  /**
   * @method testEnd
   * @description Mark the completion of a test scenario with status
   * @param {string} scenario - Name of the test scenario ending
   * @param {string} status - Test execution status (PASSED, FAILED, SKIPPED)
   *
   * @example
   * ```typescript
   * Log.testEnd('User Authentication Workflow', 'PASSED');
   * // Output:
   * // ##############################################################################
   * // SCENARIO: USER AUTHENTICATION WORKFLOW - PASSED
   * // ##############################################################################
   * ```
   */
  public static testEnd(scenario: string, status: string): void {
    this.printLogs(`Scenario: ${scenario} - ${status}`, TEST_SEPARATOR);
  }

  /**
   * @method setContext
   * @description Set global logging context
   * @param {LogContext} context - Context metadata
   *
   * @example
   * ```typescript
   * Log.setContext({ testId: 'test-123', browser: 'chromium', environment: 'qa' });
   * ```
   */
  public static setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * @method withContext
   * @description Create a new logger instance with specific context
   * @param {LogContext} context - Context metadata
   * @returns {typeof Log} Logger instance with context
   *
   * @example
   * ```typescript
   * Log.withContext({ testId: 'test-123', browser: 'chrome' }).info('User logged in');
   * ```
   */
  public static withContext(context: LogContext): typeof Log {
    this.pushContext(context);
    return this;
  }

  /**
   * @method pushContext
   * @description Push context onto the stack
   * @param {LogContext} context - Context to push
   */
  private static pushContext(context: LogContext): void {
    this.contextStack.push({ ...this.context });
    this.context = { ...this.context, ...context };
  }

  /**
   * @method popContext
   * @description Pop context from the stack
   */
  public static popContext(): void {
    const previousContext = this.contextStack.pop();
    if (previousContext) {
      this.context = previousContext;
    }
  }

  /**
   * @method clearContext
   * @description Clear all logging context
   */
  public static clearContext(): void {
    this.context = {};
    this.contextStack.length = 0;
  }

  /**
   * @method getContext
   * @description Get current logging context
   * @returns {LogContext} Current context
   */
  public static getContext(): LogContext {
    return { ...this.context };
  }

  /**
   * @private
   * @method formatWithContext
   * @description Format message with context metadata
   * @param {string} message - Original message
   * @returns {string} Formatted message with context
   */
  private static formatWithContext(message: string): string {
    if (Object.keys(this.context).length === 0) {
      return message;
    }

    const contextParts: string[] = [];

    if (this.context.testId) contextParts.push(`[${this.context.testId}]`);
    if (this.context.browser) contextParts.push(`[${this.context.browser}]`);
    if (this.context.environment) contextParts.push(`[${this.context.environment}]`);
    if (this.context.tenant) contextParts.push(`[tenant:${this.context.tenant}]`);

    const contextPrefix = contextParts.length > 0 ? contextParts.join(' ') + ' ' : '';
    return `${contextPrefix}${message}`;
  }

  /**
   * @method info
   * @description Log informational messages for test steps and general information
   * @param {string} message - Information message to log
   * @param {object} metadata - Additional metadata
   *
   * @example
   * ```typescript
   * Log.info('✅ Successfully navigated to dashboard');
   * Log.info('📝 Filling form with test data', { formId: 'user-form' });
   * ```
   */
  public static info(message: string, metadata?: object): void {
    const formattedMessage = this.formatWithContext(message);
    Logger.info(formattedMessage, { ...this.context, ...metadata });
  }

  /**
   * @method error
   * @description Log error messages for failures and exceptions
   * @param {string} error - Error message or exception details
   * @param {object} metadata - Additional metadata
   *
   * @example
   * ```typescript
   * Log.error('❌ Element not found: #login-button');
   * Log.error('🚫 API request failed with status 500', { statusCode: 500 });
   * ```
   */
  public static error(error: string, metadata?: object): void {
    const formattedMessage = this.formatWithContext(error);
    Logger.error(formattedMessage, { ...this.context, ...metadata });
  }

  /**
   * @method warn
   * @description Log warning messages for non-critical issues
   * @param {string} message - Warning message to log
   * @param {object} metadata - Additional metadata
   *
   * @example
   * ```typescript
   * Log.warn('⚠️ Slow response time detected: 5.2s');
   * ```
   */
  public static warn(message: string, metadata?: object): void {
    const formattedMessage = this.formatWithContext(message);
    Logger.warn(formattedMessage, { ...this.context, ...metadata });
  }

  /**
   * @method debug
   * @description Log debug information for development and troubleshooting
   * @param {string} message - Debug message to log
   * @param {object} metadata - Additional metadata
   *
   * @example
   * ```typescript
   * Log.debug('🔍 Current URL: https://example.com/dashboard');
   * Log.debug('📊 Page load metrics', { fcp: 1.2, lcp: 2.1 });
   * ```
   */
  public static debug(message: string, metadata?: object): void {
    const formattedMessage = this.formatWithContext(message);
    Logger.debug(formattedMessage, { ...this.context, ...metadata });
  }

  /**
   * @method metric
   * @description Log performance or business metrics
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {object} metadata - Additional metadata
   *
   * @example
   * ```typescript
   * Log.metric('page_load_time', 1.23, { page: 'dashboard' });
   * ```
   */
  public static metric(metricName: string, value: number, metadata?: object): void {
    const formattedMessage = this.formatWithContext(`📊 Metric: ${metricName} = ${value}`);
    Logger.info(formattedMessage, { ...this.context, metricName, value, ...metadata });
  }

  /**
   * @method action
   * @description Log user actions for better test readability
   * @param {string} action - Action description
   * @param {object} metadata - Additional metadata
   *
   * @example
   * ```typescript
   * Log.action('Click login button', { element: '#login-btn' });
   * ```
   */
  public static action(action: string, metadata?: object): void {
    const formattedMessage = this.formatWithContext(`🎬 Action: ${action}`);
    Logger.info(formattedMessage, { ...this.context, action, ...metadata });
  }

  /**
   * @private
   * @method printLogs
   * @description Internal helper to print formatted log messages with separators
   * @param {string} msg - Message to be formatted and logged
   * @param {string} separator - Visual separator string
   */
  private static printLogs(msg: string, separator: string): void {
    Logger.info(separator);
    Logger.info(msg.toUpperCase());
    Logger.info(separator);
  }
}

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
const TEST_SEPARATOR = '##############################################################################';

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
        winston.format.printf(({ timestamp, level, message }) => 
          `${timestamp} [${level}]: ${message}`
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
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

/**
 * @class Log
 * @description Static logging class providing structured test logging capabilities
 * 
 * Features:
 * - Test lifecycle tracking with visual separators
 * - Structured information and error logging
 * - Console and file output with different formats
 * - Integration with Winston for advanced logging features
 */
export default class Log {
  
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
   * @method info
   * @description Log informational messages for test steps and general information
   * @param {string} message - Information message to log
   * 
   * @example
   * ```typescript
   * Log.info('✅ Successfully navigated to dashboard');
   * Log.info('📝 Filling form with test data');
   * ```
   */
  public static info(message: string): void {
    Logger.info(message);
  }

  /**
   * @method error
   * @description Log error messages for failures and exceptions
   * @param {string} error - Error message or exception details
   * 
   * @example
   * ```typescript
   * Log.error('❌ Element not found: #login-button');
   * Log.error('🚫 API request failed with status 500');
   * ```
   */
  public static error(error: string): void {
    Logger.error(error);
  }

  /**
   * @method warn
   * @description Log warning messages for non-critical issues
   * @param {string} message - Warning message to log
   * 
   * @example
   * ```typescript
   * Log.warn('⚠️ Slow response time detected: 5.2s');
   * ```
   */
  public static warn(message: string): void {
    Logger.warn(message);
  }

  /**
   * @method debug
   * @description Log debug information for development and troubleshooting
   * @param {string} message - Debug message to log
   * 
   * @example
   * ```typescript
   * Log.debug('🔍 Current URL: https://example.com/dashboard');
   * Log.debug('📊 Page load metrics: { FCP: 1.2s, LCP: 2.1s }');
   * ```
   */
  public static debug(message: string): void {
    Logger.debug(message);
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

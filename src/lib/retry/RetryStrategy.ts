/**
 * @fileoverview Smart Retry Strategy
 * @description Intelligent retry mechanism based on error categorization
 * @version 1.0
 */

import Log from '../utils/Log';

/* ===== ERROR CATEGORIES ===== */

export type ErrorCategory =
  | 'NetworkError'
  | 'TimeoutError'
  | 'AuthenticationError'
  | 'AssertionError'
  | 'ElementNotFoundError'
  | 'UnknownError';

/* ===== RETRY CONFIGURATION ===== */

export interface RetryConfig {
  maxRetries: number;
  backoff: 'fixed' | 'linear' | 'exponential';
  baseDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void | Promise<void>;
}

export interface CategoryRetryConfig extends RetryConfig {
  category: ErrorCategory;
  actions?: Array<() => Promise<void>>;
}

/* ===== RETRY STRATEGIES ===== */

export class RetryStrategies {
  private static readonly strategies: Record<ErrorCategory, RetryConfig> = {
    NetworkError: {
      maxRetries: 5,
      backoff: 'exponential',
      baseDelay: 1000,
      maxDelay: 30000,
    },
    TimeoutError: {
      maxRetries: 3,
      backoff: 'exponential',
      baseDelay: 2000,
      maxDelay: 10000,
    },
    AuthenticationError: {
      maxRetries: 1,
      backoff: 'fixed',
      baseDelay: 1000,
    },
    ElementNotFoundError: {
      maxRetries: 3,
      backoff: 'linear',
      baseDelay: 500,
      maxDelay: 5000,
    },
    AssertionError: {
      maxRetries: 0, // Don't retry logic errors
      backoff: 'fixed',
    },
    UnknownError: {
      maxRetries: 2,
      backoff: 'linear',
      baseDelay: 1000,
    },
  };

  /**
   * Get retry configuration for error category
   * @param category - Error category
   * @returns Retry configuration
   */
  static getConfig(category: ErrorCategory): RetryConfig {
    return { ...this.strategies[category] };
  }

  /**
   * Categorize error
   * @param error - Error object
   * @returns Error category
   */
  static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('fetch failed')
    ) {
      return 'NetworkError';
    }

    if (message.includes('timeout') || message.includes('timed out') || name.includes('timeout')) {
      return 'TimeoutError';
    }

    if (
      message.includes('authentication') ||
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('403')
    ) {
      return 'AuthenticationError';
    }

    if (
      message.includes('element') ||
      message.includes('selector') ||
      message.includes('not found') ||
      message.includes('locator')
    ) {
      return 'ElementNotFoundError';
    }

    if (message.includes('expect') || message.includes('assertion') || name.includes('assertion')) {
      return 'AssertionError';
    }

    return 'UnknownError';
  }

  /**
   * Calculate delay based on backoff strategy
   * @param config - Retry configuration
   * @param attempt - Current attempt number
   * @returns Delay in milliseconds
   */
  static calculateDelay(config: RetryConfig, attempt: number): number {
    const baseDelay = config.baseDelay || 1000;
    const maxDelay = config.maxDelay || 30000;

    let delay: number;

    switch (config.backoff) {
      case 'fixed':
        delay = baseDelay;
        break;
      case 'linear':
        delay = baseDelay * attempt;
        break;
      case 'exponential':
        delay = baseDelay * Math.pow(2, attempt - 1);
        break;
      default:
        delay = baseDelay;
    }

    return Math.min(delay, maxDelay);
  }
}

/* ===== RETRY EXECUTOR ===== */

/**
 * @class RetryExecutor
 * @description Executes functions with intelligent retry logic
 */
export class RetryExecutor {
  /**
   * Execute function with retry logic
   * @param fn - Function to execute
   * @param config - Retry configuration
   * @returns Promise with function result
   */
  static async execute<T>(fn: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T> {
    const defaultConfig: RetryConfig = {
      maxRetries: 3,
      backoff: 'exponential',
      baseDelay: 1000,
    };

    const finalConfig = { ...defaultConfig, ...config };
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= finalConfig.maxRetries) {
      try {
        attempt++;
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry
        if (attempt > finalConfig.maxRetries) {
          break;
        }

        // Custom retry logic
        if (finalConfig.shouldRetry && !finalConfig.shouldRetry(lastError, attempt)) {
          Log.info(`🚫 Custom retry logic prevented retry at attempt ${attempt}`);
          break;
        }

        // Calculate delay
        const delay = RetryStrategies.calculateDelay(finalConfig, attempt);

        Log.warn(`⚠️ Attempt ${attempt} failed: ${lastError.message}`);
        Log.info(`🔄 Retrying in ${delay}ms... (${finalConfig.maxRetries - attempt} retries left)`);

        // Call retry callback
        if (finalConfig.onRetry) {
          await finalConfig.onRetry(lastError, attempt);
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    Log.error(`❌ All ${finalConfig.maxRetries + 1} attempts failed`);
    if (lastError) throw lastError;
    throw new Error('All retry attempts failed');
  }

  /**
   * Execute function with category-based retry
   * @param fn - Function to execute
   * @param options - Category-specific options
   * @returns Promise with function result
   */
  static async executeWithCategory<T>(
    fn: () => Promise<T>,
    options?: {
      customCategory?: ErrorCategory;
      additionalActions?: Array<() => Promise<void>>;
    }
  ): Promise<T> {
    let lastError: Error;

    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Categorize error
      const category = options?.customCategory || RetryStrategies.categorizeError(lastError);
      const config = RetryStrategies.getConfig(category);

      Log.info(`🏷️ Error categorized as: ${category}`);
      Log.info(`📋 Retry config: ${config.maxRetries} retries, ${config.backoff} backoff`);

      // Execute with category-specific config
      return await this.execute(fn, {
        ...config,
        onRetry: async (err, attempt) => {
          Log.info(`🔄 Retry attempt ${attempt} for ${category}`);

          // Execute additional actions
          if (options?.additionalActions) {
            for (const action of options.additionalActions) {
              try {
                await action();
              } catch (actionError) {
                Log.warn(`Action failed: ${actionError}`);
              }
            }
          }
        },
      });
    }
  }
}

/* ===== RETRY DECORATOR ===== */

/**
 * Retry decorator for methods
 * @param category - Error category for retry strategy
 * @param customConfig - Custom retry configuration
 */
export function RetryWithStrategy(category: ErrorCategory, customConfig?: Partial<RetryConfig>) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const config = {
        ...RetryStrategies.getConfig(category),
        ...customConfig,
      };

      return await RetryExecutor.execute(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}

/**
 * Auto-categorize and retry decorator
 */
export function AutoRetry(_customConfig?: Partial<RetryConfig>) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return await RetryExecutor.executeWithCategory(() => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

import { Page, TestInfo } from '@playwright/test';
import Log from './Log';

export interface ErrorContext {
  testName: string;
  error: Error;
  screenshot?: string;
  trace?: string;
  timestamp: Date;
  pageUrl?: string;
  browserInfo?: string;
}

export class ErrorHandler {
  static async handleTestError(
    page: Page,
    testInfo: TestInfo,
    error: Error
  ): Promise<ErrorContext> {
    const timestamp = new Date();
    const errorContext: ErrorContext = {
      testName: testInfo.title,
      error,
      timestamp,
      pageUrl: page.url(),
      browserInfo: await this.getBrowserInfo(page),
    };

    // Take screenshot on failure
    try {
      const screenshotPath = testInfo.outputPath('failure-screenshot.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      errorContext.screenshot = screenshotPath;
      Log.info(`Screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      Log.error(`Failed to take screenshot: ${screenshotError}`);
    }

    // Save page content for debugging
    try {
      const htmlPath = testInfo.outputPath('page-content.html');
      const content = await page.content();
      await testInfo.attach('page-content.html', { body: content, contentType: 'text/html' });
      Log.info(`Page content saved: ${htmlPath}`);
    } catch (contentError) {
      Log.error(`Failed to save page content: ${contentError}`);
    }

    // Log error details
    Log.error(`Test failed: ${testInfo.title}`);
    Log.error(`Error: ${error.message}`);
    Log.error(`Page URL: ${errorContext.pageUrl}`);
    Log.error(`Browser: ${errorContext.browserInfo}`);
    Log.error(`Stack trace: ${error.stack}`);

    return errorContext;
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    operationName?: string
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (operationName && attempt > 1) {
          Log.info(`Retrying ${operationName} (attempt ${attempt}/${maxRetries})`);
        }
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) {
          break;
        }
        Log.info(`Operation failed, retrying in ${delayMs}ms...`);
        await this.delay(delayMs);
      }
    }

    throw new Error(
      `Operation failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeoutMs: number = 10000,
    intervalMs: number = 500,
    description?: string
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        if (await condition()) {
          return;
        }
      } catch {
        // Continue waiting if condition throws an error
      }
      await this.delay(intervalMs);
    }

    throw new Error(
      `Condition not met within ${timeoutMs}ms${description ? `: ${description}` : ''}`
    );
  }

  private static async getBrowserInfo(page: Page): Promise<string> {
    try {
      const userAgent = await page.evaluate(() => navigator.userAgent);
      return userAgent;
    } catch {
      return 'Unknown browser';
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Custom assertion with retry logic
  static async assertWithRetry(
    assertion: () => Promise<void>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    description?: string
  ): Promise<void> {
    await this.retryOperation(assertion, maxRetries, delayMs, description);
  }
}

import { test as base } from '@playwright/test';
import Log from '../utils/Log';

// For now, just export the base test without custom fixtures
export const test = base;

export { expect } from '@playwright/test';

// Base test class for common test operations
export class BaseTest {
  static async executeWithLogging<T>(
    scenarioName: string,
    testAction: () => Promise<T>
  ): Promise<T> {
    Log.testBegin(scenarioName);
    try {
      const result = await testAction();
      Log.testEnd(scenarioName, 'PASSED');
      return result;
    } catch (error) {
      Log.error(`Test failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      Log.testEnd(scenarioName, 'FAILED');
      throw error;
    }
  }
}

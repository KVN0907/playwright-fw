/**
 * @fileoverview Visual Testing Fixtures
 * @description Reusable fixtures for visual regression testing
 * @version 1.0
 */

import { test as base, expect } from '@playwright/test';
import { VisualRegressionHelper } from '../../lib/visual/VisualRegressionHelper';
import { FigmaHelper } from '../../lib/figma/FigmaHelper';
import { BaselineManager } from '../../lib/visual/BaselineManager';
import { VisualComparator } from '../../lib/visual/VisualComparator';
import Log from '../../lib/utils/Log';

export type VisualFixtures = {
  visualHelper: VisualRegressionHelper;
  figmaHelper: FigmaHelper;
  baselineManager: BaselineManager;
  visualComparator: VisualComparator;
};

/**
 * Extended test with visual testing fixtures
 */
export const visualTest = base.extend<VisualFixtures>({
  /**
   * Visual regression helper fixture
   */
  visualHelper: async ({ page }, use) => {
    Log.info('🎨 Initializing VisualRegressionHelper fixture');

    const helper = new VisualRegressionHelper(page, {
      environment: process.env.NODE_ENV || 'qa',
      figmaAccessToken: process.env.FIGMA_ACCESS_TOKEN,
      figmaFileKey: process.env.FIGMA_FILE_KEY,
    });

    await use(helper);

    Log.info('✅ VisualRegressionHelper fixture cleanup');
  },

  /**
   * Figma helper fixture
   */
  figmaHelper: async ({}, use) => {
    if (!process.env.FIGMA_ACCESS_TOKEN) {
      throw new Error('FIGMA_ACCESS_TOKEN is required for Figma integration tests');
    }

    Log.info('🎨 Initializing FigmaHelper fixture');

    const helper = new FigmaHelper({
      accessToken: process.env.FIGMA_ACCESS_TOKEN!,
      fileKey: process.env.FIGMA_FILE_KEY,
    });

    await use(helper);

    Log.info('✅ FigmaHelper fixture cleanup');
  },

  /**
   * Baseline manager fixture
   */
  baselineManager: async ({}, use) => {
    Log.info('📁 Initializing BaselineManager fixture');

    const manager = new BaselineManager(
      './test-results/visual-baselines',
      process.env.NODE_ENV || 'qa'
    );

    await use(manager);

    Log.info('✅ BaselineManager fixture cleanup');
  },

  /**
   * Visual comparator fixture
   */
  visualComparator: async ({}, use) => {
    Log.info('🔍 Initializing VisualComparator fixture');

    const comparator = new VisualComparator('./test-results/visual-diffs', 0.1);

    await use(comparator);

    Log.info('✅ VisualComparator fixture cleanup');
  },
});

/**
 * Export expect for convenience
 */
export { expect } from '@playwright/test';

/**
 * Custom expect matchers for visual testing
 */
export const visualExpect = {
  /**
   * Assert comparison result matches
   */
  toMatchVisually: (result: any, maxDiffPercentage: number = 0) => {
    if (result.diffPercentage > maxDiffPercentage) {
      return {
        pass: false,
        message: () =>
          `Expected visual difference to be <= ${maxDiffPercentage}%, but got ${result.diffPercentage.toFixed(2)}%`,
      };
    }
    return {
      pass: true,
      message: () =>
        `Visual comparison passed with ${result.diffPercentage.toFixed(2)}% difference`,
    };
  },

  /**
   * Assert baseline exists
   */
  toHaveBaseline: (manager: BaselineManager, name: string) => {
    const hasBaseline = manager.hasBaseline(name);
    return {
      pass: hasBaseline,
      message: () => (hasBaseline ? `Baseline "${name}" exists` : `Baseline "${name}" not found`),
    };
  },
};

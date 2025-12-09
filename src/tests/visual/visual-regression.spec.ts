/**
 * @fileoverview Visual Regression Test Examples
 * @description Demonstrates visual regression testing capabilities
 * @version 1.0
 */

import { visualTest, expect } from '../fixtures/visualFixtures';
import Log from '../../lib/utils/Log';

visualTest.describe('Visual Regression Tests', () => {
  visualTest.beforeEach(async ({ page }) => {
    Log.testBegin('Visual Regression Test');
  });

  visualTest.afterEach(async () => {
    Log.testEnd('Visual Regression Test', 'COMPLETED');
  });

  visualTest('Full page visual comparison', async ({ page, visualHelper }) => {
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');

    const result = await visualHelper.compareScreenshot('example-homepage', {
      fullPage: true,
      updateBaseline: process.env.VISUAL_UPDATE_BASELINES === 'true',
      threshold: 0.1,
    });

    expect(result.match).toBeTruthy();
    expect(result.diffPercentage).toBeLessThan(1);

    Log.info(`✅ Visual comparison: ${result.diffPercentage.toFixed(2)}% difference`);
  });

  visualTest('Element visual comparison', async ({ page, visualHelper }) => {
    await page.goto('https://example.com');

    const header = page.locator('h1').first();
    await expect(header).toBeVisible();

    const result = await visualHelper.compareElement(header, 'example-header', {
      updateBaseline: process.env.VISUAL_UPDATE_BASELINES === 'true',
      threshold: 0.05,
    });

    expect(result.match).toBeTruthy();

    Log.info(`✅ Element visual comparison passed`);
  });

  visualTest('Visual comparison with masked elements', async ({ page, visualHelper }) => {
    await page.goto('https://example.com');

    const dynamicElements = page.locator('.dynamic-content');

    const result = await visualHelper.compareScreenshot('example-masked', {
      fullPage: true,
      mask: [dynamicElements],
      updateBaseline: process.env.VISUAL_UPDATE_BASELINES === 'true',
    });

    expect(result.match).toBeTruthy();

    Log.info(`✅ Masked visual comparison passed`);
  });

  visualTest('Visual comparison with specific viewport', async ({ page, visualHelper }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://example.com');

    const result = await visualHelper.compareScreenshot('example-1920x1080', {
      fullPage: false,
      updateBaseline: process.env.VISUAL_UPDATE_BASELINES === 'true',
    });

    expect(result.match).toBeTruthy();

    Log.info(`✅ Viewport-specific visual comparison passed`);
  });

  visualTest('Visual comparison with tolerance', async ({ page, visualHelper }) => {
    await page.goto('https://example.com');

    const result = await visualHelper.compareScreenshot('example-with-tolerance', {
      fullPage: true,
      updateBaseline: process.env.VISUAL_UPDATE_BASELINES === 'true',
      threshold: 0.2,
    });

    expect(result.diffPercentage).toBeLessThan(5);

    Log.info(`✅ Tolerance-based visual comparison: ${result.diffPercentage.toFixed(2)}%`);
  });

  visualTest('Batch visual comparison', async ({ page, visualHelper }) => {
    await page.goto('https://example.com');

    const screenshots = ['example-batch-1', 'example-batch-2', 'example-batch-3'];

    const results = await visualHelper.batchCompare(screenshots, {
      updateBaseline: process.env.VISUAL_UPDATE_BASELINES === 'true',
    });

    const allPassed = results.every(r => r.match);
    expect(allPassed).toBeTruthy();

    Log.info(
      `✅ Batch comparison: ${results.filter(r => r.match).length}/${results.length} passed`
    );
  });

  visualTest('Generate visual test report', async ({ page, visualHelper }) => {
    await page.goto('https://example.com');

    const result1 = await visualHelper.compareScreenshot('report-test-1', {
      updateBaseline: process.env.VISUAL_UPDATE_BASELINES === 'true',
    });

    const result2 = await visualHelper.compareScreenshot('report-test-2', {
      updateBaseline: process.env.VISUAL_UPDATE_BASELINES === 'true',
    });

    const reportPath = await visualHelper.generateReport([result1, result2]);

    Log.info(`📄 Visual test report generated: ${reportPath}`);
  });

  visualTest('Update baseline manually', async ({ page, visualHelper }) => {
    await page.goto('https://example.com');

    await visualHelper.updateBaseline('example-manual-update', {
      fullPage: true,
    });

    Log.info(`✅ Baseline updated manually`);
  });
});

visualTest.describe('Baseline Management Tests', () => {
  visualTest('List all baselines', async ({ baselineManager }) => {
    const baselines = baselineManager.listBaselines();

    Log.info(`📋 Total baselines: ${baselines.length}`);

    baselines.forEach(baseline => {
      Log.info(`  - ${baseline.name} (${baseline.source}, ${baseline.browser})`);
    });
  });

  visualTest('Check baseline existence', async ({ baselineManager }) => {
    const hasBaseline = baselineManager.hasBaseline('example-homepage');

    if (hasBaseline) {
      const info = baselineManager.getBaselineInfo('example-homepage');
      Log.info(`✅ Baseline found: ${info?.name}`);
      Log.info(`   Created: ${info?.createdAt}`);
      Log.info(`   Size: ${(info!.size / 1024).toFixed(2)} KB`);
    } else {
      Log.info(`⚠️  Baseline not found`);
    }
  });

  visualTest('Get baseline statistics', async ({ baselineManager }) => {
    const stats = baselineManager.getStats();

    Log.info(`📊 Baseline Statistics:`);
    Log.info(`   Total: ${stats.total}`);
    Log.info(`   Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    Log.info(`   By Source:`, stats.bySource);
    Log.info(`   By Browser:`, stats.byBrowser);
  });
});

visualTest.describe('Visual Comparator Tests', () => {
  visualTest('Direct image comparison', async ({ visualComparator, baselineManager }) => {
    const baseline1 = baselineManager.getBaseline('example-homepage');
    const baseline2 = baselineManager.getBaseline('example-homepage');

    if (baseline1 && baseline2) {
      const result = await visualComparator.compare(baseline1, baseline2);

      expect(result.match).toBeTruthy();
      expect(result.diffPixels).toBe(0);

      Log.info(`✅ Direct comparison: Perfect match`);
    } else {
      visualTest.skip();
    }
  });

  visualTest('Comparison with custom threshold', async ({ visualComparator, baselineManager }) => {
    const baseline1 = baselineManager.getBaseline('example-homepage');
    const baseline2 = baselineManager.getBaseline('example-homepage');

    if (baseline1 && baseline2) {
      const result = await visualComparator.compareWithTolerance(baseline1, baseline2, 1.0);

      expect(result.match).toBeTruthy();

      Log.info(`✅ Tolerance comparison passed`);
    } else {
      visualTest.skip();
    }
  });
});

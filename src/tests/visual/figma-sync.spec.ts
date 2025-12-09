/**
 * @fileoverview Figma Integration Test Examples
 * @description Demonstrates Figma design sync and comparison
 * @version 1.0
 */

import { visualTest, expect } from '../fixtures/visualFixtures';
import Log from '../../lib/utils/Log';

visualTest.describe('Figma Integration Tests', () => {
  visualTest.beforeAll(async ({}) => {
    if (!process.env.FIGMA_ACCESS_TOKEN) {
      Log.warn('⚠️  FIGMA_ACCESS_TOKEN not set. Skipping Figma integration tests.');
    }
    if (!process.env.FIGMA_FILE_KEY) {
      Log.warn('⚠️  FIGMA_FILE_KEY not set. Some tests may fail.');
    }
  });

  visualTest.beforeEach(async ({}) => {
    Log.testBegin('Figma Integration Test');
  });

  visualTest.afterEach(async () => {
    Log.testEnd('Figma Integration Test', 'COMPLETED');
  });

  visualTest('Fetch Figma file metadata', async ({ figmaHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
    visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

    const fileData = await figmaHelper.getFile();

    expect(fileData).toBeDefined();
    expect(fileData.name).toBeDefined();
    expect(fileData.document).toBeDefined();

    Log.info(`✅ Figma file fetched: ${fileData.name}`);
  });

  visualTest('List all frames in Figma file', async ({ figmaHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
    visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

    const frames = await figmaHelper.getFrames();

    expect(frames.length).toBeGreaterThan(0);

    Log.info(`📐 Found ${frames.length} frames/components`);
    frames.forEach(frame => {
      Log.info(`  - ${frame.name} (${frame.type})`);
    });
  });

  visualTest('Search for specific component by name', async ({ figmaHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
    visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

    const searchTerm = 'Button';
    const nodes = await figmaHelper.findNodesByName(searchTerm);

    Log.info(`🔍 Found ${nodes.length} nodes matching "${searchTerm}"`);

    nodes.forEach(node => {
      Log.info(`  - ${node.name} (${node.type})`);
    });
  });

  visualTest('Download all frames from Figma', async ({ figmaHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
    visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

    const results = await figmaHelper.downloadAllFrames();

    expect(results.length).toBeGreaterThan(0);

    Log.info(`📥 Downloaded ${results.length} frames from Figma`);

    results.forEach(result => {
      Log.info(`  - ${result.name}`);
      Log.info(`    Local: ${result.localPath}`);
    });
  });

  visualTest('Sync specific components from Figma', async ({ figmaHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
    visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

    const componentNames = ['Button', 'Header', 'Footer'];

    const results = await figmaHelper.syncComponentsByName(componentNames);

    Log.info(`📥 Synced ${results.length} components`);

    results.forEach(result => {
      Log.info(`  ✅ ${result.name}`);
    });
  });

  visualTest('Compare page with Figma design', async ({ page, visualHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
    visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

    await page.goto('https://example.com');

    const componentName = 'Homepage';

    const result = await visualHelper.compareWithFigma(componentName, {
      fullPage: true,
      threshold: 0.15,
    });

    Log.info(`🎨 Figma comparison: ${result.diffPercentage.toFixed(2)}% difference`);

    expect(result.diffPercentage).toBeLessThan(10);
  });

  visualTest('Sync all Figma designs as baselines', async ({ visualHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
    visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

    const results = await visualHelper.syncBaselinesFromFigma();

    expect(results.length).toBeGreaterThan(0);

    Log.info(`✅ Synced ${results.length} designs from Figma as baselines`);
  });

  visualTest('Check Figma baseline existence', async ({ figmaHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');

    const componentName = 'Button';
    const hasBaseline = figmaHelper.hasBaseline(componentName);

    if (hasBaseline) {
      const baselinePath = figmaHelper.getBaselinePath(componentName);
      Log.info(`✅ Figma baseline exists: ${baselinePath}`);
    } else {
      Log.info(`⚠️  Figma baseline not found for: ${componentName}`);
    }
  });

  visualTest('List all Figma baselines', async ({ figmaHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');

    const baselines = figmaHelper.listBaselines();

    Log.info(`📋 Figma baselines: ${baselines.length}`);

    baselines.forEach(baseline => {
      Log.info(`  - ${baseline}`);
    });
  });

  visualTest('Extract file key from Figma URL', async ({ figmaHelper }) => {
    const figmaUrl = 'https://www.figma.com/file/ExampleKey123/My-Design-File';
    const fileKey = figmaHelper.extractFileKeyFromUrl(figmaUrl);

    expect(fileKey).toBe('ExampleKey123');

    Log.info(`✅ Extracted file key: ${fileKey}`);
  });

  visualTest('Set Figma file key dynamically', async ({ figmaHelper }) => {
    const exampleFileKey = 'abc123def456';

    figmaHelper.setFileKey(exampleFileKey);

    Log.info(`✅ Figma file key updated`);
  });
});

visualTest.describe('Figma to Live UI Comparison Workflow', () => {
  visualTest(
    'Complete workflow: Sync, Navigate, Compare',
    async ({ page, visualHelper, figmaHelper }) => {
      visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
      visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

      Log.info('📋 Step 1: Sync component from Figma');
      const componentName = 'Login Form';
      const syncResults = await figmaHelper.syncComponentsByName([componentName]);

      if (syncResults.length === 0) {
        Log.warn(`⚠️  Component "${componentName}" not found in Figma. Skipping test.`);
        visualTest.skip();
      }

      Log.info('📋 Step 2: Navigate to live application');
      await page.goto('https://example.com/login');
      await page.waitForLoadState('networkidle');

      Log.info('📋 Step 3: Compare live UI with Figma design');
      const result = await visualHelper.compareWithFigma(componentName, {
        fullPage: false,
        threshold: 0.2,
      });

      Log.info(`✅ Comparison complete:`);
      Log.info(`   Match: ${result.match ? 'Yes' : 'No'}`);
      Log.info(`   Difference: ${result.diffPercentage.toFixed(2)}%`);
      Log.info(`   Diff pixels: ${result.diffPixels.toLocaleString()}`);

      if (!result.match) {
        Log.info(`   Diff image: ${result.diffImagePath}`);
      }

      expect(result.diffPercentage).toBeLessThan(15);
    }
  );

  visualTest('Responsive design comparison', async ({ page, visualHelper, figmaHelper }) => {
    visualTest.skip(!process.env.FIGMA_ACCESS_TOKEN, 'Figma token not configured');
    visualTest.skip(!process.env.FIGMA_FILE_KEY, 'Figma file key not configured');

    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
    ];

    for (const viewport of viewports) {
      Log.info(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('https://example.com');

      const componentName = `Homepage-${viewport.name}`;

      const result = await visualHelper.compareWithFigma(componentName, {
        fullPage: false,
        threshold: 0.2,
      });

      Log.info(`   Difference: ${result.diffPercentage.toFixed(2)}%`);

      expect(result.diffPercentage).toBeLessThan(20);
    }

    Log.info('✅ All responsive comparisons completed');
  });
});

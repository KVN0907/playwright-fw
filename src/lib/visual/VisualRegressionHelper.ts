/**
 * @fileoverview Visual Regression Testing Helper
 * @description Main helper for visual regression testing with Playwright and Figma integration
 * @version 1.0
 */

import { Page, Locator } from '@playwright/test';
import * as fs from 'fs-extra';
import * as path from 'path';
import Log from '../utils/Log';
import { FigmaHelper } from '../figma/FigmaHelper';
import { VisualComparator, ComparisonResult } from './VisualComparator';
import { BaselineManager } from './BaselineManager';

export interface VisualTestOptions {
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
  mask?: Locator[];
  animations?: 'disabled' | 'allow';
  threshold?: number;
  maxDiffPixels?: number;
  maxDiffPixelRatio?: number;
  updateBaseline?: boolean;
}

export interface VisualTestConfig {
  baselineDir?: string;
  screenshotDir?: string;
  diffDir?: string;
  environment?: string;
  defaultThreshold?: number;
  figmaAccessToken?: string;
  figmaFileKey?: string;
}

/**
 * @class VisualRegressionHelper
 * @description Comprehensive helper for visual regression testing
 */
export class VisualRegressionHelper {
  private page: Page;
  private baselineManager: BaselineManager;
  private visualComparator: VisualComparator;
  private figmaHelper?: FigmaHelper;
  private screenshotDir: string;
  private config: VisualTestConfig;

  /**
   * @constructor
   * @param page - Playwright page instance
   * @param config - Visual test configuration
   */
  constructor(page: Page, config: VisualTestConfig = {}) {
    this.page = page;
    this.config = {
      environment: config.environment || process.env.NODE_ENV || 'qa',
      baselineDir: config.baselineDir || './test-results/visual-baselines',
      screenshotDir: config.screenshotDir || './test-results/screenshots',
      diffDir: config.diffDir || './test-results/visual-diffs',
      defaultThreshold: config.defaultThreshold || 0.1,
      figmaAccessToken: config.figmaAccessToken || process.env.FIGMA_ACCESS_TOKEN,
      figmaFileKey: config.figmaFileKey || process.env.FIGMA_FILE_KEY,
    };

    this.baselineManager = new BaselineManager(this.config.baselineDir!, this.config.environment!);

    this.visualComparator = new VisualComparator(
      this.config.diffDir!,
      this.config.defaultThreshold!
    );

    this.screenshotDir = path.join(this.config.screenshotDir!, this.config.environment!);
    fs.ensureDirSync(this.screenshotDir);

    if (this.config.figmaAccessToken) {
      this.figmaHelper = new FigmaHelper({
        accessToken: this.config.figmaAccessToken,
        fileKey: this.config.figmaFileKey,
      });
    }

    Log.info('🎨 VisualRegressionHelper initialized');
  }

  /**
   * @description Take a screenshot and compare with baseline
   * @param name - Name for the screenshot/baseline
   * @param options - Visual test options
   * @returns Comparison result
   */
  async compareScreenshot(
    name: string,
    options: VisualTestOptions = {}
  ): Promise<ComparisonResult> {
    Log.info(`📸 Taking screenshot: ${name}`);

    const screenshotPath = path.join(this.screenshotDir, `${this.sanitizeName(name)}.png`);

    await this.page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage || false,
      clip: options.clip,
      mask: options.mask,
      animations: options.animations || 'disabled',
    });

    const baselinePath = this.baselineManager.getBaseline(name);

    if (!baselinePath) {
      if (options.updateBaseline) {
        await this.baselineManager.saveBaseline(name, screenshotPath, {
          source: 'screenshot',
          browser: this.page.context().browser()?.browserType().name(),
          viewport: this.page.viewportSize() || undefined,
        });

        Log.info(`✅ Baseline created: ${name}`);

        return {
          match: true,
          diffPixels: 0,
          diffPercentage: 0,
          totalPixels: 0,
          baselineImage: screenshotPath,
          actualImage: screenshotPath,
        };
      } else {
        throw new Error(
          `Baseline not found for "${name}". Run with updateBaseline: true to create it.`
        );
      }
    }

    const result = await this.visualComparator.compare(baselinePath, screenshotPath, {
      threshold: options.threshold,
    });

    if (!result.match && options.updateBaseline) {
      await this.baselineManager.updateBaseline(name, screenshotPath);
      Log.info(`🔄 Baseline updated: ${name}`);
    }

    return result;
  }

  /**
   * @description Compare element screenshot with baseline
   * @param locator - Element locator
   * @param name - Name for the screenshot/baseline
   * @param options - Visual test options
   * @returns Comparison result
   */
  async compareElement(
    locator: Locator,
    name: string,
    options: VisualTestOptions = {}
  ): Promise<ComparisonResult> {
    Log.info(`📸 Taking element screenshot: ${name}`);

    const screenshotPath = path.join(this.screenshotDir, `${this.sanitizeName(name)}.png`);

    await locator.screenshot({
      path: screenshotPath,
      animations: options.animations || 'disabled',
    });

    const baselinePath = this.baselineManager.getBaseline(name);

    if (!baselinePath) {
      if (options.updateBaseline) {
        await this.baselineManager.saveBaseline(name, screenshotPath, {
          source: 'screenshot',
          browser: this.page.context().browser()?.browserType().name(),
        });

        Log.info(`✅ Baseline created: ${name}`);

        return {
          match: true,
          diffPixels: 0,
          diffPercentage: 0,
          totalPixels: 0,
          baselineImage: screenshotPath,
          actualImage: screenshotPath,
        };
      } else {
        throw new Error(
          `Baseline not found for "${name}". Run with updateBaseline: true to create it.`
        );
      }
    }

    const result = await this.visualComparator.compare(baselinePath, screenshotPath, {
      threshold: options.threshold,
    });

    if (!result.match && options.updateBaseline) {
      await this.baselineManager.updateBaseline(name, screenshotPath);
      Log.info(`🔄 Baseline updated: ${name}`);
    }

    return result;
  }

  /**
   * @description Compare current page with Figma design
   * @param componentName - Name of Figma component
   * @param options - Visual test options
   * @returns Comparison result
   */
  async compareWithFigma(
    componentName: string,
    options: VisualTestOptions = {}
  ): Promise<ComparisonResult> {
    if (!this.figmaHelper) {
      throw new Error('Figma integration not configured. Set FIGMA_ACCESS_TOKEN.');
    }

    Log.info(`🎨 Comparing with Figma design: ${componentName}`);

    const figmaBaseline = this.figmaHelper.getBaselinePath(componentName);

    if (!fs.existsSync(figmaBaseline)) {
      Log.info(`📥 Downloading Figma design: ${componentName}`);
      const results = await this.figmaHelper.syncComponentsByName([componentName]);

      if (results.length === 0) {
        throw new Error(`Figma component not found: ${componentName}`);
      }
    }

    const screenshotPath = path.join(this.screenshotDir, `${this.sanitizeName(componentName)}.png`);

    await this.page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage || false,
      clip: options.clip,
      mask: options.mask,
      animations: options.animations || 'disabled',
    });

    return await this.visualComparator.compare(figmaBaseline, screenshotPath, {
      threshold: options.threshold,
    });
  }

  /**
   * @description Sync all designs from Figma as baselines
   * @returns Array of downloaded images
   */
  async syncBaselinesFromFigma(): Promise<any[]> {
    if (!this.figmaHelper) {
      throw new Error('Figma integration not configured.');
    }

    Log.info('📥 Syncing all designs from Figma...');
    const results = await this.figmaHelper.downloadAllFrames();

    for (const result of results) {
      if (result.localPath) {
        await this.baselineManager.saveBaseline(result.name, result.localPath, {
          source: 'figma',
          figmaNodeId: result.nodeId,
        });
      }
    }

    Log.info(`✅ Synced ${results.length} designs from Figma`);
    return results;
  }

  /**
   * @description Update baseline with current screenshot
   * @param name - Name of the baseline
   */
  async updateBaseline(name: string, options: VisualTestOptions = {}): Promise<void> {
    Log.info(`🔄 Updating baseline: ${name}`);

    const screenshotPath = path.join(this.screenshotDir, `${this.sanitizeName(name)}.png`);

    await this.page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage || false,
      clip: options.clip,
      mask: options.mask,
      animations: options.animations || 'disabled',
    });

    await this.baselineManager.saveBaseline(name, screenshotPath, {
      source: 'screenshot',
      browser: this.page.context().browser()?.browserType().name(),
      viewport: this.page.viewportSize() || undefined,
    });

    Log.info(`✅ Baseline updated: ${name}`);
  }

  /**
   * @description Batch compare multiple screenshots
   * @param names - Array of screenshot names
   * @param options - Visual test options
   * @returns Array of comparison results
   */
  async batchCompare(
    names: string[],
    options: VisualTestOptions = {}
  ): Promise<ComparisonResult[]> {
    Log.info(`📊 Batch comparing ${names.length} screenshots`);
    const results: ComparisonResult[] = [];

    for (const name of names) {
      const result = await this.compareScreenshot(name, options);
      results.push(result);
    }

    return results;
  }

  /**
   * @description Generate visual test report
   * @param results - Array of comparison results
   * @returns Path to generated report
   */
  async generateReport(results: ComparisonResult[]): Promise<string> {
    return await this.visualComparator.generateReport(results);
  }

  /**
   * @description Get baseline manager instance
   */
  getBaselineManager(): BaselineManager {
    return this.baselineManager;
  }

  /**
   * @description Get visual comparator instance
   */
  getVisualComparator(): VisualComparator {
    return this.visualComparator;
  }

  /**
   * @description Get Figma helper instance
   */
  getFigmaHelper(): FigmaHelper | undefined {
    return this.figmaHelper;
  }

  /**
   * @description Sanitize name for file system
   */
  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
  }
}

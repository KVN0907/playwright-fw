/**
 * @fileoverview Visual Comparison Utility using pixelmatch
 * @description Provides pixel-level image comparison capabilities
 * @version 1.0
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import Log from '../utils/Log';

export interface ComparisonOptions {
  threshold?: number;
  includeAA?: boolean;
  alpha?: number;
  diffMask?: boolean;
}

export interface ComparisonResult {
  match: boolean;
  diffPixels: number;
  diffPercentage: number;
  totalPixels: number;
  diffImagePath?: string;
  baselineImage: string;
  actualImage: string;
}

/**
 * @class VisualComparator
 * @description Handles pixel-level visual comparison between images
 */
export class VisualComparator {
  private diffDir: string;
  private defaultThreshold: number;

  /**
   * @constructor
   * @param diffDir - Directory to store diff images
   * @param threshold - Default mismatch threshold (0-1)
   */
  constructor(diffDir: string = './test-results/visual-diffs', threshold: number = 0.1) {
    this.diffDir = diffDir;
    this.defaultThreshold = threshold;
    fs.ensureDirSync(this.diffDir);
  }

  /**
   * @description Compare two images pixel by pixel
   * @param baselinePath - Path to baseline image
   * @param actualPath - Path to actual screenshot
   * @param options - Comparison options
   * @returns Comparison result
   */
  async compare(
    baselinePath: string,
    actualPath: string,
    options: ComparisonOptions = {}
  ): Promise<ComparisonResult> {
    Log.info(`🔍 Comparing images: ${path.basename(baselinePath)} vs ${path.basename(actualPath)}`);

    if (!fs.existsSync(baselinePath)) {
      throw new Error(`Baseline image not found: ${baselinePath}`);
    }

    if (!fs.existsSync(actualPath)) {
      throw new Error(`Actual image not found: ${actualPath}`);
    }

    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const actual = PNG.sync.read(fs.readFileSync(actualPath));

    if (baseline.width !== actual.width || baseline.height !== actual.height) {
      Log.warn(
        `⚠️  Image dimensions don't match: ${baseline.width}x${baseline.height} vs ${actual.width}x${actual.height}`
      );

      return {
        match: false,
        diffPixels: baseline.width * baseline.height,
        diffPercentage: 100,
        totalPixels: baseline.width * baseline.height,
        baselineImage: baselinePath,
        actualImage: actualPath,
      };
    }

    const { width, height } = baseline;
    const diff = new PNG({ width, height });

    const threshold = options.threshold !== undefined ? options.threshold : this.defaultThreshold;
    const pixelmatchOptions = {
      threshold: threshold,
      includeAA: options.includeAA !== undefined ? options.includeAA : false,
      alpha: options.alpha,
    };

    const diffPixels = pixelmatch(
      baseline.data,
      actual.data,
      diff.data,
      width,
      height,
      pixelmatchOptions
    );

    const totalPixels = width * height;
    const diffPercentage = (diffPixels / totalPixels) * 100;

    const diffFileName = `diff-${Date.now()}-${path.basename(actualPath)}`;
    const diffImagePath = path.join(this.diffDir, diffFileName);

    if (diffPixels > 0 || options.diffMask) {
      fs.writeFileSync(diffImagePath, PNG.sync.write(diff));
      Log.info(`💾 Diff image saved: ${diffImagePath}`);
    }

    const match = diffPixels === 0;

    if (match) {
      Log.info(`✅ Images match perfectly`);
    } else {
      Log.warn(`⚠️  Images differ: ${diffPixels} pixels (${diffPercentage.toFixed(2)}%)`);
    }

    return {
      match,
      diffPixels,
      diffPercentage,
      totalPixels,
      diffImagePath: diffPixels > 0 ? diffImagePath : undefined,
      baselineImage: baselinePath,
      actualImage: actualPath,
    };
  }

  /**
   * @description Compare with tolerance percentage
   * @param baselinePath - Path to baseline image
   * @param actualPath - Path to actual screenshot
   * @param tolerancePercent - Acceptable difference percentage
   * @returns True if within tolerance
   */
  async compareWithTolerance(
    baselinePath: string,
    actualPath: string,
    tolerancePercent: number = 1
  ): Promise<ComparisonResult> {
    const result = await this.compare(baselinePath, actualPath);
    result.match = result.diffPercentage <= tolerancePercent;

    if (result.match) {
      Log.info(`✅ Within tolerance: ${result.diffPercentage.toFixed(2)}% <= ${tolerancePercent}%`);
    } else {
      Log.warn(`❌ Exceeds tolerance: ${result.diffPercentage.toFixed(2)}% > ${tolerancePercent}%`);
    }

    return result;
  }

  /**
   * @description Batch compare multiple image pairs
   * @param comparisons - Array of [baseline, actual] pairs
   * @param options - Comparison options
   * @returns Array of comparison results
   */
  async batchCompare(
    comparisons: Array<[string, string]>,
    options: ComparisonOptions = {}
  ): Promise<ComparisonResult[]> {
    Log.info(`📊 Batch comparing ${comparisons.length} image pairs`);
    const results: ComparisonResult[] = [];

    for (const [baseline, actual] of comparisons) {
      try {
        const result = await this.compare(baseline, actual, options);
        results.push(result);
      } catch (error) {
        Log.error(`❌ Comparison failed: ${error}`);
      }
    }

    const matchCount = results.filter(r => r.match).length;
    Log.info(`✅ Batch complete: ${matchCount}/${results.length} matches`);

    return results;
  }

  /**
   * @description Generate HTML report for comparison results
   * @param results - Array of comparison results
   * @param outputPath - Path to save HTML report
   */
  async generateReport(results: ComparisonResult[], outputPath?: string): Promise<string> {
    const reportPath = outputPath || path.join(this.diffDir, `visual-report-${Date.now()}.html`);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Regression Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        h1 { color: #333; }
        .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .comparison { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
        .passed { border-left: 5px solid #4caf50; }
        .failed { border-left: 5px solid #f44336; }
        .images { display: flex; gap: 20px; flex-wrap: wrap; }
        .image-container { flex: 1; min-width: 300px; }
        .image-container img { max-width: 100%; border: 1px solid #ddd; }
        .stats { display: flex; gap: 20px; margin-top: 10px; }
        .stat { padding: 10px; background: #f9f9f9; border-radius: 4px; }
        .badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
        .badge-pass { background: #4caf50; color: white; }
        .badge-fail { background: #f44336; color: white; }
    </style>
</head>
<body>
    <h1>🎨 Visual Regression Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Comparisons:</strong> ${results.length}</p>
        <p><strong>Passed:</strong> ${results.filter(r => r.match).length}</p>
        <p><strong>Failed:</strong> ${results.filter(r => !r.match).length}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>

    ${results
      .map(
        (result, index) => `
    <div class="comparison ${result.match ? 'passed' : 'failed'}">
        <h3>Comparison #${index + 1} 
            <span class="badge ${result.match ? 'badge-pass' : 'badge-fail'}">
                ${result.match ? 'PASS' : 'FAIL'}
            </span>
        </h3>
        <div class="stats">
            <div class="stat">
                <strong>Diff Pixels:</strong> ${result.diffPixels.toLocaleString()}
            </div>
            <div class="stat">
                <strong>Diff Percentage:</strong> ${result.diffPercentage.toFixed(2)}%
            </div>
            <div class="stat">
                <strong>Total Pixels:</strong> ${result.totalPixels.toLocaleString()}
            </div>
        </div>
        <div class="images">
            <div class="image-container">
                <h4>Baseline</h4>
                <img src="${result.baselineImage}" alt="Baseline">
            </div>
            <div class="image-container">
                <h4>Actual</h4>
                <img src="${result.actualImage}" alt="Actual">
            </div>
            ${
              result.diffImagePath
                ? `
            <div class="image-container">
                <h4>Difference</h4>
                <img src="${result.diffImagePath}" alt="Diff">
            </div>
            `
                : ''
            }
        </div>
    </div>
    `
      )
      .join('')}
</body>
</html>
    `;

    await fs.writeFile(reportPath, html);
    Log.info(`📄 Report generated: ${reportPath}`);
    return reportPath;
  }

  /**
   * @description Clear all diff images
   */
  async clearDiffs(): Promise<void> {
    await fs.emptyDir(this.diffDir);
    Log.info('🗑️  All diff images cleared');
  }

  /**
   * @description Get diff directory path
   */
  getDiffDir(): string {
    return this.diffDir;
  }

  /**
   * @description Set default threshold
   */
  setDefaultThreshold(threshold: number): void {
    this.defaultThreshold = threshold;
    Log.info(`🎯 Default threshold set to: ${threshold}`);
  }
}

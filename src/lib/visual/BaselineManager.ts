/**
 * @fileoverview Baseline Image Management
 * @description Manages baseline images for visual regression testing
 * @version 1.0
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Log from '../utils/Log';

export interface BaselineMetadata {
  name: string;
  createdAt: string;
  updatedAt: string;
  environment: string;
  viewport?: { width: number; height: number };
  browser?: string;
  source?: 'figma' | 'screenshot' | 'manual';
  figmaNodeId?: string;
}

export interface BaselineInfo extends BaselineMetadata {
  path: string;
  size: number;
}

/**
 * @class BaselineManager
 * @description Manages baseline images and their metadata
 */
export class BaselineManager {
  private baselineDir: string;
  private metadataFile: string;
  private environment: string;

  /**
   * @constructor
   * @param baselineDir - Directory to store baseline images
   * @param environment - Environment name (qa, dev, prod)
   */
  constructor(baselineDir: string = './test-results/visual-baselines', environment: string = 'qa') {
    this.environment = environment;
    this.baselineDir = path.join(baselineDir, environment);
    this.metadataFile = path.join(this.baselineDir, 'metadata.json');

    fs.ensureDirSync(this.baselineDir);
    this.initMetadata();

    Log.info(`📁 BaselineManager initialized for ${environment}`);
  }

  /**
   * @description Initialize metadata file if it doesn't exist
   */
  private initMetadata(): void {
    if (!fs.existsSync(this.metadataFile)) {
      fs.writeJsonSync(this.metadataFile, {}, { spaces: 2 });
    }
  }

  /**
   * @description Load metadata from file
   * @returns Metadata object
   */
  private loadMetadata(): Record<string, BaselineMetadata> {
    try {
      return fs.readJsonSync(this.metadataFile);
    } catch (error) {
      Log.warn('⚠️  Failed to load metadata, returning empty object');
      return {};
    }
  }

  /**
   * @description Save metadata to file
   * @param metadata - Metadata object to save
   */
  private saveMetadata(metadata: Record<string, BaselineMetadata>): void {
    fs.writeJsonSync(this.metadataFile, metadata, { spaces: 2 });
  }

  /**
   * @description Save a baseline image with metadata
   * @param name - Name/identifier for the baseline
   * @param imagePath - Path to the image file
   * @param metadata - Additional metadata
   * @returns Path to saved baseline
   */
  async saveBaseline(
    name: string,
    imagePath: string,
    metadata: Partial<BaselineMetadata> = {}
  ): Promise<string> {
    const sanitizedName = this.sanitizeFileName(name);
    const targetPath = path.join(this.baselineDir, `${sanitizedName}.png`);

    await fs.copy(imagePath, targetPath, { overwrite: true });

    const allMetadata = this.loadMetadata();
    const existingMetadata = allMetadata[sanitizedName];

    allMetadata[sanitizedName] = {
      name,
      createdAt: existingMetadata?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environment: this.environment,
      source: metadata.source || 'screenshot',
      ...metadata,
    };

    this.saveMetadata(allMetadata);

    Log.info(`💾 Baseline saved: ${sanitizedName}`);
    return targetPath;
  }

  /**
   * @description Get baseline image path
   * @param name - Name/identifier of the baseline
   * @returns Path to baseline image or null if not found
   */
  getBaseline(name: string): string | null {
    const sanitizedName = this.sanitizeFileName(name);
    const baselinePath = path.join(this.baselineDir, `${sanitizedName}.png`);

    if (!fs.existsSync(baselinePath)) {
      return null;
    }

    return baselinePath;
  }

  /**
   * @description Check if baseline exists
   * @param name - Name/identifier of the baseline
   * @returns True if baseline exists
   */
  hasBaseline(name: string): boolean {
    return this.getBaseline(name) !== null;
  }

  /**
   * @description Get baseline information including metadata
   * @param name - Name/identifier of the baseline
   * @returns Baseline info or null if not found
   */
  getBaselineInfo(name: string): BaselineInfo | null {
    const sanitizedName = this.sanitizeFileName(name);
    const baselinePath = this.getBaseline(name);

    if (!baselinePath) {
      return null;
    }

    const metadata = this.loadMetadata()[sanitizedName];
    const stats = fs.statSync(baselinePath);

    return {
      ...metadata,
      path: baselinePath,
      size: stats.size,
    };
  }

  /**
   * @description List all baselines
   * @returns Array of baseline information
   */
  listBaselines(): BaselineInfo[] {
    const metadata = this.loadMetadata();
    const baselines: BaselineInfo[] = [];

    for (const [sanitizedName, meta] of Object.entries(metadata)) {
      const baselinePath = path.join(this.baselineDir, `${sanitizedName}.png`);

      if (fs.existsSync(baselinePath)) {
        const stats = fs.statSync(baselinePath);
        baselines.push({
          ...meta,
          path: baselinePath,
          size: stats.size,
        });
      }
    }

    return baselines;
  }

  /**
   * @description Update baseline with new image
   * @param name - Name/identifier of the baseline
   * @param imagePath - Path to new image
   * @returns Path to updated baseline
   */
  async updateBaseline(name: string, imagePath: string): Promise<string> {
    Log.info(`🔄 Updating baseline: ${name}`);
    return await this.saveBaseline(name, imagePath);
  }

  /**
   * @description Delete a baseline
   * @param name - Name/identifier of the baseline
   */
  async deleteBaseline(name: string): Promise<void> {
    const sanitizedName = this.sanitizeFileName(name);
    const baselinePath = path.join(this.baselineDir, `${sanitizedName}.png`);

    if (fs.existsSync(baselinePath)) {
      await fs.remove(baselinePath);
    }

    const metadata = this.loadMetadata();
    delete metadata[sanitizedName];
    this.saveMetadata(metadata);

    Log.info(`🗑️  Baseline deleted: ${name}`);
  }

  /**
   * @description Clear all baselines
   */
  async clearAllBaselines(): Promise<void> {
    await fs.emptyDir(this.baselineDir);
    this.initMetadata();
    Log.info('🗑️  All baselines cleared');
  }

  /**
   * @description Import baselines from another environment
   * @param sourceEnvironment - Source environment name
   */
  async importFromEnvironment(sourceEnvironment: string): Promise<void> {
    const sourceDir = path.join(path.dirname(this.baselineDir), sourceEnvironment);

    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source environment not found: ${sourceEnvironment}`);
    }

    await fs.copy(sourceDir, this.baselineDir, { overwrite: true });

    const metadata = this.loadMetadata();
    for (const key in metadata) {
      metadata[key].environment = this.environment;
      metadata[key].updatedAt = new Date().toISOString();
    }
    this.saveMetadata(metadata);

    Log.info(`📥 Baselines imported from ${sourceEnvironment} to ${this.environment}`);
  }

  /**
   * @description Export baselines to another environment
   * @param targetEnvironment - Target environment name
   */
  async exportToEnvironment(targetEnvironment: string): Promise<void> {
    const targetDir = path.join(path.dirname(this.baselineDir), targetEnvironment);

    await fs.copy(this.baselineDir, targetDir, { overwrite: true });

    const targetMetadataFile = path.join(targetDir, 'metadata.json');
    const metadata = this.loadMetadata();

    for (const key in metadata) {
      metadata[key].environment = targetEnvironment;
      metadata[key].updatedAt = new Date().toISOString();
    }

    fs.writeJsonSync(targetMetadataFile, metadata, { spaces: 2 });

    Log.info(`📤 Baselines exported from ${this.environment} to ${targetEnvironment}`);
  }

  /**
   * @description Get baseline statistics
   * @returns Statistics object
   */
  getStats(): {
    total: number;
    totalSize: number;
    bySource: Record<string, number>;
    byBrowser: Record<string, number>;
  } {
    const baselines = this.listBaselines();

    const stats = {
      total: baselines.length,
      totalSize: baselines.reduce((sum, b) => sum + b.size, 0),
      bySource: {} as Record<string, number>,
      byBrowser: {} as Record<string, number>,
    };

    baselines.forEach(baseline => {
      const source = baseline.source || 'unknown';
      const browser = baseline.browser || 'unknown';

      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      stats.byBrowser[browser] = (stats.byBrowser[browser] || 0) + 1;
    });

    return stats;
  }

  /**
   * @description Sanitize file name
   */
  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * @description Get baseline directory path
   */
  getBaselineDir(): string {
    return this.baselineDir;
  }

  /**
   * @description Get environment name
   */
  getEnvironment(): string {
    return this.environment;
  }
}

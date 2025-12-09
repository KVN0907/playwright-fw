/**
 * @fileoverview Figma API Integration Helper
 * @description Fetches designs, components, and assets from Figma for visual testing
 * @version 1.0
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import Log from '../utils/Log';

interface FigmaConfig {
  accessToken: string;
  fileKey?: string;
  nodeIds?: string[];
  baselineDir?: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface FigmaImageExport {
  nodeId: string;
  name: string;
  url: string;
  localPath?: string;
}

/**
 * @class FigmaHelper
 * @description Helper class for Figma API integration and asset management
 */
export class FigmaHelper {
  private accessToken: string;
  private fileKey: string;
  private baselineDir: string;
  private apiBaseUrl = 'https://api.figma.com/v1';

  /**
   * @constructor
   * @param config - Figma configuration
   */
  constructor(config: FigmaConfig) {
    this.accessToken = config.accessToken || process.env.FIGMA_ACCESS_TOKEN || '';
    this.fileKey = config.fileKey || process.env.FIGMA_FILE_KEY || '';
    this.baselineDir = config.baselineDir || './test-results/visual-baselines/figma';

    if (!this.accessToken) {
      throw new Error('Figma access token is required. Set FIGMA_ACCESS_TOKEN in environment.');
    }

    fs.ensureDirSync(this.baselineDir);
    Log.info('🎨 FigmaHelper initialized');
  }

  /**
   * @description Set the Figma file key to work with
   * @param fileKey - Figma file key from URL
   */
  setFileKey(fileKey: string): void {
    this.fileKey = fileKey;
    Log.info(`📄 Figma file key set: ${fileKey}`);
  }

  /**
   * @description Extract file key from Figma URL
   * @param url - Full Figma file URL
   * @returns Extracted file key
   */
  extractFileKeyFromUrl(url: string): string {
    const match = url.match(/file\/([a-zA-Z0-9]+)/);
    if (!match) {
      throw new Error(`Invalid Figma URL: ${url}`);
    }
    return match[1];
  }

  /**
   * @description Fetch file metadata from Figma API
   * @returns File metadata
   */
  async getFile(): Promise<any> {
    if (!this.fileKey) {
      throw new Error('Figma file key is not set. Use setFileKey() or provide in constructor.');
    }

    Log.info(`📥 Fetching Figma file: ${this.fileKey}`);

    const response = await fetch(`${this.apiBaseUrl}/files/${this.fileKey}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    Log.info(`✅ Figma file fetched: ${data.name}`);
    return data;
  }

  /**
   * @description Find nodes by name in Figma file
   * @param nodeName - Name or partial name of nodes to find
   * @returns Array of matching nodes
   */
  async findNodesByName(nodeName: string): Promise<FigmaNode[]> {
    const fileData = await this.getFile();
    const matchingNodes: FigmaNode[] = [];

    const searchNodes = (node: any) => {
      if (node.name && node.name.toLowerCase().includes(nodeName.toLowerCase())) {
        matchingNodes.push({
          id: node.id,
          name: node.name,
          type: node.type,
          absoluteBoundingBox: node.absoluteBoundingBox,
        });
      }

      if (node.children) {
        node.children.forEach(searchNodes);
      }
    };

    fileData.document.children.forEach(searchNodes);
    Log.info(`🔍 Found ${matchingNodes.length} nodes matching "${nodeName}"`);
    return matchingNodes;
  }

  /**
   * @description Get all frames (pages/artboards) from Figma file
   * @returns Array of frame nodes
   */
  async getFrames(): Promise<FigmaNode[]> {
    const fileData = await this.getFile();
    const frames: FigmaNode[] = [];

    const extractFrames = (node: any) => {
      if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        frames.push({
          id: node.id,
          name: node.name,
          type: node.type,
          absoluteBoundingBox: node.absoluteBoundingBox,
        });
      }

      if (node.children) {
        node.children.forEach(extractFrames);
      }
    };

    fileData.document.children.forEach(extractFrames);
    Log.info(`📐 Found ${frames.length} frames/components`);
    return frames;
  }

  /**
   * @description Export images for specific nodes
   * @param nodeIds - Array of node IDs to export
   * @param options - Export options (format, scale)
   * @returns Array of image URLs
   */
  async exportImages(
    nodeIds: string[],
    options: { format?: 'png' | 'jpg' | 'svg'; scale?: number } = {}
  ): Promise<Record<string, string>> {
    if (!this.fileKey) {
      throw new Error('Figma file key is not set.');
    }

    const format = options.format || 'png';
    const scale = options.scale || 2;

    Log.info(`📸 Exporting ${nodeIds.length} images from Figma...`);

    const params = new URLSearchParams({
      ids: nodeIds.join(','),
      format,
      scale: scale.toString(),
    });

    const response = await fetch(`${this.apiBaseUrl}/images/${this.fileKey}?${params}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    Log.info(`✅ Images exported successfully`);
    return data.images;
  }

  /**
   * @description Download images from Figma and save locally
   * @param nodeIds - Array of node IDs to download
   * @param nodeNames - Optional array of names for saved files
   * @returns Array of download results with local paths
   */
  async downloadImages(nodeIds: string[], nodeNames?: string[]): Promise<FigmaImageExport[]> {
    const imageUrls = await this.exportImages(nodeIds);
    const results: FigmaImageExport[] = [];

    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const url = imageUrls[nodeId];

      if (!url) {
        Log.warn(`⚠️  No image URL for node: ${nodeId}`);
        continue;
      }

      const name = nodeNames?.[i] || `node-${nodeId}`;
      const fileName = `${this.sanitizeFileName(name)}.png`;
      const localPath = path.join(this.baselineDir, fileName);

      try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        await fs.writeFile(localPath, Buffer.from(buffer));

        results.push({
          nodeId,
          name,
          url,
          localPath,
        });

        Log.info(`💾 Downloaded: ${fileName}`);
      } catch (error) {
        Log.error(`❌ Failed to download ${name}: ${error}`);
      }
    }

    Log.info(`✅ Downloaded ${results.length}/${nodeIds.length} images`);
    return results;
  }

  /**
   * @description Download all frames/components from Figma file
   * @returns Array of downloaded images
   */
  async downloadAllFrames(): Promise<FigmaImageExport[]> {
    const frames = await this.getFrames();
    const nodeIds = frames.map(f => f.id);
    const nodeNames = frames.map(f => f.name);

    return await this.downloadImages(nodeIds, nodeNames);
  }

  /**
   * @description Sync specific components from Figma by name
   * @param componentNames - Array of component names to sync
   * @returns Array of downloaded images
   */
  async syncComponentsByName(componentNames: string[]): Promise<FigmaImageExport[]> {
    const allResults: FigmaImageExport[] = [];

    for (const componentName of componentNames) {
      const nodes = await this.findNodesByName(componentName);

      if (nodes.length === 0) {
        Log.warn(`⚠️  Component not found: ${componentName}`);
        continue;
      }

      const nodeIds = nodes.map(n => n.id);
      const nodeNames = nodes.map(n => n.name);
      const results = await this.downloadImages(nodeIds, nodeNames);

      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * @description Get baseline image path for a component
   * @param componentName - Name of the component
   * @returns Full path to baseline image
   */
  getBaselinePath(componentName: string): string {
    const fileName = `${this.sanitizeFileName(componentName)}.png`;
    return path.join(this.baselineDir, fileName);
  }

  /**
   * @description Check if baseline image exists for a component
   * @param componentName - Name of the component
   * @returns True if baseline exists
   */
  hasBaseline(componentName: string): boolean {
    const baselinePath = this.getBaselinePath(componentName);
    return fs.existsSync(baselinePath);
  }

  /**
   * @description Delete all baseline images
   */
  async clearBaselines(): Promise<void> {
    await fs.emptyDir(this.baselineDir);
    Log.info('🗑️  All baselines cleared');
  }

  /**
   * @description List all baseline images
   * @returns Array of baseline file names
   */
  listBaselines(): string[] {
    if (!fs.existsSync(this.baselineDir)) {
      return [];
    }

    const files = fs.readdirSync(this.baselineDir);
    return files.filter(f => f.endsWith('.png'));
  }

  /**
   * @description Sanitize file name for safe file system usage
   * @param name - Original name
   * @returns Sanitized file name
   */
  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * @description Get baseline directory path
   * @returns Baseline directory path
   */
  getBaselineDir(): string {
    return this.baselineDir;
  }
}

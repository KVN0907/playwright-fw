/**
 * @fileoverview Runtime Data Configuration System
 * @description Allows passing and creating test data dynamically at runtime
 * @version 1.0
 */

import Log from '../utils/Log';
import * as fs from 'fs-extra';
import * as path from 'path';

/* ===== RUNTIME DATA TYPES ===== */

/**
 * Runtime data configuration from CLI, env vars, or config files
 */
export interface RuntimeDataConfig {
  users?: RuntimeUserConfig[];
  organizations?: RuntimeOrgConfig[];
  locations?: RuntimeLocationConfig[];
  custom?: Record<string, unknown>;
  dataFile?: string;
  generateOnDemand?: boolean;
}

export interface RuntimeUserConfig {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  organization?: string;
  count?: number; // Generate multiple users
  [key: string]: unknown; // Allow dynamic properties from CLI
}

export interface RuntimeOrgConfig {
  name?: string;
  type?: 'enterprise' | 'business' | 'startup' | 'nonprofit';
  count?: number;
  [key: string]: unknown; // Allow dynamic properties from CLI
}

export interface RuntimeLocationConfig {
  name?: string;
  type?: string;
  entity?: string;
  count?: number;
  [key: string]: unknown; // Allow dynamic properties from CLI
}

/* ===== DATA SOURCES ===== */

export type DataSource = 'cli' | 'env' | 'file' | 'api' | 'inline';

export interface DataSourceConfig {
  source: DataSource;
  path?: string;
  apiEndpoint?: string;
  priority?: number;
}

/* ===== RUNTIME CONFIG MANAGER ===== */

/**
 * @class RuntimeConfigManager
 * @description Manages runtime data configuration from multiple sources
 */
export class RuntimeConfigManager {
  private static instance: RuntimeConfigManager;
  private config: RuntimeDataConfig = {};
  private dataSources: DataSourceConfig[] = [];
  private resolvedData: Map<string, unknown> = new Map();

  private constructor() {
    Log.info('🔧 RuntimeConfigManager initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RuntimeConfigManager {
    if (!RuntimeConfigManager.instance) {
      RuntimeConfigManager.instance = new RuntimeConfigManager();
    }
    return RuntimeConfigManager.instance;
  }

  /**
   * Load configuration from multiple sources
   * @param sources - Array of data sources
   */
  async loadFromSources(sources: DataSourceConfig[]): Promise<void> {
    this.dataSources = sources.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const source of this.dataSources) {
      try {
        await this.loadFromSource(source);
      } catch (error) {
        Log.warn(`Failed to load from ${source.source}: ${error}`);
      }
    }
  }

  /**
   * Load from specific source
   */
  private async loadFromSource(source: DataSourceConfig): Promise<void> {
    switch (source.source) {
      case 'cli':
        this.loadFromCLI();
        break;
      case 'env':
        this.loadFromEnv();
        break;
      case 'file':
        if (source.path) await this.loadFromFile(source.path);
        break;
      case 'api':
        if (source.apiEndpoint) await this.loadFromAPI(source.apiEndpoint);
        break;
      case 'inline':
        // Already set via setConfig()
        break;
    }
  }

  /**
   * Load data from CLI arguments
   * Example: --test-data='{"users":[{"email":"test@test.com","role":"admin"}]}'
   */
  private loadFromCLI(): void {
    const args = process.argv;
    const testDataArg = args.find(arg => arg.startsWith('--test-data='));

    if (testDataArg) {
      try {
        const jsonData = testDataArg.replace('--test-data=', '');
        const data = JSON.parse(jsonData);
        this.mergeConfig(data);
        Log.info('✅ Loaded test data from CLI');
      } catch (error) {
        Log.error(`Failed to parse CLI test data: ${error}`);
      }
    }

    // Also support individual parameters
    this.loadIndividualCLIParams();
  }

  /**
   * Load individual CLI parameters
   * Example: --user-email=test@test.com --user-role=admin
   */
  private loadIndividualCLIParams(): void {
    const args = process.argv;
    const config: RuntimeDataConfig = { users: [{}], organizations: [{}], locations: [{}] };

    args.forEach(arg => {
      if (arg.startsWith('--user-')) {
        const [key, value] = arg.replace('--user-', '').split('=');
        if (config.users?.[0]) config.users[0][key] = value;
      } else if (arg.startsWith('--org-')) {
        const [key, value] = arg.replace('--org-', '').split('=');
        if (config.organizations?.[0]) config.organizations[0][key] = value;
      } else if (arg.startsWith('--location-')) {
        const [key, value] = arg.replace('--location-', '').split('=');
        if (config.locations?.[0]) config.locations[0][key] = value;
      }
    });

    if (config.users?.[0] && Object.keys(config.users[0]).length > 0) {
      this.mergeConfig({ users: config.users });
    }
    if (config.organizations?.[0] && Object.keys(config.organizations[0]).length > 0) {
      this.mergeConfig({ organizations: config.organizations });
    }
    if (config.locations?.[0] && Object.keys(config.locations[0]).length > 0) {
      this.mergeConfig({ locations: config.locations });
    }
  }

  /**
   * Load data from environment variables
   * Example: TEST_DATA_USERS='[{"email":"test@test.com"}]'
   */
  private loadFromEnv(): void {
    const envData: RuntimeDataConfig = {};

    // Load from structured env vars
    if (process.env.TEST_DATA_USERS) {
      try {
        envData.users = JSON.parse(process.env.TEST_DATA_USERS);
      } catch (error) {
        Log.error(`Failed to parse TEST_DATA_USERS: ${error}`);
      }
    }

    if (process.env.TEST_DATA_ORGS) {
      try {
        envData.organizations = JSON.parse(process.env.TEST_DATA_ORGS);
      } catch (error) {
        Log.error(`Failed to parse TEST_DATA_ORGS: ${error}`);
      }
    }

    if (process.env.TEST_DATA_LOCATIONS) {
      try {
        envData.locations = JSON.parse(process.env.TEST_DATA_LOCATIONS);
      } catch (error) {
        Log.error(`Failed to parse TEST_DATA_LOCATIONS: ${error}`);
      }
    }

    // Load from data file path
    if (process.env.TEST_DATA_FILE) {
      envData.dataFile = process.env.TEST_DATA_FILE;
    }

    if (Object.keys(envData).length > 0) {
      this.mergeConfig(envData);
      Log.info('✅ Loaded test data from environment variables');
    }
  }

  /**
   * Load data from JSON file
   * @param filePath - Path to JSON file
   */
  private async loadFromFile(filePath: string): Promise<void> {
    try {
      const resolvedPath = path.resolve(filePath);
      if (await fs.pathExists(resolvedPath)) {
        const data = await fs.readJson(resolvedPath);
        this.mergeConfig(data);
        Log.info(`✅ Loaded test data from file: ${filePath}`);
      } else {
        Log.warn(`Test data file not found: ${filePath}`);
      }
    } catch (error) {
      Log.error(`Failed to load test data from file: ${error}`);
    }
  }

  /**
   * Load data from API endpoint
   * @param endpoint - API endpoint URL
   */
  private async loadFromAPI(endpoint: string): Promise<void> {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      this.mergeConfig(data as RuntimeDataConfig);
      Log.info(`✅ Loaded test data from API: ${endpoint}`);
    } catch (error) {
      Log.error(`Failed to load test data from API: ${error}`);
    }
  }

  /**
   * Merge new config with existing
   */
  private mergeConfig(newConfig: RuntimeDataConfig): void {
    this.config = {
      users: [...(this.config.users || []), ...(newConfig.users || [])],
      organizations: [...(this.config.organizations || []), ...(newConfig.organizations || [])],
      locations: [...(this.config.locations || []), ...(newConfig.locations || [])],
      custom: { ...(this.config.custom || {}), ...(newConfig.custom || {}) },
      dataFile: newConfig.dataFile || this.config.dataFile,
      generateOnDemand: newConfig.generateOnDemand ?? this.config.generateOnDemand ?? false,
    };
  }

  /**
   * Set config directly (for inline usage)
   */
  setConfig(config: RuntimeDataConfig): void {
    this.mergeConfig(config);
    Log.info('✅ Set runtime config inline');
  }

  /**
   * Get current configuration
   */
  getConfig(): RuntimeDataConfig {
    return { ...this.config };
  }

  /**
   * Get user config by index or email
   */
  getUserConfig(indexOrEmail?: number | string): RuntimeUserConfig | undefined {
    if (!this.config.users || this.config.users.length === 0) {
      return undefined;
    }

    if (typeof indexOrEmail === 'number') {
      return this.config.users[indexOrEmail];
    }

    if (typeof indexOrEmail === 'string') {
      return this.config.users.find(u => u.email === indexOrEmail);
    }

    return this.config.users[0];
  }

  /**
   * Get organization config by index or name
   */
  getOrgConfig(indexOrName?: number | string): RuntimeOrgConfig | undefined {
    if (!this.config.organizations || this.config.organizations.length === 0) {
      return undefined;
    }

    if (typeof indexOrName === 'number') {
      return this.config.organizations[indexOrName];
    }

    if (typeof indexOrName === 'string') {
      return this.config.organizations.find(o => o.name === indexOrName);
    }

    return this.config.organizations[0];
  }

  /**
   * Get location config by index or name
   */
  getLocationConfig(indexOrName?: number | string): RuntimeLocationConfig | undefined {
    if (!this.config.locations || this.config.locations.length === 0) {
      return undefined;
    }

    if (typeof indexOrName === 'number') {
      return this.config.locations[indexOrName];
    }

    if (typeof indexOrName === 'string') {
      return this.config.locations.find(l => l.name === indexOrName);
    }

    return this.config.locations[0];
  }

  /**
   * Get custom data by key
   */
  getCustomData<T = unknown>(key: string): T | undefined {
    return this.config.custom?.[key] as T;
  }

  /**
   * Store resolved data
   */
  storeResolvedData(key: string, data: unknown): void {
    this.resolvedData.set(key, data);
    Log.info(`📦 Stored resolved data: ${key}`);
  }

  /**
   * Get resolved data
   */
  getResolvedData<T = unknown>(key: string): T | undefined {
    return this.resolvedData.get(key) as T;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.config = {};
    this.resolvedData.clear();
    Log.info('🧹 Cleared runtime config');
  }

  /**
   * Check if runtime data is available
   */
  hasRuntimeData(): boolean {
    return Boolean(
      (this.config.users && this.config.users.length > 0) ||
        (this.config.organizations && this.config.organizations.length > 0) ||
        (this.config.locations && this.config.locations.length > 0) ||
        (this.config.custom && Object.keys(this.config.custom).length > 0)
    );
  }
}

/** Export singleton */
export const runtimeConfig = RuntimeConfigManager.getInstance();

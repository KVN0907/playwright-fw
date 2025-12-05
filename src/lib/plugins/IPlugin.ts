/**
 * @fileoverview Plugin Interface and Types
 * @description Core plugin architecture interfaces for framework extensibility
 * @version 1.0
 */

import { Page, BrowserContext, TestInfo } from '@playwright/test';

/* ===== PLUGIN TYPES ===== */

/** Plugin lifecycle stage */
export type PluginStage =
  | 'beforeAll'
  | 'beforeEach'
  | 'afterEach'
  | 'afterAll'
  | 'onTestStart'
  | 'onTestEnd'
  | 'onTestPass'
  | 'onTestFail';

/** Plugin priority for execution order */
export type PluginPriority = 'critical' | 'high' | 'medium' | 'low';

/** Framework context available to plugins */
export interface FrameworkContext {
  readonly page?: Page;
  readonly context?: BrowserContext;
  readonly testInfo?: TestInfo;
  readonly config: Record<string, unknown>;
  readonly environment: string;
}

/** Test result information */
export interface TestResult {
  readonly status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  readonly duration: number;
  readonly error?: Error;
  readonly retry: number;
  readonly attachments: Array<{ name: string; path?: string; body?: Buffer }>;
}

/** Plugin metadata */
export interface PluginMetadata {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly author?: string;
  readonly dependencies?: string[];
}

/** Plugin configuration */
export interface PluginConfig {
  enabled?: boolean;
  priority?: PluginPriority;
  stages?: PluginStage[];
  options?: Record<string, unknown>;
}

/* ===== PLUGIN INTERFACE ===== */

/**
 * @interface IPlugin
 * @description Base plugin interface that all plugins must implement
 */
export interface IPlugin {
  /** Plugin metadata */
  readonly metadata: PluginMetadata;

  /** Plugin configuration */
  config: PluginConfig;

  /**
   * Initialize plugin with framework context
   * @param context - Framework context
   * @returns Promise that resolves when initialization is complete
   */
  init(context: FrameworkContext): Promise<void>;

  /**
   * Cleanup plugin resources
   * @returns Promise that resolves when cleanup is complete
   */
  cleanup?(): Promise<void>;

  /**
   * Execute before all tests
   * @param context - Framework context
   */
  beforeAll?(context: FrameworkContext): Promise<void>;

  /**
   * Execute before each test
   * @param context - Framework context
   */
  beforeEach?(context: FrameworkContext): Promise<void>;

  /**
   * Execute after each test
   * @param context - Framework context
   * @param result - Test result information
   */
  afterEach?(context: FrameworkContext, result: TestResult): Promise<void>;

  /**
   * Execute after all tests
   * @param context - Framework context
   */
  afterAll?(context: FrameworkContext): Promise<void>;

  /**
   * Execute when test starts
   * @param context - Framework context
   */
  onTestStart?(context: FrameworkContext): Promise<void>;

  /**
   * Execute when test ends
   * @param context - Framework context
   * @param result - Test result information
   */
  onTestEnd?(context: FrameworkContext, result: TestResult): Promise<void>;

  /**
   * Execute when test passes
   * @param context - Framework context
   * @param result - Test result information
   */
  onTestPass?(context: FrameworkContext, result: TestResult): Promise<void>;

  /**
   * Execute when test fails
   * @param context - Framework context
   * @param result - Test result information
   */
  onTestFail?(context: FrameworkContext, result: TestResult): Promise<void>;

  /**
   * Validate plugin can run in current environment
   * @param context - Framework context
   * @returns True if plugin can run, false otherwise
   */
  canActivate?(context: FrameworkContext): Promise<boolean>;
}

/* ===== PLUGIN FACTORY ===== */

/**
 * @interface IPluginFactory
 * @description Factory for creating plugin instances
 */
export interface IPluginFactory {
  /**
   * Create plugin instance
   * @param config - Plugin configuration
   * @returns Plugin instance
   */
  create(config?: PluginConfig): IPlugin;
}

/* ===== HELPER TYPES ===== */

/** Plugin registration information */
export interface PluginRegistration {
  readonly plugin: IPlugin;
  readonly id: string;
  readonly registeredAt: Date;
}

/** Plugin execution result */
export interface PluginExecutionResult {
  readonly pluginName: string;
  readonly stage: PluginStage;
  readonly success: boolean;
  readonly duration: number;
  readonly error?: Error;
}

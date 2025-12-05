/**
 * @fileoverview Base Plugin Implementation
 * @description Abstract base class for creating custom plugins
 * @version 1.0
 */

import Log from '../Log';
import { IPlugin, PluginMetadata, PluginConfig, FrameworkContext } from './IPlugin';

/**
 * @abstract BasePlugin
 * @description Base plugin class with common functionality
 */
export abstract class BasePlugin implements IPlugin {
  readonly metadata: PluginMetadata;
  config: PluginConfig;
  protected context?: FrameworkContext;

  constructor(metadata: PluginMetadata, config: PluginConfig = {}) {
    this.metadata = metadata;
    this.config = {
      enabled: true,
      priority: 'medium',
      ...config,
    };
  }

  /**
   * Initialize plugin - must be implemented by derived classes
   * @param context - Framework context
   */
  abstract init(context: FrameworkContext): Promise<void>;

  /**
   * Cleanup plugin resources
   */
  async cleanup(): Promise<void> {
    Log.info(`🧹 Cleaning up plugin: ${this.metadata.name}`);
  }

  /**
   * Validate plugin can run in current environment
   * @param _context - Framework context
   * @returns True if plugin can run
   */
  async canActivate(_context: FrameworkContext): Promise<boolean> {
    return this.config.enabled !== false;
  }

  /**
   * Log plugin action
   * @param message - Log message
   * @param level - Log level
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const logMessage = `[${this.metadata.name}] ${message}`;
    switch (level) {
      case 'info':
        Log.info(logMessage);
        break;
      case 'warn':
        Log.warn(logMessage);
        break;
      case 'error':
        Log.error(logMessage);
        break;
    }
  }

  /**
   * Get plugin option
   * @param key - Option key
   * @param defaultValue - Default value if not found
   * @returns Option value
   */
  protected getOption<T>(key: string, defaultValue?: T): T | undefined {
    return (this.config.options?.[key] as T) ?? defaultValue;
  }

  /**
   * Check if option exists
   * @param key - Option key
   * @returns True if option exists
   */
  protected hasOption(key: string): boolean {
    return this.config.options?.[key] !== undefined;
  }
}

/**
 * @fileoverview Plugin Manager
 * @description Central orchestration for plugin lifecycle and execution
 * @version 1.0
 */

import Log from '../utils/Log';
import {
  IPlugin,
  PluginStage,
  PluginPriority,
  FrameworkContext,
  TestResult,
  PluginRegistration,
  PluginExecutionResult,
} from './IPlugin';

/* ===== PLUGIN MANAGER ===== */

/**
 * @class PluginManager
 * @description Singleton plugin manager for registering and executing plugins
 */
export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, PluginRegistration> = new Map();
  private initialized: boolean = false;
  private readonly priorityOrder: Record<PluginPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  private constructor() {
    Log.info('🔌 PluginManager initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Register a plugin
   * @param plugin - Plugin instance to register
   * @param id - Optional custom plugin ID
   */
  async register(plugin: IPlugin, id?: string): Promise<void> {
    const pluginId = id || plugin.metadata.name;

    if (this.plugins.has(pluginId)) {
      Log.warn(`Plugin ${pluginId} is already registered. Skipping.`);
      return;
    }

    // Check if plugin should be enabled
    if (plugin.config.enabled === false) {
      Log.info(`Plugin ${pluginId} is disabled. Skipping registration.`);
      return;
    }

    const registration: PluginRegistration = {
      plugin,
      id: pluginId,
      registeredAt: new Date(),
    };

    this.plugins.set(pluginId, registration);
    Log.info(`✅ Plugin registered: ${pluginId} v${plugin.metadata.version}`);
  }

  /**
   * Register multiple plugins
   * @param plugins - Array of plugins to register
   */
  async registerMultiple(plugins: IPlugin[]): Promise<void> {
    for (const plugin of plugins) {
      await this.register(plugin);
    }
  }

  /**
   * Unregister a plugin
   * @param pluginId - Plugin ID to unregister
   */
  async unregister(pluginId: string): Promise<boolean> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      Log.warn(`Plugin ${pluginId} not found`);
      return false;
    }

    // Cleanup plugin resources
    if (registration.plugin.cleanup) {
      try {
        await registration.plugin.cleanup();
      } catch (error) {
        Log.error(`Error cleaning up plugin ${pluginId}: ${error}`);
      }
    }

    this.plugins.delete(pluginId);
    Log.info(`🗑️ Plugin unregistered: ${pluginId}`);
    return true;
  }

  /**
   * Initialize all registered plugins
   * @param context - Framework context
   */
  async initializeAll(context: FrameworkContext): Promise<void> {
    if (this.initialized) {
      Log.warn('Plugins already initialized');
      return;
    }

    Log.info(`🚀 Initializing ${this.plugins.size} plugin(s)...`);

    for (const [id, registration] of this.plugins.entries()) {
      try {
        // Check if plugin can activate
        if (registration.plugin.canActivate) {
          const canActivate = await registration.plugin.canActivate(context);
          if (!canActivate) {
            Log.info(`⏭️ Plugin ${id} cannot activate in current environment`);
            continue;
          }
        }

        // Initialize plugin
        await registration.plugin.init(context);
        Log.info(`✅ Plugin initialized: ${id}`);
      } catch (error) {
        Log.error(`❌ Failed to initialize plugin ${id}: ${error}`);
        // Continue with other plugins
      }
    }

    this.initialized = true;
    Log.info('🎉 All plugins initialized');
  }

  /**
   * Execute plugins for a specific stage
   * @param stage - Lifecycle stage
   * @param context - Framework context
   * @param result - Optional test result (for after stages)
   * @returns Array of execution results
   */
  async executeStage(
    stage: PluginStage,
    context: FrameworkContext,
    result?: TestResult
  ): Promise<PluginExecutionResult[]> {
    const activePlugins = this.getPluginsForStage(stage);
    const results: PluginExecutionResult[] = [];

    Log.info(`🎬 Executing stage: ${stage} (${activePlugins.length} plugin(s))`);

    for (const registration of activePlugins) {
      const startTime = Date.now();
      const { plugin } = registration;

      try {
        // Execute appropriate lifecycle method
        switch (stage) {
          case 'beforeAll':
            if (plugin.beforeAll) await plugin.beforeAll(context);
            break;
          case 'beforeEach':
            if (plugin.beforeEach) await plugin.beforeEach(context);
            break;
          case 'afterEach':
            if (plugin.afterEach && result) await plugin.afterEach(context, result);
            break;
          case 'afterAll':
            if (plugin.afterAll) await plugin.afterAll(context);
            break;
          case 'onTestStart':
            if (plugin.onTestStart) await plugin.onTestStart(context);
            break;
          case 'onTestEnd':
            if (plugin.onTestEnd && result) await plugin.onTestEnd(context, result);
            break;
          case 'onTestPass':
            if (plugin.onTestPass && result) await plugin.onTestPass(context, result);
            break;
          case 'onTestFail':
            if (plugin.onTestFail && result) await plugin.onTestFail(context, result);
            break;
        }

        results.push({
          pluginName: plugin.metadata.name,
          stage,
          success: true,
          duration: Date.now() - startTime,
        });
      } catch (error) {
        Log.error(`❌ Plugin ${plugin.metadata.name} failed at ${stage}: ${error}`);
        results.push({
          pluginName: plugin.metadata.name,
          stage,
          success: false,
          duration: Date.now() - startTime,
          error: error as Error,
        });
      }
    }

    return results;
  }

  /**
   * Get plugins that should execute for a stage, sorted by priority
   * @param stage - Lifecycle stage
   * @returns Sorted array of plugin registrations
   */
  private getPluginsForStage(stage: PluginStage): PluginRegistration[] {
    const eligiblePlugins = Array.from(this.plugins.values()).filter(registration => {
      const { plugin } = registration;

      // Check if stage is configured for this plugin
      const configuredStages = plugin.config.stages;
      if (configuredStages && !configuredStages.includes(stage)) {
        return false;
      }

      // Check if plugin has the lifecycle method
      return plugin[stage] !== undefined;
    });

    // Sort by priority
    return eligiblePlugins.sort((a, b) => {
      const priorityA = a.plugin.config.priority || 'medium';
      const priorityB = b.plugin.config.priority || 'medium';
      return this.priorityOrder[priorityA] - this.priorityOrder[priorityB];
    });
  }

  /**
   * Get all registered plugins
   * @returns Array of plugin registrations
   */
  getAll(): PluginRegistration[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by ID
   * @param pluginId - Plugin ID
   * @returns Plugin registration or undefined
   */
  get(pluginId: string): PluginRegistration | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Check if plugin is registered
   * @param pluginId - Plugin ID
   * @returns True if registered
   */
  has(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugin count
   * @returns Number of registered plugins
   */
  count(): number {
    return this.plugins.size;
  }

  /**
   * Clear all plugins
   */
  async clear(): Promise<void> {
    Log.info('🧹 Clearing all plugins...');

    for (const [id, registration] of this.plugins.entries()) {
      if (registration.plugin.cleanup) {
        try {
          await registration.plugin.cleanup();
        } catch (error) {
          Log.error(`Error cleaning up plugin ${id}: ${error}`);
        }
      }
    }

    this.plugins.clear();
    this.initialized = false;
    Log.info('✅ All plugins cleared');
  }

  /**
   * Get plugin statistics
   * @returns Plugin statistics
   */
  getStats(): {
    total: number;
    byPriority: Record<PluginPriority, number>;
    byStage: Record<PluginStage, number>;
  } {
    const byPriority: Record<PluginPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const byStage: Record<PluginStage, number> = {
      beforeAll: 0,
      beforeEach: 0,
      afterEach: 0,
      afterAll: 0,
      onTestStart: 0,
      onTestEnd: 0,
      onTestPass: 0,
      onTestFail: 0,
    };

    for (const registration of this.plugins.values()) {
      const priority = registration.plugin.config.priority || 'medium';
      byPriority[priority]++;

      const stages = registration.plugin.config.stages || [];
      stages.forEach(stage => {
        byStage[stage]++;
      });
    }

    return {
      total: this.plugins.size,
      byPriority,
      byStage,
    };
  }
}

/** Export singleton instance */
export const pluginManager = PluginManager.getInstance();

/**
 * @fileoverview Plugin System Exports
 * @description Central export point for plugin system
 * @version 1.0
 */

// Core plugin interfaces and types
export * from './IPlugin';

// Plugin manager
export { PluginManager, pluginManager } from './PluginManager';

// Base plugin class
export { BasePlugin } from './BasePlugin';

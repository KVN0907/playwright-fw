/**
 * @fileoverview Profile Manager
 * @description Manages test configuration profiles for different testing scenarios
 * @version 1.0
 */

import { PlaywrightTestConfig } from '@playwright/test';
import Log from '../../src/lib/Log';
import * as fs from 'fs-extra';
import * as path from 'path';

/* ===== PROFILE TYPES ===== */

/**
 * Profile configuration interface
 */
export interface ProfileConfig {
  name: string;
  description?: string;
  extends?: string; // Inherit from another profile
  overrides: Partial<PlaywrightTestConfig>;
  environment?: string;
  enabled?: boolean;
}

/* ===== PROFILE MANAGER ===== */

/**
 * @class ProfileManager
 * @description Manages loading and merging of test profiles
 */
export class ProfileManager {
  private static instance: ProfileManager;
  private profiles: Map<string, ProfileConfig> = new Map();
  private profilesDir: string;

  private constructor() {
    this.profilesDir = path.resolve(__dirname);
    Log.info('📋 ProfileManager initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }

  /**
   * Load all profiles from directory
   */
  async loadProfiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.profilesDir);
      const profileFiles = files.filter(
        f => f.endsWith('.profile.ts') || f.endsWith('.profile.js')
      );

      for (const file of profileFiles) {
        try {
          const profilePath = path.join(this.profilesDir, file);
          const profileModule = await import(profilePath);
          const profile: ProfileConfig = profileModule.default || profileModule.profile;

          if (profile && profile.name) {
            this.profiles.set(profile.name, profile);
            Log.info(`✅ Loaded profile: ${profile.name}`);
          }
        } catch (error) {
          Log.error(`Failed to load profile ${file}: ${error}`);
        }
      }

      Log.info(`📦 Loaded ${this.profiles.size} profile(s)`);
    } catch (error) {
      Log.error(`Failed to load profiles: ${error}`);
    }
  }

  /**
   * Register a profile manually
   * @param profile - Profile configuration
   */
  register(profile: ProfileConfig): void {
    if (profile.enabled === false) {
      Log.info(`Profile ${profile.name} is disabled, skipping registration`);
      return;
    }

    this.profiles.set(profile.name, profile);
    Log.info(`✅ Registered profile: ${profile.name}`);
  }

  /**
   * Get profile by name
   * @param name - Profile name
   * @returns Profile configuration or undefined
   */
  get(name: string): ProfileConfig | undefined {
    return this.profiles.get(name);
  }

  /**
   * Merge profiles with base configuration
   * @param baseConfig - Base Playwright configuration
   * @param profileNames - Array of profile names to apply
   * @returns Merged configuration
   */
  merge(baseConfig: PlaywrightTestConfig, profileNames: string[]): PlaywrightTestConfig {
    let mergedConfig = { ...baseConfig };

    for (const profileName of profileNames) {
      const profile = this.profiles.get(profileName);

      if (!profile) {
        Log.warn(`Profile not found: ${profileName}`);
        continue;
      }

      // Handle profile inheritance
      if (profile.extends) {
        const parentConfig = this.get(profile.extends);
        if (parentConfig) {
          mergedConfig = this.deepMerge(mergedConfig, parentConfig.overrides);
        }
      }

      // Merge profile overrides
      mergedConfig = this.deepMerge(mergedConfig, profile.overrides);
      Log.info(`🔀 Applied profile: ${profileName}`);
    }

    return mergedConfig;
  }

  /**
   * Load profiles from command line arguments
   * @param argv - Command line arguments
   * @returns Array of profile names
   */
  static getProfilesFromArgs(argv: string[] = process.argv): string[] {
    const profileArg = argv.find(arg => arg.startsWith('--profile='));
    if (!profileArg) return [];

    const profilesString = profileArg.replace('--profile=', '');
    return profilesString
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
  }

  /**
   * Load profiles from environment variable
   * @returns Array of profile names
   */
  static getProfilesFromEnv(): string[] {
    const profilesEnv = process.env.TEST_PROFILES;
    if (!profilesEnv) return [];

    return profilesEnv
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
  }

  /**
   * Get all registered profiles
   * @returns Array of profile configurations
   */
  getAll(): ProfileConfig[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get profiles by environment
   * @param environment - Environment name
   * @returns Array of matching profiles
   */
  getByEnvironment(environment: string): ProfileConfig[] {
    return Array.from(this.profiles.values()).filter(
      profile => profile.environment === environment || !profile.environment
    );
  }

  /**
   * Deep merge two objects
   * @param target - Target object
   * @param source - Source object
   * @returns Merged object
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Clear all profiles
   */
  clear(): void {
    this.profiles.clear();
    Log.info('🧹 All profiles cleared');
  }
}

/** Export singleton instance */
export const profileManager = ProfileManager.getInstance();

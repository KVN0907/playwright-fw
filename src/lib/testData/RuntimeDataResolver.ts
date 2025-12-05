/**
 * @fileoverview Runtime Data Resolver
 * @description Resolves and creates test data dynamically at runtime using builders
 * @version 1.0
 */

import Log from '../Log';
import { UserBuilder, User } from './builders/UserBuilder';
import { OrganizationBuilder, Organization } from './builders/OrganizationBuilder';
import { LocationBuilder, Location } from './builders/LocationBuilder';
import { ScenarioBuilder, TestScenario } from './builders/ScenarioBuilder';
import {
  runtimeConfig,
  RuntimeUserConfig,
  RuntimeOrgConfig,
  RuntimeLocationConfig,
} from './RuntimeDataConfig';

/* ===== RESOLVER OPTIONS ===== */

export interface ResolverOptions {
  useRuntimeConfig?: boolean;
  fallbackToDefaults?: boolean;
  cacheResolved?: boolean;
  logResolution?: boolean;
}

/* ===== RUNTIME DATA RESOLVER ===== */

/**
 * @class RuntimeDataResolver
 * @description Resolves runtime configuration into actual test data using builders
 */
export class RuntimeDataResolver {
  private static readonly DEFAULT_OPTIONS: ResolverOptions = {
    useRuntimeConfig: true,
    fallbackToDefaults: true,
    cacheResolved: true,
    logResolution: true,
  };

  /**
   * Resolve user from runtime config or create with defaults
   * @param identifier - User index, email, or specific config
   * @param options - Resolver options
   * @returns User object
   */
  static resolveUser(
    identifier?: number | string | RuntimeUserConfig,
    options: ResolverOptions = {}
  ): User {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // Check cache first
    if (opts.cacheResolved) {
      const cacheKey = `user_${JSON.stringify(identifier)}`;
      const cached = runtimeConfig.getResolvedData<User>(cacheKey);
      if (cached) {
        if (opts.logResolution) Log.info(`🔄 Using cached user: ${cached.email}`);
        return cached;
      }
    }

    let userConfig: RuntimeUserConfig | undefined;

    // Get config from different sources
    if (typeof identifier === 'object') {
      userConfig = identifier;
    } else if (opts.useRuntimeConfig) {
      userConfig = runtimeConfig.getUserConfig(identifier);
    }

    // Build user with config or defaults
    const builder = UserBuilder.create();

    if (userConfig) {
      if (opts.logResolution) {
        Log.info(`🔧 Resolving user from runtime config`, userConfig);
      }

      if (userConfig.name) {
        const [firstName, lastName] = userConfig.name.split(' ');
        builder.withName(firstName, lastName || 'User');
      }
      if (userConfig.email) builder.withEmail(userConfig.email);
      if (userConfig.password) builder.withPassword(userConfig.password);
      if (userConfig.role) builder.withRole(userConfig.role);
      if (userConfig.organization) builder.withOrganization(userConfig.organization);
    } else if (opts.fallbackToDefaults) {
      if (opts.logResolution) {
        Log.info('📝 Creating user with default values');
      }
    } else {
      throw new Error('No runtime user config found and fallback disabled');
    }

    const user = builder.build();

    // Cache if enabled
    if (opts.cacheResolved && identifier !== undefined) {
      const cacheKey = `user_${JSON.stringify(identifier)}`;
      runtimeConfig.storeResolvedData(cacheKey, user);
    }

    if (opts.logResolution) {
      Log.info(`✅ Resolved user: ${user.email} (${user.role})`);
    }

    return user;
  }

  /**
   * Resolve multiple users from runtime config
   * @param count - Number of users or specific configs
   * @param options - Resolver options
   * @returns Array of users
   */
  static resolveUsers(count: number | RuntimeUserConfig[], options: ResolverOptions = {}): User[] {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    if (Array.isArray(count)) {
      // Resolve specific configs
      return count.map(config => this.resolveUser(config, opts));
    }

    // Check runtime config first
    const runtimeUsers = runtimeConfig.getConfig().users || [];

    if (runtimeUsers.length > 0 && opts.useRuntimeConfig) {
      if (opts.logResolution) {
        Log.info(`🔧 Resolving ${Math.min(count, runtimeUsers.length)} users from runtime config`);
      }

      const users = runtimeUsers.slice(0, count).map(config => this.resolveUser(config, opts));

      // Fill remaining with defaults if needed
      if (users.length < count && opts.fallbackToDefaults) {
        const remaining = count - users.length;
        if (opts.logResolution) {
          Log.info(`📝 Creating ${remaining} additional users with defaults`);
        }
        const defaultUsers = UserBuilder.create().buildMultiple(remaining);
        users.push(...defaultUsers);
      }

      return users;
    }

    // Fallback to defaults
    if (opts.fallbackToDefaults) {
      if (opts.logResolution) {
        Log.info(`📝 Creating ${count} users with default values`);
      }
      return UserBuilder.create().buildMultiple(count);
    }

    throw new Error('No runtime user configs found and fallback disabled');
  }

  /**
   * Resolve organization from runtime config or create with defaults
   */
  static resolveOrganization(
    identifier?: number | string | RuntimeOrgConfig,
    options: ResolverOptions = {}
  ): Organization {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // Check cache
    if (opts.cacheResolved) {
      const cacheKey = `org_${JSON.stringify(identifier)}`;
      const cached = runtimeConfig.getResolvedData<Organization>(cacheKey);
      if (cached) {
        if (opts.logResolution) Log.info(`🔄 Using cached organization: ${cached.name}`);
        return cached;
      }
    }

    let orgConfig: RuntimeOrgConfig | undefined;

    if (typeof identifier === 'object') {
      orgConfig = identifier;
    } else if (opts.useRuntimeConfig) {
      orgConfig = runtimeConfig.getOrgConfig(identifier);
    }

    const builder = OrganizationBuilder.create();

    if (orgConfig) {
      if (opts.logResolution) {
        Log.info(`🔧 Resolving organization from runtime config`, orgConfig);
      }

      if (orgConfig.name) builder.withName(orgConfig.name);
      if (orgConfig.type) builder.withType(orgConfig.type);
    } else if (opts.fallbackToDefaults) {
      if (opts.logResolution) {
        Log.info('📝 Creating organization with default values');
      }
    } else {
      throw new Error('No runtime organization config found and fallback disabled');
    }

    const org = builder.build();

    // Cache
    if (opts.cacheResolved && identifier !== undefined) {
      const cacheKey = `org_${JSON.stringify(identifier)}`;
      runtimeConfig.storeResolvedData(cacheKey, org);
    }

    if (opts.logResolution) {
      Log.info(`✅ Resolved organization: ${org.name} (${org.type})`);
    }

    return org;
  }

  /**
   * Resolve location from runtime config or create with defaults
   */
  static resolveLocation(
    identifier?: number | string | RuntimeLocationConfig,
    options: ResolverOptions = {}
  ): Location {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    // Check cache
    if (opts.cacheResolved) {
      const cacheKey = `location_${JSON.stringify(identifier)}`;
      const cached = runtimeConfig.getResolvedData<Location>(cacheKey);
      if (cached) {
        if (opts.logResolution) Log.info(`🔄 Using cached location: ${cached.name}`);
        return cached;
      }
    }

    let locationConfig: RuntimeLocationConfig | undefined;

    if (typeof identifier === 'object') {
      locationConfig = identifier;
    } else if (opts.useRuntimeConfig) {
      locationConfig = runtimeConfig.getLocationConfig(identifier);
    }

    const builder = LocationBuilder.create();

    if (locationConfig) {
      if (opts.logResolution) {
        Log.info(`🔧 Resolving location from runtime config`, locationConfig);
      }

      if (locationConfig.name) builder.withName(locationConfig.name);
      if (locationConfig.type) builder.withType(locationConfig.type);
      if (locationConfig.entity) builder.withEntity(locationConfig.entity);
    } else if (opts.fallbackToDefaults) {
      if (opts.logResolution) {
        Log.info('📝 Creating location with default values');
      }
    } else {
      throw new Error('No runtime location config found and fallback disabled');
    }

    const location = builder.build();

    // Cache
    if (opts.cacheResolved && identifier !== undefined) {
      const cacheKey = `location_${JSON.stringify(identifier)}`;
      runtimeConfig.storeResolvedData(cacheKey, location);
    }

    if (opts.logResolution) {
      Log.info(`✅ Resolved location: ${location.name}`);
    }

    return location;
  }

  /**
   * Resolve complete scenario from runtime config
   * @param scenarioName - Scenario name
   * @param options - Resolver options
   * @returns Test scenario
   */
  static resolveScenario(scenarioName: string, options: ResolverOptions = {}): TestScenario {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    if (opts.logResolution) {
      Log.info(`🎬 Resolving scenario: ${scenarioName}`);
    }

    const builder = ScenarioBuilder.create(scenarioName);
    const config = runtimeConfig.getConfig();

    // Add organizations from runtime config
    if (config.organizations && config.organizations.length > 0) {
      config.organizations.forEach(orgConfig => {
        const org = this.resolveOrganization(orgConfig, opts);
        builder.withOrganization(org);
      });
    }

    // Add users from runtime config
    if (config.users && config.users.length > 0) {
      config.users.forEach(userConfig => {
        const user = this.resolveUser(userConfig, opts);
        builder.withUser(user);
      });
    }

    // Add locations from runtime config
    if (config.locations && config.locations.length > 0) {
      config.locations.forEach(locConfig => {
        const location = this.resolveLocation(locConfig, opts);
        builder.withLocation(location);
      });
    }

    // If no runtime config, create defaults
    if (!config.organizations?.length && !config.users?.length && !config.locations?.length) {
      if (opts.fallbackToDefaults) {
        if (opts.logResolution) {
          Log.info('📝 Creating scenario with default setup');
        }
        builder.withCompleteOrganization(3, 2);
      }
    }

    const scenario = builder.build();

    if (opts.logResolution) {
      Log.info(`✅ Resolved scenario: ${scenario.name}`);
      Log.info(`   Organizations: ${scenario.organizations.length}`);
      Log.info(`   Users: ${scenario.users.length}`);
      Log.info(`   Locations: ${scenario.locations.length}`);
    }

    return scenario;
  }

  /**
   * Auto-resolve: intelligently decide what to create based on runtime config
   */
  static autoResolve<T = unknown>(
    type: 'user' | 'organization' | 'location' | 'scenario',
    identifier?: unknown,
    options: ResolverOptions = {}
  ): T {
    switch (type) {
      case 'user':
        return this.resolveUser(identifier, options) as T;
      case 'organization':
        return this.resolveOrganization(identifier, options) as T;
      case 'location':
        return this.resolveLocation(identifier, options) as T;
      case 'scenario':
        return this.resolveScenario(identifier || 'Auto Scenario', options) as T;
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }

  /**
   * Clear all cached resolved data
   */
  static clearCache(): void {
    runtimeConfig.clear();
    Log.info('🧹 Cleared resolver cache');
  }
}

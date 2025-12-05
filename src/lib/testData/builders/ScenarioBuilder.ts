/**
 * @fileoverview Scenario Builder
 * @description Builder for creating complex test scenarios with related data
 * @version 1.0
 */

import { BaseBuilder, TestDataFactory } from '../TestDataFactory';
import { UserBuilder, User } from './UserBuilder';
import { OrganizationBuilder, Organization } from './OrganizationBuilder';
import { LocationBuilder, Location } from './LocationBuilder';
import Log from '../../Log';

/* ===== SCENARIO INTERFACES ===== */

export interface TestScenario {
  id: string;
  name: string;
  description?: string;
  users: User[];
  organizations: Organization[];
  locations: Location[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/* ===== SCENARIO BUILDER ===== */

/**
 * @class ScenarioBuilder
 * @description Fluent builder for creating complete test scenarios
 */
export class ScenarioBuilder extends BaseBuilder<TestScenario> {
  private constructor(name: string) {
    super();
    this.data = {
      id: TestDataFactory.generateTestId('scenario'),
      name,
      users: [],
      organizations: [],
      locations: [],
      metadata: {},
      createdAt: new Date(),
    };
  }

  /**
   * Create new scenario builder
   * @param name - Scenario name
   * @returns ScenarioBuilder instance
   */
  static create(name: string): ScenarioBuilder {
    return new ScenarioBuilder(name);
  }

  /**
   * Set scenario description
   * @param description - Description
   * @returns Builder instance
   */
  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  /**
   * Add user to scenario
   * @param user - User object or builder
   * @returns Builder instance
   */
  withUser(user: User | UserBuilder): this {
    if (!this.data.users) this.data.users = [];
    const userObj = user instanceof UserBuilder ? user.build() : user;
    this.data.users.push(userObj);
    return this;
  }

  /**
   * Add multiple users to scenario
   * @param count - Number of users
   * @param role - Optional role for all users
   * @returns Builder instance
   */
  withUsers(count: number, role?: string): this {
    for (let i = 0; i < count; i++) {
      const builder = UserBuilder.create();
      if (role) builder.withRole(role);
      this.withUser(builder);
    }
    return this;
  }

  /**
   * Add organization to scenario
   * @param organization - Organization object or builder
   * @returns Builder instance
   */
  withOrganization(organization: Organization | OrganizationBuilder): this {
    if (!this.data.organizations) this.data.organizations = [];
    const orgObj =
      organization instanceof OrganizationBuilder ? organization.build() : organization;
    this.data.organizations.push(orgObj);
    return this;
  }

  /**
   * Add multiple organizations to scenario
   * @param count - Number of organizations
   * @returns Builder instance
   */
  withOrganizations(count: number): this {
    for (let i = 0; i < count; i++) {
      this.withOrganization(OrganizationBuilder.create());
    }
    return this;
  }

  /**
   * Add location to scenario
   * @param location - Location object or builder
   * @returns Builder instance
   */
  withLocation(location: Location | LocationBuilder): this {
    if (!this.data.locations) this.data.locations = [];
    const locObj = location instanceof LocationBuilder ? location.build() : location;
    this.data.locations.push(locObj);
    return this;
  }

  /**
   * Add multiple locations to scenario
   * @param count - Number of locations
   * @returns Builder instance
   */
  withLocations(count: number): this {
    for (let i = 0; i < count; i++) {
      this.withLocation(LocationBuilder.create());
    }
    return this;
  }

  /**
   * Add metadata to scenario
   * @param key - Metadata key
   * @param value - Metadata value
   * @returns Builder instance
   */
  addMetadata(key: string, value: unknown): this {
    if (!this.data.metadata) this.data.metadata = {};
    this.data.metadata[key] = value;
    return this;
  }

  /**
   * Create a complete organization setup
   * @param userCount - Number of users
   * @param locationCount - Number of locations
   * @returns Builder instance
   */
  withCompleteOrganization(userCount: number = 5, locationCount: number = 3): this {
    // Create organization
    const org = OrganizationBuilder.create()
      .withName(`Test Organization ${Date.now()}`)
      .asEnterprise()
      .build();

    this.withOrganization(org);

    // Create users for the organization
    for (let i = 0; i < userCount; i++) {
      const user = UserBuilder.create()
        .withOrganization(org.name)
        .withRole(i === 0 ? 'admin' : 'user')
        .build();
      this.withUser(user);
    }

    // Create locations for the organization
    for (let i = 0; i < locationCount; i++) {
      this.withLocation(LocationBuilder.create());
    }

    return this;
  }

  /**
   * Create multi-tenant scenario
   * @param tenantCount - Number of tenants
   * @returns Builder instance
   */
  withMultiTenant(tenantCount: number): this {
    for (let i = 0; i < tenantCount; i++) {
      const org = OrganizationBuilder.create()
        .withName(`Tenant_${i + 1}_${Date.now()}`)
        .build();

      this.withOrganization(org);

      // Create admin user for each tenant
      const admin = UserBuilder.create().withOrganization(org.name).asAdmin().build();

      this.withUser(admin);
    }

    return this;
  }

  /**
   * Build the scenario object
   * @returns Complete scenario object
   */
  build(): TestScenario {
    const scenario: TestScenario = {
      id: this.data.id || TestDataFactory.generateTestId('scenario'),
      name: this.data.name || 'Unnamed Scenario',
      description: this.data.description,
      users: this.data.users || [],
      organizations: this.data.organizations || [],
      locations: this.data.locations || [],
      metadata: this.data.metadata || {},
      createdAt: this.data.createdAt || new Date(),
    };

    Log.info(`📦 Scenario built: ${scenario.name}`);
    Log.info(`  - Users: ${scenario.users.length}`);
    Log.info(`  - Organizations: ${scenario.organizations.length}`);
    Log.info(`  - Locations: ${scenario.locations.length}`);

    return scenario;
  }

  /**
   * Build and log scenario details
   * @returns Complete scenario object
   */
  buildWithLogs(): TestScenario {
    const scenario = this.build();

    Log.info('📊 Scenario Details:');
    if (scenario.users.length > 0) {
      Log.info('👥 Users:');
      scenario.users.forEach((user, idx) => {
        Log.info(`  ${idx + 1}. ${user.firstName} ${user.lastName} (${user.role})`);
      });
    }

    if (scenario.organizations.length > 0) {
      Log.info('🏢 Organizations:');
      scenario.organizations.forEach((org, idx) => {
        Log.info(`  ${idx + 1}. ${org.name} (${org.type})`);
      });
    }

    if (scenario.locations.length > 0) {
      Log.info('📍 Locations:');
      scenario.locations.forEach((loc, idx) => {
        Log.info(`  ${idx + 1}. ${loc.name} (${loc.type})`);
      });
    }

    return scenario;
  }
}

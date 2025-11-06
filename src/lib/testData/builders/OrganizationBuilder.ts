/**
 * @fileoverview Organization Builder
 * @description Builder pattern for creating organization test data
 * @version 1.0
 */

import { BaseBuilder, TestDataFactory } from '../TestDataFactory';

/* ===== ORGANIZATION INTERFACES ===== */

export interface Organization {
  id?: string;
  name: string;
  type: 'enterprise' | 'business' | 'startup' | 'nonprofit';
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  address?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  status: 'active' | 'inactive' | 'suspended';
  features: string[];
  settings: Record<string, any>;
  createdAt?: Date;
}

/* ===== ORGANIZATION BUILDER ===== */

/**
 * @class OrganizationBuilder
 * @description Fluent builder for creating organization test data
 */
export class OrganizationBuilder extends BaseBuilder<Organization> {
  private constructor() {
    super();
    // Set defaults
    this.data = {
      name: `Test Organization ${Date.now()}`,
      type: 'business',
      industry: 'Technology',
      size: 'medium',
      status: 'active',
      features: ['basic'],
      settings: {},
      createdAt: new Date(),
    };
  }

  /**
   * Create new organization builder
   * @returns OrganizationBuilder instance
   */
  static create(): OrganizationBuilder {
    return new OrganizationBuilder();
  }

  /**
   * Set organization name
   * @param name - Organization name
   * @returns Builder instance
   */
  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  /**
   * Set organization type
   * @param type - Organization type
   * @returns Builder instance
   */
  withType(type: 'enterprise' | 'business' | 'startup' | 'nonprofit'): this {
    this.data.type = type;

    // Auto-configure based on type
    if (type === 'enterprise') {
      this.data.size = 'enterprise';
      this.data.features = ['advanced', 'sso', 'audit', 'custom'];
    } else if (type === 'startup') {
      this.data.size = 'small';
      this.data.features = ['basic'];
    }

    return this;
  }

  /**
   * Set organization industry
   * @param industry - Industry name
   * @returns Builder instance
   */
  withIndustry(industry: string): this {
    this.data.industry = industry;
    return this;
  }

  /**
   * Set organization size
   * @param size - Organization size
   * @returns Builder instance
   */
  withSize(size: 'small' | 'medium' | 'large' | 'enterprise'): this {
    this.data.size = size;
    return this;
  }

  /**
   * Set organization address
   * @param address - Address
   * @param city - City
   * @param country - Country
   * @returns Builder instance
   */
  withAddress(address: string, city?: string, country?: string): this {
    this.data.address = address;
    if (city) this.data.city = city;
    if (country) this.data.country = country;
    return this;
  }

  /**
   * Set organization contact info
   * @param email - Email
   * @param phone - Phone
   * @param website - Website
   * @returns Builder instance
   */
  withContactInfo(email?: string, phone?: string, website?: string): this {
    if (email) this.data.email = email;
    if (phone) this.data.phone = phone;
    if (website) this.data.website = website;
    return this;
  }

  /**
   * Set organization status
   * @param status - Status
   * @returns Builder instance
   */
  withStatus(status: 'active' | 'inactive' | 'suspended'): this {
    this.data.status = status;
    return this;
  }

  /**
   * Set organization features
   * @param features - Array of features
   * @returns Builder instance
   */
  withFeatures(features: string[]): this {
    this.data.features = features;
    return this;
  }

  /**
   * Add feature to organization
   * @param feature - Feature to add
   * @returns Builder instance
   */
  addFeature(feature: string): this {
    if (!this.data.features) {
      this.data.features = [];
    }
    if (!this.data.features.includes(feature)) {
      this.data.features.push(feature);
    }
    return this;
  }

  /**
   * Set organization settings
   * @param settings - Settings object
   * @returns Builder instance
   */
  withSettings(settings: Record<string, any>): this {
    this.data.settings = { ...this.data.settings, ...settings };
    return this;
  }

  /**
   * Configure as enterprise
   * @returns Builder instance
   */
  asEnterprise(): this {
    return this.withType('enterprise')
      .withSize('enterprise')
      .withFeatures(['advanced', 'sso', 'audit', 'custom', 'api', 'support']);
  }

  /**
   * Configure as startup
   * @returns Builder instance
   */
  asStartup(): this {
    return this.withType('startup').withSize('small').withFeatures(['basic']);
  }

  /**
   * Configure as nonprofit
   * @returns Builder instance
   */
  asNonprofit(): this {
    return this.withType('nonprofit')
      .withIndustry('Nonprofit')
      .withFeatures(['basic', 'donations']);
  }

  /**
   * Build the organization object
   * @returns Complete organization object
   */
  build(): Organization {
    // Validate required fields
    if (!this.data.name) {
      throw new Error('Organization must have a name');
    }

    return {
      id: this.data.id || TestDataFactory.generateTestId('org'),
      name: this.data.name,
      type: this.data.type || 'business',
      industry: this.data.industry || 'Technology',
      size: this.data.size || 'medium',
      address: this.data.address,
      city: this.data.city,
      country: this.data.country,
      email: this.data.email,
      phone: this.data.phone,
      website: this.data.website,
      status: this.data.status || 'active',
      features: this.data.features || ['basic'],
      settings: this.data.settings || {},
      createdAt: this.data.createdAt || new Date(),
    };
  }
}

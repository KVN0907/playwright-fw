/**
 * @fileoverview Location Builder
 * @description Builder pattern for creating location/library test data
 * @version 1.0
 */

import { BaseBuilder, TestDataFactory } from '../TestDataFactory';
import { TestDataGenerator } from '../../generators/TestDataGenerator';

/* ===== LOCATION INTERFACES ===== */

export interface Location {
  id?: string;
  name?: string;
  address: string;
  attribute1: string;
  attribute2: string;
  countryId: number;
  entity: string;
  locationOwnerEmailId: string;
  locationOwnerName: string;
  regionName: string;
  stateId: number;
  type?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
  createdAt?: Date;
}

/* ===== LOCATION BUILDER ===== */

/**
 * @class LocationBuilder
 * @description Fluent builder for creating location test data
 */
export class LocationBuilder extends BaseBuilder<Location> {
  private constructor() {
    super();
    // Set defaults using existing TestDataGenerator
    const baseData = TestDataGenerator.generateLibraryData();
    this.data = {
      ...baseData,
      type: 'Office',
      capacity: 50,
      status: 'active',
      createdAt: new Date(),
    };
  }

  /**
   * Create new location builder
   * @returns LocationBuilder instance
   */
  static create(): LocationBuilder {
    return new LocationBuilder();
  }

  /**
   * Set location name
   * @param name - Location name
   * @returns Builder instance
   */
  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  /**
   * Set location address
   * @param address - Address
   * @returns Builder instance
   */
  withAddress(address: string): this {
    this.data.address = address;
    return this;
  }

  /**
   * Set location attributes
   * @param attribute1 - First attribute
   * @param attribute2 - Second attribute
   * @returns Builder instance
   */
  withAttributes(attribute1: string, attribute2: string): this {
    this.data.attribute1 = attribute1;
    this.data.attribute2 = attribute2;
    return this;
  }

  /**
   * Set location owner
   * @param name - Owner name
   * @param email - Owner email
   * @returns Builder instance
   */
  withOwner(name: string, email: string): this {
    this.data.locationOwnerName = name;
    this.data.locationOwnerEmailId = email;
    return this;
  }

  /**
   * Set location geography
   * @param countryId - Country ID
   * @param stateId - State ID
   * @param regionName - Region name
   * @returns Builder instance
   */
  withGeography(countryId: number, stateId: number, regionName: string): this {
    this.data.countryId = countryId;
    this.data.stateId = stateId;
    this.data.regionName = regionName;
    return this;
  }

  /**
   * Set location entity
   * @param entity - Entity name
   * @returns Builder instance
   */
  withEntity(entity: string): this {
    this.data.entity = entity;
    return this;
  }

  /**
   * Set location type
   * @param type - Location type
   * @returns Builder instance
   */
  withType(type: string): this {
    this.data.type = type;
    return this;
  }

  /**
   * Set location capacity
   * @param capacity - Capacity
   * @returns Builder instance
   */
  withCapacity(capacity: number): this {
    this.data.capacity = capacity;
    return this;
  }

  /**
   * Set location status
   * @param status - Status
   * @returns Builder instance
   */
  withStatus(status: 'active' | 'inactive'): this {
    this.data.status = status;
    return this;
  }

  /**
   * Configure as office
   * @returns Builder instance
   */
  asOffice(): this {
    return this.withType('Office').withCapacity(100);
  }

  /**
   * Configure as warehouse
   * @returns Builder instance
   */
  asWarehouse(): this {
    return this.withType('Warehouse').withCapacity(500);
  }

  /**
   * Configure as retail
   * @returns Builder instance
   */
  asRetail(): this {
    return this.withType('Retail').withCapacity(50);
  }

  /**
   * Configure with random data
   * @returns Builder instance
   */
  withRandomData(): this {
    const randomData = TestDataGenerator.generateLibraryData();
    this.data = { ...this.data, ...randomData };
    return this;
  }

  /**
   * Build the location object
   * @returns Complete location object
   */
  build(): Location {
    // Validate required fields
    if (!this.data.address || !this.data.entity) {
      throw new Error('Location must have address and entity');
    }

    return {
      id: this.data.id || TestDataFactory.generateTestId('loc'),
      name: this.data.name || `Location_${Date.now()}`,
      address: this.data.address,
      attribute1: this.data.attribute1 || 'Test Attribute 1',
      attribute2: this.data.attribute2 || 'Test Attribute 2',
      countryId: this.data.countryId || TestDataGenerator.generateCountryId(),
      entity: this.data.entity,
      locationOwnerEmailId: this.data.locationOwnerEmailId || 'owner@test.com',
      locationOwnerName: this.data.locationOwnerName || 'Test Owner',
      regionName: this.data.regionName || TestDataGenerator.generateRegion(),
      stateId: this.data.stateId || TestDataGenerator.generateStateId(),
      type: this.data.type,
      capacity: this.data.capacity,
      status: this.data.status || 'active',
      createdAt: this.data.createdAt || new Date(),
    };
  }
}

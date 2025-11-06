/**
 * @fileoverview Test Data Factory
 * @description Central factory for creating test data with builder patterns
 * @version 1.0
 */

import { Utils } from '../Utils';
import Log from '../Log';

/* ===== BASE BUILDER ===== */

/**
 * @abstract BaseBuilder
 * @description Abstract base class for test data builders
 */
export abstract class BaseBuilder<T> {
  protected data: Partial<T> = {};

  /**
   * Build the final object
   * @returns Built object
   */
  abstract build(): T | Promise<T>;

  /**
   * Reset builder to initial state
   * @returns Builder instance for chaining
   */
  reset(): this {
    this.data = {};
    return this;
  }

  /**
   * Set a custom property
   * @param key - Property key
   * @param value - Property value
   * @returns Builder instance for chaining
   */
  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }
}

/* ===== TEST DATA FACTORY ===== */

/**
 * @class TestDataFactory
 * @description Factory for creating complex test data scenarios
 */
export class TestDataFactory {
  private static readonly DEFAULT_PASSWORD = 'Test@123456';

  /**
   * Generate unique test identifier
   * @param prefix - Optional prefix
   * @returns Unique identifier
   */
  static generateTestId(prefix: string = 'test'): string {
    return `${prefix}_${Date.now()}_${Utils.String.generate(6, 'ALPHANUMERIC')}`;
  }

  /**
   * Generate timestamp-based unique name
   * @param baseName - Base name
   * @returns Unique name with timestamp
   */
  static generateUniqueName(baseName: string): string {
    return `${baseName}_${Date.now()}`;
  }

  /**
   * Generate random data based on type
   * @param type - Data type
   * @param options - Generation options
   * @returns Generated data
   */
  static generate<T = any>(
    type: 'email' | 'name' | 'phone' | 'address' | 'url' | 'date' | 'number',
    options?: Record<string, any>
  ): T {
    switch (type) {
      case 'email':
        return Utils.String.generateEmail(options?.domain, options?.length) as T;
      case 'name':
        return this.generateName(options?.gender) as T;
      case 'phone':
        return this.generatePhone(options?.format) as T;
      case 'address':
        return this.generateAddress(options?.country) as T;
      case 'url':
        return this.generateUrl(options?.protocol, options?.domain) as T;
      case 'date':
        return Utils.DateTime.generate(options?.format || 'YYYY-MM-DD', options?.adjustment) as T;
      case 'number':
        return Utils.String.generateInteger(options?.length || 6) as T;
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }

  /**
   * Generate random name
   * @param gender - Optional gender
   * @returns Random name
   */
  private static generateName(gender?: 'male' | 'female'): string {
    const firstNames = {
      male: ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Thomas'],
      female: ['Mary', 'Jennifer', 'Linda', 'Patricia', 'Elizabeth', 'Susan', 'Jessica', 'Sarah'],
    };
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
    ];

    const genderType = gender || (Math.random() > 0.5 ? 'male' : 'female');
    const firstName =
      firstNames[genderType][Math.floor(Math.random() * firstNames[genderType].length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }

  /**
   * Generate random phone number
   * @param format - Phone format
   * @returns Phone number
   */
  private static generatePhone(format: string = 'US'): string {
    if (format === 'US') {
      const area = Utils.String.generateInteger(3);
      const prefix = Utils.String.generateInteger(3);
      const line = Utils.String.generateInteger(4);
      return `+1-${area}-${prefix}-${line}`;
    }
    return `+${Utils.String.generateInteger(12)}`;
  }

  /**
   * Generate random address
   * @param country - Country code
   * @returns Address
   */
  private static generateAddress(country: string = 'US'): string {
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd'];
    const street = streets[Math.floor(Math.random() * streets.length)];
    return `${streetNumber} ${street}`;
  }

  /**
   * Generate random URL
   * @param protocol - Protocol
   * @param domain - Domain
   * @returns URL
   */
  private static generateUrl(protocol: string = 'https', domain?: string): string {
    const generatedDomain = domain || `${Utils.String.generate(8, 'ALPHA').toLowerCase()}.com`;
    return `${protocol}://${generatedDomain}`;
  }

  /**
   * Create data from template with overrides
   * @param template - Base template
   * @param overrides - Property overrides
   * @returns Merged data
   */
  static fromTemplate<T>(template: T, overrides: Partial<T> = {}): T {
    return { ...template, ...overrides };
  }

  /**
   * Create multiple instances of data
   * @param count - Number of instances
   * @param generator - Generator function
   * @returns Array of generated data
   */
  static createMultiple<T>(count: number, generator: (index: number) => T): T[] {
    return Array.from({ length: count }, (_, index) => generator(index));
  }

  /**
   * Generate random subset from array
   * @param items - Source array
   * @param count - Number of items to select
   * @returns Random subset
   */
  static randomSubset<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, items.length));
  }

  /**
   * Generate test credentials
   * @param username - Username
   * @returns Credentials object
   */
  static generateCredentials(username?: string): { username: string; password: string } {
    return {
      username: username || Utils.String.generateEmail(),
      password: this.DEFAULT_PASSWORD,
    };
  }
}

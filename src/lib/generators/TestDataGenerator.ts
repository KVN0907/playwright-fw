/**
 * Dynamic test data generator - like Cypress fixtures but runtime generated
 * Generates realistic test data for API requests
 */
export class TestDataGenerator {
  /**
   * Generate unique identifiers
   */
  static generateId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateUniqueNumber(): number {
    return Math.floor(Math.random() * 9000) + 1000;
  }

  /**
   * Generate address data
   */
  static generateAddress(): string {
    const addresses = [
      '123 Test Street, Suite 100',
      '456 Sample Avenue, Floor 5',
      '789 Demo Boulevard, Unit A',
      '321 Mock Lane, Building B',
      '654 Trial Road, Office 200',
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  /**
   * Generate random attributes for testing
   */
  static generateAttribute(): string {
    const attributes = [
      'High Priority',
      'Standard Access',
      'Restricted',
      'Public',
      'Internal Use',
      'Confidential',
      'Test Environment',
      'Production Ready',
    ];
    return attributes[Math.floor(Math.random() * attributes.length)];
  }

  /**
   * Generate entity names
   */
  static generateEntity(): string {
    const entities = [
      'EY_LLP',
      'EY_GLOBAL',
      'EY_INDIA',
      'EY_US',
      'EY_UK',
      'EY_CANADA',
      'EY_AUSTRALIA',
    ];
    return entities[Math.floor(Math.random() * entities.length)];
  }

  /**
   * Generate region names
   */
  static generateRegion(): string {
    const regions = ['ASIA', 'EUROPE', 'AMERICAS', 'OCEANIA', 'AFRICA'];
    return regions[Math.floor(Math.random() * regions.length)];
  }

  /**
   * Generate country and state IDs (realistic ranges)
   */
  static generateCountryId(): number {
    return Math.floor(Math.random() * 200) + 1;
  }

  static generateStateId(): number {
    return Math.floor(Math.random() * 9000) + 1000;
  }

  /**
   * Generate library-specific test data with dynamic values
   * Only name and email are kept static as per requirement
   */
  static generateLibraryData(
    overrides: Partial<Record<string, unknown>> = {}
  ): Record<string, unknown> {
    const defaultData = {
      address: this.generateAddress(),
      attribute1: this.generateAttribute(),
      attribute2: this.generateAttribute(),
      countryId: this.generateCountryId(),
      entity: this.generateEntity(),
      locationOwnerEmailId: overrides.locationOwnerEmailId || 'puspalata.biswal@in.ey.com',
      locationOwnerName: overrides.locationOwnerName || 'puspalata biswal',
      regionName: this.generateRegion(),
      stateId: this.generateStateId(),
    };

    // Merge with any provided overrides
    return { ...defaultData, ...overrides };
  }

  /**
   * Generate test timestamp
   */
  static generateTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Generate test data with unique suffix for easy identification
   */
  static generateUniqueTestData(baseName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 4);
    return `${baseName}_${timestamp}_${randomSuffix}`;
  }

  /**
   * Load and merge with base request JSON
   */
  static async loadRequestTemplate(
    templatePath: string,
    dynamicOverrides: Partial<Record<string, unknown>> = {}
  ): Promise<Record<string, unknown>> {
    try {
      const fs = await import('fs-extra');
      const baseRequest = await fs.readJson(templatePath);

      // Generate dynamic data for library
      const dynamicData = this.generateLibraryData(dynamicOverrides);

      // Merge base template with dynamic data
      return { ...baseRequest, ...dynamicData };
    } catch {
      console.warn(`Could not load template from ${templatePath}, using dynamic data only`);
      return this.generateLibraryData(dynamicOverrides);
    }
  }
}

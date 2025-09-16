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
   * Generate random string with specified character length
   * @param characterLength - Length of the string to generate
   * @returns Random string with custom prefix
   */
  static generateRandomString(characterLength: number): string {
    const possible = 'AutoQAABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-';
    return Array.from({ length: characterLength }, () =>
      possible.charAt(Math.floor(Math.random() * possible.length))
    ).join('');
  }

  /**
   * Generate random integer as string with specified length
   * @param length - Length of the integer string
   * @returns Random integer as string
   */
  static generateRandomInteger(length: number): string {
    const randomDigits = Array.from({ length: length }, () => Math.floor(Math.random() * 10));
    return randomDigits.join('');
  }

  /**
   * Generate random email address for testing
   * @returns Random email with gmail.com domain
   */
  static generateRandomEmail(): string {
    return Math.random().toString(36).substring(2, 8) + '@gmail.com';
  }
}

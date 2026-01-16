/**
 * Shared Test Utilities
 * Common utilities used across API tests
 */

import { faker } from '@faker-js/faker';
import { APIResponse } from '@playwright/test';

// Counter for generating short unique IDs within a test run
let uniqueCounter = 0;

/**
 * Generate a short unique ID for test data
 * Returns: 1, 2, 3, ... 9, a, b, c, ... z
 */
export function getUniqueId(): string {
  uniqueCounter++;
  return uniqueCounter <= 9 ? String(uniqueCounter) : String.fromCharCode(87 + uniqueCounter);
}

/**
 * Reset the unique counter (call in beforeAll if needed)
 */
export function resetUniqueCounter(): void {
  uniqueCounter = 0;
}

/**
 * Generate a realistic email address with unique suffix
 * @param domain - Email domain (default: 'ey.com')
 */
export function generateEmail(domain: string = 'ey.com'): string {
  const firstName = faker.person.firstName().toLowerCase();
  const lastName = faker.person.lastName().toLowerCase();
  return `${firstName}.${lastName}.${getUniqueId()}@${domain}`;
}

/**
 * Generate a realistic company/client name with unique suffix
 */
export function generateClientName(): string {
  return `${faker.company.name()} ${getUniqueId()}`;
}

/**
 * Generate a realistic regulatory area name with unique suffix
 */
export function generateRegAreaName(): string {
  return `${faker.commerce.department()} Compliance ${getUniqueId()}`;
}

/**
 * Generate a realistic person name with unique suffix
 */
export function generatePersonName(): string {
  return `${faker.person.fullName()} ${getUniqueId()}`;
}

/**
 * Log API response details for debugging failed tests
 */
export async function logResponse(response: APIResponse, context?: string): Promise<void> {
  const prefix = context ? `[${context}] ` : '';
  console.log(`${prefix}Status: ${response.status()}`);
  console.log(`${prefix}URL: ${response.url()}`);
  try {
    const body = await response.json();
    console.log(`${prefix}Body:`, JSON.stringify(body, null, 2));
  } catch {
    const text = await response.text();
    console.log(`${prefix}Body (text):`, text.substring(0, 500));
  }
}

/**
 * Assert response status with detailed logging on failure
 */
export async function expectStatus(
  response: APIResponse,
  expectedStatus: number | number[],
  context?: string
): Promise<void> {
  const status = response.status();
  const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];

  if (!expected.includes(status)) {
    await logResponse(response, context);
    throw new Error(
      `${context ? `[${context}] ` : ''}Expected status ${expected.join(' or ')}, got ${status}`
    );
  }
}

/**
 * Cleanup tracker for managing test resources
 */
export class CleanupTracker {
  private resources: Array<{ type: string; id: number; deleteFn: () => Promise<void> }> = [];

  /**
   * Track a resource for cleanup
   */
  track(type: string, id: number, deleteFn: () => Promise<void>): void {
    this.resources.push({ type, id, deleteFn });
  }

  /**
   * Execute all cleanup operations in reverse order
   */
  async cleanup(): Promise<void> {
    const errors: string[] = [];

    for (const resource of [...this.resources].reverse()) {
      try {
        await resource.deleteFn();
      } catch (error) {
        errors.push(`Failed to cleanup ${resource.type} #${resource.id}: ${error}`);
      }
    }

    this.resources = [];

    if (errors.length > 0) {
      console.warn('Cleanup errors:', errors);
    }
  }

  /**
   * Get count of tracked resources
   */
  get count(): number {
    return this.resources.length;
  }
}

/**
 * @fileoverview Response Validators - DEPRECATED
 * @deprecated This file is deprecated. Use individual validators from ./validation/index.ts instead:
 * - AccountValidator from './AccountValidator'
 * - OrganizationValidator from './OrganizationValidator'
 * - BaseValidator for custom validators
 *
 * This file will be removed in a future version.
 */

// Re-export from the new location for backward compatibility
export { AccountValidator } from './AccountValidator';
export { OrganizationValidator } from './OrganizationValidator';
export { BaseValidator as ResponseValidator } from './BaseValidator';

// Re-export types
export type { AccountDetails as AccountData } from './AccountValidator';
export type { ValidationConfig, ResponseSchema } from './BaseValidator';

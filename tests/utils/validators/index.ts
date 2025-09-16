// Export all validators from a single entry point
export { BaseValidator } from './BaseValidator';
export { AccountValidator } from './AccountValidator';
export { Document360Validator } from './Document360Validator';
// export { OrganizationValidator } from './OrganizationValidator';

// Export types
export type { ValidationConfig, ResponseSchema } from './BaseValidator';
export type { AccountDetails } from './AccountValidator';
// export type { OrganizationDetails } from './OrganizationValidator';

// Re-export commonly used validator factory
import { AccountValidator } from './AccountValidator';
// import { OrganizationValidator } from './OrganizationValidator';

export class ValidatorFactory {
  static getAccountValidator() {
    return AccountValidator;
  }

  // static getOrganizationValidator() {
  //   return OrganizationValidator;
  // }
}

/**
 * @fileoverview Error Module Exports
 * @description Central export point for all framework errors
 */

export {
  FrameworkError,
  PageObjectError,
  ElementError,
  APIError,
  ConfigurationError,
  TestDataError,
  ValidationError,
  TimeoutError,
  AuthenticationError,
  ErrorFactory,
  isFrameworkError,
  wrapError,
} from './FrameworkErrors';

/**
 * Shared Test Resources
 *
 * This folder contains shared resources used across API tests:
 *
 * - endPointsDTO/    - API endpoint URI definitions
 * - requestJson/     - Sample request payloads for tests
 * - responseJson/    - Expected response schemas for validation
 * - testFiles/       - Test data files (uploads, etc.)
 *
 * Usage:
 *   import endpoints from '../shared/endPointsDTO/uri.json';
 *   import createRequest from '../shared/requestJson/createLibraryRequest.json';
 */

export const SHARED_PATHS = {
  endPointsDTO: './endPointsDTO',
  requestJson: './requestJson',
  responseJson: './responseJson',
  testFiles: './testFiles',
};

export default SHARED_PATHS;

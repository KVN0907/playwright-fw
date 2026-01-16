/**
 * API Endpoints - Type-safe wrapper for endpoint definitions
 *
 * Usage:
 *   import { API, buildUrl } from '../shared/apiEndpoints';
 *
 *   // Get full URL
 *   const url = API.admin.clients.getAll;  // '/clients'
 *   const fullUrl = `${API.admin.basePath}${API.admin.clients.getAll}`;
 *
 *   // With path parameters
 *   const url = buildUrl(API.admin.clients.getById, { id: 123 });
 */

import adminEndpoints from './endPointsDTO/security-service-uri.json';
import complianceEndpoints from './endPointsDTO/compliancemanager-service-uri.json';

// Type definitions for endpoint structures
interface AdminEndpoints {
  basePath: string;
  eyAdmins: {
    base: string;
    getAll: string;
    create: string;
    update: string;
    getById: string;
    updateStatus: string;
  };
  clients: {
    base: string;
    getAll: string;
    create: string;
    getById: string;
    update: string;
    updateStatus: string;
    searchByName: string;
  };
  users: {
    base: string;
    getAll: string;
    create: string;
    getById: string;
    update: string;
    updateStatus: string;
    delete: string;
  };
  clientAdmins: {
    base: string;
    assignCountries: string;
  };
  roles: {
    base: string;
    getAll: string;
    create: string;
  };
}

interface ComplianceEndpoints {
  basePath: string;
  regArea: {
    base: string;
    getAll: string;
    create: string;
    update: string;
    delete: string;
    getById: string;
  };
  questions: {
    base: string;
    getAll: string;
    create: string;
    update: string;
    delete: string;
    deleteByIds: string;
    getByRegAreaId: string;
    getByRegAreaAndTenant: string;
    upload: string;
  };
  countryQuestionsMapping: {
    base: string;
    create: string;
    saveAll: string;
    getByClientCountryId: string;
    triggerQuestions: string;
    assignQuestions: string;
    assignedCountries: string;
    assignedQuestions: string;
    submitQuestionnaire: string;
    approveQuestionnaire: string;
  };
  questionnaireResponses: {
    base: string;
    save: string;
    requestInfo: string;
    requestInfoRegArea: string;
    requestInfoList: string;
    exportAll: string;
    exportByCountries: string;
    exportByRegArea: string;
  };
  countries: {
    base: string;
    getAll: string;
  };
}

// Export typed endpoints
export const API = {
  admin: adminEndpoints as AdminEndpoints,
  compliance: complianceEndpoints as ComplianceEndpoints,
} as const;

/**
 * Build a URL by replacing path parameters
 * @param template - URL template with {param} placeholders
 * @param params - Object with parameter values
 *
 * @example
 * buildUrl('/users/{id}', { id: 123 }) // '/users/123'
 * buildUrl('/questions/{regAreaId}', { regAreaId: 5 }) // '/questions/5'
 */
export function buildUrl(template: string, params: Record<string, string | number>): string {
  let url = template;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, String(value));
  }
  return url;
}

/**
 * Get full API URL with base path
 */
export function getAdminUrl(endpoint: string): string {
  return `${API.admin.basePath}${endpoint}`;
}

export function getComplianceUrl(endpoint: string): string {
  return `${API.compliance.basePath}${endpoint}`;
}

// Convenience exports for common base paths
export const ADMIN_API = API.admin.basePath;
export const COMPLIANCE_API = API.compliance.basePath;

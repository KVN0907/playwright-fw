import { ResponseSchema } from './BaseValidator';

// Common regex patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Central schema registry for all API endpoints
 * Add new endpoint schemas here instead of creating new validators
 */
export const API_SCHEMAS = {
  // User endpoints
  'GET /user': {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    email: { type: 'string', required: true, pattern: EMAIL_REGEX },
    status: { type: 'string', required: true, enum: ['active', 'inactive'] as ('active' | 'inactive')[] },
  },

  'POST /user': {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    createdAt: { type: 'string', required: true },
  },

  // Organization endpoints
  'GET /organization': {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    memberCount: { type: 'number', required: true, min: 0 },
  },

  // Project endpoints
  'GET /project': {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true },
    status: { type: 'string', required: true },
  },

  // Add more schemas as needed...
} as const;

export type EndpointKey = keyof typeof API_SCHEMAS;
export type EndpointSchemas = typeof API_SCHEMAS;

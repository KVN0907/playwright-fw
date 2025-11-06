import { APIResponse } from '@playwright/test';
import { BaseValidator, ResponseSchema } from './BaseValidator';

export interface OrganizationDetails {
  id: string;
  name: string;
  type: string;
  status: string;
  memberCount: number;
  createdAt: string;
  settings: {
    allowPublicAccess: boolean;
    maxMembers: number;
  };
}

/**
 * Organization endpoint response validator
 * Handles validation for /organization endpoints
 */
export class OrganizationValidator extends BaseValidator {
  // Business rule constants
  private static readonly ENTERPRISE_MIN_MEMBERS = 50;
  private static readonly INDIVIDUAL_MAX_MEMBERS = 5;

  private static readonly ORGANIZATION_SCHEMA: ResponseSchema = {
    id: {
      type: 'string',
      required: true,
      minLength: 1,
    },
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    type: {
      type: 'string',
      required: true,
      enum: ['enterprise', 'team', 'individual'],
    },
    status: {
      type: 'string',
      required: true,
      enum: ['active', 'suspended', 'trial'],
    },
    memberCount: {
      type: 'number',
      required: true,
      min: 0,
      max: 10000,
    },
    createdAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    },
    settings: {
      type: 'object',
      required: true,
    },
  };

  private static readonly SETTINGS_SCHEMA: ResponseSchema = {
    allowPublicAccess: {
      type: 'boolean',
      required: true,
    },
    maxMembers: {
      type: 'number',
      required: true,
      min: 1,
      max: 10000,
    },
  };

  /**
   * Validate organization response with comprehensive checks
   */
  static async validateOrganizationResponse(response: APIResponse): Promise<OrganizationDetails> {
    const data = await this.validateResponse<OrganizationDetails>(
      response,
      this.ORGANIZATION_SCHEMA,
      200,
      'GET /organization'
    );

    // Validate nested settings object
    this.validateAgainstSchema(data.settings as Record<string, unknown>, this.SETTINGS_SCHEMA);

    // Business rule validations
    this.validateBusinessRules(data);

    return data;
  }

  /**
   * Custom validation for organization business rules
   */
  static validateBusinessRules(org: OrganizationDetails): void {
    // Enterprise organizations should have higher member limits
    if (
      org.type === 'enterprise' &&
      org.settings.maxMembers < OrganizationValidator.ENTERPRISE_MIN_MEMBERS
    ) {
      throw new Error(
        `Enterprise organizations must support at least ${OrganizationValidator.ENTERPRISE_MIN_MEMBERS} members`
      );
    }

    // Individual organizations should have limited members
    if (
      org.type === 'individual' &&
      org.settings.maxMembers > OrganizationValidator.INDIVIDUAL_MAX_MEMBERS
    ) {
      throw new Error(
        `Individual organizations cannot exceed ${OrganizationValidator.INDIVIDUAL_MAX_MEMBERS} members`
      );
    }

    // Member count should not exceed max members setting
    if (org.memberCount > org.settings.maxMembers) {
      throw new Error('Current member count exceeds maximum allowed members');
    }

    // Suspended organizations should not allow public access
    if (org.status === 'suspended' && org.settings.allowPublicAccess) {
      throw new Error('Suspended organizations cannot have public access enabled');
    }
  }

  /**
   * Validate organization creation response
   */
  static async validateCreateOrganizationResponse(
    response: APIResponse
  ): Promise<OrganizationDetails> {
    return this.validateResponse<OrganizationDetails>(
      response,
      this.ORGANIZATION_SCHEMA,
      201,
      'POST /organization'
    );
  }
}

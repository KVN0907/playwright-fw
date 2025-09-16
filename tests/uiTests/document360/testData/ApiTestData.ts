/**
 * Test Data Configuration for Document360 API Documentation Tests
 * Centralized configuration for URLs, test data, and constants
 */

export const ApiTestData = {
  // API URLs for testing
  urls: {
    movieDatabaseApi: 'https://api.apis.guru/v2/specs/themoviedb.org/3/openapi.yaml',
    invalidUrl: 'invalid-url-format',
    unreachableUrl: 'https://nonexistent-domain-for-testing.com/api.json',
    exampleUrl: 'https://example.com/api.json',
    cicdWebhookUrl: 'https://api.example.com/webhook/openapi',
  },

  // API names and descriptions
  apiInfo: {
    movieDatabase: {
      name: 'Movie Database API',
      description: 'Comprehensive movie and entertainment API for testing',
    },
    draft: {
      name: 'Draft API Documentation',
      description: 'Draft version of API documentation for testing',
    },
    complete: {
      name: 'Movie Database API - Complete',
      description: 'Complete API documentation with all details',
    },
    e2eTest: {
      name: 'Movie Database API - E2E Test',
      description: 'End-to-end testing API documentation',
    },
    published: {
      name: 'Published API Documentation',
      description: 'Comprehensive API documentation for testing',
    },
    externalIntegration: {
      name: 'External Integration Test',
      description: 'API for testing external integration workflows',
    },
    uploaded: {
      name: 'Uploaded API Documentation',
      description: 'API documentation created via file upload',
    },
    cicdIntegrated: {
      name: 'CI/CD Integrated API',
      description: 'API documentation with CI/CD integration',
    },
  },

  // Search terms and queries
  searchTerms: {
    pet: 'pet',
    user: 'user',
    api: 'api',
    movie: 'movie',
    general: 'documentation',
  },

  // Navigation and UI elements
  navigation: {
    versions: {
      v1: 'v1',
      v10: 'v1.0',
    },
    categories: {
      testCategory: 'Test Category',
    },
    filters: {
      get: 'GET',
      post: 'POST',
      all: 'All',
    },
  },

  // Form validation messages
  validation: {
    required: 'required',
    invalid: 'invalid',
    error: 'error',
  },

  // Success and error messages
  messages: {
    success: 'success',
    error: 'error',
    created: 'created successfully',
    updated: 'updated successfully',
    deleted: 'deleted successfully',
  },

  // File paths for testing (when needed)
  files: {
    sampleApiDefinition: 'test-data/sample-api.json',
    uploadTestFile: 'test-data/upload-test.yaml',
  },

  // Timeouts and delays
  timeouts: {
    default: 30000,
    short: 10000,
    long: 60000,
    retry: 3,
  },

  // Project information
  project: {
    defaultName: 'Pet Store API Testing',
    testProjectPattern: /Pet Store API Testing/,
    siteUrlPattern: /.*document360\.io/,
  },

  // URL patterns for validation
  urlPatterns: {
    apiDocumentation: /.*api-documentation.*/,
    settings: /.*settings.*/,
    portal: /.*portal\.document360\.io.*/,
    dashboard: /.*dashboard.*/,
  },
};

/**
 * Test Data Helper Functions
 */
export class TestDataHelper {
  /**
   * Get API URL by type
   */
  static getApiUrl(
    type: 'movieDatabase' | 'invalid' | 'unreachable' | 'example' | 'cicdWebhook'
  ): string {
    const urlMap = {
      movieDatabase: ApiTestData.urls.movieDatabaseApi,
      invalid: ApiTestData.urls.invalidUrl,
      unreachable: ApiTestData.urls.unreachableUrl,
      example: ApiTestData.urls.exampleUrl,
      cicdWebhook: ApiTestData.urls.cicdWebhookUrl,
    };
    return urlMap[type];
  }

  /**
   * Get API info by type
   */
  static getApiInfo(type: keyof typeof ApiTestData.apiInfo): { name: string; description: string } {
    return ApiTestData.apiInfo[type];
  }

  /**
   * Get search term by type
   */
  static getSearchTerm(type: keyof typeof ApiTestData.searchTerms): string {
    return ApiTestData.searchTerms[type];
  }

  /**
   * Get timeout value
   */
  static getTimeout(type: keyof typeof ApiTestData.timeouts): number {
    return ApiTestData.timeouts[type];
  }

  /**
   * Get URL pattern for validation
   */
  static getUrlPattern(type: keyof typeof ApiTestData.urlPatterns): RegExp {
    return ApiTestData.urlPatterns[type];
  }

  /**
   * Generate unique API name with timestamp
   */
  static generateUniqueApiName(baseName: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    return `${baseName} - ${timestamp}`;
  }

  /**
   * Get random search term
   */
  static getRandomSearchTerm(): string {
    const terms = Object.values(ApiTestData.searchTerms);
    return terms[Math.floor(Math.random() * terms.length)];
  }
}

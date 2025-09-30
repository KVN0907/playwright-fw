import Log from './Log';

// Import all test data files
import * as projectData from '../data/projectCreationTestData.json';
import * as schemaData from '../data/userSchemaValidation.json';
import * as endpointData from '../data/apiEndpointTestData.json';
import * as navigationData from '../data/navigationTestData.json';
import * as validationData from '../data/validationMessages.json';
import * as configData from '../data/testConfiguration.json';
import * as petStoreData from '../data/petStoreTestData.json';
import * as petSchemaData from '../data/petSchemaValidation.json';
import * as publishingData from '../data/publishingTestData.json';

export interface EndpointData {
  name: string;
  method: string;
  path: string;
  description: string;
  security: {
    type: string;
    tokenType: string;
  };
  pathParameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    contentType: string;
    required: boolean;
  };
  responseCodes: string[];
  primaryResponseCode: string;
}

export interface SchemaProperty {
  name: string;
  type: string;
  description: string;
  required: boolean;
  example?: string;
}

export interface SchemaData {
  endpoint: string;
  method: string;
  responseCode: string;
  contentType: string;
  schemaType: string;
  properties: SchemaProperty[];
}

export interface PetStoreEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  category: string;
  publishingComment?: string;
  pathParameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  security?: {
    keyName: string;
    location: string;
  };
  tryItData?: {
    apiKey: string;
    petId: string;
  };
  responseCodes?: string[]; // Add this property
  primaryResponseCode?: string; // Add this property
}

export interface PetSchemaData {
  endpoint: string;
  method: string;
  responseCode: string;
  contentType: string;
  schemaType: string;
  requiredFields: string[];
  properties: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    example?: any;
    itemType?: string;
    nestedFields?: string[];
    enumValues?: string[];
  }>;
}

export class TestDataManager {
  
  /**
   * Get project configuration data
   */
  static getProjectConfig() {
    return projectData.projectCreation.defaultProject;
  }

  /**
   * Get URL-based project configuration data
   */
  static getUrlBasedProjectConfig() {
    return projectData.projectCreation.urlBasedProject;
  }

  /**
   * Get API URL for URL-based setup
   */
  static getApiUrl(setupType: 'url' | 'default' = 'url'): string {
    if (setupType === 'url') {
      const urlBasedProject = this.getUrlBasedProjectConfig();
      if (!urlBasedProject.apiUrl) {
        throw new Error('API URL not found in URL-based project configuration');
      }
      Log.info(`Loading API URL from URL-based project: ${urlBasedProject.apiUrl}`);
      return urlBasedProject.apiUrl;
    }
    
    // Fallback to apiDocumentationOptions
    const apiOptions = projectData.apiDocumentationOptions.url;
    if (!apiOptions.apiUrl) {
      throw new Error('API URL not found in API documentation options');
    }
    Log.info(`Loading API URL from documentation options: ${apiOptions.apiUrl}`);
    return apiOptions.apiUrl;
  }

  /**
   * Get project configuration by type
   */
  static getProjectConfigByType(projectType: 'default' | 'custom' | 'urlBased' | 'knowledgeBase') {
    const configMap = {
      default: projectData.projectCreation.defaultProject,
      custom: projectData.projectCreation.customProject,
      urlBased: projectData.projectCreation.urlBasedProject,
      knowledgeBase: projectData.projectCreation.knowledgeBaseProject
    };

    const config = configMap[projectType];
    if (!config) {
      throw new Error(`Project configuration not found for type: ${projectType}`);
    }

    Log.info(`Loading project config for type: ${projectType}`);
    return config;
  }

  /**
   * Get API documentation options by setup type
   */
  static getApiDocumentationOptions(setupType: 'sample' | 'upload' | 'url') {
    const options = projectData.apiDocumentationOptions[setupType];
    if (!options) {
      throw new Error(`API documentation options not found for setup type: ${setupType}`);
    }
    Log.info(`Loading API documentation options for: ${setupType}`);
    return options;
  }

  /**
   * Validate API URL format
   */
  static validateApiUrl(apiUrl: string): boolean {
    try {
      const url = new URL(apiUrl);
      const validExtensions = ['.json', '.yaml', '.yml'];
      const hasValidExtension = validExtensions.some(ext => 
        url.pathname.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        Log.info(`Warning: API URL may not have a valid extension: ${apiUrl}`);
      }
      
      Log.info(`API URL validation passed: ${apiUrl}`);
      return true;
    } catch (error) {
      Log.info(`Invalid API URL format: ${apiUrl}`);
      return false;
    }
  }

  /**
   * Get alternative API URLs for testing
   */
  static getAlternativeApiUrls(): { valid: string; invalid: string; alternative: string } {
    const urlOptions = this.getApiDocumentationOptions('url');
    return urlOptions.testUrls;
  }

  /**
   * Get endpoint data by name
   */
  static getEndpointData(endpointName: string): EndpointData {
    const endpoint = endpointData.endpoints[endpointName as keyof typeof endpointData.endpoints];
    if (!endpoint) {
      throw new Error(`Endpoint data not found for: ${endpointName}`);
    }
    Log.info(`Loading endpoint data: ${endpoint.method} ${endpoint.path}`);
    return endpoint as EndpointData;
  }

  /**
   * Get schema data by name
   */
  static getSchemaData(schemaName: string): SchemaData {
    const schema = schemaData.schemas[schemaName as keyof typeof schemaData.schemas];
    if (!schema) {
      throw new Error(`Schema data not found for: ${schemaName}`);
    }
    Log.info(`Loading schema data: ${schema.method} ${schema.endpoint} (${schema.properties.length} properties)`);
    return schema as SchemaData;
  }

  /**
   * Get pet store endpoint data by name
   */
  static getPetStoreEndpointData(endpointName: string): PetStoreEndpoint {
    const endpoint = petStoreData.petStore.endpoints[endpointName as keyof typeof petStoreData.petStore.endpoints];
    if (!endpoint) {
      throw new Error(`Pet store endpoint data not found for: ${endpointName}`);
    }
    Log.info(`Loading pet store endpoint data: ${endpoint.method} ${endpoint.path}`);
    return endpoint as PetStoreEndpoint;
  }

  /**
   * Get pet schema data by name
   */
  static getPetSchemaData(schemaName: string): PetSchemaData {
    const schema = petSchemaData.petSchemas[schemaName as keyof typeof petSchemaData.petSchemas];
    if (!schema) {
      throw new Error(`Pet schema data not found for: ${schemaName}`);
    }
    Log.info(`Loading pet schema data: ${schema.method} ${schema.endpoint} (${schema.properties.length} properties)`);
    return schema as PetSchemaData;
  }

  /**
   * Get pet store category data
   */
  static getPetStoreCategoryData(categoryName: string) {
    const category = petStoreData.petStore.categories[categoryName as keyof typeof petStoreData.petStore.categories];
    if (!category) {
      throw new Error(`Pet store category data not found for: ${categoryName}`);
    }
    return category;
  }

  /**
   * Get publishing workflow data
   */
  static getPublishingWorkflowData(workflowName: string) {
    const workflow = publishingData.publishing.workflows[workflowName as keyof typeof publishingData.publishing.workflows];
    if (!workflow) {
      throw new Error(`Publishing workflow data not found for: ${workflowName}`);
    }
    return workflow;
  }

  /**
   * Get validation steps data
   */
  static getValidationStepsData(stepType: string): string[] {
    const steps = publishingData.publishing.validationSteps[stepType as keyof typeof publishingData.publishing.validationSteps];
    if (!steps) {
      throw new Error(`Validation steps data not found for: ${stepType}`);
    }
    return steps as string[];
  }

  /**
   * Get navigation data
   */
  static getNavigationData() {
    return navigationData.navigation;
  }

  /**
   * Get validation messages
   */
  static getValidationMessages() {
    return validationData;
  }

  /**
   * Get test configuration
   */
  static getTestConfig() {
    return configData.testConfig;
  }

  /**
   * Get success message by key
   */
  static getSuccessMessage(messageKey: string): string {
    const message = validationData.successMessages[messageKey as keyof typeof validationData.successMessages];
    if (!message) {
      throw new Error(`Success message not found for key: ${messageKey}`);
    }
    return message;
  }

  /**
   * Get error message by key
   */
  static getErrorMessage(messageKey: string): string {
    const message = validationData.errorMessages[messageKey as keyof typeof validationData.errorMessages];
    if (!message) {
      throw new Error(`Error message not found for key: ${messageKey}`);
    }
    return message;
  }

  /**
   * Get step title by key
   */
  static getStepTitle(stepKey: string): string {
    const title = validationData.stepTitles[stepKey as keyof typeof validationData.stepTitles];
    if (!title) {
      throw new Error(`Step title not found for key: ${stepKey}`);
    }
    return title;
  }

  /**
   * Get category data by name
   */
  static getCategoryData(categoryName: string) {
    const category = navigationData.navigation.categories[categoryName as keyof typeof navigationData.navigation.categories];
    if (!category) {
      throw new Error(`Category data not found for: ${categoryName}`);
    }
    return category;
  }

  /**
   * Get all endpoints for a category
   */
  static getEndpointsForCategory(categoryName: string): EndpointData[] {
    const category = this.getCategoryData(categoryName);
    return category.endpoints.map(endpointName => this.getEndpointData(endpointName));
  }

  /**
   * Get timeout value by type
   */
  static getTimeout(timeoutType: string): number {
    const timeout = configData.testConfig.timeouts[timeoutType as keyof typeof configData.testConfig.timeouts];
    if (timeout === undefined) {
      throw new Error(`Timeout not found for type: ${timeoutType}`);
    }
    return timeout;
  }

  /**
   * Get test data value by key
   */
  static getTestDataValue(dataKey: string): string {
    const value = configData.testConfig.testData[dataKey as keyof typeof configData.testConfig.testData];
    if (!value) {
      throw new Error(`Test data value not found for key: ${dataKey}`);
    }
    return value;
  }

  /**
   * Validate schema properties against expected count
   */
  static validateSchemaPropertyCount(schemaName: string, expectedCount?: number): boolean {
    const schema = this.getSchemaData(schemaName);
    if (expectedCount !== undefined) {
      return schema.properties.length === expectedCount;
    }
    return schema.properties.length > 0;
  }

  /**
   * Get required properties from schema
   */
  static getRequiredProperties(schemaName: string): SchemaProperty[] {
    const schema = this.getSchemaData(schemaName);
    return schema.properties.filter(prop => prop.required);
  }

  /**
   * Get optional properties from schema
   */
  static getOptionalProperties(schemaName: string): SchemaProperty[] {
    const schema = this.getSchemaData(schemaName);
    return schema.properties.filter(prop => !prop.required);
  }

  /**
   * Get enum values for a specific field from pet schema
   */
  static getEnumValues(schemaName: string, fieldName: string): string[] {
    const schema = this.getPetSchemaData(schemaName);
    const property = schema.properties.find(prop => prop.name === fieldName);
    
    if (!property || !property.enumValues) {
      throw new Error(`Enum values not found for field: ${fieldName} in schema: ${schemaName}`);
    }
    
    return property.enumValues;
  }

  /**
   * Get nested fields for a specific field from pet schema
   */
  static getNestedFields(schemaName: string, fieldName: string): string[] {
    const schema = this.getPetSchemaData(schemaName);
    const property = schema.properties.find(prop => prop.name === fieldName);
    
    if (!property || !property.nestedFields) {
      throw new Error(`Nested fields not found for field: ${fieldName} in schema: ${schemaName}`);
    }
    
    return property.nestedFields;
  }

  /**
   * Get try it test data for pet store endpoint
   */
  static getTryItTestData(endpointName: string) {
    const endpoint = this.getPetStoreEndpointData(endpointName);
    
    if (!endpoint.tryItData) {
      throw new Error(`Try it test data not found for endpoint: ${endpointName}`);
    }
    
    return endpoint.tryItData;
  }

  /**
   * Get all endpoints for a pet store category
   */
  static getPetStoreEndpointsForCategory(categoryName: string): PetStoreEndpoint[] {
    const endpoints = Object.values(petStoreData.petStore.endpoints)
      .filter(endpoint => endpoint.category === categoryName);
    
    if (endpoints.length === 0) {
      Log.info(`No endpoints found for category: ${categoryName}`);
    }
    
    return endpoints as PetStoreEndpoint[];
  }

  /**
   * Validate that required schema fields exist
   */
  static validatePetSchemaRequiredFields(schemaName: string, actualFields: string[]): boolean {
    const schema = this.getPetSchemaData(schemaName);
    
    for (const requiredField of schema.requiredFields) {
      if (!actualFields.includes(requiredField)) {
        Log.info(`Required field missing: ${requiredField}`);
        return false;
      }
    }
    
    return true;
  }

  /**
 * Get API specification data by type
 */
static getApiSpecificationData(specType: 'openApiV3' | 'swaggerV2') {
  const spec = petStoreData.petStore.apiSpecifications[specType];
  if (!spec) {
    throw new Error(`API specification data not found for: ${specType}`);
  }
  Log.info(`Loading API specification: ${spec.title} (${spec.version})`);
  return spec;
}

/**
 * Get navigation elements for current API specification
 */
static getNavigationElementsForSpec(specType: 'openApiV3' | 'swaggerV2') {
  const spec = this.getApiSpecificationData(specType);
  return spec.navigationElements;
}

/**
 * Get API URL by specification type
 */
static getApiUrlBySpec(specType: 'openApiV3' | 'swaggerV2'): string {
  const spec = this.getApiSpecificationData(specType);
  return spec.url;
}
  /**
 * Validate API setup type
 */
static validateApiSetupType(apiSetup: string): 'sample' | 'upload' | 'url' {
  const validTypes: ('sample' | 'upload' | 'url')[] = ['sample', 'upload', 'url'];
  
  if (!validTypes.includes(apiSetup as any)) {
    Log.info(`Invalid API setup type: ${apiSetup}. Valid types: ${validTypes.join(', ')}`);
    throw new Error(`Invalid API setup type: ${apiSetup}. Must be one of: ${validTypes.join(', ')}`);
  }
  
  Log.info(`API setup type validated: ${apiSetup}`);
  return apiSetup as 'sample' | 'upload' | 'url';
}

/**
 * Get validated project configuration by type
 */
static getValidatedProjectConfigByType(projectType: 'default' | 'custom' | 'urlBased' | 'knowledgeBase') {
  const config = this.getProjectConfigByType(projectType);
  
  // Validate apiSetup if it exists
  if ('apiSetup' in config && config.apiSetup) {
    const validatedApiSetup = this.validateApiSetupType(config.apiSetup);
    return {
      ...config,
      apiSetup: validatedApiSetup
    };
  }
  
  return config;
}
}
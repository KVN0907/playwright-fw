import { expect } from '@playwright/test';
import Log from './Log';

export interface SchemaProperty {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface SchemaTestData {
  endpoint: string;
  method: string;
  responseCode: string;
  contentType: string;
  schemaType: string;
  properties: SchemaProperty[];
}

export class SchemaValidator {
  
  /**
   * Validates all properties from schema test data
   */
  static async validateSchemaProperties(
    documentationPage: any,
    schemaData: SchemaTestData
  ): Promise<void> {
    Log.info(`Validating schema for ${schemaData.method} ${schemaData.endpoint}`);
    
    // Validate basic schema info
    await documentationPage.verifyResponseContentType(schemaData.responseCode, schemaData.contentType);
    await documentationPage.verifyResponseSchemaType(schemaData.responseCode, schemaData.schemaType);
    
    // Validate each property
    for (const property of schemaData.properties) {
      await documentationPage.verifyResponsePropertyWithoutExpansion(schemaData.responseCode, property);
      Log.info(`✅ Validated: ${property.name} (${property.type}) - Required: ${property.required}`);
    }
    
    // Validate property count
    await documentationPage.verifyResponsePropertyCountWithoutExpansion(
      schemaData.responseCode, 
      schemaData.properties.length
    );
    
    // Log summary
    const requiredCount = schemaData.properties.filter(p => p.required).length;
    const optionalCount = schemaData.properties.filter(p => !p.required).length;
    
    Log.info(`✅ Schema validation completed: ${schemaData.properties.length} total properties`);
    Log.info(`   - Required: ${requiredCount}`);
    Log.info(`   - Optional: ${optionalCount}`);
  }

  /**
   * Loads schema test data by endpoint name
   */
  static loadSchemaTestData(schemaData: any, endpointName: string): SchemaTestData {
    const data = schemaData[endpointName];
    if (!data) {
      throw new Error(`Schema test data not found for endpoint: ${endpointName}`);
    }
    return data as SchemaTestData;
  }

  /**
   * Validates required fields are properly marked
   */
  static validateRequiredFields(properties: SchemaProperty[]): void {
    const requiredFields = properties.filter(p => p.required);
    expect(requiredFields.length).toBeGreaterThan(0);
    Log.info(`✅ Found ${requiredFields.length} required fields`);
  }
}
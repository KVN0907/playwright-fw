#!/usr/bin/env node

/**
 * ADO Test Generation CLI
 * Command-line interface for generating Playwright tests from Azure DevOps work items
 * 
 * Usage:
 *   npm run generate-from-ado -- --workItems 12345,12346,12347
 *   npm run generate-from-ado -- --help
 */

import { ADOTestGenerator, ADOTestGeneratorConfig } from '../ado/ADOTestGenerator';
import { ADOIntegration } from '../ado/ADOIntegration';
import Log from '../Log';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * Load environment configuration
 */
function loadEnvironmentConfig(envName: string = 'ado') {
  const envPath = path.join(process.cwd(), 'config', 'environments', `${envName}.env`);
  
  // Check if environment file exists
  const fs = require('fs');
  if (!fs.existsSync(envPath)) {
    Log.error(`❌ Environment file not found: ${envPath}`);
    Log.info('Available environment files: dev.env, qa.env, ado.env');
    process.exit(1);
  }
  
  // Load environment variables
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    Log.error(`❌ Failed to load environment file: ${result.error.message}`);
    process.exit(1);
  }
  
  Log.info(`📁 Loaded configuration from: ${envPath}`);
  
  // ADO Configuration - Loaded from environment variables
  const config = {
    organization: process.env.ADO_ORGANIZATION || 'EYGS2',
    project: process.env.ADO_PROJECT || 'eycompliancemanager', 
    personalAccessToken: process.env.ADO_PERSONAL_ACCESS_TOKEN || '',
    baseUrl: process.env.ADO_BASE_URL || 'https://dev.azure.com',
    apiVersion: process.env.ADO_API_VERSION || '7.0'
  };
  
  // Validate required configuration
  if (!config.personalAccessToken) {
    Log.error(`❌ ADO_PERSONAL_ACCESS_TOKEN is required. Please set it in ${envPath}`);
    process.exit(1);
  }
  
  return config;
}

interface CliOptions {
  workItems?: string;
  help?: boolean;
  analyze?: boolean;
  testOnly?: boolean;
  env?: string;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--workItems':
      case '-w':
        options.workItems = args[++i];
        break;
      case '--analyze':
        options.analyze = true;
        break;
      case '--test-only':
        options.testOnly = true;
        break;
      case '--env':
      case '-e':
        options.env = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🚀 ADO Test Generation CLI

USAGE:
  npm run generate-from-ado -- [OPTIONS]

OPTIONS:
  --workItems, -w <ids>     Generate tests for specific work item IDs (comma-separated)
                           Example: --workItems 12345,12346,12347
  
  --env, -e <environment>   Specify environment config (default: ado)
                           Example: --env dev, --env qa, --env ado
  
  --analyze                 Only analyze work item content (don't generate tests)
  --test-only               Test ADO connection only
  --help, -h               Show this help message

EXAMPLES:
  # Generate from specific work items
  npm run generate-from-ado -- --workItems 197716,198403,198402
  
  # Analyze content first
  npm run generate-from-ado -- --workItems 197716,198403 --analyze
  
  # Test ADO connection
  npm run generate-from-ado -- --test-only

OUTPUT:
  Generated test files will be automatically routed to:
  - API tests: src/tests/api/
  - UI tests: src/tests/ui/e2e/
  - Page objects: src/pages/common/ (UI tests only)

CONFIGURATION:
  Edit config/environments/ado.env to match your setup:
  - ADO_ORGANIZATION: Your ADO organization name
  - ADO_PROJECT: Your ADO project name  
  - ADO_PERSONAL_ACCESS_TOKEN: Your ADO Personal Access Token
  
  Or use a different environment file with --env option
`);
}

async function testConnection(adoConfig: any): Promise<boolean> {
  try {
    const integration = new ADOIntegration(adoConfig);
    
    // Test connection using the built-in method
    const connectionOk = await integration.testConnection();
    
    if (connectionOk) {
      Log.info(`✅ ADO Connection successful`);
    } else {
      Log.error(`❌ ADO Connection failed`);
    }
    
    return connectionOk;
  } catch (error) {
    Log.error(`❌ ADO Connection failed: ${error}`);
    return false;
  }
}

async function analyzeWorkItems(workItemIds: number[], adoConfig: any) {
  try {
    const integration = new ADOIntegration(adoConfig);
    
    Log.info(`📊 Analyzing ${workItemIds.length} work items...`);
    
    let withAcceptanceCriteria = 0;
    let withNeither = 0;
    
    for (const id of workItemIds) {
      try {
        const workItem = await integration.fetchWorkItem(id);
        const hasAC = workItem.acceptanceCriteria && 
                      workItem.acceptanceCriteria.trim().length > 0 && 
                      !workItem.acceptanceCriteria.includes('No acceptance criteria found');
        
        if (hasAC) {
          withAcceptanceCriteria++;
        } else {
          withNeither++;
        }
        
        Log.info(`   ${id}: ${workItem.title || 'No title'} - AC: ${hasAC ? '✅' : '❌'} - Type: ${workItem.workItemType} - State: ${workItem.state}`);
        
      } catch (error) {
        Log.error(`   ${id}: Failed to fetch - ${error}`);
        withNeither++;
      }
    }
    
    Log.info('\n📋 Analysis Results:');
    Log.info(`   Total work items: ${workItemIds.length}`);
    Log.info(`   With acceptance criteria: ${withAcceptanceCriteria}`);
    Log.info(`   Without acceptance criteria: ${withNeither}`);
    
  } catch (error) {
    Log.error(`❌ Analysis failed: ${error}`);
  }
}

async function generateTests(workItemIds: number[], adoConfig: any) {
  try {
    Log.info(`⚙️ Generating tests for ${workItemIds.length} work items...`);
    
    // Create ADO Test Generator with configuration
    const config: ADOTestGeneratorConfig = {
      ado: adoConfig,
      testScript: {
        outputDirectory: path.join(process.cwd(), 'src', 'tests'),
        testFramework: 'playwright',
        promptFilePath: path.join(process.cwd(), 'prompt.md'),
        aiProvider: 'vscode',
        includePageObjects: process.env.ADO_INCLUDE_PAGE_OBJECTS === 'true',
        basePageObjectsPath: path.join(process.cwd(), process.env.ADO_PAGE_OBJECTS_PATH || 'src/pages/common'),
        testSpecsPath: path.join(process.cwd(), 'src', 'tests')
      }
    };
    
    const generator = new ADOTestGenerator(config);
    
    const result = await generator.generateFromWorkItemIds(workItemIds);
    
    Log.info('\n✅ Test generation completed!');
    Log.info(`📊 Summary:`);
    Log.info(`   Total work items: ${result.summary.totalWorkItems}`);
    Log.info(`   Successful generations: ${result.summary.successfulGenerations}`);
    Log.info(`   Skipped (no AC): ${result.summary.skippedNoAcceptanceCriteria}`);
    Log.info(`   Failed generations: ${result.summary.failedGenerations}`);
    Log.info(`   Generated files: ${result.summary.generatedFiles.length}`);
    Log.info(`   Processing time: ${result.summary.processingTime}ms`);
    
    if (result.summary.generatedFiles.length > 0) {
      Log.info('\n📁 Generated files:');
      result.summary.generatedFiles.forEach((file: string) => {
        Log.info(`   - ${file}`);
      });
    }
    
  } catch (error) {
    Log.error(`❌ Test generation failed: ${error}`);
  }
}

async function runGeneration(options: CliOptions) {
  try {
    Log.info('🚀 ADO Test Generation CLI Started');
    Log.info('==================================');

    // Load environment configuration
    const envName = options.env || 'ado';
    const adoConfig = loadEnvironmentConfig(envName);
    
    Log.info(`🔧 Configuration loaded:`);
    Log.info(`   Organization: ${adoConfig.organization}`);
    Log.info(`   Project: ${adoConfig.project}`);
    Log.info(`   Base URL: ${adoConfig.baseUrl}`);
    Log.info(`   API Version: ${adoConfig.apiVersion}`);

    // Test connection first
    if (options.testOnly) {
      await testConnection(adoConfig);
      return;
    }

    if (!options.workItems) {
      Log.error('❌ No work items specified');
      Log.info('Use --help to see available options');
      process.exit(1);
    }

    const workItemIds = options.workItems.split(',').map(id => parseInt(id.trim()));
    Log.info(`Processing work items: ${workItemIds.join(', ')}`);

    // Test connection
    Log.info('Testing ADO connection...');
    const connectionOk = await testConnection(adoConfig);
    
    if (!connectionOk) {
      Log.error(`Please check your ADO configuration in config/environments/${envName}.env`);
      process.exit(1);
    }

    if (options.analyze) {
      await analyzeWorkItems(workItemIds, adoConfig);
    } else {
      await generateTests(workItemIds, adoConfig);
    }

  } catch (error) {
    Log.error(`❌ Generation failed: ${error}`);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  await runGeneration(options);
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  Log.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the CLI
main().catch((error) => {
  Log.error(`CLI error: ${error}`);
  process.exit(1);
});
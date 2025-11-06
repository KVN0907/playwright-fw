/**
 * @fileoverview Playwright Configuration with Advanced TypeScript Integration
 * @description Uses unified test configuration system with environment management
 * @version 2.0
 */

import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs-extra';

// Load environment-specific configuration
const envFile = process.env.NODE_ENV || 'qa';
dotenv.config({
  path: path.resolve(__dirname, `config/environments/${envFile}.env`),
  override: true,
});

// Import our advanced configuration system
import testConfig from './src/config/TestConfig';

/**
 * @description Clean up test artifacts before running tests
 */
function cleanupTestArtifacts(): void {
  const artifactDirs = ['test-results/reports', 'test-results/screenshots', 'test-results/videos'];

  artifactDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.emptyDirSync(dir);
    } else {
      fs.ensureDirSync(dir);
    }
  });
}

// Clean up before tests
cleanupTestArtifacts();

/**
 * @description Export Playwright configuration using our advanced config system
 * This uses the unified configuration management system with type safety
 */
export default defineConfig(testConfig);

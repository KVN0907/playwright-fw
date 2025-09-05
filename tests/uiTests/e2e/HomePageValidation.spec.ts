import { test, expect } from '../../fixtures/baseTest';
import { BaseTest } from '../../fixtures/baseTest';
import { ErrorHandler } from '../../utils/ErrorHandler';
import { TestDataManager } from '../../utils/TestDataManager';
import Log from '../../utils/Log';

test.describe('Home Page Validation Tests', () => {
  test('Home page test', async ({ page, homePage }, testInfo) => {
    const scenarioName = 'Home page test';
    
    await BaseTest.executeWithLogging(scenarioName, async () => {
      try {
        // Get test data
        const testDataManager = TestDataManager.getInstance();
        const ssoUsername = process.env.DEV_SSO_USERNAME;
        
        if (!ssoUsername) {
          throw new Error('SSO_USERNAME environment variable is not set.');
        }

        Log.info('Navigating to the home page');
        await homePage.navigateTo('/');

        Log.info('Verifying banner text');
        await ErrorHandler.assertWithRetry(
          () => homePage.verifyBannerText(ssoUsername),
          3,
          1000,
          'Banner text verification'
        );

        Log.info('Verifying heading text');
        await ErrorHandler.assertWithRetry(
          () => homePage.verifyHeadingText(`Good Day, ${ssoUsername}!`),
          3,
          1000,
          'Heading text verification'
        );

        Log.info('Navigating to setup');
        await homePage.navigateToSetup();

        // Verify navigation was successful
        await ErrorHandler.waitForCondition(
          async () => {
            const url = page.url();
            return url.includes('setup') || url.includes('Setup');
          },
          10000,
          500,
          'Navigation to setup page'
        );

      } catch (error) {
        await ErrorHandler.handleTestError(page, testInfo, error as Error);
        throw error;
      }
    });
  });

  test('Navigate to Control Definition Libraries', async ({ page, homePage }, testInfo) => {
    const scenarioName = 'Navigate to Control Definition Libraries';
    
    await BaseTest.executeWithLogging(scenarioName, async () => {
      try {
        Log.info('Navigating to the home page');
        await homePage.navigateTo('/');

        // Add your navigation logic here
        const controlDefButton = page.locator('button:has-text("Control Definition Libraries")');
        await homePage.clickElement(controlDefButton, 'Control Definition Libraries button');

        // Verify navigation
        await ErrorHandler.waitForCondition(
          async () => {
            const url = page.url();
            return url.includes('control') || url.includes('libraries');
          },
          10000,
          500,
          'Navigation to Control Definition Libraries'
        );

      } catch (error) {
        await ErrorHandler.handleTestError(page, testInfo, error as Error);
        throw error;
      }
    });
  });

  test('Navigate to Approval section', async ({ page, homePage }, testInfo) => {
    const scenarioName = 'Navigate to Approval section';
    
    await BaseTest.executeWithLogging(scenarioName, async () => {
      try {
        Log.info('Navigating to the home page');
        await homePage.navigateTo('/');

        // Add your navigation logic here
        const approvalButton = page.locator('button:has-text("Approval")');
        await homePage.clickElement(approvalButton, 'Approval button');

        // Verify navigation
        await ErrorHandler.waitForCondition(
          async () => {
            const url = page.url();
            return url.includes('approval');
          },
          10000,
          500,
          'Navigation to Approval section'
        );

      } catch (error) {
        await ErrorHandler.handleTestError(page, testInfo, error as Error);
        throw error;
      }
    });
  });
});

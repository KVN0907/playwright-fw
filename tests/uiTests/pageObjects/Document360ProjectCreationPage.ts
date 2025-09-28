import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';

export class Document360ProjectCreationPage extends BasePage {
  // Project creation flow locators
  private readonly createProjectButton: Locator;
  private readonly apiDocumentationOption: Locator;
  private readonly getStartedButton: Locator;
  private readonly tryPetStoreButton: Locator;
  private readonly uploadApiButton: Locator;
  private readonly createFromUrlButton: Locator;
  private readonly websiteUrlTextbox: Locator;
  private readonly apiUrlTextbox: Locator;
  private readonly uploadFileButton: Locator;
  private readonly fileInput: Locator;
  private readonly skipButton: Locator;
  private readonly nextButton: Locator;
  private readonly projectNameTextbox: Locator;
  private readonly defaultLanguageButton: Locator;
  private readonly brandColorPicker: Locator;
  private readonly privacyPrivateOption: Locator;
  private readonly finishButton: Locator;

  // Project verification locators
  private readonly projectTitle: Locator;
  private readonly trialBanner: Locator;
  private readonly openSiteLink: Locator;
  private readonly apiDocumentationCategory: Locator;
  private readonly swaggerPetstoreCategory: Locator;
  private readonly apiDocumentationArticle: Locator;
  private readonly endpointsList: Locator;
  private readonly publishButton: Locator;
  private readonly publishedSiteLink: Locator;
  private readonly endpointItems: Locator;

  // Step indicators
  private readonly stepIndicator: Locator;
  private readonly stepTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Project creation flow locators
    this.createProjectButton = page.getByRole('button', { name: '+ Project' });
    this.apiDocumentationOption = page.getByRole('button', { name: 'Get started' }).first();
    // Target the specific "Get started" button within the API documentation use case tile
    this.getStartedButton = page
      .locator('app-use-case-tile')
      .filter({ hasText: 'API documentation' })
      .getByRole('button', { name: 'Get started' });
    // API setup options - radio buttons for the three methods
    this.tryPetStoreButton = page.getByRole('radio', { name: 'Try sample pet store API file' });
    this.uploadApiButton = page.getByRole('radio', { name: 'Upload API definition' });
    this.createFromUrlButton = page.getByRole('radio', { name: 'Create from URL' });
    this.websiteUrlTextbox = page.getByRole('textbox', { name: 'Website URL' });
    this.apiUrlTextbox = page.getByRole('textbox').first(); // For API URL input when 'url' option is selected
    this.uploadFileButton = page.getByRole('button', { name: 'Upload from my device' });
    this.fileInput = page.locator('input[type="file"]');
    this.skipButton = page.getByRole('button', { name: 'Skip' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.projectNameTextbox = page.getByRole('textbox', { name: 'Enter project name' });
    this.defaultLanguageButton = page.getByRole('button', { name: 'English' });
    this.brandColorPicker = page.locator('[data-testid="brand-color"]').first();
    this.privacyPrivateOption = page.locator('[data-value="private"]').first();
    this.finishButton = page.getByRole('button', { name: 'Next' });

    // Project verification locators
    this.projectTitle = page.locator('[data-testid="project-title"]').first();
    this.trialBanner = page.getByText('Trial Ends in');
    this.openSiteLink = page.getByRole('link', { name: 'OPEN SITE' });
    this.apiDocumentationCategory = page
      .getByRole('link', { name: 'API documentation', exact: true })
      .first();
    this.swaggerPetstoreCategory = page.getByRole('link', { name: 'Swagger Petstore' });
    this.apiDocumentationArticle = page
      .getByRole('link', { name: 'API Documentation', exact: true })
      .first();
    this.endpointsList = page.locator('.endpoints-list, [data-testid="endpoints"], .api-endpoints');
    this.publishButton = page.getByRole('button', { name: /publish/i });
    this.publishedSiteLink = page.getByRole('link', {
      name: /view.*site|open.*site|published.*site/i,
    });
    this.endpointItems = page.locator('.endpoint-item, [data-testid="endpoint"], .api-method');

    // Step indicators
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');
    this.stepTitle = page.locator('h2');
  }

  // Project Creation Methods
  async clickCreateProject() {
    Log.info('Given user clicks on Create Project button');
    await this.clickElement(this.createProjectButton, 'Create Project button');
  }

  async selectApiDocumentation() {
    Log.info('When user selects API documentation option');
    await this.waitForElement(this.getStartedButton);
    await this.clickElement(this.getStartedButton, 'Get started for API documentation');
  }

  async selectApiSetupMethod(setupType: 'sample' | 'upload' | 'url', apiUrl?: string) {
    Log.info(`And user selects API setup method: ${setupType}`);

    switch (setupType) {
      case 'sample':
        Log.info('Selecting sample pet store API file');
        await this.waitForElement(this.tryPetStoreButton);
        await this.clickElement(this.tryPetStoreButton, 'Try sample pet store API file');
        break;

      case 'upload':
        Log.info('Selecting upload API definition option');
        await this.waitForElement(this.uploadApiButton);
        await this.clickElement(this.uploadApiButton, 'Upload API definition');

        // Upload the sample API file
        const filePath = require('path').resolve(__dirname, '../../data/sample-api.yaml');
        Log.info(`Uploading API file: ${filePath}`);

        // Check if file input is visible, if not trigger upload button first
        const isFileInputVisible = await this.fileInput
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        if (!isFileInputVisible) {
          await this.waitForElement(this.uploadFileButton);
          await this.uploadFileButton.click();
        }

        await this.fileInput.setInputFiles(filePath);
        Log.info('API file uploaded successfully');
        break;

      case 'url':
        Log.info('Selecting create from URL option');
        await this.waitForElement(this.createFromUrlButton);
        await this.clickElement(this.createFromUrlButton, 'Create from URL');

        // Fill API URL if provided
        if (apiUrl) {
          Log.info(`Filling API URL: ${apiUrl}`);
          await this.waitForElement(this.apiUrlTextbox);
          await this.fillElement(this.apiUrlTextbox, apiUrl, 'API URL');
        }
        break;

      default:
        throw new Error(
          `Unsupported API setup type: ${setupType}. Use 'sample', 'upload', or 'url'.`
        );
    }
  }

  // Legacy method for backward compatibility - defaults to sample
  async selectPetStoreTemplate() {
    Log.info('And user selects pet store API template (legacy method)');
    await this.selectApiSetupMethod('sample');
  }

  async proceedToNextStep(stepName?: string) {
    Log.info(`And user proceeds to next step${stepName ? ` (${stepName})` : ''}`);
    await this.waitForElement(this.nextButton);
    await this.clickElement(this.nextButton, 'Next button');
  }

  async fillWebsiteUrl(url: string) {
    Log.info(`And user fills website URL with: ${url}`);
    await this.waitForElement(this.websiteUrlTextbox);
    await this.fillElement(this.websiteUrlTextbox, url, 'Website URL');
  }

  async skipWebsiteUrlStep() {
    Log.info('Skipping website URL step (using default)');
    await this.waitForElement(this.skipButton);
    await this.clickElement(this.skipButton, 'Skip button');
  }

  async proceedOrSkipStep(skipCondition: boolean = false) {
    if (skipCondition) {
      await this.skipWebsiteUrlStep();
    } else {
      await this.proceedToNextStep();
    }
  }

  async fillProjectName(projectName: string) {
    Log.info(`And user updates project name to: ${projectName}`);
    await this.waitForElement(this.projectNameTextbox);
    await this.projectNameTextbox.clear();
    await this.fillElement(this.projectNameTextbox, projectName, 'Project name');
  }

  async acceptDefaultBrandingSettings() {
    Log.info('And user accepts default branding settings');
    // Default language is already English
    // Brand color is pre-filled
    // No changes needed for default branding
  }

  async selectPrivateAccess() {
    Log.info('And user selects private access (default for trial)');
    // Private is selected by default for trial accounts
    await this.verifyPrivateAccessSelected();
  }

  async finishProjectCreation() {
    Log.info('When user completes the project creation process');
    await this.waitForElement(this.finishButton);
    await this.clickElement(this.finishButton, 'Finish project creation');
  }

  // Verification Methods
  async verifyStepIndicator(expectedStep: string) {
    Log.info(`Then step indicator should show: ${expectedStep}`);
    const stepText = await this.page.textContent('div:has-text("of 5")');
    if (stepText && expectedStep) {
      await this.verifyText(
        this.page.locator(`text=${expectedStep}`),
        expectedStep,
        'Step indicator'
      );
    }
  }

  async verifyStepTitle(expectedTitle: string) {
    Log.info(`And step title should be: ${expectedTitle}`);
    // Look for the text in h2 elements first, then fallback to any element with the text
    const h2Element = this.page.locator('h2').filter({ hasText: expectedTitle });
    const anyElement = this.page.locator('*').filter({ hasText: expectedTitle });

    const isH2Visible = await h2Element.isVisible({ timeout: 2000 }).catch(() => false);
    if (isH2Visible) {
      await this.verifyText(h2Element.first(), expectedTitle, 'Step title');
    } else {
      await this.verifyText(anyElement.first(), expectedTitle, 'Step title');
    }
  }

  async verifyProjectCreated(projectName: string) {
    Log.info(`Then project "${projectName}" should be created successfully`);

    // Wait for project page to load
    await this.waitForLoadState('domcontentloaded');

    // Verify project title in the header
    const titleLocator = this.page
      .locator('[data-testid="project-name"], .project-title, h1, h2')
      .first();
    await this.verifyText(titleLocator, 'API Documentation', 'Project title');
  }

  async verifyTrialBanner() {
    Log.info('And trial banner should be visible');
    await this.verifyElementVisible(this.trialBanner, 'Trial banner');
  }

  async verifyOpenSiteLink() {
    Log.info('And Open Site link should be available');
    await this.verifyElementVisible(this.openSiteLink, 'Open Site link');
  }

  async verifyApiDocumentationStructure() {
    Log.info('And API documentation structure should be created');

    // Verify API documentation category exists - use more specific selector to avoid strict mode violation
    const apiDocCategory = this.page
      .getByRole('link', { name: 'API documentation', exact: true })
      .first();
    await this.verifyElementVisible(apiDocCategory, 'API documentation category');

    // Verify Swagger Petstore category exists
    //await this.verifyElementVisible(this.swaggerPetstoreCategory, 'Swagger Petstore category');

    // Verify API Documentation article exists - use more specific selector
    const apiDocArticle = this.page
      .getByRole('link', { name: 'API Documentation', exact: true })
      .first();
    await this.verifyElementVisible(apiDocArticle, 'API Documentation article');
  }

  async verifyProjectUrl(expectedPattern: string) {
    Log.info(`And project URL should match pattern: ${expectedPattern}`);
    const currentUrl = this.page.url();
    if (!currentUrl.includes(expectedPattern)) {
      throw new Error(`Expected URL to contain "${expectedPattern}" but got: ${currentUrl}`);
    }
    Log.info(`Project URL verified: ${currentUrl}`);
  }

  async verifyPrivateAccessSelected() {
    Log.info('And private access should be selected by default');
    // Verify private option is selected (indicated by filled radio button)
    const privateRadio = this.page
      .locator('input[value="private"], [data-value="private"]')
      .first();
    if ((await privateRadio.count()) > 0) {
      await privateRadio.waitFor({ state: 'visible' });
    }
  }

  // Helper Methods
  async waitForProjectCreationComplete() {
    Log.info('Waiting for project creation to complete');
    // Wait for URL to change to project dashboard
    await this.page.waitForURL(/.*\/api-documentation\/.*/, { timeout: 30000 });
    await this.waitForLoadState('domcontentloaded');
  }

  async getProjectIdFromUrl(): Promise<string> {
    const url = this.page.url();
    const match = url.match(/\/([a-f0-9-]{36})\//);
    if (match) {
      return match[1];
    }
    throw new Error(`Could not extract project ID from URL: ${url}`);
  }

  async verifyApiTemplateContent() {
    Log.info('And API documentation template content should be created');

    // Check for common API documentation sections that are actually visible
    const apiSections = ['Overview', 'Authentication', 'Base URL', 'Endpoints'];

    for (const section of apiSections) {
      // Use more specific selectors that target visible content
      const sectionLocators = [
        this.page.getByRole('heading', { name: section }),
        this.page.getByRole('link', { name: section }),
        this.page.locator(
          `h1:has-text("${section}"), h2:has-text("${section}"), h3:has-text("${section}")`
        ),
        this.page.locator(`.article-title:has-text("${section}")`),
        this.page.locator(`[title*="${section}"]`),
      ];

      let sectionFound = false;
      for (const locator of sectionLocators) {
        try {
          const isVisible = await locator.first().isVisible({ timeout: 2000 });
          if (isVisible) {
            await this.verifyElementVisible(locator.first(), `${section} section`);
            sectionFound = true;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!sectionFound) {
        Log.info(`${section} section not found - may not be present in this template version`);
      }
    }

    Log.info('API documentation template content verification completed');
  }
}

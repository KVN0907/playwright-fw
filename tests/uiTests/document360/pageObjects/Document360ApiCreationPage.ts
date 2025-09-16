import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../utils/BasePage';
import { createSelectorHelper } from '../../../utils/SelectorHelper';
import { ApiTestData, TestDataHelper } from '../testData/ApiTestData';
import Log from '../../../utils/Log';

/**
 * Page Object for Document360 API Creation Modal/Workflow
 * Handles the API creation process including upload, URL, CI/CD, and sample options
 */
export class Document360ApiCreationPage extends BasePage {
  private selectorHelper: any;

  // Modal container
  private readonly modal: Locator;
  private readonly modalTitle: Locator;
  private readonly closeModalButton: Locator;

  // Creation option radio buttons
  private readonly urlRadioButton: Locator;
  private readonly uploadRadioButton: Locator;
  private readonly cicdRadioButton: Locator;
  private readonly samplePetStoreRadioButton: Locator;

  // Form inputs
  private readonly urlInput: Locator;
  private readonly fileUpload: Locator;
  private readonly cicdUrlInput: Locator;
  private readonly apiNameInput: Locator;
  private readonly apiDescriptionInput: Locator;

  // Action buttons
  private readonly newApiReferenceButton: Locator;
  private readonly cancelButton: Locator;
  private readonly publishButton: Locator;
  private readonly saveAsDraftButton: Locator;

  // Status and feedback elements
  private readonly successAlert: Locator;
  private readonly errorAlert: Locator;
  private readonly progressIndicator: Locator;
  private readonly validationMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.selectorHelper = createSelectorHelper(page, TestDataHelper.getTimeout('default'), true);

    // Modal elements
    this.modal = this.selectorHelper.getByRole('dialog');
    this.modalTitle = this.selectorHelper.getByRole('heading', { name: /Create New API|New API/ });
    this.closeModalButton = this.selectorHelper.getByRole('button', { name: 'Close' });

    // Radio button options
    this.urlRadioButton = this.selectorHelper.getByRole('radio', { name: 'Create from URL' });
    this.uploadRadioButton = this.selectorHelper.getByRole('radio', {
      name: 'Upload API definition',
    });
    this.cicdRadioButton = this.selectorHelper.getByRole('radio', { name: 'CI/CD Flow' });
    this.samplePetStoreRadioButton = this.selectorHelper.getByRole('radio', {
      name: 'Try sample pet store API file',
    });

    // Form inputs
    this.urlInput = this.page.locator('#api-reference-url');
    this.fileUpload = this.selectorHelper.getByRole('button', { name: 'Choose file' });
    this.cicdUrlInput = this.selectorHelper.getByPlaceholder('Enter CI/CD webhook URL');
    this.apiNameInput = this.selectorHelper.getByLabel('API Name');
    this.apiDescriptionInput = this.selectorHelper.getByLabel('Description');

    // Action buttons
    this.newApiReferenceButton = this.selectorHelper.getByRole('button', {
      name: 'New API reference',
    });
    this.cancelButton = this.selectorHelper.getByRole('button', { name: 'Cancel' });
    this.publishButton = this.selectorHelper.getByRole('button', { name: 'Publish' });
    this.saveAsDraftButton = this.selectorHelper.getByRole('button', { name: 'Save as Draft' });

    // Status elements
    this.successAlert = this.selectorHelper
      .getByRole('alert')
      .filter({ hasText: ApiTestData.messages.success });
    this.errorAlert = this.selectorHelper
      .getByRole('alert')
      .filter({ hasText: ApiTestData.messages.error });
    this.progressIndicator = this.selectorHelper.getByRole('progressbar');
    this.validationMessages = this.selectorHelper.getByText(
      new RegExp(
        `${ApiTestData.validation.required}|${ApiTestData.validation.invalid}|${ApiTestData.validation.error}`
      )
    );
  }

  /**
   * Verify the API creation modal is open and visible
   */
  async verifyApiCreationModalOpen(): Promise<void> {
    Log.info('Verifying API creation modal is open');

    await expect(this.modal).toBeVisible();
    await expect(this.modalTitle).toBeVisible();
    await expect(this.cancelButton).toBeVisible();

    Log.info('API creation modal is open and ready');
  }

  /**
   * Select "Create from URL" option
   */
  async selectCreateFromUrl(): Promise<void> {
    Log.info('Selecting Create from URL option');
    await this.clickElement(this.urlRadioButton, 'Create from URL radio button');

    // Verify URL input becomes visible
    await expect(this.urlInput).toBeVisible();
    Log.info('Create from URL option selected');
  }

  /**
   * Enter API definition URL
   */
  async enterApiDefinitionUrl(url: string): Promise<void> {
    Log.info(`Entering API definition URL: ${url}`);
    await this.fillElement(this.urlInput, url, 'API definition URL');
  }

  /**
   * Select "Upload API definition" option
   */
  async selectUploadApiDefinition(): Promise<void> {
    Log.info('Selecting Upload API definition option');
    await this.clickElement(this.uploadRadioButton, 'Upload API definition radio button');

    // Verify file upload becomes visible
    await expect(this.fileUpload).toBeVisible();
    Log.info('Upload API definition option selected');
  }

  /**
   * Upload API definition file
   */
  async uploadApiDefinitionFile(filePath: string): Promise<void> {
    Log.info(`Uploading API definition file: ${filePath}`);
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    Log.info('API definition file uploaded');
  }

  /**
   * Select "CI/CD Flow" option
   */
  async selectCicdFlow(): Promise<void> {
    Log.info('Selecting CI/CD Flow option');
    await this.clickElement(this.cicdRadioButton, 'CI/CD Flow radio button');

    // Verify CI/CD URL input becomes visible
    await expect(this.cicdUrlInput).toBeVisible();
    Log.info('CI/CD Flow option selected');
  }

  /**
   * Enter CI/CD webhook URL
   */
  async enterCicdWebhookUrl(url: string): Promise<void> {
    Log.info(`Entering CI/CD webhook URL: ${url}`);
    await this.fillElement(this.cicdUrlInput, url, 'CI/CD webhook URL');
  }

  /**
   * Select "Try sample pet store API file" option
   */
  async selectSamplePetStore(): Promise<void> {
    Log.info('Selecting sample pet store API file option');
    await this.clickElement(this.samplePetStoreRadioButton, 'Sample pet store API radio button');
    Log.info('Sample pet store API option selected');
  }

  /**
   * Enter optional API name
   */
  async enterApiName(name: string): Promise<void> {
    Log.info(`Entering API name: ${name}`);
    await this.fillElement(this.apiNameInput, name, 'API name');
  }

  /**
   * Enter optional API description
   */
  async enterApiDescription(description: string): Promise<void> {
    Log.info(`Entering API description: ${description}`);
    await this.fillElement(this.apiDescriptionInput, description, 'API description');
  }

  /**
   * Click "New API reference" button to create the API
   */
  async clickNewApiReference(): Promise<void> {
    Log.info('Clicking New API reference button');
    await this.clickElement(this.newApiReferenceButton, 'New API reference button');

    // Wait for processing
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Click Cancel to close the modal
   */
  async clickCancel(): Promise<void> {
    Log.info('Clicking Cancel button');
    await this.clickElement(this.cancelButton, 'Cancel button');

    // Wait for modal to close
    await expect(this.modal).not.toBeVisible();
    Log.info('API creation modal closed');
  }

  /**
   * Click Publish button
   */
  async clickPublish(): Promise<void> {
    Log.info('Clicking Publish button');
    await this.clickElement(this.publishButton, 'Publish button');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Click Save as Draft button
   */
  async clickSaveAsDraft(): Promise<void> {
    Log.info('Clicking Save as Draft button');
    await this.clickElement(this.saveAsDraftButton, 'Save as Draft button');
    await this.waitForPageLoadState('networkidle');
  }

  /**
   * Verify API creation success
   */
  async verifyApiCreationSuccess(): Promise<void> {
    Log.info('Verifying API creation success');

    // Check for success indicators
    const hasSuccessAlert = await this.successAlert.isVisible().catch(() => false);
    const hasProgressIndicator = await this.progressIndicator.isVisible().catch(() => false);

    if (hasSuccessAlert) {
      await expect(this.successAlert).toBeVisible();
      Log.info('Success alert displayed');
    }

    if (hasProgressIndicator) {
      Log.info('Processing API creation...');
      // Wait for progress to complete
      await expect(this.progressIndicator).not.toBeVisible({
        timeout: TestDataHelper.getTimeout('long'),
      });
    }

    Log.info('API creation completed successfully');
  }

  /**
   * Verify API creation failure with error message
   */
  async verifyApiCreationError(): Promise<void> {
    Log.info('Verifying API creation error');

    await expect(this.errorAlert).toBeVisible();

    const errorText = await this.errorAlert.textContent();
    Log.info(`Error message: ${errorText}`);
  }

  /**
   * Verify validation errors are displayed
   */
  async verifyValidationErrors(): Promise<void> {
    Log.info('Verifying validation errors');

    await expect(this.validationMessages).toBeVisible();

    const errorCount = await this.validationMessages.count();
    Log.info(`Found ${errorCount} validation errors`);
  }

  /**
   * Complete API creation workflow from URL
   */
  async createApiFromUrl(url: string, apiName?: string): Promise<void> {
    Log.info(`Starting API creation from URL workflow: ${url}`);

    await this.verifyApiCreationModalOpen();
    await this.selectCreateFromUrl();
    await this.enterApiDefinitionUrl(url);

    if (apiName) {
      await this.enterApiName(apiName);
    }

    await this.clickNewApiReference();
    await this.verifyApiCreationSuccess();

    Log.info('API creation from URL workflow completed');
  }

  /**
   * Complete API creation workflow with file upload
   */
  async createApiFromUpload(filePath: string, apiName?: string): Promise<void> {
    Log.info(`Starting API creation from upload workflow: ${filePath}`);

    await this.verifyApiCreationModalOpen();
    await this.selectUploadApiDefinition();
    await this.uploadApiDefinitionFile(filePath);

    if (apiName) {
      await this.enterApiName(apiName);
    }

    await this.clickNewApiReference();
    await this.verifyApiCreationSuccess();

    Log.info('API creation from upload workflow completed');
  }

  /**
   * Complete API creation workflow with sample data
   */
  async createApiFromSample(): Promise<void> {
    Log.info('Starting API creation from sample workflow');

    await this.verifyApiCreationModalOpen();
    await this.selectSamplePetStore();
    await this.clickNewApiReference();
    await this.verifyApiCreationSuccess();

    Log.info('API creation from sample workflow completed');
  }
}

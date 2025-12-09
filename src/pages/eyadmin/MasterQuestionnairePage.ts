/**
 * @fileoverview MasterQuestionnairePage - Master Questionnaire Management
 * @description Page object for editing reg areas and questions in Master Questionnaire
 * @userStory #197273 - Edit reg area name and questions
 */

import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import Log from '../../lib/utils/Log';

export class MasterQuestionnairePage extends BasePage<MasterQuestionnairePage> {
  // Navigation
  readonly masterQuestionnaireNav: Locator;
  readonly pageTitle: Locator;

  // Reg Area elements
  readonly regAreaList: Locator;
  readonly regAreaItem: Locator;
  readonly regAreaNameInput: Locator;
  readonly regAreaDescriptionInput: Locator;
  readonly regAreaEditButton: Locator;
  readonly regAreaSaveButton: Locator;
  readonly regAreaCancelButton: Locator;

  // Question elements
  readonly questionList: Locator;
  readonly questionItem: Locator;
  readonly questionTitleInput: Locator;
  readonly questionTypeSelect: Locator;
  readonly questionEditButton: Locator;
  readonly questionSaveButton: Locator;
  readonly questionCancelButton: Locator;
  readonly questionOptionsContainer: Locator;
  readonly addOptionButton: Locator;

  // Common elements
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly confirmationModal: Locator;
  readonly confirmButton: Locator;
  readonly cancelConfirmButton: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.masterQuestionnaireNav = page.locator(
      '[data-testid="master-questionnaire-nav"], a:has-text("Master Questionnaire")'
    );
    this.pageTitle = page.getByRole('heading', { name: /Master Questionnaire/i });

    // Reg Area elements
    this.regAreaList = page.locator('.reg-area-list, [data-testid="reg-area-list"]');
    this.regAreaItem = page.locator('.reg-area-item, [data-testid="reg-area-item"]');
    this.regAreaNameInput = page.locator(
      'input[name="regAreaName"], [data-testid="reg-area-name-input"]'
    );
    this.regAreaDescriptionInput = page.locator(
      'textarea[name="regAreaDescription"], [data-testid="reg-area-description-input"]'
    );
    this.regAreaEditButton = page.locator(
      '[data-testid="edit-reg-area-btn"], button:has-text("Edit")'
    );
    this.regAreaSaveButton = page.locator(
      '[data-testid="save-reg-area-btn"], button:has-text("Save")'
    );
    this.regAreaCancelButton = page.locator(
      '[data-testid="cancel-reg-area-btn"], button:has-text("Cancel")'
    );

    // Question elements
    this.questionList = page.locator('.question-list, [data-testid="question-list"]');
    this.questionItem = page.locator('.question-item, [data-testid="question-item"]');
    this.questionTitleInput = page.locator(
      'input[name="questionTitle"], [data-testid="question-title-input"]'
    );
    this.questionTypeSelect = page.locator(
      'select[name="questionType"], [data-testid="question-type-select"], mat-select[formcontrolname="questionType"]'
    );
    this.questionEditButton = page.locator(
      '[data-testid="edit-question-btn"], button:has-text("Edit")'
    );
    this.questionSaveButton = page.locator(
      '[data-testid="save-question-btn"], button:has-text("Save")'
    );
    this.questionCancelButton = page.locator(
      '[data-testid="cancel-question-btn"], button:has-text("Cancel")'
    );
    this.questionOptionsContainer = page.locator(
      '.question-options, [data-testid="question-options"]'
    );
    this.addOptionButton = page.locator(
      '[data-testid="add-option-btn"], button:has-text("Add Option")'
    );

    // Common elements
    this.successMessage = page.locator(
      '.success-message, .mat-snack-bar-container:has-text("success"), [role="alert"]:has-text("success")'
    );
    this.errorMessage = page.locator(
      '.error-message, .mat-error, [role="alert"]:has-text("error")'
    );
    this.confirmationModal = page.locator(
      '[data-testid="confirmation-modal"], .confirmation-modal, mat-dialog-container'
    );
    this.confirmButton = page.getByRole('button', { name: /Confirm|Yes|OK/i });
    this.cancelConfirmButton = page.getByRole('button', { name: /Cancel|No/i });
    this.loadingSpinner = page.locator('.loading-spinner, mat-spinner, .loader');
  }

  /**
   * Navigate to Master Questionnaire page
   */
  async navigateToMasterQuestionnaire(): Promise<MasterQuestionnairePage> {
    Log.info('Navigating to Master Questionnaire page');
    await this.navigateTo('/ey-super-admin/master-questionnaire');
    await this.waitForPageLoad();
    return this;
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad(): Promise<MasterQuestionnairePage> {
    Log.info('Waiting for Master Questionnaire page to load');
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
    await this.waitForLoadingComplete();
    return this;
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingComplete(): Promise<void> {
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Spinner may not be present
    }
  }

  /**
   * Select a reg area by name
   */
  async selectRegArea(name: string): Promise<MasterQuestionnairePage> {
    Log.info(`Selecting reg area: ${name}`);
    const regArea = this.page.locator(
      `.reg-area-item:has-text("${name}"), [data-testid="reg-area-item"]:has-text("${name}")`
    );
    await this.click(regArea, { description: `Reg Area: ${name}` });
    return this;
  }

  /**
   * Click edit button for the selected reg area
   */
  async clickEditRegArea(regAreaName: string): Promise<MasterQuestionnairePage> {
    Log.info(`Clicking edit for reg area: ${regAreaName}`);
    const regAreaRow = this.page.locator(
      `.reg-area-item:has-text("${regAreaName}"), [data-testid="reg-area-item"]:has-text("${regAreaName}")`
    );
    const editBtn = regAreaRow.locator(
      'button:has-text("Edit"), [data-testid="edit-reg-area-btn"]'
    );
    await this.click(editBtn, { description: `Edit reg area: ${regAreaName}` });
    return this;
  }

  /**
   * Edit reg area name
   */
  async editRegAreaName(newName: string): Promise<MasterQuestionnairePage> {
    Log.info(`Editing reg area name to: ${newName}`);
    await this.regAreaNameInput.clear();
    await this.fill(this.regAreaNameInput, newName, { description: 'Reg area name input' });
    return this;
  }

  /**
   * Edit reg area description
   */
  async editRegAreaDescription(newDescription: string): Promise<MasterQuestionnairePage> {
    Log.info(`Editing reg area description to: ${newDescription}`);
    await this.regAreaDescriptionInput.clear();
    await this.fill(this.regAreaDescriptionInput, newDescription, {
      description: 'Reg area description input',
    });
    return this;
  }

  /**
   * Save reg area changes
   */
  async saveRegArea(): Promise<MasterQuestionnairePage> {
    Log.info('Saving reg area changes');
    await this.click(this.regAreaSaveButton, { description: 'Save reg area button' });
    await this.waitForLoadingComplete();
    return this;
  }

  /**
   * Cancel reg area edit
   */
  async cancelRegAreaEdit(): Promise<MasterQuestionnairePage> {
    Log.info('Cancelling reg area edit');
    await this.click(this.regAreaCancelButton, { description: 'Cancel reg area button' });
    return this;
  }

  /**
   * Select a question by title
   */
  async selectQuestion(title: string): Promise<MasterQuestionnairePage> {
    Log.info(`Selecting question: ${title}`);
    const question = this.page.locator(
      `.question-item:has-text("${title}"), [data-testid="question-item"]:has-text("${title}")`
    );
    await this.click(question, { description: `Question: ${title}` });
    return this;
  }

  /**
   * Click edit button for the selected question
   */
  async clickEditQuestion(questionTitle: string): Promise<MasterQuestionnairePage> {
    Log.info(`Clicking edit for question: ${questionTitle}`);
    const questionRow = this.page.locator(
      `.question-item:has-text("${questionTitle}"), [data-testid="question-item"]:has-text("${questionTitle}")`
    );
    const editBtn = questionRow.locator(
      'button:has-text("Edit"), [data-testid="edit-question-btn"]'
    );
    await this.click(editBtn, { description: `Edit question: ${questionTitle}` });
    return this;
  }

  /**
   * Edit question title
   */
  async editQuestionTitle(newTitle: string): Promise<MasterQuestionnairePage> {
    Log.info(`Editing question title to: ${newTitle}`);
    await this.questionTitleInput.clear();
    await this.fill(this.questionTitleInput, newTitle, { description: 'Question title input' });
    return this;
  }

  /**
   * Change question type
   */
  async changeQuestionType(newType: string): Promise<MasterQuestionnairePage> {
    Log.info(`Changing question type to: ${newType}`);

    // Handle both native select and Angular Material select
    const isMatSelect = await this.questionTypeSelect.evaluate(
      el => el.tagName.toLowerCase() === 'mat-select'
    );

    if (isMatSelect) {
      await this.click(this.questionTypeSelect, { description: 'Question type dropdown' });
      const option = this.page.locator(`mat-option:has-text("${newType}")`);
      await this.click(option, { description: `Option: ${newType}` });
    } else {
      await this.questionTypeSelect.selectOption({ label: newType });
    }

    return this;
  }

  /**
   * Add question options (for dropdown/radio/checkbox types)
   */
  async addQuestionOptions(options: string[]): Promise<MasterQuestionnairePage> {
    Log.info(`Adding ${options.length} question options`);

    for (const option of options) {
      await this.click(this.addOptionButton, { description: 'Add option button' });
      const optionInputs = this.questionOptionsContainer.locator('input');
      const lastInput = optionInputs.last();
      await this.fill(lastInput, option, { description: `Option: ${option}` });
    }

    return this;
  }

  /**
   * Save question changes
   */
  async saveQuestion(): Promise<MasterQuestionnairePage> {
    Log.info('Saving question changes');
    await this.click(this.questionSaveButton, { description: 'Save question button' });
    await this.waitForLoadingComplete();
    return this;
  }

  /**
   * Cancel question edit
   */
  async cancelQuestionEdit(): Promise<MasterQuestionnairePage> {
    Log.info('Cancelling question edit');
    await this.click(this.questionCancelButton, { description: 'Cancel question button' });
    return this;
  }

  /**
   * Confirm action in modal
   */
  async confirmAction(): Promise<MasterQuestionnairePage> {
    Log.info('Confirming action');
    await expect(this.confirmationModal).toBeVisible({ timeout: 5000 });
    await this.click(this.confirmButton, { description: 'Confirm button' });
    return this;
  }

  /**
   * Verify reg area name is displayed
   */
  async verifyRegAreaName(expectedName: string): Promise<void> {
    Log.info(`Verifying reg area name: ${expectedName}`);
    const regArea = this.page.locator(
      `.reg-area-item:has-text("${expectedName}"), [data-testid="reg-area-item"]:has-text("${expectedName}")`
    );
    await expect(regArea).toBeVisible();
    Log.info(`Reg area name verified: ${expectedName}`);
  }

  /**
   * Verify question title is displayed
   */
  async verifyQuestionTitle(expectedTitle: string): Promise<void> {
    Log.info(`Verifying question title: ${expectedTitle}`);
    const question = this.page.locator(
      `.question-item:has-text("${expectedTitle}"), [data-testid="question-item"]:has-text("${expectedTitle}")`
    );
    await expect(question).toBeVisible();
    Log.info(`Question title verified: ${expectedTitle}`);
  }

  /**
   * Verify question type is displayed
   */
  async verifyQuestionType(expectedType: string): Promise<void> {
    Log.info(`Verifying question type: ${expectedType}`);
    const typeIndicator = this.page.locator(
      `.question-type:has-text("${expectedType}"), [data-testid="question-type"]:has-text("${expectedType}")`
    );
    await expect(typeIndicator).toBeVisible();
    Log.info(`Question type verified: ${expectedType}`);
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage(): Promise<void> {
    Log.info('Verifying success message');
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
    Log.info('Success message displayed');
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(): Promise<void> {
    Log.info('Verifying error message');
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    Log.info('Error message displayed');
  }

  /**
   * Get current reg area name from input
   */
  async getRegAreaNameValue(): Promise<string> {
    return await this.regAreaNameInput.inputValue();
  }

  /**
   * Get current question title from input
   */
  async getQuestionTitleValue(): Promise<string> {
    return await this.questionTitleInput.inputValue();
  }

  /**
   * Verify question options are displayed
   */
  async verifyQuestionOptions(expectedOptions: string[]): Promise<void> {
    Log.info('Verifying question options');
    for (const option of expectedOptions) {
      const optionElement = this.questionOptionsContainer.locator(`text="${option}"`);
      await expect(optionElement).toBeVisible();
    }
    Log.info('Question options verified');
  }
}

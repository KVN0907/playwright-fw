/**
 * @fileoverview Master Questionnaire Edit - E2E Tests
 * @description E2E tests for User Story #197273 - Edit reg area name and questions
 * @testCases TC-E2E-001 through TC-E2E-006
 */

import { test } from '../../fixtures/advancedFixtures';
import { faker } from '@faker-js/faker';

/**
 * Test Data Configuration using faker
 */
const uniqueId = `${Date.now()}`.slice(-6);
const testConfig = {
  regArea: {
    originalName: 'Section 1',
    updatedName: `${faker.commerce.department()} Section ${uniqueId}`,
    description: faker.lorem.sentence(),
  },
  question: {
    originalTitle: 'Question 1',
    updatedTitle: `${faker.lorem.words(3)} ${uniqueId}`,
    types: {
      TEXT: 'Text',
      DROPDOWN: 'Dropdown',
      CHECKBOX: 'Checkbox',
      RADIO: 'Radio',
    },
    dropdownOptions: [faker.word.noun(), faker.word.noun(), faker.word.noun()],
  },
};

test.describe('Master Questionnaire Edit - EY Super Admin', () => {
  test.beforeEach(async ({ masterQuestionnairePage }) => {
    await masterQuestionnairePage.navigateToMasterQuestionnaire();
  });

  test('TC-E2E-001 & AC1: Edit question text - updated text is saved and displayed', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-E2E-001');
    testContext.addMetadata('userStory', '#197273');
    testContext.addMetadata('acceptanceCriteria', 'AC1');

    // Given I have added a question to a reg area
    await masterQuestionnairePage.selectRegArea(testConfig.regArea.originalName);

    // When I choose to edit the question
    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);

    // And I update the question text
    await masterQuestionnairePage.editQuestionTitle(testConfig.question.updatedTitle);

    // And I save the changes
    await masterQuestionnairePage.saveQuestion();

    // Then the updated text is saved
    await masterQuestionnairePage.verifySuccessMessage();

    // And the new text is displayed in the reg area
    await masterQuestionnairePage.verifyQuestionTitle(testConfig.question.updatedTitle);
  });

  test('TC-E2E-002 & AC2: Change question type (TEXT to DROPDOWN) - type saved and preview updated', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-E2E-002');
    testContext.addMetadata('userStory', '#197273');
    testContext.addMetadata('acceptanceCriteria', 'AC2');

    // Given I have added a question to a reg area
    await masterQuestionnairePage.selectRegArea(testConfig.regArea.originalName);

    // When I choose to edit the question
    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);

    // And I change the question type (e.g., from text to dropdown)
    await masterQuestionnairePage.changeQuestionType(testConfig.question.types.DROPDOWN);

    // And I save the changes
    await masterQuestionnairePage.saveQuestion();

    // Then the updated question type is saved
    await masterQuestionnairePage.verifySuccessMessage();

    // And the question appears with the new input type in the section preview
    await masterQuestionnairePage.verifyQuestionType(testConfig.question.types.DROPDOWN);
  });

  test('TC-E2E-003 & AC2: Change question type with input options - options persisted', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-E2E-003');
    testContext.addMetadata('userStory', '#197273');
    testContext.addMetadata('acceptanceCriteria', 'AC2');

    // Given I have added a question to a reg area
    await masterQuestionnairePage.selectRegArea(testConfig.regArea.originalName);

    // When I choose to edit the question
    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);

    // And I change the question type to dropdown
    await masterQuestionnairePage.changeQuestionType(testConfig.question.types.DROPDOWN);

    // And I provide the necessary input options
    await masterQuestionnairePage.addQuestionOptions(testConfig.question.dropdownOptions);

    // And I save the changes
    await masterQuestionnairePage.saveQuestion();

    // Then the updated question type is saved with options
    await masterQuestionnairePage.verifySuccessMessage();

    // Verify options are displayed
    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);
    await masterQuestionnairePage.verifyQuestionOptions(testConfig.question.dropdownOptions);
    await masterQuestionnairePage.cancelQuestionEdit();
  });

  test('TC-E2E-004 & AC3: Edit reg area name - new name saved and displayed', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-E2E-004');
    testContext.addMetadata('userStory', '#197273');
    testContext.addMetadata('acceptanceCriteria', 'AC3');

    // Given I have added a reg area
    // When I choose to edit the reg area
    await masterQuestionnairePage.clickEditRegArea(testConfig.regArea.originalName);

    // And I update the reg area name text
    await masterQuestionnairePage.editRegAreaName(testConfig.regArea.updatedName);

    // And I save
    await masterQuestionnairePage.saveRegArea();

    // Then the new text is saved
    await masterQuestionnairePage.verifySuccessMessage();

    // And the new text is displayed in the reg area
    await masterQuestionnairePage.verifyRegAreaName(testConfig.regArea.updatedName);
  });

  test('TC-E2E-005: Cancel edit question - no changes saved', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-E2E-005');
    testContext.addMetadata('userStory', '#197273');
    testContext.addMetadata('testType', 'Negative');

    // Given I have a question in a reg area
    await masterQuestionnairePage.selectRegArea(testConfig.regArea.originalName);

    // When I choose to edit the question
    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);

    // And I update the question text
    const tempTitle = 'Temporary Title - Should Not Save';
    await masterQuestionnairePage.editQuestionTitle(tempTitle);

    // And I cancel the edit
    await masterQuestionnairePage.cancelQuestionEdit();

    // Then the original text should still be displayed
    await masterQuestionnairePage.verifyQuestionTitle(testConfig.question.originalTitle);
  });

  test('TC-E2E-006: Cancel edit reg area - no changes saved', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-E2E-006');
    testContext.addMetadata('userStory', '#197273');
    testContext.addMetadata('testType', 'Negative');

    // Given I have a reg area
    // When I choose to edit the reg area
    await masterQuestionnairePage.clickEditRegArea(testConfig.regArea.originalName);

    // And I update the reg area name
    const tempName = 'Temporary Name - Should Not Save';
    await masterQuestionnairePage.editRegAreaName(tempName);

    // And I cancel the edit
    await masterQuestionnairePage.cancelRegAreaEdit();

    // Then the original name should still be displayed
    await masterQuestionnairePage.verifyRegAreaName(testConfig.regArea.originalName);
  });
});

test.describe('Master Questionnaire Edit - Question Type Changes', () => {
  test.beforeEach(async ({ masterQuestionnairePage }) => {
    await masterQuestionnairePage.navigateToMasterQuestionnaire();
    await masterQuestionnairePage.selectRegArea(testConfig.regArea.originalName);
  });

  test('Change question type from TEXT to CHECKBOX', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-E2E-002b');
    testContext.addMetadata('acceptanceCriteria', 'AC2');

    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);
    await masterQuestionnairePage.changeQuestionType(testConfig.question.types.CHECKBOX);
    await masterQuestionnairePage.saveQuestion();

    await masterQuestionnairePage.verifySuccessMessage();
    await masterQuestionnairePage.verifyQuestionType(testConfig.question.types.CHECKBOX);
  });

  test('Change question type from TEXT to RADIO', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testCase', 'TC-E2E-002c');
    testContext.addMetadata('acceptanceCriteria', 'AC2');

    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);
    await masterQuestionnairePage.changeQuestionType(testConfig.question.types.RADIO);
    await masterQuestionnairePage.saveQuestion();

    await masterQuestionnairePage.verifySuccessMessage();
    await masterQuestionnairePage.verifyQuestionType(testConfig.question.types.RADIO);
  });
});

test.describe('Master Questionnaire Edit - Full Workflow', () => {
  test('Complete workflow: Edit reg area name and question', async ({
    masterQuestionnairePage,
    testContext,
  }) => {
    testContext.addMetadata('testType', 'Integration');
    testContext.addMetadata('userStory', '#197273');

    // Navigate to Master Questionnaire
    await masterQuestionnairePage.navigateToMasterQuestionnaire();

    // Edit reg area name
    await masterQuestionnairePage.clickEditRegArea(testConfig.regArea.originalName);
    await masterQuestionnairePage.editRegAreaName(testConfig.regArea.updatedName);
    await masterQuestionnairePage.editRegAreaDescription(testConfig.regArea.description);
    await masterQuestionnairePage.saveRegArea();
    await masterQuestionnairePage.verifySuccessMessage();
    await masterQuestionnairePage.verifyRegAreaName(testConfig.regArea.updatedName);

    // Select updated reg area and edit question
    await masterQuestionnairePage.selectRegArea(testConfig.regArea.updatedName);
    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);
    await masterQuestionnairePage.editQuestionTitle(testConfig.question.updatedTitle);
    await masterQuestionnairePage.changeQuestionType(testConfig.question.types.DROPDOWN);
    await masterQuestionnairePage.addQuestionOptions(testConfig.question.dropdownOptions);
    await masterQuestionnairePage.saveQuestion();
    await masterQuestionnairePage.verifySuccessMessage();

    // Verify all changes persisted
    await masterQuestionnairePage.verifyRegAreaName(testConfig.regArea.updatedName);
    await masterQuestionnairePage.verifyQuestionTitle(testConfig.question.updatedTitle);
    await masterQuestionnairePage.verifyQuestionType(testConfig.question.types.DROPDOWN);
  });
});

test.describe('Master Questionnaire Edit - Error Handling', () => {
  test('Handle network failure during save gracefully', async ({
    masterQuestionnairePage,
    page,
    testContext,
  }) => {
    testContext.addMetadata('testType', 'Error handling');

    await masterQuestionnairePage.navigateToMasterQuestionnaire();

    // Mock network failure for save API
    await page.route('**/api/compliancemanager/reg-area', route => route.abort('failed'));

    await masterQuestionnairePage.clickEditRegArea(testConfig.regArea.originalName);
    await masterQuestionnairePage.editRegAreaName('Test Name');
    await masterQuestionnairePage.saveRegArea();

    // Verify error message is displayed
    await masterQuestionnairePage.verifyErrorMessage();
  });

  test('Handle network failure during question save gracefully', async ({
    masterQuestionnairePage,
    page,
    testContext,
  }) => {
    testContext.addMetadata('testType', 'Error handling');

    await masterQuestionnairePage.navigateToMasterQuestionnaire();
    await masterQuestionnairePage.selectRegArea(testConfig.regArea.originalName);

    // Mock network failure for save API
    await page.route('**/api/compliancemanager/questions', route => route.abort('failed'));

    await masterQuestionnairePage.clickEditQuestion(testConfig.question.originalTitle);
    await masterQuestionnairePage.editQuestionTitle('Test Title');
    await masterQuestionnairePage.saveQuestion();

    // Verify error message is displayed
    await masterQuestionnairePage.verifyErrorMessage();
  });
});

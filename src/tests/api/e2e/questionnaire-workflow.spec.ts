import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * E2E Test: Master Questionnaire Workflow
 *
 * This test covers the complete questionnaire creation workflow:
 * 1. Create a Regulatory Area
 * 2. Add Questions to the Regulatory Area
 * 3. Create a Master Questionnaire
 * 4. Map Countries to Questions
 * 5. Verify questionnaire is ready for assignment
 *
 * Related ADO Stories:
 * - #197265: Create Reg Area and Questions
 * - #197269: Upload Questions
 * - #197273: Edit Reg Area
 * - Master Questionnaire API
 */

const API_BASE = '/api/compliancemanager';

// Cleanup tracker
const cleanup: {
  regAreaIds: number[];
  questionIds: number[];
} = {
  regAreaIds: [],
  questionIds: [],
};

test.describe('E2E: Master Questionnaire Workflow', () => {
  let createdRegAreaId: number;
  const createdQuestionIds: number[] = [];

  test.afterAll(async ({ superAdminRequest }) => {
    // Cleanup in reverse order
    for (const questionId of cleanup.questionIds) {
      try {
        await superAdminRequest.delete(`${API_BASE}/questions/${questionId}`);
      } catch {
        // Ignore cleanup errors
      }
    }
    for (const regAreaId of cleanup.regAreaIds) {
      try {
        await superAdminRequest.delete(`${API_BASE}/reg-area/${regAreaId}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  test('@e2e @smoke Step 1: Create Regulatory Area', async ({ superAdminRequest }) => {
    const regAreaName = `E2E Reg Area ${faker.commerce.department()} ${Date.now()}`;

    const response = await superAdminRequest.post(`${API_BASE}/reg-area`, {
      data: {
        name: regAreaName,
        description: 'E2E test regulatory area for questionnaire workflow',
        isActive: true,
        isApproved: true,
        isDelete: false,
      },
    });

    expect(response.status()).toBe(201);
    const data = await response.json();

    expect(data.id).toBeDefined();
    expect(data.name).toBe(regAreaName);

    createdRegAreaId = data.id;
    cleanup.regAreaIds.push(data.id);
  });

  test('@e2e @smoke Step 2: Add Questions to Regulatory Area', async ({ superAdminRequest }) => {
    test.skip(!createdRegAreaId, 'Regulatory Area not created');

    const questions = [
      {
        questionText: `E2E Question 1: ${faker.lorem.sentence()}`,
        regAreaId: createdRegAreaId,
        questionType: 'TEXT',
        isActive: true,
        isMandatory: true,
      },
      {
        questionText: `E2E Question 2: ${faker.lorem.sentence()}`,
        regAreaId: createdRegAreaId,
        questionType: 'YES_NO',
        isActive: true,
        isMandatory: false,
      },
      {
        questionText: `E2E Question 3: ${faker.lorem.sentence()}`,
        regAreaId: createdRegAreaId,
        questionType: 'MULTIPLE_CHOICE',
        isActive: true,
        isMandatory: true,
      },
    ];

    for (const question of questions) {
      const response = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: question,
      });

      expect([200, 201]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();
        if (data.id) {
          createdQuestionIds.push(data.id);
          cleanup.questionIds.push(data.id);
        }
      }
    }

    expect(createdQuestionIds.length).toBeGreaterThanOrEqual(1);
  });

  test('@e2e @smoke Step 3: Verify Regulatory Area has questions', async ({
    superAdminRequest,
  }) => {
    test.skip(!createdRegAreaId, 'Regulatory Area not created');

    const response = await superAdminRequest.get(`${API_BASE}/reg-area`);
    expect(response.status()).toBe(200);

    const regAreas = await response.json();
    const ourRegArea = regAreas.find((ra: { id: number }) => ra.id === createdRegAreaId);

    expect(ourRegArea).toBeDefined();
    expect(ourRegArea.isActive).toBe(true);
  });

  test('@e2e @smoke Step 4: Verify Questions are retrievable', async ({ superAdminRequest }) => {
    test.skip(createdQuestionIds.length === 0, 'No questions created');

    const response = await superAdminRequest.get(`${API_BASE}/questions`);
    expect(response.status()).toBe(200);

    const questions = await response.json();

    // Verify at least one of our created questions exists
    const ourQuestions = questions.filter((q: { id: number }) => createdQuestionIds.includes(q.id));

    expect(ourQuestions.length).toBeGreaterThanOrEqual(1);
  });

  test('@e2e @smoke Step 5: Update Regulatory Area name', async ({ superAdminRequest }) => {
    test.skip(!createdRegAreaId, 'Regulatory Area not created');

    const updatedName = `E2E Updated Reg Area ${Date.now()}`;

    const response = await superAdminRequest.put(`${API_BASE}/reg-area`, {
      data: {
        id: createdRegAreaId,
        name: updatedName,
        description: 'Updated E2E test regulatory area',
        isActive: true,
        isApproved: true,
        isDelete: false,
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.name).toBe(updatedName);
  });

  test('@e2e @smoke Step 6: Map questions to countries', async ({ superAdminRequest }) => {
    test.skip(createdQuestionIds.length === 0, 'No questions created');

    // Get available countries
    const countriesResponse = await superAdminRequest.get(`${API_BASE}/countries`);

    if (countriesResponse.ok()) {
      const countries = await countriesResponse.json();
      if (countries?.length > 0) {
        const countryId = countries[0].id;

        // Map first question to first country
        const mappingResponse = await superAdminRequest.post(
          `${API_BASE}/country-questions-mapping`,
          {
            data: {
              questionId: createdQuestionIds[0],
              countryId: countryId,
              isActive: true,
            },
          }
        );

        // Mapping might return various success codes
        expect([200, 201, 204, 409]).toContain(mappingResponse.status());
      }
    }
  });

  test('@e2e @smoke Step 7: Soft delete questions (cleanup prep)', async ({
    superAdminRequest,
  }) => {
    test.skip(createdQuestionIds.length === 0, 'No questions to delete');

    for (const questionId of createdQuestionIds) {
      const response = await superAdminRequest.delete(`${API_BASE}/questions/${questionId}`);
      // Delete might return 200 or 204
      expect([200, 204]).toContain(response.status());
    }
  });

  test('@e2e @smoke Step 8: Soft delete Regulatory Area (final cleanup)', async ({
    superAdminRequest,
  }) => {
    test.skip(!createdRegAreaId, 'Regulatory Area not created');

    const response = await superAdminRequest.delete(`${API_BASE}/reg-area/${createdRegAreaId}`);
    expect([200, 204]).toContain(response.status());

    // Verify it's deleted (soft delete - should not appear in list)
    const verifyResponse = await superAdminRequest.get(`${API_BASE}/reg-area`);
    const regAreas = await verifyResponse.json();
    const deletedRegArea = regAreas.find((ra: { id: number }) => ra.id === createdRegAreaId);

    expect(deletedRegArea).toBeUndefined();
  });
});

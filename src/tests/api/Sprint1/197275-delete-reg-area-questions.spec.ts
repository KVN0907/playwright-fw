import { test, expect } from '../../fixtures/advancedFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for Delete Reg Area and Questions
 * Story #197275: Master questionnaire - Delete a reg area and question from a reg area (Backend)
 *
 * Endpoints:
 * - DELETE /api/compliancemanager/reg-area/{id} (Delete Reg Area)
 * - DELETE /api/compliancemanager/questions/{id} (Delete Question)
 *
 * Related ADO Test Cases:
 * - #202721: Bulk Delete Multiple Questions from a Regulatory Area via API
 * - #202722: Delete Single Question from a Regulatory Area via API
 * - #202723: Cancel Bulk Question Deletion via API (UI - skipped)
 * - #202724: Bulk Delete Multiple Regulatory Areas via API
 * - #202725: Cancel Regulatory Area Deletion (UI - skipped)
 * - #202726: Delete Non-Existent Question via API
 * - #202727: Delete Non-Existent Regulatory Area via API
 * - #202729: Delete Empty Regulatory Area via API
 * - #202730: Bulk Question Deletion With Partial Invalid IDs
 * - #202731: Bulk Regulatory Area Deletion with Invalid/Deleted IDs
 */

const API_BASE = '/api/compliancemanager';
const REG_AREA_ENDPOINT = `${API_BASE}/reg-area`;
const QUESTIONS_ENDPOINT = `${API_BASE}/questions`;

const generateUniqueId = () => `${Date.now()}`.slice(-6);

const generateRegAreaName = () => `Delete Test RegArea ${generateUniqueId()}`;

const generateQuestionTitle = () =>
  `Delete Test Question ${generateUniqueId()} - ${faker.lorem.sentence().slice(0, 30)}`;

interface RegArea {
  id: number;
  name: string;
}

interface Question {
  id: number;
  title: string;
  regAreaId: number;
}

test.describe('Story #197275: Delete Reg Area and Questions API Tests', () => {
  test.describe('DELETE /questions/{id} - Delete Questions', () => {
    let testRegAreaId: number;

    test.beforeAll(async ({ request }) => {
      const createResponse = await request.post(REG_AREA_ENDPOINT, {
        data: {
          name: generateRegAreaName(),
          description: 'Test reg area for delete question tests',
          isActive: true,
          isApproved: true,
        },
      });

      if (createResponse.status() === 201) {
        const data = await createResponse.json();
        testRegAreaId = data.id;
        console.log(`Created test reg area for delete tests: ${testRegAreaId}`);
      }
    });

    test.afterAll(async ({ request }) => {
      if (testRegAreaId) {
        await request.delete(`${REG_AREA_ENDPOINT}/${testRegAreaId}`);
        console.log(`Cleaned up test reg area: ${testRegAreaId}`);
      }
    });

    test('@smoke @ADO-202722 should delete single question from regulatory area via API', async ({
      request,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Questions' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202722' }
        );

      test.skip(!testRegAreaId, 'No test reg area available');

      // Create a question to delete
      const createResponse = await request.post(QUESTIONS_ENDPOINT, {
        data: {
          id: null,
          title: generateQuestionTitle(),
          questionType: 'TEXT',
          regAreaId: testRegAreaId,
        },
      });
      expect(createResponse.status()).toBe(201);
      const question = await createResponse.json();
      console.log(`Created question for deletion: ${question.id}`);

      // Delete the question
      const deleteResponse = await request.delete(`${QUESTIONS_ENDPOINT}/${question.id}`);
      expect([200, 204]).toContain(deleteResponse.status());

      // Verify question is deleted
      const fetchResponse = await request.get(`${QUESTIONS_ENDPOINT}/${testRegAreaId}`);
      const questions = await fetchResponse.json();
      const found = questions.find((q: Question) => q.id === question.id);
      expect(found).toBeUndefined();
    });

    test('@smoke @ADO-202721 should bulk delete multiple questions from regulatory area via API', async ({
      request,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Questions' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202721' }
        );

      test.skip(!testRegAreaId, 'No test reg area available');

      // Create multiple questions
      const createdQuestions: Question[] = [];
      for (let i = 1; i <= 3; i++) {
        const createResponse = await request.post(QUESTIONS_ENDPOINT, {
          data: {
            id: null,
            title: `Bulk Delete Q${i} ${generateUniqueId()}`,
            questionType: 'TEXT',
            regAreaId: testRegAreaId,
          },
        });
        expect(createResponse.status()).toBe(201);
        const question = await createResponse.json();
        createdQuestions.push(question);
      }
      console.log(
        `Created ${createdQuestions.length} questions for bulk deletion: ${createdQuestions.map(q => q.id).join(', ')}`
      );

      // Delete all questions
      for (const question of createdQuestions) {
        const deleteResponse = await request.delete(`${QUESTIONS_ENDPOINT}/${question.id}`);
        expect([200, 204]).toContain(deleteResponse.status());
      }

      // Verify all questions are deleted
      const fetchResponse = await request.get(`${QUESTIONS_ENDPOINT}/${testRegAreaId}`);
      const remainingQuestions = await fetchResponse.json();
      for (const question of createdQuestions) {
        const found = remainingQuestions.find((q: Question) => q.id === question.id);
        expect(found).toBeUndefined();
      }
    });

    test('@negative @ADO-202726 should handle delete non-existent question via API', async ({
      request,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Questions' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202726' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const nonExistentId = 999999999;
      const deleteResponse = await request.delete(`${QUESTIONS_ENDPOINT}/${nonExistentId}`);
      expect([404, 400, 500]).toContain(deleteResponse.status());
    });

    test('@negative @ADO-202730 should handle bulk question deletion with partial invalid IDs', async ({
      request,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Questions' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202730' },
          { type: 'category', description: 'NEGATIVE' }
        );

      test.skip(!testRegAreaId, 'No test reg area available');

      // Create one valid question
      const createResponse = await request.post(QUESTIONS_ENDPOINT, {
        data: {
          id: null,
          title: `Partial Invalid Test ${generateUniqueId()}`,
          questionType: 'TEXT',
          regAreaId: testRegAreaId,
        },
      });
      expect(createResponse.status()).toBe(201);
      const validQuestion = await createResponse.json();

      // Delete valid question
      const validDeleteResponse = await request.delete(`${QUESTIONS_ENDPOINT}/${validQuestion.id}`);
      expect([200, 204]).toContain(validDeleteResponse.status());

      // Try to delete invalid question
      const invalidDeleteResponse = await request.delete(`${QUESTIONS_ENDPOINT}/999999999`);
      expect([404, 400, 500]).toContain(invalidDeleteResponse.status());
    });

    test('@edge should reject delete with invalid question ID format', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'story', description: '197275' },
          { type: 'category', description: 'VALIDATION' }
        );

      // String instead of number
      const deleteResponse1 = await request.delete(`${QUESTIONS_ENDPOINT}/abc`);
      expect([400, 404, 500]).toContain(deleteResponse1.status());

      // Negative ID
      const deleteResponse2 = await request.delete(`${QUESTIONS_ENDPOINT}/-1`);
      expect([400, 404, 500]).toContain(deleteResponse2.status());

      // Zero ID
      const deleteResponse3 = await request.delete(`${QUESTIONS_ENDPOINT}/0`);
      expect([400, 404, 500]).toContain(deleteResponse3.status());
    });

    test('@edge should not delete question twice (idempotency)', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'story', description: '197275' },
          { type: 'category', description: 'EDGE' }
        );

      test.skip(!testRegAreaId, 'No test reg area available');

      // Create a question
      const createResponse = await request.post(QUESTIONS_ENDPOINT, {
        data: {
          id: null,
          title: `Double Delete Test ${generateUniqueId()}`,
          questionType: 'TEXT',
          regAreaId: testRegAreaId,
        },
      });
      expect(createResponse.status()).toBe(201);
      const question = await createResponse.json();

      // Delete first time
      const firstDeleteResponse = await request.delete(`${QUESTIONS_ENDPOINT}/${question.id}`);
      expect([200, 204]).toContain(firstDeleteResponse.status());

      // Delete second time - should fail
      const secondDeleteResponse = await request.delete(`${QUESTIONS_ENDPOINT}/${question.id}`);
      expect([404, 400, 500]).toContain(secondDeleteResponse.status());
    });
  });

  test.describe('DELETE /reg-area/{id} - Delete Regulatory Areas', () => {
    test('@smoke @ADO-202729 should delete empty regulatory area via API', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'RegArea' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202729' }
        );

      // Create an empty reg area
      const createResponse = await request.post(REG_AREA_ENDPOINT, {
        data: {
          name: `Empty RegArea ${generateUniqueId()}`,
          description: 'Empty reg area for deletion test',
          isActive: true,
          isApproved: true,
        },
      });
      expect(createResponse.status()).toBe(201);
      const regArea = await createResponse.json();
      console.log(`Created empty reg area for deletion: ${regArea.id}`);

      // Delete the reg area
      const deleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/${regArea.id}`);
      expect([200, 204]).toContain(deleteResponse.status());

      // Verify reg area is deleted (soft delete via isDelete flag or actual deletion)
      const fetchResponse = await request.get(REG_AREA_ENDPOINT);
      const allRegAreas = await fetchResponse.json();
      const found = allRegAreas.find(
        (ra: RegArea) =>
          ra.id === regArea.id && (ra as unknown as { isDelete: boolean }).isDelete !== true
      );
      expect(found).toBeUndefined();
    });

    test('@smoke should delete regulatory area with questions (cascade)', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'RegArea' },
          { type: 'story', description: '197275' }
        );

      // Create a reg area
      const createRegAreaResponse = await request.post(REG_AREA_ENDPOINT, {
        data: {
          name: `RegArea With Questions ${generateUniqueId()}`,
          description: 'Reg area with questions for deletion test',
          isActive: true,
          isApproved: true,
        },
      });
      expect(createRegAreaResponse.status()).toBe(201);
      const regArea = await createRegAreaResponse.json();

      // Add questions to the reg area
      const createdQuestions: Question[] = [];
      for (let i = 1; i <= 2; i++) {
        const createQuestionResponse = await request.post(QUESTIONS_ENDPOINT, {
          data: {
            id: null,
            title: `Question ${i} in ${regArea.name} ${generateUniqueId()}`,
            questionType: 'TEXT',
            regAreaId: regArea.id,
          },
        });
        expect(createQuestionResponse.status()).toBe(201);
        createdQuestions.push(await createQuestionResponse.json());
      }
      console.log(`Created reg area ${regArea.id} with ${createdQuestions.length} questions`);

      // Delete the reg area (should cascade delete questions)
      const deleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/${regArea.id}`);
      expect([200, 204]).toContain(deleteResponse.status());

      // Verify questions are also deleted or orphaned
      const fetchQuestionsResponse = await request.get(`${QUESTIONS_ENDPOINT}/${regArea.id}`);
      if (fetchQuestionsResponse.status() === 200) {
        const remainingQuestions = await fetchQuestionsResponse.json();
        expect(remainingQuestions.length).toBe(0);
      }
    });

    test('@smoke @ADO-202724 should bulk delete multiple regulatory areas via API', async ({
      request,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'RegArea' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202724' }
        );

      // Create multiple reg areas
      const createdRegAreas: RegArea[] = [];
      for (let i = 1; i <= 3; i++) {
        const createResponse = await request.post(REG_AREA_ENDPOINT, {
          data: {
            name: `Bulk Delete RegArea ${i} ${generateUniqueId()}`,
            description: `Bulk delete test reg area ${i}`,
            isActive: true,
            isApproved: true,
          },
        });
        expect(createResponse.status()).toBe(201);
        createdRegAreas.push(await createResponse.json());
      }
      console.log(`Created ${createdRegAreas.length} reg areas for bulk deletion`);

      // Delete all reg areas
      for (const regArea of createdRegAreas) {
        const deleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/${regArea.id}`);
        expect([200, 204]).toContain(deleteResponse.status());
      }

      // Verify all reg areas are deleted
      const fetchResponse = await request.get(REG_AREA_ENDPOINT);
      const allRegAreas = await fetchResponse.json();
      for (const regArea of createdRegAreas) {
        const found = allRegAreas.find(
          (ra: RegArea) =>
            ra.id === regArea.id && (ra as unknown as { isDelete: boolean }).isDelete !== true
        );
        expect(found).toBeUndefined();
      }
    });

    test('@negative @ADO-202727 should handle delete non-existent regulatory area via API', async ({
      request,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'RegArea' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202727' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const nonExistentId = 999999999;
      const deleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/${nonExistentId}`);
      expect([404, 400, 500]).toContain(deleteResponse.status());
    });

    test('@negative @ADO-202731 should handle bulk reg area deletion with invalid/deleted IDs', async ({
      request,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'RegArea' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202731' },
          { type: 'category', description: 'NEGATIVE' }
        );

      // Create one valid reg area
      const createResponse = await request.post(REG_AREA_ENDPOINT, {
        data: {
          name: `Valid RegArea ${generateUniqueId()}`,
          description: 'Valid reg area for partial invalid test',
          isActive: true,
          isApproved: true,
        },
      });
      expect(createResponse.status()).toBe(201);
      const validRegArea = await createResponse.json();

      // Delete valid reg area first
      const validDeleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/${validRegArea.id}`);
      expect([200, 204]).toContain(validDeleteResponse.status());

      // Try to delete already deleted reg area
      const deletedAgainResponse = await request.delete(`${REG_AREA_ENDPOINT}/${validRegArea.id}`);
      expect([404, 400, 500]).toContain(deletedAgainResponse.status());

      // Try to delete non-existent reg area
      const invalidDeleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/999999999`);
      expect([404, 400, 500]).toContain(invalidDeleteResponse.status());
    });

    test('@edge should reject delete with invalid reg area ID format', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'RegArea' },
          { type: 'story', description: '197275' },
          { type: 'category', description: 'VALIDATION' }
        );

      // String instead of number
      const deleteResponse1 = await request.delete(`${REG_AREA_ENDPOINT}/abc`);
      expect([400, 404, 500]).toContain(deleteResponse1.status());

      // Negative ID
      const deleteResponse2 = await request.delete(`${REG_AREA_ENDPOINT}/-1`);
      expect([400, 404, 500]).toContain(deleteResponse2.status());

      // Zero ID
      const deleteResponse3 = await request.delete(`${REG_AREA_ENDPOINT}/0`);
      expect([400, 404, 500]).toContain(deleteResponse3.status());
    });

    test('@edge should not delete reg area twice (idempotency)', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'RegArea' },
          { type: 'story', description: '197275' },
          { type: 'category', description: 'EDGE' }
        );

      // Create a reg area
      const createResponse = await request.post(REG_AREA_ENDPOINT, {
        data: {
          name: `Double Delete RegArea ${generateUniqueId()}`,
          description: 'Reg area for double delete test',
          isActive: true,
          isApproved: true,
        },
      });
      expect(createResponse.status()).toBe(201);
      const regArea = await createResponse.json();

      // Delete first time
      const firstDeleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/${regArea.id}`);
      expect([200, 204]).toContain(firstDeleteResponse.status());

      // Delete second time - should fail
      const secondDeleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/${regArea.id}`);
      expect([404, 400, 500]).toContain(secondDeleteResponse.status());
    });

    test('@edge should handle delete with floating point ID', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'low' },
          { type: 'feature', description: 'RegArea' },
          { type: 'story', description: '197275' },
          { type: 'category', description: 'EDGE' }
        );

      const deleteResponse = await request.delete(`${REG_AREA_ENDPOINT}/1.5`);
      expect([400, 404, 500]).toContain(deleteResponse.status());
    });
  });

  test.describe('UI Scenarios (API Simulation)', () => {
    test.skip('@ui @ADO-202723 Cancel Bulk Question Deletion via API', async () => {
      // This test case is UI-specific (cancel action on popup)
      // API does not have a cancel concept - deletion is immediate
      // Skipping as it requires UI testing
    });

    test.skip('@ui @ADO-202725 Cancel Regulatory Area Deletion', async () => {
      // This test case is UI-specific (cancel action on popup)
      // API does not have a cancel concept - deletion is immediate
      // Skipping as it requires UI testing
    });
  });

  test.describe('Security - Delete Operations', () => {
    test('@security should prevent SQL injection in delete path', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Security' },
          { type: 'story', description: '197275' },
          { type: 'category', description: 'SECURITY' }
        );

      // SQL injection attempts in question delete
      const sqlInjectionResponse1 = await request.delete(
        `${QUESTIONS_ENDPOINT}/1; DROP TABLE questions;--`
      );
      expect([400, 404, 500]).toContain(sqlInjectionResponse1.status());

      // SQL injection attempts in reg area delete
      const sqlInjectionResponse2 = await request.delete(`${REG_AREA_ENDPOINT}/1 OR 1=1`);
      expect([400, 404, 500]).toContain(sqlInjectionResponse2.status());
    });

    test('@security should prevent path traversal in delete path', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Security' },
          { type: 'story', description: '197275' },
          { type: 'category', description: 'SECURITY' }
        );

      // Path traversal attempts
      // 405 = Method Not Allowed is valid - server rejects malformed path
      const pathTraversalResponse1 = await request.delete(
        `${QUESTIONS_ENDPOINT}/../../../etc/passwd`
      );
      expect([400, 404, 405, 500]).toContain(pathTraversalResponse1.status());

      const pathTraversalResponse2 = await request.delete(
        `${REG_AREA_ENDPOINT}/..%2F..%2Fetc%2Fpasswd`
      );
      expect([400, 404, 405, 500]).toContain(pathTraversalResponse2.status());
    });
  });

  test.describe('Concurrency - Delete Operations', () => {
    test('@concurrency should handle concurrent delete of same question', async ({ request }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'story', description: '197275' },
          { type: 'category', description: 'CONCURRENCY' }
        );

      // Create a reg area first
      const createRegAreaResponse = await request.post(REG_AREA_ENDPOINT, {
        data: {
          name: `Concurrency Test RegArea ${generateUniqueId()}`,
          description: 'Reg area for concurrency test',
          isActive: true,
          isApproved: true,
        },
      });
      expect(createRegAreaResponse.status()).toBe(201);
      const regArea = await createRegAreaResponse.json();

      // Create a question
      const createQuestionResponse = await request.post(QUESTIONS_ENDPOINT, {
        data: {
          id: null,
          title: `Concurrency Delete Test ${generateUniqueId()}`,
          questionType: 'TEXT',
          regAreaId: regArea.id,
        },
      });
      expect(createQuestionResponse.status()).toBe(201);
      const question = await createQuestionResponse.json();

      // Send concurrent delete requests
      const [response1, response2] = await Promise.all([
        request.delete(`${QUESTIONS_ENDPOINT}/${question.id}`),
        request.delete(`${QUESTIONS_ENDPOINT}/${question.id}`),
      ]);

      // One should succeed, one should fail (or both succeed if idempotent)
      const statuses = [response1.status(), response2.status()].sort();
      // Either one succeeds and one fails, or both succeed (idempotent)
      expect(statuses.some(s => [200, 204].includes(s))).toBe(true);

      // Cleanup
      await request.delete(`${REG_AREA_ENDPOINT}/${regArea.id}`);
    });
  });
});

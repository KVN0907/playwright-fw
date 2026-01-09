import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for Story 197275 - Delete reg area and questions
 * @description Tests for deleting RegArea and Questions from master questionnaire
 * @story 197275 - Master questionnaire - Delete a reg area and question from a reg area: EY Super Admin (Backend)
 *
 * Acceptance Criteria:
 * - Delete a question successfully (single and bulk)
 * - Delete a reg area successfully (cascades to delete questions)
 * - Handle non-existent resources gracefully
 * - Support bulk deletion with partial invalid IDs
 *
 * Related ADO Test Cases:
 * - #202721: API - Bulk delete multiple questions from reg area
 * - #202722: API - Delete single question from reg area
 * - #202723: API - Handle empty array for bulk deletion
 * - #202724: API - Verify questions are deleted when reg area is deleted
 * - #202725: API - Verify reg area still exists after cancelled deletion
 * - #202726: API - Handle delete of non-existent question
 * - #202727: API - Handle delete of non-existent reg area
 * - #202729: API - Delete empty reg area
 * - #202730: API - Handle bulk deletion with partial invalid IDs
 * - #202731: API - Handle double deletion of same reg area
 */

const API_BASE = '/api/compliancemanager';

const generateRegAreaName = (): string => {
  const uniqueId = `${Date.now()}`.slice(-6);
  return `RegArea_Delete_${faker.company.buzzNoun()}_${uniqueId}`;
};

const generateQuestionText = (): string => {
  return `Question_${faker.lorem.sentence().substring(0, 50)}_${Date.now()}`;
};

test.describe('Story #197275: Delete RegArea and Questions - API Tests', () => {
  test.describe('DELETE /questions/{id} - Delete Single Question', () => {
    test('@api @smoke @ADO-202722 should delete single question from reg area', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Questions' },
          { type: 'story', description: '197275' },
          { type: 'testcase', description: '202722' }
        );

      // Create reg area with a question
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test reg area for question deletion',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      expect(regAreaResponse.status()).toBe(201);
      const regArea = await regAreaResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const questionResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      expect(questionResponse.status()).toBe(201);
      const question = await questionResponse.json();

      // Delete the question
      const deleteResponse = await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);

      expect(deleteResponse.status()).toBe(200);
      const result = await deleteResponse.json();
      expect(result).toBe(true);

      // Verify question is deleted
      const verifyResponse = await superAdminRequest.get(`${API_BASE}/questions/${regArea.id}`);
      const questions = await verifyResponse.json();
      expect(questions.find((q: { id: number }) => q.id === question.id)).toBeUndefined();

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-202726 should handle delete of non-existent question', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202726' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.delete(`${API_BASE}/questions/999999999`);

      expect([200, 204, 404]).toContain(response.status());
    });

    test('@api @regression should handle double deletion of same question', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'category', description: 'EDGE' }
        );

      // Create reg area with a question
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regAreaResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const questionResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      const question = await questionResponse.json();

      // First deletion
      const firstDelete = await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);
      expect(firstDelete.status()).toBe(200);

      // Second deletion (should be graceful)
      const secondDelete = await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);
      expect([200, 204, 404]).toContain(secondDelete.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });
  });

  test.describe('DELETE /questions - Bulk Delete Questions', () => {
    test('@api @smoke @ADO-202721 should bulk delete multiple questions from reg area', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202721' }
        );

      // Create reg area with multiple questions
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test reg area for bulk deletion',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regAreaResponse.json();

      const questionIds: number[] = [];
      for (let i = 0; i < 3; i++) {
        const questionData = {
          id: null,
          title: `${generateQuestionText()}_${i}`,
          questionType: 'TEXT',
          regAreaId: regArea.id,
        };
        const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
          data: questionData,
        });
        const q = await qResponse.json();
        questionIds.push(q.id);
      }

      // Bulk delete
      const deleteResponse = await superAdminRequest.delete(`${API_BASE}/questions`, {
        data: questionIds,
      });

      expect(deleteResponse.status()).toBe(200);
      const result = await deleteResponse.json();
      expect(result).toBe(true);

      // Verify all questions are deleted
      const verifyResponse = await superAdminRequest.get(`${API_BASE}/questions/${regArea.id}`);
      const remainingQuestions = await verifyResponse.json();
      questionIds.forEach(id => {
        expect(remainingQuestions.find((q: { id: number }) => q.id === id)).toBeUndefined();
      });

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-202730 should handle bulk deletion with partial invalid IDs', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202730' },
          { type: 'category', description: 'EDGE' }
        );

      // Create reg area with one valid question
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regAreaResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      const validQuestion = await qResponse.json();

      // Mix valid and invalid IDs
      const mixedIds = [validQuestion.id, 999999998, 999999999];

      // Bulk delete with mixed IDs
      const deleteResponse = await superAdminRequest.delete(`${API_BASE}/questions`, {
        data: mixedIds,
      });

      expect([200, 400, 422]).toContain(deleteResponse.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-202723 should handle empty array for bulk deletion', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202723' },
          { type: 'category', description: 'EDGE' }
        );

      const response = await superAdminRequest.delete(`${API_BASE}/questions`, { data: [] });

      expect([200, 400, 422]).toContain(response.status());
    });
  });

  test.describe('DELETE /reg-area/{id} - Delete Reg Area', () => {
    test('@api @smoke @ADO-202729 should delete empty reg area', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202729' }
        );

      // Create empty reg area
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Empty reg area for deletion',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      expect(regAreaResponse.status()).toBe(201);
      const regArea = await regAreaResponse.json();

      // Delete
      const deleteResponse = await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);

      expect(deleteResponse.status()).toBe(200);
      const result = await deleteResponse.json();
      expect(result).toBe(true);
    });

    test('@api @smoke should delete reg area with questions (cascade)', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Create reg area with questions
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Reg area with questions for cascade deletion',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regAreaResponse.json();

      // Add questions
      for (let i = 0; i < 2; i++) {
        await superAdminRequest.post(`${API_BASE}/questions`, {
          data: {
            id: null,
            title: `${generateQuestionText()}_${i}`,
            questionType: 'TEXT',
            regAreaId: regArea.id,
          },
        });
      }

      // Verify questions exist
      const beforeDelete = await superAdminRequest.get(`${API_BASE}/questions/${regArea.id}`);
      const questionsBefore = await beforeDelete.json();
      expect(questionsBefore.length).toBe(2);

      // Delete reg area
      const deleteResponse = await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);

      expect(deleteResponse.status()).toBe(200);

      // Verify reg area is deleted
      const verifyResponse = await superAdminRequest.get(`${API_BASE}/reg-area`);
      const regAreas = await verifyResponse.json();
      expect(regAreas.find((r: { id: number }) => r.id === regArea.id)).toBeUndefined();
    });

    test('@api @regression @ADO-202727 should handle delete of non-existent reg area', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202727' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.delete(`${API_BASE}/reg-area/999999999`);

      expect([200, 204, 404]).toContain(response.status());
    });

    test('@api @regression @ADO-202731 should handle double deletion of same reg area', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202731' },
          { type: 'category', description: 'EDGE' }
        );

      // Create reg area
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test reg area for double deletion',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regAreaResponse.json();

      // First deletion
      const firstDelete = await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
      expect(firstDelete.status()).toBe(200);

      // Second deletion (should be graceful)
      const secondDelete = await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
      expect([200, 204, 404]).toContain(secondDelete.status());
    });

    test('@api @regression should reject deletion with invalid ID format', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'VALIDATION' }
        );

      const response = await superAdminRequest.delete(`${API_BASE}/reg-area/invalid-id`);

      expect([400, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Cascade Deletion Verification', () => {
    test('@api @regression @ADO-202724 should verify questions are deleted when reg area is deleted', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202724' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Create reg area with questions
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test cascade deletion',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regAreaResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      expect(qResponse.status()).toBe(201);

      // Delete reg area
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);

      // Verify questions for that reg area return empty or error
      const verifyResponse = await superAdminRequest.get(`${API_BASE}/questions/${regArea.id}`);

      if (verifyResponse.status() === 200) {
        const questions = await verifyResponse.json();
        expect(questions.length).toBe(0);
      } else {
        expect([404, 400]).toContain(verifyResponse.status());
      }
    });

    test('@api @regression @ADO-202725 should verify reg area still exists after simulated cancel', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202725' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Create reg area
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test reg area - simulated cancel',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regAreaResponse.json();

      // Verify reg area exists (simulates "cancel" - no delete API called)
      const verifyResponse = await superAdminRequest.get(`${API_BASE}/reg-area`);
      expect(verifyResponse.status()).toBe(200);
      const regAreas = await verifyResponse.json();
      expect(regAreas.find((r: { id: number }) => r.id === regArea.id)).toBeDefined();

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });
  });
});

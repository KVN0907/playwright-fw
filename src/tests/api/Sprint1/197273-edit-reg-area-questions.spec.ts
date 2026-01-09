import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * API Tests for Story 197273 - Edit reg area name and questions
 * @description Tests for editing RegArea and Questions
 * @story 197273 - Master questionnaire - Edit reg area name and questions: EY Super Admin (Backend)
 *
 * Related ADO Test Cases:
 * - #202772: API - Update reg area name successfully
 * - #202773: API - Reject update with empty name
 * - #202775: API - Update question text successfully
 * - #202776: API - Change question type successfully
 * - #202777: API - Reject update with too short title
 * - #202778: API - Reject update with too long title
 * - #202779: API - Reject update with invalid question type
 * - #202780: API - Reject update for non-existent question
 * - #202781: API - Delete single question successfully
 * - #202782: API - Delete multiple questions successfully
 * - #240731: API - Preserve question when updating only description
 * - #240732: API - Delete reg area successfully
 * - #240733: API - Handle delete of non-existent reg area
 */

const API_BASE = '/api/compliancemanager';

const generateRegAreaName = (): string => {
  const uniqueId = `${Date.now()}`.slice(-6);
  return `RegArea_Edit_${faker.company.buzzNoun()}_${uniqueId}`;
};

const generateQuestionText = (): string => {
  return `Question_${faker.lorem.sentence().substring(0, 50)}`;
};

test.describe('Story #197273: Edit RegArea and Questions - API Tests', () => {
  test.describe('PUT /reg-area - Edit Reg Area', () => {
    test('@api @smoke @ADO-202772 should update reg area name successfully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'story', description: '197273' },
          { type: 'testcase', description: '202772' }
        );

      // Create reg area
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Initial description',
      };
      const createResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      expect(createResponse.status()).toBe(201);
      const createdRegArea = await createResponse.json();

      // Update
      const updatedName = `Updated_${generateRegAreaName()}`;
      const updateData = {
        id: createdRegArea.id,
        name: updatedName,
        description: 'Updated description',
      };

      const response = await superAdminRequest.put(`${API_BASE}/reg-area`, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.name).toBe(updatedName);
      expect(data.description).toBe('Updated description');

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${createdRegArea.id}`);
    });

    test('@api @regression @ADO-202773 should reject update with empty name', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '202773' },
          { type: 'category', description: 'VALIDATION' }
        );

      // Create reg area
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test',
      };
      const createResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const createdRegArea = await createResponse.json();

      // Update with empty name
      const updateData = { id: createdRegArea.id, name: '', description: 'Test' };
      const response = await superAdminRequest.put(`${API_BASE}/reg-area`, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${createdRegArea.id}`);
    });

    test('@api @regression should reject update for non-existent reg area', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const updateData = { id: 999999999, name: 'Test', description: 'Test' };
      const response = await superAdminRequest.put(`${API_BASE}/reg-area`, { data: updateData });

      expect([400, 404, 422]).toContain(response.status());
    });
  });

  test.describe('PUT /questions - Edit Questions', () => {
    test('@api @smoke @ADO-202775 should update question text successfully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202775' }
        );

      // Create reg area and question
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      const question = await qResponse.json();

      // Update
      const updatedTitle = `Updated_${generateQuestionText()}`;
      const updateData = {
        id: question.id,
        title: updatedTitle,
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };

      const response = await superAdminRequest.put(`${API_BASE}/questions`, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.title).toBe(updatedTitle);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @smoke @ADO-202776 should change question type successfully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202776' }
        );

      // Create reg area and question
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      const question = await qResponse.json();

      // Change type
      const updateData = {
        id: question.id,
        title: 'Is this compliant?',
        questionType: 'YES_NO',
        regAreaId: regArea.id,
      };

      const response = await superAdminRequest.put(`${API_BASE}/questions`, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.questionType).toBe('YES_NO');

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-202777 should reject update with too short title', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202777' },
          { type: 'category', description: 'VALIDATION' }
        );

      // Create reg area and question
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      const question = await qResponse.json();

      // Update with short title
      const updateData = {
        id: question.id,
        title: 'AB',
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const response = await superAdminRequest.put(`${API_BASE}/questions`, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-202778 should reject update with too long title', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202778' },
          { type: 'category', description: 'BOUNDARY' }
        );

      // Create reg area and question
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      const question = await qResponse.json();

      // Update with long title
      const updateData = {
        id: question.id,
        title: 'A'.repeat(501),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const response = await superAdminRequest.put(`${API_BASE}/questions`, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-202779 should reject update with invalid question type', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202779' },
          { type: 'category', description: 'VALIDATION' }
        );

      // Create reg area and question
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      const question = await qResponse.json();

      // Update with invalid type
      const updateData = {
        id: question.id,
        title: 'Valid title here',
        questionType: 'INVALID',
        regAreaId: regArea.id,
      };
      const response = await superAdminRequest.put(`${API_BASE}/questions`, { data: updateData });

      expect([400, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-202780 should reject update for non-existent question', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202780' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const updateData = {
        id: 999999999,
        title: 'Test',
        questionType: 'TEXT',
        regAreaId: 1,
      };
      const response = await superAdminRequest.put(`${API_BASE}/questions`, { data: updateData });

      expect([400, 404, 422]).toContain(response.status());
    });
  });

  test.describe('DELETE /questions - Delete Questions', () => {
    test('@api @smoke @ADO-202781 should delete single question successfully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202781' }
        );

      // Create reg area and question
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regResponse.json();

      const questionData = {
        id: null,
        title: generateQuestionText(),
        questionType: 'TEXT',
        regAreaId: regArea.id,
      };
      const qResponse = await superAdminRequest.post(`${API_BASE}/questions`, {
        data: questionData,
      });
      const question = await qResponse.json();

      // Delete
      const response = await superAdminRequest.delete(`${API_BASE}/questions/${question.id}`);

      expect(response.status()).toBe(200);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-202782 should delete multiple questions successfully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Questions' },
          { type: 'testcase', description: '202782' },
          { type: 'category', description: 'FUNCTIONAL' }
        );

      // Create reg area and questions
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const regResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await regResponse.json();

      const questionIds: number[] = [];
      for (let i = 0; i < 2; i++) {
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
      const response = await superAdminRequest.delete(`${API_BASE}/questions`, {
        data: questionIds,
      });

      expect(response.status()).toBe(200);

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression should handle delete of non-existent question gracefully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Questions' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.delete(`${API_BASE}/questions/999999999`);

      expect([200, 204, 404]).toContain(response.status());
    });
  });

  test.describe('DELETE /reg-area - Delete Reg Area', () => {
    test('@api @smoke @ADO-240732 should delete reg area successfully', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '240732' }
        );

      // Create reg area
      const regAreaData = { id: null, name: generateRegAreaName(), description: 'Test' };
      const createResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      const regArea = await createResponse.json();

      // Delete
      const response = await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);

      expect(response.status()).toBe(200);
    });

    test('@api @regression @ADO-240733 should handle delete of non-existent reg area', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'medium' },
          { type: 'feature', description: 'Regulatory Area' },
          { type: 'testcase', description: '240733' },
          { type: 'category', description: 'NEGATIVE' }
        );

      const response = await superAdminRequest.delete(`${API_BASE}/reg-area/999999999`);

      expect([200, 204, 404]).toContain(response.status());
    });
  });
});

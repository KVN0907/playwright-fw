import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';
import * as path from 'path';
import * as fs from 'fs';

/**
 * API Tests for Story 197269 - Upload Excel to Auto Populate Questions
 * @description Tests for uploading Excel files to populate questions in a section
 * @story 197269 - Master questionnaire - Upload Excel to Auto Populate Questions
 *
 * Related ADO Test Cases:
 * - #204124: API - Upload valid xlsx file
 * - #204125: API - Reject non-xlsx file
 * - #204129: API - Reject non-existent regAreaId
 */

const API_BASE = '/api/compliancemanager';
const TEST_FILES_DIR = path.join(__dirname, '../testFiles');

const generateRegAreaName = (): string => {
  const uniqueId = `${Date.now()}`.slice(-6);
  return `RegArea_Upload_${faker.company.buzzNoun()}_${uniqueId}`;
};

test.describe('Story #197269: Upload Questions - API Tests', () => {
  test.describe('POST /questions/upload-questions', () => {
    test('@api @smoke @ADO-204124 should upload valid xlsx file', async ({ superAdminRequest }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'critical' },
          { type: 'feature', description: 'Questions Upload' },
          { type: 'story', description: '197269' },
          { type: 'testcase', description: '204124' }
        );

      // Create reg area first
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test reg area for upload',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      expect(regAreaResponse.status()).toBe(201);
      const regArea = await regAreaResponse.json();

      // Check if test file exists
      const testFilePath = path.join(TEST_FILES_DIR, 'valid-questions-template.xlsx');
      if (!fs.existsSync(testFilePath)) {
        // Cleanup and skip
        await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
        test.skip();
        return;
      }

      const fileBuffer = fs.readFileSync(testFilePath);
      const response = await superAdminRequest.post(`${API_BASE}/questions/upload-questions`, {
        multipart: {
          file: {
            name: 'questions.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: fileBuffer,
          },
          regAreaId: regArea.id.toString(),
        },
      });

      expect(response.status()).toBe(200);

      // Cleanup
      const questionsResponse = await superAdminRequest.get(`${API_BASE}/questions/${regArea.id}`);
      if (questionsResponse.status() === 200) {
        const questions = await questionsResponse.json();
        if (questions.length > 0) {
          const questionIds = questions.map((q: { id: number }) => q.id);
          await superAdminRequest.delete(`${API_BASE}/questions`, { data: questionIds });
        }
      }
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-204125 should reject non-xlsx file', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Questions Upload' },
          { type: 'testcase', description: '204125' },
          { type: 'category', description: 'VALIDATION' }
        );

      // Create reg area first
      const regAreaData = {
        id: null,
        name: generateRegAreaName(),
        description: 'Test reg area for upload',
      };
      const regAreaResponse = await superAdminRequest.post(`${API_BASE}/reg-area`, {
        data: regAreaData,
      });
      expect(regAreaResponse.status()).toBe(201);
      const regArea = await regAreaResponse.json();

      const textContent = Buffer.from('Question,Type\nQ1,TEXT');
      const response = await superAdminRequest.post(`${API_BASE}/questions/upload-questions`, {
        multipart: {
          file: { name: 'questions.csv', mimeType: 'text/csv', buffer: textContent },
          regAreaId: regArea.id.toString(),
        },
      });

      expect([400, 415, 422]).toContain(response.status());

      // Cleanup
      await superAdminRequest.delete(`${API_BASE}/reg-area/${regArea.id}`);
    });

    test('@api @regression @ADO-204129 should reject non-existent regAreaId', async ({
      superAdminRequest,
    }) => {
      test
        .info()
        .annotations.push(
          { type: 'severity', description: 'high' },
          { type: 'feature', description: 'Questions Upload' },
          { type: 'testcase', description: '204129' },
          { type: 'category', description: 'VALIDATION' }
        );

      const textContent = Buffer.from('test');
      const response = await superAdminRequest.post(`${API_BASE}/questions/upload-questions`, {
        multipart: {
          file: {
            name: 'questions.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: textContent,
          },
          regAreaId: '999999999',
        },
      });

      expect([400, 404, 422]).toContain(response.status());
    });
  });
});

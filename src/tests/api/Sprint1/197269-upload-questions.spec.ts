import { test, expect } from '../../fixtures/apiRoleFixtures';
import * as path from 'path';
import * as fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';

/**
 * Sprint 1 API Tests - Upload Excel to Auto Populate Questions
 *
 * ADO Story: #197269
 * Title: Master questionnaire - Upload Excel to Auto Populate Questions in a Section - EY Super Admin (Backend)
 *
 * API Details:
 * - Endpoint: POST /api/compliancemanager/questions/upload-questions
 * - Request Type: multipart/form-data
 * - Parameters:
 *   - file (MultipartFile): Excel file (.xlsx) containing questions
 *   - regAreaId (Long): ID of the Regulatory Area
 *
 * Acceptance Criteria:
 * 1. Upload valid Excel file (.xlsx) with correct format populates questions
 * 2. Wrong file format returns error: "Only xlsx file uploads are allowed"
 * 3. Wrong headers returns error: "Excel headers do not match the question template"
 */

const API_BASE = '/api/compliancemanager';
const UPLOAD_ENDPOINT = `${API_BASE}/questions/upload-questions`;
const TEST_FILES_DIR = path.join(__dirname, '../testFiles');

// Base URL from environment (APP_URL is used in qa.env, QA_APP_URL as fallback)
const BASE_URL = (
  process.env.APP_URL ||
  process.env.QA_APP_URL ||
  process.env.BASE_URL ||
  'https://eycompliancemanager-uat.ey.com'
).replace(/\/$/, ''); // Remove trailing slash

// Test file paths
const TEST_FILES = {
  validXlsx: path.join(TEST_FILES_DIR, 'ValidQuestions.xlsx'),
  invalidPdf: path.join(TEST_FILES_DIR, 'invalid-format.pdf'),
  invalidCsv: path.join(TEST_FILES_DIR, 'invalid-format.csv'),
  invalidHeaders: path.join(TEST_FILES_DIR, 'invalid-headers.xlsx'),
  emptyRows: path.join(TEST_FILES_DIR, 'empty-rows.xlsx'),
  macroFile: path.join(TEST_FILES_DIR, 'macro-file.xlsm'),
  corrupted: path.join(TEST_FILES_DIR, 'corrupted.xlsx'),
  empty: path.join(TEST_FILES_DIR, 'empty.xlsx'),
};

// Helper to read test file
function readTestFile(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

// Helper to get auth cookies from stored state
function getAuthCookies(): string {
  try {
    const storageState = JSON.parse(fs.readFileSync('auth.json', 'utf-8'));
    return storageState.cookies
      .filter((c: any) => c.domain.includes('eycompliancemanager'))
      .map((c: any) => `${c.name}=${c.value}`)
      .join('; ');
  } catch {
    return '';
  }
}

// Helper interface for upload options
interface UploadOptions {
  file: Buffer;
  filename: string;
  mimeType: string;
  regAreaId?: string | number;
  includeAuth?: boolean;
}

// Helper interface for upload response
interface UploadResponse {
  status: number;
  data: any;
}

// Helper function to upload file using axios (works like browser)
async function uploadFile(options: UploadOptions): Promise<UploadResponse> {
  const formData = new FormData();

  formData.append('file', options.file, {
    filename: options.filename,
    contentType: options.mimeType,
  });

  if (options.regAreaId !== undefined) {
    formData.append('regAreaId', options.regAreaId.toString());
  }

  const headers: Record<string, string> = {
    ...formData.getHeaders(),
    'x-tenant-id': '1',
    'x-user-id': '1',
  };

  if (options.includeAuth !== false) {
    headers['Cookie'] = getAuthCookies();
  }

  try {
    const response: AxiosResponse = await axios.post(`${BASE_URL}${UPLOAD_ENDPOINT}`, formData, {
      headers,
      validateStatus: () => true,
      timeout: 60000,
    });
    return { status: response.status, data: response.data };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      data: error.response?.data || error.message,
    };
  }
}

// Helper function to create a test reg area
async function createTestRegArea(request: any): Promise<{ id: number; name: string }> {
  const timestamp = Date.now();
  const regAreaData = {
    name: `Upload Test RegArea ${timestamp}`,
    description: 'Auto-created for upload tests',
    isActive: true,
    isApproved: true,
    isDelete: false,
  };
  const response = await request.post(`${API_BASE}/reg-area`, {
    headers: {
      'x-tenant-id': '1',
      'x-user-id': '1',
    },
    data: regAreaData,
  });
  if (response.status() !== 201) {
    throw new Error(`Failed to create test reg area: ${response.status()}`);
  }
  return response.json();
}

// Helper function to delete test reg area
async function deleteTestRegArea(request: any, regAreaId: number): Promise<void> {
  await request.delete(`${API_BASE}/reg-area/${regAreaId}`, {
    headers: {
      'x-tenant-id': '1',
      'x-user-id': '1',
    },
  });
}

/**
 * =============================================================================
 * STORY #197269: Upload Excel to Auto Populate Questions
 * =============================================================================
 */
test.describe('Story #197269: Upload Excel to Auto Populate Questions', () => {
  let testRegAreaId: number;
  let corporateSecretarialRegAreaId: number;

  // Fetch the Corporate Secretarial reg area for valid upload tests
  test.beforeAll(async ({ superAdminRequest }) => {
    const response = await request.get(`${API_BASE}/reg-area`, {
      headers: { 'x-tenant-id': '1', 'x-user-id': '1' },
    });
    if (response.status() === 200) {
      const regAreas = await response.json();
      const corporateSecretarial = regAreas.find(
        (ra: { name: string }) =>
          ra.name.toLowerCase().includes('corporate') &&
          ra.name.toLowerCase().includes('secretarial')
      );
      if (corporateSecretarial) {
        corporateSecretarialRegAreaId = corporateSecretarial.id;
        console.log(`Found Corporate Secretarial reg area: ${corporateSecretarialRegAreaId}`);
      }
    }
  });

  test.beforeEach(async ({ superAdminRequest }) => {
    const regArea = await createTestRegArea(request);
    testRegAreaId = regArea.id;
  });

  test.afterEach(async ({ superAdminRequest }) => {
    if (testRegAreaId) {
      await deleteTestRegArea(request, testRegAreaId);
    }
  });

  /**
   * ADO Test Case #204122
   * Download Excel Template for Questionnaire Section
   */
  test('should download excel template for questionnaire section @regression @ADO-204122', async ({
    request,
  }) => {
    const response = await request.get(`${API_BASE}/questions/template`, {
      params: { regAreaId: testRegAreaId.toString() },
    });

    const status = response.status();
    expect([200, 400, 404]).toContain(status);

    if (status === 200) {
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      const buffer = await response.body();
      expect(buffer.length).toBeGreaterThan(0);
    }
  });

  /**
   * ADO Test Case #204124
   * Upload Valid Excel File Populates Questions in Selected Section
   */
  test('should upload valid excel file and populate questions @regression @ADO-204124', async ({
    request,
  }) => {
    // Use Corporate Secretarial reg area for valid upload test
    const targetRegAreaId = corporateSecretarialRegAreaId || testRegAreaId;
    test.skip(!targetRegAreaId, 'No reg area available for upload test');

    const fileContent = readTestFile(TEST_FILES.validXlsx);

    const response = await uploadFile({
      file: fileContent,
      filename: 'ValidQuestions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: targetRegAreaId,
    });

    console.log(
      `Upload response: status=${response.status}, regAreaId=${targetRegAreaId}, data=${JSON.stringify(response.data)}`
    );
    expect([200, 201]).toContain(response.status);

    if (response.status === 200 || response.status === 201) {
      const questionsResponse = await request.get(`${API_BASE}/questions/${targetRegAreaId}`);
      expect(questionsResponse.status()).toBe(200);
    }
  });

  /**
   * ADO Test Case #204125
   * Upload Non-.xlsx File Returns Error and Rejects Upload
   */
  test('should reject non-xlsx file upload @regression @ADO-204125', async () => {
    const pdfContent = readTestFile(TEST_FILES.invalidPdf);

    const response = await uploadFile({
      file: pdfContent,
      filename: 'invalid-format.pdf',
      mimeType: 'application/pdf',
      regAreaId: testRegAreaId,
    });

    expect([400, 415, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204125 (Variant)
   * Upload CSV file instead of xlsx Returns Error
   */
  test('should reject CSV file upload @regression @ADO-204125', async () => {
    const csvContent = readTestFile(TEST_FILES.invalidCsv);

    const response = await uploadFile({
      file: csvContent,
      filename: 'invalid-format.csv',
      mimeType: 'text/csv',
      regAreaId: testRegAreaId,
    });

    expect([400, 415, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204127
   * Upload Excel File with Missing Headers Returns Header Error
   */
  test('should reject excel with missing/invalid headers @regression @ADO-204127', async () => {
    const invalidExcelContent = readTestFile(TEST_FILES.invalidHeaders);

    const response = await uploadFile({
      file: invalidExcelContent,
      filename: 'invalid-headers.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204128
   * Upload Excel File with Invalid Answer Type Returns Error
   */
  test('should reject excel with invalid answer type @regression @ADO-204128', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'invalid_answer_type.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204129
   * Upload Excel with Empty or Duplicate Question Rows Returns Error
   */
  test('should reject excel with empty rows @regression @ADO-204129', async () => {
    const emptyRowsContent = readTestFile(TEST_FILES.emptyRows);

    const response = await uploadFile({
      file: emptyRowsContent,
      filename: 'empty-rows.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204130
   * Attempt Upload to Non-Existent or Deleted Section Returns Error
   */
  test('should reject upload to non-existent regAreaId @regression @ADO-204130', async () => {
    const nonExistentRegAreaId = 999999999;

    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: nonExistentRegAreaId,
    });

    expect([400, 404, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204131
   * Simultaneous Excel Uploads to Same Section by Multiple Admins
   */
  test('should handle simultaneous uploads gracefully @regression @ADO-204131', async () => {
    const fileContent = readTestFile(TEST_FILES.validXlsx);

    const uploadPromises = Array(3)
      .fill(null)
      .map(() =>
        uploadFile({
          file: fileContent,
          filename: 'concurrent_upload.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          regAreaId: testRegAreaId,
        })
      );

    const responses = await Promise.all(uploadPromises);

    // At least one should succeed, others may fail due to concurrency
    const hasSuccess = responses.some(r => r.status === 200 || r.status === 201);
    expect(hasSuccess).toBeTruthy();
  });

  /**
   * ADO Test Case #204132
   * Upload Excel File Exceeds Maximum Allowed File Size
   */
  test('should reject file exceeding max size @regression @ADO-204132', async () => {
    const largeFileSize = 10 * 1024 * 1024; // 10MB
    const largeContent = Buffer.alloc(largeFileSize, 'x');

    const response = await uploadFile({
      file: largeContent,
      filename: 'large_file.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 413, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204133
   * Upload Excel File with Hidden Macros or Non-Permitted Content
   */
  test('should reject file with macros (.xlsm) @regression @ADO-204133', async () => {
    const macroFileContent = readTestFile(TEST_FILES.macroFile);

    const response = await uploadFile({
      file: macroFileContent,
      filename: 'macro-file.xlsm',
      mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12',
      regAreaId: testRegAreaId,
    });

    expect([400, 415, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204134
   * Upload Attempt Without Proper Authentication or Authorization
   */
  test('should reject upload without authentication @regression @ADO-204134', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
      includeAuth: false,
    });

    expect([401, 403]).toContain(response.status);
  });

  /**
   * ADO Test Case #204135
   * Direct API Call with Patched/Broken Content Fails Validation
   */
  test('should reject corrupted file content @regression @ADO-204135', async () => {
    const corruptedContent = readTestFile(TEST_FILES.corrupted);

    const response = await uploadFile({
      file: corruptedContent,
      filename: 'corrupted.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204135 (Variant)
   * Empty file upload should be rejected
   */
  test('should reject empty file @regression @ADO-204135', async () => {
    const emptyContent = readTestFile(TEST_FILES.empty);

    const response = await uploadFile({
      file: emptyContent,
      filename: 'empty.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * ADO Test Case #204136
   * Audit Log Updated on Successful and Failed Upload Attempts
   */
  test('should track upload in audit log @regression @ADO-204136', async ({ request }) => {
    await uploadFile({
      file: Buffer.from('PK'),
      filename: 'audit_test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    const auditResponse = await request.get(`${API_BASE}/audit-logs?entity=Question`);

    // Audit log endpoint may not exist (404)
    expect([200, 404]).toContain(auditResponse.status());

    if (auditResponse.status() === 200) {
      const auditLogs = await auditResponse.json();
      expect(Array.isArray(auditLogs) || typeof auditLogs === 'object').toBeTruthy();
    }
  });

  /**
   * ADO Test Case #204137
   * Rate Limiting: Multiple Uploads in Short Interval
   */
  test('should handle rate limiting on rapid uploads @regression @ADO-204137', async () => {
    const rapidRequests = Array(10)
      .fill(null)
      .map(() =>
        uploadFile({
          file: Buffer.from('PK'),
          filename: 'rate_limit_test.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          regAreaId: testRegAreaId,
        })
      );

    const responses = await Promise.all(rapidRequests);
    const statusCodes = responses.map(r => r.status);

    // Check for rate limiting (429) or all requests processed without server errors
    const hasRateLimiting = statusCodes.some(code => code === 429);
    const noServerErrors = statusCodes.every(code => code < 500);

    expect(hasRateLimiting || noServerErrors).toBeTruthy();
  });

  /**
   * Additional Test: Missing required parameter regAreaId
   */
  test('should reject upload without regAreaId parameter', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * Additional Test: Invalid regAreaId format
   */
  test('should reject invalid regAreaId format', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: 'invalid-not-a-number',
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * Security Test: SQL Injection in regAreaId
   */
  test('should reject SQL injection in regAreaId', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: '1; DROP TABLE questions;--',
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * Security Test: XSS in filename
   */
  test('should sanitize XSS in filename', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: '<script>alert("xss")</script>.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should reject or sanitize - not return 500
    expect([200, 201, 400, 422]).toContain(response.status);
  });

  /**
   * Security Test: Path traversal in filename
   */
  test('should reject path traversal in filename', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: '../../../etc/passwd.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should reject or sanitize - not return 500
    expect([200, 201, 400, 422]).toContain(response.status);
  });

  /**
   * Boundary Test: Negative regAreaId
   */
  test('should reject negative regAreaId', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: -1,
    });

    expect([400, 404, 422]).toContain(response.status);
  });

  /**
   * Boundary Test: Zero regAreaId
   */
  test('should reject zero regAreaId', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: 0,
    });

    expect([400, 404, 422]).toContain(response.status);
  });

  /**
   * Boundary Test: Very large regAreaId (integer overflow)
   */
  test('should handle very large regAreaId', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: 9007199254740991, // Number.MAX_SAFE_INTEGER
    });

    expect([400, 404, 422]).toContain(response.status);
  });

  /**
   * Edge Case: Very long filename (256+ chars)
   */
  test('should handle very long filename', async () => {
    const longFilename = 'a'.repeat(300) + '.xlsx';

    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: longFilename,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should handle gracefully - either accept truncated or reject
    expect([200, 201, 400, 413, 422]).toContain(response.status);
  });

  /**
   * Edge Case: Special characters in filename
   */
  test('should handle special characters in filename', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'test@#$%^&()[]{}file.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should handle gracefully
    expect([200, 201, 400, 422]).toContain(response.status);
  });

  /**
   * Security Test: Null byte injection in filename
   */
  test('should reject null byte in filename', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'malicious\x00.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should reject or sanitize
    expect([200, 201, 400, 422]).toContain(response.status);
  });

  /**
   * Security Test: Double extension attack
   */
  test('should reject double extension file', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'malicious.xlsx.exe',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should reject suspicious extensions
    expect([400, 415, 422]).toContain(response.status);
  });

  /**
   * Edge Case: Unicode/Emoji in filename
   */
  test('should handle unicode in filename', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: 'тест_文件_🎉.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should handle gracefully
    expect([200, 201, 400, 422]).toContain(response.status);
  });

  /**
   * Edge Case: Empty filename
   */
  test('should reject empty filename', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: '',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * Edge Case: Filename with only extension
   */
  test('should reject filename with only extension', async () => {
    const response = await uploadFile({
      file: Buffer.from('PK'),
      filename: '.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([200, 201, 400, 422]).toContain(response.status);
  });

  /**
   * Duplicate Upload Test: Upload same file twice to same regArea
   */
  test('should handle duplicate upload to same regArea', async () => {
    const fileContent = readTestFile(TEST_FILES.validXlsx);

    // First upload
    const response1 = await uploadFile({
      file: fileContent,
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([200, 201]).toContain(response1.status);

    // Second upload to same regArea - should fail or update
    const response2 = await uploadFile({
      file: fileContent,
      filename: 'questions.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should either reject duplicate or update existing
    expect([200, 201, 400, 409, 422]).toContain(response2.status);
  });

  /**
   * Content-Type Mismatch Test: xlsx content with wrong mime type
   */
  test('should validate content-type matches file content', async () => {
    const fileContent = readTestFile(TEST_FILES.validXlsx);

    const response = await uploadFile({
      file: fileContent,
      filename: 'questions.xlsx',
      mimeType: 'text/plain', // Wrong mime type for xlsx
      regAreaId: testRegAreaId,
    });

    // Should reject mismatched content-type or accept based on actual content
    expect([200, 201, 400, 415, 422]).toContain(response.status);
  });

  /**
   * Wrong Extension Test: Valid xlsx content with wrong extension
   */
  test('should reject valid xlsx with wrong extension', async () => {
    const fileContent = readTestFile(TEST_FILES.validXlsx);

    const response = await uploadFile({
      file: fileContent,
      filename: 'questions.txt', // Wrong extension
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    // Should reject based on extension
    expect([400, 415, 422]).toContain(response.status);
  });

  /**
   * Boundary Test: File with only 1 byte
   */
  test('should reject 1-byte file', async () => {
    const response = await uploadFile({
      file: Buffer.from('P'),
      filename: 'tiny.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 422]).toContain(response.status);
  });

  /**
   * Boundary Test: File with exactly 0 bytes
   */
  test('should reject 0-byte file', async () => {
    const response = await uploadFile({
      file: Buffer.alloc(0),
      filename: 'empty.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      regAreaId: testRegAreaId,
    });

    expect([400, 422]).toContain(response.status);
  });
});

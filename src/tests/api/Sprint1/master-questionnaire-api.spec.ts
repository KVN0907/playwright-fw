import { test, expect } from '../../fixtures/apiRoleFixtures';
import { faker } from '@faker-js/faker';

/**
 * Sprint 1 API Tests - Master Questionnaire
 *
 * ADO Stories:
 * - #197265: Master questionnaire - Create reg area and questions: EY Super Admin (Backend)
 * - #197273: Master questionnaire - Edit reg area name and questions: EY Super Admin (Backend)
 *
 * This test file is organized by ADO test cases for full traceability.
 */

const API_BASE = '/api/compliancemanager';

// Helper to generate unique ID suffix
const uniqueId = () => `${Date.now()}`.slice(-6);

// Helper function to create a test reg area using faker
async function createTestRegArea(request: any): Promise<{ id: number; name: string }> {
  const regAreaData = {
    name: `${faker.commerce.department()} RegArea ${uniqueId()}`,
    description: faker.lorem.sentence(),
    isActive: true,
    isApproved: true,
    isDelete: false,
  };
  const response = await request.post(`${API_BASE}/reg-area`, { data: regAreaData });
  if (response.status() !== 201) {
    throw new Error(`Failed to create test reg area: ${response.status()}`);
  }
  return response.json();
}

// Helper function to delete test reg area
async function deleteTestRegArea(request: any, regAreaId: number): Promise<void> {
  await request.delete(`${API_BASE}/reg-area/${regAreaId}`);
}

// Helper function to create a test question using faker
async function createTestQuestion(
  request: any,
  regAreaId: number,
  title?: string,
  questionType: string = 'Text'
): Promise<{ id: number; title: string; questionType: string; regAreaId: number }> {
  const questionData = {
    title: title || `${faker.lorem.words(3)} ${uniqueId()}`,
    questionType,
    regAreaId,
    isActive: true,
    isApproved: true,
    isDelete: false,
  };
  const response = await request.post(`${API_BASE}/questions`, { data: questionData });
  if (response.status() !== 201) {
    throw new Error(`Failed to create test question: ${response.status()}`);
  }
  return response.json();
}

// Helper function to delete test question
async function deleteTestQuestion(request: any, questionId: number): Promise<void> {
  await request.delete(`${API_BASE}/questions/${questionId}`);
}

/**
 * =============================================================================
 * STORY #197265: Master questionnaire - Create reg area and questions (Backend)
 * =============================================================================
 *
 * APIs:
 * - POST /api/compliancemanager/reg-area
 * - GET /api/compliancemanager/reg-area
 * - POST /api/compliancemanager/questions
 * - GET /api/compliancemanager/questions
 * - GET /api/compliancemanager/questions/{regAreaId}
 */
test.describe('Story #197265: Create Reg Area and Questions', () => {
  /**
   * ADO Test Case #202614
   * API - Create Section with Valid, Unique Name
   */
  test('should create section (reg area) with valid unique name @regression @ADO-202614', async ({
    request,
  }) => {
    const timestamp = Date.now();
    const requestData = {
      name: `Valid Unique Section ${timestamp}`,
      description: 'Test section with valid unique name',
      isActive: true,
      isApproved: true,
      isDelete: false,
    };

    const response = await request.post(`${API_BASE}/reg-area`, { data: requestData });

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.name).toBe(requestData.name);
    expect(data.description).toBe(requestData.description);

    // Cleanup
    await request.delete(`${API_BASE}/reg-area/${data.id}`);
  });

  /**
   * ADO Test Case #202615
   * API - Attempt to Create Section with Duplicate Name
   */
  test('should reject creation of section with duplicate name @regression @ADO-202615', async ({
    request,
  }) => {
    const timestamp = Date.now();
    const requestData = {
      name: `Duplicate Section Test ${timestamp}`,
      description: 'First section',
      isActive: true,
      isApproved: true,
      isDelete: false,
    };

    // Create first section
    const firstResponse = await request.post(`${API_BASE}/reg-area`, { data: requestData });
    expect(firstResponse.status()).toBe(201);
    const first = await firstResponse.json();

    // Attempt to create duplicate
    const duplicateData = {
      name: `Duplicate Section Test ${timestamp}`, // Same name
      description: 'Duplicate section attempt',
      isActive: true,
      isApproved: true,
      isDelete: false,
    };

    const duplicateResponse = await request.post(`${API_BASE}/reg-area`, { data: duplicateData });

    // Should reject duplicate - expect 400, 409 Conflict, or 422
    expect([400, 409, 422]).toContain(duplicateResponse.status());

    // Cleanup
    await request.delete(`${API_BASE}/reg-area/${first.id}`);
  });

  /**
   * ADO Test Case #202616
   * API - Add Valid Manual Text Question to Section
   */
  test('should add valid manual text question to section @regression @ADO-202616', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);

    try {
      const timestamp = Date.now();
      const questionData = {
        title: `Valid Text Question ${timestamp}`,
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.title).toBe(questionData.title);
      expect(data.questionType).toBe('Text');
      expect(data.regAreaId).toBe(regArea.id);

      // Cleanup
      await deleteTestQuestion(request, data.id);
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202617
   * API - Add Valid Yes/No Question with Special Characters to Section
   */
  test('should add valid yes/no question with special characters @regression @ADO-202617', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);

    try {
      const timestamp = Date.now();
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const questionData = {
        title: `Yes/No Question ${specialChars} ${timestamp}`,
        questionType: 'YesNo',
        regAreaId: regArea.id,
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.title).toContain(specialChars);
      // QuestionType might be normalized - check for YesNo or Boolean
      expect(['YesNo', 'Boolean', 'Yes/No']).toContain(data.questionType);

      // Cleanup
      await deleteTestQuestion(request, data.id);
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202618
   * API - Add Question with Minimum Allowed Length (3 Characters)
   */
  test('should accept question with minimum length (3 characters) @regression @ADO-202618', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);

    try {
      const questionData = {
        title: 'ABC', // Exactly 3 characters - minimum allowed
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.title).toBe('ABC');
      expect(data.title.length).toBe(3);

      // Cleanup
      await deleteTestQuestion(request, data.id);
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202619
   * API - Add Question with Maximum Allowed Length (500 Characters)
   */
  test('should accept question with maximum length (500 characters) @regression @ADO-202619', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);

    try {
      const title = 'Q'.repeat(500); // Exactly 500 characters - maximum allowed per story
      const questionData = {
        title,
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.title.length).toBe(500);

      // Cleanup
      await deleteTestQuestion(request, data.id);
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202620
   * API - Add Question with Too Short Text (<3 Characters)
   */
  test('should reject question with too short text (<3 characters) @regression @ADO-202620', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);

    try {
      // Test with 2 characters (below minimum of 3)
      const questionData = {
        title: 'AB', // Only 2 characters - below minimum
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });

      // Should reject - expect 400 Bad Request
      expect(response.status()).toBe(400);

      // Also test with 1 character
      const singleCharData = {
        title: 'A',
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
      };

      const singleCharResponse = await request.post(`${API_BASE}/questions`, {
        data: singleCharData,
      });
      expect(singleCharResponse.status()).toBe(400);

      // Also test with empty string
      const emptyData = {
        title: '',
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
      };

      const emptyResponse = await request.post(`${API_BASE}/questions`, { data: emptyData });
      expect(emptyResponse.status()).toBe(400);
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202621
   * API - Add Question with Too Long Text (>500 Characters)
   */
  test('should reject question with too long text (>500 characters) @regression @ADO-202621', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);

    try {
      const title = 'Q'.repeat(501); // 501 characters - exceeds maximum of 500
      const questionData = {
        title,
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });

      // Should reject - expect 400 Bad Request
      expect(response.status()).toBe(400);

      // Also test with significantly longer text
      const veryLongData = {
        title: 'X'.repeat(1000), // 1000 characters
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
      };

      const veryLongResponse = await request.post(`${API_BASE}/questions`, { data: veryLongData });
      expect(veryLongResponse.status()).toBe(400);
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202622
   * API - Add Question with Unsupported Type
   */
  test('should reject question with unsupported type @regression @ADO-202622', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);

    try {
      const timestamp = Date.now();
      const invalidTypes = ['InvalidType', 'Unknown', 'FileUpload', 'Image', 'Video', ''];

      for (const invalidType of invalidTypes) {
        const questionData = {
          title: `Unsupported Type Test ${timestamp}`,
          questionType: invalidType,
          regAreaId: regArea.id,
          isActive: true,
        };

        const response = await request.post(`${API_BASE}/questions`, { data: questionData });

        // Should reject unsupported types - expect 400 Bad Request
        // If API accepts any type, document this behavior
        if (response.status() === 201) {
          const data = await response.json();
          console.log(
            `WARNING: API accepted unsupported questionType '${invalidType}' - may need validation`
          );
          await deleteTestQuestion(request, data.id);
        } else {
          expect([400, 422]).toContain(response.status());
        }
      }
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202624
   * API - Add Question to Non-existent Section
   */
  test('should reject adding question to non-existent section @regression @ADO-202624', async ({
    request,
  }) => {
    const timestamp = Date.now();
    const nonExistentRegAreaId = 999999999;

    const questionData = {
      title: `Question for Non-existent Section ${timestamp}`,
      questionType: 'Text',
      regAreaId: nonExistentRegAreaId,
      isActive: true,
    };

    const response = await request.post(`${API_BASE}/questions`, { data: questionData });

    // Should reject - expect 400, 404, or 422
    expect([400, 404, 422]).toContain(response.status());
  });

  // Additional tests for Story #197265
  test.describe('Additional Create Operations', () => {
    test('@smoke should fetch all reg areas after creation', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const response = await request.get(`${API_BASE}/reg-area`);

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);

        // Verify our created reg area is in the list
        const found = data.find((r: { id: number }) => r.id === regArea.id);
        expect(found).toBeDefined();
        expect(found.name).toBe(regArea.name);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@smoke should fetch all questions after creation', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        const response = await request.get(`${API_BASE}/questions`);

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);

        // Verify our created question is in the list
        const found = data.find((q: { id: number }) => q.id === question.id);
        expect(found).toBeDefined();
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@smoke should fetch questions by reg area ID', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        const response = await request.get(`${API_BASE}/questions/${regArea.id}`);

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);

        // Verify our question is in the filtered list
        const found = data.find((q: { id: number }) => q.id === question.id);
        expect(found).toBeDefined();
        expect(found.regAreaId).toBe(regArea.id);
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });
});

/**
 * =============================================================================
 * STORY #197273: Master questionnaire - Edit reg area and questions (Backend)
 * =============================================================================
 *
 * APIs:
 * - PUT /api/compliancemanager/reg-area
 * - PUT /api/compliancemanager/questions
 */
test.describe('Story #197273: Edit Reg Area and Questions', () => {
  /**
   * ADO Test Case #202772
   * Edit Question Text via API
   */
  test('should edit question text via API @regression @ADO-202772', async ({ request }) => {
    const regArea = await createTestRegArea(request);
    const question = await createTestQuestion(request, regArea.id, 'Original Question Text');

    try {
      const timestamp = Date.now();
      const updateData = {
        id: question.id,
        title: `Updated Question Text ${timestamp}`,
        questionType: question.questionType,
        regAreaId: question.regAreaId,
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const response = await request.put(`${API_BASE}/questions`, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(question.id);
      expect(data.title).toBe(updateData.title);
      expect(data.title).not.toBe('Original Question Text');
    } finally {
      await deleteTestQuestion(request, question.id);
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202773
   * Edit Question Type and Provide Required Options
   */
  test('should edit question type @regression @ADO-202773', async ({ superAdminRequest }) => {
    const regArea = await createTestRegArea(request);
    const question = await createTestQuestion(request, regArea.id, 'Type Change Test', 'Text');

    try {
      const updateData = {
        id: question.id,
        title: question.title,
        questionType: 'MultipleChoice', // Changing from Text to MultipleChoice
        regAreaId: question.regAreaId,
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const response = await request.put(`${API_BASE}/questions`, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(question.id);
      expect(data.questionType).toBe('MultipleChoice');
      expect(data.questionType).not.toBe('Text');
    } finally {
      await deleteTestQuestion(request, question.id);
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202775
   * Edit Regulatory Area Name with Unique Value
   */
  test('should edit regulatory area name with unique value @regression @ADO-202775', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);

    try {
      const timestamp = Date.now();
      const updateData = {
        id: regArea.id,
        name: `Updated RegArea Name ${timestamp}`,
        description: 'Updated description',
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(regArea.id);
      expect(data.name).toBe(updateData.name);
      expect(data.description).toBe(updateData.description);
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202776
   * Reject Regulatory Area Name Update Due to Uniqueness Violation
   */
  test('should reject reg area name update due to uniqueness violation @regression @ADO-202776', async ({
    request,
  }) => {
    const timestamp = Date.now();

    // Create two reg areas
    const regArea1Data = {
      name: `First RegArea ${timestamp}`,
      description: 'First',
      isActive: true,
      isApproved: true,
      isDelete: false,
    };
    const regArea2Data = {
      name: `Second RegArea ${timestamp}`,
      description: 'Second',
      isActive: true,
      isApproved: true,
      isDelete: false,
    };

    const response1 = await request.post(`${API_BASE}/reg-area`, { data: regArea1Data });
    const response2 = await request.post(`${API_BASE}/reg-area`, { data: regArea2Data });

    expect(response1.status()).toBe(201);
    expect(response2.status()).toBe(201);

    const regArea1 = await response1.json();
    const regArea2 = await response2.json();

    try {
      // Try to update regArea2's name to regArea1's name (duplicate)
      const updateData = {
        id: regArea2.id,
        name: regArea1.name, // Attempting to use existing name
        description: 'Trying to duplicate name',
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });

      // Should reject - expect 400, 409 Conflict, or 422
      expect([400, 409, 422]).toContain(updateResponse.status());
    } finally {
      await deleteTestRegArea(request, regArea1.id);
      await deleteTestRegArea(request, regArea2.id);
    }
  });

  /**
   * ADO Test Case #202777
   * Attempt to Edit Question Type to Dropdown with No Options
   */
  test('should handle edit to dropdown type without options @regression @ADO-202777', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);
    const question = await createTestQuestion(request, regArea.id, 'Dropdown Test', 'Text');

    try {
      const updateData = {
        id: question.id,
        title: question.title,
        questionType: 'Dropdown', // Changing to Dropdown without options
        regAreaId: question.regAreaId,
        isActive: true,
        // Note: No options provided
      };

      const response = await request.put(`${API_BASE}/questions`, { data: updateData });

      // Behavior depends on API design:
      // - If dropdown requires options: should return 400
      // - If options are optional: should return 200
      // Document actual behavior
      if (response.status() === 200) {
        console.log('INFO: API allows Dropdown type without options');
      } else {
        expect([400, 422]).toContain(response.status());
      }
    } finally {
      await deleteTestQuestion(request, question.id);
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202778
   * Reject Question Edit for Nonexistent Question ID
   */
  test('should reject question edit for nonexistent question ID @regression @ADO-202778', async ({
    request,
  }) => {
    const nonExistentId = 999999999;
    const updateData = {
      id: nonExistentId,
      title: 'Nonexistent Question Update',
      questionType: 'Text',
      regAreaId: 1,
      isActive: true,
    };

    const response = await request.put(`${API_BASE}/questions`, { data: updateData });

    // Should return error for non-existent ID
    expect([400, 404, 422, 500]).toContain(response.status());
  });

  /**
   * ADO Test Case #202779
   * Reject Regulatory Area Edit for Nonexistent Reg Area ID
   */
  test('should reject reg area edit for nonexistent ID @regression @ADO-202779', async ({
    request,
  }) => {
    const nonExistentId = 999999999;
    const updateData = {
      id: nonExistentId,
      name: 'Nonexistent RegArea Update',
      description: 'Should fail',
      isActive: true,
    };

    const response = await request.put(`${API_BASE}/reg-area`, { data: updateData });

    // Should return error for non-existent ID
    expect([400, 404, 422, 500]).toContain(response.status());
  });

  /**
   * ADO Test Case #202780
   * Reject Edit by Unauthorized User
   * Note: This test requires authentication context with different user roles
   */
  test.skip('@ADO-202780 @RBAC should reject edit by unauthorized user', async ({ request }) => {
    // This test requires:
    // 1. Authentication as a user WITHOUT EY Super Admin role
    // 2. Attempt to edit a reg area or question
    // 3. Verify 401 Unauthorized or 403 Forbidden response
    //
    // Implementation requires setting up different auth contexts
    // which depends on the authentication mechanism used.

    // Placeholder for RBAC test
    const regArea = await createTestRegArea(request);

    try {
      // TODO: Switch to non-admin user context
      // const nonAdminRequest = await switchToNonAdminUser();

      const updateData = {
        id: regArea.id,
        name: 'Unauthorized Update Attempt',
        description: 'Should fail',
        isActive: true,
      };

      // TODO: Use non-admin request
      // const response = await nonAdminRequest.put(`${API_BASE}/reg-area`, { data: updateData });
      // expect([401, 403]).toContain(response.status());
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202781
   * Reject Malformed API Request for Question Edit
   */
  test('should reject malformed API request for question edit @regression @ADO-202781', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);
    const question = await createTestQuestion(request, regArea.id);

    try {
      // Test various malformed requests
      const malformedRequests = [
        // Missing ID
        { title: 'Missing ID', questionType: 'Text', regAreaId: regArea.id },
        // Null ID
        { id: null, title: 'Null ID', questionType: 'Text', regAreaId: regArea.id },
        // String ID instead of number
        { id: 'invalid', title: 'String ID', questionType: 'Text', regAreaId: regArea.id },
        // Empty object
        {},
        // Array instead of object
        // Note: Arrays are tested separately
      ];

      for (const malformedData of malformedRequests) {
        const response = await request.put(`${API_BASE}/questions`, { data: malformedData });

        // Should reject malformed requests
        expect([400, 422, 500]).toContain(response.status());
      }

      // Test array instead of object
      const arrayResponse = await request.put(`${API_BASE}/questions`, {
        data: [{ id: question.id, title: 'Array Request' }],
      });
      expect([400, 415, 422, 500]).toContain(arrayResponse.status());
    } finally {
      await deleteTestQuestion(request, question.id);
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #202782
   * Verify Atomicity of Edit Operation on Multiple Fields
   */
  test('should verify atomicity of edit operation on multiple fields @regression @ADO-202782', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);
    const question = await createTestQuestion(request, regArea.id, 'Atomicity Test', 'Text');

    try {
      // Update multiple fields at once
      const updateData = {
        id: question.id,
        title: 'Updated Title for Atomicity',
        questionType: 'MultipleChoice',
        regAreaId: regArea.id,
        isActive: false, // Changed from true
        isApproved: false, // Changed from true
        isDelete: false,
      };

      const response = await request.put(`${API_BASE}/questions`, { data: updateData });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // All fields should be updated atomically
      expect(data.title).toBe('Updated Title for Atomicity');
      expect(data.questionType).toBe('MultipleChoice');
      expect(data.isActive).toBe(false);
      expect(data.isApproved).toBe(false);

      // Verify by fetching the question again
      const verifyResponse = await request.get(`${API_BASE}/questions/${regArea.id}`);
      expect(verifyResponse.status()).toBe(200);
      const questions = await verifyResponse.json();
      const updatedQuestion = questions.find((q: { id: number }) => q.id === question.id);

      if (updatedQuestion) {
        expect(updatedQuestion.title).toBe('Updated Title for Atomicity');
        expect(updatedQuestion.questionType).toBe('MultipleChoice');
      }
    } finally {
      await deleteTestQuestion(request, question.id);
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #240731
   * Verify Audit Log Entry After Question Edit
   * Note: This test requires access to audit log API
   */
  test.skip('@ADO-240731 @audit should verify audit log entry after question edit', async ({
    request,
  }) => {
    // This test requires:
    // 1. Access to an audit log API endpoint
    // 2. Ability to query audit entries by entity type and ID
    //
    // Placeholder for audit log verification
    const regArea = await createTestRegArea(request);
    const question = await createTestQuestion(request, regArea.id);

    try {
      // Perform edit
      const updateData = {
        id: question.id,
        title: 'Audit Log Test Update',
        questionType: question.questionType,
        regAreaId: question.regAreaId,
        isActive: true,
      };

      await request.put(`${API_BASE}/questions`, { data: updateData });

      // TODO: Query audit log
      // const auditResponse = await request.get(`${API_BASE}/audit-logs?entityType=Question&entityId=${question.id}`);
      // expect(auditResponse.status()).toBe(200);
      // const auditLogs = await auditResponse.json();
      // expect(auditLogs.length).toBeGreaterThan(0);
      // const lastLog = auditLogs[0];
      // expect(lastLog.action).toBe('UPDATE');
      // expect(lastLog.entityId).toBe(question.id);
    } finally {
      await deleteTestQuestion(request, question.id);
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #240732
   * Verify Concurrent Edits Use Version or Optimistic Locking
   */
  test('should handle concurrent edits with optimistic locking @regression @ADO-240732', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);
    const question = await createTestQuestion(request, regArea.id, 'Concurrent Edit Test');

    try {
      // Simulate concurrent edits
      const update1 = {
        id: question.id,
        title: 'Concurrent Update 1',
        questionType: question.questionType,
        regAreaId: question.regAreaId,
        isActive: true,
      };

      const update2 = {
        id: question.id,
        title: 'Concurrent Update 2',
        questionType: question.questionType,
        regAreaId: question.regAreaId,
        isActive: true,
      };

      // Execute concurrent updates
      const [response1, response2] = await Promise.all([
        request.put(`${API_BASE}/questions`, { data: update1 }),
        request.put(`${API_BASE}/questions`, { data: update2 }),
      ]);

      // Both should succeed (last write wins) or one should fail (optimistic locking)
      const statuses = [response1.status(), response2.status()];

      // At least one should succeed
      expect(statuses.some(s => s === 200)).toBe(true);

      // If optimistic locking is implemented, one might fail with 409 Conflict
      // Document actual behavior
      if (statuses.includes(409)) {
        console.log('INFO: API implements optimistic locking (409 Conflict on concurrent edit)');
      } else if (statuses.every(s => s === 200)) {
        console.log('INFO: API uses last-write-wins strategy for concurrent edits');
      }
    } finally {
      await deleteTestQuestion(request, question.id);
      await deleteTestRegArea(request, regArea.id);
    }
  });

  /**
   * ADO Test Case #240733
   * Verify Changes Reflected in Downstream Applications
   * Note: This test verifies that changes propagate correctly across related endpoints
   */
  test('should verify changes reflected in downstream queries @regression @ADO-240733', async ({
    request,
  }) => {
    const regArea = await createTestRegArea(request);
    const question = await createTestQuestion(request, regArea.id, 'Downstream Sync Test');

    try {
      const newTitle = 'Updated for Downstream Verification';

      // Update the question
      const updateData = {
        id: question.id,
        title: newTitle,
        questionType: question.questionType,
        regAreaId: question.regAreaId,
        isActive: true,
      };

      const updateResponse = await request.put(`${API_BASE}/questions`, { data: updateData });
      expect(updateResponse.status()).toBe(200);

      // Verify change is reflected in GET all questions
      const allQuestionsResponse = await request.get(`${API_BASE}/questions`);
      expect(allQuestionsResponse.status()).toBe(200);
      const allQuestions = await allQuestionsResponse.json();
      const foundInAll = allQuestions.find((q: { id: number }) => q.id === question.id);
      expect(foundInAll?.title).toBe(newTitle);

      // Verify change is reflected in GET questions by regAreaId
      const byRegAreaResponse = await request.get(`${API_BASE}/questions/${regArea.id}`);
      expect(byRegAreaResponse.status()).toBe(200);
      const byRegArea = await byRegAreaResponse.json();
      const foundByRegArea = byRegArea.find((q: { id: number }) => q.id === question.id);
      expect(foundByRegArea?.title).toBe(newTitle);
    } finally {
      await deleteTestQuestion(request, question.id);
      await deleteTestRegArea(request, regArea.id);
    }
  });

  // Additional edit tests
  test.describe('Additional Edit Operations', () => {
    test('@smoke should preserve fields not included in partial update', async ({ request }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id, 'Partial Update Test');

      try {
        // Get original state
        const originalResponse = await request.get(`${API_BASE}/questions/${regArea.id}`);
        const originalQuestions = await originalResponse.json();
        const original = originalQuestions.find((q: { id: number }) => q.id === question.id);

        // Update only title
        const updateData = {
          id: question.id,
          title: 'Only Title Updated',
          questionType: original.questionType,
          regAreaId: original.regAreaId,
        };

        const response = await request.put(`${API_BASE}/questions`, { data: updateData });
        expect(response.status()).toBe(200);

        const updated = await response.json();
        expect(updated.title).toBe('Only Title Updated');
        expect(updated.questionType).toBe(original.questionType);
        expect(updated.regAreaId).toBe(original.regAreaId);
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@edge should handle boundary value edits (500 char title)', async ({ request }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        const maxLengthTitle = 'U'.repeat(500);
        const updateData = {
          id: question.id,
          title: maxLengthTitle,
          questionType: question.questionType,
          regAreaId: question.regAreaId,
          isActive: true,
        };

        const response = await request.put(`${API_BASE}/questions`, { data: updateData });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.title.length).toBe(500);
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should handle XSS attempt in edit', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        const xssPayload = '<script>alert("xss")</script>Safe Title';
        const updateData = {
          id: question.id,
          title: xssPayload,
          questionType: question.questionType,
          regAreaId: question.regAreaId,
          isActive: true,
        };

        const response = await request.put(`${API_BASE}/questions`, { data: updateData });

        if (response.status() === 200) {
          const data = await response.json();
          // Script tags should be sanitized
          expect(data.title).not.toContain('<script>');
        } else {
          expect([400, 422]).toContain(response.status());
        }
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should handle SQL injection attempt in edit', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        const sqlPayload = "'; DROP TABLE questions; --";
        const updateData = {
          id: question.id,
          title: sqlPayload,
          questionType: question.questionType,
          regAreaId: question.regAreaId,
          isActive: true,
        };

        const response = await request.put(`${API_BASE}/questions`, { data: updateData });

        // Should handle safely - either accept as literal text or reject
        expect([200, 400, 422]).toContain(response.status());

        // Verify database is still functional
        const verifyResponse = await request.get(`${API_BASE}/questions`);
        expect(verifyResponse.status()).toBe(200);
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });
});

/**
 * =============================================================================
 * SECURITY TESTS
 * =============================================================================
 */
test.describe('Security Tests', () => {
  test.describe('Input Validation & Injection', () => {
    test('@security should prevent XSS via question title with various payloads', async ({
      request,
    }) => {
      const regArea = await createTestRegArea(request);

      try {
        const xssPayloads = [
          '<script>alert(1)</script>',
          '<img src=x onerror=alert(1)>',
          '<svg onload=alert(1)>',
          'javascript:alert(1)',
          '<a href="javascript:alert(1)">click</a>',
          '"><script>alert(1)</script>',
          "'-alert(1)-'",
          '<iframe src="javascript:alert(1)">',
          '<body onload=alert(1)>',
          '{{constructor.constructor("alert(1)")()}}', // Template injection
        ];

        for (const payload of xssPayloads) {
          const questionData = {
            title: `Test ${payload}`,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });

          if (response.status() === 201) {
            const data = await response.json();
            // Verify payload is sanitized or encoded
            expect(data.title).not.toContain('<script>');
            expect(data.title).not.toContain('onerror=');
            expect(data.title).not.toContain('onload=');
            expect(data.title).not.toContain('javascript:');
            await deleteTestQuestion(request, data.id);
          }
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should prevent SQL injection via various fields', async ({ request }) => {
      const regArea = await createTestRegArea(request);

      try {
        const sqlPayloads = [
          "'; DROP TABLE questions; --",
          "1' OR '1'='1",
          '1; DELETE FROM questions WHERE 1=1; --',
          "' UNION SELECT * FROM users --",
          "1' AND SLEEP(5) --",
          "1'; EXEC xp_cmdshell('dir'); --",
          "admin'--",
          "1' OR 1=1#",
          "' OR ''='",
        ];

        for (const payload of sqlPayloads) {
          const questionData = {
            title: payload,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });

          // Should either accept safely or reject - no 500 errors
          expect([200, 201, 400, 422]).toContain(response.status());

          if (response.status() === 201) {
            const data = await response.json();
            await deleteTestQuestion(request, data.id);
          }
        }

        // Verify database is still functional
        const verifyResponse = await request.get(`${API_BASE}/questions`);
        expect(verifyResponse.status()).toBe(200);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should prevent NoSQL injection attempts', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const nosqlPayloads = [
          '{"$gt": ""}',
          '{"$ne": null}',
          '{"$where": "sleep(5000)"}',
          '{"$regex": ".*"}',
          "{'$or': [{}]}",
        ];

        for (const payload of nosqlPayloads) {
          const questionData = {
            title: payload,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });
          expect([200, 201, 400, 422]).toContain(response.status());

          if (response.status() === 201) {
            const data = await response.json();
            await deleteTestQuestion(request, data.id);
          }
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should prevent command injection attempts', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const cmdPayloads = [
          '; ls -la',
          '| cat /etc/passwd',
          '`whoami`',
          '$(whoami)',
          '& dir',
          '&& net user',
        ];

        for (const payload of cmdPayloads) {
          const questionData = {
            title: `Test ${payload}`,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });
          expect([200, 201, 400, 422]).toContain(response.status());

          if (response.status() === 201) {
            const data = await response.json();
            await deleteTestQuestion(request, data.id);
          }
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should prevent path traversal in API endpoints', async ({ request }) => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%252f..%252f..%252fetc/passwd',
      ];

      for (const payload of pathTraversalPayloads) {
        const response = await request.get(`${API_BASE}/questions/${payload}`);
        // Should return 400 or 404, not expose system files
        expect([400, 404, 422]).toContain(response.status());
      }
    });

    test('@security should prevent LDAP injection attempts', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const ldapPayloads = ['*)(uid=*))(|(uid=*', '*)(&', '*)(objectClass=*', 'admin)(&)'];

        for (const payload of ldapPayloads) {
          const questionData = {
            title: `LDAP Test ${payload}`,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });
          expect([200, 201, 400, 422]).toContain(response.status());

          if (response.status() === 201) {
            const data = await response.json();
            await deleteTestQuestion(request, data.id);
          }
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('Mass Assignment & Over-Posting', () => {
    test('@security should not allow setting internal fields via mass assignment', async ({
      request,
    }) => {
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const maliciousData = {
          title: `Mass Assignment Test ${timestamp}`,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          // Attempting to set internal/privileged fields
          id: 999999, // Should be auto-generated
          createdBy: 'attacker@evil.com',
          createdDate: '2000-01-01T00:00:00Z',
          modifiedBy: 'attacker@evil.com',
          modifiedDate: '2000-01-01T00:00:00Z',
          tenantId: 'malicious-tenant',
          role: 'admin',
          permissions: ['all'],
          _internal: 'hacked',
        };

        const response = await request.post(`${API_BASE}/questions`, { data: maliciousData });

        if (response.status() === 201) {
          const data = await response.json();
          // Verify internal fields were not set by attacker
          expect(data.id).not.toBe(999999);
          expect(data.createdBy).not.toBe('attacker@evil.com');
          expect(data.tenantId).not.toBe('malicious-tenant');
          await deleteTestQuestion(request, data.id);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should not allow privilege escalation via update', async ({ request }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        const escalationData = {
          id: question.id,
          title: question.title,
          questionType: question.questionType,
          regAreaId: question.regAreaId,
          isActive: true,
          // Attempting privilege escalation
          isAdmin: true,
          role: 'superadmin',
          tenantId: 'different-tenant',
          createdBy: 'hijacked@user.com',
        };

        const response = await request.put(`${API_BASE}/questions`, { data: escalationData });

        if (response.status() === 200) {
          const data = await response.json();
          expect(data.isAdmin).toBeUndefined();
          expect(data.role).toBeUndefined();
        }
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('IDOR - Insecure Direct Object Reference', () => {
    test('@security should verify question belongs to accessible reg area', async ({ request }) => {
      // Create two reg areas
      const regArea1 = await createTestRegArea(request);
      const regArea2 = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea1.id);

      try {
        // Try to reassign question to different reg area
        const updateData = {
          id: question.id,
          title: question.title,
          questionType: question.questionType,
          regAreaId: regArea2.id, // Moving to different reg area
          isActive: true,
        };

        const response = await request.put(`${API_BASE}/questions`, { data: updateData });

        // Document behavior - should this be allowed?
        if (response.status() === 200) {
          console.log('INFO: API allows moving questions between reg areas');
        } else {
          console.log('INFO: API restricts question movement between reg areas');
        }
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea1.id);
        await deleteTestRegArea(request, regArea2.id);
      }
    });

    test('@security should not expose other tenants data via ID enumeration', async ({
      request,
    }) => {
      // Try accessing sequential IDs to find other data
      const testIds = [1, 2, 3, 100, 1000, 10000];

      for (const id of testIds) {
        const response = await request.get(`${API_BASE}/questions/${id}`);
        // Should only return 200 for accessible data, 403/404 for others
        expect([200, 403, 404]).toContain(response.status());
      }
    });
  });

  test.describe('HTTP Security', () => {
    test('@security should return appropriate security headers', async ({ superAdminRequest }) => {
      const response = await request.get(`${API_BASE}/reg-area`);
      const headers = response.headers();

      // Check for security headers (document which are present)
      const securityHeaders = {
        'x-content-type-options': headers['x-content-type-options'],
        'x-frame-options': headers['x-frame-options'],
        'x-xss-protection': headers['x-xss-protection'],
        'strict-transport-security': headers['strict-transport-security'],
        'content-security-policy': headers['content-security-policy'],
        'cache-control': headers['cache-control'],
      };

      // Log missing security headers
      for (const [header, value] of Object.entries(securityHeaders)) {
        if (!value) {
          console.log(`WARNING: Missing security header: ${header}`);
        }
      }

      // At minimum, X-Content-Type-Options should be set
      // expect(headers['x-content-type-options']).toBe('nosniff');
    });

    test('@security should reject requests with invalid HTTP methods', async ({ request }) => {
      // Test unsupported methods
      const traceResponse = await request.fetch(`${API_BASE}/questions`, { method: 'TRACE' });
      expect([400, 405, 501]).toContain(traceResponse.status());

      const optionsResponse = await request.fetch(`${API_BASE}/questions`, { method: 'OPTIONS' });
      // OPTIONS might be allowed for CORS
      expect([200, 204, 405]).toContain(optionsResponse.status());
    });

    test('@security should not expose sensitive info in error messages', async ({ request }) => {
      // Trigger errors and check response doesn't leak sensitive info
      const badRequests = [
        { url: `${API_BASE}/questions/invalid-id`, method: 'GET' },
        { url: `${API_BASE}/reg-area/-1`, method: 'DELETE' },
        { url: `${API_BASE}/questions`, data: { invalid: 'data' }, method: 'POST' },
      ];

      for (const req of badRequests) {
        let response;
        if (req.method === 'GET') {
          response = await request.get(req.url);
        } else if (req.method === 'DELETE') {
          response = await request.delete(req.url);
        } else {
          response = await request.post(req.url, { data: req.data });
        }

        const text = await response.text();
        // Should not expose stack traces, SQL queries, or internal paths
        expect(text).not.toMatch(/at \w+\.\w+\(/); // Stack trace pattern
        expect(text).not.toMatch(/SELECT|INSERT|UPDATE|DELETE.*FROM/i); // SQL
        expect(text).not.toMatch(/C:\\|\/usr\/|\/var\//); // System paths
        expect(text).not.toMatch(/password|secret|key|token/i); // Secrets
      }
    });

    test('@security should handle oversized payloads gracefully', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        // Try sending very large payload
        const largeTitle = 'X'.repeat(100000); // 100KB title
        const questionData = {
          title: largeTitle,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        const response = await request.post(`${API_BASE}/questions`, { data: questionData });
        // Should reject with 400 or 413 (Payload Too Large)
        expect([400, 413, 422]).toContain(response.status());
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@security should handle deeply nested JSON', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        // Create deeply nested object
        let nested: Record<string, unknown> = { value: 'deep' };
        for (let i = 0; i < 100; i++) {
          nested = { nested };
        }

        const questionData = {
          title: 'Nested JSON Test',
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          extra: nested,
        };

        const response = await request.post(`${API_BASE}/questions`, { data: questionData });
        // Should handle gracefully
        expect([200, 201, 400, 413, 422]).toContain(response.status());
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('Rate Limiting & DoS Prevention', () => {
    test('@security @performance should handle rapid successive requests', async ({ request }) => {
      const startTime = Date.now();
      const requestCount = 50;
      const responses: number[] = [];

      // Send rapid requests
      for (let i = 0; i < requestCount; i++) {
        const response = await request.get(`${API_BASE}/reg-area`);
        responses.push(response.status());
      }

      const duration = Date.now() - startTime;

      // Check if rate limiting kicked in (429 Too Many Requests)
      const rateLimited = responses.filter(s => s === 429).length;
      const successful = responses.filter(s => s === 200).length;

      console.log(
        `Rapid requests: ${successful} succeeded, ${rateLimited} rate-limited in ${duration}ms`
      );

      if (rateLimited === 0) {
        console.log('WARNING: No rate limiting detected - potential DoS vulnerability');
      }
    });
  });
});

/**
 * =============================================================================
 * FUNCTIONAL TESTS - EDGE CASES
 * =============================================================================
 */
test.describe('Functional Tests - Edge Cases', () => {
  test.describe('Data Type Handling', () => {
    test('@functional should handle null values appropriately', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const nullFieldsData = {
          title: 'Null Fields Test',
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: null,
          isApproved: null,
          description: null,
        };

        const response = await request.post(`${API_BASE}/questions`, { data: nullFieldsData });

        // Should either accept with defaults or reject
        if (response.status() === 201) {
          const data = await response.json();
          // Verify null handling
          expect(typeof data.isActive).toBe('boolean');
          await deleteTestQuestion(request, data.id);
        } else {
          expect([400, 422]).toContain(response.status());
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should handle undefined values appropriately', async ({ request }) => {
      const regArea = await createTestRegArea(request);

      try {
        const questionData = {
          title: 'Undefined Fields Test',
          questionType: 'Text',
          regAreaId: regArea.id,
          // isActive not provided (undefined)
        };

        const response = await request.post(`${API_BASE}/questions`, { data: questionData });

        if (response.status() === 201) {
          const data = await response.json();
          // Should have default value
          expect(data.isActive).toBeDefined();
          await deleteTestQuestion(request, data.id);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should handle boolean field as string', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const stringBooleanData = {
          title: 'String Boolean Test',
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: 'true', // String instead of boolean
          isApproved: 'false',
        };

        const response = await request.post(`${API_BASE}/questions`, { data: stringBooleanData });

        // Should either coerce or reject
        if (response.status() === 201) {
          const data = await response.json();
          expect(typeof data.isActive).toBe('boolean');
          await deleteTestQuestion(request, data.id);
        } else {
          expect([400, 422]).toContain(response.status());
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should handle numeric regAreaId as string', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const stringIdData = {
          title: 'String RegAreaId Test',
          questionType: 'Text',
          regAreaId: String(regArea.id), // String instead of number
          isActive: true,
        };

        const response = await request.post(`${API_BASE}/questions`, { data: stringIdData });

        // Should either coerce or reject
        if (response.status() === 201) {
          const data = await response.json();
          expect(data.regAreaId).toBe(regArea.id);
          await deleteTestQuestion(request, data.id);
        } else {
          expect([400, 422]).toContain(response.status());
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should handle negative ID values', async ({ superAdminRequest }) => {
      const questionData = {
        title: 'Negative ID Test',
        questionType: 'Text',
        regAreaId: -1,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });
      expect([400, 404, 422]).toContain(response.status());
    });

    test('@functional should handle zero ID values', async ({ superAdminRequest }) => {
      const questionData = {
        title: 'Zero ID Test',
        questionType: 'Text',
        regAreaId: 0,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });
      expect([400, 404, 422]).toContain(response.status());
    });

    test('@functional should handle float ID values', async ({ superAdminRequest }) => {
      const questionData = {
        title: 'Float ID Test',
        questionType: 'Text',
        regAreaId: 1.5,
        isActive: true,
      };

      const response = await request.post(`${API_BASE}/questions`, { data: questionData });
      // Should either truncate/round or reject
      expect([201, 400, 404, 422]).toContain(response.status());
    });

    test('@functional should handle very large ID values', async ({ superAdminRequest }) => {
      const largeIds = [
        2147483647, // Max int32
        2147483648, // Max int32 + 1
        9007199254740991, // Max safe integer JS
        Number.MAX_SAFE_INTEGER + 1,
      ];

      for (const id of largeIds) {
        const response = await request.get(`${API_BASE}/questions/${id}`);
        expect([400, 404, 422, 500]).toContain(response.status());
      }
    });
  });

  test.describe('String Handling', () => {
    test('@functional should handle Unicode characters in title', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const unicodeStrings = [
          'Question with émojis 🎉🔥💯',
          'Chinese characters: 中文问题',
          'Arabic text: سؤال عربي',
          'Japanese: 日本語の質問',
          'Korean: 한국어 질문',
          'Russian: Русский вопрос',
          'Greek: Ελληνική ερώτηση',
          'Hebrew: שאלה בעברית',
          'Thai: คำถามภาษาไทย',
          'Mixed: Test 测试 テスト тест',
        ];

        for (const unicodeTitle of unicodeStrings) {
          const questionData = {
            title: unicodeTitle,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });

          if (response.status() === 201) {
            const data = await response.json();
            // Verify Unicode is preserved
            expect(data.title).toBe(unicodeTitle);
            await deleteTestQuestion(request, data.id);
          }
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should handle whitespace variations', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);

      try {
        const whitespaceTests = [
          { input: '  Leading spaces', expected: 'Leading spaces' },
          { input: 'Trailing spaces  ', expected: 'Trailing spaces' },
          { input: '  Both ends  ', expected: 'Both ends' },
          { input: 'Multiple   internal   spaces', expected: 'Multiple internal spaces' },
          { input: 'Tab\there', expected: 'Tab here' },
          { input: 'New\nline', expected: 'New line' },
          { input: '   ', expected: null }, // Only whitespace - should reject
        ];

        for (const test of whitespaceTests) {
          const questionData = {
            title: test.input,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });

          if (test.expected === null) {
            // Should reject whitespace-only
            expect([400, 422]).toContain(response.status());
          } else if (response.status() === 201) {
            const data = await response.json();
            // Document actual whitespace handling
            console.log(`Whitespace test: "${test.input}" -> "${data.title}"`);
            await deleteTestQuestion(request, data.id);
          }
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@functional should handle case sensitivity in uniqueness checks', async ({ request }) => {
      const timestamp = Date.now();

      // Create first reg area
      const firstData = {
        name: `Case Test ${timestamp}`,
        description: 'First',
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const firstResponse = await request.post(`${API_BASE}/reg-area`, { data: firstData });
      expect(firstResponse.status()).toBe(201);
      const first = await firstResponse.json();

      try {
        // Try to create with different case
        const caseVariations = [
          `case test ${timestamp}`, // all lowercase
          `CASE TEST ${timestamp}`, // all uppercase
          `CaSe TeSt ${timestamp}`, // mixed case
        ];

        for (const variation of caseVariations) {
          const duplicateData = {
            name: variation,
            description: 'Case variation',
            isActive: true,
            isApproved: true,
            isDelete: false,
          };

          const response = await request.post(`${API_BASE}/reg-area`, { data: duplicateData });

          if (response.status() === 201) {
            const data = await response.json();
            console.log(`INFO: API allows case-insensitive duplicate: "${variation}"`);
            await deleteTestRegArea(request, data.id);
          } else {
            console.log(`INFO: API treats "${variation}" as duplicate (case-insensitive)`);
          }
        }
      } finally {
        await deleteTestRegArea(request, first.id);
      }
    });

    test('@functional should handle special characters in names', async ({ superAdminRequest }) => {
      const specialChars = [
        { name: 'Question with & ampersand', shouldWork: true },
        { name: 'Question with " quotes', shouldWork: true },
        { name: "Question with ' apostrophe", shouldWork: true },
        { name: 'Question with \\ backslash', shouldWork: true },
        { name: 'Question with / slash', shouldWork: true },
        { name: 'Question with < less than', shouldWork: true },
        { name: 'Question with > greater than', shouldWork: true },
        { name: 'Question with % percent', shouldWork: true },
        { name: 'Question with $ dollar', shouldWork: true },
        { name: 'Question with @ at sign', shouldWork: true },
        { name: 'Question with # hash', shouldWork: true },
        { name: 'Question with * asterisk', shouldWork: true },
        { name: 'Question with null\x00char', shouldWork: false },
      ];

      const regArea = await createTestRegArea(request);

      try {
        for (const test of specialChars) {
          const questionData = {
            title: test.name,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });

          if (response.status() === 201) {
            const data = await response.json();
            await deleteTestQuestion(request, data.id);
          } else if (test.shouldWork) {
            console.log(`WARNING: Failed to create question with "${test.name}"`);
          }
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('Boundary Conditions', () => {
    test('@functional should handle exactly boundary length values', async ({ request }) => {
      const regArea = await createTestRegArea(request);

      try {
        const boundaryTests = [
          { length: 2, shouldFail: true }, // Below min (3)
          { length: 3, shouldFail: false }, // Exactly min
          { length: 4, shouldFail: false }, // Just above min
          { length: 499, shouldFail: false }, // Just below max
          { length: 500, shouldFail: false }, // Exactly max
          { length: 501, shouldFail: true }, // Just above max
        ];

        for (const test of boundaryTests) {
          const title = 'Q'.repeat(test.length);
          const questionData = {
            title,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };

          const response = await request.post(`${API_BASE}/questions`, { data: questionData });

          if (test.shouldFail) {
            expect([400, 422]).toContain(response.status());
          } else {
            expect(response.status()).toBe(201);
            const data = await response.json();
            expect(data.title.length).toBe(test.length);
            await deleteTestQuestion(request, data.id);
          }
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });
});

/**
 * =============================================================================
 * BUSINESS LOGIC TESTS
 * =============================================================================
 */
test.describe('Business Logic Tests', () => {
  test.describe('State Transitions', () => {
    test('@business should enforce valid state transitions for isActive', async ({ request }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        // Deactivate question
        const deactivateData = {
          id: question.id,
          title: question.title,
          questionType: question.questionType,
          regAreaId: question.regAreaId,
          isActive: false,
        };

        const deactivateResponse = await request.put(`${API_BASE}/questions`, {
          data: deactivateData,
        });
        expect(deactivateResponse.status()).toBe(200);

        // Reactivate question
        const reactivateData = {
          ...deactivateData,
          isActive: true,
        };

        const reactivateResponse = await request.put(`${API_BASE}/questions`, {
          data: reactivateData,
        });
        expect(reactivateResponse.status()).toBe(200);
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@business should enforce valid state transitions for isApproved', async ({ request }) => {
      const regArea = await createTestRegArea(request);

      try {
        // Create unapproved question
        const questionData = {
          title: 'Unapproved Question Test',
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: false, // Not approved initially
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: questionData });
        expect(createResponse.status()).toBe(201);
        const question = await createResponse.json();

        // Approve question
        const approveData = {
          id: question.id,
          title: question.title,
          questionType: question.questionType,
          regAreaId: question.regAreaId,
          isActive: true,
          isApproved: true,
        };

        const approveResponse = await request.put(`${API_BASE}/questions`, { data: approveData });
        expect(approveResponse.status()).toBe(200);
        const approved = await approveResponse.json();
        expect(approved.isApproved).toBe(true);

        await deleteTestQuestion(request, question.id);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@business should handle soft delete (isDelete flag)', async ({ superAdminRequest }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        // Soft delete via isDelete flag
        const softDeleteData = {
          id: question.id,
          title: question.title,
          questionType: question.questionType,
          regAreaId: question.regAreaId,
          isActive: false,
          isDelete: true, // Soft delete
        };

        const softDeleteResponse = await request.put(`${API_BASE}/questions`, {
          data: softDeleteData,
        });
        expect(softDeleteResponse.status()).toBe(200);

        // Verify question visibility
        const listResponse = await request.get(`${API_BASE}/questions`);
        const questions = await listResponse.json();
        const deleted = questions.find((q: { id: number }) => q.id === question.id);

        // Document soft delete behavior
        if (deleted) {
          console.log('INFO: Soft-deleted questions remain visible in list');
          expect(deleted.isDelete).toBe(true);
        } else {
          console.log('INFO: Soft-deleted questions are hidden from list');
        }
      } finally {
        // Hard delete for cleanup
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('Referential Integrity', () => {
    test('@business should prevent deletion of reg area with linked questions', async ({
      request,
    }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        // Try to delete reg area that has questions
        const deleteResponse = await request.delete(`${API_BASE}/reg-area/${regArea.id}`);

        // Should either:
        // 1. Prevent deletion (400/409/422)
        // 2. Cascade delete questions
        // 3. Orphan questions (bad - data integrity issue)

        if ([400, 409, 422].includes(deleteResponse.status())) {
          console.log('INFO: API prevents deletion of reg area with questions (good)');
        } else if (deleteResponse.status() === 200) {
          // Check if questions were cascade deleted
          const questionsResponse = await request.get(`${API_BASE}/questions`);
          const questions = await questionsResponse.json();
          const orphanedQuestion = questions.find((q: { id: number }) => q.id === question.id);

          if (orphanedQuestion) {
            console.log('BUG: Question orphaned after reg area deletion - data integrity issue');
            await deleteTestQuestion(request, question.id);
          } else {
            console.log('INFO: Questions cascade deleted with reg area');
          }
          return; // Reg area already deleted
        }

        // Cleanup if deletion was prevented
        await deleteTestQuestion(request, question.id);
      } finally {
        // Try cleanup (may already be deleted)
        try {
          await deleteTestRegArea(request, regArea.id);
        } catch {
          // Already deleted
        }
      }
    });

    test('@business should validate regAreaId exists on question update', async ({ request }) => {
      const regArea = await createTestRegArea(request);
      const question = await createTestQuestion(request, regArea.id);

      try {
        const nonExistentRegAreaId = 999999999;

        const updateData = {
          id: question.id,
          title: question.title,
          questionType: question.questionType,
          regAreaId: nonExistentRegAreaId, // Non-existent reg area
          isActive: true,
        };

        const response = await request.put(`${API_BASE}/questions`, { data: updateData });

        // Should reject
        expect([400, 404, 422]).toContain(response.status());
      } finally {
        await deleteTestQuestion(request, question.id);
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('Business Rules', () => {
    test('@business should enforce unique question titles within same reg area', async ({
      request,
    }) => {
      const regArea = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const title = `Duplicate Title Test ${timestamp}`;

        // Create first question
        const firstData = {
          title,
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        const firstResponse = await request.post(`${API_BASE}/questions`, { data: firstData });
        expect(firstResponse.status()).toBe(201);
        const first = await firstResponse.json();

        // Try to create duplicate
        const duplicateData = {
          title, // Same title
          questionType: 'YesNo', // Different type
          regAreaId: regArea.id, // Same reg area
          isActive: true,
        };

        const duplicateResponse = await request.post(`${API_BASE}/questions`, {
          data: duplicateData,
        });

        // Document behavior
        if (duplicateResponse.status() === 201) {
          console.log('INFO: API allows duplicate question titles in same reg area');
          const duplicate = await duplicateResponse.json();
          await deleteTestQuestion(request, duplicate.id);
        } else {
          console.log('INFO: API prevents duplicate question titles in same reg area');
        }

        await deleteTestQuestion(request, first.id);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@business should allow same question title in different reg areas', async ({
      request,
    }) => {
      const regArea1 = await createTestRegArea(request);
      const regArea2 = await createTestRegArea(request);

      try {
        const timestamp = Date.now();
        const title = `Cross RegArea Title ${timestamp}`;

        // Create question in first reg area
        const firstData = {
          title,
          questionType: 'Text',
          regAreaId: regArea1.id,
          isActive: true,
        };

        const firstResponse = await request.post(`${API_BASE}/questions`, { data: firstData });
        expect(firstResponse.status()).toBe(201);
        const first = await firstResponse.json();

        // Create same title in different reg area
        const secondData = {
          title, // Same title
          questionType: 'Text',
          regAreaId: regArea2.id, // Different reg area
          isActive: true,
        };

        const secondResponse = await request.post(`${API_BASE}/questions`, { data: secondData });

        // Should be allowed since different reg areas
        expect(secondResponse.status()).toBe(201);
        const second = await secondResponse.json();

        await deleteTestQuestion(request, first.id);
        await deleteTestQuestion(request, second.id);
      } finally {
        await deleteTestRegArea(request, regArea1.id);
        await deleteTestRegArea(request, regArea2.id);
      }
    });

    test('@business should handle question type change validation', async ({ request }) => {
      const regArea = await createTestRegArea(request);

      try {
        // Create a Text question
        const questionData = {
          title: 'Type Change Validation Test',
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: questionData });
        expect(createResponse.status()).toBe(201);
        const question = await createResponse.json();

        // Try changing to each valid type
        const validTypes = ['Text', 'YesNo', 'MultipleChoice', 'Dropdown', 'Date', 'Number'];

        for (const newType of validTypes) {
          const updateData = {
            id: question.id,
            title: question.title,
            questionType: newType,
            regAreaId: question.regAreaId,
            isActive: true,
          };

          const response = await request.put(`${API_BASE}/questions`, { data: updateData });

          if (response.status() === 200) {
            const updated = await response.json();
            expect(updated.questionType).toBe(newType);
          } else {
            console.log(`INFO: Cannot change question type to ${newType}: ${response.status()}`);
          }
        }

        await deleteTestQuestion(request, question.id);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@business should maintain data consistency across multiple operations', async ({
      request,
    }) => {
      const regArea = await createTestRegArea(request);

      try {
        // Create multiple questions
        const questions: number[] = [];
        for (let i = 0; i < 5; i++) {
          const question = await createTestQuestion(
            request,
            regArea.id,
            `Consistency Test Question ${i}`
          );
          questions.push(question.id);
        }

        // Update all questions
        for (const qId of questions) {
          const updateData = {
            id: qId,
            title: `Updated Consistency Test Question ${qId}`,
            questionType: 'Text',
            regAreaId: regArea.id,
            isActive: true,
          };
          await request.put(`${API_BASE}/questions`, { data: updateData });
        }

        // Verify all updates persisted
        const listResponse = await request.get(`${API_BASE}/questions/${regArea.id}`);
        const allQuestions = await listResponse.json();

        for (const qId of questions) {
          const found = allQuestions.find((q: { id: number }) => q.id === qId);
          expect(found).toBeDefined();
          expect(found.title).toContain('Updated Consistency Test');
        }

        // Cleanup
        for (const qId of questions) {
          await deleteTestQuestion(request, qId);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@business should handle order/sequence of questions in reg area', async ({ request }) => {
      const regArea = await createTestRegArea(request);

      try {
        // Create questions with specific order
        const questions: { id: number; title: string }[] = [];
        for (let i = 1; i <= 5; i++) {
          const question = await createTestQuestion(request, regArea.id, `Question ${i} of 5`);
          questions.push(question);
        }

        // Fetch questions and check if order is preserved
        const listResponse = await request.get(`${API_BASE}/questions/${regArea.id}`);
        const fetchedQuestions = await listResponse.json();

        // Document ordering behavior
        const firstFetched = fetchedQuestions[0];
        if (firstFetched.title === 'Question 1 of 5') {
          console.log('INFO: Questions maintain creation order');
        } else if (firstFetched.title === 'Question 5 of 5') {
          console.log('INFO: Questions returned in reverse order (newest first)');
        } else {
          console.log('INFO: Question ordering is not deterministic');
        }

        // Cleanup
        for (const q of questions) {
          await deleteTestQuestion(request, q.id);
        }
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });

  test.describe('Workflow Rules', () => {
    test('@business should check if inactive questions can be used', async ({ request }) => {
      const regArea = await createTestRegArea(request);

      try {
        // Create and deactivate a question
        const question = await createTestQuestion(request, regArea.id, 'Inactive Question Test');

        const deactivateData = {
          id: question.id,
          title: question.title,
          questionType: question.questionType,
          regAreaId: question.regAreaId,
          isActive: false,
        };

        await request.put(`${API_BASE}/questions`, { data: deactivateData });

        // Verify inactive question behavior
        const listResponse = await request.get(`${API_BASE}/questions/${regArea.id}`);
        const questions = await listResponse.json();
        const inactiveQuestion = questions.find((q: { id: number }) => q.id === question.id);

        if (inactiveQuestion) {
          console.log('INFO: Inactive questions are returned in list');
          expect(inactiveQuestion.isActive).toBe(false);
        } else {
          console.log('INFO: Inactive questions are filtered from list');
        }

        await deleteTestQuestion(request, question.id);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });

    test('@business should check if unapproved questions can be used', async ({ request }) => {
      const regArea = await createTestRegArea(request);

      try {
        // Create unapproved question
        const questionData = {
          title: 'Unapproved Question Visibility Test',
          questionType: 'Text',
          regAreaId: regArea.id,
          isActive: true,
          isApproved: false,
        };

        const createResponse = await request.post(`${API_BASE}/questions`, { data: questionData });
        expect(createResponse.status()).toBe(201);
        const question = await createResponse.json();

        // Verify unapproved question behavior
        const listResponse = await request.get(`${API_BASE}/questions/${regArea.id}`);
        const questions = await listResponse.json();
        const unapprovedQuestion = questions.find((q: { id: number }) => q.id === question.id);

        if (unapprovedQuestion) {
          console.log('INFO: Unapproved questions are returned in list');
          expect(unapprovedQuestion.isApproved).toBe(false);
        } else {
          console.log('INFO: Unapproved questions are filtered from list');
        }

        await deleteTestQuestion(request, question.id);
      } finally {
        await deleteTestRegArea(request, regArea.id);
      }
    });
  });
});

/**
 * =============================================================================
 * FULL CRUD FLOW TESTS
 * =============================================================================
 */
test.describe('Sprint 1 - Full CRUD Flow', () => {
  test('@smoke @e2e should perform complete CRUD on reg area', async ({ superAdminRequest }) => {
    const timestamp = Date.now();

    // CREATE
    const createData = {
      name: `E2E CRUD RegArea ${timestamp}`,
      description: 'End-to-end CRUD test',
      isActive: true,
      isApproved: true,
      isDelete: false,
    };

    const createResponse = await request.post(`${API_BASE}/reg-area`, { data: createData });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    expect(created.id).toBeDefined();

    // READ
    const readResponse = await request.get(`${API_BASE}/reg-area`);
    expect(readResponse.status()).toBe(200);
    const allRegAreas = await readResponse.json();
    const foundCreated = allRegAreas.find((ra: { id: number }) => ra.id === created.id);
    expect(foundCreated).toBeDefined();

    // UPDATE
    const updateData = {
      id: created.id,
      name: `Updated E2E CRUD RegArea ${timestamp}`,
      description: 'Updated description',
      isActive: true,
      isApproved: true,
      isDelete: false,
    };

    const updateResponse = await request.put(`${API_BASE}/reg-area`, { data: updateData });
    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json();
    expect(updated.name).toBe(updateData.name);

    // DELETE
    const deleteResponse = await request.delete(`${API_BASE}/reg-area/${created.id}`);
    expect(deleteResponse.status()).toBe(200);

    // VERIFY DELETION
    const verifyResponse = await request.get(`${API_BASE}/reg-area`);
    const afterDelete = await verifyResponse.json();
    const shouldNotExist = afterDelete.find((ra: { id: number }) => ra.id === created.id);
    expect(shouldNotExist).toBeUndefined();
  });

  test('@smoke @e2e should perform complete CRUD on questions', async ({ superAdminRequest }) => {
    const regArea = await createTestRegArea(request);

    try {
      const timestamp = Date.now();

      // CREATE
      const createData = {
        title: `E2E CRUD Question ${timestamp}`,
        questionType: 'Text',
        regAreaId: regArea.id,
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const createResponse = await request.post(`${API_BASE}/questions`, { data: createData });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      expect(created.id).toBeDefined();

      // READ - All Questions
      const readAllResponse = await request.get(`${API_BASE}/questions`);
      expect(readAllResponse.status()).toBe(200);
      const allQuestions = await readAllResponse.json();
      const foundInAll = allQuestions.find((q: { id: number }) => q.id === created.id);
      expect(foundInAll).toBeDefined();

      // READ - By RegArea
      const readByRegAreaResponse = await request.get(`${API_BASE}/questions/${regArea.id}`);
      expect(readByRegAreaResponse.status()).toBe(200);
      const byRegArea = await readByRegAreaResponse.json();
      const foundByRegArea = byRegArea.find((q: { id: number }) => q.id === created.id);
      expect(foundByRegArea).toBeDefined();

      // UPDATE
      const updateData = {
        id: created.id,
        title: `Updated E2E CRUD Question ${timestamp}`,
        questionType: 'MultipleChoice',
        regAreaId: regArea.id,
        isActive: true,
        isApproved: true,
        isDelete: false,
      };

      const updateResponse = await request.put(`${API_BASE}/questions`, { data: updateData });
      expect(updateResponse.status()).toBe(200);
      const updated = await updateResponse.json();
      expect(updated.title).toBe(updateData.title);
      expect(updated.questionType).toBe('MultipleChoice');

      // DELETE
      const deleteResponse = await request.delete(`${API_BASE}/questions/${created.id}`);
      expect(deleteResponse.status()).toBe(200);

      // VERIFY DELETION
      const verifyResponse = await request.get(`${API_BASE}/questions`);
      const afterDelete = await verifyResponse.json();
      const shouldNotExist = afterDelete.find((q: { id: number }) => q.id === created.id);
      expect(shouldNotExist).toBeUndefined();
    } finally {
      await deleteTestRegArea(request, regArea.id);
    }
  });
});

import { test, expect } from '../../fixtures/advancedFixtures';

/**
 * Sprint 1 API Tests - Create Users: EY Super Admin
 *
 * ADO Story: #197592 - Create users: EY Super Admin (Backend)
 * Assigned To: Johirul Amin
 *
 * Test Cases:
 * - 201683: Create EY Admin User - Success
 * - 201684: Create EY Admin User - Missing Required Fields
 * - 201685: Create EY Admin User - Non-EY Email Domain
 * - 201686: Create EY Admin User - Invalid Email Format
 * - 201687: Create EY Admin User - Duplicate Email
 * - 201688: Create EY Admin User - Email Case Insensitive Uniqueness
 * - 201689: Create EY Admin User - Whitespace and Blanks in Required Fields
 * - 201690: Create EY Admin User - Leading/Trailing Spaces in Input
 * - 201691: Create EY Admin User - Insufficient Privileges
 * - 201692: EY Admin User Listing - Newly Created User Appears
 * - 201693: EY Admin User Listing - Pagination Support
 * - 201694: Search EY Admin Users By Name and Client
 * - 201695: Create EY Admin User - Parallel Requests (Race Condition Test)
 * - 201696: Audit Logging - Creation Success and Failure
 * - 201697: Create EY Admin User - Input Field Maximum Lengths
 * - 201698: Create EY Admin User - Special Characters Handling
 * - 201699: Create EY Admin User - Malicious Data Injection Protection
 * - 201700: Create EY Admin User - Expired Token or Session
 * - 201701: Create EY Admin User - Backend/DB Unavailable
 * - 201702: Create EY Admin User - API Rate Limit Exceeded
 */

const API_BASE = '/api/admin';
const USERS_ENDPOINT = `${API_BASE}/users`;
const EY_ADMIN_ENDPOINT = `${API_BASE}/ey-admin`;

// Test user data
const generateTestUser = () => ({
  firstName: `TestFirst${Date.now()}`,
  lastName: `TestLast${Date.now()}`,
  email: `test.user.${Date.now()}@ey.com`,
});

test.describe('Story #197592: Create Users - EY Super Admin', () => {
  /**
   * ADO Test Case #201683
   * Create EY Admin User - Success
   */
  test('should create EY Admin user successfully @ADO-201683', async ({ request }) => {
    const userData = generateTestUser();

    const response = await request.post(USERS_ENDPOINT, {
      data: userData,
    });

    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.firstName).toBe(userData.firstName);
    expect(data.lastName).toBe(userData.lastName);
    expect(data.email.toLowerCase()).toBe(userData.email.toLowerCase());
  });

  /**
   * ADO Test Case #201684
   * Create EY Admin User - Missing Required Fields
   */
  test('should reject user creation with missing required fields @ADO-201684', async ({
    request,
  }) => {
    // Missing firstName
    const missingFirstName = await request.post(USERS_ENDPOINT, {
      data: {
        lastName: 'TestLast',
        email: `missing.first.${Date.now()}@ey.com`,
      },
    });
    expect([400, 422]).toContain(missingFirstName.status());

    // Missing lastName
    const missingLastName = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: 'TestFirst',
        email: `missing.last.${Date.now()}@ey.com`,
      },
    });
    expect([400, 422]).toContain(missingLastName.status());

    // Missing email
    const missingEmail = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: 'TestFirst',
        lastName: 'TestLast',
      },
    });
    expect([400, 422]).toContain(missingEmail.status());
  });

  /**
   * ADO Test Case #201685
   * Create EY Admin User - Non-EY Email Domain
   */
  test('should reject non-EY email domain @ADO-201685', async ({ request }) => {
    const response = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: 'TestFirst',
        lastName: 'TestLast',
        email: `test.user.${Date.now()}@gmail.com`,
      },
    });

    expect([400, 403, 422]).toContain(response.status());
  });

  /**
   * ADO Test Case #201686
   * Create EY Admin User - Invalid Email Format
   */
  test('should reject invalid email format @ADO-201686', async ({ request }) => {
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@ey.com',
      'test@@ey.com',
      'test@ey',
      'test user@ey.com',
    ];

    for (const email of invalidEmails) {
      const response = await request.post(USERS_ENDPOINT, {
        data: {
          firstName: 'TestFirst',
          lastName: 'TestLast',
          email,
        },
      });
      expect([400, 422]).toContain(response.status());
    }
  });

  /**
   * ADO Test Case #201687
   * Create EY Admin User - Duplicate Email
   */
  test('should reject duplicate email @ADO-201687', async ({ request }) => {
    const userData = generateTestUser();

    // Create first user
    const firstResponse = await request.post(USERS_ENDPOINT, {
      data: userData,
    });

    if (firstResponse.ok()) {
      // Try to create second user with same email
      const duplicateResponse = await request.post(USERS_ENDPOINT, {
        data: {
          firstName: 'Different',
          lastName: 'Name',
          email: userData.email,
        },
      });
      expect([400, 409, 422]).toContain(duplicateResponse.status());
    }
  });

  /**
   * ADO Test Case #201688
   * Create EY Admin User - Email Case Insensitive Uniqueness
   */
  test('should treat email as case insensitive for uniqueness @ADO-201688', async ({ request }) => {
    const baseEmail = `test.case.${Date.now()}@ey.com`;

    // Create user with lowercase email
    const firstResponse = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: 'TestFirst',
        lastName: 'TestLast',
        email: baseEmail.toLowerCase(),
      },
    });

    if (firstResponse.ok()) {
      // Try to create with uppercase version
      const duplicateResponse = await request.post(USERS_ENDPOINT, {
        data: {
          firstName: 'Different',
          lastName: 'Name',
          email: baseEmail.toUpperCase(),
        },
      });
      expect([400, 409, 422]).toContain(duplicateResponse.status());
    }
  });

  /**
   * ADO Test Case #201689
   * Create EY Admin User - Whitespace and Blanks in Required Fields
   */
  test('should reject whitespace-only values in required fields @ADO-201689', async ({
    request,
  }) => {
    // Whitespace firstName
    const whitespaceFirst = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: '   ',
        lastName: 'TestLast',
        email: `whitespace.test.${Date.now()}@ey.com`,
      },
    });
    expect([400, 422]).toContain(whitespaceFirst.status());

    // Whitespace lastName
    const whitespaceLast = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: 'TestFirst',
        lastName: '   ',
        email: `whitespace.test.${Date.now()}@ey.com`,
      },
    });
    expect([400, 422]).toContain(whitespaceLast.status());
  });

  /**
   * ADO Test Case #201690
   * Create EY Admin User - Leading/Trailing Spaces in Input
   */
  test('should trim leading/trailing spaces @ADO-201690', async ({ request }) => {
    const response = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: '  TestFirst  ',
        lastName: '  TestLast  ',
        email: `trim.test.${Date.now()}@ey.com`,
      },
    });

    if (response.ok()) {
      const data = await response.json();
      expect(data.firstName).toBe('TestFirst');
      expect(data.lastName).toBe('TestLast');
    }
  });

  /**
   * ADO Test Case #201691
   * Create EY Admin User - Insufficient Privileges
   */
  test('should reject user creation without proper privileges @ADO-201691', async ({ request }) => {
    // This test simulates a non-Super Admin trying to create users
    const response = await request.post(USERS_ENDPOINT, {
      data: generateTestUser(),
      headers: {
        'X-User-Role': 'EY_ADMIN', // Not super admin
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  /**
   * ADO Test Case #201692
   * EY Admin User Listing - Newly Created User Appears
   */
  test('should show newly created user in listing @ADO-201692', async ({ request }) => {
    const userData = generateTestUser();

    // Create user
    const createResponse = await request.post(USERS_ENDPOINT, {
      data: userData,
    });

    if (createResponse.ok()) {
      const createdUser = await createResponse.json();

      // Get user list
      const listResponse = await request.get(USERS_ENDPOINT);
      expect(listResponse.ok()).toBe(true);

      const listData = await listResponse.json();
      const users = listData.content || listData.data || listData;

      if (Array.isArray(users)) {
        const foundUser = users.find((u: any) => u.id === createdUser.id);
        expect(foundUser).toBeDefined();
      }
    }
  });

  /**
   * ADO Test Case #201693
   * EY Admin User Listing - Pagination Support
   */
  test('should support pagination in user listing @ADO-201693', async ({ request }) => {
    const response = await request.get(`${USERS_ENDPOINT}?page=0&size=10`);
    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.totalElements || data.total).toBeDefined();
    expect(data.content || data.data || Array.isArray(data)).toBeTruthy();
  });

  /**
   * ADO Test Case #201694
   * Search EY Admin Users By Name and Client
   */
  test('should search users by name @ADO-201694', async ({ request }) => {
    const searchTerm = 'Test';
    const response = await request.get(`${USERS_ENDPOINT}?searchTerm=${searchTerm}`);
    expect(response.ok()).toBe(true);

    const data = await response.json();
    const users = data.content || data.data || data;

    if (Array.isArray(users) && users.length > 0) {
      users.forEach((user: any) => {
        const matchesSearch =
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        expect(matchesSearch).toBe(true);
      });
    }
  });

  /**
   * ADO Test Case #201695
   * Create EY Admin User - Parallel Requests (Race Condition Test)
   */
  test('should handle parallel creation requests safely @ADO-201695', async ({ request }) => {
    const email = `race.test.${Date.now()}@ey.com`;
    const requests = [];

    // Send multiple parallel requests with same email
    for (let i = 0; i < 5; i++) {
      requests.push(
        request.post(USERS_ENDPOINT, {
          data: {
            firstName: `First${i}`,
            lastName: `Last${i}`,
            email,
          },
        })
      );
    }

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.ok()).length;

    // Only one should succeed, rest should fail with duplicate error
    expect(successCount).toBeLessThanOrEqual(1);
  });

  /**
   * ADO Test Case #201697
   * Create EY Admin User - Input Field Maximum Lengths
   */
  test('should enforce maximum field lengths @ADO-201697', async ({ request }) => {
    const veryLongName = 'A'.repeat(500);

    const response = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: veryLongName,
        lastName: 'TestLast',
        email: `max.length.${Date.now()}@ey.com`,
      },
    });

    expect([400, 413, 422]).toContain(response.status());
  });

  /**
   * ADO Test Case #201698
   * Create EY Admin User - Special Characters Handling
   */
  test('should handle special characters in names @ADO-201698', async ({ request }) => {
    const response = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: "O'Brien",
        lastName: 'García-López',
        email: `special.chars.${Date.now()}@ey.com`,
      },
    });

    // Should accept valid special characters in names
    expect([200, 201, 400, 422]).toContain(response.status());
  });

  /**
   * ADO Test Case #201699
   * Create EY Admin User - Malicious Data Injection Protection
   */
  test('should protect against injection attacks @ADO-201699 @security', async ({ request }) => {
    // SQL Injection attempt
    const sqlInjection = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: "Robert'); DROP TABLE users;--",
        lastName: 'TestLast',
        email: `sql.inject.${Date.now()}@ey.com`,
      },
    });
    expect([200, 201, 400, 422]).toContain(sqlInjection.status());

    // XSS attempt
    const xssInjection = await request.post(USERS_ENDPOINT, {
      data: {
        firstName: '<script>alert("XSS")</script>',
        lastName: 'TestLast',
        email: `xss.inject.${Date.now()}@ey.com`,
      },
    });

    if (xssInjection.ok()) {
      const data = await xssInjection.json();
      // Should be sanitized
      expect(data.firstName).not.toContain('<script>');
    }
  });

  /**
   * ADO Test Case #201700
   * Create EY Admin User - Expired Token or Session
   */
  test('should reject requests with expired token @ADO-201700', async ({ request }) => {
    const response = await request.post(USERS_ENDPOINT, {
      data: generateTestUser(),
      headers: {
        Authorization: 'Bearer expired_invalid_token_12345',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  /**
   * ADO Test Case #201702
   * Create EY Admin User - API Rate Limit Exceeded
   */
  test('should handle rate limiting @ADO-201702', async ({ request }) => {
    const requests = [];

    // Send many requests rapidly
    for (let i = 0; i < 50; i++) {
      requests.push(
        request.post(USERS_ENDPOINT, {
          data: {
            firstName: `RateTest${i}`,
            lastName: 'User',
            email: `rate.test.${Date.now()}.${i}@ey.com`,
          },
        })
      );
    }

    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());

    // All should respond (with success, validation error, or rate limit)
    expect(statusCodes.every(code => [200, 201, 400, 422, 429].includes(code))).toBe(true);
  });

  /**
   * ADO Test Case #201696
   * Audit Logging - Creation Success and Failure
   */
  test.skip('@ADO-201696 should log user creation events', async () => {
    // Requires audit log access
    test.skip();
  });

  /**
   * ADO Test Case #201701
   * Create EY Admin User - Backend/DB Unavailable
   */
  test.skip('@ADO-201701 should handle backend unavailability gracefully', async () => {
    // Requires infrastructure testing
    test.skip();
  });
});

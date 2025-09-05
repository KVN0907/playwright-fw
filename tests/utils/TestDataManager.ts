import * as fs from 'fs-extra';
import * as path from 'path';

export interface TestUser {
  username: string;
  password: string;
  email: string;
  role: string;
}

export interface TestData {
  users: {
    superAdmin: TestUser;
    admin: TestUser;
    user: TestUser;
  };
  organizations: {
    testOrg: {
      name: string;
      description: string;
      domain: string;
    };
  };
  apiEndpoints: Record<string, string>;
}

export class TestDataManager {
  private static instance: TestDataManager;
  private testData!: TestData;
  private environment: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'dev';
    this.loadTestData();
  }

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  private loadTestData(): void {
    const dataPath = path.join(__dirname, '..', 'data', `${this.environment}.json`);
    try {
      this.testData = fs.readJsonSync(dataPath);
    } catch (error) {
      throw new Error(`Failed to load test data from ${dataPath}: ${error}`);
    }
  }

  getUser(userType: keyof TestData['users']): TestUser {
    return this.testData.users[userType];
  }

  getOrganization(orgType: keyof TestData['organizations']) {
    return this.testData.organizations[orgType];
  }

  getApiEndpoint(endpoint: string): string {
    return this.testData.apiEndpoints[endpoint];
  }

  // Generate dynamic test data
  generateRandomUser(): TestUser {
    const timestamp = Date.now();
    return {
      username: `testuser_${timestamp}`,
      password: 'Test@123',
      email: `testuser_${timestamp}@test.com`,
      role: 'user'
    };
  }

  generateRandomOrganization() {
    const timestamp = Date.now();
    return {
      name: `TestOrg_${timestamp}`,
      description: `Test Organization created at ${new Date().toISOString()}`,
      domain: `testorg${timestamp}.com`
    };
  }
}

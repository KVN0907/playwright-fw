/**
 * @fileoverview User Builder
 * @description Builder pattern for creating user test data
 * @version 1.0
 */

import { BaseBuilder, TestDataFactory } from '../TestDataFactory';
import { Utils } from '../../Utils';

/* ===== USER INTERFACES ===== */

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
  organization?: string;
  department?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt?: Date;
}

/* ===== USER BUILDER ===== */

/**
 * @class UserBuilder
 * @description Fluent builder for creating user test data
 */
export class UserBuilder extends BaseBuilder<User> {
  private constructor() {
    super();
    // Set defaults
    this.data = {
      firstName: TestDataFactory.generate('name'),
      lastName: TestDataFactory.generate('name'),
      email: Utils.String.generateEmail(),
      password: 'Test@123456',
      role: 'user',
      permissions: ['read'],
      status: 'active',
      createdAt: new Date(),
    };
  }

  /**
   * Create new user builder
   * @returns UserBuilder instance
   */
  static create(): UserBuilder {
    return new UserBuilder();
  }

  /**
   * Set user ID
   * @param id - User ID
   * @returns Builder instance
   */
  withId(id: string): this {
    this.data.id = id;
    return this;
  }

  /**
   * Set user name
   * @param firstName - First name
   * @param lastName - Last name
   * @returns Builder instance
   */
  withName(firstName: string, lastName: string): this {
    this.data.firstName = firstName;
    this.data.lastName = lastName;
    return this;
  }

  /**
   * Set user email
   * @param email - Email address
   * @returns Builder instance
   */
  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  /**
   * Set user password
   * @param password - Password
   * @returns Builder instance
   */
  withPassword(password: string): this {
    this.data.password = password;
    return this;
  }

  /**
   * Set user role
   * @param role - User role
   * @returns Builder instance
   */
  withRole(role: 'admin' | 'user' | 'viewer' | 'manager' | string): this {
    this.data.role = role;

    // Auto-assign permissions based on role
    switch (role) {
      case 'admin':
        this.data.permissions = ['read', 'write', 'delete', 'admin'];
        break;
      case 'manager':
        this.data.permissions = ['read', 'write', 'manage'];
        break;
      case 'user':
        this.data.permissions = ['read', 'write'];
        break;
      case 'viewer':
        this.data.permissions = ['read'];
        break;
    }

    return this;
  }

  /**
   * Set user permissions
   * @param permissions - Array of permissions
   * @returns Builder instance
   */
  withPermissions(permissions: string[]): this {
    this.data.permissions = permissions;
    return this;
  }

  /**
   * Add permission to user
   * @param permission - Permission to add
   * @returns Builder instance
   */
  addPermission(permission: string): this {
    if (!this.data.permissions) {
      this.data.permissions = [];
    }
    if (!this.data.permissions.includes(permission)) {
      this.data.permissions.push(permission);
    }
    return this;
  }

  /**
   * Set user organization
   * @param organization - Organization name
   * @returns Builder instance
   */
  withOrganization(organization: string): this {
    this.data.organization = organization;
    return this;
  }

  /**
   * Set user department
   * @param department - Department name
   * @returns Builder instance
   */
  withDepartment(department: string): this {
    this.data.department = department;
    return this;
  }

  /**
   * Set user phone
   * @param phone - Phone number
   * @returns Builder instance
   */
  withPhone(phone: string): this {
    this.data.phone = phone;
    return this;
  }

  /**
   * Set user status
   * @param status - User status
   * @returns Builder instance
   */
  withStatus(status: 'active' | 'inactive' | 'pending'): this {
    this.data.status = status;
    return this;
  }

  /**
   * Set user as admin
   * @returns Builder instance
   */
  asAdmin(): this {
    return this.withRole('admin');
  }

  /**
   * Set user as manager
   * @returns Builder instance
   */
  asManager(): this {
    return this.withRole('manager');
  }

  /**
   * Set user as viewer
   * @returns Builder instance
   */
  asViewer(): this {
    return this.withRole('viewer');
  }

  /**
   * Set user as inactive
   * @returns Builder instance
   */
  inactive(): this {
    return this.withStatus('inactive');
  }

  /**
   * Set user as pending
   * @returns Builder instance
   */
  pending(): this {
    return this.withStatus('pending');
  }

  /**
   * Configure user for specific environment
   * @param environment - Environment name
   * @returns Builder instance
   */
  inEnvironment(environment: string): this {
    const emailDomain =
      {
        dev: 'dev.test.com',
        qa: 'qa.test.com',
        staging: 'staging.test.com',
        prod: 'test.com',
      }[environment] || 'test.com';

    if (!this.data.email?.includes('@')) {
      const username = Utils.String.generate(8, 'ALPHA').toLowerCase();
      this.data.email = `${username}@${emailDomain}`;
    }

    return this;
  }

  /**
   * Build the user object
   * @returns Complete user object
   */
  build(): User {
    // Validate required fields
    if (!this.data.firstName || !this.data.lastName || !this.data.email) {
      throw new Error('User must have firstName, lastName, and email');
    }

    return {
      id: this.data.id || TestDataFactory.generateTestId('user'),
      firstName: this.data.firstName,
      lastName: this.data.lastName,
      email: this.data.email,
      password: this.data.password || 'Test@123456',
      role: this.data.role || 'user',
      permissions: this.data.permissions || ['read'],
      organization: this.data.organization,
      department: this.data.department,
      phone: this.data.phone,
      status: this.data.status || 'active',
      createdAt: this.data.createdAt || new Date(),
    };
  }

  /**
   * Build multiple users
   * @param count - Number of users to create
   * @returns Array of users
   */
  buildMultiple(count: number): User[] {
    return TestDataFactory.createMultiple(count, () => {
      const user = this.build();
      // Reset email for next user
      this.data.email = Utils.String.generateEmail();
      return user;
    });
  }
}

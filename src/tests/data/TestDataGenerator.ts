/**
 * Test Data Generator using Faker
 * Generates realistic test data at runtime using @faker-js/faker.
 */

import { faker } from '@faker-js/faker';

// User Data
export interface GeneratedUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  jobTitle: string;
}

export const generateUser = (options?: { role?: string; emailDomain?: string }): GeneratedUser => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const domain = options?.emailDomain || 'testcompany.com';

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName, provider: domain }),
    username: faker.internet.username({ firstName, lastName }),
    phone: faker.phone.number(),
    role: options?.role || faker.helpers.arrayElement(['admin', 'user', 'manager']),
    jobTitle: faker.person.jobTitle(),
  };
};

// Client/Company Data
export interface GeneratedClient {
  name: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  industry: string;
}

export const generateClientName = (): string => {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return faker.helpers.arrayElement([
    faker.company.name(),
    `${faker.person.lastName()} & ${faker.person.lastName()} ${faker.company.buzzNoun()}`,
    `${faker.location.city()} ${faker.company.buzzNoun()} Corp`,
    `${capitalize(faker.word.adjective())} ${faker.company.buzzNoun()} Ltd`,
    `${faker.person.lastName()} ${faker.company.buzzNoun()} Group`,
  ]);
};

export const generateClient = (): GeneratedClient => ({
  name: generateClientName(),
  contactName: faker.person.fullName(),
  contactEmail: faker.internet.email(),
  phone: faker.phone.number(),
  industry: faker.company.buzzPhrase(),
});

// Location Data
export interface GeneratedLocation {
  city: string;
  country: string;
  countryCode: string;
  state: string;
  street: string;
  zipCode: string;
}

export const generateLocation = (): GeneratedLocation => ({
  city: faker.location.city(),
  country: faker.location.country(),
  countryCode: faker.location.countryCode(),
  state: faker.location.state(),
  street: faker.location.streetAddress(),
  zipCode: faker.location.zipCode(),
});

export const generateCity = () => ({
  name: faker.location.city(),
  country: faker.location.country(),
  countryCode: faker.location.countryCode(),
});

// Organization Data
export interface GeneratedOrganization {
  name: string;
  description: string;
  domain: string;
  type: string;
}

export const generateOrganization = (): GeneratedOrganization => {
  const name = faker.company.name();
  return {
    name,
    description: faker.company.catchPhrase(),
    domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
    type: faker.helpers.arrayElement(['enterprise', 'startup', 'agency']),
  };
};

// Validation Test Data
export const generateInvalidEmails = (): string[] => [
  'invalid-email',
  'missing@domain',
  '@nodomain.com',
  'double@@at.com',
];

export const generateBoundaryStrings = (maxLength: number) => ({
  valid: faker.string.alphanumeric(maxLength),
  tooLong: faker.string.alphanumeric(maxLength + 1),
  empty: '',
  whitespace: '   ',
});

export const generateSpecialCharacters = (): string[] => [
  `<script>alert('xss')</script>`,
  `'; DROP TABLE users; --`,
  `Unicode: 日本語 🚀`,
  `!@#$%^&*()`,
];

// Default Export
const TestDataGenerator = {
  user: generateUser,
  users: (count: number) => Array.from({ length: count }, () => generateUser()),
  clientName: generateClientName,
  client: generateClient,
  location: generateLocation,
  city: generateCity,
  cities: (count: number) => Array.from({ length: count }, () => generateCity()),
  organization: generateOrganization,
  invalidEmails: generateInvalidEmails,
  boundaryStrings: generateBoundaryStrings,
  specialCharacters: generateSpecialCharacters,
  faker,
};

export default TestDataGenerator;

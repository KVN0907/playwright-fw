/**
 * @fileoverview Mobile Testing Profile
 * @description Configuration profile for mobile device testing
 * @version 1.0
 */

import { devices } from '@playwright/test';
import { ProfileConfig } from './ProfileManager';

export const profile: ProfileConfig = {
  name: 'mobile',
  description: 'Mobile device testing with touch events and responsive viewports',
  enabled: true,
  overrides: {
    testDir: './src/tests',
    timeout: 45000, // Mobile tests may be slower
    retries: 2,
    workers: 2, // Fewer workers for mobile

    use: {
      actionTimeout: 15000,
      navigationTimeout: 30000,
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      trace: 'on-first-retry',

      // Mobile-specific settings
      hasTouch: true,
      isMobile: true,

      // Network throttling
      launchOptions: {
        slowMo: 100, // Simulate slower devices
      },
    },

    projects: [
      {
        name: 'iPhone 13',
        use: {
          ...devices['iPhone 13'],
          // Custom viewport for testing
          viewport: { width: 390, height: 844 },
        },
      },
      {
        name: 'iPhone 13 Pro Max',
        use: {
          ...devices['iPhone 13 Pro Max'],
          viewport: { width: 428, height: 926 },
        },
      },
      {
        name: 'Pixel 5',
        use: {
          ...devices['Pixel 5'],
          viewport: { width: 393, height: 851 },
        },
      },
      {
        name: 'Samsung Galaxy S21',
        use: {
          ...devices['Galaxy S9+'],
          viewport: { width: 360, height: 800 },
          userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        },
      },
      {
        name: 'iPad Pro',
        use: {
          ...devices['iPad Pro'],
          viewport: { width: 1024, height: 1366 },
        },
      },
    ],
  },
};

export default profile;

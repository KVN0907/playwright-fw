/**
 * @fileoverview Performance Testing Profile
 * @description Configuration profile for performance and load testing
 * @version 1.0
 */

import { ProfileConfig } from './ProfileManager';

export const profile: ProfileConfig = {
  name: 'performance',
  description: 'Performance testing with metrics collection and analysis',
  enabled: true,
  overrides: {
    testDir: './src/tests',
    testMatch: ['**/*perf*.spec.ts', '**/*performance*.spec.ts'],
    timeout: 120000, // Longer timeout for performance tests
    retries: 0, // No retries for accurate metrics
    workers: 1, // Sequential for accurate measurements

    use: {
      actionTimeout: 30000,
      navigationTimeout: 60000,
      screenshot: 'only-on-failure',
      video: 'off', // Disable video to reduce overhead
      trace: 'off', // Disable trace for accurate performance

      // Performance-specific settings
      launchOptions: {
        args: [
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--enable-features=NetworkService,NetworkServiceInProcess',
        ],
      },
    },

    projects: [
      {
        name: 'chromium-perf',
        use: {
          channel: 'chrome',
          viewport: { width: 1920, height: 1080 },

          // Performance monitoring
          launchOptions: {
            args: [
              '--enable-precise-memory-info',
              '--disable-background-timer-throttling',
              '--disable-renderer-backgrounding',
              '--disable-backgrounding-occluded-windows',
            ],
          },
        },
      },
      {
        name: 'chromium-slow-network',
        use: {
          channel: 'chrome',
          viewport: { width: 1920, height: 1080 },

          // Simulate slow 3G
          contextOptions: {
            offline: false,
            // Custom network throttling can be added here
          },
        },
      },
    ],
  },
};

export default profile;

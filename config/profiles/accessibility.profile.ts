/**
 * @fileoverview Accessibility Testing Profile
 * @description Configuration profile for WCAG compliance testing
 * @version 1.0
 */

import { ProfileConfig } from './ProfileManager';

export const profile: ProfileConfig = {
  name: 'accessibility',
  description: 'Accessibility testing with WCAG compliance checks',
  enabled: true,
  overrides: {
    testDir: './src/tests',
    testMatch: ['**/*a11y*.spec.ts', '**/*accessibility*.spec.ts'],
    timeout: 60000, // A11y scans can take time
    retries: 1,
    workers: 1, // Sequential for accurate a11y reporting

    use: {
      actionTimeout: 10000,
      screenshot: 'on',
      video: 'on',
      trace: 'on',

      // A11y specific settings
      colorScheme: 'light', // Test both light
    },

    projects: [
      {
        name: 'chromium-a11y',
        use: {
          channel: 'chrome',
          viewport: { width: 1280, height: 720 },

          // Accessibility features
          launchOptions: {
            args: [
              '--force-prefers-reduced-motion',
              '--enable-features=OverlayScrollbar',
              '--force-color-profile=srgb',
            ],
          },
        },
      },
      {
        name: 'chromium-dark-a11y',
        use: {
          channel: 'chrome',
          viewport: { width: 1280, height: 720 },
          colorScheme: 'dark',

          launchOptions: {
            args: ['--force-prefers-reduced-motion', '--force-dark-mode'],
          },
        },
      },
      {
        name: 'firefox-a11y',
        use: {
          browserName: 'firefox',
          viewport: { width: 1280, height: 720 },
        },
      },
    ],
  },
};

export default profile;

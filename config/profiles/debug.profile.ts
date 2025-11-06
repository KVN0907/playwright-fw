/**
 * @fileoverview Debug Profile
 * @description Configuration profile for debugging tests
 * @version 1.0
 */

import { ProfileConfig } from './ProfileManager';

export const profile: ProfileConfig = {
  name: 'debug',
  description: 'Debug mode with headed browser and extended timeouts',
  enabled: true,
  overrides: {
    timeout: 0, // No timeout for debugging
    retries: 0, // No retries when debugging
    workers: 1, // Single worker for debugging

    use: {
      headless: false,
      screenshot: 'on',
      video: 'on',
      trace: 'on',

      // Debug settings
      actionTimeout: 0,
      navigationTimeout: 0,

      launchOptions: {
        devtools: true, // Open DevTools automatically
        slowMo: 500,
      },
    },

    projects: [
      {
        name: 'chromium-debug',
        use: {
          channel: 'chrome',
          viewport: { width: 1280, height: 720 },
        },
      },
    ],
  },
};

export default profile;

/**
 * @fileoverview ESLint Configuration (v9 Format)
 * @description Modern ESLint configuration with TypeScript support
 */

import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // General rules
      'no-console': 'off', // Using Log utility, allow console for setup/config files
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead

      // Code quality
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'warn',
      'no-prototype-builtins': 'error',
      'no-useless-escape': 'error',
      'no-empty-pattern': 'off', // Allow empty patterns in fixtures
      'no-undef': 'off', // TypeScript handles this

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },

  // JavaScript files configuration
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'prettier/prettier': 'error',
    },
  },

  // Test files - more lenient rules
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Prettier config (must be last to override other formatting rules)
  prettierConfig,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.nyc_output/**',
      '**/*.d.ts',
      'ui/client/build/**',
      'ui/client/node_modules/**',
    ],
  },
];

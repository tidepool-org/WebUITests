/**
 * THIS FILE WAS AUTO-GENERATED.
 * PLEASE DO NOT EDIT IT MANUALLY.
 * ===============================
 * IF YOU'RE COPYING THIS INTO AN ESLINT CONFIG, REMOVE THIS COMMENT BLOCK.
 */

import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import { rules as prettierConfigRules } from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = [
  // ESLint Recommended Rules
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  // Stylistic Plugin
  plugins.stylistic,
  // Import X Plugin
  plugins.importX,
  // Airbnb Base Recommended Config
  ...configs.base.recommended,
];

const nodeConfig = [
  // Node Plugin
  plugins.node,
  // Airbnb Node Recommended Config
  ...configs.node.recommended,
];

const typescriptConfig = [
  // TypeScript ESLint Plugin
  plugins.typescriptEslint,
  // Airbnb Base TypeScript Config
  ...configs.base.typescript,
];

const prettierConfig = [
  // Prettier Plugin
  {
    name: 'prettier/plugin/config',
    plugins: {
      prettier: prettierPlugin,
    },
  },
  // Prettier Config
  {
    name: 'prettier/config',
    rules: {
      ...prettierConfigRules,
      'prettier/prettier': 'error',
    },
  },
];

export default [
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  // Javascript Config
  ...jsConfig,
  // Node Config
  ...nodeConfig,
  // TypeScript Config
  ...typescriptConfig,
  // Prettier Config
  ...prettierConfig,
  // Custom rules for test automation
  {
    name: 'custom/test-automation-rules',
    rules: {
      // Disable no-await-in-loop for test automation where sequential UI interactions are necessary
      'no-await-in-loop': 'off',
      // Allow console.log/console.time in test automation for debugging and timing
      'no-console': 'off',
      // Allow for...of loops in test automation for cleaner iteration patterns
      'no-restricted-syntax': 'off',
      // Allow synchronous operations in test utilities and reporters
      'n/no-sync': 'off',
      // Allow Node.js features that may be newer than the specified version
      'n/no-unsupported-features/node-builtins': 'off',
      // Allow unused parameters in test fixtures (common pattern with Playwright fixtures)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      // Allow single exports in helper files (common pattern in test utilities)
      'import-x/prefer-default-export': 'off',
      // Allow class methods that don't use 'this' in page objects and helpers
      'class-methods-use-this': 'off',
      // Allow regex with unescaped characters in test utilities
      'no-useless-escape': 'off',
    },
  },
];

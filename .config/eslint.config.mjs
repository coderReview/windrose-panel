/*
 * Custom ESLint config using @stylistic/eslint-plugin (unified) instead of
 * the deprecated @stylistic/eslint-plugin-ts. Replicates @grafana/eslint-config
 * structure with the migration.
 *
 * See: https://eslint.style/guide/migration
 */

import { createRequire } from 'node:module';
import jsdoc from 'eslint-plugin-jsdoc';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

const require = createRequire(import.meta.url);
const baseConfig = require('@grafana/eslint-config/base.js');

// Map @stylistic/ts/* rules to @stylistic/* (unified plugin)
const rules = { ...baseConfig.rules };
if (rules['@stylistic/ts/type-annotation-spacing']) {
  rules['@stylistic/type-annotation-spacing'] = rules['@stylistic/ts/type-annotation-spacing'];
  delete rules['@stylistic/ts/type-annotation-spacing'];
}

export default [
  reactHooksPlugin.configs.flat['recommended-latest'],
  reactPlugin.configs.flat.recommended,
  prettierConfig,
  {
    name: '@grafana/eslint-config/flat',
    settings: baseConfig.settings,
    plugins: {
      jsdoc,
      '@typescript-eslint': tsPlugin,
      '@stylistic': stylistic,
    },
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: baseConfig.ecmaVersion,
      sourceType: baseConfig.sourceType,
      parserOptions: baseConfig.parserOptions,
    },
    rules,
  },
  {
    rules: {
      'react/prop-types': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'warn',
    },
  },
  {
    files: ['./tests/**/*'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];

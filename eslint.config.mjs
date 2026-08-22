import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { flatConfigs } from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextESLint from '@next/eslint-plugin-next';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  ...flatConfigs.recommended,
  ...tseslint.configs.recommended,
  ...nextESLint.configs['recommended', 'flat'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      'src-tauri/target/',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
];

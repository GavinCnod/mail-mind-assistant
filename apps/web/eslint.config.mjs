// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  nextPlugin.configs['recommended', 'flat'],
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      '**/*.config.js',
      '**/*.config.ts',
      'src-tauri/target/',
    ],
  }
);

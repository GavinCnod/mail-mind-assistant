import next from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@next/next': next,
    },
    rules: {
      ...next.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    ignores: ['node_modules/', '.next/', 'dist/', '**/*.config.js'],
  },
];
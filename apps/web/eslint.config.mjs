const next = require('@next/eslint-plugin-next');
const tseslint = require('typescript-eslint');

module.exports = [
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

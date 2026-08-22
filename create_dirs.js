#!/usr/bin/env node
// @ts-nocheck
const fs = require('fs');
const path = require('path');
const root = process.argv[2] || 'D:/AgnesRepo/mail-mind-assistant';

const dirs = [
  'apps/web/app/(marketing)',
  'apps/web/app/experience',
  'apps/web/app/privacy',
  'apps/web/app/api/demo/analyze',
  'apps/web/app/api/demo/digest',
  'apps/web/app/api/demo/dispose',
  'apps/web/lib/server',
  'apps/web/components',
  'apps/web/store',
  'apps/web/hooks',
  'apps/desktop/src/pages',
  'apps/desktop/src/components',
  'apps/desktop/src-tauri/src/commands',
  'apps/desktop/src-tauri/src/mail',
  'apps/desktop/src-tauri/src/llm',
  'apps/desktop/src-tauri/src/db',
  'apps/desktop/src-tauri/src/secrets',
  'apps/desktop/src-tauri/migrations',
  'packages/contracts/src',
  'packages/contracts/tests',
  'packages/i18n/src',
  'packages/ui/src/providers',
  'packages/ui/src/controls',
  'packages/ui/src/styles',
  'packages/fixtures',
  'packages/tsconfig',
  'docs',
  'scripts'
];

dirs.forEach(d => {
  const full = path.join(root, d);
  fs.mkdirSync(full, { recursive: true });
  console.log('Created:', d);
});

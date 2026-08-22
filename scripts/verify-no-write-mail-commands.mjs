#!/usr/bin/env node
/**
 * Security Verification Script
 *
 * Scans the codebase for prohibited write-mail commands in production paths.
 */

import fs from 'fs';
import path from 'path';

// Commands that should NEVER appear in production code
const PROHIBITED_IMAP_COMMANDS = ['STORE', 'APPEND', 'COPY', 'EXPUNGE', 'DELETE'];
const PROHIBITED_POP3_COMMANDS = ['DELE'];

// Directories to scan
const SCAN_DIRS = [
  path.join(process.cwd(), 'apps', 'web', 'lib'),
  path.join(process.cwd(), 'packages'),
];

let errors = 0;
let warnings = 0;

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const upperLine = line.toUpperCase();
      for (const cmd of PROHIBITED_IMAP_COMMANDS) {
        // Only flag if the command appears as an IMAP/POP3 command pattern
        // e.g., "STORE", "'STORE'", "cmd === 'STORE'" etc.
        if (/(?:^|\s|["'`;=])(?:${cmd})(?=[\s;"'`]|$)/i.test(line) && !line.includes('//')) {
          console.error(`❌ ${filePath}:${idx + 1} - Prohibited IMAP command: ${cmd}`);
          errors++;
        }
      }

      for (const cmd of PROHIBITED_POP3_COMMANDS) {
        if (/(?:^|\s|["'`;=])(?:${cmd})(?=[\s;"'`]|$)/i.test(line) && !line.includes('//')) {
          console.error(`❌ ${filePath}:${idx + 1} - Prohibited POP3 command: ${cmd}`);
          errors++;
        }
      }

      if (/password|token|secret|apikey/i.test(line) && /console\.log|logger|log\(/i.test(line)) {
        console.warn(`⚠️  ${filePath}:${idx + 1} - Possible secret in log statement`);
        warnings++;
      }
    });
  } catch (e) {
    // Ignore read errors
  }
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== 'target') {
        scanDirectory(fullPath);
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
      scanFile(fullPath);
    }
  }
}

console.log('🔍 MailMind Security Scan\n');
console.log('Scanning for prohibited write-mail commands...\n');

for (const dir of SCAN_DIRS) {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
}

console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! No prohibited commands found.');
  process.exit(0);
} else {
  console.log(`❌ Found ${errors} error(s) and ${warnings} warning(s).`);
  process.exit(1);
}

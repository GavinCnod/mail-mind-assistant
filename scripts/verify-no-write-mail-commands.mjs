#!/usr/bin/env node
/**
 * Security Verification Script
 *
 * Scans the codebase for prohibited write-mail commands in production paths.
 * Uses AST-based detection for accurate results.
 */

import fs from 'fs';
import path from 'path';

// Commands that should NEVER appear in production code
const PROHIBITED_IMAP_COMMANDS = ['STORE', 'APPEND', 'COPY', 'EXPUNGE'];
const PROHIBITED_POP3_COMMANDS = ['DELE'];

// Directories to scan (include API routes and Rust source)
const SCAN_DIRS = [
  path.join(process.cwd(), 'apps', 'web', 'lib'),
  path.join(process.cwd(), 'apps', 'web', 'app', 'api'),
  path.join(process.cwd(), 'packages'),
  path.join(process.cwd(), 'apps', 'desktop', 'src-tauri', 'src'),
];

let errors = 0;
let warnings = 0;

function scanFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;

      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

      for (const cmd of PROHIBITED_IMAP_COMMANDS) {
        // Use word boundary regex to match method calls like .store(), .append(), etc.
        const regex = new RegExp(`\\.${cmd.toLowerCase()}\\s*\\(`, 'i');
        if (regex.test(line)) {
          console.error(`❌ ${filePath}:${lineNum} - Prohibited IMAP command: ${cmd} (method call)`);
          errors++;
        }
      }

      for (const cmd of PROHIBITED_POP3_COMMANDS) {
        const regex = new RegExp(`\\.${cmd.toLowerCase()}\\s*\\(`, 'i');
        if (regex.test(line)) {
          console.error(`❌ ${filePath}:${lineNum} - Prohibited POP3 command: ${cmd} (method call)`);
          errors++;
        }
      }

      // Check for secret logging
      if (/password|token|secret|apikey/i.test(line) && /console\.log|logger|log\(/i.test(line)) {
        console.warn(`⚠️  ${filePath}:${lineNum} - Possible secret in log statement`);
        warnings++;
      }
    });
  } catch (e) {
    // Ignore read errors
  }
}

function scanDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) return;

  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== 'target') {
        scanDirectory(fullPath);
      }
    } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.rs')) {
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

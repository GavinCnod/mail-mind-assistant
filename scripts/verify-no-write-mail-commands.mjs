#!/usr/bin/env node
/**
 * Security Verification Script
 *
 * Scans the codebase for prohibited write-mail commands in production paths.
 * Detects method-style calls (e.g. .store(), .append(), .dele()) that would
 * indicate a mailbox mutation, and flags potential secret logging.
 *
 * This file is intentionally plain JavaScript (.mjs) so it can be executed
 * directly with `node` in CI without a TypeScript toolchain.
 */

import fs from 'fs';
import path from 'path';

// Commands that should NEVER appear in production code.
// NOTE: We intentionally do NOT include a bare "DELETE" here because IMAP has no
// DELETE message command (deletion is STORE \Deleted + EXPUNGE), and ".delete(" is
// an extremely common JS collection method that would produce false positives.
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

/**
 * @param {string} filePath
 */
function scanFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    // Ignore read errors
    return;
  }

  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#')) return;

    for (const cmd of PROHIBITED_IMAP_COMMANDS) {
      // Match method-style calls like .store(), .append(), .expunge()
      const regex = new RegExp(`\\.${cmd.toLowerCase()}\\s*\\(`, 'i');
      if (regex.test(line)) {
        console.error(`\u274c ${filePath}:${lineNum} - Prohibited IMAP command: ${cmd} (method call)`);
        errors++;
      }
    }

    for (const cmd of PROHIBITED_POP3_COMMANDS) {
      const regex = new RegExp(`\\.${cmd.toLowerCase()}\\s*\\(`, 'i');
      if (regex.test(line)) {
        console.error(`\u274c ${filePath}:${lineNum} - Prohibited POP3 command: ${cmd} (method call)`);
        errors++;
      }
    }

    // Check for secret logging
    if (/password|token|secret|apikey/i.test(line) && /console\.log|logger|\blog\(/i.test(line)) {
      console.warn(`\u26a0\ufe0f  ${filePath}:${lineNum} - Possible secret in log statement`);
      warnings++;
    }
  });
}

/**
 * @param {string} dirPath
 */
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== 'dist' && item !== 'target') {
        scanDirectory(fullPath);
      }
    } else if (/\.(ts|tsx|js|jsx|mjs|rs)$/.test(item)) {
      scanFile(fullPath);
    }
  }
}

console.log('\ud83d\udd0d MailMind Security Scan\n');
console.log('Scanning for prohibited write-mail commands...\n');

for (const dir of SCAN_DIRS) {
  scanDirectory(dir);
}

console.log('\n' + '='.repeat(50));
if (errors === 0) {
  if (warnings === 0) {
    console.log('\u2705 All checks passed! No prohibited commands found.');
  } else {
    console.log(`\u2705 No prohibited commands found (${warnings} warning(s)).`);
  }
  process.exit(0);
} else {
  console.log(`\u274c Found ${errors} error(s) and ${warnings} warning(s).`);
  process.exit(1);
}

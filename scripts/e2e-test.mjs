#!/usr/bin/env node
/**
 * End-to-End Test for MailMind Triager Agent (Simplified)
 * Tests the fixture-based demo mode without requiring real IMAP
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

// ── Test 1: Fixture files exist ────────────────────────────────────

console.log('\n📧 Test 1: Fixture Files');

const fixtureDir = resolve(root, 'packages/fixtures/src');
try {
  const fixtures = readdirSync(fixtureDir);
  const emlFiles = fixtures.filter(f => f.endsWith('.eml'));
  assert(emlFiles.length >= 6, `Found ${emlFiles.length} .eml fixture files`);
  assert(emlFiles.includes('sample-01-customer-inquiry.eml'), 'Has customer inquiry sample');
  assert(emlFiles.includes('injection-attempt.eml'), 'Has injection attempt sample');
} catch (e) {
  assert(false, `Fixture directory not found: ${e.message}`);
}

// ── Test 2: Server lib files exist ─────────────────────────────────

console.log('\n📦 Test 2: Server Libraries');

const serverLibs = [
  'apps/web/lib/server/imap-client.ts',
  'apps/web/lib/server/mime-parser.ts',
  'apps/web/lib/server/system-prompt.ts',
  'apps/web/lib/server/triage-agent.ts',
  'apps/web/lib/server/sanitize-html.ts',
  'apps/web/lib/server/ip-guard.ts',
  'apps/web/lib/server/llm-adapter.ts',
  'apps/web/lib/server/stream-sse.ts',
  'apps/web/lib/server/fixtures.ts',
];

for (const lib of serverLibs) {
  const path = resolve(root, lib);
  try {
    const content = readFileSync(path, 'utf8');
    assert(content.length > 100, `${lib.split('/').pop()} exists (${content.length} bytes)`);
  } catch {
    assert(false, `${lib} MISSING`);
  }
}

// ── Test 3: API routes exist ───────────────────────────────────────

console.log('\n🔌 Test 3: API Routes');

const apiRoutes = [
  'apps/web/app/api/demo/analyze/route.ts',
  'apps/web/app/api/demo/digest/route.ts',
  'apps/web/app/api/demo/dispose/route.ts',
];

for (const route of apiRoutes) {
  const path = resolve(root, route);
  try {
    const content = readFileSync(path, 'utf8');
    assert(content.includes('POST') || content.includes('export async function POST'), `${route.split('/').at(-2)}/route.ts has POST handler`);
  } catch {
    assert(false, `${route} MISSING`);
  }
}

// ── Test 4: Security scan passes ──────────────────────────────────

console.log('\n🛡️  Test 4: Security Scan');

try {
  const result = execSync('node scripts/verify-no-write-mail-commands.mjs', {
    cwd: root,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  assert(result.includes('All checks passed'), 'Security scan passed');
} catch (e) {
  assert(false, `Security scan failed: ${e.message}`);
}

// ── Test 5: Type check passes ─────────────────────────────────────

console.log('\n✅ Test 5: TypeScript Check');

try {
  execSync('pnpm typecheck', {
    cwd: root,
    stdio: 'pipe',
  });
  assert(true, 'TypeScript typecheck passed');
} catch (e) {
  const msg = e.stderr?.toString() || e.message;
  assert(false, `TypeScript check failed: ${msg.split('\n')[0]}`);
}

// ── Summary ─────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✅ All E2E tests passed!');
  process.exit(0);
}

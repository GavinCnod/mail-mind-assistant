/**
 * Tests for IP guard utilities
 *
 * Pure-IP checks (isSafeIP) run offline; host-based checks mock the `dns`
 * module so they are deterministic and CI-safe (no real DNS lookups).
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('dns', () => {
  const mockResolve4 = vi.fn(
    (host: string, _cb: (err: Error | null, addresses: string[]) => void) => {
      const table: Record<string, string[]> = {
        'imap.gmail.com': ['142.250.80.43'],
        'blocked.example': ['127.0.0.1'],
        'multi.example': ['8.8.8.8', '10.0.0.1'],
      };
      // Synchronous callback: no cross-module async race.
      // Unknown hosts fail closed with ENOTFOUND so isSafeHost rejects them.
      const addresses = table[host];
      if (addresses) {
        _cb(null, addresses);
      } else {
        _cb(new Error('ENOTFOUND ' + host), []);
      }
    },
  );
  return { resolve4: mockResolve4, default: { resolve4: mockResolve4 } };
});

import { isSafeIP, isSafeHost, validateHost } from '../../lib/server/ip-guard';

describe('isSafeIP', () => {
  it('should reject loopback addresses', () => {
    expect(isSafeIP('127.0.0.1')).toBe(false);
    expect(isSafeIP('127.1.1.1')).toBe(false);
  });

  it('should reject private IP ranges', () => {
    expect(isSafeIP('10.0.0.1')).toBe(false);
    expect(isSafeIP('172.16.0.1')).toBe(false);
    expect(isSafeIP('192.168.1.1')).toBe(false);
  });

  it('should reject link-local addresses', () => {
    expect(isSafeIP('169.254.169.254')).toBe(false);
    expect(isSafeIP('169.254.0.1')).toBe(false);
  });

  it('should allow public IPs', () => {
    expect(isSafeIP('8.8.8.8')).toBe(true);
    expect(isSafeIP('1.1.1.1')).toBe(true);
    expect(isSafeIP('93.184.216.34')).toBe(true);
  });
});

describe('isSafeHost', () => {
  it('should reject IP-literal loopback', async () => {
    await expect(isSafeHost('127.0.0.1')).resolves.toBe(false);
  });

  it('should resolve hostnames via DNS and allow public IPs', async () => {
    await expect(isSafeHost('imap.gmail.com')).resolves.toBe(true);
  });

  it('should reject hosts that resolve to private IPs', async () => {
    await expect(isSafeHost('blocked.example')).resolves.toBe(false);
  });

  it('should reject hosts where ANY resolved IP is private', async () => {
    await expect(isSafeHost('multi.example')).resolves.toBe(false);
  });

  it('should reject unresolvable hosts (fail closed)', async () => {
    await expect(isSafeHost('does-not-exist.example')).resolves.toBe(false);
  });
});

describe('validateHost', () => {
  it('should throw for private IPs', async () => {
    await expect(validateHost('127.0.0.1')).rejects.toThrow();
    await expect(validateHost('192.168.1.1')).rejects.toThrow();
  });

  it('should not throw for public hosts', async () => {
    await expect(validateHost('imap.gmail.com')).resolves.toBeUndefined();
  });
});

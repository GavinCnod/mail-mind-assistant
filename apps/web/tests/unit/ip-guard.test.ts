/**
 * Tests for IP guard utilities
 */
import { describe, it, expect } from 'vitest';
import { isSafeIP, isSafeHost, validateHost } from '../lib/server/ip-guard';

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
  it('should return false for localhost', async () => {
    const result = await isSafeHost('localhost');
    expect(result).toBe(false);
  });

  it('should return false for 127.0.0.1', async () => {
    const result = await isSafeHost('127.0.0.1');
    expect(result).toBe(false);
  });

  it('should return true for public hosts', async () => {
    const result = await isSafeHost('imap.gmail.com');
    expect(result).toBe(true);
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

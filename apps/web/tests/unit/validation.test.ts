/**
 * Tests for request validation
 */
import { describe, it, expect } from 'vitest';
import { analyzeRequestSchema } from '@mailmind/contracts';

describe('analyzeRequestSchema', () => {
  it('should validate a complete request', () => {
    const validRequest = {
      consent: {
        userAgreement: true,
        privacyPolicy: true,
        mailProcessingAuth: true,
        policyVersion: '1.0',
        consentedAt: '2026-01-01T00:00:00Z',
      },
      connection: {
        protocol: 'imap',
        host: 'imap.gmail.com',
        port: 993,
        encryption: 'ssl',
        username: 'test@example.com',
      },
      uiPreference: {
        locale: 'zh-CN',
        theme: 'dark',
      },
      maxEmails: 5,
    };

    const result = analyzeRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject request without consent', () => {
    const invalidRequest = {
      connection: {
        protocol: 'imap',
        host: 'imap.gmail.com',
        port: 993,
        encryption: 'ssl',
        username: 'test@example.com',
      },
    };

    const result = analyzeRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.consent).toBeDefined();
    }
  });

  it('should reject request with invalid protocol', () => {
    const invalidRequest = {
      consent: {
        userAgreement: true,
        privacyPolicy: true,
        mailProcessingAuth: true,
        policyVersion: '1.0',
        consentedAt: '2026-01-01T00:00:00Z',
      },
      connection: {
        protocol: 'invalid' as any,
        host: 'imap.gmail.com',
        port: 993,
        encryption: 'ssl',
        username: 'test@example.com',
      },
    };

    const result = analyzeRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject request with missing host', () => {
    const invalidRequest = {
      consent: {
        userAgreement: true,
        privacyPolicy: true,
        mailProcessingAuth: true,
        policyVersion: '1.0',
        consentedAt: '2026-01-01T00:00:00Z',
      },
      connection: {
        protocol: 'imap',
        host: '',
        port: 993,
        encryption: 'ssl',
        username: 'test@example.com',
      },
    };

    const result = analyzeRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should allow optional llm config', () => {
    const validRequest = {
      consent: {
        userAgreement: true,
        privacyPolicy: true,
        mailProcessingAuth: true,
        policyVersion: '1.0',
        consentedAt: '2026-01-01T00:00:00Z',
      },
      connection: {
        protocol: 'imap',
        host: 'imap.gmail.com',
        port: 993,
        encryption: 'ssl',
        username: 'test@example.com',
      },
      uiPreference: {
        locale: 'zh-CN',
        theme: 'dark',
      },
    };

    const result = analyzeRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });
});

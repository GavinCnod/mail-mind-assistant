/**
 * Tests for POP3 client validation
 */
import { describe, it, expect } from 'vitest';
import { Pop3Client } from '../../lib/server/pop3-client';

describe('Pop3Client', () => {
  it('should throw error for non-SSL connections', () => {
    const config = {
      protocol: 'pop3' as const,
      host: 'pop3.gmail.com',
      port: 995,
      encryption: 'starttls' as const,
      username: 'test@example.com',
    };

    expect(() => new Pop3Client(config, 'password')).toThrow(
      'POP3 only supports SSL encryption',
    );
  });

  it('should create client with SSL config', () => {
    const config = {
      protocol: 'pop3' as const,
      host: 'pop3.gmail.com',
      port: 995,
      encryption: 'ssl' as const,
      username: 'test@example.com',
    };

    const client = new Pop3Client(config, 'password');
    expect(client).toBeDefined();
  });
});

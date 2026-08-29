/**
 * Tests for IMAP client connection validation
 */
import { describe, it, expect, vi } from 'vitest';

// Mock imapflow
vi.mock('imapflow', () => {
  return {
    ImapFlow: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
      search: vi.fn().mockResolvedValue([]),
      fetchOne: vi.fn().mockResolvedValue(null),
      mailboxOpen: vi.fn().mockResolvedValue(undefined),
      mailboxClose: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      socket: null,
      secure: true,
    })),
  };
});

describe('ImapClient', () => {
  it('should create client with valid config', async () => {
    const { ImapClient } = await import('../lib/server/imap-client');
    const config = {
      protocol: 'imap' as const,
      host: 'imap.gmail.com',
      port: 993,
      encryption: 'ssl' as const,
      username: 'test@example.com',
    };

    const client = new ImapClient(config, 'password');
    expect(client).toBeDefined();
  });

  it('should connect and disconnect gracefully', async () => {
    const { ImapClient } = await import('../lib/server/imap-client');
    const config = {
      protocol: 'imap' as const,
      host: 'imap.gmail.com',
      port: 993,
      encryption: 'ssl' as const,
      username: 'test@example.com',
    };

    const client = new ImapClient(config, 'password');
    await client.connect();
    await client.disconnect();
  });

  it('should return empty array when no mailboxes exist', async () => {
    const { ImapClient } = await import('../lib/server/imap-client');
    const config = {
      protocol: 'imap' as const,
      host: 'imap.gmail.com',
      port: 993,
      encryption: 'ssl' as const,
      username: 'test@example.com',
    };

    const client = new ImapClient(config, 'password');
    const mailboxes = await client.listMailboxes();
    expect(Array.isArray(mailboxes)).toBe(true);
    expect(mailboxes.length).toBe(0);
  });
});

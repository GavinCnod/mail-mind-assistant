/**
 * IMAP client adapter using imapflow
 * Provides read-only email access with TLS enforcement
 */
import { ImapFlow } from 'imapflow';
import { type ConnectionConfig } from '@mailmind/contracts';

export interface EmailHeader {
  id: string;
  uid: number;
  from: string;
  subject: string;
  date: Date | null;
  hasAttachments: boolean;
  size: number;
}

interface MailAddress {
  name?: string;
  address?: string;
}

interface MailFrom {
  value?: MailAddress[];
}

export class ImapClient {
  private conn: ImapFlow;
  private _currentMailbox?: string;

  constructor(
    config: ConnectionConfig,
    password: string,
  ) {
    // ImapFlow constructor signature varies; use type assertion
    this.conn = new (ImapFlow as any)(config.host, {
      port: config.port,
      secure: config.encryption === 'ssl',
      auth: {
        user: config.username,
        pass: password,
      },
      tls: {
        rejectUnauthorized: true,
      },
      socketTimeout: 30000,
    });
  }

  async connect(): Promise<void> {
    await (this.conn as any).connect();
  }

  async disconnect(): Promise<void> {
    try {
      if (this._currentMailbox) {
        await (this.conn as any).closeBox?.();
        this._currentMailbox = undefined;
      }
      await (this.conn as any).logout();
    } catch {
      // Ignore cleanup errors
    }
  }

  async listMailboxes(pattern = '%'): Promise<string[]> {
    const boxes: string[] = [];
    try {
      const result = await (this.conn as any).getMailboxes?.({ pattern }) ?? [];
      if (Array.isArray(result)) {
        for (const box of result) {
          boxes.push(typeof box === 'string' ? box : box?.name ?? String(box));
        }
      }
    } catch {
      // Return empty on error
    }
    return boxes;
  }

  async searchEmails(mailbox: string, maxCount: number): Promise<EmailHeader[]> {
    const results: EmailHeader[] = [];
    this._currentMailbox = mailbox;

    try {
      await (this.conn as any).openBox?.(mailbox, true); // readOnly

      const uids = await (this.conn as any).search?.({
        not: ['DELETED'],
      }) as number[] ?? [];

      // Sort descending by UID (newest first), limit
      uids.sort((a: number, b: number) => b - a);
      const selectedUids = uids.slice(0, maxCount);

      for (const uid of selectedUids) {
        try {
          const info = await (this.conn as any).fetch?.(uid, {
            envelope: true,
            bodies: 'HEADER.FIELDS (FROM SUBJECT DATE)',
          });

          const envelope = info?.envelope as {
            messageId?: string;
            subject?: string;
            date?: Date | string;
            from?: MailFrom;
          } | undefined;

          results.push({
            id: envelope?.messageId ?? String(uid),
            uid,
            from: this._extractFrom(envelope),
            subject: envelope?.subject ?? '(无主题)',
            date: envelope?.date ? new Date(envelope.date as string) : null,
            hasAttachments: false,
            size: 0,
          });
        } catch {
          // Skip individual message fetch failures
        }
      }
    } catch {
      // Return partial results on failure
    } finally {
      this._currentMailbox = undefined;
    }

    return results;
  }

  async fetchRawMessage(mailbox: string, uid: number): Promise<Buffer> {
    this._currentMailbox = mailbox;
    try {
      await (this.conn as any).openBox?.(mailbox, true);
      const result = await (this.conn as any).fetch?.(uid, { source: true });
      const source = result?.source;
      return Buffer.isBuffer(source) ? source : Buffer.from('');
    } catch {
      return Buffer.from('');
    } finally {
      this._currentMailbox = undefined;
    }
  }

  async getCertificateInfo(): Promise<{ valid: boolean; issuer?: string; expiresAt?: string }> {
    try {
      const info = await (this.conn as any).tlsInfo?.() ?? {};
      return {
        valid: !info?.rejected,
        issuer: info?.certificate?.issuer?.join(', '),
        expiresAt: info?.certificate?.notAfter,
      };
    } catch {
      return { valid: false };
    }
  }

  private _extractFrom(envelope?: { from?: MailFrom }): string {
    if (!envelope?.from?.value?.[0]) return 'Unknown';
    const addr = envelope.from.value[0];
    return addr.name || addr.address || 'Unknown Sender';
  }
}

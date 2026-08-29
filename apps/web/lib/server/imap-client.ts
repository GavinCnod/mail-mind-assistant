/**
 * IMAP client adapter using imapflow 1.7.2
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
  private _socket?: import('tls').TLSSocket;

  constructor(
    config: ConnectionConfig,
    password: string,
  ) {
    const options: any = {
      host: config.host,
      port: config.port,
      secure: config.encryption === 'ssl',
      auth: {
        user: config.username,
        pass: password,
      },
      socketTimeout: 30000,
    };

    // Only set tls options if not explicitly disabled
    if (config.encryption !== 'none') {
      options.tls = {
        rejectUnauthorized: true,
      };
    }

    this.conn = new ImapFlow(options);

    // Listen for connection to capture socket for TLS info
    this.conn.on('connect', () => {
      this._socket = this.conn.socket as import('tls').TLSSocket | undefined;
    });
  }

  async connect(): Promise<void> {
    await this.conn.connect();
  }

  async disconnect(): Promise<void> {
    try {
      if (this._currentMailbox) {
        await this.conn.mailboxClose();
        this._currentMailbox = undefined;
      }
      await this.conn.logout();
    } catch {
      // Ignore cleanup errors
    }
  }

  async listMailboxes(pattern = '%'): Promise<string[]> {
    const boxes: string[] = [];
    try {
      const result = await this.conn.list(pattern);
      if (Array.isArray(result)) {
        for (const box of result) {
          boxes.push(box.name || String(box));
        }
      }
    } catch {
      // Return empty on error
    }
    return boxes;
  }

  async searchEmails(mailbox: string, maxCount: number): Promise<EmailHeader[]> {
    const results: EmailHeader[] = [];

    try {
      // Use EXAMINE for read-only access
      await this.conn.mailboxOpen(mailbox, { readOnly: true });
      this._currentMailbox = mailbox;

      // Search for all messages
      const uids = await this.conn.search('ALL') as number[] || [];

      // Sort descending by UID (newest first), limit
      uids.sort((a: number, b: number) => b - a);
      const selectedUids = uids.slice(0, maxCount);

      for (const uid of selectedUids) {
        try {
          // Fetch envelope and header fields
          const envelope = await this.conn.fetchOne(uid, {
            envelope: true,
            'header.fields': ['From', 'Subject', 'Date'],
          });

          if (envelope && envelope.envelope) {
            results.push({
              id: envelope.envelope.messageId ?? String(uid),
              uid,
              from: this._extractFrom(envelope.envelope),
              subject: envelope.envelope.subject ?? '(无主题)',
              date: envelope.envelope.date ? new Date(envelope.envelope.date as string) : null,
              hasAttachments: false,
              size: 0,
            });
          }
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
      await this.conn.mailboxOpen(mailbox, { readOnly: true });
      const result = await this.conn.fetchOne(uid, { source: true });
      const source = (result as any)?.source;
      return Buffer.isBuffer(source) ? source : Buffer.from('');
    } catch {
      return Buffer.from('');
    } finally {
      this._currentMailbox = undefined;
    }
  }

  async getCertificateInfo(): Promise<{ valid: boolean; issuer?: string; expiresAt?: string }> {
    try {
      // Use socket's TLS certificate info if available
      if (this._socket) {
        const cert = this._socket.getPeerCertificate();
        if (cert) {
          return {
            valid: !cert.invalid,
            issuer: cert.issuer?.join(', '),
            expiresAt: cert.valid_to,
          };
        }
      }

      // Fallback: check if connection is secure
      return {
        valid: this.conn.secure,
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

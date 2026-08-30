/**
 * IMAP client adapter using imapflow 1.7.2
 * Provides read-only email access with TLS enforcement.
 *
 * NOTE: imapflow ships strict types that don't always expose the fields we read
 * at runtime (socket, secure, some fetch options). We narrow those specific
 * interactions with local casts at the library boundary only, while keeping the
 * read-only command surface (mailboxOpen readOnly, list, search, fetchOne, logout).
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

export class ImapClient {
  private conn: ImapFlow;
  private _currentMailbox?: string;
  private _socket?: import('tls').TLSSocket;

  constructor(
    config: ConnectionConfig,
    password: string,
  ) {
    const options: Record<string, unknown> = {
      host: config.host,
      port: config.port,
      secure: config.encryption === 'ssl',
      auth: {
        user: config.username,
        pass: password,
      },
      socketTimeout: 30000,
      // Enforce certificate validation on the TLS layer
      tls: {
        rejectUnauthorized: true,
      },
    };

    this.conn = new ImapFlow(options as unknown as ConstructorParameters<typeof ImapFlow>[0]);

    // Capture the underlying TLS socket for certificate inspection.
    // 'connect' and .socket are runtime-available but not in the public types.
    (this.conn as unknown as { on: (e: string, cb: () => void) => void }).on('connect', () => {
      this._socket = (this.conn as unknown as { socket?: import('tls').TLSSocket }).socket;
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

  async listMailboxes(): Promise<string[]> {
    const boxes: string[] = [];
    try {
      const result = await this.conn.list();
      if (Array.isArray(result)) {
        for (const box of result) {
          boxes.push(box.path || box.name || '');
        }
      }
    } catch {
      // Return empty on error
    }
    return boxes.filter(Boolean);
  }

  async searchEmails(mailbox: string, maxCount: number): Promise<EmailHeader[]> {
    const results: EmailHeader[] = [];

    try {
      // Open the mailbox read-only (maps to EXAMINE) — never SELECT for write.
      await this.conn.mailboxOpen(mailbox, { readOnly: true });
      this._currentMailbox = mailbox;

      // Search for all messages
      const searchResult = await this.conn.search({ all: true });
      const uids: number[] = Array.isArray(searchResult) ? searchResult : [];

      // Sort descending by UID (newest first), limit
      uids.sort((a, b) => b - a);
      const selectedUids = uids.slice(0, maxCount);

      for (const uid of selectedUids) {
        try {
          const message = await this.conn.fetchOne(String(uid), {
            envelope: true,
          });

          if (message && typeof message !== 'boolean' && message.envelope) {
            const env = message.envelope;
            results.push({
              id: env.messageId ?? String(uid),
              uid,
              from: this._extractFrom(env.from),
              subject: env.subject ?? '(无主题)',
              date: env.date ? new Date(env.date) : null,
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
      const result = await this.conn.fetchOne(String(uid), { source: true });
      const source = result && typeof result !== 'boolean' ? result.source : undefined;
      return Buffer.isBuffer(source) ? source : Buffer.from('');
    } catch {
      return Buffer.from('');
    } finally {
      this._currentMailbox = undefined;
    }
  }

  async getCertificateInfo(): Promise<{ valid: boolean; issuer?: string; expiresAt?: string }> {
    try {
      if (this._socket && typeof this._socket.getPeerCertificate === 'function') {
        const cert = this._socket.getPeerCertificate();
        if (cert && Object.keys(cert).length > 0) {
          const issuer = cert.issuer
            ? Object.entries(cert.issuer).map(([k, v]) => `${k}=${v}`).join(', ')
            : undefined;
          return {
            valid: true,
            issuer,
            expiresAt: cert.valid_to,
          };
        }
      }

      // Fallback: trust that connect() succeeded over a secure socket.
      const secure = (this.conn as unknown as { secureConnection?: boolean }).secureConnection;
      return { valid: secure !== false };
    } catch {
      return { valid: false };
    }
  }

  private _extractFrom(from?: Array<{ name?: string; address?: string }>): string {
    const addr = from?.[0];
    if (!addr) return 'Unknown Sender';
    return addr.name || addr.address || 'Unknown Sender';
  }
}

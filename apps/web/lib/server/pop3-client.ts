/**
 * POP3 client adapter — read-only access
 *
 * POP3 is intentionally limited compared to IMAP:
 * - No mailbox discovery (single INBOX only)
 * - No SEARCH/filtering (downloads all messages)
 * - READ-ONLY by design (no DELE, STORE, etc.)
 */
import { type ConnectionConfig } from '@mailmind/contracts';

export interface Pop3EmailHeader {
  uid: string;
  size: number;
  from: string;
  subject: string;
  date: Date | null;
}

export class Pop3Client {
  private host: string;
  private port: number;
  private username: string;
  private password: string;
  private secure: boolean;
  private socket: any = null;

  constructor(config: ConnectionConfig, password: string) {
    this.host = config.host;
    this.port = config.port;
    this.username = config.username;
    this.password = password;
    this.secure = config.encryption === 'ssl';
  }

  async connect(): Promise<void> {
    const net = await import('net');
    const tls = await import('tls');

    const createSocket = () => {
      if (this.secure) {
        return tls.connect({
          host: this.host,
          port: this.port,
          rejectUnauthorized: true,
        });
      }
      return net.createConnection(this.port, this.host);
    };

    this.socket = createSocket();

    await new Promise<void>((resolve, reject) => {
      this.socket.once('connect', () => resolve());
      this.socket.once('error', reject);
      setTimeout(() => reject(new Error('POP3_CONNECTION_TIMEOUT')), 15000);
    });

    const greeting = await this._readResponse();
    if (!greeting?.startsWith('+OK')) {
      throw new Error(`POP3_GREETING_FAILED: ${greeting}`);
    }
  }

  async authenticate(): Promise<void> {
    await this._sendCommand(`USER ${this.username}`);
    await this._expectOK();
    await this._sendCommand(`PASS ${this.password}`);
    await this._expectOK();
  }

  async getStats(): Promise<{ messageCount: number; totalSize: number }> {
    const response = await this._sendCommand('STAT');
    const match = response?.match(/\+OK\s+(\d+)\s+(\d+)/);
    if (!match) throw new Error('Failed to parse STAT response');
    return {
      messageCount: parseInt(match[1], 10),
      totalSize: parseInt(match[2], 10),
    };
  }

  async listMessages(maxCount: number): Promise<Pop3EmailHeader[]> {
    const response = await this._sendCommand('LIST');
    if (!response) return [];

    const lines = response.split('\n').filter(
      l => l.trim() && !l.startsWith('+OK') && !/^\d+$/.test(l.trim())
    );
    const headers: Pop3EmailHeader[] = [];

    for (const line of lines.slice(0, maxCount)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        headers.push({
          uid: parts[0],
          size: parseInt(parts[parts.length - 1], 10),
          from: '',
          subject: '',
          date: null,
        });
      }
    }

    return headers;
  }

  async fetchMessage(uid: string): Promise<Buffer> {
    const response = await this._sendCommand(`RETR ${uid}`);
    if (!response) return Buffer.from('');

    // Response ends with '.' on its own line
    const rawLines = response.split('\n');
    const contentLines: string[] = [];
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i] === '.') break;
      contentLines.push(rawLines[i]);
    }

    let content = contentLines.join('\n');
    // Remove dot-stuffing: lines starting with '.' get the dot removed
    const fixedLines = content.split('\n').map(line =>
      line.startsWith('.') ? line.slice(1) : line
    );
    content = fixedLines.join('\n');

    return Buffer.from(content);
  }

  async topMessage(uid: string, numLines = 20): Promise<string> {
    const response = await this._sendCommand(`TOP ${uid} ${numLines}`);
    if (!response) return '';
    const resultLines = response.split('\n').filter(l => l !== '.');
    return resultLines.join('\n');
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      try {
        await this._sendCommand('QUIT');
      } catch {
        // Ignore quit errors
      }
      this.socket.destroy();
      this.socket = null;
    }
  }

  private _readResponse(): Promise<string | undefined> {
    return new Promise((resolve) => {
      let buffer = '';
      const onData = (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\r\n');
        if (lines.length > 1) {
          this.socket?.removeListener('data', onData);
          resolve(lines[lines.length - 2]);
        }
      };
      this.socket?.once('data', onData);
      setTimeout(() => {
        this.socket?.removeListener('data', onData);
        resolve(undefined);
      }, 5000);
    });
  }

  private async _sendCommand(cmd: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.socket?.write(`${cmd}\r\n`);
      const onData = (chunk: Buffer) => {
        const data = chunk.toString();
        const lines = data.split('\r\n');
        const firstLine = lines[0];
        if (!firstLine.startsWith('-')) {
          this.socket?.removeListener('data', onData);
          resolve(firstLine);
        }
      };
      this.socket?.once('data', onData);
      setTimeout(() => {
        this.socket?.removeListener('data', onData);
        resolve(undefined);
      }, 5000);
    });
  }

  private async _expectOK(): Promise<void> {
    const response = await this._readResponse();
    if (!response?.startsWith('+OK')) {
      throw new Error(`POP3_AUTH_FAILED: ${response}`);
    }
  }
}

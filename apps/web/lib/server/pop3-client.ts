/**
 * POP3 client - simple sequential protocol
 * All operations are truly sequential via a single internal queue
 */
import { type ConnectionConfig } from '@mailmind/contracts';

export class Pop3Client {
  private host: string;
  private port: number;
  private username: string;
  private password: string;
  private secure: boolean;
  private socket: any = null;
  private _buf = '';
  // Queue of pending line-read promises
  private _pendingLines: Array<{ resolve: (s: string) => void; reject: (e: Error) => void }> = [];

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
    
    this.socket = this.secure
      ? tls.connect({ host: this.host, port: this.port, rejectUnauthorized: true })
      : net.createConnection(this.port, this.host);
    
    this._buf = '';
    this._pendingLines = [];
    
    this.socket.on('data', (c: Buffer) => this._onData(c));
    this.socket.on('error', (e: Error) => this._rejectAll(new Error(`Socket: ${e.message}`)));
    this.socket.on('close', () => this._rejectAll(new Error('CLOSED')));

    await new Promise<void>((res, rej) => {
      this.socket.once('connect', res);
      setTimeout(() => rej(new Error('timeout')), 15000);
    });

    // Read greeting line
    const greeting = await this._readLine();
    console.log('[POP3] Connected:', greeting);
    if (!greeting?.startsWith('+OK')) throw new Error(`bad greeting: ${greeting}`);
  }

  async authenticate(): Promise<void> {
    // Send USER, then read response
    this.socket.write(`USER ${this.username}\r\n`);
    const r1 = await this._readLine();
    if (!r1?.startsWith('+OK')) throw new Error(`AUTH USER failed: ${r1}`);
    console.log('[POP3] USER OK');
    
    this.socket.write(`PASS ${this.password}\r\n`);
    const r2 = await this._readLine();
    if (!r2?.startsWith('+OK')) throw new Error(`AUTH PASS failed: ${r2}`);
    console.log('[POP3] AUTH OK');
  }

  async getStats(): Promise<{ messageCount: number; totalSize: number }> {
    this.socket.write('STAT\r\n');
    const r = await this._readLine();
    const m = r?.match(/\+OK\s+(\d+)\s+(\d+)/);
    if (!m) throw new Error(`STAT failed: ${r}`);
    return { messageCount: +m[1], totalSize: +m[2] };
  }

  async fetchMessage(uid: string): Promise<Buffer> {
    // Try TOP first - it returns headers + first N lines of body, skipping attachments
    this.socket.write(`TOP ${uid} 50\r\n`);
    const topHeader = await this._readLine();
    
    if (topHeader?.startsWith('+OK')) {
      // TOP succeeded - read until dot terminator
      const lines: string[] = [];
      while (true) {
        const line = await this._readLine();
        if (line === '.') break;
        lines.push(line);
      }
      const content = lines.map(l => l.startsWith('.') ? l.slice(1) : l).join('\r\n');
      console.log(`[POP3] TOP ${uid}: ${content.length} chars`);
      return Buffer.from(content);
    }
    
    // TOP failed, fallback to RETR (full email download)
    console.warn(`[POP3] TOP failed for ${uid}, falling back to RETR`);
    this.socket.write(`RETR ${uid}\r\n`);
    const retrHeader = await this._readLine();
    console.log(`[POP3] RETR ${uid}: ${retrHeader}`);
    
    const lines: string[] = [];
    while (true) {
      const line = await this._readLine();
      if (line === '.') break;
      lines.push(line);
    }
    const content = lines.map(l => l.startsWith('.') ? l.slice(1) : l).join('\r\n');
    console.log(`[POP3] RETR ${uid}: ${content.length} chars`);
    return Buffer.from(content);
  }
  
  private async _readBodyUntilDot(): Promise<Buffer> {
    const lines: string[] = [];
    while (true) {
      const line = await this._readLine();
      if (line === '.') break;
      lines.push(line);
    }
    const content = lines.map(l => l.startsWith('.') ? l.slice(1) : l).join('\r\n');
    return Buffer.from(content);
  }

  async disconnect(): Promise<void> {
    try { this.socket.write('QUIT\r\n'); await this._readLine(); } catch {}
    this._destroy();
  }

  // ── Private ────────────────────────────────────────────────

  /** Wait for next complete line (uses FIFO queue, no race condition) */
  private _readLine(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // Remove self from queue if still there
        const idx = this._pendingLines.findIndex(p => p.resolve === resolve);
        if (idx !== -1) this._pendingLines.splice(idx, 1);
        reject(new Error('LINE_TIMEOUT'));
      }, 10000);
      
      this._pendingLines.push({ resolve, reject: (e) => { clearTimeout(timer); reject(e); } });
      
      // Try to resolve from buffer immediately
      this._tryDrain();
    });
  }

  private _tryDrain(): void {
    while (this._pendingLines.length > 0 && this._buf.includes('\r\n')) {
      const idx = this._buf.indexOf('\r\n');
      const line = this._buf.slice(0, idx);
      this._buf = this._buf.slice(idx + 2);
      
      const req = this._pendingLines.shift()!;
      req.resolve(line);
    }
  }

  private _onData(chunk: Buffer): void {
    this._buf += chunk.toString();
    this._tryDrain();
  }

  private _rejectAll(err: Error): void {
    while (this._pendingLines.length > 0) {
      const req = this._pendingLines.shift()!;
      req.reject(err);
    }
  }

  private _destroy(): void {
    if (this.socket) { this.socket.destroy(); this.socket = null; }
  }
}

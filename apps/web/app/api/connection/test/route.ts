/**
 * POST /api/connection/test - Test email server connection (IMAP or POP3)
 *
 * This endpoint validates the user's connection credentials without reading any emails.
 */
import { NextResponse } from 'next/server';
import { ImapClient } from '../../../../lib/server/imap-client';
import { Pop3Client } from '../../../../lib/server/pop3-client';
import { type ConnectionConfig, type Protocol, type EncryptionMethod } from '@mailmind/contracts';

interface TestConnectionRequest {
  protocol: Protocol;
  host: string;
  port: number;
  encryption: EncryptionMethod;
  username: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: TestConnectionRequest = await request.json();

    // Validate required fields
    if (!body.host || !body.port || !body.username || !body.password) {
      return NextResponse.json(
        { error: 'MISSING_CREDENTIALS', message: 'Host, port, username, and password are required' },
        { status: 400 }
      );
    }

    const config: ConnectionConfig = {
      protocol: body.protocol,
      host: body.host.trim(),
      port: Number(body.port),
      encryption: body.encryption,
      username: body.username.trim(),
    };

    let connected = false;
    let message = '';

    if (config.protocol === 'imap') {
      const client = new ImapClient(config, body.password);
      try {
        await client.connect();
        connected = true;
        message = 'Connected successfully via IMAP';
        await client.disconnect();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('TLS_FAILED') || errorMessage.includes('connect ECONNREFUSED') || errorMessage.includes('socket hang up')) {
          return NextResponse.json(
            { error: 'CONNECTION_FAILED', message: `Connection failed: ${errorMessage}` },
            { status: 500 }
          );
        }
        if (errorMessage.includes('AUTH_FAILED') || errorMessage.includes('Authentication failed') || errorMessage.includes('USER/PASS failed')) {
          return NextResponse.json(
            { error: 'AUTH_FAILED', message: 'Authentication failed. Please check your username and password/app password.' },
            { status: 401 }
          );
        }
        return NextResponse.json(
          { error: 'CONNECTION_FAILED', message: `IMAP connection failed: ${errorMessage}` },
          { status: 500 }
        );
      }
    } else if (config.protocol === 'pop3') {
      const client = new Pop3Client(config, body.password);
      try {
        await client.connect();
        connected = true;
        message = 'Connected successfully via POP3';
        await client.disconnect();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('POP3_CONNECTION_TIMEOUT') || errorMessage.includes('ECONNREFUSED')) {
          return NextResponse.json(
            { error: 'CONNECTION_FAILED', message: `Connection timed out or refused. Please check the host and port.` },
            { status: 500 }
          );
        }
        if (errorMessage.includes('POP3_GREETING_FAILED')) {
          return NextResponse.json(
            { error: 'CONNECTION_FAILED', message: `Server greeting failed: ${errorMessage}` },
            { status: 500 }
          );
        }
        if (errorMessage.includes('AUTH_FAILED') || errorMessage.includes('Authentication failed')) {
          return NextResponse.json(
            { error: 'AUTH_FAILED', message: 'Authentication failed. Please check your username and password/app password.' },
            { status: 401 }
          );
        }
        return NextResponse.json(
          { error: 'CONNECTION_FAILED', message: `POP3 connection failed: ${errorMessage}` },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'PROTOCOL_UNSUPPORTED', message: 'Unsupported protocol' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      connected,
      message,
      protocol: config.protocol,
      host: config.host,
      port: config.port,
    });

  } catch (error) {
    console.error('[MailMind] Connection test error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

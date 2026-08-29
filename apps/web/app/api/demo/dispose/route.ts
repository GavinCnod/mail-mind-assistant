/**
 * POST /api/demo/dispose - Session disposal API
 *
 * Clears any in-memory state associated with the current session.
 */
import { NextResponse } from 'next/server';

// In-memory session store (would be replaced with proper storage in production)
const activeSessions = new Map<string, {
  imapClient: any;
  pop3Client: any;
  createdAt: number;
}>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    // Clean up session
    const session = activeSessions.get(sessionId);
    if (session) {
      // Close IMAP connection if exists
      if (session.imapClient) {
        try {
          await session.imapClient.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }

      // Close POP3 connection if exists
      if (session.pop3Client) {
        try {
          await session.pop3Client.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }

      // Remove from store
      activeSessions.delete(sessionId);
    }

    return NextResponse.json({
      success: true,
      message: 'Session disposed successfully',
      disposed: !!session,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

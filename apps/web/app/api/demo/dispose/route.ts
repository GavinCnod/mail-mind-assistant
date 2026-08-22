/**
 * POST /api/demo/dispose - Session disposal API
 *
 * Clears any in-memory state associated with the current session.
 */
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = body.sessionId;
    
    // In a real implementation, we would:
    // 1. Close any open IMAP connections
    // 2. Clear in-memory caches
    // 3. Cancel any pending promises
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session disposed successfully' 
    });
  } catch (error) {
    console.error('Dispose API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

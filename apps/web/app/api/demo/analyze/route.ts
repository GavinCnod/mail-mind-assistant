/**
 * POST /api/demo/analyze - One-shot streaming analysis API
 *
 * Accepts consent + connection config, returns SSE stream of email insights.
 * Uses mock fixtures in development; real IMAP adapter in production.
 */
import { NextResponse } from 'next/server';
import { FIXTURE_INSIGHTS } from '../../../../lib/server/fixtures';
import { sanitizeContent } from '../../../../lib/server/sanitize-html';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate consent
    if (!body.consent?.userAgreement || !body.consent?.privacyPolicy || !body.consent?.mailProcessingAuth) {
      return NextResponse.json(
        { error: 'CONSENT_REQUIRED', message: 'Please complete the consent process first' },
        { status: 400 }
      );
    }

    // In development, use fixtures; in production, connect to real IMAP
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      return streamFixtureAnalysis(body.uiPreference?.locale || 'zh-CN');
    }

    // TODO: Real IMAP connection would go here
    return NextResponse.json(
      { error: 'NOT_IMPLEMENTED', message: 'Real IMAP adapter not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An internal error occurred' },
      { status: 500 }
    );
  }
}

async function streamFixtureAnalysis(locale: string) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Progress event
      controller.enqueue(encoder.encode(`event: progress\ndata: ${JSON.stringify({ type: 'progress', stage: 'connecting', message: '正在连接...' })}\n\n`));
      
      // Simulate processing time
      await new Promise(r => setTimeout(r, 500));
      
      // Stream each fixture insight
      for (let i = 0; i < FIXTURE_INSIGHTS.length; i++) {
        const insight = FIXTURE_INSIGHTS[i];
        
        // Progress update
        controller.enqueue(encoder.encode(`event: progress\ndata: ${JSON.stringify({ type: 'progress', stage: 'classifying', message: `正在分析第 ${i + 1}/${FIXTURE_INSIGHTS.length} 封...` })}\n\n`));
        
        await new Promise(r => setTimeout(r, 300));
        
        // Email card event
        const card = {
          ...insight,
          senderName: '测试用户',
          senderDomain: 'example.com',
          receivedAt: new Date().toISOString(),
          hasAttachments: false,
          subject: '测试邮件主题',
        };
        
        const detail = {
          from: 'test@example.com',
          to: ['user@example.com'],
          subject: '测试邮件主题',
          receivedAt: new Date().toISOString(),
          bodyTextExcerpt: sanitizeContent(`这是一封测试邮件正文，用于演示 MailMind 的分诊能力。${' '.repeat(100)}`),
          hasAttachments: false,
          attachmentCount: 0,
        };
        
        controller.enqueue(encoder.encode(`event: email\ndata: ${JSON.stringify({ type: 'email', card, detail })}\n\n`));
      }
      
      // Completion event
      controller.enqueue(encoder.encode(`event: completed\ndata: ${JSON.stringify({ type: 'completed', insights: FIXTURE_INSIGHTS })}\n\n`));
      
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

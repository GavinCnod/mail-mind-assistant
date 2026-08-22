/**
 * POST /api/demo/digest - Half-day digest generation API
 *
 * Accepts verified EmailInsight[] and returns a DigestReport.
 */
import { NextResponse } from 'next/server';
import { type DigestReport, type EmailInsight } from '@mailmind/contracts';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate consent
    if (!body.consent?.userAgreement || !body.consent?.privacyPolicy || !body.consent?.mailProcessingAuth) {
      return NextResponse.json(
        { error: 'CONSENT_REQUIRED' },
        { status: 400 }
      );
    }

    // Basic validation of insights
    if (!Array.isArray(body.insights) || body.insights.length === 0) {
      return NextResponse.json(
        { error: 'INVALID_INSIGHTS', message: 'No insights provided' },
        { status: 400 }
      );
    }

    // TODO: Call LLM to generate digest with current locale
    const locale = body.uiPreference?.locale || 'zh-CN';

    const mockDigest: DigestReport = {
      schemaVersion: '1.1',
      periodStart: body.windowStart || new Date().toISOString(),
      periodEnd: body.windowEnd || new Date().toISOString(),
      headline: locale === 'zh-CN' ? '半日工作简报' : 'Half-Day Work Briefing',
      topPriorities: [
        {
          text: locale === 'zh-CN' ? '处理物流异常，通知客户' : 'Handle logistics issue, notify customer',
          email_refs: ['fixture-002'],
        },
      ],
      recommendedActions: [
        {
          action: locale === 'zh-CN' ? '回复客户确认交期' : 'Reply to customer about delivery date',
          email_refs: ['fixture-001'],
          due_at: '2026-08-27',
        },
      ],
      risksAndBlockers: [
        {
          text: locale === 'zh-CN' ? '港口延迟48小时可能影响其他订单' : 'Port delay may affect other orders',
          email_refs: ['fixture-002'],
        },
      ],
      noActionRequired: [],
      outputLocale: locale,
    };

    return NextResponse.json(mockDigest);
  } catch (error) {
    console.error('Digest API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

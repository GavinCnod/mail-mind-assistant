/**
 * POST /api/demo/digest - Half-day digest generation API
 *
 * Accepts verified EmailInsight[] and returns a DigestReport.
 */
import { NextResponse } from 'next/server';
import { type DigestReport, type EmailInsight, digestReportSchema } from '@mailmind/contracts';
import { LlmAdapter } from '../../../../lib/server/llm-adapter';

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

    // Validate insights array
    if (!Array.isArray(body.insights) || body.insights.length === 0) {
      return NextResponse.json(
        { error: 'INVALID_INSIGHTS', message: 'No insights provided' },
        { status: 400 }
      );
    }

    const locale = body.uiPreference?.locale || 'zh-CN';

    // Use LLM for digest generation
    const llmConfig = {
      baseUrl: process.env.DEMO_LLM_BASE_URL || 'https://apihub.agnes-ai.com/v1',
      apiKey: process.env.DEMO_LLM_API_KEY || '',
      model: process.env.DEMO_LLM_MODEL || 'agnes-2.0-flash',
    };

    if (!llmConfig.apiKey) {
      // Fallback to mock if no LLM key
      return NextResponse.json(generateMockDigest(body, locale));
    }

    try {
      const llm = new LlmAdapter(llmConfig);
      const systemPrompt = buildDigestSystemPrompt(locale);
      const userPrompt = buildDigestUserPrompt(body.insights, locale);
      const raw = await llm.generateDigest({ systemPrompt, userPrompt, model: llmConfig.model });

      // Validate LLM output against schema
      const parsed = JSON.parse(raw);
      const validated = digestReportSchema.parse(parsed);
      return NextResponse.json(validated);
    } catch (llmError) {
      console.error('[Digest API] LLM failed, using mock:', llmError);
      return NextResponse.json(generateMockDigest(body, locale));
    }
  } catch (error) {
    console.error('Digest API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

function buildDigestSystemPrompt(locale: string): string {
  const lang = locale === 'zh-CN' ? '中文（简体）' : 'English';
  return `你是一位专业的工作助理，负责生成工作简报。

请根据提供的邮件洞察数据，生成一份简洁的工作简报，包括：
- 核心优先级事项
- 建议行动
- 风险与阻碍
- 无需处理的邮件

使用 ${lang} 输出所有文本字段。`;
}

function buildDigestUserPrompt(insights: any[], locale: string): string {
  const emailList = insights.map((i: any, idx: number) =>
    `${idx + 1}. [${i.priority}] ${i.oneLineSummary} - 分类：${i.category}`
  ).join('\n');

  return `请根据以下邮件洞察生成工作简报：

${emailList}

时间范围：
- 开始：${new Date().toISOString()}
- 结束：${new Date().toISOString()}`;
}

function generateMockDigest(body: any, locale: string): DigestReport {
  return {
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
}

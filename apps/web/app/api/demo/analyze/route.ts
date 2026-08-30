/**
 * POST /api/demo/analyze - Real IMAP + LLM analysis with SSE streaming
 */
import { NextResponse } from 'next/server';
import { MailTriageAgent, type TriageOptions } from '../../../../lib/server/triage-agent';
import { FIXTURE_INSIGHTS, FIXTURE_EMAILS } from '../../../../lib/server/fixtures';
import { sanitizeContent } from '../../../../lib/server/sanitize-html';
import { validateHost } from '../../../../lib/server/ip-guard';
import { analyzeRequestSchema } from '@mailmind/contracts';
import type { StreamEvent, EmailCardViewModel, SanitizedEmailDetail, ConnectionConfig } from '@mailmind/contracts';

const encoder = new TextEncoder();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function encodeSSE(event: StreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body against schema
    const validationResult = analyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Request validation failed' },
        { status: 400 },
      );
    }

    // Validate consent
    if (!body.consent?.userAgreement || !body.consent?.privacyPolicy || !body.consent?.mailProcessingAuth) {
      return NextResponse.json(
        { error: 'CONSENT_REQUIRED' },
        { status: 400 },
      );
    }

    const locale = (body.uiPreference?.locale as 'zh-CN' | 'en') ?? 'zh-CN';
    const maxEmails = Math.min(Math.max(body.maxEmails ?? 5, 1), 10);

    // ── Mode selection ────────────────────────────────────────────────
    const hasCredentials = !!(
      body.connection?.host &&
      body.connection?.username
    );

    if (!hasCredentials) {
      return demoModeStream(locale, maxEmails);
    }

    // Validate host for SSRF protection (throws if host resolves to a private/local IP)
    try {
      await validateHost(body.connection.host);
    } catch {
      return NextResponse.json(
        { error: 'SECURITY', message: 'Host validation failed - private IP addresses are not allowed' },
        { status: 403 },
      );
    }

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
        { status: 429 },
      );
    }

    // Use server-side LLM config (don't trust client-provided API key)
    const serverLlm = {
      baseUrl: process.env.DEMO_LLM_BASE_URL || 'https://apihub.agnes-ai.com/v1',
      apiKey: process.env.DEMO_LLM_API_KEY || '',
      model: process.env.DEMO_LLM_MODEL || 'agnes-2.0-flash',
    };

    return realModeStream(body.connection, body.password || '', serverLlm, locale, maxEmails);

  } catch (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '分析过程中发生错误' },
      { status: 500 },
    );
  }
}

// ── Demo mode ───────────────────────────────────────────────────────

async function demoModeStream(locale: string, maxEmails: number) {
  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (stage: string, msg: string) => {
        controller.enqueue(encoder.encode(encodeSSE({ type: 'progress', stage: stage as any, message: msg })));
      };

      sendProgress('connecting', locale === 'zh-CN' ? '演示模式：使用示例邮件数据...' : 'Demo mode: using sample emails...');
      await sleep(300);

      for (let i = 0; i < FIXTURE_EMAILS.length && i < maxEmails; i++) {
        sendProgress('parsing', `${locale === 'zh-CN' ? '解析' : 'Parsing'} ${i + 1}/${FIXTURE_EMAILS.length}...`);
        await sleep(200);

        const insight = FIXTURE_INSIGHTS[i];
        const email = FIXTURE_EMAILS[i];

        const card: EmailCardViewModel = {
          senderName: email.from.name,
          senderDomain: email.from.email.split('@')[1] || '',
          receivedAt: new Date(email.date).toISOString(),
          hasAttachments: false,
          subject: email.subject,
          schemaVersion: '1.1',
          outputLocale: insight.outputLocale,
          oneLineSummary: insight.oneLineSummary,
          category: insight.category as any,
          priority: insight.priority as any,
          requiresAction: insight.requiresAction,
          suggestedActions: insight.suggestedActions,
          keyFacts: insight.keyFacts,
          deadline: insight.deadline,
          riskFlags: insight.riskFlags,
          confidence: insight.confidence,
          needsHumanReview: insight.needsHumanReview,
        };

        const detail: SanitizedEmailDetail = {
          from: email.from.email,
          to: [email.from.email],
          subject: email.subject,
          receivedAt: new Date(email.date).toISOString(),
          bodyTextExcerpt: sanitizeContent(email.body, 1500),
          hasAttachments: false,
          attachmentCount: 0,
        };

        controller.enqueue(encoder.encode(encodeSSE({ type: 'email', card, detail })));
      }

      sendProgress('completed', locale === 'zh-CN' ? '分析完成' : 'Analysis complete');
      await sleep(100);

      controller.enqueue(encoder.encode(encodeSSE({ type: 'completed', insights: FIXTURE_INSIGHTS })));
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

// ── Real mode ───────────────────────────────────────────────────────

async function realModeStream(
  connection: ConnectionConfig,
  password: string,
  llm: { baseUrl: string; apiKey: string; model: string } | undefined,
  locale: string,
  maxEmails: number,
) {
  if (!connection.host || !connection.port || !connection.username) {
    throw new Error('MISSING_CREDENTIALS');
  }

  const agent = new MailTriageAgent(
    connection,
    password,
    llm ? {
      baseUrl: llm.baseUrl,
      apiKey: llm.apiKey,
      model: llm.model,
    } : undefined,
    { locale: locale as 'zh-CN' | 'en', maxEmails },
  );

  const stream = new ReadableStream({
    async start(controller) {
      const progressCallback = (stage: string, message: string) => {
        controller.enqueue(encoder.encode(encodeSSE({ type: 'progress', stage: stage as any, message })));
      };

      let shouldClose = true;
      try {
        const results = await agent.runWithProgress(progressCallback);

        const emails = results.emails || [];

        // If no emails found, send error event and exit early
        if (emails.length === 0) {
          controller.enqueue(encoder.encode(encodeSSE({
            type: 'error',
            code: 'NO_EMAILS',
            retryable: true,
            safeMessage: locale === 'zh-CN' ? '邮箱中没有找到邮件，请检查邮箱是否有未删除的邮件' : 'No emails found in mailbox. Please check if there are any non-deleted emails.'
          })));
          shouldClose = false;
          return;
        }

        for (let i = 0; i < emails.length; i++) {
          const email = emails[i];
          const insight = (results.insights as Record<string, unknown>[])?.[i] ?? {};

          const card: EmailCardViewModel = {
            senderName: email.from || 'Unknown',
            senderDomain: email.fromEmail?.split('@')[1] || '',
            receivedAt: email.receivedAt.toISOString(),
            hasAttachments: email.hasAttachments,
            subject: email.subject,
            schemaVersion: '1.1',
            outputLocale: (insight.outputLocale as 'zh-CN' | 'en') ?? locale as 'zh-CN' | 'en',
            oneLineSummary: (insight.oneLineSummary as string) || email.subject || '',
            category: (insight.category as string) || 'other' as any,
            priority: (insight.priority as string) || 'P3' as any,
            requiresAction: !!insight.requiresAction,
            suggestedActions: (insight.suggestedActions as any[]) || [],
            keyFacts: (insight.keyFacts as any[]) || [],
            deadline: insight.deadline ? {
              value: (insight.deadline as any).value,
              source: (insight.deadline as any).source,
              confidence: (insight.deadline as any).confidence,
            } : null,
            riskFlags: (insight.riskFlags as string[]) || [],
            confidence: (insight.confidence as number) ?? 0.5,
            needsHumanReview: !!insight.needsHumanReview,
          };

          const detail: SanitizedEmailDetail = {
            from: email.from,
            to: [],
            subject: email.subject,
            receivedAt: email.receivedAt.toISOString(),
            bodyTextExcerpt: email.sanitizedExcerpt,
            hasAttachments: email.hasAttachments,
            attachmentCount: email.attachmentCount,
          };

          controller.enqueue(encoder.encode(encodeSSE({ type: 'email', card, detail })));
        }

        controller.enqueue(encoder.encode(encodeSSE({ type: 'completed', insights: results.insights as any })));

      } catch (error) {
        const errorCode = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
        controller.enqueue(encoder.encode(encodeSSE({
          type: 'error',
          code: errorCode as any,
          retryable: true,
          safeMessage: getSafeErrorMessage(errorCode, locale),
        })));
      } finally {
        if (shouldClose) {
          controller.close();
        }
      }
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

function getSafeErrorMessage(code: string, locale: string): string {
  const messages: Record<string, Record<string, string>> = {
    AUTH_FAILED: { 'zh-CN': '身份验证失败，请检查用户名或应用密码', en: 'Authentication failed, check your username or app password' },
    TLS_FAILED: { 'zh-CN': 'TLS 连接失败，请检查加密设置', en: 'TLS connection failed, check encryption settings' },
    NO_EMAILS: { 'zh-CN': '邮箱中没有找到邮件，请检查邮箱是否有未删除的邮件', en: 'No emails found in mailbox' },
    SECURITY: { 'zh-CN': '安全检查失败，不允许访问私有地址', en: 'Security check failed - private addresses not allowed' },
    RATE_LIMITED: { 'zh-CN': '请求过于频繁，请稍后重试', en: 'Too many requests, please try again later' },
    UNKNOWN_ERROR: { 'zh-CN': '发生未知错误，请稍后重试', en: 'An unknown error occurred, please try again' },
  };
  const key = code || 'UNKNOWN_ERROR';
  return messages[key]?.[locale] ?? messages[key]?.['en'] ?? 'An error occurred';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

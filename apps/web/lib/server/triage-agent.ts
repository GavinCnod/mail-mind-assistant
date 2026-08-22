/**
 * Mail Triage Agent — main orchestration logic
 *
 * Connects to IMAP → fetches emails → parses MIME → runs LLM analysis
 * → returns structured insights.
 */
import { type ConnectionConfig } from '@mailmind/contracts';
import { ImapClient, type EmailHeader } from './imap-client';
import { parseEmailBuffer, type ParsedEmail } from './mime-parser';
import { LlmAdapter } from './llm-adapter';
import { buildSystemPrompt, buildEmailPrompt } from './system-prompt';

export interface TriagemResults {
  emails: ParsedEmail[];
  insights: unknown[];
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
}

export interface TriageOptions {
  maxEmails?: number;
  mailbox?: string;
  locale?: 'zh-CN' | 'en';
  progressCallback?: (stage: string, message: string) => void;
}

export class MailTriageAgent {
  private imap: ImapClient;
  private llm?: LlmAdapter;
  private maxEmails: number;
  private mailbox: string;
  private locale: 'zh-CN' | 'en';
  private progressCallback?: (stage: string, message: string) => void;

  constructor(
    config: ConnectionConfig,
    password: string,
    llmConfig?: { baseUrl: string; apiKey: string; model: string; timeoutMs?: number },
    options?: TriageOptions,
  ) {
    this.imap = new ImapClient(config, password);
    this.maxEmails = options?.maxEmails ?? 10;
    this.mailbox = options?.mailbox ?? 'INBOX';
    this.locale = options?.locale ?? 'zh-CN';
    this.progressCallback = options?.progressCallback;

    if (llmConfig) {
      this.llm = new LlmAdapter({
        baseUrl: llmConfig.baseUrl,
        apiKey: llmConfig.apiKey,
        model: llmConfig.model,
        timeoutMs: llmConfig.timeoutMs ?? 45000,
      });
    }
  }

  /** Run with progress callbacks */
  async runWithProgress(progressCallback: (stage: string, message: string) => void): Promise<TriagemResults> {
    const originalCallback = this.progressCallback;
    this.progressCallback = progressCallback;
    try {
      return await this.run();
    } finally {
      this.progressCallback = originalCallback;
    }
  }

  /** Run the full triage pipeline */
  async run(): Promise<TriagemResults> {
    const parsedEmails: ParsedEmail[] = [];
    let insights: unknown[] = [];
    let usage: TriagemResults['usage'];

    // Step 1: Connect with TLS
    this.progressCallback?.('connecting', '正在建立加密连接...');
    await this.imap.connect();

    // Verify TLS certificate
    this.progressCallback?.('connecting', '正在验证安全证书...');
    const certInfo = await this.imap.getCertificateInfo();
    if (!certInfo.valid) {
      await this.imap.disconnect();
      throw new Error('TLS_FAILED');
    }

    // Step 2: Discover mailboxes
    this.progressCallback?.('listing', '正在获取邮箱列表...');
    let targetMailbox = this.mailbox;
    try {
      const boxes = await this.imap.listMailboxes();
      if (!boxes.includes(targetMailbox)) {
        targetMailbox = boxes.find(b => b.toLowerCase() === 'inbox') ?? boxes[0] ?? 'INBOX';
      }
    } catch {
      // Use configured mailbox as fallback
    }

    // Step 3: Search messages
    this.progressCallback?.('fetching', `正在获取最新邮件（最多 ${this.maxEmails} 封）...`);
    const headers: EmailHeader[] = await this.imap.searchEmails(targetMailbox, this.maxEmails);

    // Step 4: Parse each email
    this.progressCallback?.('parsing', '正在解析邮件内容...');
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      this.progressCallback?.('parsing', `正在解析第 ${i + 1}/${headers.length} 封...`);

      try {
        const rawBuffer = await this.imap.fetchRawMessage(targetMailbox, header.uid);
        const parsed = await parseEmailBuffer(rawBuffer, header);
        parsedEmails.push(parsed);
      } catch (err) {
        console.error(`[MailMind] Failed to parse email ${i}:`, err);
        // Continue with partial data
      }
    }

    // Step 5: LLM analysis (if configured)
    if (this.llm && parsedEmails.length > 0) {
      this.progressCallback?.('classifying', `正在分析 ${parsedEmails.length} 封邮件...`);
      const systemPrompt = buildSystemPrompt(this.locale);
      const results = await this._analyzeBatch(parsedEmails, systemPrompt, this.locale);
      insights = results.insights;
      usage = results.usage;
    } else if (parsedEmails.length > 0) {
      // Fallback: deterministic classification when no LLM configured
      this.progressCallback?.('ranking', '生成确定性分析结果...');
      insights = parsedEmails.map(email => this._deterministicInsight(email, this.locale));
    }

    // Step 6: Cleanup
    await this.imap.disconnect();
    this.progressCallback?.('completed', '分析完成');

    return { emails: parsedEmails, insights, usage };
  }

  /** Test connection without running analysis */
  async testConnection(): Promise<{ success: boolean; mailboxCount: number; error?: string }> {
    try {
      await this.imap.connect();
      const boxes = await this.imap.listMailboxes();
      await this.imap.disconnect();
      return {
        success: true,
        mailboxCount: boxes.length,
      };
    } catch (err) {
      return {
        success: false,
        mailboxCount: 0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // ── Private methods ────────────────────────────────────────────

  private async _analyzeBatch(
    emails: ParsedEmail[],
    systemPrompt: string,
    locale: 'zh-CN' | 'en',
  ): Promise<{ insights: unknown[]; usage?: TriagemResults['usage'] }> {
    const insights: unknown[] = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const userPrompt = buildEmailPrompt(
        email.sanitizedExcerpt,
        email.from,
        email.subject,
        email.injectionRisk,
      );

      try {
        const raw = await this.llm!.analyzeEmail({ systemPrompt, userPrompt, model: 'gpt-4o-mini' });
        let insight;
        try {
          insight = JSON.parse(raw);
        } catch {
          // If LLM didn't return valid JSON, create a fallback
          insight = this._fallbackInsight(email, locale);
        }
        insights.push(insight);
      } catch (err) {
        console.error(`[MailMind] LLM error for email ${i}:`, err);
        insights.push(this._fallbackInsight(email, locale));
      }
    }

    return { insights };
  }

  private _fallbackInsight(email: ParsedEmail, locale: 'zh-CN' | 'en'): Record<string, unknown> {
    const isZn = locale === 'zh-CN';
    const subject = email.subject || (isZn ? '无主题' : 'No Subject');
    const category = this._inferCategory(email);
    const priority = this._inferPriority(category, email.injectionRisk);

    return {
      schemaVersion: '1.1' as const,
      sourceEmailId: email.header.id,
      outputLocale: locale,
      oneLineSummary: email.sanitizedExcerpt.slice(0, 70) || subject,
      category,
      priority,
      requiresAction: priority === 'P0' || priority === 'P1',
      suggestedActions: [],
      keyFacts: [],
      deadline: null,
      riskFlags: email.injectionRisk ? [isZn ? '检测到潜在注入模式' : 'Potential injection detected'] : [],
      confidence: 0.5,
      needsHumanReview: email.injectionRisk,
    };
  }

  private _deterministicInsight(email: ParsedEmail, locale: 'zh-CN' | 'en'): Record<string, unknown> {
    return this._fallbackInsight(email, locale);
  }

  private _inferCategory(email: ParsedEmail): string {
    const subjectLower = email.subject.toLowerCase();
    const bodyLower = email.bodyPlain.toLowerCase();
    const text = `${subjectLower} ${bodyLower}`;

    if (text.includes('order') || text.includes('订单') || text.includes('product') || text.includes('产品') || text.includes('inquiry') || text.includes('询价')) {
      return 'customer_order';
    }
    if (text.includes('ship') || text.includes('物流') || text.includes('delivery') || text.includes('交付') || text.includes('tracking') || text.includes('跟踪')) {
      return 'logistics';
    }
    if (text.includes('meeting') || text.includes('会议') || text.includes('schedule') || text.includes('日程') || text.includes('calendar') || text.includes('日历')) {
      return 'meeting';
    }
    if (text.includes('invoice') || text.includes('账单') || text.includes('payment') || text.includes('付款') || text.includes('billing') || text.includes('发票')) {
      return 'billing';
    }
    if (text.includes('security') || text.includes('安全') || text.includes('alert') || text.includes('警告') || text.includes('notification') || text.includes('通知')) {
      return 'notification';
    }
    if (text.includes('sale') || text.includes('促销') || text.includes('discount') || text.includes('优惠') || text.includes('promo') || text.includes('newsletter') || text.includes('通讯')) {
      return 'marketing';
    }
    if (text.includes('facebook') || text.includes('twitter') || text.includes('linkedin') || text.includes('social')) {
      return 'social';
    }
    return 'other';
  }

  private _inferPriority(category: string, hasInjectionRisk: boolean): string {
    if (hasInjectionRisk) return 'P0';
    if (category === 'billing') return 'P1';
    if (category === 'meeting') return 'P1';
    if (category === 'logistics') return 'P1';
    if (category === 'customer_order') return 'P2';
    return 'P3';
  }
}

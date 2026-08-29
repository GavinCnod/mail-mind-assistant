/**
 * Mail Triage Agent - main orchestration logic
 *
 * Connects to IMAP or POP3, fetches emails, parses MIME, runs LLM analysis
 * and returns structured insights.
 */
import { type ConnectionConfig } from '@mailmind/contracts';
import { ImapClient, type EmailHeader } from './imap-client';
import { Pop3Client } from './pop3-client';
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
  private protocol: 'imap' | 'pop3';
  private imapClient?: ImapClient;
  private pop3Client?: Pop3Client;
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
    this.protocol = (config as any).protocol || 'imap';
    this.maxEmails = options?.maxEmails ?? 10;
    this.mailbox = options?.mailbox ?? 'INBOX';
    this.locale = options?.locale ?? 'zh-CN';
    this.progressCallback = options?.progressCallback;

    if (this.protocol === 'pop3') {
      this.pop3Client = new Pop3Client(config as any, password);
    } else {
      this.imapClient = new ImapClient(config, password);
    }

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

    if (this.protocol === 'pop3') {
      await this.pop3Client!.connect();
      await this.pop3Client!.authenticate();
    } else {
      await this.imapClient!.connect();

      this.progressCallback?.('connecting', '正在验证安全证书...');
      const certInfo = await this.imapClient!.getCertificateInfo();
      if (!certInfo.valid) {
        await this.imapClient!.disconnect();
        throw new Error('TLS_FAILED');
      }
    }

    // Step 2: Get emails based on protocol
    this.progressCallback?.('fetching', `正在获取最新邮件（最多${this.maxEmails}封）...`);

    if (this.protocol === 'pop3') {
      const stats = await this.pop3Client!.getStats();
      this.progressCallback?.('fetching', `邮箱中有 ${stats.messageCount} 封邮件，正在下载...`);

      const messageCount = Math.min(stats.messageCount, this.maxEmails);
      const startIdx = Math.max(1, stats.messageCount - messageCount + 1);
      for (let i = startIdx; i <= stats.messageCount; i++) {
        try {
          this.progressCallback?.('parsing', `正在解析${i}/${messageCount}封...`);
          const rawBuffer = await this.pop3Client!.fetchMessage(i.toString());
          const tempHeader: EmailHeader = {
            id: i.toString(),
            uid: i,
            from: '',
            subject: '(无主题)',
            date: null,
            hasAttachments: false,
            size: 0,
          };
          const parsed = await parseEmailBuffer(rawBuffer, tempHeader);
          parsedEmails.push(parsed);
        } catch (err) {
          // Skip failed email fetch
        }
      }
    } else {
      let targetMailbox = this.mailbox;
      try {
        const boxes = await this.imapClient!.listMailboxes();
          if (!boxes.includes(targetMailbox)) {
          const inboxBox = boxes.find(b => b.toLowerCase() === 'inbox') ?? boxes[0] ?? 'INBOX';
          targetMailbox = inboxBox;
        }
      } catch (err) {
        // Use default mailbox
      }

      const headers: EmailHeader[] = await this.imapClient!.searchEmails(targetMailbox, this.maxEmails);

      this.progressCallback?.('parsing', '正在解析邮件内容...');
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        this.progressCallback?.('parsing', `正在解析${i + 1}/${headers.length}封...`);
        try {
          const rawBuffer = await this.imapClient!.fetchRawMessage(targetMailbox, header.uid);
          const parsed = await parseEmailBuffer(rawBuffer, header);
          parsedEmails.push(parsed);
        } catch (err) {
          // Skip failed email parse
        }
      }
    }

    // Step 3: LLM analysis (if configured) with fallback
    if (this.llm && parsedEmails.length > 0) {
      this.progressCallback?.('classifying', `正在分析 ${parsedEmails.length} 封邮件...`);
      try {
        const systemPrompt = buildSystemPrompt(this.locale);
        const results = await this._analyzeBatch(parsedEmails, systemPrompt, this.locale);
        insights = results.insights || [];
        usage = results.usage;
      } catch (llmErr: any) {
        // LLM failed, use deterministic fallback
        insights = [];
      }
    }

    // Step 4: Fallback if no insights
    if (insights.length === 0 && parsedEmails.length > 0) {
      this.progressCallback?.('ranking', '生成确定性分析结果...');
      insights = parsedEmails.map(email => this._deterministicInsight(email, this.locale));
    }

    // Step 5: Cleanup
    if (this.protocol === 'pop3') {
      await this.pop3Client!.disconnect();
    } else {
      await this.imapClient!.disconnect();
    }
    this.progressCallback?.('completed', '分析完成');

    return { emails: parsedEmails, insights, usage };
  }

  /** Test connection without running analysis */
  async testConnection(): Promise<{ success: boolean; mailboxCount: number; error?: string }> {
    try {
      if (this.protocol === 'pop3') {
        await this.pop3Client!.connect();
        await this.pop3Client!.authenticate();
        const stats = await this.pop3Client!.getStats();
        await this.pop3Client!.disconnect();
        return { success: true, mailboxCount: stats.messageCount };
      } else {
        await this.imapClient!.connect();
        const boxes = await this.imapClient!.listMailboxes();
        await this.imapClient!.disconnect();
        return { success: true, mailboxCount: boxes.length };
      }
    } catch (err) {
      return { success: false, mailboxCount: 0, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ── Private methods ────────────────────────────────────

  private async _analyzeBatch(
    emails: ParsedEmail[],
    systemPrompt: string,
    locale: 'zh-CN' | 'en',
  ): Promise<{ insights: unknown[]; usage?: TriagemResults['usage']; llmFailed: boolean }> {
    const insights: unknown[] = [];
    let allFailed = true;
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const userPrompt = buildEmailPrompt(email.sanitizedExcerpt, email.from, email.subject, email.injectionRisk);
      try {
        const raw = await this.llm!.analyzeEmail({ systemPrompt, userPrompt, model: this.llm!.model });
        try {
          insights.push(JSON.parse(raw));
          allFailed = false;
        } catch {
          insights.push(this._fallbackInsight(email, locale));
          allFailed = false;
        }
      } catch (err) {
        // Skip LLM error for this email
      }
    }
    
    if (allFailed || insights.length === 0) {
      throw new Error('All LLM calls failed, using deterministic fallback');
    }
    
    return { insights, llmFailed: false };
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
    const text = `${email.subject.toLowerCase()} ${email.bodyPlain.toLowerCase()}`;
    if (text.includes('order') || text.includes('订单') || text.includes('product') || text.includes('产品')) return 'customer_order';
    if (text.includes('ship') || text.includes('物流') || text.includes('delivery') || text.includes('交付')) return 'logistics';
    if (text.includes('meeting') || text.includes('会议') || text.includes('schedule') || text.includes('日程')) return 'meeting';
    if (text.includes('invoice') || text.includes('账单') || text.includes('payment') || text.includes('付款')) return 'billing';
    if (text.includes('security') || text.includes('安全') || text.includes('alert') || text.includes('警告')) return 'notification';
    if (text.includes('sale') || text.includes('促销') || text.includes('discount') || text.includes('优惠')) return 'marketing';
    if (text.includes('facebook') || text.includes('twitter') || text.includes('linkedin') || text.includes('social')) return 'social';
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

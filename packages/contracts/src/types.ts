/**
 * Shared contracts for MailMind
 * 
 * This package defines Zod schemas, DTOs, and types shared across
 * the Web and Desktop applications.
 */

// ---------------------------------------------------------------------------
// Locale & Theme
// ---------------------------------------------------------------------------

export const SUPPORTED_LOCALES = ['zh-CN', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_THEMES = ['light', 'dark'] as const;
export type ThemePreference = (typeof SUPPORTED_THEMES)[number];

export type UiPreference = {
  locale: Locale;
  theme: ThemePreference;
};

// ---------------------------------------------------------------------------
// Email Categories (stable codes, never translated)
// ---------------------------------------------------------------------------

export type EmailCategoryCode =
  | 'customer_order'    // 订单/客户
  | 'logistics'         // 账单/物流
  | 'meeting'           // 日程/会议
  | 'billing'           // 账单提醒
  | 'notification'      // 系统通知
  | 'marketing'         // 营销
  | 'social'            // 社交
  | 'other'             // 其他
  | 'needs_review';     // 需人工复核（提示注入等）

export const EMAIL_CATEGORIES: EmailCategoryCode[] = [
  'customer_order',
  'logistics',
  'meeting',
  'billing',
  'notification',
  'marketing',
  'social',
  'other',
  'needs_review',
];

// ---------------------------------------------------------------------------
// Priority
// ---------------------------------------------------------------------------

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

// ---------------------------------------------------------------------------
// Suggested Action
// ---------------------------------------------------------------------------

export type SuggestedAction = {
  action: string;
  due_at?: string | null;
  reason?: string | null;
};

// ---------------------------------------------------------------------------
// Key Fact
// ---------------------------------------------------------------------------

export type KeyFact = {
  label: string;
  value: string;
};

// ---------------------------------------------------------------------------
// Deadline
// ---------------------------------------------------------------------------

export type Deadline = {
  value: string;       // ISO date string
  source: string;      // human-readable source, e.g. "本周四"
  confidence: number;  // 0–1
};

// ---------------------------------------------------------------------------
// EmailInsight
// ---------------------------------------------------------------------------

export type EmailInsight = {
  schemaVersion: '1.1';
  sourceEmailId: string;
  outputLocale: Locale;
  oneLineSummary: string;           // ≤70 汉字 / characters
  category: EmailCategoryCode;
  priority: Priority;
  requiresAction: boolean;
  suggestedActions: SuggestedAction[];  // ≤3
  keyFacts: KeyFact[];
  deadline: Deadline | null;
  riskFlags: string[];
  confidence: number;               // 0–1
  needsHumanReview: boolean;
};

// ---------------------------------------------------------------------------
// Digest Items
// ---------------------------------------------------------------------------

export type DigestItem = {
  text: string;
  email_refs: string[];   // source_email_id list
};

export type DigestAction = {
  action: string;
  email_refs: string[];
  due_at?: string | null;
};

// ---------------------------------------------------------------------------
// DigestReport
// ---------------------------------------------------------------------------

export type DigestReport = {
  schemaVersion: '1.1';
  periodStart: string;
  periodEnd: string;
  headline: string;
  topPriorities: DigestItem[];              // ≤5
  recommendedActions: DigestAction[];       // ≤7
  risksAndBlockers: DigestItem[];
  noActionRequired: DigestItem[];
  outputLocale: Locale;
};

// ---------------------------------------------------------------------------
// EmailCardViewModel (UI-only display model)
// ---------------------------------------------------------------------------

export type EmailCardViewModel = Omit<EmailInsight, 'sourceEmailId'> & {
  /** Display name of sender (sanitized) */
  senderName: string;
  /** Sender domain (for anonymized display) */
  senderDomain: string;
  /** Received datetime ISO string */
  receivedAt: string;
  /** Has attachments (boolean flag only) */
  hasAttachments: boolean;
  /** Subject line */
  subject: string;
};

// ---------------------------------------------------------------------------
// Sanitized Email Detail
// ---------------------------------------------------------------------------

export type SanitizedEmailDetail = {
  from: string;
  to: string[];
  subject: string;
  receivedAt: string;
  bodyTextExcerpt: string;   // up to 1500 chars, sanitized
  hasAttachments: boolean;
  attachmentCount: number;
  rawHeaders?: Record<string, string>;  // non-sensitive headers only
};

// ---------------------------------------------------------------------------
// Stream Event Types
// ---------------------------------------------------------------------------

export type ErrorCode =
  | 'AUTH_FAILED'
  | 'TLS_FAILED'
  | 'PROTOCOL_UNSUPPORTED'
  | 'LIMIT_REACHED'
  | 'MODEL_UNAVAILABLE'
  | 'EMAIL_PARSE_FAILED'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'SESSION_DISPOSED';

export type LlmUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type ProgressStage =
  | 'connecting'
  | 'listing'
  | 'fetching'
  | 'parsing'
  | 'classifying'
  | 'ranking'
  | 'digesting';

export type StreamEvent =
  | { type: 'progress'; stage: ProgressStage; message: string }
  | { type: 'email'; card: EmailCardViewModel; detail: SanitizedEmailDetail }
  | { type: 'completed'; insights: EmailInsight[]; usage?: LlmUsage }
  | { type: 'error'; code: ErrorCode; retryable: boolean; safeMessage: string };

// ---------------------------------------------------------------------------
// Connection Input
// ---------------------------------------------------------------------------

export type Protocol = 'imap' | 'pop3';
export type EncryptionMethod = 'ssl' | 'starttls';

export type ConnectionConfig = {
  protocol: Protocol;
  host: string;
  port: number;
  encryption: EncryptionMethod;
  username: string;
  /** Password is passed in a separate secure field, never stored in config */
};

export type LlmConfig = {
  baseUrl: string;
  apiKey: string;   // passed per-request, not persisted in Web
  model: string;
  timeoutMs?: number;
};

export type ConsentInput = {
  userAgreement: boolean;
  privacyPolicy: boolean;
  mailProcessingAuth: boolean;
  policyVersion: string;  // e.g. "1.1"
  consentedAt: string;    // ISO datetime
};

export type AnalyzeRequest = {
  consent: ConsentInput;
  connection: ConnectionConfig;
  llm?: LlmConfig;
  uiPreference: UiPreference;
  maxEmails?: number;    // default 10
};

export type DigestRequest = {
  consent: ConsentInput;
  insights: EmailInsight[];
  windowStart: string;
  windowEnd: string;
  uiPreference: UiPreference;
};

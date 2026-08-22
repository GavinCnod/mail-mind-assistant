/**
 * Zod validation schemas for MailMind contracts
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Locale & Theme
// ---------------------------------------------------------------------------

export const localeSchema = z.enum(['zh-CN', 'en']);
export type LocaleSchema = z.infer<typeof localeSchema>;

export const themeSchema = z.enum(['light', 'dark']);
export type ThemeSchema = z.infer<typeof themeSchema>;

export const uiPreferenceSchema = z.object({
  locale: localeSchema,
  theme: themeSchema,
});
export type UiPreferenceSchema = z.infer<typeof uiPreferenceSchema>;

// ---------------------------------------------------------------------------
// Email Categories
// ---------------------------------------------------------------------------

export const emailCategorySchema = z.enum([
  'customer_order',
  'logistics',
  'meeting',
  'billing',
  'notification',
  'marketing',
  'social',
  'other',
  'needs_review',
]);
export type EmailCategorySchema = z.infer<typeof emailCategorySchema>;

// ---------------------------------------------------------------------------
// Priority
// ---------------------------------------------------------------------------

export const prioritySchema = z.enum(['P0', 'P1', 'P2', 'P3']);
export type PrioritySchema = z.infer<typeof prioritySchema>;

// ---------------------------------------------------------------------------
// Suggested Action
// ---------------------------------------------------------------------------

export const suggestedActionSchema = z.object({
  action: z.string().min(1),
  due_at: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});
export type SuggestedActionSchema = z.infer<typeof suggestedActionSchema>;

// ---------------------------------------------------------------------------
// Key Fact
// ---------------------------------------------------------------------------

export const keyFactSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});
export type KeyFactSchema = z.infer<typeof keyFactSchema>;

// ---------------------------------------------------------------------------
// Deadline
// ---------------------------------------------------------------------------

export const deadlineSchema = z.object({
  value: z.string(),
  source: z.string(),
  confidence: z.number().min(0).max(1),
});
export type DeadlineSchema = z.infer<typeof deadlineSchema>;

// ---------------------------------------------------------------------------
// EmailInsight
// ---------------------------------------------------------------------------

export const emailInsightSchema = z.object({
  schemaVersion: z.literal('1.1'),
  sourceEmailId: z.string().min(1),
  outputLocale: localeSchema,
  oneLineSummary: z.string().max(70, 'Summary must be ≤70 characters'),
  category: emailCategorySchema,
  priority: prioritySchema,
  requiresAction: z.boolean(),
  suggestedActions: z.array(suggestedActionSchema).max(3),
  keyFacts: z.array(keyFactSchema),
  deadline: deadlineSchema.nullable(),
  riskFlags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  needsHumanReview: z.boolean(),
});
export type EmailInsightSchema = z.infer<typeof emailInsightSchema>;

// ---------------------------------------------------------------------------
// Digest Items
// ---------------------------------------------------------------------------

export const digestItemSchema = z.object({
  text: z.string(),
  email_refs: z.array(z.string()),
});
export type DigestItemSchema = z.infer<typeof digestItemSchema>;

export const digestActionSchema = z.object({
  action: z.string(),
  email_refs: z.array(z.string()),
  due_at: z.string().nullable().optional(),
});
export type DigestActionSchema = z.infer<typeof digestActionSchema>;

// ---------------------------------------------------------------------------
// DigestReport
// ---------------------------------------------------------------------------

export const digestReportSchema = z.object({
  schemaVersion: z.literal('1.1'),
  periodStart: z.string(),
  periodEnd: z.string(),
  headline: z.string(),
  topPriorities: z.array(digestItemSchema).max(5),
  recommendedActions: z.array(digestActionSchema).max(7),
  risksAndBlockers: z.array(digestItemSchema),
  noActionRequired: z.array(digestItemSchema),
  outputLocale: localeSchema,
});
export type DigestReportSchema = z.infer<typeof digestReportSchema>;

// ---------------------------------------------------------------------------
// EmailCardViewModel (UI display model)
// ---------------------------------------------------------------------------

export const emailCardViewModelSchema = z.object({
  senderName: z.string(),
  senderDomain: z.string(),
  receivedAt: z.string(),
  hasAttachments: z.boolean(),
  subject: z.string(),
  // Inherit all fields from EmailInsight except sourceEmailId
  outputLocale: localeSchema,
  oneLineSummary: z.string().max(70),
  category: emailCategorySchema,
  priority: prioritySchema,
  requiresAction: z.boolean(),
  suggestedActions: z.array(suggestedActionSchema).max(3),
  keyFacts: z.array(keyFactSchema),
  deadline: deadlineSchema.nullable(),
  riskFlags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  needsHumanReview: z.boolean(),
});
export type EmailCardViewModelSchema = z.infer<typeof emailCardViewModelSchema>;

// ---------------------------------------------------------------------------
// Sanitized Email Detail
// ---------------------------------------------------------------------------

export const sanitizedEmailDetailSchema = z.object({
  from: z.string(),
  to: z.array(z.string()),
  subject: z.string(),
  receivedAt: z.string(),
  bodyTextExcerpt: z.string().max(1500),
  hasAttachments: z.boolean(),
  attachmentCount: z.number(),
  rawHeaders: z.record(z.string()).optional(),
});
export type SanitizedEmailDetailSchema = z.infer<typeof sanitizedEmailDetailSchema>;

// ---------------------------------------------------------------------------
// Stream Events
// ---------------------------------------------------------------------------

export const progressStageSchema = z.enum([
  'connecting',
  'listing',
  'fetching',
  'parsing',
  'classifying',
  'ranking',
  'digesting',
]);

export const errorCodeSchema = z.enum([
  'AUTH_FAILED',
  'TLS_FAILED',
  'PROTOCOL_UNSUPPORTED',
  'LIMIT_REACHED',
  'MODEL_UNAVAILABLE',
  'EMAIL_PARSE_FAILED',
  'SCHEMA_VALIDATION_FAILED',
  'SESSION_DISPOSED',
]);

export const streamEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('progress'),
    stage: progressStageSchema,
    message: z.string(),
  }),
  z.object({
    type: z.literal('email'),
    card: emailCardViewModelSchema,
    detail: sanitizedEmailDetailSchema,
  }),
  z.object({
    type: z.literal('completed'),
    insights: z.array(emailInsightSchema),
    usage: z.object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    }).optional(),
  }),
  z.object({
    type: z.literal('error'),
    code: errorCodeSchema,
    retryable: z.boolean(),
    safeMessage: z.string(),
  }),
]);
export type StreamEventSchema = z.infer<typeof streamEventSchema>;

// ---------------------------------------------------------------------------
// Connection Input
// ---------------------------------------------------------------------------

export const protocolSchema = z.enum(['imap', 'pop3']);
export const encryptionMethodSchema = z.enum(['ssl', 'starttls']);

export const connectionConfigSchema = z.object({
  protocol: protocolSchema,
  host: z.string().min(1),
  port: z.number().int().positive(),
  encryption: encryptionMethodSchema,
  username: z.string().min(1),
});
export type ConnectionConfigSchema = z.infer<typeof connectionConfigSchema>;

export const llmConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
  timeoutMs: z.number().optional(),
});
export type LlmConfigSchema = z.infer<typeof llmConfigSchema>;

export const consentInputSchema = z.object({
  userAgreement: z.literal(true),
  privacyPolicy: z.literal(true),
  mailProcessingAuth: z.literal(true),
  policyVersion: z.string(),
  consentedAt: z.string(),
});
export type ConsentInputSchema = z.infer<typeof consentInputSchema>;

// ---------------------------------------------------------------------------
// API Request/Response Types
// ---------------------------------------------------------------------------

export const analyzeRequestSchema = z.object({
  consent: consentInputSchema,
  connection: connectionConfigSchema,
  llm: llmConfigSchema.optional(),
  uiPreference: uiPreferenceSchema,
  maxEmails: z.number().int().min(1).max(10).optional(),
});
export type AnalyzeRequestSchema = z.infer<typeof analyzeRequestSchema>;

export const digestRequestSchema = z.object({
  consent: consentInputSchema,
  insights: z.array(emailInsightSchema),
  windowStart: z.string(),
  windowEnd: z.string(),
  uiPreference: uiPreferenceSchema,
});
export type DigestRequestSchema = z.infer<typeof digestRequestSchema>;

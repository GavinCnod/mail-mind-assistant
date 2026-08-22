/**
 * MIME email parser using mailparser
 * Extracts structured fields from raw email content
 */
import { simpleParser, type ParsedMail } from 'mailparser';
import { type EmailHeader } from './imap-client';
import { sanitizeContent, detectPromptInjection } from './sanitize-html';

export interface ParsedEmail {
  header: EmailHeader;
  from: string;
  fromEmail: string;
  subject: string;
  receivedAt: Date;
  bodyPlain: string;
  bodyHtml: string | null;
  hasAttachments: boolean;
  attachmentCount: number;
  injectionRisk: boolean;
  sanitizedExcerpt: string;
}

/** Parse a raw email buffer into structured data */
export async function parseEmailBuffer(
  rawBuffer: Buffer,
  header: EmailHeader,
): Promise<ParsedEmail> {
  try {
    const parsed: ParsedMail = await simpleParser(rawBuffer);

    // Access address via .value array (mailparser type)
    const fromValue = parsed.from?.value as { name?: string; address?: string }[] | undefined;
    const firstFrom = fromValue?.[0];
    const fromName = firstFrom?.name || '';
    const fromEmail = firstFrom?.address || '';
    const senderDisplay = fromName ? `${fromName} <${fromEmail}>` : fromEmail || 'Unknown';

    const bodyPlain = (parsed.text?.toString() ?? '').trim();
    const bodyHtml = typeof parsed.html === 'string' ? parsed.html : null;
    const attachmentCount = (parsed.attachments?.length ?? 0) as number;

    // Build sanitized excerpt (plain text fallback)
    const sourceText = bodyPlain || (bodyHtml ? stripHtml(bodyHtml) : '');
    const sanitizedExcerpt = sanitizeContent(sourceText, 1500);

    // Check for prompt injection risk
    const injectionRisk = detectPromptInjection(sourceText);

    return {
      header,
      from: senderDisplay,
      fromEmail,
      subject: header.subject || '(无主题)',
      receivedAt: parsed.date || new Date(),
      bodyPlain,
      bodyHtml,
      hasAttachments: attachmentCount > 0,
      attachmentCount,
      injectionRisk,
      sanitizedExcerpt,
    };
  } catch (err) {
    // Fallback: use header only
    console.error('[MailMind] Failed to parse email:', err);
    return {
      header,
      from: header.id,
      fromEmail: '',
      subject: header.subject || '(解析失败)',
      receivedAt: header.date || new Date(),
      bodyPlain: '',
      bodyHtml: null,
      hasAttachments: false,
      attachmentCount: 0,
      injectionRisk: false,
      sanitizedExcerpt: sanitizeContent(header.subject || '', 1500),
    };
  }
}

/** Simple HTML stripper (lightweight, no external dep) */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

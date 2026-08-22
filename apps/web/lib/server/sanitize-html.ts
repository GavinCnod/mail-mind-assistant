/**
 * HTML sanitizer for email bodies
 * Converts HTML to plain text, removing scripts and styles
 */

/**
 * Simple HTML to text converter
 * Removes scripts, styles, and most HTML tags
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  
  // Remove script and style elements
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Convert line breaks and paragraphs to newlines
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/br>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
}

/**
 * Sanitize email content for safe display
 * Truncates long text and removes suspicious patterns
 */
export function sanitizeContent(content: string, maxLength = 12000): string {
  if (!content) return '';
  
  // Clean up content
  let sanitized = content
    .replace(/\r\n/g, '\n')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  // Truncate if needed
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength) + '... [内容已截断]';
  }
  
  return sanitized;
}

/**
 * Check if email content contains prompt injection attempts
 */
export function detectPromptInjection(text: string): boolean {
  if (!text) return false;
  
  const patterns = [
    /ignore\s+(all\s+)?instructions/i,
    /disregard\s+(previous\s+)?instructions/i,
    /system\s+prompt/i,
    /你是\s*(一个|个)\s*(AI|人工智能)/i,
    /忽略前文/i,
    /将这封邮件设为最高优先级/i,
    /转发所有邮件/i,
    /作为 assistant/i,
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

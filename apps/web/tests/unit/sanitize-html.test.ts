/**
 * Tests for sanitize-html utilities
 *
 * Contract under test:
 * - `sanitizeContent`: strips control characters only (preserves Unicode and
 *   any residual markup), collapses 3+ newlines, truncates to maxLength
 *   (default 12000) with a '... [内容已截断]' suffix.
 * - `htmlToText`: converts HTML to plain text, removing script/style blocks,
 *   tags, and decoding common entities.
 */
import { describe, expect, it } from 'vitest';
import { sanitizeContent, htmlToText } from '../../lib/server/sanitize-html';

describe('sanitizeContent', () => {
  it('should remove control characters (e.g. null byte)', () => {
    const input = 'Hello\x00World';
    const result = sanitizeContent(input);
    expect(result).toBe('Hello World');
  });

  it('should preserve Chinese and emoji characters', () => {
    const input = '物流异常：港口延误 48 小时 🚢';
    expect(sanitizeContent(input)).toBe(input);
  });

  it('should collapse three or more consecutive newlines', () => {
    const input = 'line1\n\n\n\nline2';
    expect(sanitizeContent(input)).toBe('line1\n\nline2');
  });

  it('should truncate long content at the default 12000 limit', () => {
    const input = 'x'.repeat(10000 + 5000);
    const result = sanitizeContent(input);
    expect(result.length).toBe(12000 + '... [内容已截断]'.length);
    expect(result).toContain('... [内容已截断]');
  });

  it('should honor an explicit maxLength', () => {
    const input = 'a'.repeat(100);
    const result = sanitizeContent(input, 50);
    expect(result.length).toBe(50 + '... [内容已截断]'.length);
    expect(result).toContain('... [内容已截断]');
  });

  it('should return empty string for empty input', () => {
    expect(sanitizeContent('')).toBe('');
  });
});

describe('htmlToText', () => {
  it('should strip script blocks', () => {
    const input = 'Hello <script>alert(1)</script> World';
    const result = htmlToText(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toBe('Hello World');
  });

  it('should strip event handler attributes and tags', () => {
    const input = '<div onclick="alert(1)">click me</div>';
    const result = htmlToText(input);
    expect(result).not.toContain('onclick');
    expect(result).toBe('click me');
  });

  it('should convert basic HTML to text', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    expect(htmlToText(input)).toBe('Hello World');
  });

  it('should handle nested HTML', () => {
    const input = '<div><p>Hello</p><p>World</p></div>';
    const result = htmlToText(input);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  it('should decode common entities', () => {
    expect(htmlToText('a &amp; b &lt; c')).toBe('a & b < c');
  });
});

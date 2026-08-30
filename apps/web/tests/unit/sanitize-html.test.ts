import { describe, expect, it } from 'vitest';
import { sanitizeContent, htmlToText } from '../../lib/server/sanitize';

describe('sanitize-html', () => {
  describe('sanitizeContent', () => {
    it('should remove null bytes', () => {
      const input = 'Hello\x00World';
      const result = sanitizeContent(input);
      expect(result).toBe('Hello World');
    });

    it('should strip script tags', () => {
      const input = 'Hello <script>alert(1)</script> World';
      const result = sanitizeContent(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should strip event handlers', () => {
      const input = '<div onclick="alert(1)">click me</div>';
      const result = sanitizeContent(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should truncate long content', () => {
      const input = 'x'.repeat(10000);
      const result = sanitizeContent(input);
      expect(result.length).toBeLessThanOrEqual(5000);
      expect(result).toContain('... [内容已截断]');
    });
  });

  describe('htmlToText', () => {
    it('should convert basic HTML to text', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = htmlToText(input);
      expect(result).toBe('Hello World');
    });

    it('should handle nested HTML', () => {
      const input = '<div><p>Hello</p><p>World</p></div>';
      const result = htmlToText(input);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });
});

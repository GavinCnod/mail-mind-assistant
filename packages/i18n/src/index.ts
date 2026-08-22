/**
 * Internationalization (i18n) package for MailMind
 * 
 * Provides translation dictionary, locale resolution, and formatting utilities.
 */
export { SUPPORTED_LOCALES, FALLBACK_LOCALE, resolvePreferredLocale, getLocaleName } from './locale';
export { zhCN } from './zh-CN';
export { en } from './en';
export { labels } from './labels';
export { formatDate, formatNumber, formatDateTime } from './format';

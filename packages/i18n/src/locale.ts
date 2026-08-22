import { type Locale } from '@mailmind/contracts';

export const SUPPORTED_LOCALES: readonly Locale[] = ['zh-CN', 'en'];

export const FALLBACK_LOCALE: Locale = 'en';

/** Resolve the effective locale from navigator / OS preference */
export function resolvePreferredLocale(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) return FALLBACK_LOCALE;
  const normalized = acceptLanguage.toLowerCase();
  if (normalized.includes('zh') || normalized.includes('zh-cn')) return 'zh-CN';
  return FALLBACK_LOCALE;
}

/** Get the display name of a locale */
export function getLocaleName(locale: Locale): string {
  return locale === 'zh-CN' ? '简体中文' : 'English';
}

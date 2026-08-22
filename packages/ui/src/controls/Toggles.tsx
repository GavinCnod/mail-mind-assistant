'use client';

import React from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { useLocale } from '../providers/LocaleProvider';

/** Theme toggle button — Light / Dark */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={t('common.theme')}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-button)',
        padding: 'var(--space-1) var(--space-2)',
        cursor: 'pointer',
        fontSize: '1.4rem',
        color: 'var(--text-primary)',
      }}
    >
      {theme === 'light' ? t('common.dark') : t('common.light')}
    </button>
  );
}

/** Locale toggle button — zh-CN / en */
export function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  const { t } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')}
      aria-label={t('common.language')}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-button)',
        padding: 'var(--space-1) var(--space-2)',
        cursor: 'pointer',
        fontSize: '1.4rem',
        color: 'var(--text-primary)',
      }}
    >
      {locale === 'zh-CN' ? 'EN' : '中文'}
    </button>
  );
}

'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Locale } from '@mailmind/contracts';
import { zhCN, en, resolvePreferredLocale } from '@mailmind/i18n';
import { type LocaleContextValue } from './types';

type TranslationDict = typeof zhCN;

function getValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === 'string') return current;
  return path;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return result;
}

const dictionaries: Record<Locale, TranslationDict> = {
  'zh-CN': zhCN,
  en: en as unknown as TranslationDict,
};

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('mm_locale');
  if (saved === 'zh-CN' || saved === 'en') return saved;
  return resolvePreferredLocale(navigator.language);
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: () => '',
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
    localStorage.setItem('mm_locale', locale);
  }, [locale]);

  const setLocale = (l: Locale) => setLocaleState(l);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[locale] ?? dictionaries['en'];
    let value = getValue(dict as unknown as Record<string, unknown>, key) as string;
    if (params) value = interpolate(value, params);
    return value;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

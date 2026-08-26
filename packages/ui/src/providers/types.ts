import { type Locale, type ThemePreference } from '@mailmind/contracts';

export type { Locale, ThemePreference };

export interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Get raw object/array value for dynamic rendering */
  getObject: (key: string) => unknown;
}

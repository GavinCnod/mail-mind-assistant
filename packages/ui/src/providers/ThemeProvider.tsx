'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type ThemeContextValue, type ThemePreference } from './types';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
});

/** Detect system preference on mount */
function getInitialTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('mm_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mm_theme', theme);
  }, [theme]);

  const setTheme = (t: ThemePreference) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

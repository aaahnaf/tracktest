import { useCallback, useEffect, useState } from 'react';
import { Theme } from '../lib/types';

const THEME_KEY = 'wdis-theme';

function readStoredTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark' || t === 'system') return t;
  } catch {
    /* noop */
  }
  return 'system';
}

/**
 * Owns the user's theme preference ('light' | 'dark' | 'system'), persists it
 * to localStorage, applies the resolved theme to <html>, and returns
 * { theme, setTheme, resolvedTheme }.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    
    const resolve = () => {
      if (theme === 'system') {
        setResolved(mq.matches ? 'dark' : 'light');
      } else {
        setResolved(theme);
      }
    };

    resolve();
    mq.addEventListener('change', resolve);
    return () => mq.removeEventListener('change', resolve);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.style.colorScheme = resolved;
    // let the Three.js world know which palette to render in
    window.dispatchEvent(new CustomEvent('wdis:theme', { detail: resolved }));
  }, [resolved]);

  return { theme, setTheme, resolvedTheme: resolved };
}

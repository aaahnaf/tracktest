import { useEffect, useState } from 'react';
import { Theme } from '../lib/types';

export function useTheme(theme: Theme) {
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

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
  }, [resolved]);

  return resolved;
}

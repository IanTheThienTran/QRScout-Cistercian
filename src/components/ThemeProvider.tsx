import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import configJson from '../config/config.json'; // adjust path to your config.json

export type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// initial context
const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  setTheme: () => null,
});

// helper to apply theme colors from config.json
function applyThemeColors(themeObj: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(themeObj).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

export function ThemeProvider({
  children,
  defaultTheme = configJson.defaultTheme || 'dark',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  // use localStorage if available, else fallback to defaultTheme
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) return stored;
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<Theme>(theme);

  // apply colors whenever resolvedTheme changes
  useEffect(() => {
    const themeObj =
      resolvedTheme === 'dark' ? configJson.theme.dark : configJson.theme.light;
    applyThemeColors(themeObj);
  }, [resolvedTheme]);

  // update resolvedTheme and <html> class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      setResolvedTheme(systemTheme);
      root.classList.add(systemTheme);
    } else {
      setResolvedTheme(theme);
      root.classList.add(theme);
    }
  }, [theme]);

  // setter that syncs with localStorage
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// hook to access theme anywhere
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

import {
  createContext,
  useContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { getItem, setItem, StorageKeys } from '@/lib/storage';

import { metrics, type Metrics } from './metrics';
import { type ColorScheme, type Palette, palettes, sepia, shadows, type Shadows } from './palette';

export type Appearance = 'system' | 'light' | 'dark';

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
  shadows: Shadows;
} & Metrics;

export type ThemeContextValue = {
  theme: Theme;
  appearance: Appearance;
  setAppearance: (value: Appearance) => void;
  /** False until the stored appearance has been read. */
  ready: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function isAppearance(value: string | null): value is Appearance {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function buildTheme(scheme: ColorScheme): Theme {
  return { scheme, colors: palettes[scheme], shadows: shadows[scheme], ...metrics };
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [appearance, setAppearanceState] = useState<Appearance>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getItem(StorageKeys.appearance).then((stored) => {
      if (cancelled) return;
      if (isAppearance(stored)) setAppearanceState(stored);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setAppearance = useCallback((value: Appearance) => {
    setAppearanceState(value);
    void setItem(StorageKeys.appearance, value);
  }, []);

  const scheme: ColorScheme =
    appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: buildTheme(scheme), appearance, setAppearance, ready }),
    [scheme, appearance, setAppearance, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export type ReadingTheme = 'light' | 'dark' | 'sepia';

/** Re-themes a subtree (the Quran reader) with a reading theme, keeping app settings. */
export function ThemeOverride({
  theme,
  children,
}: PropsWithChildren<{ theme: ReadingTheme | null }>) {
  const parent = useContext(ThemeContext);
  const value = useMemo<ThemeContextValue | null>(() => {
    if (!parent || !theme) return parent;
    const scheme: ColorScheme = theme === 'dark' ? 'dark' : 'light';
    const colors = theme === 'sepia' ? sepia : palettes[scheme];
    return { ...parent, theme: { ...buildTheme(scheme), colors } };
  }, [parent, theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

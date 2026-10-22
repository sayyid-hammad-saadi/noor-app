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
import {
  type Accent,
  ACCENTS,
  accentPalette,
  type ColorScheme,
  type Palette,
  sepia,
  shadows,
  type Shadows,
} from './palette';

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
  accent: Accent;
  setAccent: (value: Accent) => void;
  /** False until the stored appearance has been read. */
  ready: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function isAppearance(value: string | null): value is Appearance {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function buildTheme(scheme: ColorScheme, accent: Accent = 'teal'): Theme {
  return { scheme, colors: accentPalette(scheme, accent), shadows: shadows[scheme], ...metrics };
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [appearance, setAppearanceState] = useState<Appearance>('system');
  const [accent, setAccentState] = useState<Accent>('teal');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getItem(StorageKeys.appearance), getItem(StorageKeys.accent)]).then(
      ([stored, storedAccent]) => {
        if (cancelled) return;
        if (isAppearance(stored)) setAppearanceState(stored);
        if (ACCENTS.includes(storedAccent as Accent)) setAccentState(storedAccent as Accent);
        setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const setAppearance = useCallback((value: Appearance) => {
    setAppearanceState(value);
    void setItem(StorageKeys.appearance, value);
  }, []);

  const setAccent = useCallback((value: Accent) => {
    setAccentState(value);
    void setItem(StorageKeys.accent, value);
  }, []);

  const scheme: ColorScheme =
    appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme(scheme, accent),
      appearance,
      setAppearance,
      accent,
      setAccent,
      ready,
    }),
    [scheme, accent, appearance, setAppearance, setAccent, ready],
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
    const colors = theme === 'sepia' ? sepia : accentPalette(scheme, parent.accent);
    return { ...parent, theme: { ...buildTheme(scheme, parent.accent), colors } };
  }, [parent, theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

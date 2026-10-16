import { useContext, useMemo } from 'react';

import { type Theme, ThemeContext, type ThemeContextValue } from './ThemeProvider';

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}

/**
 * Creates a themed style hook:
 *   const useStyles = makeStyles((t) => StyleSheet.create({ root: { backgroundColor: t.colors.bg } }));
 *   const styles = useStyles();
 */
export function makeStyles<T>(factory: (theme: Theme) => T): () => T {
  return function useStyles() {
    const theme = useTheme();
    return useMemo(() => factory(theme), [theme]);
  };
}

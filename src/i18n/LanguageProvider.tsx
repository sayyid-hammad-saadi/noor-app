import { reloadAppAsync } from 'expo';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getItem, setItem, StorageKeys } from '@/lib/storage';
import type { Script } from '@/theme/typography';

import { i18n } from './instance';
import { isLanguage, type Language, languageMeta } from './languages';
import { formatNumber, localizeDigits, type NumberFormatOptions } from './numerals';
import { syncLayoutDirection } from './rtl';

export type LanguageContextValue = {
  language: Language;
  /** Typeface family for UI text in the current language. */
  script: Script;
  isRTL: boolean;
  /** True once a language was chosen and stored (used to skip the language screen). */
  hasChosenLanguage: boolean;
  setLanguage: (language: Language) => Promise<void>;
  formatNumber: (value: number, options?: NumberFormatOptions) => string;
  localizeDigits: (input: string | number) => string;
  /** False until the stored language has been applied. */
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function currentLanguage(): Language {
  return isLanguage(i18n.language) ? i18n.language : 'bn';
}

async function reloadForDirectionChange() {
  try {
    await reloadAppAsync('Layout direction changed');
  } catch {
    // If a reload is not possible the new direction applies on the next launch.
  }
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(currentLanguage);
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getItem(StorageKeys.language);
      const resolved = isLanguage(stored) ? stored : currentLanguage();
      if (cancelled) return;
      if (resolved !== i18n.language) await i18n.changeLanguage(resolved);
      if (syncLayoutDirection(resolved)) {
        await reloadForDirectionChange();
      }
      setLanguageState(resolved);
      setHasChosenLanguage(isLanguage(stored));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (next: Language) => {
    await setItem(StorageKeys.language, next);
    await i18n.changeLanguage(next);
    setLanguageState(next);
    setHasChosenLanguage(true);
    if (syncLayoutDirection(next)) {
      await reloadForDirectionChange();
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const meta = languageMeta[language];
    return {
      language,
      script: meta.script,
      isRTL: meta.rtl,
      hasChosenLanguage,
      setLanguage,
      formatNumber: (n, options) => formatNumber(n, language, options),
      localizeDigits: (input) => localizeDigits(input, language),
      ready,
    };
  }, [language, hasChosenLanguage, setLanguage, ready]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

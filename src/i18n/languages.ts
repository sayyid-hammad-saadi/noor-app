import type { Script } from '@/theme/typography';

export const LANGUAGES = ['bn', 'en', 'ar'] as const;
export type Language = (typeof LANGUAGES)[number];

export const FALLBACK_LANGUAGE: Language = 'bn';

export type NumeralSystem = 'beng' | 'latn' | 'arab';

export type LanguageMeta = {
  /** Name of the language in itself, for the language picker. */
  nativeName: string;
  /** Typeface family used for UI text in this language. */
  script: Script;
  rtl: boolean;
  numerals: NumeralSystem;
  /** BCP-47 tag for date formatting. */
  locale: string;
};

export const languageMeta: Record<Language, LanguageMeta> = {
  bn: { nativeName: 'বাংলা', script: 'bn', rtl: false, numerals: 'beng', locale: 'bn-BD' },
  en: { nativeName: 'English', script: 'latin', rtl: false, numerals: 'latn', locale: 'en-GB' },
  ar: { nativeName: 'العربية', script: 'ar', rtl: true, numerals: 'arab', locale: 'ar' },
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

import type { Language } from '@/i18n';

import { JUZ_ROWS, SURAH_ROWS } from './metadata.generated';

export type Surah = {
  number: number;
  ayahCount: number;
  /** Global ayah number (1–6236) of this surah's first ayah. */
  firstAyahId: number;
  meccan: boolean;
  revelationOrder: number;
  nameAr: string;
  name: { en: string; bn: string };
  meaning: { en: string; bn: string };
};

export type Juz = {
  number: number;
  surah: number;
  ayah: number;
  firstAyahId: number;
  nameAr: string;
};

export const SURAHS: readonly Surah[] = SURAH_ROWS.map(
  ([
    number,
    ayahCount,
    firstAyahId,
    meccan,
    revelationOrder,
    nameAr,
    en,
    enMeaning,
    bn,
    bnMeaning,
  ]) => ({
    number,
    ayahCount,
    firstAyahId,
    meccan: meccan === 1,
    revelationOrder,
    nameAr,
    name: { en, bn },
    meaning: { en: enMeaning, bn: bnMeaning },
  }),
);

export const JUZS: readonly Juz[] = JUZ_ROWS.map(([number, surah, ayah, firstAyahId, nameAr]) => ({
  number,
  surah,
  ayah,
  firstAyahId,
  nameAr,
}));

export function getSurah(n: number): Surah {
  return SURAHS[Math.min(114, Math.max(1, n)) - 1]!;
}

/** Surah name in the UI language (Arabic UI uses the Arabic name). */
export function surahName(s: Surah, language: Language): string {
  return language === 'ar' ? s.nameAr : s.name[language];
}

/** Meaning in the UI language; null in Arabic, where the name is the meaning. */
export function surahMeaning(s: Surah, language: Language): string | null {
  return language === 'ar' ? null : s.meaning[language];
}

/** Para (juz) containing a global ayah id. */
export function juzOfAyahId(ayahId: number): number {
  let juz = 1;
  for (const j of JUZS) if (j.firstAyahId <= ayahId) juz = j.number;
  return juz;
}

export const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

import type { TFunction } from 'i18next';

import { matchesAny, normalize } from '@/lib/search';
import { sourceLabel } from '@/lib/sources';

import { type Madhhab, MADHHABS, MASAIL, type Masalah, type Reference } from './masail';

export function questionOf(m: Masalah, t: TFunction): string {
  return t(`masail.items.${m.id as 'combine'}.q`);
}

/** The answer for a school; shared answers are the same for every school. */
export function answerOf(m: Masalah, school: Madhhab, t: TFunction): string {
  return m.schools === 'shared'
    ? t(`masail.items.${m.id as 'touchQuran'}.shared`)
    : t(`masail.items.${m.id as 'combine'}.${school}`);
}

export function refLabel(ref: Reference, t: TFunction, localizeDigits: (s: string) => string) {
  return 'book' in ref ? t(`masail.books.${ref.book}`) : sourceLabel(ref, t, localizeDigits);
}

/** Questions whose text or any school's answer contains the query. */
export function searchMasail(query: string, t: TFunction, pool: readonly Masalah[] = MASAIL) {
  const q = normalize(query.trim());
  if (!q) return [...pool];
  return pool.filter((m) =>
    matchesAny(q, [
      questionOf(m, t),
      t(`masail.tags.${m.tag as 'wudu'}`),
      ...MADHHABS.map((s) => answerOf(m, s, t)),
    ]),
  );
}

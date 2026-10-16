import type { TFunction } from 'i18next';

import type { HadithGrade } from '@/components/ui';

/** A reference such as "bukhari:2017" or "quran:9:36", with a grade for hadith. */
export type Source = { ref: string; grade?: HadithGrade };

export type Collection =
  | 'bukhari'
  | 'muslim'
  | 'tirmidhi'
  | 'abuDawud'
  | 'nasai'
  | 'ibnMajah'
  | 'ahmad'
  | 'ibnKhuzaymah'
  | 'quran';

/** "bukhari:2017" → "Bukhari 2017"; "quran:2:201" → "Quran 2:201", digits localized. */
export function sourceLabel(
  source: Source,
  t: TFunction,
  localizeDigits: (s: string) => string,
): string {
  const [collection, ...rest] = source.ref.split(':');
  return `${t(`sources.${collection as Collection}`)} ${localizeDigits(rest.join(':'))}`;
}

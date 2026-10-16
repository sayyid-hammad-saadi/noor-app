import type { TFunction } from 'i18next';

import type { Source } from './content';

type Collection = 'bukhari' | 'muslim' | 'tirmidhi' | 'abuDawud' | 'ibnKhuzaymah' | 'quran';

/** "bukhari:2017" → "Bukhari 2017"; "quran:2:201" → "Quran 2:201", digits localized. */
export function sourceLabel(
  source: Source,
  t: TFunction,
  localizeDigits: (s: string) => string,
): string {
  const [collection, ...rest] = source.ref.split(':');
  return `${t(`ramadan.collections.${collection as Collection}`)} ${localizeDigits(rest.join(':'))}`;
}

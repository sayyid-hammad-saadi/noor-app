import { useEffect, useState } from 'react';

import { type QuranSearchResult, searchQuran } from '@/features/quran/data/quranApi';
import type { Language } from '@/i18n';

export type QuranSearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; result: QuranSearchResult };

const MIN_LENGTH = 3;
const DEBOUNCE_MS = 350;
const ARABIC = /[؀-ۿ]/;

/** Searches the Quran text online, debounced, in the edition matching the query script. */
export function useQuranSearch(query: string, language: Language): QuranSearchState {
  const q = query.trim();
  const edition = ARABIC.test(q)
    ? 'quran-simple-clean'
    : language === 'bn' && /[ঀ-৿]/.test(q)
      ? 'bn.bengali'
      : 'en.sahih';
  const key = `${edition}:${q.toLowerCase()}`;
  const [entry, setEntry] = useState<{ key: string; state: QuranSearchState } | null>(null);

  useEffect(() => {
    if (q.length < MIN_LENGTH) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchQuran(q, edition, controller.signal).then(
        (result) => setEntry({ key, state: { status: 'ready', result } }),
        () => !controller.signal.aborted && setEntry({ key, state: { status: 'error' } }),
      );
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, q, edition]);

  if (q.length < MIN_LENGTH) return { status: 'idle' };
  return entry?.key === key ? entry.state : { status: 'loading' };
}

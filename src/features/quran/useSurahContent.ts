import { useCallback, useEffect, useState } from 'react';

import { loadSurah, type SurahContent } from './data/quranApi';

type State =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; content: SurahContent };

/** Loads a surah (cache first) with loading / error / retry states. */
export function useSurahContent(surah: number) {
  const [entry, setEntry] = useState<{ surah: number; attempt: number; state: State }>({
    surah,
    attempt: 0,
    state: { status: 'loading' },
  });
  const [attempt, setAttempt] = useState(0);
  // A new surah or retry shows loading without resetting state inside the effect.
  const state: State =
    entry.surah === surah && entry.attempt === attempt ? entry.state : { status: 'loading' };

  useEffect(() => {
    let cancelled = false;
    loadSurah(surah)
      .then(
        (content) =>
          !cancelled && setEntry({ surah, attempt, state: { status: 'ready', content } }),
      )
      .catch(() => !cancelled && setEntry({ surah, attempt, state: { status: 'error' } }));
    return () => {
      cancelled = true;
    };
  }, [surah, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { state, retry };
}

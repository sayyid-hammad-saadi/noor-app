import { useEffect, useState } from 'react';

import { cachedSurah } from '@/features/quran/data/quranApi';
import type { Bookmark } from '@/features/quran/data/library';

/**
 * Arabic text of bookmarked ayahs, from surahs already on the device. Bookmarks in
 * surahs that were never downloaded simply have no preview.
 */
export function useAyahTexts(list: readonly Bookmark[]): Record<string, string> {
  const surahs = [...new Set(list.map((b) => b.surah))].sort((a, b) => a - b).join(',');
  const [texts, setTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const wanted = surahs ? surahs.split(',').map(Number) : [];
    void Promise.all(wanted.map((s) => cachedSurah(s))).then((contents) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const c of contents) {
        if (!c) continue;
        for (const a of c.ayahs) next[`${c.surah}:${a.number}`] = a.arabic;
      }
      setTexts(next);
    });
    return () => {
      cancelled = true;
    };
  }, [surahs]);

  return texts;
}

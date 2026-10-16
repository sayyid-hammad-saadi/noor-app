import { useCallback, useEffect, useState } from 'react';

import { getItem, setItem, StorageKeys } from '@/lib/storage';

/** Bookmarked daily items (by id). Moves to the full Bookmarks feature later. */
export function useDailyBookmarks() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    getItem(StorageKeys.dailyBookmarks).then((raw) => {
      if (cancelled || !raw) return;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setIds(parsed.filter((x): x is string => typeof x === 'string'));
      } catch {
        // Ignore corrupt data; bookmarks start empty.
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((id: string): boolean => {
    let added = false;
    setIds((current) => {
      added = !current.includes(id);
      const next = added ? [...current, id] : current.filter((x) => x !== id);
      void setItem(StorageKeys.dailyBookmarks, JSON.stringify(next));
      return next;
    });
    return added;
  }, []);

  return { isBookmarked: (id: string) => ids.includes(id), toggle };
}

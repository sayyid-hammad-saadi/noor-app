import { useCallback, useEffect, useState } from 'react';

import { getItem, setItem, StorageKeys } from '@/lib/storage';

export const SALAWAT_TARGET = 100;

export type AmolItemId = 'isha' | 'witr' | 'tahajjud' | 'kahf' | 'mulk' | 'salawat';

type AmolDay = {
  /** Completion time (ms) per item; extra items from Month Amol use "cal:<id>". */
  done: Partial<Record<string, number>>;
  salawat: number;
};

const EMPTY: AmolDay = { done: {}, salawat: 0 };

/** Today's amol checklist, stored per local day. */
export function useAmol(day: string) {
  const key = `${StorageKeys.amol}.${day}` as const;
  // Keyed by day so a new day starts empty without resetting state in an effect.
  const [entry, setEntry] = useState<{ key: string; day: AmolDay }>({ key, day: EMPTY });
  const state = entry.key === key ? entry.day : EMPTY;

  useEffect(() => {
    let cancelled = false;
    getItem(key).then((raw) => {
      if (cancelled || !raw) return;
      try {
        const parsed = JSON.parse(raw) as Partial<AmolDay>;
        setEntry({ key, day: { done: parsed.done ?? {}, salawat: Number(parsed.salawat) || 0 } });
      } catch {
        // Corrupt entry: start the day fresh.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const update = useCallback(
    (fn: (s: AmolDay) => AmolDay) => {
      setEntry((current) => {
        const next = fn(current.key === key ? current.day : EMPTY);
        void setItem(key, JSON.stringify(next));
        return { key, day: next };
      });
    },
    [key],
  );

  const toggle = useCallback(
    (id: AmolItemId | `cal:${string}`) =>
      update((s) => {
        const done = { ...s.done };
        if (done[id]) delete done[id];
        else done[id] = Date.now();
        const salawat = id === 'salawat' ? (done[id] ? SALAWAT_TARGET : 0) : s.salawat;
        return { done, salawat };
      }),
    [update],
  );

  const addSalawat = useCallback(
    () =>
      update((s) => {
        const salawat = Math.min(SALAWAT_TARGET, s.salawat + 1);
        const done = { ...s.done };
        if (salawat >= SALAWAT_TARGET && !done.salawat) done.salawat = Date.now();
        return { done, salawat };
      }),
    [update],
  );

  return { done: state.done, salawat: state.salawat, toggle, addSalawat };
}

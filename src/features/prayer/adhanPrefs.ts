import { useSyncExternalStore } from 'react';

import { getItem, setItem, StorageKeys } from '@/lib/storage';

import { PRAYERS, type PrayerName } from './prayerTimes';

export type AdhanPrefs = Record<PrayerName, boolean>;

const DEFAULTS: AdhanPrefs = { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };

let prefs: AdhanPrefs = DEFAULTS;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// Load once at startup; screens re-render when it arrives.
void getItem(StorageKeys.adhan).then((raw) => {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Partial<AdhanPrefs>;
    prefs = Object.fromEntries(
      PRAYERS.map((p) => [p, typeof parsed[p] === 'boolean' ? parsed[p] : DEFAULTS[p]]),
    ) as AdhanPrefs;
    emit();
  } catch {
    // Keep defaults.
  }
});

export function setAdhan(prayer: PrayerName, on: boolean) {
  prefs = { ...prefs, [prayer]: on };
  void setItem(StorageKeys.adhan, JSON.stringify(prefs));
  emit();
}

/** Which prayers play the Adhan notification. Shared across screens. */
export function useAdhanPrefs(): AdhanPrefs {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => prefs,
  );
}

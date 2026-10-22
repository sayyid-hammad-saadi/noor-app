import { dayKey } from '@/lib/dateLabels';
import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

import { PRAYERS, type PrayerName } from './prayerTimes';

/** Prayers marked as prayed, per local day ("2026-10-22" → ["fajr", …]). */
export const prayerLog = createPersistedStore<Record<string, PrayerName[]>>(
  StorageKeys.prayerLog,
  {},
  (raw) => (raw && typeof raw === 'object' ? (raw as Record<string, PrayerName[]>) : {}),
);

export function togglePrayed(date: Date, prayer: PrayerName) {
  const key = dayKey(date);
  prayerLog.set((log) => {
    const day = log[key] ?? [];
    return {
      ...log,
      [key]: day.includes(prayer) ? day.filter((p) => p !== prayer) : [...day, prayer],
    };
  });
}

/**
 * Consecutive days with all five prayers marked, ending today. Today only counts once
 * it is complete, so an unfinished day doesn't break the streak.
 */
export function prayerStreak(log: Record<string, PrayerName[]>, today = new Date()): number {
  const full = (d: Date) => PRAYERS.every((p) => log[dayKey(d)]?.includes(p));
  const d = new Date(today);
  if (!full(d)) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (full(d)) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

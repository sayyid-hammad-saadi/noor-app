import { setHijriOffset } from '@/lib/calendars';
import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

import type { PrayerName } from './prayerTimes';

export const METHODS = ['karachi', 'mwl', 'ummAlQura', 'egyptian', 'isna', 'kuwait'] as const;
export type MethodKey = (typeof METHODS)[number] | 'custom';
export type MadhabKey = 'hanafi' | 'shafi';
export type HighLatRule = 'auto' | 'middle' | 'seventh' | 'angle';
export const HIGH_LAT_RULES: readonly HighLatRule[] = ['auto', 'middle', 'seventh', 'angle'];

/** Fajr and Isha angles (Isha as minutes after Maghrib for Umm al-Qura). */
export const METHOD_ANGLES: Record<
  (typeof METHODS)[number],
  { fajr: number; isha: number | `${number}m` }
> = {
  karachi: { fajr: 18, isha: 18 },
  mwl: { fajr: 18, isha: 17 },
  ummAlQura: { fajr: 18.5, isha: '90m' },
  egyptian: { fajr: 19.5, isha: 17.5 },
  isna: { fajr: 15, isha: 15 },
  kuwait: { fajr: 18, isha: 17.5 },
};

export type PrayerSettings = {
  /** null follows the regional default for the saved location. */
  method: MethodKey | null;
  madhab: MadhabKey | null;
  custom: { fajr: number; isha: number };
  /** Minutes added to each calculated time. */
  adjust: Record<PrayerName, number>;
  highLat: HighLatRule;
  /** Days added to the calculated Hijri date (−2 … +2), for local moon sighting. */
  hijriOffset: number;
  /** Sehri ends this many minutes before Fajr. */
  sehriMargin: number;
};

export const ADJUST_LIMIT = 30;
export const HIJRI_OFFSET_LIMIT = 2;
export const SEHRI_MARGINS = [0, 3, 5, 10, 15] as const;

const DEFAULTS: PrayerSettings = {
  method: null,
  madhab: null,
  custom: { fajr: 18, isha: 17 },
  adjust: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  highLat: 'auto',
  hijriOffset: 0,
  sehriMargin: 5,
};

const clamp = (n: unknown, lo: number, hi: number, fallback: number) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v * 10) / 10)) : fallback;
};

export const prayerSettings = createPersistedStore<PrayerSettings>(
  StorageKeys.prayerSettings,
  DEFAULTS,
  (raw) => {
    const r = (raw ?? {}) as Partial<PrayerSettings>;
    const adjust = { ...DEFAULTS.adjust };
    for (const p of Object.keys(adjust) as PrayerName[])
      adjust[p] = clamp(r.adjust?.[p], -ADJUST_LIMIT, ADJUST_LIMIT, 0);
    return {
      method:
        r.method === 'custom' || (METHODS as readonly string[]).includes(r.method ?? '')
          ? (r.method as MethodKey)
          : null,
      madhab: r.madhab === 'hanafi' || r.madhab === 'shafi' ? r.madhab : null,
      custom: {
        fajr: clamp(r.custom?.fajr, 10, 22, DEFAULTS.custom.fajr),
        isha: clamp(r.custom?.isha, 10, 22, DEFAULTS.custom.isha),
      },
      adjust,
      highLat: HIGH_LAT_RULES.includes(r.highLat as HighLatRule)
        ? (r.highLat as HighLatRule)
        : 'auto',
      hijriOffset: clamp(r.hijriOffset, -HIJRI_OFFSET_LIMIT, HIJRI_OFFSET_LIMIT, 0),
      sehriMargin: clamp(r.sehriMargin, 0, 30, DEFAULTS.sehriMargin),
    };
  },
);

export const updatePrayerSettings = (patch: Partial<PrayerSettings>) =>
  prayerSettings.set((s) => ({ ...s, ...patch }));

// Keep the calendar conversions in step with the saved offset.
prayerSettings.subscribe(() => setHijriOffset(prayerSettings.get().hijriOffset));

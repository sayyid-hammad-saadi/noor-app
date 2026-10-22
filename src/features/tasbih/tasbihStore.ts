import { dayKey } from '@/lib/dateLabels';
import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

export const PRESETS = [
  'subhanallah',
  'alhamdulillah',
  'allahuakbar',
  'lailaha',
  'astaghfirullah',
] as const;
export type PresetId = (typeof PRESETS)[number];

export const PRESET_ARABIC: Record<PresetId, string> = {
  subhanallah: 'سُبْحَانَ ٱللَّٰهِ',
  alhamdulillah: 'ٱلْحَمْدُ لِلَّٰهِ',
  allahuakbar: 'ٱللَّٰهُ أَكْبَرُ',
  lailaha: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
  astaghfirullah: 'أَسْتَغْفِرُ ٱللَّٰهَ',
};

export const TARGETS = [33, 34, 99, 100, 500, 1000] as const;

export type CustomDhikr = { id: string; label: string; meaning: string };

export type TasbihState = {
  dhikr: string;
  target: number;
  vibrate: boolean;
  /** Current count per dhikr. */
  counts: Record<string, number>;
  custom: CustomDhikr[];
  /** Total counted per local day. */
  daily: Record<string, number>;
};

const INITIAL: TasbihState = {
  dhikr: 'subhanallah',
  target: 33,
  vibrate: true,
  counts: {},
  custom: [],
  daily: {},
};

/** Days of history kept. */
const KEEP_DAYS = 60;

export const tasbih = createPersistedStore<TasbihState>(StorageKeys.tasbih, INITIAL, (raw) => {
  const r = (raw ?? {}) as Partial<TasbihState>;
  return {
    ...INITIAL,
    ...r,
    counts: r.counts && typeof r.counts === 'object' ? r.counts : {},
    custom: Array.isArray(r.custom) ? r.custom : [],
    daily: r.daily && typeof r.daily === 'object' ? r.daily : {},
  };
});

/** Adds one to the current dhikr and today's total; returns the new count. */
export function countOne(now = new Date()): number {
  let next = 0;
  tasbih.set((s) => {
    next = (s.counts[s.dhikr] ?? 0) + 1;
    const day = dayKey(now);
    const daily = { ...s.daily, [day]: (s.daily[day] ?? 0) + 1 };
    const days = Object.keys(daily).sort();
    for (const k of days.slice(0, Math.max(0, days.length - KEEP_DAYS))) delete daily[k];
    return { ...s, counts: { ...s.counts, [s.dhikr]: next }, daily };
  });
  return next;
}

export const resetCount = () =>
  tasbih.set((s) => ({ ...s, counts: { ...s.counts, [s.dhikr]: 0 } }));

export function addCustom(label: string, meaning: string): void {
  const id = `custom:${Date.now()}`;
  tasbih.set((s) => ({ ...s, dhikr: id, custom: [...s.custom, { id, label, meaning }] }));
}

export function removeCustom(id: string): void {
  tasbih.set((s) => ({
    ...s,
    dhikr: s.dhikr === id ? 'subhanallah' : s.dhikr,
    custom: s.custom.filter((c) => c.id !== id),
  }));
}

/** Today, the last 7 days, and the run of consecutive days with any count. */
export function stats(daily: Record<string, number>, now = new Date()) {
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    return dayKey(d);
  };
  const today = daily[day(0)] ?? 0;
  let week = 0;
  for (let i = 0; i < 7; i++) week += daily[day(i)] ?? 0;
  // A streak still counts if today hasn't been started yet.
  let streak = 0;
  for (let i = today ? 0 : 1; (daily[day(i)] ?? 0) > 0; i++) streak++;
  return { today, week, streak };
}

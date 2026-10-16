import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

const numbers = (v: unknown): number[] =>
  Array.isArray(v) ? v.filter((n): n is number => typeof n === 'number') : [];

/** Days fasted and nights of Taraweeh prayed, per Hijri year. */
export type YearLog = { fasts: number[]; taraweeh: number[] };
export type RamadanLog = Record<string, YearLog>;

export const ramadanLog = createPersistedStore<RamadanLog>(StorageKeys.ramadanLog, {}, (raw) => {
  if (!raw || typeof raw !== 'object') return {};
  const out: RamadanLog = {};
  for (const [year, v] of Object.entries(raw as Record<string, Partial<YearLog>>)) {
    out[year] = { fasts: numbers(v?.fasts), taraweeh: numbers(v?.taraweeh) };
  }
  return out;
});

export const EMPTY_YEAR: YearLog = { fasts: [], taraweeh: [] };

export function toggleLogDay(year: number, kind: keyof YearLog, day: number): void {
  ramadanLog.set((log) => {
    const current = log[year] ?? EMPTY_YEAR;
    const list = current[kind].includes(day)
      ? current[kind].filter((d) => d !== day)
      : [...current[kind], day].sort((a, b) => a - b);
    return { ...log, [year]: { ...current, [kind]: list } };
  });
}

/** Ashra amol per local day: completion flags and tap counts by item id. */
export type AmolDay = { done: Record<string, true>; counts: Record<string, number> };
type AmolLog = Record<string, AmolDay>;

/** Keep about a Ramadan's worth of days. */
const KEEP_DAYS = 40;

export const ramadanAmol = createPersistedStore<AmolLog>(StorageKeys.ramadanAmol, {}, (raw) =>
  raw && typeof raw === 'object' ? (raw as AmolLog) : {},
);

export const EMPTY_DAY: AmolDay = { done: {}, counts: {} };

export function updateAmolDay(day: string, fn: (d: AmolDay) => AmolDay): void {
  ramadanAmol.set((log) => {
    const next = { ...log, [day]: fn(log[day] ?? EMPTY_DAY) };
    const keys = Object.keys(next).sort();
    for (const k of keys.slice(0, Math.max(0, keys.length - KEEP_DAYS))) delete next[k];
    return next;
  });
}

/** Sehri and Iftar reminders. */
export type ReminderPrefs = { sehri: boolean; iftar: boolean };

export const reminderPrefs = createPersistedStore<ReminderPrefs>(
  StorageKeys.ramadanReminders,
  { sehri: false, iftar: false },
  (raw) => ({ sehri: false, iftar: false, ...(raw as Partial<ReminderPrefs>) }),
);

/** Minutes before the time each reminder fires. */
export const REMINDER_LEAD_MIN = { sehri: 30, iftar: 10 } as const;

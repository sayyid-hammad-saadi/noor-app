import { toHijri } from '@/lib/calendars';

const RAMADAN = 9;
const DAY_MS = 86_400_000;

export type AshraKey = 'rahmat' | 'maghfirat' | 'nijat';
export const ASHRAS: readonly AshraKey[] = ['rahmat', 'maghfirat', 'nijat'];

export type RamadanInfo = {
  /** Hijri year of this (or the coming) Ramadan. */
  year: number;
  /** Local midnight of 1 Ramadan. */
  start: Date;
  /** 29 or 30. */
  length: number;
  /** Day of Ramadan today (1-based), or null outside Ramadan. */
  day: number | null;
  /** Whole days until 1 Ramadan when it hasn't started yet. */
  daysUntil: number;
};

function midnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((midnight(b).getTime() - midnight(a).getTime()) / DAY_MS);
}

/**
 * The current Ramadan, or the next one once it has ended. Dates follow the tabular
 * Hijri calendar used across the app; the actual start depends on the moon sighting.
 */
export function ramadanInfo(now: Date): RamadanInfo {
  const today = midnight(now);
  const h = toHijri(today);
  let start: Date;
  if (h.month === RAMADAN) {
    start = addDays(today, -(h.day - 1));
  } else {
    // Walk forward to 1 Ramadan (at most one Hijri year).
    start = today;
    for (let i = 0; i < 400; i++) {
      const d = toHijri(start);
      if (d.month === RAMADAN && d.day === 1) break;
      start = addDays(start, 1);
    }
  }
  const year = toHijri(start).year;
  const length = toHijri(addDays(start, 29)).month === RAMADAN ? 30 : 29;
  const offset = daysBetween(start, today);
  return {
    year,
    start,
    length,
    day: offset >= 0 && offset < length ? offset + 1 : null,
    daysUntil: Math.max(0, -offset),
  };
}

export function ramadanDate(info: RamadanInfo, day: number): Date {
  return addDays(info.start, day - 1);
}

export function ashraOf(day: number): AshraKey {
  return day <= 10 ? 'rahmat' : day <= 20 ? 'maghfirat' : 'nijat';
}

/** First and last day of an ashra (the last one ends with the month). */
export function ashraDays(key: AshraKey, length = 30): [number, number] {
  const i = ASHRAS.indexOf(key);
  return [i * 10 + 1, Math.min(length, i * 10 + 10)];
}

/** Odd nights of the last ten. Night n begins at Maghrib on day n − 1. */
export function qadrNights(info: RamadanInfo): { night: number; evening: Date }[] {
  return [21, 23, 25, 27, 29]
    .filter((n) => n <= info.length)
    .map((night) => ({ night, evening: ramadanDate(info, night - 1) }));
}

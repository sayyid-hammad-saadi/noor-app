import { type DateParts, toHijri } from '@/lib/calendars';

export type HijriMonth = { year: number; month: number };

const DAY_MS = 86_400_000;

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function midnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((midnight(b).getTime() - midnight(a).getTime()) / DAY_MS);
}

/** Local midnight of 1 {month} {year} AH in the tabular calendar used across the app. */
export function hijriMonthStart({ year, month }: HijriMonth): Date {
  // Civil-calendar estimate, then correct by stepping until toHijri agrees.
  const jd =
    Math.floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    Math.floor((month - 1) / 2) +
    1 +
    1948440 -
    385;
  let d = new Date(Math.round((jd - 2440588) * DAY_MS));
  d = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const target = year * 12 + month;
  for (let i = 0; i < 60; i++) {
    const h = toHijri(d);
    const at = h.year * 12 + h.month;
    if (at === target) return addDays(d, -(h.day - 1));
    d = addDays(d, at < target ? 1 : -1);
  }
  return d;
}

export function shiftMonth({ year, month }: HijriMonth, n: number): HijriMonth {
  const index = year * 12 + (month - 1) + n;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function monthLength(m: HijriMonth): number {
  return daysBetween(hijriMonthStart(m), hijriMonthStart(shiftMonth(m, 1)));
}

export function hijriOf(date: Date): DateParts {
  return toHijri(date);
}

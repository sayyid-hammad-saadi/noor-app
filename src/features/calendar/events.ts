import type { Source } from '@/lib/sources';

import { addDays, hijriOf } from './hijriMonth';

/** night: special night (gold) · fast: sunnah fast or sacred day (teal) · holiday: Eid or national day (grey). */
export type EventKind = 'night' | 'fast' | 'holiday';

export type CalendarEvent = {
  /** i18n key under calendar.events. */
  id: EventId;
  kind: EventKind;
  /** The night begins at Maghrib on the evening before this date. */
  nightBefore?: boolean;
  source?: Source;
  /** Hijri month to open from the event card. */
  month?: number;
};

export type EventId =
  | 'newYear'
  | 'tasua'
  | 'ashura'
  | 'mawlid'
  | 'sacredStart'
  | 'bid'
  | 'miraj'
  | 'barat'
  | 'ramadanStart'
  | 'qadr'
  | 'eidFitr'
  | 'arafah'
  | 'eidAdha'
  | 'tashreeq'
  | 'motherLanguage'
  | 'independence'
  | 'boishakh'
  | 'mayDay'
  | 'victory';

const SACRED = new Set([1, 7, 11, 12]);

/** Events on a Hijri date. Ayyam al-Bid is added for every month except Ramadan. */
function hijriEvents(month: number, day: number): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const add = (e: CalendarEvent) => out.push({ month, ...e });
  if (month === 1 && day === 1) add({ id: 'newYear', kind: 'fast' });
  else if (SACRED.has(month) && day === 1) add({ id: 'sacredStart', kind: 'fast' });
  if (month === 1 && day === 9)
    add({ id: 'tasua', kind: 'fast', source: { ref: 'muslim:1134', grade: 'sahih' } });
  if (month === 1 && day === 10)
    add({ id: 'ashura', kind: 'fast', source: { ref: 'muslim:1162', grade: 'sahih' } });
  if (month === 3 && day === 12) add({ id: 'mawlid', kind: 'holiday' });
  if (month === 7 && day === 27) add({ id: 'miraj', kind: 'night', nightBefore: true });
  if (month === 8 && day === 15)
    add({
      id: 'barat',
      kind: 'night',
      nightBefore: true,
      source: { ref: 'ibnMajah:1390', grade: 'hasan' },
    });
  if (month === 9 && day === 1) add({ id: 'ramadanStart', kind: 'fast' });
  if (month === 9 && day === 27)
    add({
      id: 'qadr',
      kind: 'night',
      nightBefore: true,
      source: { ref: 'bukhari:2017', grade: 'sahih' },
    });
  if (month === 10 && day === 1) add({ id: 'eidFitr', kind: 'holiday' });
  if (month === 12 && day === 9)
    add({ id: 'arafah', kind: 'fast', source: { ref: 'muslim:1162', grade: 'sahih' } });
  if (month === 12 && day === 10) add({ id: 'eidAdha', kind: 'holiday' });
  if (month === 12 && day >= 11 && day <= 13)
    add({ id: 'tashreeq', kind: 'holiday', source: { ref: 'muslim:1141', grade: 'sahih' } });
  // No fasting on the days of Tashreeq; Ramadan is already a fast.
  const bid = day >= 13 && day <= 15 && month !== 9 && !(month === 12 && day === 13);
  if (bid) add({ id: 'bid', kind: 'fast', source: { ref: 'tirmidhi:761', grade: 'hasan' } });
  return out;
}

/** Fixed national days in Bangladesh, by Gregorian month (1–12) and day. */
const BD_DAYS: readonly [number, number, EventId][] = [
  [2, 21, 'motherLanguage'],
  [3, 26, 'independence'],
  [4, 14, 'boishakh'],
  [5, 1, 'mayDay'],
  [12, 16, 'victory'],
];

export function eventsOn(date: Date, countryCode: string | null): CalendarEvent[] {
  const h = hijriOf(date);
  const events = hijriEvents(h.month, h.day);
  if ((countryCode ?? 'BD') === 'BD') {
    for (const [m, d, id] of BD_DAYS) {
      if (date.getMonth() + 1 === m && date.getDate() === d) events.push({ id, kind: 'holiday' });
    }
  }
  return events;
}

/** The evening a night event begins (Maghrib of the previous day). */
export function eveningOf(date: Date): Date {
  return addDays(date, -1);
}

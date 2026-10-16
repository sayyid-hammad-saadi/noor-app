import type { TFunction } from 'i18next';

import { type Language, localizeDigits } from '@/i18n';

/** Hours and minutes of `date` in `timeZone` (or the device zone). */
function hoursMinutes(date: Date, timeZone: string | null): [number, number] {
  if (timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone,
      }).formatToParts(date);
      const h = Number(parts.find((p) => p.type === 'hour')?.value);
      const m = Number(parts.find((p) => p.type === 'minute')?.value);
      if (Number.isFinite(h) && Number.isFinite(m)) return [h % 24, m];
    } catch {
      // Engine without time-zone support: fall back to the device zone.
    }
  }
  return [date.getHours(), date.getMinutes()];
}

export type ClockParts = { time: string; period: 'am' | 'pm' };

/** 12-hour clock with localized digits: { time: "4:31", period: "am" }. */
export function clockParts(
  date: Date,
  language: Language,
  timeZone: string | null,
  { padHour = false }: { padHour?: boolean } = {},
): ClockParts {
  const [h, m] = hoursMinutes(date, timeZone);
  const hour12 = h % 12 || 12;
  const hh = padHour ? String(hour12).padStart(2, '0') : String(hour12);
  return {
    time: localizeDigits(`${hh}:${String(m).padStart(2, '0')}`, language),
    period: h < 12 ? 'am' : 'pm',
  };
}

/** Whole hours and minutes until `target` (never negative). */
export function untilParts(now: Date, target: Date): { hours: number; minutes: number } {
  const total = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 60000));
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

/** "4:31 AM" with localized digits and period. */
export function clockLabel(
  date: Date,
  language: Language,
  timeZone: string | null,
  t: TFunction,
): string {
  const c = clockParts(date, language, timeZone);
  return `${c.time} ${t(`time.${c.period}`)}`;
}

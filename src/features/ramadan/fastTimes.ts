import type { Place } from '@/features/location/LocationProvider';
import { prayerSettings } from '@/features/prayer/prayerSettings';
import { computeDay } from '@/features/prayer/prayerTimes';

import { addDays } from './ramadanCalendar';

/** Sehri ends this many minutes before Fajr, as a precaution (Settings; shown on the timetable). */
export const sehriMargin = () => prayerSettings.get().sehriMargin;

export type FastTimes = { sehri: Date; iftar: Date; fajr: Date; maghrib: Date };

export function fastTimes(place: Place, date: Date): FastTimes {
  const t = computeDay(place.latitude, place.longitude, date, place.countryCode);
  return {
    sehri: new Date(t.fajr.getTime() - sehriMargin() * 60_000),
    iftar: t.maghrib,
    fajr: t.fajr,
    maghrib: t.maghrib,
  };
}

export type FastPhase = {
  today: FastTimes;
  /** beforeSehri: night before the fast; fasting: Sehri → Iftar; done: after Iftar. */
  phase: 'beforeSehri' | 'fasting' | 'done';
  /** What the big countdown counts down to. */
  target: { kind: 'sehri' | 'iftar'; time: Date };
  /** Share of today's fast completed, 0–1. */
  progress: number;
};

export function fastPhase(place: Place, now: Date): FastPhase {
  const today = fastTimes(place, now);
  const span = today.iftar.getTime() - today.sehri.getTime();
  if (now < today.sehri) {
    return {
      today,
      phase: 'beforeSehri',
      target: { kind: 'sehri', time: today.sehri },
      progress: 0,
    };
  }
  if (now < today.iftar) {
    return {
      today,
      phase: 'fasting',
      target: { kind: 'iftar', time: today.iftar },
      progress: (now.getTime() - today.sehri.getTime()) / span,
    };
  }
  const tomorrow = fastTimes(place, addDays(now, 1));
  return { today, phase: 'done', target: { kind: 'sehri', time: tomorrow.sehri }, progress: 1 };
}

/** "03:42:18" until `target`. */
export function countdownParts(now: Date, target: Date): [number, number, number] {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60];
}

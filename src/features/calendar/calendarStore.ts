import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Place } from '@/features/location/LocationProvider';
import { PRAYER_CHANNEL_ID } from '@/features/prayer/adhanScheduler';
import { computeDay } from '@/features/prayer/prayerTimes';
import { dayKey } from '@/lib/dateLabels';
import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

import type { CalendarEvent } from './events';
import { addDays, hijriOf } from './hijriMonth';
import {
  MONTHS,
  monthKey,
  type MonthKey,
  type MonthPractice,
  type PracticeId,
} from './monthContent';

const strings = (raw: unknown) =>
  Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];

/** Practices added from Month Amol, as "rajab:monThu". They recur every year in that month. */
export const myAmol = createPersistedStore<string[]>(StorageKeys.myAmol, [], strings);

export const amolKey = (month: MonthKey, id: PracticeId) => `${month}:${id}`;

export function toggleMyAmol(month: MonthKey, id: PracticeId): boolean {
  const key = amolKey(month, id);
  const added = !myAmol.get().includes(key);
  myAmol.set((list) => (added ? [...list, key] : list.filter((k) => k !== key)));
  return added;
}

function scheduledOn(p: MonthPractice, date: Date, hijriDay: number): boolean {
  const s = p.schedule;
  if (!s) return false;
  if (s.kind === 'daily') return true;
  if (s.kind === 'monThu') return date.getDay() === 1 || date.getDay() === 4;
  return s.days.includes(hijriDay);
}

/** Added practices that apply on `date`, for Home's Today's Amol card. */
export function practicesOn(date: Date, added: readonly string[]): MonthPractice[] {
  const h = hijriOf(date);
  const key = monthKey(h.month);
  return MONTHS[key].practices.filter(
    (p) => added.includes(amolKey(key, p.id)) && scheduledOn(p, date, h.day),
  );
}

/** Event reminders the user set, as "2027-01-05:miraj". */
export const calendarReminders = createPersistedStore<string[]>(
  StorageKeys.calendarReminders,
  [],
  strings,
);

export const reminderKey = (date: Date, event: CalendarEvent) => `${dayKey(date)}:${event.id}`;

/**
 * When to remind: 30 min before Maghrib on the evening a night begins, 9 PM the
 * evening before a fast, 8 AM on a holiday.
 */
export function reminderTime(date: Date, event: CalendarEvent, place: Place): Date {
  if (event.kind === 'night') {
    const evening = event.nightBefore ? addDays(date, -1) : date;
    const { maghrib } = computeDay(place.latitude, place.longitude, evening, place.countryCode);
    return new Date(maghrib.getTime() - 30 * 60_000);
  }
  if (event.kind === 'fast') {
    const d = addDays(date, -1);
    d.setHours(21, 0, 0, 0);
    return d;
  }
  const d = new Date(date);
  d.setHours(8, 0, 0, 0);
  return d;
}

export async function setEventReminder(
  key: string,
  at: Date | null,
  content?: { title: string; body: string },
): Promise<void> {
  const id = `calendar:${key}`;
  if (Platform.OS !== 'web') {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
    if (at && content) {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: { ...content, sound: 'default' },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: at,
          channelId: PRAYER_CHANNEL_ID,
        },
      });
    }
  }
  calendarReminders.set((list) =>
    at ? [...list.filter((k) => k !== key), key] : list.filter((k) => k !== key),
  );
}

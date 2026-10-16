import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Platform } from 'react-native';

import { useLocation } from '@/features/location/LocationProvider';
import { PRAYER_CHANNEL_ID } from '@/features/prayer/adhanScheduler';
import { clockLabel } from '@/features/prayer/formatTime';
import { useLanguage } from '@/i18n';

import { fastTimes } from './fastTimes';
import { addDays, ramadanDate, ramadanInfo } from './ramadanCalendar';
import { REMINDER_LEAD_MIN, reminderPrefs } from './ramadanStore';

const ID_PREFIX = 'ramadan:';
/** Two reminders × 7 days, alongside 35 Adhan notifications, stays under iOS's 64 cap. */
const DAYS_AHEAD = 7;

/** Asks for notification permission; true when reminders can be delivered. */
export async function ensureNotificationPermission(channelName: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
      name: channelName,
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Keeps Sehri and Iftar reminders scheduled for the coming week of Ramadan.
 * Renders nothing; mounted once at the root next to the Adhan scheduler.
 */
export function RamadanReminders() {
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const { place } = useLocation();
  const prefs = reminderPrefs.use();

  useEffect(() => {
    let cancelled = false;

    const schedule = async () => {
      if (Platform.OS === 'web') return;
      const existing = await Notifications.getAllScheduledNotificationsAsync();
      await Promise.all(
        existing
          .filter((n) => n.identifier.startsWith(ID_PREFIX))
          .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
      );
      if (cancelled || (!prefs.sehri && !prefs.iftar)) return;
      if (!(await Notifications.getPermissionsAsync()).granted || cancelled) return;

      const now = new Date();
      const info = ramadanInfo(now);
      for (let d = 0; d < DAYS_AHEAD; d++) {
        const date = addDays(now, d);
        const day = Math.round((date.getTime() - ramadanDate(info, 1).getTime()) / 86_400_000) + 1;
        if (day < 1 || day > info.length) continue;
        const times = fastTimes(place, date);
        for (const kind of ['sehri', 'iftar'] as const) {
          if (!prefs[kind]) continue;
          const at = new Date(times[kind].getTime() - REMINDER_LEAD_MIN[kind] * 60_000);
          if (at <= now) continue;
          await Notifications.scheduleNotificationAsync({
            identifier: `${ID_PREFIX}${kind}:${at.getTime()}`,
            content: {
              title: t(`ramadan.reminders.${kind}Title`, {
                minutes: localizeDigits(REMINDER_LEAD_MIN[kind]),
              }),
              body: t(`ramadan.reminders.${kind}Body`, {
                time: clockLabel(times[kind], language, place.timeZone, t),
              }),
              sound: 'default',
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: at,
              channelId: PRAYER_CHANNEL_ID,
            },
          });
        }
      }
    };

    const timer = setTimeout(() => void schedule().catch(() => undefined), 1200);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void schedule().catch(() => undefined);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.remove();
    };
  }, [place, prefs, language, localizeDigits, t]);

  return null;
}

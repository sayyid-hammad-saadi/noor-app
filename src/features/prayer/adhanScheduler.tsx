import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Platform } from 'react-native';

import { useLocation } from '@/features/location/LocationProvider';
import { useLanguage } from '@/i18n';

import { useAdhanPrefs } from './adhanPrefs';
import {
  adhanDelivery,
  adhanSound,
  ensureAdhanChannel,
  notificationPrefs,
  PRAYER_CHANNEL_ID,
} from './adhanVoices';
import { clockLabel } from './formatTime';
import { computeDay, PRAYERS } from './prayerTimes';

export { PRAYER_CHANNEL_ID };
const ID_PREFIX = 'adhan:';
/**
 * Days scheduled ahead. iOS keeps at most 64 pending notifications: 5 prayers × 7 days,
 * or × 4 days when an early reminder doubles them.
 */
const DAYS_AHEAD = 7;
const DAYS_AHEAD_WITH_REMINDERS = 4;
const JUMUAH_HOUR = 11;
const JUMUAH_MINUTE = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Keeps a week of Adhan notifications scheduled for the saved location and the user's
 * per-prayer choices. Re-runs when either changes, the language changes or the app
 * comes to the foreground. Renders nothing.
 */
export function AdhanScheduler() {
  const { t } = useTranslation();
  const { language, localizeDigits } = useLanguage();
  const { place, settings } = useLocation();
  const prefs = useAdhanPrefs();
  const sound = adhanSound.use();
  const extra = notificationPrefs.use();

  useEffect(() => {
    let cancelled = false;

    const schedule = async () => {
      if (Platform.OS === 'web') return;
      const permission = await Notifications.getPermissionsAsync();
      if (!permission.granted || cancelled) return;

      const existing = await Notifications.getAllScheduledNotificationsAsync();
      await Promise.all(
        existing
          .filter((n) => n.identifier.startsWith(ID_PREFIX))
          .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
      );
      if (cancelled) return;

      const now = Date.now();
      const days = extra.reminderBefore ? DAYS_AHEAD_WITH_REMINDERS : DAYS_AHEAD;
      const channels = new Set<string>();
      for (let d = 0; d < days; d++) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        const times = computeDay(place.latitude, place.longitude, date, place.countryCode);
        for (const prayer of PRAYERS) {
          const at = times[prayer];
          if (!prefs[prayer] || at.getTime() <= now) continue;
          const name = t(`prayers.${prayer}`);
          const delivery = adhanDelivery(prayer, sound);
          if (!channels.has(delivery.channelId)) {
            channels.add(delivery.channelId);
            await ensureAdhanChannel(delivery, t('permissions.notifications.channelName'));
          }
          await Notifications.scheduleNotificationAsync({
            identifier: `${ID_PREFIX}${at.getTime()}:${prayer}`,
            content: {
              title: t('prayerTimes.adhanTitle', {
                prayer: name,
                time: clockLabel(at, language, place.timeZone, t),
              }),
              body: t('prayerTimes.adhanBody', { prayer: name }),
              sound: delivery.sound,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: at,
              channelId: delivery.channelId,
            },
          });
          const early = new Date(at.getTime() - extra.reminderBefore * 60_000);
          if (extra.reminderBefore && early.getTime() > now) {
            await Notifications.scheduleNotificationAsync({
              identifier: `${ID_PREFIX}pre:${at.getTime()}:${prayer}`,
              content: {
                title: t('settings.notifications.beforeTitle', {
                  prayer: name,
                  n: localizeDigits(extra.reminderBefore),
                }),
                body: t('settings.notifications.beforeBody', {
                  time: clockLabel(at, language, place.timeZone, t),
                }),
                sound: 'default',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: early,
                channelId: PRAYER_CHANNEL_ID,
              },
            });
          }
        }
      }

      // Jumu'ah: the coming Friday late morning.
      if (extra.jumuah) {
        const friday = new Date();
        friday.setDate(friday.getDate() + ((5 - friday.getDay() + 7) % 7));
        friday.setHours(JUMUAH_HOUR, JUMUAH_MINUTE, 0, 0);
        if (friday.getTime() <= now) friday.setDate(friday.getDate() + 7);
        await Notifications.scheduleNotificationAsync({
          identifier: `${ID_PREFIX}jumuah:${friday.getTime()}`,
          content: {
            title: t('notifications.jumuah'),
            body: t('notifications.jumuahBody'),
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: friday,
            channelId: PRAYER_CHANNEL_ID,
          },
        });
      }
    };

    const timer = setTimeout(() => void schedule().catch(() => undefined), 800);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void schedule().catch(() => undefined);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.remove();
    };
  }, [
    place.latitude,
    place.longitude,
    place.countryCode,
    place.timeZone,
    prefs,
    sound,
    extra,
    settings,
    language,
    localizeDigits,
    t,
  ]);

  return null;
}

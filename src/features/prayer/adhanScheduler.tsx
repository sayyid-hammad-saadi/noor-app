import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Platform } from 'react-native';

import { useLocation } from '@/features/location/LocationProvider';
import { useLanguage } from '@/i18n';

import { useAdhanPrefs } from './adhanPrefs';
import { clockLabel } from './formatTime';
import { computeDay, PRAYERS } from './prayerTimes';

export const PRAYER_CHANNEL_ID = 'prayer-times';
const ID_PREFIX = 'adhan:';
/** Days scheduled ahead; 5 prayers × 7 days stays under iOS's 64-notification cap. */
const DAYS_AHEAD = 7;

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
  const { language } = useLanguage();
  const { place } = useLocation();
  const prefs = useAdhanPrefs();

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
      for (let d = 0; d < DAYS_AHEAD; d++) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        const times = computeDay(place.latitude, place.longitude, date, place.countryCode);
        for (const prayer of PRAYERS) {
          const at = times[prayer];
          if (!prefs[prayer] || at.getTime() <= now) continue;
          const name = t(`prayers.${prayer}`);
          await Notifications.scheduleNotificationAsync({
            identifier: `${ID_PREFIX}${at.getTime()}:${prayer}`,
            content: {
              title: t('prayerTimes.adhanTitle', {
                prayer: name,
                time: clockLabel(at, language, place.timeZone, t),
              }),
              body: t('prayerTimes.adhanBody', { prayer: name }),
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

    const timer = setTimeout(() => void schedule().catch(() => undefined), 800);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void schedule().catch(() => undefined);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.remove();
    };
  }, [place.latitude, place.longitude, place.countryCode, place.timeZone, prefs, language, t]);

  return null;
}

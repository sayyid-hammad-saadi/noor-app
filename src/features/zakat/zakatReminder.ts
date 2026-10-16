import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { PRAYER_CHANNEL_ID } from '@/features/prayer/adhanScheduler';

import { HAWL_DAYS } from './zakatCalc';

const id = (year: number) => `zakat:${year}`;

/** When the next calculation is due: one lunar year later, at 10:00. */
export function hawlDate(createdAt: number): Date {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + HAWL_DAYS);
  d.setHours(10, 0, 0, 0);
  return d;
}

export async function scheduleHawlReminder(
  year: number,
  createdAt: number,
  content: { title: string; body: string },
): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id(year)).catch(() => undefined);
  await Notifications.scheduleNotificationAsync({
    identifier: id(year),
    content: { ...content, sound: 'default' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: hawlDate(createdAt),
      channelId: PRAYER_CHANNEL_ID,
    },
  });
}

export async function cancelHawlReminder(year: number): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id(year)).catch(() => undefined);
}

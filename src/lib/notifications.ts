import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { PRAYER_CHANNEL_ID } from '@/features/prayer/adhanScheduler';

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

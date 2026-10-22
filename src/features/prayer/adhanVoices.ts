import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

import { ADHAN_ASSETS } from './adhanAssets';
import type { PrayerName } from './prayerTimes';

export const VOICES = ['makkah', 'madinah', 'aqsa', 'alafasy', 'takbir'] as const;
export type VoiceId = (typeof VOICES)[number];
export type AdhanChoice = 'default' | 'silent' | VoiceId;

export const isVoiceAvailable = (v: VoiceId) => !!ADHAN_ASSETS[v];

export type AdhanSound = {
  voice: AdhanChoice;
  /** Use the voice's Fajr recording (with "prayer is better than sleep") at Fajr. */
  fajrSeparate: boolean;
};

export const adhanSound = createPersistedStore<AdhanSound>(
  StorageKeys.adhanSound,
  { voice: 'default', fajrSeparate: true },
  (raw) => {
    const r = (raw ?? {}) as Partial<AdhanSound>;
    const voice =
      r.voice === 'default' || r.voice === 'silent'
        ? r.voice
        : VOICES.includes(r.voice as VoiceId) && isVoiceAvailable(r.voice as VoiceId)
          ? (r.voice as VoiceId)
          : 'default';
    return { voice, fajrSeparate: r.fajrSeparate !== false };
  },
);

/** Default-sound channel shared by Adhan and other reminders. */
export const PRAYER_CHANNEL_ID = 'prayer-times';

/**
 * Sound and Android channel for one prayer's Adhan. Android fixes a channel's sound
 * when it is created, so each sound gets its own channel.
 */
export function adhanDelivery(
  prayer: PrayerName,
  { voice, fajrSeparate }: AdhanSound,
): { sound: boolean | string; channelId: string } {
  if (voice === 'silent') return { sound: false, channelId: 'adhan-silent' };
  const asset = voice === 'default' ? undefined : ADHAN_ASSETS[voice];
  if (!asset) return { sound: 'default', channelId: PRAYER_CHANNEL_ID };
  const file = prayer === 'fajr' && fajrSeparate && asset.fajrSound ? asset.fajrSound : asset.sound;
  return { sound: file, channelId: `adhan-${file.replace(/\.\w+$/, '')}` };
}

/** Creates the Android channel a delivery needs (no-op elsewhere). */
export async function ensureAdhanChannel(
  delivery: { sound: boolean | string; channelId: string },
  name: string,
) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(delivery.channelId, {
    name,
    importance: Notifications.AndroidImportance.HIGH,
    sound:
      typeof delivery.sound === 'string' && delivery.sound !== 'default'
        ? delivery.sound
        : delivery.sound === false
          ? null
          : undefined,
    enableVibrate: true,
  });
}

export type NotificationPrefs = {
  /** Extra reminder this many minutes before each Adhan; 0 is off. */
  reminderBefore: number;
  jumuah: boolean;
};
export const REMINDER_OPTIONS = [0, 5, 10, 15, 30] as const;

export const notificationPrefs = createPersistedStore<NotificationPrefs>(
  StorageKeys.notificationPrefs,
  { reminderBefore: 0, jumuah: true },
  (raw) => {
    const r = (raw ?? {}) as Partial<NotificationPrefs>;
    return {
      reminderBefore: (REMINDER_OPTIONS as readonly number[]).includes(Number(r.reminderBefore))
        ? Number(r.reminderBefore)
        : 0,
      jumuah: r.jumuah !== false,
    };
  },
);

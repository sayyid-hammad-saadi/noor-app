import AsyncStorage from '@react-native-async-storage/async-storage';

/** Keys of persisted user preferences. */
export const StorageKeys = {
  language: 'noor.language',
  appearance: 'noor.appearance',
  onboardingDone: 'noor.onboardingDone',
  location: 'noor.location',
  amol: 'noor.amol',
  dailyBookmarks: 'noor.dailyBookmarks',
  adhan: 'noor.adhan',
  qiblaVibrate: 'noor.qiblaVibrate',
} as const;

type BaseKey = (typeof StorageKeys)[keyof typeof StorageKeys];
/** A base key, or a base key scoped with a suffix (e.g. `noor.amol.2026-10-16`). */
type StorageKey = BaseKey | `${BaseKey}.${string}`;

export async function getItem(key: StorageKey): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key: StorageKey, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Preferences are best-effort; the in-memory value still applies this session.
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';

/** Keys of persisted user preferences. */
export const StorageKeys = {
  language: 'noor.language',
  appearance: 'noor.appearance',
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

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

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
  quranPrefs: 'noor.quran.prefs',
  quranLastRead: 'noor.quran.lastRead',
  quranBookmarks: 'noor.quran.bookmarks',
  quranNotes: 'noor.quran.notes',
  quranPlayer: 'noor.quran.player',
  ramadanLog: 'noor.ramadan.log',
  ramadanAmol: 'noor.ramadan.amol',
  ramadanReminders: 'noor.ramadan.reminders',
  zakatDraft: 'noor.zakat.draft',
  zakatRecords: 'noor.zakat.records',
  myAmol: 'noor.calendar.myAmol',
  calendarReminders: 'noor.calendar.reminders',
  hadithBookmarks: 'noor.hadith.bookmarks',
  duaBookmarks: 'noor.dua.bookmarks',
  readingPrefs: 'noor.reading.prefs',
  tasbih: 'noor.tasbih',
  nameFavorites: 'noor.names.favorites',
  masailMadhhab: 'noor.masail.madhhab',
  searchRecent: 'noor.search.recent',
  prayerLog: 'noor.prayer.log',
  quranPagesRead: 'noor.quran.pagesRead',
  notificationsRead: 'noor.notifications.read',
  account: 'noor.account',
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

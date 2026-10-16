import type { Href } from 'expo-router';

/** Named routes for the first-run flow and hand-offs between features. */
export const routes = {
  language: '/language',
  onboarding: '/onboarding',
  permissionLocation: '/permissions/location',
  permissionNotifications: '/permissions/notifications',
  afterOnboarding: '/permissions/location',
  home: '/home',
  prayerTimes: '/prayer',
  timetable: '/prayer/timetable',
  qibla: '/qibla',
  explore: '/explore',
  quran: '/quran',
  ramadan: '/ramadan',
  zakat: '/zakat',
  calendar: '/calendar',
  hadith: '/hadith',
  dua: '/dua',
} as const satisfies Record<string, Href>;

import { CloudSun, type LucideIcon, Moon, Sun, Sunrise, Sunset } from 'lucide-react-native';

import type { PrayerName } from './prayerTimes';

export const PRAYER_ICONS: Record<PrayerName, LucideIcon> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: Moon,
};

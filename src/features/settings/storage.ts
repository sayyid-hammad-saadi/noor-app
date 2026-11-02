import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { type Reciter, RECITERS } from '@/features/quran/data/reciters';

function dirBytes(dir: Directory): number {
  if (!dir.exists) return 0;
  return dir.list().reduce((n, e) => n + (e instanceof Directory ? dirBytes(e) : (e.size ?? 0)), 0);
}

const audioDir = (r: Reciter) => new Directory(Paths.document, 'quran', 'audio', r.id);
/** Downloaded text (Quran surahs, hadith chapters) that can be fetched again. */
const cacheDirs = () => [
  new Directory(Paths.document, 'quran', 'text-v1'),
  new Directory(Paths.document, 'hadith'),
];

export type ReciterUsage = { reciter: Reciter; bytes: number };

/** Downloaded recitation audio per reciter, largest first (empty on web). */
export function audioUsage(): ReciterUsage[] {
  if (Platform.OS === 'web') return [];
  try {
    return RECITERS.map((reciter) => ({ reciter, bytes: dirBytes(audioDir(reciter)) }))
      .filter((u) => u.bytes > 0)
      .sort((a, b) => b.bytes - a.bytes);
  } catch {
    return [];
  }
}

export function deleteReciterAudio(reciter: Reciter) {
  const dir = audioDir(reciter);
  if (dir.exists) dir.delete();
}

export function cacheBytes(): number {
  if (Platform.OS === 'web') return 0;
  try {
    return cacheDirs().reduce((n, d) => n + dirBytes(d), 0);
  } catch {
    return 0;
  }
}

export function clearCache() {
  for (const d of cacheDirs()) if (d.exists) d.delete();
}

/** "86 MB" / "1.2 GB" with the given digit localiser and unit labels. */
export function formatBytes(
  bytes: number,
  localizeDigits: (s: string | number) => string,
  units: { mb: (n: string) => string; gb: (n: string) => string },
): string {
  const mb = bytes / 1024 / 1024;
  return mb >= 1024
    ? units.gb(localizeDigits((mb / 1024).toFixed(1)))
    : units.mb(localizeDigits(mb < 10 ? mb.toFixed(1) : Math.round(mb)));
}

/**
 * Writes everything Noor keeps on the device (bookmarks, amol, Zakat reports,
 * settings) to a JSON file and opens the share sheet. False when sharing isn't available.
 */
export async function exportData(): Promise<boolean> {
  if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) return false;
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('noor.'));
  const pairs = await AsyncStorage.multiGet(keys);
  const data: Record<string, unknown> = {};
  for (const [k, v] of pairs) {
    try {
      data[k] = v === null ? null : JSON.parse(v);
    } catch {
      data[k] = v;
    }
  }
  const file = new File(Paths.cache, `noor-export-${new Date().toISOString().slice(0, 10)}.json`);
  file.write(JSON.stringify({ app: 'Noor', exportedAt: new Date().toISOString(), data }, null, 2));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Noor' });
  return true;
}

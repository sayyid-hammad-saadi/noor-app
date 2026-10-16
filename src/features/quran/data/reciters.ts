import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export type Reciter = {
  /** Islamic Network CDN edition id. */
  id: string;
  name: { en: string; bn: string; ar: string };
  initials: string;
  bitrate: number;
};

export const RECITERS: readonly Reciter[] = [
  {
    id: 'ar.alafasy',
    name: { en: 'Mishary Rashid Alafasy', bn: 'মিশারি রাশিদ আলাফাসি', ar: 'مشاري راشد العفاسي' },
    initials: 'MA',
    bitrate: 128,
  },
  {
    id: 'ar.abdulbasitmurattal',
    name: {
      en: 'Abdul Basit (Murattal)',
      bn: 'আব্দুল বাসিত (মুরাত্তাল)',
      ar: 'عبد الباسط عبد الصمد (مرتل)',
    },
    initials: 'AB',
    bitrate: 192,
  },
  {
    id: 'ar.husary',
    name: { en: 'Mahmoud Khalil Al-Husary', bn: 'মাহমুদ খলিল আল-হুসারি', ar: 'محمود خليل الحصري' },
    initials: 'MH',
    bitrate: 128,
  },
  {
    id: 'ar.minshawi',
    name: {
      en: 'Mohamed Siddiq Al-Minshawi',
      bn: 'মুহাম্মদ সিদ্দিক আল-মিনশাবি',
      ar: 'محمد صديق المنشاوي',
    },
    initials: 'MM',
    bitrate: 128,
  },
];

export function getReciter(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0]!;
}

export function remoteAudioUrl(reciter: Reciter, ayahId: number): string {
  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/${reciter.id}/${ayahId}.mp3`;
}

function audioDir(reciter: Reciter): Directory | null {
  if (Platform.OS === 'web') return null;
  return new Directory(Paths.document, 'quran', 'audio', reciter.id);
}

function localFile(reciter: Reciter, ayahId: number): File | null {
  const dir = audioDir(reciter);
  return dir ? new File(dir, `${ayahId}.mp3`) : null;
}

/** Local file URI if this ayah was downloaded, otherwise the CDN URL. */
export function audioSource(reciter: Reciter, ayahId: number): string {
  const file = localFile(reciter, ayahId);
  return file?.exists ? file.uri : remoteAudioUrl(reciter, ayahId);
}

export function isSurahDownloaded(reciter: Reciter, firstAyahId: number, count: number): boolean {
  for (let i = 0; i < count; i++) if (!localFile(reciter, firstAyahId + i)?.exists) return false;
  return true;
}

/** Downloads every ayah of a surah; resolves when done, rejects on the first failure. */
export async function downloadSurahAudio(
  reciter: Reciter,
  firstAyahId: number,
  count: number,
  onProgress: (fraction: number) => void,
  signal: { cancelled: boolean },
): Promise<void> {
  const dir = audioDir(reciter);
  if (!dir) throw new Error('Downloads are not supported here');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  for (let i = 0; i < count; i++) {
    if (signal.cancelled) return;
    const id = firstAyahId + i;
    const file = new File(dir, `${id}.mp3`);
    if (!file.exists) await File.downloadFileAsync(remoteAudioUrl(reciter, id), file);
    onProgress((i + 1) / count);
  }
}

/** Rough size estimate for the UI: ~10 s per ayah at the reciter's bitrate. */
export function estimateSurahMb(reciter: Reciter, count: number): number {
  return Math.max(0.1, Math.round(((count * 10 * reciter.bitrate) / 8 / 1024) * 10) / 10);
}

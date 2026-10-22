import { createPersistedStore } from '@/lib/persistedStore';
import { onReconnect } from '@/lib/network';
import { StorageKeys } from '@/lib/storage';

import { downloadSurahAudio, getReciter, isSurahDownloaded } from '../data/reciters';
import { getSurah } from '../data/surahs';

export type PendingAudio = { reciter: string; surah: number };

/** Surah recitations to download once the device is back online ("Get it when online"). */
export const pendingAudio = createPersistedStore<PendingAudio[]>(
  StorageKeys.pendingAudio,
  [],
  (raw) => (Array.isArray(raw) ? (raw as PendingAudio[]) : []),
);

export function queueDownload(item: PendingAudio) {
  pendingAudio.set((list) =>
    list.some((p) => p.reciter === item.reciter && p.surah === item.surah) ? list : [...list, item],
  );
}

let running = false;

/** Downloads everything queued, one surah at a time; failures stay queued. */
export async function runPendingDownloads() {
  if (running) return;
  running = true;
  try {
    for (const item of [...pendingAudio.get()]) {
      const reciter = getReciter(item.reciter);
      const surah = getSurah(item.surah);
      if (!isSurahDownloaded(reciter, surah.firstAyahId, surah.ayahCount)) {
        await downloadSurahAudio(reciter, surah.firstAyahId, surah.ayahCount, () => undefined, {
          cancelled: false,
        });
      }
      pendingAudio.set((list) =>
        list.filter((p) => !(p.reciter === item.reciter && p.surah === item.surah)),
      );
    }
  } catch {
    // Offline again or a failed file: try on the next reconnect.
  } finally {
    running = false;
  }
}

/** Starts queued downloads whenever the connection returns. */
export function watchPendingDownloads(): () => void {
  void runPendingDownloads();
  return onReconnect(() => void runPendingDownloads());
}

import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

const strings = (raw: unknown) =>
  Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];

/** Saved hadith as "bukhari:1" (book and dataset number). */
export const hadithBookmarks = createPersistedStore<string[]>(
  StorageKeys.hadithBookmarks,
  [],
  strings,
);
/** Saved duas by id. */
export const duaBookmarks = createPersistedStore<string[]>(StorageKeys.duaBookmarks, [], strings);

export function toggleIn(store: typeof hadithBookmarks, key: string): boolean {
  const added = !store.get().includes(key);
  store.set((list) => (added ? [...list, key] : list.filter((k) => k !== key)));
  return added;
}

export type TextSize = 'sm' | 'md' | 'lg';
export type Translation = 'bn' | 'en' | 'both';

/** Text size and translation choice for the Hadith and Dua readers. */
export const readingPrefs = createPersistedStore<{ size: TextSize; translation: Translation }>(
  StorageKeys.readingPrefs,
  { size: 'md', translation: 'both' },
  (raw) => {
    const r = (raw ?? {}) as { size?: string; translation?: string };
    return {
      size: r.size === 'sm' || r.size === 'lg' ? r.size : 'md',
      translation: r.translation === 'bn' || r.translation === 'en' ? r.translation : 'both',
    };
  },
);

export const SIZES: readonly TextSize[] = ['sm', 'md', 'lg'];
/** Scale applied to body and Arabic text. */
export const SIZE_SCALE: Record<TextSize, number> = { sm: 0.9, md: 1, lg: 1.18 };

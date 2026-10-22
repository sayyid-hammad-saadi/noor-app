import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';
import type { ReadingTheme } from '@/theme';

export type ReadingPrefs = {
  arabicSize: number;
  transliteration: boolean;
  bangla: boolean;
  english: boolean;
  /** null follows the app appearance. */
  theme: ReadingTheme | null;
};

export const readingPrefs = createPersistedStore<ReadingPrefs>(
  StorageKeys.quranPrefs,
  { arabicSize: 30, transliteration: true, bangla: true, english: true, theme: null },
  (raw) => ({
    arabicSize: 30,
    transliteration: true,
    bangla: true,
    english: true,
    theme: null,
    ...(raw as object),
  }),
);

export type LastRead = { surah: number; ayah: number; juz: number; page: number; at: number };
export const lastRead = createPersistedStore<LastRead | null>(StorageKeys.quranLastRead, null);

export type BookmarkFolder = 'daily' | 'memorize' | 'tafsir';
export const BOOKMARK_FOLDERS: readonly BookmarkFolder[] = ['daily', 'memorize', 'tafsir'];

export type Bookmark = { surah: number; ayah: number; at: number; folder?: BookmarkFolder };
export const bookmarks = createPersistedStore<Bookmark[]>(StorageKeys.quranBookmarks, [], (raw) =>
  Array.isArray(raw) ? (raw as Bookmark[]) : [],
);

export const bookmarkKey = (b: Pick<Bookmark, 'surah' | 'ayah'>) => `${b.surah}:${b.ayah}`;

/** Files the given bookmarks ("surah:ayah" keys) under a folder, or none. */
export function setBookmarkFolder(keys: readonly string[], folder: BookmarkFolder | undefined) {
  bookmarks.set((list) => list.map((b) => (keys.includes(bookmarkKey(b)) ? { ...b, folder } : b)));
}

export function isBookmarked(list: Bookmark[], surah: number, ayah: number): boolean {
  return list.some((b) => b.surah === surah && b.ayah === ayah);
}

/** Toggles a bookmark; returns true when it was added. */
export function toggleBookmark(surah: number, ayah: number): boolean {
  const added = !isBookmarked(bookmarks.get(), surah, ayah);
  bookmarks.set((list) =>
    added
      ? [{ surah, ayah, at: Date.now() }, ...list]
      : list.filter((b) => !(b.surah === surah && b.ayah === ayah)),
  );
  return added;
}

/** Personal notes keyed by "surah:ayah". */
export const notes = createPersistedStore<Record<string, string>>(
  StorageKeys.quranNotes,
  {},
  (raw) => (raw && typeof raw === 'object' ? (raw as Record<string, string>) : {}),
);

export const noteKey = (surah: number, ayah: number) => `${surah}:${ayah}`;

/** Distinct mushaf pages (1–604) seen in the reader, per year. */
export const pagesRead = createPersistedStore<Record<string, number[]>>(
  StorageKeys.quranPagesRead,
  {},
  (raw) => (raw && typeof raw === 'object' ? (raw as Record<string, number[]>) : {}),
);

export function markPageRead(page: number, now = new Date()) {
  const year = String(now.getFullYear());
  if (pagesRead.get()[year]?.includes(page)) return;
  pagesRead.set((all) => ({ ...all, [year]: [...(all[year] ?? []), page] }));
}

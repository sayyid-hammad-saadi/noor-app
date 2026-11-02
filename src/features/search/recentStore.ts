import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

const MAX = 8;

/** Recent search queries, newest first. */
export const recentSearches = createPersistedStore<string[]>(StorageKeys.searchRecent, [], (raw) =>
  Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string').slice(0, MAX) : [],
);

export function addRecent(query: string) {
  const q = query.trim();
  if (!q) return;
  recentSearches.set((list) =>
    [q, ...list.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX),
  );
}

export function removeRecent(query: string) {
  recentSearches.set((list) => list.filter((x) => x !== query));
}

import { createPersistedStore } from '@/lib/persistedStore';
import { StorageKeys } from '@/lib/storage';

export const nameFavorites = createPersistedStore<string[]>(StorageKeys.nameFavorites, [], (raw) =>
  Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [],
);

export function toggleFavorite(id: string): boolean {
  const added = !nameFavorites.get().includes(id);
  nameFavorites.set((list) => (added ? [...list, id] : list.filter((x) => x !== id)));
  return added;
}

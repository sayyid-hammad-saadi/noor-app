import { getItem, setItem, StorageKeys } from '@/lib/storage';

/** Where prayer times are calculated for. */
export type SavedLocation =
  | {
      source: 'city';
      cityId: string;
    }
  | {
      source: 'device';
      latitude: number;
      longitude: number;
      /** Reverse-geocoded labels; may be missing offline. */
      city?: string;
      country?: string;
      countryCode?: string;
    };

function isSavedLocation(value: unknown): value is SavedLocation {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.source === 'city') return typeof v.cityId === 'string';
  return v.source === 'device' && typeof v.latitude === 'number' && typeof v.longitude === 'number';
}

export async function loadLocation(): Promise<SavedLocation | null> {
  const raw = await getItem(StorageKeys.location);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSavedLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveLocation(location: SavedLocation): Promise<void> {
  await setItem(StorageKeys.location, JSON.stringify(location));
}

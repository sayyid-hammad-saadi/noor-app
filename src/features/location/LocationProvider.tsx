import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { type Language, useLanguage } from '@/i18n';

import { CITIES, type City, DEFAULT_CITY } from './cities';
import { loadLocation, type SavedLocation, saveLocation } from './locationStore';

/** A location ready for prayer-time calculation and display. */
export type Place = {
  latitude: number;
  longitude: number;
  /** "Sylhet, Bangladesh" in the UI language, when known. */
  label: string | null;
  /** Short name for compact headers ("Sylhet"). */
  shortLabel: string | null;
  countryCode: string | null;
  /** IANA zone for manual cities; device locations use the phone's zone. */
  timeZone: string | null;
  /** True when no location was set and the default city is used. */
  isDefault: boolean;
};

type LocationContextValue = {
  place: Place;
  saved: SavedLocation | null;
  setLocation: (location: SavedLocation) => Promise<void>;
  ready: boolean;
};

const LocationContext = createContext<LocationContextValue | null>(null);

function cityPlace(city: City, language: Language, isDefault: boolean): Place {
  return {
    latitude: city.latitude,
    longitude: city.longitude,
    label: `${city.name[language]}, ${city.country[language]}`,
    shortLabel: city.name[language],
    countryCode: city.countryCode,
    timeZone: city.timeZone,
    isDefault,
  };
}

export function resolvePlace(saved: SavedLocation | null, language: Language): Place {
  if (!saved) return cityPlace(DEFAULT_CITY, language, true);
  if (saved.source === 'city') {
    const city = CITIES.find((c) => c.id === saved.cityId) ?? DEFAULT_CITY;
    return cityPlace(city, language, false);
  }
  const parts = [saved.city, saved.country].filter(Boolean);
  return {
    latitude: saved.latitude,
    longitude: saved.longitude,
    label: parts.length ? parts.join(', ') : null,
    shortLabel: saved.city ?? null,
    countryCode: saved.countryCode ?? null,
    timeZone: null,
    isDefault: false,
  };
}

export function LocationProvider({ children }: PropsWithChildren) {
  const { language } = useLanguage();
  const [saved, setSaved] = useState<SavedLocation | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLocation().then((loc) => {
      if (cancelled) return;
      setSaved(loc);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocation = useCallback(async (location: SavedLocation) => {
    setSaved(location);
    await saveLocation(location);
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({ place: resolvePlace(saved, language), saved, setLocation, ready }),
    [saved, language, setLocation, ready],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>');
  return ctx;
}

import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { useLocation } from '@/features/location/LocationProvider';

import { prayerState } from './prayerTimes';

/** Current time, refreshed every 30 s and whenever the app returns to the foreground. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs]);
  return now;
}

/** Today's prayer times for the saved location, plus the current and next prayer. */
export function usePrayerTimes() {
  const { place } = useLocation();
  const now = useNow();
  // Recompute when the minute changes or the place moves.
  const minuteKey = Math.floor(now.getTime() / 60000);
  const state = useMemo(
    () =>
      prayerState(place.latitude, place.longitude, new Date(minuteKey * 60000), place.countryCode),
    [place.latitude, place.longitude, place.countryCode, minuteKey],
  );
  return { ...state, now, place };
}

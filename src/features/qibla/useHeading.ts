import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type HeadingState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'needsPermission' }
  | {
      status: 'ok';
      /** Degrees clockwise from north, smoothed. */
      heading: number;
      /** 0 none · 1 low · 2 medium · 3 high. */
      accuracy: number;
      /** False when only magnetic north is available. */
      trueNorth: boolean;
    };

/** Minimum ms between React updates; sensor events arrive much faster. */
const UPDATE_MS = 60;
/** Low-pass weight for new samples (circular average, so 359°→1° doesn't spin). */
const SMOOTHING = 0.25;

/** Live compass heading from expo-location, smoothed and throttled. */
export function useHeading() {
  const [state, setState] = useState<HeadingState>(() =>
    Platform.OS === 'web' ? { status: 'unavailable' } : { status: 'loading' },
  );
  const [attempt, setAttempt] = useState(0);
  const vector = useRef<{ x: number; y: number } | null>(null);
  const lastEmit = useRef(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) {
        if (!cancelled) setState({ status: 'needsPermission' });
        return;
      }
      try {
        sub = await Location.watchHeadingAsync((h) => {
          const trueNorth = h.trueHeading >= 0;
          const deg = trueNorth ? h.trueHeading : h.magHeading;
          const rad = (deg * Math.PI) / 180;
          const prev = vector.current;
          const next = prev
            ? {
                x: prev.x * (1 - SMOOTHING) + Math.cos(rad) * SMOOTHING,
                y: prev.y * (1 - SMOOTHING) + Math.sin(rad) * SMOOTHING,
              }
            : { x: Math.cos(rad), y: Math.sin(rad) };
          vector.current = next;
          const now = Date.now();
          if (now - lastEmit.current < UPDATE_MS || cancelled) return;
          lastEmit.current = now;
          const heading = ((Math.atan2(next.y, next.x) * 180) / Math.PI + 360) % 360;
          setState({ status: 'ok', heading, accuracy: h.accuracy, trueNorth });
        });
        if (cancelled) sub.remove();
      } catch {
        if (!cancelled) setState({ status: 'unavailable' });
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [attempt]);

  /** Ask for location (true north), then restart the sensor. */
  const requestPermission = useCallback(async () => {
    await Location.requestForegroundPermissionsAsync();
    setAttempt((a) => a + 1);
  }, []);

  return { state, requestPermission };
}

/** Signed difference target − current in (−180, 180]. */
export function angleDelta(target: number, current: number): number {
  const d = ((((target - current) % 360) + 540) % 360) - 180;
  return d === -180 ? 180 : d;
}

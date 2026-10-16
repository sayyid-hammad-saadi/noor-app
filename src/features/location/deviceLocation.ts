import * as Location from 'expo-location';

import type { SavedLocation } from './locationStore';

export type LocateResult =
  { status: 'ok'; location: SavedLocation } | { status: 'denied' } | { status: 'unavailable' };

/**
 * Asks for foreground location permission, reads a coarse position (enough for prayer
 * times and Qibla) and reverse-geocodes a label. The position never leaves the device
 * except through the OS geocoder.
 */
export async function requestDeviceLocation(): Promise<LocateResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return { status: 'denied' };

  try {
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 30 * 60 * 1000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    const { latitude, longitude } = position.coords;

    let city: string | undefined;
    let country: string | undefined;
    let countryCode: string | undefined;
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      city = address?.city ?? address?.subregion ?? address?.region ?? undefined;
      country = address?.country ?? undefined;
      countryCode = address?.isoCountryCode ?? undefined;
    } catch {
      // Offline or no geocoder: times still work without a label.
    }

    return {
      status: 'ok',
      location: { source: 'device', latitude, longitude, city, country, countryCode },
    };
  } catch {
    return { status: 'unavailable' };
  }
}

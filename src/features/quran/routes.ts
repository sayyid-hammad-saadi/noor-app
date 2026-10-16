import type { Href } from 'expo-router';

/** Reader for a surah, optionally scrolled to an ayah. */
export function quranRoute(surah: number, ayah?: number): Href {
  return {
    pathname: '/quran/[surah]',
    params: ayah ? { surah: String(surah), ayah: String(ayah) } : { surah: String(surah) },
  };
}

export const playerRoute: Href = '/quran-player';

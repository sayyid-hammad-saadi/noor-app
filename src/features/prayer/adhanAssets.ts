import type { VoiceId } from './adhanVoices';

/**
 * Bundled Adhan recordings (see assets/adhan/README.md). A voice becomes selectable
 * once it has a notification clip here and in app.json's expo-notifications `sounds`.
 *
 * Example:
 *   makkah: {
 *     sound: 'adhan_makkah.wav',
 *     fajrSound: 'adhan_makkah_fajr.wav',
 *     preview: require('../../../assets/adhan/adhan_makkah_full.mp3'),
 *   },
 */
export const ADHAN_ASSETS: Partial<
  Record<VoiceId, { sound: string; fajrSound?: string; preview?: number }>
> = {};

import * as Speech from 'expo-speech';

/** Reads the Arabic name aloud with the device's Arabic voice. */
export function speakArabic(text: string): void {
  Speech.stop();
  Speech.speak(text, { language: 'ar', rate: 0.8 });
}

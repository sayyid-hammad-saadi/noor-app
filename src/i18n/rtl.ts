import { I18nManager, Platform } from 'react-native';

import { type Language, languageMeta } from './languages';

/**
 * Aligns the native layout direction with the language. React Native only applies a
 * direction change after a restart, so this returns true when the app must reload.
 */
export function syncLayoutDirection(language: Language): boolean {
  // Native-only API; the web build (previews) keeps an LTR document.
  if (Platform.OS === 'web') return false;
  const rtl = languageMeta[language].rtl;
  I18nManager.allowRTL(rtl);
  I18nManager.swapLeftAndRightInRTL(true);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl);
    return true;
  }
  return false;
}

export function isLayoutRTL(): boolean {
  return I18nManager.isRTL;
}

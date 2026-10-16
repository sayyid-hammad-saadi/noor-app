import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { FALLBACK_LANGUAGE, isLanguage, type Language } from './languages';
import { defaultNS, resources } from './resources';

/** First supported language in the device's preference list, else Bangla. */
export function detectDeviceLanguage(): Language {
  for (const locale of getLocales()) {
    if (isLanguage(locale.languageCode)) return locale.languageCode;
  }
  return FALLBACK_LANGUAGE;
}

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  defaultNS,
  ns: [defaultNS],
  interpolation: { escapeValue: false },
  returnNull: false,
});

/**
 * Daily ayah and hadith. A single fixed pair for now; a rotating set arrives with
 * the Quran and Hadith content batches. Translations live in i18n (home.daily.*).
 */
export const DAILY_AYAH = {
  id: 'ayah:2:286',
  arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
  number: 286,
  transliteration: 'Lā yukallifullāhu nafsan illā wus‘ahā',
} as const;

export const DAILY_HADITH = {
  id: 'hadith:bukhari:1',
  arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
  transliteration: 'Innamal-a‘mālu bin-niyyāt',
  grade: 'sahih',
} as const;

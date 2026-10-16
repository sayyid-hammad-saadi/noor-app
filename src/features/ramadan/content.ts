import type { HadithGrade } from '@/components/ui';

import type { AshraKey } from './ramadanCalendar';

/**
 * Ramadan texts. Arabic and transliteration live here; titles and translations are
 * i18n keys under ramadan.content.<id>. Grades follow al-Albani where the collection
 * itself doesn't grade the hadith. Quran references carry no grade.
 */
export type Source = { ref: string; grade?: HadithGrade };

export type Dua = {
  id: string;
  arabic: string;
  transliteration: string;
  source: Source;
};

export type AmolItem = {
  id: string;
  source: Source;
  /** Tap-to-count target (Istighfar 100 times). */
  count?: number;
};

export const IFTAR_DUA: Dua = {
  id: 'iftar',
  arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
  transliteration: 'Dhahabaẓ-ẓama’u wabtallatil-‘urūqu wa thabatal-ajru in shā’ Allāh',
  source: { ref: 'abuDawud:2357', grade: 'hasan' },
};

/** The hadith dividing Ramadan into mercy, forgiveness and release. */
export const ASHRA_HADITH: Source = { ref: 'ibnKhuzaymah:1887', grade: 'daif' };

export const QADR_SOURCE: Source = { ref: 'bukhari:2017', grade: 'sahih' };

export const ASHRA_AR: Record<AshraKey, string> = {
  rahmat: 'رحمة',
  maghfirat: 'مغفرة',
  nijat: 'نجاة',
};

export const ASHRA_AMOL: Record<AshraKey, readonly AmolItem[]> = {
  rahmat: [
    { id: 'taraweeh', source: { ref: 'bukhari:37', grade: 'sahih' } },
    { id: 'sehri', source: { ref: 'bukhari:1923', grade: 'sahih' } },
    { id: 'hastenIftar', source: { ref: 'bukhari:1957', grade: 'sahih' } },
    { id: 'quranDaily', source: { ref: 'bukhari:4998', grade: 'sahih' } },
  ],
  maghfirat: [
    { id: 'istighfar', source: { ref: 'muslim:2702', grade: 'sahih' }, count: 100 },
    { id: 'sayyidulIstighfar', source: { ref: 'bukhari:6306', grade: 'sahih' } },
    { id: 'tahajjud', source: { ref: 'muslim:1163', grade: 'sahih' } },
    { id: 'feedIftar', source: { ref: 'tirmidhi:807', grade: 'sahih' } },
  ],
  nijat: [
    { id: 'seekQadr', source: { ref: 'bukhari:2017', grade: 'sahih' } },
    { id: 'striveNights', source: { ref: 'bukhari:2024', grade: 'sahih' } },
    { id: 'itikaf', source: { ref: 'bukhari:2026', grade: 'sahih' } },
    { id: 'fitrah', source: { ref: 'bukhari:1503', grade: 'sahih' } },
  ],
};

export const ASHRA_DUAS: Record<AshraKey, readonly Dua[]> = {
  rahmat: [
    {
      id: 'rahmat1',
      arabic: 'رَّبِّ ٱغْفِرْ وَٱرْحَمْ وَأَنتَ خَيْرُ ٱلرَّٰحِمِينَ',
      transliteration: 'Rabbighfir warḥam wa anta khayrur-rāḥimīn',
      source: { ref: 'quran:23:118' },
    },
    {
      id: 'rahmat2',
      arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ',
      transliteration: 'Yā Ḥayyu yā Qayyūmu bi-raḥmatika astaghīth',
      source: { ref: 'tirmidhi:3524', grade: 'hasan' },
    },
    {
      id: 'rahmat3',
      arabic:
        'رَبِّ ٱغْفِرْ لِى وَلِأَخِى وَأَدْخِلْنَا فِى رَحْمَتِكَ ۖ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ',
      transliteration: 'Rabbighfir lī wa li-akhī wa adkhilnā fī raḥmatika wa anta arḥamur-rāḥimīn',
      source: { ref: 'quran:7:151' },
    },
  ],
  maghfirat: [
    {
      id: 'maghfirat1',
      arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      transliteration: 'Allāhumma innaka ‘afuwwun tuḥibbul-‘afwa fa‘fu ‘annī',
      source: { ref: 'tirmidhi:3513', grade: 'sahih' },
    },
    {
      id: 'maghfirat2',
      arabic:
        'رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَٰسِرِينَ',
      transliteration:
        'Rabbanā ẓalamnā anfusanā wa il-lam taghfir lanā wa tarḥamnā lanakūnanna minal-khāsirīn',
      source: { ref: 'quran:7:23' },
    },
    {
      id: 'maghfirat3',
      arabic:
        'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
      transliteration: 'Astaghfirullāhal-ladhī lā ilāha illā huwal-Ḥayyul-Qayyūmu wa atūbu ilayh',
      source: { ref: 'tirmidhi:3577', grade: 'sahih' },
    },
  ],
  nijat: [
    {
      id: 'nijat1',
      arabic:
        'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْءَاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ',
      transliteration:
        'Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ‘adhāban-nār',
      source: { ref: 'quran:2:201' },
    },
    {
      id: 'nijat2',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
      transliteration: 'Allāhumma innī as’alukal-jannata wa a‘ūdhu bika minan-nār',
      source: { ref: 'abuDawud:792', grade: 'sahih' },
    },
    {
      id: 'nijat3',
      arabic: 'رَبَّنَآ إِنَّنَآ ءَامَنَّا فَٱغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ ٱلنَّارِ',
      transliteration: 'Rabbanā innanā āmannā faghfir lanā dhunūbanā wa qinā ‘adhāban-nār',
      source: { ref: 'quran:3:16' },
    },
  ],
};

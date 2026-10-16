import type { Source } from '@/lib/sources';

export type DuaCategory = 'daily' | 'morning' | 'salah' | 'travel' | 'ramadan';
export const DUA_CATEGORIES: readonly DuaCategory[] = [
  'daily',
  'morning',
  'salah',
  'travel',
  'ramadan',
];

/**
 * Duas from Hisnul Muslim and the Quran. Arabic and transliteration live here;
 * titles, translations and virtues are i18n keys under dua.items.<id>.
 */
export type Dua = {
  id: string;
  category: DuaCategory;
  arabic: string;
  transliteration: string;
  sources: Source[];
  /** Times to repeat, when the sunnah specifies it. */
  repeat?: number;
  /** Has a virtue line (dua.items.<id>.virtue). */
  virtue?: boolean;
};

export const DUAS: readonly Dua[] = [
  // Daily life
  {
    id: 'leaveHome',
    category: 'daily',
    arabic:
      'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Bismillāh, tawakkaltu ‘alallāh, wa lā ḥawla wa lā quwwata illā billāh',
    sources: [{ ref: 'abuDawud:5095', grade: 'sahih' }, { ref: 'tirmidhi:3426' }],
    virtue: true,
  },
  {
    id: 'beforeEating',
    category: 'daily',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillāh',
    sources: [{ ref: 'bukhari:5376', grade: 'sahih' }],
  },
  {
    id: 'forgotBismillah',
    category: 'daily',
    arabic: 'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ',
    transliteration: 'Bismillāhi awwalahū wa ākhirah',
    sources: [{ ref: 'abuDawud:3767', grade: 'sahih' }, { ref: 'tirmidhi:1858' }],
  },
  {
    id: 'afterEating',
    category: 'daily',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration:
      'Al-ḥamdu lillāhil-ladhī aṭ‘amanī hādhā wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwah',
    sources: [{ ref: 'tirmidhi:3458', grade: 'hasan' }],
    virtue: true,
  },
  {
    id: 'enterMasjid',
    category: 'daily',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allāhummaftaḥ lī abwāba raḥmatik',
    sources: [{ ref: 'muslim:713', grade: 'sahih' }],
  },
  {
    id: 'leaveMasjid',
    category: 'daily',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allāhumma innī as’aluka min faḍlik',
    sources: [{ ref: 'muslim:713', grade: 'sahih' }],
  },
  {
    id: 'enterToilet',
    category: 'daily',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    transliteration: 'Allāhumma innī a‘ūdhu bika minal-khubuthi wal-khabā’ith',
    sources: [{ ref: 'bukhari:142', grade: 'sahih' }],
  },
  {
    id: 'beforeSleeping',
    category: 'daily',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allāhumma amūtu wa aḥyā',
    sources: [{ ref: 'bukhari:6324', grade: 'sahih' }],
  },
  {
    id: 'waking',
    category: 'daily',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Al-ḥamdu lillāhil-ladhī aḥyānā ba‘da mā amātanā wa ilayhin-nushūr',
    sources: [{ ref: 'bukhari:6324', grade: 'sahih' }],
  },
  {
    id: 'parents',
    category: 'daily',
    arabic: 'رَّبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًا',
    transliteration: 'Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā',
    sources: [{ ref: 'quran:17:24' }],
  },
  // Morning & evening
  {
    id: 'sayyidulIstighfar',
    category: 'morning',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration:
      'Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana ‘abduk, wa ana ‘alā ‘ahdika wa wa‘dika mastaṭa‘t, a‘ūdhu bika min sharri mā ṣana‘t, abū’u laka bi-ni‘matika ‘alayya, wa abū’u laka bi-dhanbī faghfir lī, fa-innahū lā yaghfirudh-dhunūba illā ant',
    sources: [{ ref: 'bukhari:6306', grade: 'sahih' }],
    virtue: true,
  },
  {
    id: 'noHarm',
    category: 'morning',
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration:
      'Bismillāhil-ladhī lā yaḍurru ma‘asmihī shay’un fil-arḍi wa lā fis-samā’i wa huwas-samī‘ul-‘alīm',
    sources: [{ ref: 'abuDawud:5088', grade: 'sahih' }, { ref: 'tirmidhi:3388' }],
    repeat: 3,
    virtue: true,
  },
  {
    id: 'subhanallah',
    category: 'morning',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subḥānallāhi wa biḥamdih',
    sources: [{ ref: 'muslim:2692', grade: 'sahih' }],
    repeat: 100,
    virtue: true,
  },
  {
    id: 'tahlil',
    category: 'morning',
    arabic:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      'Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ‘alā kulli shay’in qadīr',
    sources: [{ ref: 'bukhari:3293', grade: 'sahih' }],
    repeat: 100,
    virtue: true,
  },
  {
    id: 'afiyah',
    category: 'morning',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
    transliteration: 'Allāhumma innī as’alukal-‘āfiyata fid-dunyā wal-ākhirah',
    sources: [{ ref: 'abuDawud:5074', grade: 'sahih' }, { ref: 'ibnMajah:3871' }],
    virtue: true,
  },
  // Salah
  {
    id: 'afterWudu',
    category: 'salah',
    arabic:
      'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration:
      'Ashhadu an lā ilāha illallāhu waḥdahū lā sharīka lah, wa ashhadu anna Muḥammadan ‘abduhū wa rasūluh',
    sources: [{ ref: 'muslim:234', grade: 'sahih' }],
    virtue: true,
  },
  {
    id: 'afterAdhan',
    category: 'salah',
    arabic:
      'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، رَضِيتُ بِاللَّهِ رَبًّا وَبِمُحَمَّدٍ رَسُولًا وَبِالْإِسْلَامِ دِينًا',
    transliteration:
      'Ashhadu an lā ilāha illallāhu waḥdahū lā sharīka lahū wa anna Muḥammadan ‘abduhū wa rasūluh, raḍītu billāhi rabban wa bi-Muḥammadin rasūlan wa bil-islāmi dīnā',
    sources: [{ ref: 'muslim:386', grade: 'sahih' }],
    virtue: true,
  },
  {
    id: 'opening',
    category: 'salah',
    arabic:
      'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
    transliteration:
      'Subḥānaka Allāhumma wa biḥamdik, wa tabārakasmuk, wa ta‘ālā jadduk, wa lā ilāha ghayruk',
    sources: [{ ref: 'abuDawud:776', grade: 'sahih' }, { ref: 'tirmidhi:243' }],
  },
  {
    id: 'ruku',
    category: 'salah',
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    transliteration: 'Subḥāna rabbiyal-‘aẓīm',
    sources: [{ ref: 'muslim:772', grade: 'sahih' }],
    repeat: 3,
  },
  {
    id: 'sujud',
    category: 'salah',
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    transliteration: 'Subḥāna rabbiyal-a‘lā',
    sources: [{ ref: 'muslim:772', grade: 'sahih' }],
    repeat: 3,
  },
  {
    id: 'betweenSujud',
    category: 'salah',
    arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbighfir lī, rabbighfir lī',
    sources: [{ ref: 'abuDawud:874', grade: 'sahih' }, { ref: 'ibnMajah:897' }],
  },
  {
    id: 'afterSalam',
    category: 'salah',
    arabic:
      'أَسْتَغْفِرُ اللَّهَ (ثَلَاثًا)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration:
      'Astaghfirullāh (three times). Allāhumma antas-salāmu wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām',
    sources: [{ ref: 'muslim:591', grade: 'sahih' }],
  },
  {
    id: 'helpMe',
    category: 'salah',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    transliteration: 'Allāhumma a‘innī ‘alā dhikrika wa shukrika wa ḥusni ‘ibādatik',
    sources: [{ ref: 'abuDawud:1522', grade: 'sahih' }],
  },
  // Travel
  {
    id: 'travel',
    category: 'travel',
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration:
      'Subḥānal-ladhī sakhkhara lanā hādhā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā lamunqalibūn',
    sources: [{ ref: 'muslim:1342', grade: 'sahih' }, { ref: 'quran:43:13' }],
    virtue: true,
  },
  {
    id: 'stopping',
    category: 'travel',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'A‘ūdhu bikalimātillāhit-tāmmāti min sharri mā khalaq',
    sources: [{ ref: 'muslim:2708', grade: 'sahih' }],
    virtue: true,
  },
  {
    id: 'ascending',
    category: 'travel',
    arabic: 'اللَّهُ أَكْبَرُ ... سُبْحَانَ اللَّهِ',
    transliteration: 'Allāhu akbar (going up) · Subḥānallāh (going down)',
    sources: [{ ref: 'bukhari:2993', grade: 'sahih' }],
  },
  {
    id: 'farewell',
    category: 'travel',
    arabic: 'أَسْتَوْدِعُ اللَّهَ دِينَكَ وَأَمَانَتَكَ وَخَوَاتِيمَ عَمَلِكَ',
    transliteration: 'Astawdi‘ullāha dīnaka wa amānataka wa khawātīma ‘amalik',
    sources: [{ ref: 'abuDawud:2600', grade: 'sahih' }, { ref: 'tirmidhi:3443' }],
  },
  {
    id: 'returning',
    category: 'travel',
    arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
    transliteration: 'Āyibūna tā’ibūna ‘ābidūna li-rabbinā ḥāmidūn',
    sources: [{ ref: 'muslim:1342', grade: 'sahih' }],
  },
  // Ramadan
  {
    id: 'iftar',
    category: 'ramadan',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Dhahabaẓ-ẓama’u wabtallatil-‘urūqu wa thabatal-ajru in shā’ Allāh',
    sources: [{ ref: 'abuDawud:2357', grade: 'hasan' }],
  },
  {
    id: 'qadr',
    category: 'ramadan',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: 'Allāhumma innaka ‘afuwwun tuḥibbul-‘afwa fa‘fu ‘annī',
    sources: [{ ref: 'tirmidhi:3513', grade: 'sahih' }],
  },
  {
    id: 'fasting',
    category: 'ramadan',
    arabic: 'إِنِّي صَائِمٌ',
    transliteration: 'Innī ṣā’im',
    sources: [{ ref: 'bukhari:1904', grade: 'sahih' }],
  },
  {
    id: 'host',
    category: 'ramadan',
    arabic:
      'أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ',
    transliteration:
      'Afṭara ‘indakumuṣ-ṣā’imūn, wa akala ṭa‘āmakumul-abrār, wa ṣallat ‘alaykumul-malā’ikah',
    sources: [{ ref: 'abuDawud:3854', grade: 'sahih' }],
  },
  {
    id: 'newMoon',
    category: 'ramadan',
    arabic:
      'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ',
    transliteration:
      'Allāhumma ahillahū ‘alaynā bil-yumni wal-īmāni was-salāmati wal-islām, rabbī wa rabbukallāh',
    sources: [{ ref: 'tirmidhi:3451', grade: 'hasan' }],
  },
];

export function getDua(id: string): Dua | undefined {
  return DUAS.find((d) => d.id === id);
}
